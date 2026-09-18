# P3.5 Facebook Source & Contact Integration

Date: 2026-09-18
Base: `main@ad1fb7d0f129bb34fbb97d8ae4dc63bd50ed9e93`

## Goal
Connect the user-provided public Facebook source to NupsBox without inventing facts or hotlinking unverified Facebook media.

## Source constraint
The supplied Facebook share URL is blocked to public crawlers in the current environment. The URL itself is user-provided and may be stored as a public source/contact link. Phone, address, captions and image bytes must not be inferred from it.

## Scope
- Extend the allowlisted `public_contact` JSON with optional email and Facebook URL while preserving opening-hours data.
- Let Admin edit the allowlisted setting even when no database row exists; save via upsert.
- Expose Facebook in footer, mobile quick actions as a fallback contact, Contact page, lead-form error fallback and About media section.
- Track Facebook clicks with non-sensitive `click_facebook` events containing placement only.
- About Gallery may link to the Facebook media source but does not display external Facebook image bytes unless a durable, location-scoped asset is imported.
- Do not emit the Facebook share URL as Schema.org `sameAs` until a canonical page/profile URL is verified.

## Production data
After exact-head gates pass, store the user-provided URL in production `public_contact.facebook_url` using a JSON merge/upsert that preserves any other contact values.

## Image ingestion follow-up
Actual Facebook photos/captions require an authenticated browser connector or user-provided images because Facebook blocks this share URL from the public crawler. Imported images should be copied into a durable NupsBox-controlled asset location and mapped to the correct facility; do not hotlink expiring Facebook CDN URLs.
