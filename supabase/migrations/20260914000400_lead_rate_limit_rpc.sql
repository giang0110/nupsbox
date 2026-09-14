create or replace function public.consume_lead_rate_limit(
  p_fingerprint text,
  p_limit integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.lead_rate_limits%rowtype;
  now_at timestamptz := now();
begin
  if p_fingerprint is null or char_length(p_fingerprint) < 16 then
    raise exception 'invalid fingerprint';
  end if;
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit configuration';
  end if;

  select * into current_row
  from public.lead_rate_limits
  where fingerprint = p_fingerprint
  for update;

  if not found then
    insert into public.lead_rate_limits (fingerprint, window_start, request_count, updated_at)
    values (p_fingerprint, now_at, 1, now_at);
    return true;
  end if;

  if current_row.window_start + make_interval(secs => p_window_seconds) <= now_at then
    update public.lead_rate_limits
    set window_start = now_at, request_count = 1, updated_at = now_at
    where fingerprint = p_fingerprint;
    return true;
  end if;

  if current_row.request_count >= p_limit then
    return false;
  end if;

  update public.lead_rate_limits
  set request_count = request_count + 1, updated_at = now_at
  where fingerprint = p_fingerprint;
  return true;
end;
$$;

revoke all on function public.consume_lead_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_lead_rate_limit(text, integer, integer) to service_role;
