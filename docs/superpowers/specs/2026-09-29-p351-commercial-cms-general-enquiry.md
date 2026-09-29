# P3.51 — Commercial CMS & General Enquiry

## Goals

1. Move the core public commercial copy out of hard-coded components and into the existing `content_blocks` CMS.
2. Give staff/admin a safe, allowlisted editor for company profile, services, capabilities, commercial CTA and SEO.
3. Turn the public contact form into a general commercial enquiry form.
4. Preserve storage-specific questions and appointment flows only when they are relevant.
5. Keep the existing CRM, attribution, rate limiting, RLS and audit guarantees.

## Commercial CMS blocks

All managed rows use `page_key = commercial` and one of these fixed block keys:

- `company_profile`
- `services`
- `capabilities`
- `commercial_cta`
- `seo`

The UI does not allow arbitrary block keys. Content is bilingual and validated at the application boundary.

## General enquiry categories

Structured lead field `inquiry_type`:

- `service_advice`
- `quote`
- `partnership`
- `facility_info`
- `storage`
- `other`

Storage need and estimated volume fields are shown only for `storage`. Viewing appointment mode forces the storage enquiry category.

## Security

- public reads remain limited to active content blocks
- content mutation is available to authenticated admin/staff only
- every commercial block insert/update is audited
- no secrets or arbitrary site-setting keys are exposed
- lead API origin checks, payload limits, validation and rate limiting remain unchanged
