import createIntlMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {updateSupabaseSession} from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export function shouldUseI18nRouting(pathname: string) {
  return !(
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/')
  );
}

export default async function proxy(request: NextRequest) {
  const response = shouldUseI18nRouting(request.nextUrl.pathname)
    ? handleI18nRouting(request)
    : NextResponse.next();
  return updateSupabaseSession(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
