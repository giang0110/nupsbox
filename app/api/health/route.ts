import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'nupsbox',
      commit
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store, max-age=0'
      }
    }
  );
}
