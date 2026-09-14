# NupsBox Phase 2 P2.1 — Data Model & Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Phase 2 authorization, CRM status, assignment-integrity, audit/history and database contracts that all later Phase 2 work depends on.

**Architecture:** Extend the existing `can()` permission matrix rather than creating a second authorization system. Keep the existing Phase 1 CRM tables (`leads`, `lead_notes`, `lead_status_history`, `audit_log`) and use forward-only migrations plus database triggers so lead status/history/audit changes are atomic while the underlying business mutation still remains subject to Postgres RLS.

**Tech Stack:** Next.js 16.3.3, React 19.3, TypeScript 5.9, Zod 4.6, Supabase/PostgreSQL, Supabase CLI 2.117.0, Vitest 5, pgTAP, Node `>=24.21.0 <25`.

**Spec:** `docs/superpowers/specs/2026-09-14-phase2-conversion-operations-design.md`

## Global Constraints

- Do not start implementation until Phase 1 is production-ready, merged to `main`, and `main` is green.
- Create the Phase 2 implementation branch from the updated `main`, not from the documentation branch.
- Never edit already-applied Phase 1 migration files.
- RLS remains authoritative; browser code never receives the Supabase service-role key.
- Roles stay exactly `admin`, `staff`, `viewer`.
- Viewer is read-only; viewer gets `leads:read` but no lead mutation permission.
- Staff gets CRM update/assignment/note permissions but not `leads:export` or `settings:update`.
- CRM operational statuses are `new`, `contacted`, `qualified`, `viewing`, `negotiating`, `won`, `lost`.
- `lost` is reachable from any non-terminal status. Admin-only correction/reopen is handled in P2.3.
- Audit metadata must not contain PII bodies, passwords, tokens or secrets.
- Every task uses TDD and ends with an independently reviewable commit.

---

### Task 1: Extend the shared permission contract

**Files:**
- Modify: `features/auth/permissions.ts`
- Modify: `tests/unit/permissions.test.ts`

**Interfaces:**
- Consumes: `AppRole` from `types/database.ts`.
- Produces: `AppAction` union and `can(role: AppRole, action: AppAction): boolean` with the approved Phase 2 matrix.

- [ ] **Step 1: Add failing permission-matrix tests**

Add explicit assertions for the new actions:

```ts
expect(can('admin', 'catalog:create')).toBe(true);
expect(can('admin', 'leads:export')).toBe(true);
expect(can('staff', 'catalog:publish')).toBe(true);
expect(can('staff', 'leads:assign')).toBe(true);
expect(can('staff', 'leads:note')).toBe(true);
expect(can('staff', 'leads:export')).toBe(false);
expect(can('staff', 'settings:update')).toBe(false);
expect(can('viewer', 'leads:read')).toBe(true);
expect(can('viewer', 'catalog:update')).toBe(false);
expect(can('viewer', 'leads:note')).toBe(false);
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm run test:run -- tests/unit/permissions.test.ts
```

Expected: TypeScript/Vitest failure because Phase 1 `AppAction` does not yet contain the new action names and viewer does not have `leads:read`.

- [ ] **Step 3: Extend `AppAction` and the single permission map**

The final action union must include the existing actions plus:

```ts
| 'catalog:create'
| 'catalog:publish'
| 'content:create'
| 'content:publish'
| 'media:read'
| 'media:update'
| 'leads:assign'
| 'leads:note'
| 'leads:export'
```

Encode the exact matrix from the approved spec. Do not create route-local role checks such as `role === 'admin'` when a matching `can()` permission exists.

- [ ] **Step 4: Verify PASS and commit**

```bash
npm run test:run -- tests/unit/permissions.test.ts
npm run typecheck
git add features/auth/permissions.ts tests/unit/permissions.test.ts
git commit -m "feat: extend phase2 permission matrix"
```

---

### Task 2: Add the Phase 2 CRM status enum values with a forward migration

**Files:**
- Create: `supabase/migrations/20260915000100_phase2_lead_status_values.sql`
- Modify: `supabase/tests/schema_contract.sql`

**Interfaces:**
- Consumes: existing `public.lead_status` enum.
- Produces: enum members `qualified`, `viewing`, `negotiating` while retaining legacy enum members for migration compatibility.

- [ ] **Step 1: Make schema contract fail on missing Phase 2 enum labels**

Add pgTAP assertions using `enum_has_labels` (or equivalent pgTAP enum assertion available in the local image) for the expected superset:

```text
new
contacted
visit_scheduled
visited
qualified
viewing
negotiating
won
lost
```

Do not require removal of legacy enum labels because PostgreSQL enum removal is not the migration strategy.

