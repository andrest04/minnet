import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/poblador') || pathname.startsWith('/empresa') || pathname.startsWith('/admin')) {
    const response = NextResponse.next();

    response.headers.set('x-protected-route', 'true');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(poblador|empresa|admin)/:path*'],
};
