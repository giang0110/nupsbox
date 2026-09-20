import {NextResponse, type NextRequest} from 'next/server';
import {
  isSameOriginTelemetryRequest,
  normalizeWebVitalPayload
} from '@/features/analytics/web-vitals';

const MAX_BODY_BYTES = 2_048;

export async function POST(request: NextRequest) {
  if (!isSameOriginTelemetryRequest(request.headers.get('origin'), request.nextUrl.origin)) {
    return NextResponse.json({ok: false, error: 'invalid_origin'}, {status: 403});
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ok: false, error: 'unsupported_media_type'}, {status: 415});
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const bytes = Number(contentLength);
    if (Number.isFinite(bytes) && bytes > MAX_BODY_BYTES) {
      return NextResponse.json({ok: false, error: 'payload_too_large'}, {status: 413});
    }
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

  const metric = normalizeWebVitalPayload(parsed);
  if (!metric) {
    return NextResponse.json({ok: false, error: 'invalid_metric'}, {status: 400});
  }

  console.info('web_vital', JSON.stringify(metric));
  return new NextResponse(null, {status: 204});
}
