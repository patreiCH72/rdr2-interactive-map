import { NextResponse } from "next/server";
import { GATE_COOKIE, gateToken, pinsEqual, sitePin } from "@/lib/gate";

export async function POST(req: Request) {
  const pin = sitePin();
  if (!pin) {
    return NextResponse.json({ ok: true });
  }

  let given = "";
  try {
    const body = (await req.json()) as { pin?: unknown };
    given = typeof body.pin === "string" ? body.pin.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültige Anfrage" }, { status: 400 });
  }

  if (!pinsEqual(given, pin)) {
    return NextResponse.json({ ok: false, error: "Falsche PIN" }, { status: 401 });
  }

  const token = await gateToken(pin);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
