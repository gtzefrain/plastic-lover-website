import { NextResponse } from "next/server";

const { LISTMONK_URL, LISTMONK_API_USER, LISTMONK_API_TOKEN, LISTMONK_LIST_ID } = process.env;

export async function POST(request: Request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!LISTMONK_URL || !LISTMONK_API_USER || !LISTMONK_API_TOKEN || !LISTMONK_LIST_ID) {
    // Listmonk instance isn't deployed yet — see AGENTS.md for status.
    console.log("New subscriber (Listmonk not configured):", email);
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
      lists: [Number(LISTMONK_LIST_ID)],
      preconfirm_subscriptions: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Listmonk subscribe failed:", res.status, body);
    return NextResponse.json({ error: "Subscription failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
