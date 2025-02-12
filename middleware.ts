import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUser } from './lib/auth';

const publicPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const user = await getUser(request);
  const { pathname } = request.nextUrl;

  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};