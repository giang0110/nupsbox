# P3.50 — Commercial Information Website Pivot

## Objective

Reposition the public NupsBox website from a booking-first mini-storage funnel into an information-first commercial website while preserving the existing admin, CRM, CMS, catalog, media, analytics and Supabase foundations.

## Public information architecture

Primary navigation:

1. Services
2. Facilities & capability
3. News / articles
4. About NupsBox
5. Contact

Legacy storage, pricing and booking routes remain available for compatibility and detailed reference, but they are no longer the primary site navigation.

## Homepage

The homepage must explain the company and its offer before asking for conversion. The primary flow is:

Commercial overview → real facility information → published proof/data → location → FAQ → contact.

The Storage Finder is removed from the homepage primary flow. Existing finder and quote logic can continue to support legacy/detail routes.

## Conversion model

Primary CTA becomes commercial contact / consultation instead of “find storage”.

The site should avoid presenting price, availability or operational claims as guaranteed facts. Pricing and availability remain confirmation-time information.

## SEO

Default metadata should describe NupsBox as a commercial information website for storage services in Ho Chi Minh City. Existing service/detail routes can remain indexed when their data is published.

## Back office

No destructive database changes are required for this pivot. Keep:

- Supabase schema and RLS
- Admin users and roles
- CRM leads and audit trail
- Media CMS
- Blog/FAQ CMS
- Locations, unit types and pricing data
- Analytics and operational monitoring

Future admin work may add a dedicated company-profile/capability content model, but this phase reuses existing CMS and settings.
