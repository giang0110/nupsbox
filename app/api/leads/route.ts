import {NextResponse, type NextRequest} from 'next/server';
import {ZodError} from 'zod';
import {isSameOriginTelemetryRequest} from '@/features/analytics/web-vitals';
import {createLead} from '@/features/leads/create-lead';
import {LeadRateLimitError} from '@/lib/rate-limit/leads';

const MAX_BODY_BYTES = 16_384;

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = request.headers.get('x-real-ip') || forwarded;
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  return ip ?? `unknown:${userAgent.slice(0, 120)}`;
}

function payloadTooLarge(request: NextRequest) {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return false;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes > MAX_BODY_BYTES;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginTelemetryRequest(request.headers.get('origin'), request.nextUrl.origin)) {
    return NextResponse.json({ok: false, error: 'invalid_origin'}, {status: 403});
  }

  if (payloadTooLarge(request)) {
    return NextResponse.json({ok: false, error: 'payload_too_large'}, {status: 413});
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ok: false, error: 'payload_too_large'}, {status: 413});
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ok: false, error: 'invalid_json'}, {status: 400});
  }

  try {
    const result = await createLead(payload, {clientKey: clientKey(request)});
    return NextResponse.json(result, {
      status: 201,
      headers: {'cache-control': 'no-store'}
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ok: false, error: 'invalid_lead'}, {status: 400});
    }
    if (error instanceof LeadRateLimitError) {
      return NextResponse.json(
        {ok: false, error: 'rate_limited'},
        {status: 429, headers: {'retry-after': '900', 'cache-control': 'no-store'}}
      );
    }
    console.error('lead_submit_failed', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json({ok: false, error: 'submit_failed'}, {status: 500});
  }
}
