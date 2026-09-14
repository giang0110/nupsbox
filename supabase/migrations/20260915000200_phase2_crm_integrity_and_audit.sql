-- Normalize legacy Phase 1 CRM statuses before constraining operational values.
update public.leads
set status = case status
  when 'visit_scheduled' then 'viewing'::public.lead_status
  when 'visited' then 'negotiating'::public.lead_status
  else status
end
where status in ('visit_scheduled', 'visited');

update public.lead_status_history
set from_status = case from_status
  when 'visit_scheduled' then 'viewing'::public.lead_status
  when 'visited' then 'negotiating'::public.lead_status
  else from_status
end,
to_status = case to_status
  when 'visit_scheduled' then 'viewing'::public.lead_status
  when 'visited' then 'negotiating'::public.lead_status
  else to_status
end
where from_status in ('visit_scheduled', 'visited')
   or to_status in ('visit_scheduled', 'visited');

alter table public.leads
  add constraint leads_phase2_status_check
  check (status in (
    'new'::public.lead_status,
    'contacted'::public.lead_status,
    'qualified'::public.lead_status,
    'viewing'::public.lead_status,
    'negotiating'::public.lead_status,
    'won'::public.lead_status,
    'lost'::public.lead_status
  ));

alter table public.lead_status_history
  add constraint lead_status_history_phase2_from_status_check
  check (
    from_status is null or from_status in (
      'new'::public.lead_status,
      'contacted'::public.lead_status,
      'qualified'::public.lead_status,
      'viewing'::public.lead_status,
      'negotiating'::public.lead_status,
      'won'::public.lead_status,
      'lost'::public.lead_status
    )
  ),
  add constraint lead_status_history_phase2_to_status_check
  check (to_status in (
    'new'::public.lead_status,
    'contacted'::public.lead_status,
    'qualified'::public.lead_status,
    'viewing'::public.lead_status,
    'negotiating'::public.lead_status,
    'won'::public.lead_status,
    'lost'::public.lead_status
  ));

create or replace function public.validate_lead_assignee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1
    from public.profiles p
    where p.id = new.assigned_to
      and p.active = true
      and p.role in ('admin', 'staff')
  ) then
    raise exception 'assigned profile must be an active admin or staff member'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger leads_validate_assignee
before insert or update of assigned_to on public.leads
for each row execute function public.validate_lead_assignee();

create or replace function public.audit_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.lead_status_history (
      lead_id,
      from_status,
      to_status,
      changed_by
    ) values (
      new.id,
      old.status,
      new.status,
      auth.uid()
    );

    insert into public.audit_log (
      actor_id,
      action,
      table_name,
      row_id,
      metadata
    ) values (
      auth.uid(),
      'lead.status_changed',
      'leads',
      new.id,
      jsonb_build_object(
        'from', old.status::text,
        'to', new.status::text
      )
    );
  end if;

  return new;
end;
$$;

create trigger leads_audit_status_change
after update of status on public.leads
for each row execute function public.audit_lead_status_change();

create or replace function public.audit_lead_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.assigned_to is distinct from new.assigned_to then
    insert into public.audit_log (
      actor_id,
      action,
      table_name,
      row_id,
      metadata
    ) values (
      auth.uid(),
      'lead.assigned',
      'leads',
      new.id,
      jsonb_build_object(
        'from_assignee', old.assigned_to,
        'to_assignee', new.assigned_to
      )
    );
  end if;

  return new;
end;
$$;

create trigger leads_audit_assignment_change
after update of assigned_to on public.leads
for each row execute function public.audit_lead_assignment_change();

create or replace function public.audit_lead_note_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (
    actor_id,
    action,
    table_name,
    row_id,
    metadata
  ) values (
    auth.uid(),
    'lead.note_added',
    'leads',
    new.lead_id,
    '{}'::jsonb
  );

  return new;
end;
$$;

create trigger lead_notes_audit_insert
after insert on public.lead_notes
for each row execute function public.audit_lead_note_insert();

revoke all on function public.validate_lead_assignee() from public, anon, authenticated;
revoke all on function public.audit_lead_status_change() from public, anon, authenticated;
revoke all on function public.audit_lead_assignment_change() from public, anon, authenticated;
revoke all on function public.audit_lead_note_insert() from public, anon, authenticated;

create index if not exists leads_assigned_to_idx
on public.leads(assigned_to, created_at desc)
where assigned_to is not null;
