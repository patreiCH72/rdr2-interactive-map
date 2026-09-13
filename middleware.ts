import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken, sitePin } from "@/lib/gate";

export async function middleware(req: NextRequest) {
  const pin = sitePin();
  if (!pin) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === "/unlock" || pathname.startsWith("/api/unlock")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  const expected = await gateToken(pin);
  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
