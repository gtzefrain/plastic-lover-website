import { NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/dictionaries";

const { LISTMONK_URL, LISTMONK_API_USER, LISTMONK_API_TOKEN, LISTMONK_LIST_ID, LISTMONK_LIST_ID_EN, LISTMONK_LIST_ID_ES } =
  process.env;

const LIST_ID_BY_LOCALE: Record<Locale, string | undefined> = {
  en: LISTMONK_LIST_ID_EN,
  es: LISTMONK_LIST_ID_ES,
};

export async function POST(request: Request) {
  const { email, locale } = await request.json();

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const subscriberLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  const listId = LIST_ID_BY_LOCALE[subscriberLocale] ?? LISTMONK_LIST_ID;

  if (!LISTMONK_URL || !LISTMONK_API_USER || !LISTMONK_API_TOKEN || !listId) {
    // Listmonk instance isn't deployed yet — see AGENTS.md for status.
    console.log("New subscriber (Listmonk not configured):", email, subscriberLocale);
    return NextResponse.json({ ok: true });
  }

  const res = await fetch(`${LISTMONK_URL}/api/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")}`,
    },
    body: JSON.stringify({
      email,
      status: "enabled",
      lists: [Number(listId)],
      preconfirm_subscriptions: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 409) {
      // Subscriber already exists — from the visitor's perspective they're already
      // on the list, so this isn't a failure.
      return NextResponse.json({ ok: true });
    }
    console.error("Listmonk subscribe failed:", res.status, body);
    return NextResponse.json({ error: "Subscription failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
