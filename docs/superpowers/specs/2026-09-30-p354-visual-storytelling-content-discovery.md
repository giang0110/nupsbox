# P3.54 — Visual Storytelling & Content Discovery

## Goal
Make the editorial experience easier to scan, more visually distinctive, and better at moving readers from one useful article to the next without lengthening the homepage.

## Scope
- Add an application-level editorial taxonomy without changing Supabase schema.
- Give seeded editorial articles recognizable visual identities and topic labels.
- Add topic filtering to the Blog Hub.
- Add article table of contents with stable heading anchors.
- Rank related reading by editorial topic before falling back to recency.
- Use real blog cover media when present; otherwise render a branded editorial cover.
- Preserve bilingual routes, SEO, public CMS, RLS and existing publication workflow.

## Non-goals
- No new database columns or migration.
- No replacement of admin blog publishing workflow.
- No invented facility claims or stock/security claims.
- No external image hotlinking.

## Release gate
1. lint + typecheck + unit tests + build
2. Playwright
3. database tests (regression only; no migration)
4. merge
5. Vercel production + production smoke
