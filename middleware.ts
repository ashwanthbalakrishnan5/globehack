import { NextRequest, NextResponse } from "next/server";

/*
 * Form-factor guard.
 *
 * /client/* requires a mobile user-agent, /practitioner/* requires desktop/tablet.
 * `?override=1` bypasses the guard for demo recording on a laptop.
 */

const MOBILE_UA = /iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i;

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (searchParams.get("override") === "1") return NextResponse.next();

  const ua = req.headers.get("user-agent") || "";
  const isMobile = MOBILE_UA.test(ua);

  if (pathname.startsWith("/client") && !isMobile) {
    const url = req.nextUrl.clone();
    url.pathname = "/wrong-device/phone";
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/practitioner") && isMobile) {
    const url = req.nextUrl.clone();
    url.pathname = "/wrong-device/desktop";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/practitioner/:path*"],
};
