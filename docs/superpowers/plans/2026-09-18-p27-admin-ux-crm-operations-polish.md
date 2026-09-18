
# P2.7 Admin UX & CRM Operations Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the authenticated NupsBox Admin into a responsive operations workspace for management and CRM staff, with an Executive + Operations dashboard, a shared Table/Pipeline lead workspace, an adaptive lead detail flow, and consistent Catalog/Content surfaces without changing the database schema or CRM semantics.

**Architecture:** Keep Next.js Server Components and existing Supabase/RLS/server-action contracts authoritative. Build a small Admin-specific visual/navigation layer first, extend bounded server read models for dashboard and CRM filtering, then add responsive Table/Pipeline views and adaptive Lead Detail while routing every mutation through existing validation/permission rules. Use native/lightweight browser interaction for the optional desktop drag-and-drop enhancement; do not add a DnD or chart dependency.

**Tech Stack:** Next.js 16.3.3 App Router, React 19.3, TypeScript 5.9, Tailwind CSS v4 classes, Supabase/Postgres, Zod 4.6, Vitest 5 + Testing Library, Playwright 1.63, GitHub Actions, Vercel, Node 24.x.

**Spec:** `docs/superpowers/specs/2026-09-18-p27-admin-ux-crm-operations-polish-design.md`

## Global Constraints

- P2.7 is Admin UX/read-model work; do not change public funnel behavior.
- Do not create or modify database migrations.
- Do not add database columns, tables, enums, triggers, persisted Kanban ordering, SLA fields, saved filters, or notification rows.
- Preserve the operational lead statuses exactly: `new`, `contacted`, `qualified`, `viewing`, `negotiating`, `won`, `lost`.
- Preserve existing RBAC checks, server-side validation, and Supabase RLS. UI hiding is never authorization.
- Preserve Light Booking semantics: an appointment is not a reservation, inventory hold, payment, or calendar synchronization event.
- Do not seed or mutate production business data.
- Do not cut over or attach `nupsbox.vn`.
- Do not add payment, inventory locking, automated messaging, customer portal, realtime presence, or notification center features.
- Table and Pipeline must use the same filter/search model and the same authoritative status-mutation path.
- Drag-and-drop is an optional desktop enhancement; explicit status controls remain mandatory for keyboard/mobile users.
- Do not add a chart framework or heavy DnD package.
- Keep Server Components as the default; only interactive shell controls, mutation controls, and drag-and-drop need Client Components.
- Keep the current 100-row operational lead ceiling unless implementation reveals an already-supported pagination contract.
- Use `Asia/Ho_Chi_Minh` for CRM/appointment timestamps.
- Maintain practical 44 px touch targets, keyboard focus visibility, semantic labels/headings, reduced-motion behavior, and status text in addition to color.
- Responsive acceptance targets: 390×844, 768×1024, 1366×768, 1440×900, and 1536×864.
- Anonymous `/admin` must remain protected and Admin metadata must remain `noindex`.
- Existing quality gates remain mandatory: lint, typecheck, unit/integration tests, build, public Playwright, Database Tests pgTAP/RLS, exact-head Vercel Preview smoke, and clean Preview runtime error/fatal logs.

---

## File Structure

### Admin shell and primitives

- Create: `features/admin/navigation.ts` — role-filtered Admin navigation groups and active-route helper.
- Create: `components/admin/admin-shell.tsx` — client-owned desktop collapse/mobile dialog state around server-rendered children.
- Create: `components/admin/admin-page-header.tsx` — shared page title/breadcrumb/action layout.
- Create: `components/admin/admin-primitives.tsx` — `AdminPanel`, `AdminStatCard`, `AdminStatusBadge`, `AdminEmptyState`, `AdminFieldGroup`, `AdminActionBar`.
- Modify: `app/admin/layout.tsx` — replace horizontal header/nav with `AdminShell`.
- Retire from composition, but do not delete until unused: `components/admin/admin-nav.tsx`.
- Modify: `app/globals.css` only for Admin-specific sticky-height/reduced-motion helpers that Tailwind utilities cannot express cleanly.
- Test: `tests/unit/admin-navigation.test.ts`.
- Test: `tests/unit/admin-ui-primitives.test.tsx`.

### Dashboard

- Modify: `features/admin/dashboard.ts` — CRM status counts, bounded attention queues, appointment summary, operational health.
- Modify: `app/admin/page.tsx` — Executive + Operations dashboard using Admin primitives.
- Test: `tests/unit/admin-dashboard.test.ts`.

### Lead workspace read model

- Create: `features/admin/lead-workspace.ts` — URL filter normalization, status metadata, href construction, pipeline grouping.
- Modify: `features/admin/leads.ts` — extend list row projection and server filters/search/source options.
- Test: `tests/unit/admin-lead-workspace.test.ts`.
- Modify: `tests/unit/admin-leads.test.ts`.

### Leads Table and filters

- Create: `components/admin/lead-filter-bar.tsx`.
- Create: `components/admin/lead-list.tsx`.
- Modify: `app/admin/leads/page.tsx`.
- Test: `tests/unit/admin-lead-list.test.tsx`.

### CRM mutation feedback

- Create: `features/admin/action-result.ts` — serializable Admin action-result contract.
- Modify: `app/admin/leads/actions.ts` — shared private persistence path plus client-callable status/assignment/note wrappers.
- Modify: `components/admin/lead-status-form.tsx` — explicit pending/error feedback.
- Create: `components/admin/lead-assignment-form.tsx`.
- Create: `components/admin/lead-note-form.tsx`.
- Test: `tests/unit/admin-lead-actions-ui.test.tsx`.
- Preserve: `tests/unit/admin-lead-operations.test.ts`.

### Pipeline/Kanban

- Create: `components/admin/lead-pipeline.tsx` — seven-column pipeline, explicit selector fallback, native desktop drag/drop.
- Modify: `app/admin/leads/page.tsx` — switch Table/Pipeline from normalized URL state.
- Test: `tests/unit/admin-lead-pipeline.test.tsx`.

### Lead detail

- Modify: `features/admin/lead-detail.ts` — label/next-appointment presentation helpers only; preserve current appointment selection semantics.
- Create: `components/admin/lead-contact-header.tsx`.
- Create: `components/admin/lead-operation-rail.tsx`.
- Create: `components/admin/lead-context-panels.tsx`.
- Create: `components/admin/lead-timeline.tsx`.
- Modify: `app/admin/leads/[leadId]/page.tsx`.
- Modify: `tests/unit/admin-next-appointment.test.ts` only if helper surface expands.
- Test: `tests/unit/admin-lead-detail-layout.test.tsx`.

### Appointment workspace and timeline

- Modify: `app/admin/leads/[leadId]/actions.ts` — serializable mutation results without changing domain preparation/validation.
- Modify: `components/admin/appointment-workspace.tsx` — compact next-appointment/create/edit presentation with visible feedback.
- Modify: `features/admin/lead-timeline.ts` — readable appointment event labels.
- Modify: `tests/unit/lead-timeline.test.ts`.
- Test: `tests/unit/admin-appointment-workspace-ui.test.tsx`.
- Preserve unchanged domain behavior in:
  - `features/admin/appointments.ts`
  - `tests/unit/admin-appointments.test.ts`
  - `tests/unit/admin-appointment-form.test.ts`
  - `tests/unit/admin-appointment-persistence.test.ts`
  - `tests/unit/admin-appointment-read-model.test.ts`

### Catalog and Content consistency

- Modify:
  - `app/admin/catalog/page.tsx`
  - `app/admin/catalog/locations/page.tsx`
  - `app/admin/catalog/unit-types/page.tsx`
  - `app/admin/catalog/pricing/page.tsx`
  - `components/admin/catalog-tables.tsx`
  - `components/admin/location-form.tsx`
  - `components/admin/unit-type-form.tsx`
  - `components/admin/pricing-form.tsx`
  - `app/admin/content/page.tsx`
  - `app/admin/content/faq/page.tsx`
  - `app/admin/content/blog/page.tsx`
  - `app/admin/content/blog/[id]/page.tsx`
  - `app/admin/content/media/page.tsx`
  - `app/admin/content/settings/page.tsx`
  - `components/admin/faq-form.tsx`
  - `components/admin/blog-form.tsx`
  - `components/admin/media-metadata-form.tsx`
  - `components/admin/site-setting-form.tsx`
- Test: `tests/unit/admin-responsive-lists.test.tsx`.
- Preserve current data/mutation contracts covered by existing Admin catalog/content/settings tests.

### Verification

- Preserve: `tests/unit/private-route-metadata.test.ts`.
- Preserve public E2E: `tests/e2e/**/*.spec.ts`.
- Do not add a test-only auth bypass or production credential to Playwright.
- Verify exact-head Preview protection through the existing `CI / preview-smoke` job.
- Verify DB/RLS through existing `Database Tests` workflow.

---

### Task 1: Build the Admin navigation model and shared shell/primitives

**Files:**
- Create: `features/admin/navigation.ts`
- Create: `components/admin/admin-shell.tsx`
- Create: `components/admin/admin-page-header.tsx`
- Create: `components/admin/admin-primitives.tsx`
- Modify: `app/admin/layout.tsx`
- Test: `tests/unit/admin-navigation.test.ts`
- Test: `tests/unit/admin-ui-primitives.test.tsx`

**Interfaces:**
- Consumes: `can(role, action)` from `features/auth/permissions.ts` and `AdminSession.role`.
- Produces:
  - `getAdminNavigation(role: AppRole): AdminNavigationGroup[]`
  - `isAdminRouteActive(pathname: string, href: string): boolean`
  - `AdminShell({role, userLabel, groups, children})`
  - `AdminPageHeader({eyebrow, title, description, breadcrumbs?, actions?})`
  - `AdminPanel`, `AdminStatCard`, `AdminStatusBadge`, `AdminEmptyState`, `AdminFieldGroup`, `AdminActionBar`.

- [ ] **Step 1: Write navigation and primitive RED tests**

