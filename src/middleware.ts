import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('tranzlo-session');
  const { pathname } = request.nextUrl;

  // Protect all Dashboard routes (including admin)
  if (pathname.startsWith('/dashboard')) {
    if (!session?.value) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Prevent logged-in users from seeing Auth pages
  if (pathname.startsWith('/login')) {
    const error = request.nextUrl.searchParams.get('error');
    if (session?.value && !error) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
