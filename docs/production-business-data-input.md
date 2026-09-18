# NupsBox Production Business Data Input

Status: **PENDING APPROVAL**

This document is the approval sheet for factual production business data. Nothing in this file authorizes a production database write by itself.

| Field | Approved value | Status | Rule |
| --- | --- | --- | --- |
| Legal/public business name |  | PENDING APPROVAL | Publish only after explicit approval. |
| Primary Tân Phú address |  | PENDING APPROVAL | Do not infer or normalize beyond an approved value. |
| Phone |  | PENDING APPROVAL | Leave database value null until explicitly approved. |
| Zalo URL/account |  | PENDING APPROVAL | Leave database value null until explicitly approved. |
| Business hours |  | PENDING APPROVAL | Leave database value null until explicitly approved. |
| Unit type names VI/EN |  | PENDING APPROVAL | Publish only approved names. |
| Unit dimensions/area |  | PENDING APPROVAL | Publish only approved measurements. |
| Public price / pricing unit |  | PENDING APPROVAL | Leave database value null until explicitly approved. |
| Availability label |  | PENDING APPROVAL | Do not imply real-time inventory unless operations maintain it. |
| Availability count semantics |  | PENDING APPROVAL | Leave database value null until explicitly approved. |
| Real media asset + alt text |  | PENDING APPROVAL | Use only real, authorized NupsBox media and truthful alt text. |
| FAQ statements |  | PENDING APPROVAL | Treat published statements as company policy/factual claims. |
| Blog/company factual claims |  | PENDING APPROVAL | Publish only verified claims. |

## Current production content baseline

Before P2.4 content work, production counts were verified as:

- `locations = 0`
- `unit_types = 0`
- `faqs = 0`
- `blog_posts = 0`
- `site_settings = 0`

P2.4 production smoke did not seed any business-content row. After synthetic CRM cleanup, `leads`, `lead_appointments`, and `lead_appointment_history` also returned to zero.

## Existing static factual content requiring approval

The previously verified production HTML/JSON-LD contains the static address:

`1/1 Nguyễn Hữu Tiến, Tây Thạnh, Tân Phú, TP.HCM`

This value predates P2.4 and is not sourced from the currently empty production `locations` table. It remains unapproved business data.

P2.8 changes source behavior so this fixture can be used only when the Supabase URL is absent or is the explicit `example.supabase.co` CI placeholder. Any real Supabase environment now returns only database-backed catalog rows; empty/error reads become empty/null and structured data omits the postal address when no published location exists.

This source remediation does not approve the address and does not prove that production has been redeployed. Keep this item open until the P2.8 deployment is verified, or until an explicitly approved production location is later published.

The live booking page also currently has no approved phone or Zalo value from `site_settings`; those values remain null/fallback-only until explicitly approved.

## Write safety

Any approved production content write must:

1. Record a pre-write snapshot/count.
2. Be idempotent or guarded against duplicates.
3. Write only explicitly approved values.
4. Leave unapproved factual fields null.
5. Record a post-write verification.
6. Keep a reversible rollback path for the small batch being changed.