- [ ] **Step 2: Verify RED**

```bash
supabase db start
supabase test db
```

Expected: schema contract fails because the three Phase 2 labels do not exist.

- [ ] **Step 3: Add enum labels only in this migration**

Migration body:

```sql
alter type public.lead_status add value if not exists 'qualified' after 'contacted';
alter type public.lead_status add value if not exists 'viewing' after 'qualified';
alter type public.lead_status add value if not exists 'negotiating' after 'viewing';
```

Do not update rows in this same migration; new enum values must be committed before a later migration uses them.

- [ ] **Step 4: Verify migration chain and commit**

```bash
supabase db reset
supabase test db
git add supabase/migrations/20260915000100_phase2_lead_status_values.sql supabase/tests/schema_contract.sql
git commit -m "feat: add phase2 lead status values"
```

---

### Task 3: Normalize legacy statuses and add CRM integrity/audit triggers

**Files:**
- Create: `supabase/migrations/20260915000200_phase2_crm_integrity_and_audit.sql`
- Modify: `supabase/tests/schema_contract.sql`
- Modify: `supabase/tests/rls_contract.sql`

**Interfaces:**
- Produces database invariants for operational statuses, assignment targets and atomic lead history/audit behavior.
- Existing tables reused: `leads`, `lead_notes`, `lead_status_history`, `audit_log`, `profiles`.

- [ ] **Step 1: Add failing pgTAP assertions for new constraints/triggers/index**

Assert at minimum:

```text
leads_phase2_status_check exists
lead_status_history_phase2_to_status_check exists
leads_validate_assignee exists
leads_audit_status_change exists
leads_audit_assignment_change exists
lead_notes_audit_insert exists
leads_assigned_to_idx exists
```

- [ ] **Step 2: Verify RED**

```bash
supabase db reset
supabase test db
```

- [ ] **Step 3: Normalize old rows and constrain future operational values**

The migration must run only after `20260915000100` and include:

```sql
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
```

Then add checks based on `status::text` so direct writes cannot reintroduce the legacy operational statuses:

```sql
alter table public.leads add constraint leads_phase2_status_check
check (status::text in ('new','contacted','qualified','viewing','negotiating','won','lost'));
```

Apply equivalent allowed-value checks to `lead_status_history.to_status` and nullable `from_status`.

- [ ] **Step 4: Add assignment validation**

Create a `security definer` trigger function with `set search_path = public` that rejects non-null `assigned_to` unless the target profile is active and role is `admin` or `staff`.

Required trigger shape:

```sql
create trigger leads_validate_assignee
before insert or update of assigned_to on public.leads
for each row execute function public.validate_lead_assignee();
```

Revoke direct execute on trigger functions from `public`, `anon`, and `authenticated`.

- [ ] **Step 5: Add atomic history/audit triggers**

Create narrow trigger functions that insert only non-secret metadata:

```json
{"from":"contacted","to":"qualified"}
```

for status changes and:

```json
{"from_assignee":"<uuid-or-null>","to_assignee":"<uuid-or-null>"}
```

for assignment changes. Note audit must record `lead_id` only and must not copy note text.

Status trigger responsibilities:

```text
AFTER UPDATE OF status ON leads
→ if old.status != new.status
→ insert lead_status_history(changed_by = auth.uid())
→ insert audit_log(actor_id = auth.uid(), action = 'lead.status_changed', table_name = 'leads', row_id = new.id, metadata = from/to)
```

Assignment trigger uses `action = 'lead.assigned'`; note insert uses `action = 'lead.note_added'`.

- [ ] **Step 6: Add only the missing CRM index**

```sql
create index if not exists leads_assigned_to_idx
on public.leads(assigned_to, created_at desc)
where assigned_to is not null;
```

Do not recreate Phase 1 indexes for lead status, created time, location, notes or history.

- [ ] **Step 7: Verify and commit**

```bash
supabase db reset
supabase test db
git add supabase/migrations/20260915000200_phase2_crm_integrity_and_audit.sql supabase/tests/schema_contract.sql supabase/tests/rls_contract.sql
git commit -m "feat: enforce phase2 crm integrity and audit"
```

---

### Task 4: Align CRM RLS with the approved read/write matrix

**Files:**
- Modify: `supabase/migrations/20260915000200_phase2_crm_integrity_and_audit.sql`
- Modify: `supabase/tests/rls_contract.sql`

**Interfaces:**
- Produces: viewer read access to leads/notes/history; staff/admin mutation remains limited to the existing write surfaces; no authenticated client insert policy on `audit_log`.

- [ ] **Step 1: Extend failing RLS contract expectations**

The expected CRM policy model is:

