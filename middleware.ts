import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Production belt-and-suspenders: hide /dev/* from participants.
 * Pages also call notFound() when NODE_ENV === "production".
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }
  const { pathname } = request.nextUrl;
  if (pathname === "/dev" || pathname.startsWith("/dev/")) {
    return new NextResponse(null, { status: 404, statusText: "Not Found" });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dev", "/dev/:path*"],
};
