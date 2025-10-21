import { NextResponse, NextRequest } from "next/server";

const SUPPORTED = new Set(["fa", "en"]);
const COOKIE = "lng";
const COOKIE_OPTS = { path: "/" } as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];

  if (!SUPPORTED.has(seg)) {
    const pref = req.cookies.get(COOKIE)?.value || "fa";
    const url = req.nextUrl.clone();
    url.pathname = `/${pref}${pathname}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (req.cookies.get(COOKIE)?.value !== seg) {
    res.cookies.set(COOKIE, seg, COOKIE_OPTS);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|apple-touch-icon|icon|.*\\..*).*)",
  ],
};
