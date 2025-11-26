import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                (request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]);

  // Protected routes that require authentication
  const protectedRoutes = [
    '/profile',
    '/notifications',
    '/favorites',
    '/add-advertistment',
    '/add-special-order',
    '/add-daily-rent',
    '/add-request',
    '/subscribe',
    '/company-profile',
  ];

  // Routes that require RealEstateCompany role
  const roleProtectedRoutes = [
    '/add-project',
    '/company-profile',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isRoleProtectedRoute = roleProtectedRoutes.some(route => pathname.startsWith(route));

  // Check if route requires authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For role-protected routes, we'll handle the role check in the page component
  // since we need to decode the token which is better done client-side

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

