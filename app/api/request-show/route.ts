import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { city, email } = await request.json();

  if (typeof city !== "string" || !city.trim()) {
    return NextResponse.json({ error: "Invalid city" }, { status: 400 });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // No booking/CRM backend wired up yet — see AGENTS.md for Listmonk status.
  console.log("Show request:", { city, email });

  return NextResponse.json({ ok: true });
}
