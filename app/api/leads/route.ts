import {NextResponse, type NextRequest} from 'next/server';
import {ZodError} from 'zod';
import {createLead} from '@/features/leads/create-lead';
import {classifyLeadSubmitError} from '@/features/leads/error-classification';
import {LeadRateLimitError} from '@/lib/rate-limit/leads';

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  return ip ?? `unknown:${userAgent.slice(0, 120)}`;
}

export async function POST(request: NextRequest) {
  const diagnosticRequested = request.headers.get('x-nupsbox-e2e-diagnostic') === 'phase1';
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ok: false, error: 'invalid_json'}, {status: 400});
  }

  try {
    const result = await createLead(payload, {clientKey: clientKey(request)});
    return NextResponse.json(result, {status: 201});
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ok: false, error: 'invalid_lead'}, {status: 400});
    }
    if (error instanceof LeadRateLimitError) {
      return NextResponse.json({ok: false, error: 'rate_limited'}, {status: 429});
    }

    const diagnostic = classifyLeadSubmitError(error);
    console.error('lead_submit_failed', diagnostic);
    const response = diagnosticRequested
      ? {ok: false, error: 'submit_failed', diagnostic}
      : {ok: false, error: 'submit_failed'};
    return NextResponse.json(response, {status: 500});
  }
}
