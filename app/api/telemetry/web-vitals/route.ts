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

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
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
