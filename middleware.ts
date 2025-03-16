import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUser } from './lib/auth';

const publicPaths = ['/login', '/signup'];

const roleAccessMap: { [key: string]: string[] } = {
  '/dashboard': ['admin'],
  '/dashboard/tasks': ['collaborateur', 'admin'],
  '/dashboard/categories': ['collaborateur', 'admin'],
  '/dashboard/clients': ['collaborateur', 'admin'],
  '/dashboard/projects': ['collaborateur', 'admin'],
  '/dashboard/orders': ['client', 'collaborateur', 'admin'],
  '/dashboard/profile': ['client', 'collaborateur', 'admin'],
  '/dashboard/settings': ['collaborateur', 'admin'],
  '/dashboard/sync': ['collaborateur', 'admin'],
  '/dashboard/users': ['admin'],
};

export async function middleware(request: NextRequest) {
  const user = await getUser(request);
  const { pathname } = request.nextUrl;
  console.log("user in mdlware", user);


  if (!user && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && typeof pathname === 'string') {
    const path = pathname as keyof typeof roleAccessMap;
    if (roleAccessMap[path] && !roleAccessMap[path].includes(user.role as string)) {
      return NextResponse.redirect(new URL('/dashboard/profile', request.url));
    }

    if (publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