```text
leads_authenticated_read       → authenticated; app roles admin/staff/viewer
leads_staff_update             → authenticated; app roles admin/staff
lead_notes_authenticated_read  → authenticated; app roles admin/staff/viewer
lead_notes_staff_insert        → authenticated; app roles admin/staff
lead_status_history_authenticated_read → authenticated; app roles admin/staff/viewer
lead_status_history insert is trigger-owned, not direct client insert
```

`audit_log` keeps admin read and has no client insert policy.

- [ ] **Step 2: Verify RED**

```bash
supabase db reset
supabase test db
```

- [ ] **Step 3: Replace the Phase 1 CRM read policies via forward DDL**

Drop only the old named policies and recreate the Phase 2 named policies. `USING` expressions must call `current_app_role()` and include `viewer` only for SELECT. Do not broaden update/insert permissions.

Drop the old direct `lead_status_history_staff_insert` policy after the status trigger is active; history becomes append-only through the lead status mutation.

- [ ] **Step 4: Verify RLS contract and commit**

```bash
supabase db reset
supabase test db
git add supabase/migrations/20260915000200_phase2_crm_integrity_and_audit.sql supabase/tests/rls_contract.sql
git commit -m "feat: align crm rls with phase2 roles"
```

---

### Task 5: Regenerate database types and move lead status history ownership into the database

**Files:**
- Modify: `types/database.ts`
- Modify: `features/admin/leads.ts`
- Modify: `app/admin/leads/actions.ts`
- Modify: `tests/unit/admin-leads.test.ts`

**Interfaces:**
- Produces:

```ts
export const operationalLeadStatuses = [
  'new','contacted','qualified','viewing','negotiating','won','lost'
] as const;
export type OperationalLeadStatus = typeof operationalLeadStatuses[number];
export function isOperationalLeadStatus(value: unknown): value is OperationalLeadStatus;
```

- [ ] **Step 1: Regenerate local types after a clean reset**

```bash
supabase db reset
supabase gen types typescript --local > types/database.ts
```

Confirm `LeadStatus` includes the Phase 2 labels.

- [ ] **Step 2: Write failing lead-domain tests**

Replace the old unknown-status-only test with explicit assertions:

```ts
expect(isOperationalLeadStatus('qualified')).toBe(true);
expect(isOperationalLeadStatus('viewing')).toBe(true);
expect(isOperationalLeadStatus('visit_scheduled')).toBe(false);
expect(isOperationalLeadStatus('visited')).toBe(false);
```

Keep malformed UUID and viewer mutation denial tests.

- [ ] **Step 3: Verify RED**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts
```

- [ ] **Step 4: Implement the operational status adapter**

Update `prepareLeadStatusUpdate()` to return `OperationalLeadStatus` and reject legacy/unknown values.

- [ ] **Step 5: Remove the non-atomic manual history insert from the server action**

`updateLeadStatus()` must keep:

```text
requireAdminUser
→ prepareLeadStatusUpdate
→ update leads.status
→ revalidate paths
```

and remove the separate `lead_status_history.insert(...)`. The database trigger now owns history/audit atomically.

Do not add service-role usage to this action.

- [ ] **Step 6: Verify and commit**

```bash
npm run test:run -- tests/unit/admin-leads.test.ts tests/unit/permissions.test.ts
npm run lint
npm run typecheck
npm run test:run
npm run build
git add types/database.ts features/admin/leads.ts app/admin/leads/actions.ts tests/unit/admin-leads.test.ts
git commit -m "refactor: use phase2 crm status contract"
```

---

### Task 6: P2.1 final verification checkpoint

**Files:**
- No new production files unless verification finds a concrete defect.

**Interfaces:**
- Gate for P2.2.

- [ ] **Step 1: Verify repository baseline and migration history locally**

```bash
git status --short
supabase db reset
supabase test db
```

Expected: clean migration application and all pgTAP tests PASS.

- [ ] **Step 2: Run the complete application quality gate**

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Inspect generated diff for prohibited changes**

```bash
git diff main...HEAD -- supabase/migrations types/database.ts features/auth features/admin app/admin/leads tests supabase/tests
```

Confirm no Phase 1 migration was edited, no service-role credential was introduced, and no viewer mutation path was added.

- [ ] **Step 4: Commit only if verification required a fix**

Use a narrowly scoped `fix:` commit describing the verified defect. Otherwise leave the previous task commit as the P2.1 head.

**P2.1 exit criteria:** permission unit tests PASS; Phase 2 lead status values/types are present; legacy operational lead rows are normalized; assignment validation works; lead history/audit are atomic; viewer is read-only; full CI-equivalent and DB tests are green.
