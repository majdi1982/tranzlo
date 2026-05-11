import { NextResponse, NextRequest } from 'next/server'
import { createSessionClient } from '@/lib/appwrite/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('appwrite-session')

  // 1. Protect all dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based logic would ideally check a 'role' cookie or JWT claim here
    // To avoid hitting the DB on every request, we assume the session is valid
    // and rely on server-side checks in the actual page/action for deep role verification.
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
