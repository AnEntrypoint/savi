# engine-deep

Engine notes for Spawn engine 6.0.0, written from the docs clone at `/workspace/savi/.spawn/engine`. Start with ENGINE.md. For physics and optimization internals, see physics-and-optimization.md. For netcode, lag compensation and compression, see netcode-and-optimization.md.

These notes live at `/workspace/savi/.spawn/reference/`. `/workspace/savi` is not a git repository, so none of them can be committed to the game-6 world tree.

| File | Size (bytes) | What it is |
|---|---|---|
| ENGINE.md | 52136 | Entry point: engine model, hook model, quick reference, spec shapes, recipes, gotchas and inconsistencies, where to look. |
| api-a.md | 19865 | Notes on api-reference.md headings 1 to 34 (Identity through The Spine), with the preamble conventions. |
| api-b.md | 37832 | Notes on api-reference.md headings 35 to 68: behavior hooks, object spec shapes, named types, builtin modules. |
| skills-a.md | 36250 | Notes on 12 skill guides: 2d-mode, buyables, cameras, fx, game-ui, geometry, heightmap-terrain, interactive-objects, jev, leaf-sprays, mobile-controls, physics. |
| skills-b.md | 32360 | Notes on 11 skill guides: platform-systems through voxel-terrain, plus skills.md and the engine README. |
| world-usage.md | 12678 | How game-6 (the Savi Gallery) uses the engine: file layout, call counts, hook names, scene conventions, inconsistencies. |
| pin-and-untracked.md | 1785 | The engine.yaml pin, recent engine commits, and the untracked keys.py and probe.sh in the engine clone. Its sha256 is the live pin; ENGINE.md section 1 repeats it. |
| README.md | this file | This index. |
| live-probe-results.md | 15733 | Live probe results: hook order, physics, ctx.commit. |
| internals-sources.md | 3996 | Where the engine source is and what is verified live. |
| probes/ | 10 files | Probe scripts 1-10 used in the live rooms. |
| kernel-worker.md | 10401 | The cached runtime worker: hook catalog, aliases, force guard, step constant. |
| physics-and-optimization.md | 58661 | Physics solver phases/counters and every optimization strategy: LOD, instancing, streaming, culling, budgets, updateSchedule, telemetry, worker constants. |
| netcode-and-optimization.md | 27801 | Netcode, lag compensation, compression, wire/boot accounting and systems optimizations: live probes, worker constants, zero-doc term inventory. |

Sizes are from `wc -c` on 2026-11-05. The arrival budget is 450 KB per place; world-usage.md records how much signage fits under it. ENGINE.md was restored from the session transcript after a truncated read-write cycle; sections 5-7 are present again.

## Upstream engine docs update (2026-11-05)

The engine docs clone advanced from 899b3bf (kernel 562d7f610d8a) to fb764b7 (kernel 1042969a3d94), 96 commits. The net doc diff is 32 insertions and 31 deletions across api-reference.md, engine.yaml, and six skill files; most are wording changes. New or changed facts:

- `video:generate` job: args { prompt, seconds (5–15), aspect, image? }, data { name, url (.mp4), seconds, width, height }. The docs advise a cron plus `await ctx.awaitJob(id)`, because a clip takes minutes.
- Joint `limits` accepts `{ min, max, stiffness, damping }`, and spherical joints accept `stiffness`/`damping` beside `cone`/`twist`. The stops become springs; damping defaults to critical.
- LOD note: the `c / ctx.view.pixel` handover sentence was removed from skills/geometry.md.
- Hinge note: `feetPosition` stays the leaf's bottom centre, not the hinge (skills/interactive-objects.md).
- Portals: a seated rider has no body; the car meets the glass and crossing takes the driver, so a players-only gate moves neither. The docs also tell builders to write the far world's `admits()` with the door.
- A picture-free `.glb` can be POSTed to `/cdn/` by a builder or Spawn machine (skills/platform-systems.md).
- `llm:chat` model names: "fast" and "smart" are Spawn's own; an OpenRouter id is an alternative.

