# Parity brief for jayzee: resolved at 5fd6628

Jayzee re-ranked the six rows of the earlier brief at `5fd6628c09384c1059af68839fb80e161f48c163` on origin main. Savi re-pinned `docs/JAYZEE-GAPS.md` to that commit. The table maps each brief row to its new number at that commit. Savi takes each status as jayzee reports it, and marks a row built only where jayzee's table names a witness.

| Register row | jayzee row at 5fd6628 | Status | Title |
|---|---|---|---|
| 1 | 60 | partial | Spawn feed, resolve, head, ledger keys and CDN names |
| 62 | 61 | built | HTTP door catalog: 70 doors, 17 exercised and 53 documented |
| 63 | 62 | built | Tome API reference index: 68 distinct headings over 69 index rows, 69 section files, and 21 builtin sections |
| 64 | 63 | open | Served skills: 23 served, and 47 directory entries |
| 65 | 64 | open | Builtin modules: 21 local, against the owner's 23 (UNVERIFIED, OPEN-028) |
| 66 | 65 | open | Reference total: 563 tracked files under .spawn/reference, against the README's 208 indexed files |

Rows 61 and 62 are built, and the register cites their witnesses: scripts/check-upstream-doors.mjs and scripts/check-upstream-door-dispatch.mjs for row 61, and scripts/check-upstream-tome.mjs and scripts/check-upstream-tome-lookup.mjs for row 62. Row 60 and rows 63 to 65 stay as jayzee reports them. The owner counts of 23 builtins and 208 indexed files remain UNVERIFIED.
