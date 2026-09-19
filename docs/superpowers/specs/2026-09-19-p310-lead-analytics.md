# P3.10 Lead Analytics & Conversion Intelligence

Date: 2026-09-19
Base: `main@48a3de284e5d86fb94b91a3920df8ca593ff7925`

## Goal

Give Admin a privacy-safe view of lead acquisition and CRM conversion using data already stored with lead requests.

## Scope

- Add `/admin/analytics` for roles that already have `leads:read`.
- Reporting windows: 7, 30 and 90 days, aligned to midnight Asia/Ho_Chi_Minh.
- Exact KPI/funnel counts by the existing seven CRM statuses.
- Aggregated breakdowns for UTM/source, campaign, landing page, need type and preferred language.
- Daily lead trend.
- Dashboard Quick Action and Admin navigation entry.

## Privacy

Analytics queries do not select or render:

- full name;
- phone;
- email;
- lead message;
- raw referrer URL.

Landing pages are normalized to path-only values before aggregation.

## Scale behavior

Exact total/status counts use count queries. Breakdown/trend rows are capped at the 1,000 newest leads in the selected window. If the period exceeds that sample, the UI explicitly says breakdowns are sampled while KPI/funnel counts remain exact.

## Guardrails

- Preserve exactly seven CRM statuses.
- No database migration.
- No new tracking cookies or identifiers.
- No Auth/RBAC/RLS changes.
- No changes to lead capture payload.
