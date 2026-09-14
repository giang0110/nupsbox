import createIntlMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {shouldUseI18nRouting} from './lib/routing/i18n-route';
import {updateSupabaseSession} from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = shouldUseI18nRouting(request.nextUrl.pathname)
    ? handleI18nRouting(request)
    : NextResponse.next();
  return updateSupabaseSession(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