Create `tests/unit/admin-navigation.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {getAdminNavigation, isAdminRouteActive} from '@/features/admin/navigation';

describe('admin navigation', () => {
  it('groups the approved Admin information architecture', () => {
    const groups = getAdminNavigation('staff');
    expect(groups.map((group) => group.label)).toEqual([
      'Tổng quan',
      'CRM',
      'Catalog',
      'Content'
    ]);
    expect(groups.flatMap((group) => group.items.map((item) => item.href))).toEqual([
      '/admin',
      '/admin/leads',
      '/admin/catalog',
      '/admin/catalog/locations',
      '/admin/catalog/unit-types',
      '/admin/catalog/pricing',
      '/admin/content',
      '/admin/content/faq',
      '/admin/content/blog',
      '/admin/content/media',
      '/admin/content/settings'
    ]);
  });

  it('treats /admin as exact while keeping nested sections active', () => {
    expect(isAdminRouteActive('/admin', '/admin')).toBe(true);
    expect(isAdminRouteActive('/admin/leads', '/admin')).toBe(false);
    expect(isAdminRouteActive('/admin/leads/abc', '/admin/leads')).toBe(true);
    expect(isAdminRouteActive('/admin/content/blog/abc', '/admin/content/blog')).toBe(true);
  });
});
```

Create `tests/unit/admin-ui-primitives.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatCard,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';

describe('admin UI primitives', () => {
  it('renders a semantic page header with actions', () => {
    render(
      <AdminPageHeader
        eyebrow="CRM"
        title="Khách hàng tiềm năng"
        description="Theo dõi và xử lý lead."
        actions={<a href="/admin/leads?view=pipeline">Pipeline</a>}
      />
    );
    expect(screen.getByRole('heading', {level: 1, name: 'Khách hàng tiềm năng'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Pipeline'})).toBeInTheDocument();
  });

  it('renders status text and reusable operational surfaces', () => {
    render(
      <>
        <AdminStatCard label="Lead mới" value={8} />
        <AdminStatusBadge label="Mới" tone="info" />
        <AdminPanel title="Việc cần chú ý">Nội dung</AdminPanel>
        <AdminEmptyState title="Chưa có lead" description="Không có bản ghi phù hợp." />
      </>
    );
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Mới')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Việc cần chú ý'})).toBeInTheDocument();
    expect(screen.getByText('Không có bản ghi phù hợp.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm run test:run -- tests/unit/admin-navigation.test.ts tests/unit/admin-ui-primitives.test.tsx
```

Expected: FAIL because the navigation module and Admin primitives do not exist.

- [ ] **Step 3: Implement the role-filtered navigation model**

Create `features/admin/navigation.ts`:

```ts
import {can, type AppAction} from '@/features/auth/permissions';
import type {AppRole} from '@/types/database';

export type AdminNavigationItem = {
  href: string;
  label: string;
  action: AppAction;
};

export type AdminNavigationGroup = {
  label: string;
  items: AdminNavigationItem[];
};

const navigation: AdminNavigationGroup[] = [
  {label: 'Tổng quan', items: [{href: '/admin', label: 'Dashboard', action: 'dashboard:read'}]},
  {label: 'CRM', items: [{href: '/admin/leads', label: 'Khách hàng', action: 'leads:read'}]},
  {
    label: 'Catalog',
    items: [
      {href: '/admin/catalog', label: 'Tổng quan catalog', action: 'catalog:read'},
      {href: '/admin/catalog/locations', label: 'Địa điểm', action: 'catalog:read'},
      {href: '/admin/catalog/unit-types', label: 'Loại kho', action: 'catalog:read'},
      {href: '/admin/catalog/pricing', label: 'Bảng giá', action: 'catalog:read'}
    ]
  },
  {
    label: 'Content',
    items: [
      {href: '/admin/content', label: 'Tổng quan nội dung', action: 'content:read'},
      {href: '/admin/content/faq', label: 'FAQ', action: 'content:read'},
      {href: '/admin/content/blog', label: 'Blog', action: 'content:read'},
      {href: '/admin/content/media', label: 'Media', action: 'media:read'},
      {href: '/admin/content/settings', label: 'Settings', action: 'settings:read'}
    ]
  }
];

export function getAdminNavigation(role: AppRole): AdminNavigationGroup[] {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(role, item.action))
    }))
    .filter((group) => group.items.length > 0);
}

export function isAdminRouteActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}
```

- [ ] **Step 4: Implement Admin primitives and the adaptive shell**

Create `components/admin/admin-primitives.tsx` with typed React-node props and these contracts:

```tsx
import type {ReactNode} from 'react';
import clsx from 'clsx';

export function AdminPanel({
  title,
  description,
  actions,
  children,
  className
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx('rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm', className)}>
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--nupsbox-border)] px-5 py-4">
          <div>
            {title ? <h2 className="text-lg font-black text-[var(--nupsbox-navy)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminStatCard({
  label,
  value,
  detail,
  href
}: {
  label: string;
  value: number | string;
  detail?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-sm font-bold text-[var(--nupsbox-slate)]">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">{detail}</p> : null}
    </>
  );
  return href
    ? <a href={href} className="block min-h-28 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]">{content}</a>
    : <article className="min-h-28 rounded-2xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">{content}</article>;
}

export function AdminStatusBadge({
  label,
  tone = 'neutral'
}: {
  label: string;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}) {
  return <span data-tone={tone} className="inline-flex min-h-7 items-center rounded-full border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] px-2.5 text-xs font-black text-[var(--nupsbox-navy)]">{label}</span>;
}

export function AdminEmptyState({title, description, action}: {title: string; description: string; action?: ReactNode}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--nupsbox-border)] p-7 text-center">
      <h3 className="font-black text-[var(--nupsbox-navy)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminFieldGroup({legend, children}: {legend: string; children: ReactNode}) {
  return <fieldset className="grid gap-4"><legend className="mb-2 text-sm font-black text-[var(--nupsbox-navy)]">{legend}</legend>{children}</fieldset>;
}

export function AdminActionBar({children}: {children: ReactNode}) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
```

Create `components/admin/admin-page-header.tsx`:

```tsx
import type {ReactNode} from 'react';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {breadcrumbs ? <div className="mb-3 text-sm text-[var(--nupsbox-slate)]">{breadcrumbs}</div> : null}
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--nupsbox-blue)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)] sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl leading-7 text-[var(--nupsbox-slate)]">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
```

Create `components/admin/admin-shell.tsx` as a Client Component. It must:
- receive the serializable `groups` produced by `getAdminNavigation(session.role)` in `app/admin/layout.tsx`;
- render a desktop sidebar at `lg` and a native `<dialog>` drawer below `lg`;
- use `usePathname()` plus `isAdminRouteActive()` for active navigation;
- expose a 44 px menu trigger named `Mở menu quản trị`, a drawer close button named `Đóng menu quản trị`, and a desktop collapse toggle whose label switches between `Thu gọn menu quản trị` and `Mở rộng menu quản trị`;
- use local state only; do not persist collapse state to DB;
- use `dialog.showModal()`/`dialog.close()` so Escape/focus behavior comes from the native dialog;
- render the role and `userLabel` in the shell;
- shift content between expanded and collapsed desktop widths without changing page routes.

Update `app/admin/layout.tsx` to remain the auth/metadata boundary:

```tsx
import type {ReactNode} from 'react';
import {AdminShell} from '@/components/admin/admin-shell';
import {getAdminNavigation} from '@/features/admin/navigation';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {PRIVATE_AREA_METADATA} from '@/features/seo/private-metadata';

export const metadata = PRIVATE_AREA_METADATA;

export default async function AdminLayout({children}: {children: ReactNode}) {
  const session = await requireAdminUser();
  const userLabel = session.fullName ?? session.user.email ?? session.role;

  return (
    <AdminShell
      role={session.role}
      userLabel={userLabel}
      groups={getAdminNavigation(session.role)}
    >
      {children}
    </AdminShell>
  );
}
```

- [ ] **Step 5: Run focused tests and the private metadata regression**

Run:

```bash
npm run test:run -- tests/unit/admin-navigation.test.ts tests/unit/admin-ui-primitives.test.tsx tests/unit/private-route-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run typecheck and commit**

Run:

```bash
npm run typecheck
git add features/admin/navigation.ts components/admin/admin-shell.tsx components/admin/admin-page-header.tsx components/admin/admin-primitives.tsx app/admin/layout.tsx tests/unit/admin-navigation.test.ts tests/unit/admin-ui-primitives.test.tsx
git commit -m "feat: add adaptive admin shell"
```

Expected: typecheck passes and the commit contains no schema/migration files.

---

### Task 2: Expand the dashboard read model into Executive + Operations

**Files:**
- Modify: `features/admin/dashboard.ts`
- Modify: `app/admin/page.tsx`
- Modify: `tests/unit/admin-dashboard.test.ts`

**Interfaces:**
- Consumes: `operationalLeadStatuses`, current Supabase server client, current appointment tables.
- Produces:
  - `AdminDashboardStatusCounts = Record<OperationalLeadStatus, number>`
  - `summarizeAdminCrmCounts(byStatus, upcomingAppointments)`
  - `AdminDashboardSummary` with `crm`, `attention`, and `health`.
  - `getAdminDashboardSummary(now?: Date): Promise<AdminDashboardSummary>`; the implementation signature is `getAdminDashboardSummary(now = new Date())`.

- [ ] **Step 1: Extend dashboard tests with CRM aggregation semantics**

Replace/extend `tests/unit/admin-dashboard.test.ts` with assertions that preserve the current null-count normalization and add:

```ts
import {
  normalizeAdminDashboardCounts,
  summarizeAdminCrmCounts
} from '@/features/admin/dashboard';

it('derives CRM workload from the seven approved statuses only', () => {
  const result = summarizeAdminCrmCounts({
    new: 4,
    contacted: 3,
    qualified: 2,
    viewing: 5,
    negotiating: 1,
    won: 7,
    lost: 6
  }, 8);

  expect(result).toEqual({
    newLeads: 4,
    inProgressLeads: 11,
    upcomingAppointments: 8,
    wonLeads: 7,
    lostLeads: 6,
    byStatus: {
      new: 4,
      contacted: 3,
      qualified: 2,
      viewing: 5,
      negotiating: 1,
      won: 7,
      lost: 6
    }
  });
});
```

- [ ] **Step 2: Run the dashboard test and verify RED**

Run:

```bash
npm run test:run -- tests/unit/admin-dashboard.test.ts
```

Expected: FAIL because `summarizeAdminCrmCounts` and the richer dashboard summary do not exist.

- [ ] **Step 3: Implement the dashboard types and pure CRM aggregation**

Replace the current dashboard-only count model with the following additive types in `features/admin/dashboard.ts`. Keep `normalizeAdminDashboardCounts()` because its null-count contract is already covered by tests.

```ts
import type {SupabaseClient} from '@supabase/supabase-js';
import {
  isOperationalLeadStatus,
  operationalLeadStatuses,
  type OperationalLeadStatus
} from '@/features/admin/leads';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {DatabaseWithAppointments} from '@/types/appointment-database';

