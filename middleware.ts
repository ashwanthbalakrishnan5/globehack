import { NextRequest, NextResponse } from "next/server";

/*
 * Form-factor guard + demo auth gate.
 *
 * /client/* requires a mobile user-agent, /practitioner/* requires desktop/tablet.
 * `?override=1` bypasses both the device and auth guards for demo recording.
 *
 * `tide-auth` cookie gates the app; login pages set it and are always reachable.
 */

const MOBILE_UA = /iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i;
const LOGIN_PATHS = new Set(["/client/login", "/practitioner/login"]);

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (searchParams.get("override") === "1") return NextResponse.next();

  const ua = req.headers.get("user-agent") || "";
  const isMobile = MOBILE_UA.test(ua);
  const authed = req.cookies.get("tide-auth")?.value === "1";
  const isLoginPath = LOGIN_PATHS.has(pathname);

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = isMobile ? "/client/login" : "/practitioner/login";
    return NextResponse.redirect(url);
  }

  if (isLoginPath) {
    return NextResponse.next();
  }

  if (!authed) {
    const url = req.nextUrl.clone();
    if (pathname.startsWith("/client")) url.pathname = "/client/login";
    else if (pathname.startsWith("/practitioner")) url.pathname = "/practitioner/login";
    else return NextResponse.next();
    return NextResponse.redirect(url);
  }

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
  matcher: ["/", "/client/:path*", "/practitioner/:path*"],
};
