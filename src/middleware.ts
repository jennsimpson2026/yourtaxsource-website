import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    /* Force MFA setup for staff/admin
    if (
      (token?.role === "ADMIN" || token?.role === "STAFF") &&
      !token?.mfaEnabled &&
      path !== "/portal/settings/mfa"
    ) {
      return NextResponse.redirect(new URL("/portal/settings/mfa", req.url));
    }
    */

    if (path.startsWith("/portal") && !token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
