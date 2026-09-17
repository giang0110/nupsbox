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

## Write safety

Any approved production content write must:

1. Record a pre-write snapshot/count.
2. Be idempotent or guarded against duplicates.
3. Write only explicitly approved values.
4. Leave unapproved factual fields null.
5. Record a post-write verification.
6. Keep a reversible rollback path for the small batch being changed.