export type AdminDashboardCounts = {
  leads: number;
  activeLocations: number;
  activeUnitTypes: number;
  faqs: number;
  publishedBlogPosts: number;
};

type NullableAdminDashboardCounts = {
  [Key in keyof AdminDashboardCounts]: number | null;
};

export type AdminDashboardStatusCounts = Record<OperationalLeadStatus, number>;

export type AdminDashboardCrm = {
  newLeads: number;
  inProgressLeads: number;
  upcomingAppointments: number;
  wonLeads: number;
  lostLeads: number;
  byStatus: AdminDashboardStatusCounts;
};

export type AdminDashboardLeadItem = {
  id: string;
  fullName: string;
  phone: string;
  status: OperationalLeadStatus;
  assignedTo: string | null;
  createdAt: string;
};

export type AdminDashboardAppointmentItem = {
  id: string;
  leadId: string;
  leadName: string | null;
  status: 'pending' | 'confirmed';
  scheduledAt: string;
  overdue: boolean;
};

export type AdminDashboardSummary = {
  crm: AdminDashboardCrm;
  attention: {
    newLeads: AdminDashboardLeadItem[];
    unassignedLeads: AdminDashboardLeadItem[];
    appointments: AdminDashboardAppointmentItem[];
  };
  health: {
    activeLocations: number;
    activeUnitTypes: number;
    faqs: number;
    publishedBlogPosts: number;
  };
};

export function normalizeAdminDashboardCounts(
  counts: NullableAdminDashboardCounts
): AdminDashboardCounts {
  return {
    leads: counts.leads ?? 0,
    activeLocations: counts.activeLocations ?? 0,
    activeUnitTypes: counts.activeUnitTypes ?? 0,
    faqs: counts.faqs ?? 0,
    publishedBlogPosts: counts.publishedBlogPosts ?? 0
  };
}

export function summarizeAdminCrmCounts(
  byStatus: AdminDashboardStatusCounts,
  upcomingAppointments: number
): AdminDashboardCrm {
  return {
    newLeads: byStatus.new,
    inProgressLeads:
      byStatus.contacted +
      byStatus.qualified +
      byStatus.viewing +
      byStatus.negotiating,
    upcomingAppointments,
    wonLeads: byStatus.won,
    lostLeads: byStatus.lost,
    byStatus
  };
}

function projectDashboardLead(row: {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
}): AdminDashboardLeadItem {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    status: isOperationalLeadStatus(row.status) ? row.status : 'new',
    assignedTo: row.assigned_to,
    createdAt: row.created_at
  };
}
```

- [ ] **Step 4: Implement the bounded dashboard queries and projection**

Replace the old `getAdminDashboardSummary()` body with this structure:

```ts
export async function getAdminDashboardSummary(
  now = new Date()
): Promise<AdminDashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const appointmentClient =
    supabase as unknown as SupabaseClient<DatabaseWithAppointments>;
  const nowIso = now.toISOString();

  const statusCountResults = await Promise.all(
    operationalLeadStatuses.map((status) =>
      supabase
        .from('leads')
        .select('*', {count: 'exact', head: true})
        .eq('status', status)
    )
  );

  const [
    upcomingCount,
    newLeadRows,
    unassignedRows,
    overdueRows,
    upcomingRows,
    locations,
    unitTypes,
    faqs,
    blogPosts
  ] = await Promise.all([
    appointmentClient
      .from('lead_appointments')
      .select('*', {count: 'exact', head: true})
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', nowIso),
    supabase
      .from('leads')
      .select('id, full_name, phone, status, assigned_to, created_at')
      .eq('status', 'new')
      .order('created_at', {ascending: false})
      .limit(5),
    supabase
      .from('leads')
      .select('id, full_name, phone, status, assigned_to, created_at')
      .in('status', ['new', 'contacted', 'qualified', 'viewing', 'negotiating'])
      .is('assigned_to', null)
      .order('created_at', {ascending: false})
      .limit(5),
    appointmentClient
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .eq('status', 'confirmed')
      .lt('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: false})
      .limit(5),
    appointmentClient
      .from('lead_appointments')
      .select('id, lead_id, status, scheduled_at')
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', nowIso)
      .order('scheduled_at', {ascending: true})
      .limit(5),
    supabase
      .from('locations')
      .select('*', {count: 'exact', head: true})
      .eq('status', 'active'),
    supabase
      .from('unit_types')
      .select('*', {count: 'exact', head: true})
      .eq('active', true),
    supabase
      .from('faqs')
      .select('*', {count: 'exact', head: true})
      .eq('active', true),
    supabase
      .from('blog_posts')
      .select('*', {count: 'exact', head: true})
      .eq('status', 'published')
  ]);

  const firstError = [
    ...statusCountResults.map((result) => result.error),
    upcomingCount.error,
    newLeadRows.error,
    unassignedRows.error,
    overdueRows.error,
    upcomingRows.error,
    locations.error,
    unitTypes.error,
    faqs.error,
    blogPosts.error
  ].find(Boolean);
  if (firstError) throw firstError;

  const byStatus = Object.fromEntries(
    operationalLeadStatuses.map((status, index) => [
      status,
      statusCountResults[index].count ?? 0
    ])
  ) as AdminDashboardStatusCounts;

  const appointmentRows = [
    ...(overdueRows.data ?? []),
    ...(upcomingRows.data ?? [])
  ];
  const appointmentLeadIds = [
    ...new Set(appointmentRows.map((row) => row.lead_id))
  ];

  const leadNames = new Map<string, string>();
  if (appointmentLeadIds.length > 0) {
    const leadIdentityResult = await supabase
      .from('leads')
      .select('id, full_name')
      .in('id', appointmentLeadIds);

    if (leadIdentityResult.error) throw leadIdentityResult.error;
    for (const row of leadIdentityResult.data ?? []) {
      leadNames.set(row.id, row.full_name);
    }
  }

  const appointments: AdminDashboardAppointmentItem[] = appointmentRows.flatMap((row) => {
    if (row.status !== 'pending' && row.status !== 'confirmed') return [];
    return [{
      id: row.id,
      leadId: row.lead_id,
      leadName: leadNames.get(row.lead_id) ?? null,
      status: row.status,
      scheduledAt: row.scheduled_at,
      overdue: row.status === 'confirmed' && Date.parse(row.scheduled_at) < now.getTime()
    }];
  });

  const health = normalizeAdminDashboardCounts({
    leads: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
    activeLocations: locations.count,
    activeUnitTypes: unitTypes.count,
    faqs: faqs.count,
    publishedBlogPosts: blogPosts.count
  });

  return {
    crm: summarizeAdminCrmCounts(byStatus, upcomingCount.count ?? 0),
    attention: {
      newLeads: (newLeadRows.data ?? []).map(projectDashboardLead),
      unassignedLeads: (unassignedRows.data ?? []).map(projectDashboardLead),
      appointments
    },
    health: {
      activeLocations: health.activeLocations,
      activeUnitTypes: health.activeUnitTypes,
      faqs: health.faqs,
      publishedBlogPosts: health.publishedBlogPosts
    }
  };
}
```

The two appointment queue queries are deliberately bounded at five rows each. The identity lookup is one batched `.in('id', appointmentLeadIds)` request, so this does not introduce an N+1 path. Do not compute a conversion rate in P2.7.

- [ ] **Step 5: Rebuild `app/admin/page.tsx` with Admin primitives**

Use:
- `AdminPageHeader`;
- five `AdminStatCard` cards at the top;
- an `AdminPanel` “Việc cần chú ý” containing new/unassigned leads and overdue/upcoming appointments;
- an `AdminPanel` “Pipeline” showing the seven status counts with links built as `/admin/leads?status=<status>`;
- an “Operational health” section using the existing active catalog/content counts.

Use explicit Vietnamese labels and links. Keep permission gating for CRM cards with `can(session.role, 'leads:read')`.

- [ ] **Step 6: Run dashboard and permission regressions**

Run:

```bash
npm run test:run -- tests/unit/admin-dashboard.test.ts tests/unit/permissions.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add features/admin/dashboard.ts app/admin/page.tsx tests/unit/admin-dashboard.test.ts
git commit -m "feat: expand admin operations dashboard"
```

---

### Task 3: Create one normalized URL/filter model for Leads

**Files:**
- Create: `features/admin/lead-workspace.ts`
- Modify: `features/admin/leads.ts`
- Create: `tests/unit/admin-lead-workspace.test.ts`
- Modify: `tests/unit/admin-leads.test.ts`

**Interfaces:**
- Produces:
  - `LeadWorkspaceView = 'table' | 'pipeline'`
  - `LeadWorkspaceFilters`
  - `normalizeLeadWorkspaceQuery(searchParams)`
  - `buildLeadWorkspaceHref(filters, patch)`
  - `leadStatusMeta`
  - `groupLeadsByStatus(leads)`
  - extended `AdminLeadRow` with `source`, `assignedTo`, and `updatedAt`.
  - extended `listAdminLeads({status, assignee, source, q, limit})`.
  - `listAdminLeadSources(): Promise<string[]>`.

- [ ] **Step 1: Write URL normalization and grouping tests**

Create `tests/unit/admin-lead-workspace.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {
  buildLeadWorkspaceHref,
  groupLeadsByStatus,
  normalizeLeadWorkspaceQuery
} from '@/features/admin/lead-workspace';

describe('lead workspace URL model', () => {
  it('normalizes view, status, assignee, source and search without inventing values', () => {
    expect(normalizeLeadWorkspaceQuery({
      view: 'pipeline',
      status: 'viewing',
      assignee: '51af3597-3eef-47a2-a008-2399be9ac8f6',
      source: 'website',
      q: '  Nguyễn An  '
    })).toEqual({
      view: 'pipeline',
      status: 'viewing',
      assignee: '51af3597-3eef-47a2-a008-2399be9ac8f6',
      source: 'website',
      q: 'Nguyễn An'
    });
  });

  it('falls back to table and drops invalid filter values', () => {
    expect(normalizeLeadWorkspaceQuery({
      view: 'grid',
      status: 'deleted',
      assignee: 'not-a-uuid',
      source: '   ',
      q: '   '
    })).toEqual({view: 'table'});
  });

  it('builds a shareable URL and omits the default table view', () => {
    expect(buildLeadWorkspaceHref(
      {view: 'pipeline', status: 'new', q: 'An'},
      {status: 'qualified'}
    )).toBe('/admin/leads?view=pipeline&status=qualified&q=An');

    expect(buildLeadWorkspaceHref(
      {view: 'table', status: 'new'},
      {status: undefined}
    )).toBe('/admin/leads');
  });
});

