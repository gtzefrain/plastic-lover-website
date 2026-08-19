import { NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/dictionaries";

const {
  LISTMONK_URL,
  LISTMONK_API_USER,
  LISTMONK_API_TOKEN,
  LISTMONK_LIST_ID,
  LISTMONK_LIST_ID_EN,
  LISTMONK_LIST_ID_ES,
  LISTMONK_TX_TEMPLATE_ID_EN,
  LISTMONK_TX_TEMPLATE_ID_ES,
} = process.env;

const LIST_ID_BY_LOCALE: Record<Locale, string | undefined> = {
  en: LISTMONK_LIST_ID_EN,
  es: LISTMONK_LIST_ID_ES,
};

const TX_TEMPLATE_ID_BY_LOCALE: Record<Locale, string | undefined> = {
  en: LISTMONK_TX_TEMPLATE_ID_EN,
  es: LISTMONK_TX_TEMPLATE_ID_ES,
};

// Returns whether a welcome email is actually on its way, so the form doesn't tell
// someone to check an inbox nothing was sent to. `POST /api/tx` needs the `tx:send`
// permission on the Listmonk API user — when that's missing this 403s, and the signup
// itself still succeeds, so this is the only signal that anything went wrong.
async function sendWelcomeEmail(name: string, email: string, locale: Locale): Promise<boolean> {
  const templateId = TX_TEMPLATE_ID_BY_LOCALE[locale];
  if (!templateId) return false;

  const res = await fetch(`${LISTMONK_URL}/api/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")}`,
    },
    body: JSON.stringify({
      subscriber_email: email,
      template_id: Number(templateId),
      data: { name },
    }),
  });

  if (!res.ok) {
    console.error("Listmonk welcome email failed:", res.status, await res.text());
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const { name, email, locale } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const subscriberLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  const listId = LIST_ID_BY_LOCALE[subscriberLocale] ?? LISTMONK_LIST_ID;

  if (!LISTMONK_URL || !LISTMONK_API_USER || !LISTMONK_API_TOKEN || !listId) {
    // Listmonk instance isn't deployed yet — see AGENTS.md for status.
    console.log("New subscriber (Listmonk not configured):", name, email, subscriberLocale);
    return NextResponse.json({ ok: true, welcomeEmail: false });
  }

  const res = await fetch(`${LISTMONK_URL}/api/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${LISTMONK_API_USER}:${LISTMONK_API_TOKEN}`).toString("base64")}`,
    },
    body: JSON.stringify({
      email,
      name: name.trim(),
      status: "enabled",
      lists: [Number(listId)],
      preconfirm_subscriptions: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 409) {
      // Subscriber already exists — from the visitor's perspective they're already
      // on the list, so this isn't a failure. No welcome email goes out for a repeat
      // signup, so don't promise one.
      return NextResponse.json({ ok: true, welcomeEmail: false });
    }
    console.error("Listmonk subscribe failed:", res.status, body);
    return NextResponse.json({ error: "Subscription failed" }, { status: 502 });
  }

  const welcomeEmail = await sendWelcomeEmail(name.trim(), email, subscriberLocale);

  return NextResponse.json({ ok: true, welcomeEmail });
}
