# P3.27 — Media Launch Workflow

## Goal
Make media quality, mapping, hero selection and gallery ordering operable from one Admin workspace.

## Changes
- media readiness score for the current scope
- location and unit focused media views
- upload form preselects scoped location/unit
- public-media warnings for missing bilingual alt or location mapping
- quick public preview links to mapped location/unit
- safe hero promotion: public + location-mapped media only
- hero promotion places the chosen image first and demotes the previous hero category at the same location
- quick “move to front of gallery” action without manual sort-order editing

## Guardrails
- no new schema/RLS/auth changes
- no invented alt text or business facts
- hero promotion does not auto-publicize private media
