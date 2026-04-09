import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Si no hay token y no estamos en la página de login, redirigir a login
  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token y estamos en la página de login, redirigir al dashboard
  if (token && isLoginPage) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|images|public).*)',
  ],
};
