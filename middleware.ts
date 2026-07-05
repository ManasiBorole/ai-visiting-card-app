import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { PROTECTED_ROUTES, ROUTES } from "@/lib/constants";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = Boolean(request.auth?.user);

  if (pathname.startsWith("/uploads/cards/")) {
    return NextResponse.json(
      { success: false, error: "Direct upload access is disabled" },
      { status: 403 }
    );
  }

  const isAuthRoute =
    pathname.startsWith(ROUTES.login) || pathname.startsWith(ROUTES.signup);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL(ROUTES.login, nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline|icons|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
