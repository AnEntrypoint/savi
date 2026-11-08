# Parity brief for jayzee

Pin: `f051a1e59f15e3da94cfccaf1a91758c79a4174a`, the jayzee commit that savi's register (docs/JAYZEE-GAPS.md) cites. Savi relays this file to jayzee; peers do not message each other.

At this pin jayzee's docs/PARITY.md ranks 59 rows, numbered 1 to 59. Two commits changed the set: `a267b72` removed rows 1 and 61 to 66, and `f051a1e` renumbered the ranked rows and moved rows 41 and 67 under "Not in spoint" as `U41` and `U67`. Savi maps rows 41 and 67 to those `U` rows, and both are built there. The six rows below have no ranked row at this pin, so savi cannot check a source for them.

The jayzee path counts the register still lists for rows 62 to 66 are stale. They count the old `savi-*` names, which `aafab05` renamed to `upstream-*`. Savi will update those counts when the rows are re-ranked.

Savi will re-pin the register when jayzee names a commit that carries the re-ranked rows, and will check each row against that commit. Until then the register keeps the status shown for each row below. Jayzee must not mark rows 1, 62 or 63 as built without a passing witness in its own tree.

### Row 1 — Spawn feed, resolve, head, ledger keys and CDN names

Register status now: `not ranked at pin, unverified`

What is needed: At this pin the spawn feed is not a ranked row. Its open items sit as prose under "Open source questions" in PARITY.md (name encoder, ledger bucket, resolve result types, manifest frames after the sheet, spawnfile-keyed family). Either rank it again, or say in PARITY.md that it is out of the ranked table and why. The paths the register lists, src/spawn/index.js, src/spawn/resolve.js and src/spawn/ledger.js, do exist at this pin.

Done when: PARITY.md ranks the row again at a named commit, with a status word its own gate supports, the jayzee paths it cites present in the jayzee tree at that commit, and the witness scripts/check-spawn.mjs passing. Savi then re-pins and checks the row against that commit. Until then the register keeps the status "not ranked at pin, unverified".

### Row 62 — HTTP door catalog: 70 doors, 17 exercised and 53 documented

Register status now: `not ranked at pin, unverified`

What is needed: Removed by a267b72 ("Remove PARITY rows that cite paths only in the upstream checkout"). The register still lists the old names src/savi-doors/router.js, src/savi-doors/dispatch.js and scripts/check-savi-door-dispatch.mjs, which are absent at this pin. aafab05 renamed the savi layer to upstream, and the same modules are at src/upstream-doors/router.js, src/upstream-doors/dispatch.js and scripts/check-upstream-door-dispatch.mjs. The source, .spawn/reference/http/CATALOG.md, is in the upstream checkout only.

Done when: The row is ranked again at a named commit, citing the upstream-doors paths that are present in the jayzee tree, with the status its witness supports (scripts/check-upstream-doors.mjs and scripts/check-upstream-door-dispatch.mjs). The 70 doors, the 17 exercised and the 53 documented must be checked by a jayzee gate; the 17 savi captures are not a jayzee witness. Or PARITY.md states that the door catalog is out of jayzee scope. "built" is claimed only when that witness passes in jayzee.

### Row 63 — Tome API reference index: 68 distinct headings over 69 index rows, 69 section files, and 21 builtin sections

Register status now: `not ranked at pin, unverified`

What is needed: Removed by a267b72. The register still lists src/savi-tome/tomeLookup.js and scripts/check-savi-tome-lookup.mjs, both absent at this pin. The same modules are at src/upstream-tome/tomeLookup.js, src/upstream-tome/tomeIndex.js, src/upstream-tome/tomeSections.js and scripts/check-upstream-tome-lookup.mjs. The source, .spawn/reference/tome/INDEX.md, is in the upstream checkout only.

Done when: The row is ranked again at a named commit, citing the upstream-tome paths present in the jayzee tree, with the status its witnesses support (scripts/check-upstream-tome.mjs and scripts/check-upstream-tome-lookup.mjs). It states 68 distinct headings over 69 index rows and 69 section files, and that the 21 builtin sections are not the owner count of 23 (OPEN-028). Or PARITY.md states that the Tome index is out of jayzee scope. "built" is claimed only when the witness passes in jayzee.

### Row 64 — Served skills: 23 served, and 47 directory entries

Register status now: `open`

What is needed: Removed by a267b72. The register still lists src/savi-skills/skillRegistry.js and scripts/check-savi-skill-registry.mjs, both absent at this pin. The same modules are at src/upstream-skills/skillRegistry.js and scripts/check-upstream-skill-registry.mjs (also src/upstream-skills/skillBodies.js and src/upstream-skills/skillIndex.js). The source, .spawn/reference/skills/INDEX.md, is in the upstream checkout only.

Done when: The row is ranked again at a named commit, citing the upstream-skills paths present in the jayzee tree, with status open and the open clause kept: bodies are served as text, and a registry installs a served skill only after an injected verifier accepts it. Run semantics are not stated by the savi material. Savi keeps this row OPEN in any case.

### Row 65 — Builtin modules: 21 local, against the owner's 23 (UNVERIFIED, OPEN-028)

Register status now: `open`

What is needed: Removed by a267b72. The register still lists src/savi-builtins/builtinBodies.js, src/savi-builtins/easing.js and scripts/check-savi-builtin-easing.mjs, all absent at this pin. The same modules are at src/upstream-builtins/builtinBodies.js, src/upstream-builtins/easing.js and scripts/check-upstream-builtin-easing.mjs. The source, .spawn/reference/tome/sections/, is in the upstream checkout only. The owner count of 23 builtins is UNVERIFIED (OPEN-028).

Done when: The row is ranked again at a named commit, citing the upstream-builtins paths present in the jayzee tree, with status open. PARITY.md states that 21 builtin bodies are served by name and that the owner count of 23 is not reproduced and is UNVERIFIED, and that the other builtins are not implemented. It must not mark the row built or claim the 23 count.

### Row 66 — Reference total: 563 tracked files under .spawn/reference, against the README's 208 indexed files

Register status now: `open`

What is needed: Removed by a267b72. The source is .spawn/reference/README.md and the tracked .spawn/reference tree, both in the upstream checkout only, which is not in jayzee. The jayzee reference index is src/upstream-reference/referenceIndex.js.

Done when: The row is ranked again at a named commit, citing paths present in the jayzee tree, with status open. PARITY.md keeps both figures, 563 tracked files and the README count of 208, and states that the 208 total stays UNVERIFIED because jayzee and the README disagree. It must not promote either figure to a verified count.
