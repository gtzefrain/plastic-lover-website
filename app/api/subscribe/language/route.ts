import { NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n/dictionaries";

const { LISTMONK_URL, LISTMONK_API_USER, LISTMONK_API_TOKEN, LISTMONK_LIST_ID_EN, LISTMONK_LIST_ID_ES } =
  process.env;

const LIST_ID_BY_LOCALE: Record<Locale, string | undefined> = {
  en: LISTMONK_LIST_ID_EN,
  es: LISTMONK_LIST_ID_ES,
};

// Matches the subscriber UUID Listmonk exposes to campaign templates as
// {{ .Subscriber.UUID }} — validating the shape lets us interpolate it into the
// admin API's SQL `query` filter below without risking injection.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")}`,
  };
}

async function findSubscriberId(uuid: string): Promise<number | null> {
  const res = await fetch(
    `${LISTMONK_URL}/api/subscribers?query=${encodeURIComponent(`subscribers.uuid='${uuid}'`)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    console.error("Listmonk subscriber lookup failed:", res.status, await res.text());
    return null;
  }
  const body = await res.json();
  const id = body?.data?.results?.[0]?.id;
  return typeof id === "number" ? id : null;
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
  const { uuid, locale } = await request.json();

  if (typeof uuid !== "string" || !UUID_RE.test(uuid)) {
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
    console.log("Newsletter language change (Listmonk not configured):", uuid, locale);
    return NextResponse.json({ ok: true });
  }

  const subscriberId = await findSubscriberId(uuid);
  if (!subscriberId) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  try {
    await moveToList(subscriberId, Number(targetListId), otherListId ? Number(otherListId) : null);
  } catch (err) {
    console.error("Listmonk language update failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