describe('lead pipeline grouping', () => {
  it('always exposes all seven columns in operational order', () => {
    const grouped = groupLeadsByStatus([
      {id: '1', status: 'viewing'},
      {id: '2', status: 'new'}
    ] as never);

    expect(Object.keys(grouped)).toEqual([
      'new',
      'contacted',
      'qualified',
      'viewing',
      'negotiating',
      'won',
      'lost'
    ]);
    expect(grouped.new.map((lead) => lead.id)).toEqual(['2']);
    expect(grouped.viewing.map((lead) => lead.id)).toEqual(['1']);
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
npm run test:run -- tests/unit/admin-lead-workspace.test.ts
```

Expected: FAIL because `lead-workspace.ts` does not exist.

- [ ] **Step 3: Implement the normalized workspace contract**

Create `features/admin/lead-workspace.ts` with:
- the exact seven status order;
- a single Vietnamese status-label/tone map;
- UUID validation for assignee filters;
- trim + max 80 characters for `q` and `source`;
- default `view: 'table'`;
- `URLSearchParams` serialization that omits empty/default values;
- `groupLeadsByStatus()` initialized with all seven empty arrays before adding rows.

Use this metadata everywhere later instead of page-local duplicate status maps.

- [ ] **Step 4: Extend `AdminLeadRow` and server filtering**

Modify `features/admin/leads.ts`:

```ts
export type AdminLeadRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  needType: string;
  status: OperationalLeadStatus;
  preferredLanguage: 'vi' | 'en';
  source: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLeadListOptions = {
  status?: OperationalLeadStatus;
  assignee?: string;
  source?: string;
  q?: string;
  limit?: number;
};
```

Update the Supabase select to include `source, assigned_to, updated_at`.

Apply filters in this order:
1. `status` with `eq`;
2. `assignee` with `eq('assigned_to', ...)`;
3. `source` with `eq('source', ...)`;
4. `q` with a sanitized PostgREST OR across `full_name`, `phone`, and `email`.

Use this concrete sanitizer before `or()`:

```ts
export function sanitizeLeadSearchTerm(value: string) {
  return value
    .trim()
    .slice(0, 80)
    .replace(/[,*()%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

Then apply:

```ts
const search = options.q ? sanitizeLeadSearchTerm(options.q) : '';
if (search) {
  query = query.or(
    'full_name.ilike.*' + search +
    '*,phone.ilike.*' + search +
    '*,email.ilike.*' + search + '*'
  );
}
```

Add `listAdminLeadSources()`:

```ts
export async function listAdminLeadSources(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('leads')
    .select('source')
    .not('source', 'is', null)
    .order('source', {ascending: true})
    .limit(100);

  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.source?.trim()).filter((value): value is string => Boolean(value)))];
}
```

- [ ] **Step 5: Add list-row regression assertions**

Extend `tests/unit/admin-leads.test.ts` with direct tests for `sanitizeLeadSearchTerm`:

```ts
it('sanitizes structural PostgREST search characters while preserving useful text', () => {
  expect(sanitizeLeadSearchTerm('  Nguyễn, An%_  ')).toBe('Nguyễn An');
  expect(sanitizeLeadSearchTerm('an@example.com')).toBe('an@example.com');
});
```

Keep all existing status validation tests unchanged.

- [ ] **Step 6: Run lead model tests and commit**

Run:

```bash
npm run test:run -- tests/unit/admin-lead-workspace.test.ts tests/unit/admin-leads.test.ts tests/unit/admin-lead-detail.test.ts
npm run typecheck
```

Expected: PASS.

Commit:

```bash
git add features/admin/lead-workspace.ts features/admin/leads.ts tests/unit/admin-lead-workspace.test.ts tests/unit/admin-leads.test.ts
git commit -m "feat: add shared lead workspace filters"
```

---

### Task 4: Replace the wide lead table with responsive Table/Card workspace

**Files:**
- Create: `components/admin/lead-filter-bar.tsx`
- Create: `components/admin/lead-list.tsx`
- Modify: `app/admin/leads/page.tsx`
- Create: `tests/unit/admin-lead-list.test.tsx`

**Interfaces:**
- Consumes:
  - `LeadWorkspaceFilters`
  - `AdminLeadRow[]`
  - `LeadAssigneeOption[]`
  - `listAdminLeadSources()`
  - `buildLeadWorkspaceHref()`.
- Produces:
  - `LeadFilterBar({filters, assignees, sources})`
  - `LeadList({leads, assigneeNames, canUpdate})`.

- [ ] **Step 1: Write a responsive semantic lead-list test**

Create `tests/unit/admin-lead-list.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {LeadList} from '@/components/admin/lead-list';

vi.mock('@/components/admin/lead-status-form', () => ({
  LeadStatusForm: ({status}: {status: string}) => <span>status:{status}</span>
}));

const lead = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: 'Nguyễn An',
  phone: '0900000000',
  email: 'an@example.com',
  message: 'Cần kho gần Tân Phú',
  needType: 'inventory',
  status: 'qualified' as const,
  preferredLanguage: 'vi' as const,
  source: 'website',
  utmSource: 'facebook',
  utmCampaign: null,
  assignedTo: '51af3597-3eef-47a2-a008-2399be9ac8f6',
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T04:00:00.000Z'
};

describe('admin lead list', () => {
  it('renders one desktop table and one mobile card representation from the same row', () => {
    render(
      <LeadList
        leads={[lead]}
        assigneeNames={new Map([[lead.assignedTo!, 'Nhân viên A']])}
        canUpdate
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('Nguyễn An').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Nhân viên A').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('link', {name: /mở hồ sơ/i}).length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-list.test.tsx
```

Expected: FAIL because `LeadList` does not exist.

- [ ] **Step 3: Implement `LeadFilterBar`**

The component is server-renderable and uses a GET form. It must include:
- search input `name="q"`;
- status select;
- assignee select;
- source select;
- hidden `view=pipeline` only when Pipeline is active;
- “Lọc” submit;
- “Xóa lọc” link that keeps the current view but clears filters;
- labels with 44 px controls.

Do not store filters in client state.

- [ ] **Step 4: Implement `LeadList`**

Use one data array to render:
- `hidden lg:block` semantic desktop table without a hard `min-w-[1050px]`;
- `grid gap-3 lg:hidden` mobile/tablet record cards.

Desktop columns:
- Lead;
- Nhu cầu;
- Nguồn;
- Trạng thái;
- Phụ trách;
- Cập nhật/action.

The lead identity cell combines name, phone, email, and created time. Message is a two/three-line preview rather than an unrestricted block.

Use `AdminStatusBadge` when the user cannot update status and `LeadStatusForm` when update permission exists.

- [ ] **Step 5: Recompose `app/admin/leads/page.tsx`**

Normalize the full query:

```tsx
const query = normalizeLeadWorkspaceQuery(await searchParams);
const [leads, assignees, sources] = await Promise.all([
  listAdminLeads({...query, limit: 100}),
  listLeadAssignees(),
  listAdminLeadSources()
]);
const assigneeNames = new Map(assignees.map((item) => [item.id, item.fullName]));
```

Render:
- `AdminPageHeader`;
- `LeadFilterBar`;
- a small “Tối đa 100 lead mới nhất phù hợp bộ lọc” context note;
- `LeadList` as the only rendered result view in this task.

The normalized `view` parameter already exists in the read model, but the UI does not expose the Pipeline toggle until Task 6 delivers a complete Pipeline. This keeps Task 4 independently usable instead of exposing an incomplete route state.

- [ ] **Step 6: Run tests and commit**

```bash
npm run test:run -- tests/unit/admin-lead-list.test.tsx tests/unit/admin-lead-workspace.test.ts tests/unit/admin-leads.test.ts
npm run typecheck
git add components/admin/lead-filter-bar.tsx components/admin/lead-list.tsx app/admin/leads/page.tsx tests/unit/admin-lead-list.test.tsx
git commit -m "feat: add responsive lead table workspace"
```

Expected: all focused tests pass.

---

### Task 5: Add visible CRM mutation feedback without changing validation rules

**Files:**
- Create: `features/admin/action-result.ts`
- Modify: `app/admin/leads/actions.ts`
- Modify: `components/admin/lead-status-form.tsx`
- Create: `components/admin/lead-assignment-form.tsx`
- Create: `components/admin/lead-note-form.tsx`
- Create: `tests/unit/admin-lead-actions-ui.test.tsx`
- Preserve: `tests/unit/admin-lead-operations.test.ts`

**Interfaces:**
- Produces:
  - `AdminActionResult = {ok: true} | {ok: false; message: string}`
  - `updateLeadStatusValue(leadId: string, status: string): Promise<AdminActionResult>`
  - `assignLeadValue(leadId: string, assigneeId: string): Promise<AdminActionResult>`
  - `addLeadNoteValue(leadId: string, note: string): Promise<AdminActionResult>`.
- Existing `prepareLeadStatusUpdate`, `prepareLeadAssignment`, and `prepareLeadNote` remain unchanged and authoritative.

- [ ] **Step 1: Write client-control RED tests**

Create `tests/unit/admin-lead-actions-ui.test.tsx`:

```tsx
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

const {updateLeadStatusValue} = vi.hoisted(() => ({
  updateLeadStatusValue: vi.fn()
}));

vi.mock('@/app/admin/leads/actions', () => ({
  updateLeadStatusValue
}));

import {LeadStatusForm} from '@/components/admin/lead-status-form';

describe('lead action feedback', () => {
  it('shows a visible message when a status mutation fails', async () => {
    updateLeadStatusValue.mockResolvedValueOnce({ok: false, message: 'Không thể cập nhật trạng thái.'});
    const user = userEvent.setup();

    render(
      <LeadStatusForm
        leadId="a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0"
        status="new"
      />
    );

    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'contacted');
    await user.click(screen.getByRole('button', {name: 'Lưu trạng thái'}));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Không thể cập nhật trạng thái.');
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-actions-ui.test.tsx
```

Expected: FAIL because the current component submits a native form and has no serializable result feedback.

- [ ] **Step 3: Add the shared action-result contract**

Create `features/admin/action-result.ts`:

```ts
export type AdminActionResult =
  | {ok: true}
  | {ok: false; message: string};

export function adminActionFailure(message: string): AdminActionResult {
  return {ok: false, message};
}
```

- [ ] **Step 4: Refactor lead actions around one private persistence path per mutation**

In `app/admin/leads/actions.ts` keep validation in existing prepare functions and create private persistence functions, for example:

```ts
async function performLeadStatusUpdate(role: AppRole, leadId: string, rawStatus: unknown) {
  const {leadId: validLeadId, status} = prepareLeadStatusUpdate(role, leadId, rawStatus);
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.from('leads').update({status}).eq('id', validLeadId);
  if (error) throw error;
  revalidateLeadWorkspace(validLeadId);
}

export async function updateLeadStatusValue(
  leadId: string,
  status: string
): Promise<AdminActionResult> {
  const session = await requireAdminUser();
  try {
    await performLeadStatusUpdate(session.role, leadId, status);
    return {ok: true};
  } catch {
    return {ok: false, message: 'Không thể cập nhật trạng thái. Vui lòng thử lại.'};
  }
}
```

Apply the same pattern to assignment and notes:
- private function validates and writes;
- client-callable wrapper returns a serializable result;
- no raw DB/security error is exposed to the browser;
- `revalidatePath('/admin')`, `/admin/leads`, and the detail route remain intact.

Keep FormData exports only if another existing call site still uses them. If all call sites migrate in this phase, remove the unused wrapper after `npm run typecheck` proves no imports remain.

- [ ] **Step 5: Convert status, assignment, and note controls to focused Client Components**

`LeadStatusForm`:
- `useTransition()`;
- controlled status value;
- explicit “Lưu trạng thái” button;
- `aria-live`/`role="alert"` error;
- disabled controls while pending;
- reset displayed error on success.

`LeadAssignmentForm`:
- receives `leadId`, current assignee, and options;
- calls `assignLeadValue`;
- uses “Chưa phân công” as empty string, server wrapper converts to `null`;
- shows visible error.

`LeadNoteForm`:
- receives `leadId`;
- max length 2000;
- calls `addLeadNoteValue`;
- clears textarea only on success;
- labels note as “Ghi chú nội bộ”.

- [ ] **Step 6: Run UI + domain mutation regressions**

```bash
npm run test:run -- tests/unit/admin-lead-actions-ui.test.tsx tests/unit/admin-leads.test.ts tests/unit/admin-lead-operations.test.ts
npm run typecheck
```

Expected: PASS, proving UI feedback changed while validation rules did not.

- [ ] **Step 7: Commit**

```bash
git add features/admin/action-result.ts app/admin/leads/actions.ts components/admin/lead-status-form.tsx components/admin/lead-assignment-form.tsx components/admin/lead-note-form.tsx tests/unit/admin-lead-actions-ui.test.tsx
git commit -m "feat: add CRM mutation feedback"
```

---

### Task 6: Add the seven-column Pipeline with explicit fallback and native drag/drop

**Files:**
- Create: `components/admin/lead-pipeline.tsx`
- Modify: `components/admin/lead-filter-bar.tsx`
- Modify: `app/admin/leads/page.tsx`
- Create: `tests/unit/admin-lead-pipeline.test.tsx`

**Interfaces:**
- Consumes:
  - `AdminLeadRow[]`
  - `groupLeadsByStatus()`
  - `leadStatusMeta`
  - `updateLeadStatusValue()`
  - `assigneeNames: Map<string, string>`.
- Produces: `LeadPipeline({leads, assigneeNames, canUpdate})`.

- [ ] **Step 1: Write Pipeline RED tests for columns and fallback**

Create `tests/unit/admin-lead-pipeline.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('@/app/admin/leads/actions', () => ({
  updateLeadStatusValue: vi.fn().mockResolvedValue({ok: true})
}));

import {LeadPipeline} from '@/components/admin/lead-pipeline';

const lead = {
  id: 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0',
  fullName: 'Nguyễn An',
  phone: '0900000000',
  email: null,
  message: null,
  needType: 'inventory',
  status: 'new' as const,
  preferredLanguage: 'vi' as const,
  source: 'website',
  utmSource: null,
  utmCampaign: null,
  assignedTo: null,
  createdAt: '2026-09-15T03:00:00.000Z',
  updatedAt: '2026-09-15T03:00:00.000Z'
};

describe('lead pipeline', () => {
  it('renders all seven operational columns even when most are empty', () => {
    render(<LeadPipeline leads={[lead]} assigneeNames={new Map()} canUpdate />);
    expect(screen.getByRole('heading', {name: 'Mới'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã liên hệ'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã xác nhận nhu cầu'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đang xem kho'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đang thương lượng'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Đã thuê'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Không chuyển đổi'})).toBeInTheDocument();
  });

  it('keeps an explicit status selector for non-drag interaction', () => {
    render(<LeadPipeline leads={[lead]} assigneeNames={new Map()} canUpdate />);
    expect(screen.getByLabelText('Chuyển trạng thái Nguyễn An')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
npm run test:run -- tests/unit/admin-lead-pipeline.test.tsx
```

Expected: FAIL because Pipeline does not exist.

- [ ] **Step 3: Implement the Client Component Pipeline**

Use native browser drag events, not a package.

State:
- `dragLeadId: string | null`;
- `optimisticStatusById: Record<string, OperationalLeadStatus>`;
- `error: string | null`;
- `pendingLeadId: string | null`.

Render:
- a horizontally scrollable Pipeline board only inside the Pipeline view; this horizontal scroll is intentional Kanban navigation, unlike the mobile Table requirement;
- seven fixed semantic sections in operational order;
- each card with name, phone, need type, assignee, source, created time, and detail link;
- an explicit labelled status `select` for every mutable card;
- read-only cards for users without `leads:update`.

Centralize status change in one client function:

```tsx
async function commitStatus(leadId: string, nextStatus: OperationalLeadStatus) {
  const current = effectiveStatus(leadId);
  if (current === nextStatus) return;

  setError(null);
  setPendingLeadId(leadId);
  setOptimisticStatusById((value) => ({...value, [leadId]: nextStatus}));

  try {
    const result = await updateLeadStatusValue(leadId, nextStatus);
    if (!result.ok) {
      setOptimisticStatusById((value) => {
        const next = {...value};
        delete next[leadId];
        return next;
      });
      setError(result.message);
      return;
    }
    router.refresh();
  } catch {
    setOptimisticStatusById((value) => {
      const next = {...value};
      delete next[leadId];
      return next;
    });
    setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
  } finally {
    setPendingLeadId(null);
  }
}
```

Both:
- `onChange` from the selector; and
- `onDrop` from a target column

must call `commitStatus()`.

Do not mutate local lead objects in place.

- [ ] **Step 4: Add the view toggle and switch the page between Table/Pipeline**

Update `LeadFilterBar` to render Table/Pipeline links with `buildLeadWorkspaceHref()` while preserving all current filters. Then update `app/admin/leads/page.tsx` to render:

```tsx
{query.view === 'pipeline' ? (
  <LeadPipeline
    leads={leads}
    assigneeNames={assigneeNames}
    canUpdate={canUpdate}
  />
) : (
  <LeadList
    leads={leads}
    assigneeNames={assigneeNames}
    canUpdate={canUpdate}
  />
)}
```

Keep the same `LeadFilterBar` above both views.

- [ ] **Step 5: Test the error rollback path**

Extend `admin-lead-pipeline.test.tsx` with a mocked failed `updateLeadStatusValue` and a selector-driven status change. Assert:
- alert text is shown;
- the card still exposes its original status after failure;
- detail link remains accessible.

This verifies the same rollback behavior used by drag/drop without relying on fragile JSDOM drag geometry.

- [ ] **Step 6: Run focused tests/typecheck and commit**

```bash
npm run test:run -- tests/unit/admin-lead-pipeline.test.tsx tests/unit/admin-lead-list.test.tsx tests/unit/admin-lead-actions-ui.test.tsx
npm run typecheck
git add components/admin/lead-pipeline.tsx components/admin/lead-filter-bar.tsx app/admin/leads/page.tsx tests/unit/admin-lead-pipeline.test.tsx
git commit -m "feat: add hybrid lead pipeline"
```

---

### Task 7: Rebuild Lead Detail as an adaptive CRM workspace

**Files:**
- Modify: `features/admin/lead-detail.ts`
- Create: `components/admin/lead-contact-header.tsx`
- Create: `components/admin/lead-operation-rail.tsx`
- Create: `components/admin/lead-context-panels.tsx`
- Modify: `app/admin/leads/[leadId]/page.tsx`
- Create: `tests/unit/admin-lead-detail-layout.test.tsx`
- Preserve: `tests/unit/admin-next-appointment.test.ts`

**Interfaces:**
- Consumes:
  - current `AdminLeadDetail`;
  - `AppointmentWorkspace`;
  - `selectNextAppointment()`;
  - `LeadStatusForm`;
  - `LeadAssignmentForm`.
- Produces:
  - `resolveLeadReferenceLabel(id, options): string | null`
  - `LeadContactHeader`
  - `LeadOperationRail`
  - `LeadContextPanels`.

- [ ] **Step 1: Write presentation-helper and layout RED tests**

Extend `tests/unit/admin-next-appointment.test.ts`:

```ts
import {resolveLeadReferenceLabel} from '@/features/admin/lead-detail';

it('resolves a readable reference label without inventing missing metadata', () => {
  expect(resolveLeadReferenceLabel(
    '30000000-0000-4000-8000-000000000001',
    [{id: '30000000-0000-4000-8000-000000000001', label: 'NupsBox Tân Phú'}]
  )).toBe('NupsBox Tân Phú');
  expect(resolveLeadReferenceLabel('missing', [])).toBeNull();
});
```

Create `tests/unit/admin-lead-detail-layout.test.tsx` with a focused render of `LeadContactHeader` and `LeadContextPanels` asserting:
- one H1 with the customer name;
- call link;
- email link when present;
- business-context heading;
- acquisition context rendered inside a native `details` element.

- [ ] **Step 2: Run the focused tests and verify RED**

```bash
npm run test:run -- tests/unit/admin-next-appointment.test.ts tests/unit/admin-lead-detail-layout.test.tsx
```

Expected: FAIL because the new helper/components do not exist.

- [ ] **Step 3: Add the pure label helper**

In `features/admin/lead-detail.ts`:

```ts
export type LabelOption = {id: string; label: string};

export function resolveLeadReferenceLabel(
  id: string | null,
  options: readonly LabelOption[]
): string | null {
  if (!id) return null;
  return options.find((option) => option.id === id)?.label ?? null;
}
```

Do not change `selectNextAppointment()` behavior.

- [ ] **Step 4: Implement Lead Detail presentation components**

`LeadContactHeader` renders:
- “CRM · LEAD DETAIL” eyebrow;
- customer name H1;
- created timestamp;
- preferred language;
- call link;
- email link only when present;
- back link to `/admin/leads`.

`LeadContextPanels` renders:
- business context first: need type, estimated volume, readable location, readable unit type, customer message;
- raw IDs only as subdued fallback when no readable label exists;
- acquisition context inside `<details>` with source, UTM source/medium/campaign/content, landing page, and referrer.

`LeadOperationRail` renders:
- current status/status control;
- `LeadAssignmentForm` or read-only assignee label;
- next actionable appointment summary;
- no raw assignee UUID;
- a class hook `admin-lead-operation-rail`.

- [ ] **Step 5: Add height-aware sticky behavior**

Add to `app/globals.css`:

```css
@media (min-width: 1280px) and (min-height: 820px) {
  .admin-lead-operation-rail {
    position: sticky;
    top: 1.5rem;
    align-self: start;
  }
}
```

At 1366×768 the rail remains normal-flow, preventing low-height clipping.

- [ ] **Step 6: Recompose `app/admin/leads/[leadId]/page.tsx`**

Continue to fetch:
- `getAdminLeadDetail(leadId)`;
- `listLeadAssignees()`;
- `getAdminAppointmentWorkspace(leadId)`.

Derive:
- `currentAssignee`;
- location/unit labels from appointment workspace options;
- full next appointment row by running `selectNextAppointment()` over `workspace.appointments` and matching its ID;
- actor map and unified timeline exactly as before.

Desktop composition:

```tsx
<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
  <div className="min-w-0 space-y-8">
    <LeadContactHeader ... />
    <LeadContextPanels ... />
    <AppointmentWorkspace ... />
    <LeadNoteForm ... />
    <LeadTimeline ... />
  </div>
  <LeadOperationRail ... />
</div>
```

On narrow screens the CSS grid collapses naturally to one column. Use CSS order utilities if needed so status/assignee appear immediately after the contact header on mobile; do not duplicate controls in the DOM.

- [ ] **Step 7: Run lead-detail regressions and commit**

```bash
npm run test:run -- tests/unit/admin-lead-detail-layout.test.tsx tests/unit/admin-next-appointment.test.ts tests/unit/admin-lead-detail.test.ts tests/unit/admin-lead-operations.test.ts
npm run typecheck
git add features/admin/lead-detail.ts components/admin/lead-contact-header.tsx components/admin/lead-operation-rail.tsx components/admin/lead-context-panels.tsx app/admin/leads/[leadId]/page.tsx app/globals.css tests/unit/admin-lead-detail-layout.test.tsx tests/unit/admin-next-appointment.test.ts
git commit -m "feat: add adaptive lead detail workspace"
```

---

### Task 8: Polish Appointment Workspace and Unified Timeline with visible mutation feedback

**Files:**
- Modify: `app/admin/leads/[leadId]/actions.ts`
- Modify: `components/admin/appointment-workspace.tsx`
- Create: `components/admin/lead-timeline.tsx`
- Modify: `features/admin/lead-timeline.ts`
- Modify: `tests/unit/lead-timeline.test.ts`
- Create: `tests/unit/admin-appointment-workspace-ui.test.tsx`

**Interfaces:**
- Produces:
  - `createAppointmentValue(formData: FormData): Promise<AdminActionResult>`
  - `updateAppointmentValue(formData: FormData): Promise<AdminActionResult>`
  - readable appointment event detail from `buildLeadTimeline()`
  - `LeadTimeline({items})`.

- [ ] **Step 1: Write readable timeline RED test**

Extend `tests/unit/lead-timeline.test.ts`:

```ts
it('maps appointment audit event types to readable Vietnamese labels', () => {
  const [item] = buildLeadTimeline({
    notes: [],
    statusHistory: [],
    appointmentHistory: [{
      id: 'a1',
      eventType: 'status_changed',
      changedByName: 'Nhân viên A',
      createdAt: '2026-09-15T04:00:00.000Z'
    }]
  });

  expect(item).toMatchObject({
    title: 'Lịch hẹn',
    detail: 'Đổi trạng thái',
    actorName: 'Nhân viên A'
  });
});
```

- [ ] **Step 2: Write Appointment Workspace semantic RED test**

Create `tests/unit/admin-appointment-workspace-ui.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AppointmentWorkspace} from '@/components/admin/appointment-workspace';
import type {AppointmentWorkspace as AppointmentWorkspaceModel} from '@/features/admin/appointment-read-model';

vi.mock('@/app/admin/leads/[leadId]/actions', () => ({
  createAppointmentValue: vi.fn().mockResolvedValue({ok: true}),
  updateAppointmentValue: vi.fn().mockResolvedValue({ok: true})
}));

const workspace: AppointmentWorkspaceModel = {
  appointments: [{
    id: '40000000-0000-4000-8000-000000000001',
    leadId: '10000000-0000-4000-8000-000000000002',
    locationId: '30000000-0000-4000-8000-000000000001',
    locationName: 'NupsBox Tân Phú',
    unitTypeId: '50000000-0000-4000-8000-000000000001',
    unitTypeName: 'Kho 3 m²',
    assignedTo: '20000000-0000-4000-8000-000000000001',
    assignedName: 'Nhân viên A',
    scheduledAt: '2026-09-20T02:30:00.000Z',
    durationMinutes: 30,
    status: 'confirmed',
    source: 'staff',
    customerNote: null,
    internalNote: null,
    createdBy: '20000000-0000-4000-8000-000000000001',
    createdAt: '2026-09-15T03:00:00.000Z',
    updatedAt: '2026-09-15T04:00:00.000Z'
  }],
  history: [{
    id: '60000000-0000-4000-8000-000000000001',
    appointmentId: '40000000-0000-4000-8000-000000000001',
    leadId: '10000000-0000-4000-8000-000000000002',
    changedBy: '20000000-0000-4000-8000-000000000001',
    changedByName: 'Nhân viên A',
    eventType: 'status_changed',
    beforeState: {},
    afterState: {},
    createdAt: '2026-09-15T04:00:00.000Z'
  }],
  locationOptions: [{id: '30000000-0000-4000-8000-000000000001', label: 'NupsBox Tân Phú'}],
  unitTypeOptions: [{id: '50000000-0000-4000-8000-000000000001', label: 'Kho 3 m²'}],
  assigneeOptions: [{id: '20000000-0000-4000-8000-000000000001', label: 'Nhân viên A', role: 'staff'}]
};

describe('admin appointment workspace presentation', () => {
  it('keeps Light Booking compact and moves audit history to the unified timeline', () => {
    render(
      <AppointmentWorkspace
        leadId="10000000-0000-4000-8000-000000000002"
        workspace={workspace}
        canMutate
      />
    );

    expect(screen.getByRole('heading', {name: 'Lịch xem kho'})).toBeInTheDocument();
    expect(screen.getByText('Tạo lịch xem kho')).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    expect(screen.getAllByText('NupsBox Tân Phú').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kho 3 m²').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nhân viên A').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('heading', {name: /lịch sử.*lịch hẹn/i})).not.toBeInTheDocument();
  });
});
```

The mocked server-action module ensures this test never touches Supabase.

- [ ] **Step 3: Run the focused tests and verify RED**

```bash
npm run test:run -- tests/unit/lead-timeline.test.ts tests/unit/admin-appointment-workspace-ui.test.tsx
```

Expected: FAIL on raw appointment event type and old always-open appointment form/history presentation.

- [ ] **Step 4: Make appointment timeline labels readable**

In `features/admin/lead-timeline.ts` add a fixed event label map:

```ts
const appointmentEventLabels: Record<string, string> = {
  created: 'Tạo lịch hẹn',
  rescheduled: 'Đổi thời gian',
  location_changed: 'Đổi địa điểm',
  unit_type_changed: 'Đổi loại kho',
  assignee_changed: 'Đổi người phụ trách',
  status_changed: 'Đổi trạng thái',
  details_changed: 'Cập nhật chi tiết'
};
```

Use `appointmentEventLabels[entry.eventType] ?? entry.eventType` for the timeline detail.

- [ ] **Step 5: Add safe appointment server-action results**

Keep all parsing and validation in:
- `appointmentCreatePayloadFromFormData`;
- `appointmentUpdatePayloadFromFormData`;
- `prepareAppointmentCreate`;
- `prepareAppointmentUpdate`;
- optimistic-concurrency guard.

Wrap the action boundary so the UI receives a safe Vietnamese result instead of a silent/uncaught mutation failure.

On success, preserve all three revalidations.

Map at least:
- `appointment_conflict` → “Lịch hẹn vừa được thay đổi bởi phiên khác. Hãy tải lại và thử lại.”
- validation/past-time errors → “Thông tin lịch hẹn chưa hợp lệ. Kiểm tra thời gian, trạng thái và người phụ trách.”
- unknown DB errors → “Không thể lưu lịch hẹn. Vui lòng thử lại.”

Do not weaken or bypass `AppointmentConflictError` or status-transition validation.

- [ ] **Step 6: Rebuild `AppointmentWorkspace`**

Presentation:
1. section header with “LIGHT BOOKING CRM”;
2. next actionable appointment card at the top when present;
3. native `<details>` disclosure labelled “Tạo lịch xem kho” for mutable users;
4. compact appointment cards;
5. edit controls inside each non-terminal appointment disclosure;
6. no duplicate appointment audit list in this component.

Mutation UX:
- convert `components/admin/appointment-workspace.tsx` to a Client Component;
- submit create/update forms with `onSubmit`, `new FormData(event.currentTarget)`, and the safe `createAppointmentValue` / `updateAppointmentValue` server actions;
- keep one local pending identifier (`'create'` or appointment id) and one local error message;
- disable only the form currently being submitted;
- show `role="alert"` on failure;
- call `router.refresh()` after a successful result;
- keep entered values on failure;
- preserve all current fields and max lengths.

Use this concrete submit shape inside the component:

```tsx
async function submitAppointment(
  key: string,
  form: HTMLFormElement,
  action: (formData: FormData) => Promise<AdminActionResult>
) {
  setPendingKey(key);
  setError(null);
  try {
    const result = await action(new FormData(form));
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  } finally {
    setPendingKey(null);
  }
}
```

Keep the explicit text “Tạo lịch chờ xác nhận” so the interface does not imply reservation.

- [ ] **Step 7: Implement `LeadTimeline` component**

Render `LeadTimelineItem[]` as one chronological list:
- icon/marker by `kind`;
- title;
- detail;
- actor name when present;
- formatted timestamp in `Asia/Ho_Chi_Minh`;
- empty state when no events exist;
- meaning does not depend on color.

- [ ] **Step 8: Run appointment/timeline/domain tests and commit**

```bash
npm run test:run -- tests/unit/lead-timeline.test.ts tests/unit/admin-appointment-workspace-ui.test.tsx tests/unit/admin-appointments.test.ts tests/unit/admin-appointment-form.test.ts tests/unit/admin-appointment-persistence.test.ts tests/unit/admin-appointment-read-model.test.ts tests/unit/admin-next-appointment.test.ts
npm run typecheck
git add app/admin/leads/[leadId]/actions.ts components/admin/appointment-workspace.tsx components/admin/lead-timeline.tsx features/admin/lead-timeline.ts tests/unit/lead-timeline.test.ts tests/unit/admin-appointment-workspace-ui.test.tsx
git commit -m "feat: polish appointments and CRM timeline"
```

Expected: all existing appointment domain tests stay green.

---

### Task 9: Apply the Admin design system consistently to Catalog and Content

**Files:**
- Modify: `app/admin/catalog/page.tsx`
- Modify: `app/admin/catalog/locations/page.tsx`
- Modify: `app/admin/catalog/unit-types/page.tsx`
- Modify: `app/admin/catalog/pricing/page.tsx`
- Modify: `components/admin/catalog-tables.tsx`
- Modify: `components/admin/location-form.tsx`
- Modify: `components/admin/unit-type-form.tsx`
- Modify: `components/admin/pricing-form.tsx`
- Modify: `app/admin/content/page.tsx`
- Modify: `app/admin/content/faq/page.tsx`
- Modify: `app/admin/content/blog/page.tsx`
- Modify: `app/admin/content/blog/[id]/page.tsx`
- Modify: `app/admin/content/media/page.tsx`
- Modify: `app/admin/content/settings/page.tsx`
- Modify: `components/admin/faq-form.tsx`
- Modify: `components/admin/blog-form.tsx`
- Modify: `components/admin/media-metadata-form.tsx`
- Modify: `components/admin/site-setting-form.tsx`.
- Create: `tests/unit/admin-responsive-lists.test.tsx`.
- Preserve existing:
  - `tests/unit/admin-catalog.test.ts`
  - `tests/unit/admin-catalog-mutations.test.ts`
  - `tests/unit/admin-content.test.ts`
  - `tests/unit/admin-content-mutations.test.ts`
  - `tests/unit/admin-blog.test.ts`
  - `tests/unit/admin-settings.test.ts`.

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminPanel`, `AdminStatusBadge`, `AdminFieldGroup`, `AdminEmptyState`.
- Produces no new business/data interfaces.

- [ ] **Step 1: Write a responsive-list RED test around `CatalogTables`**

Create `tests/unit/admin-responsive-lists.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {CatalogTables} from '@/components/admin/catalog-tables';
import type {AdminCatalog} from '@/features/admin/catalog';

const catalog: AdminCatalog = {
  locations: [{
    id: 'loc-1',
    slug: 'tan-phu',
    nameVi: 'NupsBox Tân Phú',
    nameEn: 'NupsBox Tan Phu',
    district: 'Tân Phú',
    status: 'active',
    isFeatured: true,
    sortOrder: 0
  }],
  unitTypes: [{
    id: 'unit-1',
    slug: 'kho-s',
    nameVi: 'Kho S',
    nameEn: 'S Unit',
    areaM2: 3,
    active: true,
    sortOrder: 0
  }],
  pricing: [{
    id: 'price-1',
    locationId: 'loc-1',
    unitTypeId: 'unit-1',
    monthlyPrice: 1_000_000,
    promoPrice: null,
    depositAmount: null,
    availabilityStatus: 'available',
    availableCount: null,
    featured: false
  }]
};

describe('admin responsive catalog lists', () => {
  it('renders desktop tables and mobile cards from the same catalog data', () => {
    const {container} = render(<CatalogTables catalog={catalog} />);

    expect(container.querySelectorAll('[data-admin-desktop-table]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-admin-mobile-list]')).toHaveLength(3);
    expect(screen.getAllByText('NupsBox Tân Phú').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Kho S').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Có thể tư vấn').length).toBeGreaterThanOrEqual(2);
  });
});
```

The assertions intentionally verify structural responsive alternatives and readable data, not pixels.

- [ ] **Step 2: Run the responsive-list test and verify RED**

```bash
npm run test:run -- tests/unit/admin-responsive-lists.test.tsx
```

Expected: FAIL because current Catalog tables only render wide desktop tables.

- [ ] **Step 3: Migrate Catalog summary/list pages to shared Admin primitives**

In `app/admin/catalog/page.tsx`, replace the bespoke intro with:

```tsx
<AdminPageHeader
  eyebrow="CATALOG"
  title="Kho & bảng giá"
  description="Quản lý địa điểm, loại kho và dữ liệu giá vận hành."
/>
```

In `components/admin/catalog-tables.tsx`, keep the three existing data collections and maps. For **locations**, render both structures from `catalog.locations`:

```tsx
<div data-admin-desktop-table className="hidden lg:block">
  <table className="w-full text-left text-sm">
    <thead>
      <tr>
        <th scope="col">Tên</th>
        <th scope="col">Quận</th>
        <th scope="col">Trạng thái</th>
        <th scope="col">Slug</th>
      </tr>
    </thead>
    <tbody>
      {catalog.locations.map((location) => (
        <tr key={location.id}>
          <td>{location.nameVi}<span className="block text-xs">{location.nameEn}</span></td>
          <td>{location.district}</td>
          <td>{location.status}</td>
          <td>{location.slug}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div data-admin-mobile-list className="grid gap-3 lg:hidden">
  {catalog.locations.map((location) => (
    <article key={location.id} className="rounded-xl border border-[var(--nupsbox-border)] p-4">
      <h3 className="font-black text-[var(--nupsbox-navy)]">{location.nameVi}</h3>
      <p className="mt-1 text-sm text-[var(--nupsbox-slate)]">{location.district} · {location.status}</p>
      <p className="mt-2 font-mono text-xs text-[var(--nupsbox-slate)]">{location.slug}</p>
    </article>
  ))}
</div>
```

For **unit types**, use `catalog.unitTypes` in both desktop/mobile structures and show `nameVi`, `nameEn`, `areaM2`, `active ? 'Có' : 'Không'`, and `slug`.

For **pricing**, use `catalog.pricing` in both structures and show the same resolved `locationNames`, `unitNames`, `formatAdminPrice(monthlyPrice)`, `formatAdminPrice(promoPrice)`, and `adminAvailabilityLabel(availabilityStatus)` values already used by the current table.

Each desktop wrapper must carry `data-admin-desktop-table`; each mobile wrapper must carry `data-admin-mobile-list`. Remove the old mandatory `min-w-[720px]` / `min-w-[900px]` wrappers. Preserve the existing operational-availability disclaimer.

- [ ] **Step 4: Migrate Catalog edit pages/forms without changing actions**

For Locations, Unit Types, and Pricing pages, replace each page intro with `AdminPageHeader`. In each existing form component, keep the current action and props but wrap fields by purpose:

```tsx
<AdminPanel title={editing ? 'Chỉnh sửa' : 'Tạo mới'}>
  <form action={existingAction} className="grid gap-5">
    <AdminFieldGroup legend="Thông tin chính">
      <div className="grid gap-4 md:grid-cols-2">{/* existing primary fields */}</div>
    </AdminFieldGroup>
    <AdminFieldGroup legend="Hiển thị & vận hành">
      <div className="grid gap-4 md:grid-cols-2">{/* existing status/publish fields */}</div>
    </AdminFieldGroup>
    {/* existing permission-gated submit/publish controls */}
  </form>
</AdminPanel>
```

Do not rename form field names, action imports, permission props, publication rules, or slug-lock behavior. Do not add bulk actions or import flows.

Run:

```bash
npm run test:run -- tests/unit/admin-catalog.test.ts tests/unit/admin-catalog-mutations.test.ts
```

Expected: PASS before continuing to Content.

- [ ] **Step 5: Migrate Content pages/forms**

For Content overview, FAQ, Blog, Media, and Settings:
- use `AdminPageHeader` on every page;
- wrap major sections in `AdminPanel`;
- render draft/published/active state through `AdminStatusBadge`;
- wrap existing fieldsets with `AdminFieldGroup` while preserving every current field name and server action;
- render the Content overview media rows as desktop table + mobile cards using the same `data-admin-desktop-table` / `data-admin-mobile-list` contract;
- keep Settings limited to the existing allowlisted keys;
- keep Media metadata-only.

Use these concrete state mappings while keeping the existing permission-gated action forms:

```tsx
// FAQ
<AdminStatusBadge
  label={faq.active ? 'Đang hiển thị' : 'Bản nháp'}
  tone={faq.active ? 'success' : 'neutral'}
/>

// Blog
<AdminStatusBadge
  label={blog.status === 'published' ? 'Đã xuất bản' : blog.status === 'archived' ? 'Đã lưu trữ' : 'Bản nháp'}
  tone={blog.status === 'published' ? 'success' : 'neutral'}
/>

// Media
<AdminStatusBadge
  label={media.isPublic ? 'Công khai' : 'Nội bộ'}
  tone={media.isPublic ? 'success' : 'neutral'}
/>
```

Keep the existing `setFaqPublication`, `setBlogStatus`, metadata update, and settings update forms exactly permission-gated as they are now. Settings need no invented publication badge: group existing allowlisted keys under `AdminPanel` / `AdminFieldGroup` only.

Do not alter CMS publication semantics, upload capability, delete capability, or settings contracts.

- [ ] **Step 6: Run all Catalog/Content regressions**

```bash
npm run test:run -- tests/unit/admin-responsive-lists.test.tsx tests/unit/admin-catalog.test.ts tests/unit/admin-catalog-mutations.test.ts tests/unit/admin-content.test.ts tests/unit/admin-content-mutations.test.ts tests/unit/admin-blog.test.ts tests/unit/admin-settings.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/admin/catalog components/admin/catalog-tables.tsx components/admin/location-form.tsx components/admin/unit-type-form.tsx components/admin/pricing-form.tsx app/admin/content components/admin/faq-form.tsx components/admin/blog-form.tsx components/admin/media-metadata-form.tsx components/admin/site-setting-form.tsx tests/unit/admin-responsive-lists.test.tsx
git commit -m "feat: unify admin catalog and content UX"
```

---

### Task 10: Harden responsive/accessibility contracts without weakening authentication

**Files:**
- Modify: `components/admin/admin-shell.tsx`
- Modify: `components/admin/lead-filter-bar.tsx`
- Modify: `components/admin/lead-list.tsx`
- Modify: `components/admin/lead-pipeline.tsx`
- Modify: `components/admin/lead-operation-rail.tsx`
- Modify: `components/admin/appointment-workspace.tsx`
- Modify: `app/globals.css`
- Create: `tests/unit/admin-shell-accessibility.test.tsx`
- Modify: `tests/unit/admin-ui-primitives.test.tsx`
- Modify: `tests/unit/admin-lead-list.test.tsx`
- Modify: `tests/unit/admin-lead-pipeline.test.tsx`
- Preserve: `tests/unit/private-route-metadata.test.ts`
- Do not add an auth bypass route.

**Interfaces:**
- No new business interfaces.
- Accessibility contract becomes part of existing components.

- [ ] **Step 1: Add concrete accessibility regression tests before fixes**

Create `tests/unit/admin-shell-accessibility.test.tsx`:

```tsx
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AdminShell} from '@/components/admin/admin-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/leads'
}));

const groups = [
  {label: 'Tổng quan', items: [{href: '/admin', label: 'Dashboard', action: 'dashboard:read' as const}]},
  {label: 'CRM', items: [{href: '/admin/leads', label: 'Khách hàng', action: 'leads:read' as const}]}
];

describe('admin shell accessibility', () => {
  it('names navigation controls and marks the active route', () => {
    render(
      <AdminShell role="staff" userLabel="Nhân viên A" groups={groups}>
        <main>Nội dung</main>
      </AdminShell>
    );

    expect(screen.getByRole('button', {name: 'Mở menu quản trị'})).toHaveClass('min-h-11', 'min-w-11');
    expect(screen.getByRole('button', {name: 'Thu gọn menu quản trị'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Đóng menu quản trị'})).toBeInTheDocument();

    const activeLinks = screen.getAllByRole('link', {name: 'Khách hàng'});
    expect(activeLinks.some((link) => link.getAttribute('aria-current') === 'page')).toBe(true);
  });
});
```

Also add these exact assertions to the existing focused tests:

```tsx
// admin-lead-list.test.tsx
expect(screen.getAllByRole('link', {name: /mở hồ sơ/i}).length).toBeGreaterThanOrEqual(1);

// admin-lead-pipeline.test.tsx
expect(screen.getByLabelText('Chuyển trạng thái Nguyễn An')).toHaveClass('min-h-11');

// admin-lead-actions-ui.test.tsx after a mocked failure
expect(screen.getByRole('alert')).toBeVisible();

// admin-ui-primitives.test.tsx
expect(screen.getByText('Mới')).toHaveTextContent('Mới');
```

Any icon-only control introduced by the implementation must receive an explicit Vietnamese `aria-label`; do not add an icon-only control without extending the focused test that renders it.

- [ ] **Step 2: Run the focused UI tests and observe any RED assertions**

```bash
npm run test:run -- tests/unit/admin-shell-accessibility.test.tsx tests/unit/admin-ui-primitives.test.tsx tests/unit/admin-lead-list.test.tsx tests/unit/admin-lead-pipeline.test.tsx tests/unit/admin-lead-actions-ui.test.tsx tests/unit/admin-appointment-workspace-ui.test.tsx
```

Expected: any missing accessible labels/touch-size contracts fail before hardening.

- [ ] **Step 3: Fix the shared components**

Ensure:
- native dialog receives a visible heading and close control;
- active nav uses `aria-current="page"`;
- focus-visible outlines remain visible;
- drag affordance does not replace the selector;
- Pipeline cards set `draggable={canUpdate && !pending}` only;
- all form fields have labels;
- no `outline-none` without an explicit focus replacement;
- reduced motion disables nonessential Admin transitions via the existing global reduced-motion rule.

- [ ] **Step 4: Run full unit/integration suite**

```bash
npm run test:run
```

Expected: PASS with all existing and P2.7 tests.

- [ ] **Step 5: Run lint, typecheck, and production build**

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: all PASS. Fix warnings/errors before continuing; do not suppress lint/type errors to make the gate green.

- [ ] **Step 6: Confirm the scope diff contains no forbidden changes**

Run:

```bash
git diff --name-only main...HEAD
git diff --name-only main...HEAD | grep '^supabase/migrations/' && exit 1 || true
git diff --name-only main...HEAD | grep -E '(^|/)seed' && exit 1 || true
git diff main...HEAD -- package.json package-lock.json
```

Expected:
- no migration path;
- no production seed file;
- no package dependency change for chart/DnD;
- no domain/canonical cutover file change.

- [ ] **Step 7: Commit responsive/accessibility hardening**

```bash
git add components/admin app/admin app/globals.css tests/unit/admin-shell-accessibility.test.tsx tests/unit/admin-ui-primitives.test.tsx tests/unit/admin-lead-list.test.tsx tests/unit/admin-lead-pipeline.test.tsx tests/unit/admin-lead-actions-ui.test.tsx tests/unit/admin-appointment-workspace-ui.test.tsx
git commit -m "test: harden admin responsive accessibility"
```

---

### Task 11: Run CI/Preview gates, inspect exact-head runtime, and prepare the PR

**Files:**
- No implementation file should change unless a failing gate exposes a real defect.
- If a defect is found, return to the owning task, write/extend the failing regression first, fix it, and create a focused fix commit.

**Interfaces:**
- Consumes the complete P2.7 branch.
- Produces a reviewable exact-head PR with verifiable green gates.

- [ ] **Step 1: Rebase/update from latest `main` before final verification**

Run:

```bash
git fetch origin
git rebase origin/main
```

Expected: clean rebase. If conflicts occur, resolve them without dropping the approved spec/plan constraints, rerun Task 10 gates, then continue.

- [ ] **Step 2: Run the final local quality matrix**

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

Expected:
- lint PASS;
- typecheck PASS;
- all Vitest tests PASS;
- Next production build PASS;
- public Playwright suite PASS;
- no focused `.only` test.

- [ ] **Step 3: Run local Database Tests when Supabase CLI is available**

```bash
test -f supabase/config.toml || supabase init
supabase db start
supabase test db
supabase stop --no-backup
```

Expected: pgTAP schema/RLS contracts PASS. P2.7 should not require any schema reset or migration change.

- [ ] **Step 4: Push the exact branch head and open/update one P2.7 PR**

Use:
- branch: `codex/p27-admin-ux-crm-operations-polish`;
- base: `main`;
- title: `feat: P2.7 admin UX and CRM operations polish`.

PR body must state:
- no DB migration;
- no production seed;
- no domain cutover;
- CRM statuses/RBAC/RLS preserved;
- Table + Pipeline use one filter model;
- DnD is optional and explicit selector remains;
- authenticated Admin E2E was not created by weakening auth or embedding production credentials.

- [ ] **Step 5: Verify GitHub Actions on the exact PR head**

Required checks:
- `CI / quality`;
- `CI / preview-smoke`;
- `Database Tests / database`;
- `P2.5 E2E / playwright`.

Expected: all PASS for the same head SHA.

If an implementation commit is added after any green run, treat old runs as stale and wait for the new exact-head runs.

- [ ] **Step 6: Verify the exact-head Vercel Preview**

Confirm:
- deployment state READY;
- deployment SHA equals PR head SHA;
- public Preview smoke remains green;
- anonymous `/admin` redirects to `/auth/login` or the approved Vercel auth barrier;
- no protected Admin lead/contact data is present in the anonymous response;
- Admin remains `noindex` through the existing metadata contract.

Do not add test credentials or bypass auth to make this easier.

- [ ] **Step 7: Inspect Preview runtime logs**

Inspect the exact Preview deployment for verification traffic and confirm no runtime `error`/`fatal` entries caused by P2.7.

If logs expose a real defect:
1. add a regression where feasible;
2. fix on the same branch;
3. rerun all exact-head checks.

- [ ] **Step 8: Final diff audit**

Verify:
- no `supabase/migrations/**` change;
- no production data seed;
- no `nupsbox.vn` cutover;
- no payment/inventory/calendar/messaging feature;
- no new chart/DnD dependency;
- no removal of `PRIVATE_AREA_METADATA`;
- no weakening of `requireAdminUser()`, permission checks, or RLS assumptions.

- [ ] **Step 9: Merge only after exact-head gates are green**

Use the repository’s established merge style. After merge:
- wait for the production deployment tied to the merge SHA;
- run the existing production smoke;
- verify anonymous `/admin` protection;
- inspect production error/fatal logs for smoke traffic.

P2.7 does not authorize seeding business data or cutting over `nupsbox.vn` after merge.

---

## Self-Review Results

### Spec coverage

- Admin adaptive sidebar/mobile drawer: Task 1.
- Shared Admin visual primitives: Task 1.
- Executive + Operations Dashboard: Task 2.
- CRM KPI/work queues/pipeline snapshot/health: Task 2.
- Shared URL Table/Pipeline filter model: Task 3.
- Name/phone/email search, status/assignee/source filters: Tasks 3–4.
- Responsive Table and mobile lead cards: Task 4.
- Visible status/assignment/note mutation feedback: Task 5.
- Seven-status Pipeline, explicit selector, optional DnD, rollback: Task 6.
- Adaptive Lead Detail and low-height sticky rule: Task 7.
- Readable location/unit/assignee context: Task 7.
- Light Booking appointment presentation and safe errors: Task 8.
- Unified readable CRM timeline: Task 8.
- Catalog/Content consistency without CMS expansion: Task 9.
- Responsive/accessibility hardening, named shell controls, active-route semantics, 44 px controls: Task 10.
- No DB migration/seed/domain cutover/dependency expansion: Global Constraints + Tasks 10–11.
- Auth/noindex/RBAC/RLS preservation: Global Constraints + Task 11.
- Unit/integration/build/E2E/DB/Preview/runtime verification: Tasks 10–11.

### Type/interface consistency

- `OperationalLeadStatus` remains sourced from `features/admin/leads.ts`.
- `leadStatusMeta` and grouping live in one workspace module and are reused by Table/Pipeline.
- Client status mutations call `updateLeadStatusValue()` and server validation still calls `prepareLeadStatusUpdate()`.
- Assignment/note controls reuse existing preparation functions.
- Appointment actions reuse current appointment payload/domain preparation functions.
- `AdminActionResult` is the common serializable client mutation result.
- `AdminDashboardSummary` does not replace lead/appointment domain types.
- No task introduces a second CRM status enum or new persisted business state.

### Placeholder scan

Automated red-flag scanning returns zero deferred-work markers and no vague test-only follow-ups. Each implementation task names concrete files, interfaces, test expectations, commands, and acceptance behavior.
