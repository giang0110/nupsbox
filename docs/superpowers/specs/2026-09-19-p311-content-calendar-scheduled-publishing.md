# P3.11 Content Calendar & Scheduled Publishing

Date: 2026-09-19
Base: `main@9c87c58e24d05a0c1f648f79b90ce45bdcbdd750`

## Goal

Add a practical content calendar and scheduled Blog publishing without adding a new database status, migration or cron job.

## Publication contract

- Draft remains `status=draft`.
- Immediate publish remains `status=published` with `published_at=now`.
- Scheduled publish uses `status=published` with a future `published_at`.
- Public Blog listing, article pages and sitemap already require `published_at <= now()`, so scheduled content stays private until the timestamp is reached.
- Admin derives a UI-only `scheduled` state from future `published_at`.
- A scheduled article may be cancelled back to draft only before its publication timestamp.
- Scheduling and cancellation require the existing `content:publish` permission.

## Time zone

Admin `datetime-local` values are interpreted explicitly as Asia/Ho_Chi_Minh (UTC+7). No browser/server timezone guess is used.

## Admin UX

- Blog detail offers Publish now and Schedule for draft articles.
- Scheduled articles show a warning badge and scheduled TP.HCM date/time.
- Scheduled articles do not expose public preview links before they become public.
- Add `/admin/content/calendar` with scheduled, next-7-day, draft and recent-published views.
- Add Calendar links to Admin navigation, Blog CMS and Dashboard Quick Actions.

## SEO

- SEO QA includes scheduled articles so metadata can be fixed before go-live.
- SEO indexable counts and route pairs exclude future scheduled articles.
- Sitemap behavior remains unchanged and fact-safe.

## Guardrails

- No database migration.
- No cron/background job.
- No new content status enum.
- No automatic content creation.
- Preserve existing role permissions and public publication checks.
