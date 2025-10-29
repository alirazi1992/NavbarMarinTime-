import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookie
  const token = request.cookies.get("auth-token")?.value
  const userRole = request.cookies.get("user-role")?.value

  // Public routes
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  if (pathname.startsWith("/app") && userRole !== "client") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
