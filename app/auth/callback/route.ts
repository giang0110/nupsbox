import {NextResponse, type NextRequest} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url));
  }

  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('auth_callback_exchange_failed', error.name);
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url));
  }

  return NextResponse.redirect(new URL('/admin', request.url));
}
