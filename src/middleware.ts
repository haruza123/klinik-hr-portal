import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_TOKEN_COOKIE, API_BASE_URL } from '@/lib/api';

export async function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  if (!isAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set(
      'redirectTo',
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(url);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set(
        'redirectTo',
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      const response = NextResponse.redirect(url);
      response.cookies.delete(ADMIN_TOKEN_COOKIE);
      return response;
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
