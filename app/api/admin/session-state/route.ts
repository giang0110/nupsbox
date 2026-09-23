import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {data: {user}} = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {ok: false, reason: 'signed_out'},
      {status: 401, headers: {'cache-control': 'no-store, max-age=0'}}
    );
  }

  const {data: profile, error} = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile?.active || !profile.role) {
    return NextResponse.json(
      {ok: false, reason: 'forbidden'},
      {status: 403, headers: {'cache-control': 'no-store, max-age=0'}}
    );
  }

  return NextResponse.json(
    {ok: true, role: profile.role},
    {status: 200, headers: {'cache-control': 'no-store, max-age=0'}}
  );
}
