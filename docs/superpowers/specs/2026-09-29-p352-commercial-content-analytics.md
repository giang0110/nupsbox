# P3.52 — Commercial Content Expansion & Conversion Analytics

## Goal

Extend P3.51 without changing the CRM security model or public lead contract.

## Scope

### Commercial CMS
- Keep `content_blocks` as the storage model and keep the fixed commercial allowlist.
- Add four editable bilingual service-card blocks:
  - `service_shop_online`
  - `service_small_business`
  - `service_inventory`
  - `service_personal`
- Add page-specific bilingual SEO blocks:
  - `seo_solutions`
  - `seo_about`
  - `seo_contact`
- Preserve safe application defaults whenever CMS reads fail or a block is inactive.
- Do not introduce arbitrary CMS keys or arbitrary JSON editors.

### CRM workspace
- Add `inquiry_type` as a shareable URL filter in the lead workspace.
- Apply the same filter to table, pipeline and CSV export.
- Preserve search sanitization, role checks and export formula-injection protection.

### Analytics
- Add a non-PII breakdown by `inquiry_type`.
- Restrict the legacy need-type breakdown to `storage` enquiries so commercial enquiries do not pollute storage-demand analytics.
- Keep exact KPI/status counts and the 1,000-row bounded breakdown sample.

### SEO
- Homepage SEO remains driven by the existing `seo` block.
- Solutions, About and Contact metadata use their dedicated CMS blocks with resilient defaults.

## Non-goals
- No change to public lead rate limiting.
- No change to RLS role semantics.
- No new analytics cookie or PII tracking.
- No arbitrary page builder.
- No removal of legacy storage routes.

## Release gate
1. Unit/type/lint/build green.
2. Database tests green.
3. Apply the P3.52 seed migration to production.
4. Verify seeded blocks and existing P3.51 policies.
5. Merge and verify Vercel production smoke.