The kernel sha256 in engine.yaml at that pin was 1042969a3d947c5c82573b8336239f85f7e3012ff0720a603accad65e998d5f8; the current pin is in the next section. The docs clone tracks docs only; the runtime worker is cached locally (kernel-worker.md).

## Upstream engine docs update 2 (2026-11-05, 16:59)

Seven more commits landed: fb764b7 -> 4134071 (kernel 8981216d3a26). The net doc diff is one line in api-reference.md plus the engine.yaml pin:

- New `ActPayloads` member: `partyCancel: { player: string | { readonly id: string } }`, beside `partyAdd` and `partyLeave`.
- Kernel pin sha256 is now 8981216d3a26c39baad5c9539e3a413a049f0797eb8152a12055fb0caf9783af.

The engineVersion strings seen in room-host logs during this session's probes (d6697aeb, a21c252a, 26ad9a7a, 2c12092a, b8e64d1f) match kernel prefixes of commits in this clone (6f82c94 kernel d6697aeb6aeb, 0240920 kernel a21c252a594d, 8cb061a kernel 26ad9a7aa2a8). That confirms the docs kernel pin tracks the runtime engine the room host downloads and SRI-verifies (kernel-worker.md).

## Upstream engine docs update 3 (2026-11-05, 17:22)

Three more commits: 4134071 -> 80552d3 (kernel 04186efac6d1). The only doc change is the engine.yaml pin, now sha256 04186efac6d153bc779d24df90b3bef959f205430496ef2d41bfa6c4c7f82df8. No API or skill text changed.

Two cached runtime workers (directories 1e6ae6f76b4a and 2792ef38e4f4) contain `partyCancel` three times each; the older workers (d843800d1534, b325c91e1450) contain none. That is live confirmation that the `partyCancel` ActPayloads member added in 4134071 reached the runtime worker, not just the docs.

## Upstream engine docs update 4 (2026-11-05, 18:20)

Six more commits: 80552d3 -> 1c2dd06 (kernel ad7456cb9f9d). The only doc change is the engine.yaml pin, now sha256 ad7456cb9f9df4fdb9386d00405123262ac5dafb1580ca84e51b12a3ffaac9dc. No API or skill text changed.

One of those commits is `cd4d3ce kernel 954479ae3de3`, and a `spawn client status` call during this session printed "running the client this stack last served here (954479ae3de3)" after a transient ECONNRESET. That is another direct match between a docs kernel pin and a runtime engine identifier, as recorded in kernel-worker.md.

## Pin-only upstream commits

Pin bumps are scripted: after `git -C /workspace/savi/.spawn/engine merge --ff-only origin/main`, run `python3 -I /workspace/savi/.spawn/update-engine-pin.py`. It reads HEAD and engine.yaml and refreshes ENGINE.md, the two headers, pin-and-untracked.md, this table and the index sizes.

Since the API changes recorded in sections 1-4 above, the engine docs repo has kept shipping commits whose only diff is the engine.yaml kernel pin. They add no API or skill text. The pin in this clone is kept current; the earlier API changes are unchanged.

| Commit | Kernel prefix | What changed |
|---|---|---|
| 4134071 | 8981216d3a26 | `partyCancel` ActPayloads member (API) |
| 80552d3 | 04186efac6d1 | pin only |
| 1c2dd06 | ad7456cb9f9d | pin only (6 commits) |
| 819f547 | a4da5ab0ef86 | pin only |
| 1a19114 | c8874708a24b | pin only |
| b1adab2 | 0e3d2b09fe1d | pin only |
| 37d3515 | 7ae731057272 | pin only |
| f2195e6 | 5da3ba7e12d5 | pin only |
| f610c62 | e539832c6643 | pin only |
| f8965ed | c2b6075fef53 | pin only |
| a2e33db | d0474735b22d | pin only |
| 0ff0f3f | c9bc47ece59e | pin only |
| b5a7587 | b5d10e377d04 | pin only (current) |
