import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // TODO: wire up to a real mailing list provider (Mailchimp, Klaviyo, etc).
  console.log("New subscriber:", email);

  return NextResponse.json({ ok: true });
}
