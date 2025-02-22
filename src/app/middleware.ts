import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;

      
      if (token && ['/', '/login', '/register'].includes(path)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

    
      if (path.startsWith('/(protected)')) {
        return !!token;
      }

     
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};