import {NextResponse, type NextRequest} from 'next/server';
import {normalizeClientErrorEvent} from '@/features/ops/client-error';

const MAX_BODY_BYTES = 1_024;

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ok: false, error: 'invalid_origin'}, {status: 403});
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ok: false, error: 'unsupported_media_type'}, {status: 415});
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ok: false, error: 'payload_too_large'}, {status: 413});
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ok: false, error: 'payload_too_large'}, {status: 413});
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ok: false, error: 'invalid_json'}, {status: 400});
  }

  const event = normalizeClientErrorEvent(parsed);
  if (!event) {
    return NextResponse.json({ok: false, error: 'invalid_event'}, {status: 400});
  }

  console.error('client_error', JSON.stringify(event));
  return new NextResponse(null, {status: 204});
}
