import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n/dictionaries";

const { LISTMONK_URL, LISTMONK_API_USER, LISTMONK_API_TOKEN, LISTMONK_LIST_ID_EN, LISTMONK_LIST_ID_ES } =
  process.env;

const LIST_ID_BY_LOCALE: Record<Locale, string | undefined> = {
  en: LISTMONK_LIST_ID_EN,
  es: LISTMONK_LIST_ID_ES,
};

// Matches the subscriber UUID Listmonk exposes to campaign templates as
// {{ .Subscriber.UUID }}.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Lookup = { ok: true; id: number } | { ok: false; reason: "not-found" | "upstream" };

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")}`,
  };
}

// Listmonk's admin API addresses subscribers by numeric id only — subscriber UUIDs
// appear solely on its *public* /subscription/:campUUID/:subUUID routes. Resolving a
// UUID through the admin API would mean `GET /api/subscribers?query=<SQL>`, and that
// endpoint rejects the `query` parameter unless the API user holds
// `subscribers:sql_query` — a permission that lets this public-facing key evaluate
// arbitrary SQL against the subscribers table, which we deliberately don't grant.
//
// So the campaign link carries both values (`?u=<uuid>&id=<id>`): we fetch by id,
// which only needs `subscribers:get`, then require the record's own uuid to match
// before touching any list. The id alone is a guessable sequential integer — it's the
// unguessable UUID that actually authorizes the change.
async function fetchSubscriber(id: number, uuid: string): Promise<Lookup> {
  const res = await fetch(`${LISTMONK_URL}/api/subscribers/${id}`, { headers: authHeaders() });

  // Listmonk answers a nonexistent subscriber id with 400, not 404 — its core layer
  // raises StatusBadRequest for the empty result. Since we've already validated the id's
  // shape ourselves, any 4xx other than 403 means "no such subscriber", and it has to map
  // to the same not-found as a uuid mismatch: if a stale id were distinguishable from a
  // wrong uuid, ids could be probed one at a time, which is exactly what returning one
  // shared 404 is meant to prevent.
  if (res.status >= 400 && res.status < 500 && res.status !== 403) {
    return { ok: false, reason: "not-found" };
  }
  if (!res.ok) {
    // 403 means the API user lost `subscribers:get`; 5xx means Listmonk is unwell. Either
    // way it's our problem, not a bad link — keep it distinguishable from not-found so it
    // surfaces as a 502 rather than looking like a subscriber who doesn't exist.
    console.error("Listmonk subscriber lookup failed:", res.status, await res.text());
    return { ok: false, reason: "upstream" };
  }

  const record = (await res.json())?.data;
  if (typeof record?.id !== "number" || typeof record?.uuid !== "string") {
    console.error("Listmonk subscriber lookup returned an unexpected shape");
    return { ok: false, reason: "upstream" };
  }

  // Postgres renders uuids lowercase; compare case-insensitively so a link that got
  // upper-cased somewhere in transit still works.
  if (record.uuid.toLowerCase() !== uuid.toLowerCase()) {
    console.warn("Newsletter language link: id/uuid mismatch for subscriber", id);
    return { ok: false, reason: "not-found" };
  }

  return { ok: true, id: record.id };
}

async function moveToList(subscriberId: number, addListId: number, removeListId: number | null) {
  const add = await fetch(`${LISTMONK_URL}/api/subscribers/lists`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      ids: [subscriberId],
      action: "add",
      target_list_ids: [addListId],
      status: "confirmed",
    }),
  });
  if (!add.ok) throw new Error(`add-list failed: ${add.status} ${await add.text()}`);

  if (removeListId === null) return;

  const remove = await fetch(`${LISTMONK_URL}/api/subscribers/lists`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      ids: [subscriberId],
      action: "remove",
      target_list_ids: [removeListId],
    }),
  });
  if (!remove.ok) throw new Error(`remove-list failed: ${remove.status} ${await remove.text()}`);
}

export async function POST(request: Request) {
  const { uuid, id, locale } = await request.json();

  if (typeof uuid !== "string" || !UUID_RE.test(uuid)) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }
  const subscriberId = Number(id);
  if (!Number.isInteger(subscriberId) || subscriberId <= 0) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const otherLocale: Locale = locale === "en" ? "es" : "en";
  const targetListId = LIST_ID_BY_LOCALE[locale];
  const otherListId = LIST_ID_BY_LOCALE[otherLocale];

  if (!LISTMONK_URL || !LISTMONK_API_USER || !LISTMONK_API_TOKEN || !targetListId) {
    // Listmonk instance isn't configured in this environment — see AGENTS.md for status.
    console.log("Newsletter language change (Listmonk not configured):", subscriberId, uuid, locale);
    return NextResponse.json({ ok: true });
  }

  const lookup = await fetchSubscriber(subscriberId, uuid);
  if (!lookup.ok) {
    // A mismatched id/uuid pair and a genuinely missing subscriber deliberately return
    // the same thing, so iterating ids can't be used to probe which ones exist.
    return lookup.reason === "upstream"
      ? NextResponse.json({ error: "Lookup failed" }, { status: 502 })
      : NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  try {
    await moveToList(lookup.id, Number(targetListId), otherListId ? Number(otherListId) : null);
  } catch (err) {
    console.error("Listmonk language update failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
