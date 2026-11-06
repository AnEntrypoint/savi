# Physics and optimization strategies (previously undocumented)

Written 2026-11-05 from the engine docs clone at `/workspace/savi/.spawn/engine`, the cached runtime worker at `/workspace/savi/.spawn/kernel/`, and live `spawn client exec` probes. This file is gitignored through `/workspace/savi` being outside the git tree. Nothing here is committed to the world.

## 1. What was NOT documented before this run

A coverage grep over all 28 files in `engine-deep/` found **zero occurrences** of `optimization`, `streaming`, `culling`, `arrivalBudget`, `broadphase`, `narrowphase`, `warmStart`, `islandsSleep`, `CCD`, `GJK`, `activePairs`, `manifold`, `persistentPairs`, `frozenWorldSkips`, `support-hold`, `body-rest`, `terrain/client-streaming`, `frame-tail`, `pixelProvenance`, `renderScale` (as a measured value), `shedFraction`, `tickBudgetMs`, `updateSchedule` skip counters, `getPerformanceSnapshot` internals, and `getClientHealth` internals.

The same literal search against the engine docs (`api-reference.md` + `skills/`) found **no** public documentation at all for: `broadphase`, `narrowphase`, `warmStart`, `islandsSleep`, `GJK`, `CCD`, `activePairs`, `manifold`, `persistentPairs`, `frozenWorldSkips`, `support-hold`, `body-rest`, `terrain/client-streaming`, `frame-tail`, `pixelProvenance`, `arrivalBudget`, `culling`. Those are runtime-only mechanisms, visible through `getPerformanceSnapshot()` and the worker. The docs do cover `renderScale`, `ctx.view.pixel`, `instanced`, `frustum` (a primitive kind), `LOD`, `import()`, `maxTextures` and `tier` — those are summarised in section 6 with pointers, not restated from scratch.

So the gaps fall into four groups, all filled below:

1. **The physics solver's internal phases and counters** — the 31 named `part:*` / `mantle:*` phases, the broadphase/narrowphase/island/CCD/warm-start pipeline, sleep/park/awake body accounting.
2. **The engine's adaptive performance machinery** — the measured tick budget, shed fraction, render scale, quality tiers, and the measured-attribution verbs.
3. **Simulation culling and scheduling in practice** — `updateSchedule` skip counters, `simulatedBy: platform`, per-script `usPerTick` / `runsPerTick`, and the systems row names (including client streaming framed as a per-tick cost).
4. **Boot/arrival optimization as a measured cost** — the arrival budget, import() lazy loading, worker/SRI caching, and the cold-boot measurement.

## 2. The physics step, measured live

Probe: joined room `main` on engine `26ad9a7aa2a8a81fbf40ea21c91dab3f`, `spawn client exec --read-only` with `getPerformanceSnapshot()`, output written with `--out` to avoid console truncation.

- `ctx.place`: `gravity {x:0,y:-24,z:0}`, `damping 0`, `tickBase 30`, `timeScale 1`, `worldBounds {bottom:-20}`, `mode "3d"`, 33 keys. The place's dials are `gravity`, `tickBase`, `damping` (the runtime rejects `ctx.place.settling` and `ctx.place.physics` with an address list). `settling` lives on `ctx.world.settling` (false here).
- `pace`: `measuredTickRate 30`, `budgetTickRate 30`, `tickBudgetMs 33.333`, `shedFraction 0`, `windowSeconds 30`, `verdict "on-budget"`.
- `measured`: `{tick, windowTicks 45, windowSeconds 1.5, warmup null, idle false}` — the short measurement window is 45 ticks / 1.5 s; the pacing verdict uses a 30 s window.
- `server.tickBudgetMs 33.333`, `server.top` is a 38-row worst-offender list with fields `kind, name, p50Ms, p95Ms, maxMs, pctOfBudget, budgetMs, client`.
- `getPerformanceSnapshot()` **arms a ~10 s measurement window on connected clients**; reading again in ~10 s adds GPU pass attribution. Its note: "Measured attribution, worst-offender-first; calling this arms a ~10s measurement window on connected clients — read again in ~10s for GPU pass attribution. Keep the game fast without waiting to be asked; never remove or simplify what the creator built without asking them."
- `getClientHealth()` returns `{note, clients}`; its note in a headless room: "No client health reports yet; clients report every ~15s once their renderer is up; re-check shortly."
- `ctx.now()` is **frozen inside an exec run**: `t0 = 105028134` and `t1 - t0 = 0` after `await ctx.sleep(0.5)`. Do not use `ctx.now()` deltas to time a fall inside `run_script`; use the `tick` in the exec reply or the sim-health window instead.

### 2.1 The 31 physics step phases, in reported order

`clients[0].physics` has `windowSteps: 300` (a 10 s window at 30 Hz), `phases` (31 rows of `{name, avgMs, maxMs}`), `counters` and `peak`. The `part:*` phases are the world/tree side of the step; the `mantle:*` phases are the rigid-body solver. Reported order (avgMs from this room):

| Phase | avgMs | maxMs |
|---|---|---|
| part:world | 0.463 | 1.11 |
| part:ensure | 0.147 | 0.5 |
| part:gate | 0.139 | 0.313 |
| part:floorHold | 0.135 | 0.291 |
| part:statics | 0.11 | 0.279 |
| part:publish | 0.109 | 0.338 |
| part:after | 0.1 | 0.217 |
| part:places | 0.046 | 0.158 |
| part:rest | 0.027 | 0.117 |
| part:overrides | 0.011 | 0.069 |
| part:pre | 0.003 | 0.027 |
| part:joints | 0.001 | 0.003 |
| part:post | 0.001 | 0.003 |
| mantle:activePairSort | 0 | 0 |
| mantle:broadphasePairs | 0 | 0 |
| mantle:ccd | 0 | 0 |
| mantle:characters | 0 | 0 |
| mantle:contactSeed | 0 | 0 |
| mantle:contactStore | 0 | 0 |
| mantle:events | 0 | 0 |
| mantle:integrate | 0 | 0 |
| mantle:islandsSleep | 0 | 0 |
| mantle:narrowphase | 0 | 0 |
| mantle:proxySync | 0 | 0 |
| mantle:relaxation | 0 | 0 |
| mantle:restitutionFinalize | 0 | 0 |
| mantle:solverPrepare | 0 | 0 |
| mantle:total | 0 | 0 |
| mantle:vehicles | 0 | 0 |
| mantle:velocitySolve | 0 | 0 |
| mantle:warmStart | 0 | 0 |

The zero `mantle:*` readings mean the solver ran no expensive work in that window (the world was quiet), not that the phases are absent. The names alone document the pipeline: proxy sync → broadphase pairs → active-pair sort → contact seed/store → solver prepare → warm start → velocity solve → relaxation → restitution finalize → integrate → islands/sleep → CCD → characters → vehicles → events. `part:floorHold` is the phase behind the `terrain-support-hold` log lines.

### 2.2 Physics counters (live and peak in the same window)

| Counter | Live | Peak |
|---|---|---|
| liveBodies | 759 | 759 |
| awakeBodies | 15 | 21 |
| sleepingBodies | 47 | 48 |
| parkedBodies | 0 | 0 |
| liveColliders | 862 | 862 |
| activePairs | 124 | 125 |
| persistentPairs | 60 | 61 |
| manifolds | 7 | 16 |
| contactPoints | 25 | 54 |
| joints | 14 | 14 |
| characters | 8 | 8 |
| vehicles | 0 | 0 |
| ccdRowsScanned | 15 | 21 |
| ccdCandidateRows | 3 | 5 |
| ccdRotationAdmitted | 2 | 3 |
| ccdTranslationAdmitted | 0 | 1 |
| ccdStaticSpeculativeAdmitted | 1 | 3 |
| ccdSweptTargetProxies | 5 | 7 |
| ccdSweptTargetQueries | 4 | 6 |
| ccdRotationalMovers | 2 | 3 |
| ccdToiIterations | 0 | 12 |
| ccdToiCapHits | 0 | 0 |
| ccdHits | 0 | 1 |
| gjkIterations | 0 | 456 |
| epaIterations | 0 | 0 |
| shapeCastIterations | 0 | 61 |
| characterCollections | 0 | 0 |
| characterCollectionMemoHits | 0 | 0 |
| characterStaticTrianglesVisited | 0 | 0 |
| frozenWorldSkips | 0 | 0 |
| laneWordRefusals | 0 | 0 |

Optimization strategies this proves: sleeping islands (47 sleeping vs 15 awake of 759 live bodies), persistent contact pairs reused across steps, speculative/rotational/translational CCD admission with swept-target proxy queries and a TOI cap, GJK/EPA iteration accounting, character-collection memoisation, and a `frozenWorldSkips` counter for worlds that skip work entirely.

## 3. Simulation culling and scheduling, measured

`clients[0].behavior`: `{totalEntities 187, updatedEntities 21, scheduleSkippedEvery 17, scheduleSkippedNear 0}`. That is the direct runtime evidence that `updateSchedule` culls updates.

In game-6 there are **27** `updateSchedule` declarations, all with `every` (a tick count `2`, `3`, `8`, `15` or `{seconds: 0.2 … 3}`), and 6 scene rows with `simulatedBy: platform`. Only one combines both levers: `scripts/ex/ws/in-spatial-query.js:4` = `{ every: 15, near: { radius: 40 } }`. No declaration uses `near` alone, which matches `scheduleSkippedNear: 0` in this room. The runtime worker keeps the same counters as `x9$={awake,heldWaiting,updated,skippedEvery,skippedNear}`.

`clients[0].scripts.rows` and `.systems.rows` are 14-row worst-offender tables over a 30 s / 900-tick window:

- Script rows carry `script, hook, usPerTick, runsPerTick, held, version, things`. Measured: `ex/car77.js update 413.6 us/tick at 0.5 runs/tick`, `ex/cart.js 363.2 at 1`, `ex/w7/veh-plane.js 146.9 at 1`, `ex/sentry.js 139 at 0.33`, `ex/minds-villager.js 66.5 at 6 runs/tick` (6 instances), `ex/c92-belt.js 30.5 at 0.07`.
- System rows carry `name, usPerTick, runsPerTick, workPerTick`. Measured names, in cost order: `tome/behavior-update` 2060.2, `physics/step` 1443.6 (workPerTick 61.58), `netcode/client-auth-publish` 393 (6.97), `tome/scripted-level` 193.9, `tome/tween-evaluator` 142.2 (16.75), `netcode/egress-flush` 119.7 (2.05, 0.46 runs/tick), `physics/step/statics` 110.9, `(untimed)/simulation` 89.9, `tome/behavior-update/visit` 72.9, `tome/still-holds` 52.3, `tome/hierarchy-walk` 47.8, `terrain/client-streaming` 46.8, `client/frame-tail` 43, `tome/scripted-primitive-offthread` 32.6.
- `terrain/client-streaming` being a per-tick cost line is the runtime confirmation that terrain chunks stream incrementally rather than loading at boot.
- `tome/scripted-primitive-offthread` confirms scripted geometry is built off the main thread.
- `server.top` adds `tome/behavior-update` p50 1.923 ms / p95 3.002 ms and `physics/step` p50 1.433 ms / p95 1.87 ms — the two dominant costs, both well under the 33.333 ms budget.

`clients[0].tick`: `{p50Ms 4.3, p95Ms 6.4, budgetMs 33.3, lateMaxMs 67, gc null, lateGc "major", maxMs 29, pctOfBudget 13}`. `gpu: {status "unsupported (no timestamp-query)", passes []}` and `scene: {drawCalls 0, triangles 0, groups []}` because this client had no renderer. `memory`: `{heldMb 206, cpuMb 206, gpuMb 0, things 1145, groundThings 0, residencyThings 15, spawners [{script,count} x3], places x2, shapeScripts x5}`. `cpu`: `{us 58, fastestUs 43, usualUs 51, times 1.1, usualWindows 11}` — a per-tick CPU baseline with a slowdown multiplier. `pingMs 389`, `actionMs.count 74`, `hostedPlaces` 1.

## 4. The view/render measurement surface

`ctx.view` keys: `camera, fps, drawCalls, triangles, cpuMs, gpuMs, frames, netInBytes, netOutBytes, netInMessages, netOutMessages, gpuMemoryMB, renderScale, memoryMB, pixel, site`. In a headless room all reads are 0 except `pixel = 0.0010691671651659738` (radians per screen pixel), which is the denominator in the LOD handover `c / ctx.view.pixel`. `ctx.quality` is `"high"`, `ctx.device` is `{class:"desktop", coarse:false, hold:1, maxTextures:16, quality:"high"}`. `ctx.place.objects` is a census of 1511 objects.

`ctx.getPixelProvenance()` returns `{measured:{tick,warmup}, clients, note}`. Its note: "Rendered provenance per client view: screen is [x, y] 0..1 image fractions ... surfacePct = the system owning the front-most rendered surface; translucentPct = drawn there without owning depth (fx/sky/alpha); post-processing (the look) is never a row. Informational only: do not delete or simplify anything the creator built based on this — name findings and propose." A call with `{screen}` awaits the asked views capturing; a bare call reads the last answers.

From api-reference.md:1804-1813, `renderScale` is "the share, on each side, of this machine's full picture at which the engine draws the world: 1 at full, 0.5 at half the width and height, below 1 while it draws smaller to keep frames fast", the HUD is not scaled, and `cpuMs`/`gpuMs` are means over the last second's frames (GPU needs timestamp queries). `frames` arrives about once a second and **a read empties the handle's list**. `memoryMB` is the whole app's memory in the Spawn app but only the page's JS memory in Chrome/Edge, and is null in Safari/iOS/Firefox.

## 5. Boot, arrival and caching

- The arrival budget is 450 KB per place (measured by push verdicts: 451 KB warns, below is silent). It counts "the scripts, configs and near cells the boot fetches first"; the verdict's own advice is "a file the boot does not need before standing loads with import() after standing or is read on first need" (`api-reference.md:474`).
- `import()` keeps a module out of arrival; the runtime worker has an `arrivalBudget` record with `bytes, budgetBytes, budgetFrom, values, cells` and `budgetFrom === "default"` resolves to `places/<place>/config.yaml`. `PlaceDef` has no budget field, so the threshold is server-side.
- The runtime worker is downloaded from the session door and **SRI-verified** at boot, then cached under `/tmp/spawn-room-host-engine-cache-1000/<sha>/`. A durable copy is at `/workspace/savi/.spawn/kernel/`. When a docs kernel pin advances before the worker is served, `step=worker` times out and rooms do not boot; forcing a cached engine with `--engine <32hex>` works around it.
- `tree-fetch` / `tree-lane` log lines report receipt of the ride's bytes and code rows; the client reports `4 value(s) in 13 ms: 4805 bytes` and `4 of 4 value(s) landed on the device in 22442 ms` in one room.
- Published vs dev: a push never publishes; `POST /api/games/{appId}/publish` moves the public page. Cold-boot measurements are in `live-probe-results.md`.

## 6. Where the covered facts live (do not duplicate)

| Topic | Existing doc |
|---|---|
| Physics body kinds, colliders, joints, ragdoll, raycast | `api-b.md`, `skills-a.md`, `skills-b.md`, `ENGINE.md` |
| `tickBase`, gravity, damping, 33.3 ms step | `live-probe-results.md`, `kernel-worker.md` |
| Hook order, physics fall, collision order | `live-probe-results.md`, `kernel-worker.md` |
| `updateSchedule` as a data export, `simulatedBy: platform` | `ENGINE.md`, `api-b.md`, `skills-b.md` |
| LOD levels, instancing, `ctx.lod`, `ctx.instances` | `skills-a.md`, `api-b.md` |
| Camera layers, fog/shadows, texture caps | `skills-a.md`, `api-b.md` |
| Arrival budget and signage tradeoff | `world-usage.md`, `README.md` |
| Kernel hook catalog, aliases, force guard | `kernel-worker.md` |

## 7. Probe recipe

```
spawn client join @lanmower/the-savi-gallery --engine <cached 32hex> --ttl 900 --name perfprobe
spawn client exec --read-only --name perfprobe --out /tmp/perf.json /tmp/perf.js
```

Use `--out` because the full `getPerformanceSnapshot()` is ~3,000 lines and the run_shell output condenser drops it. Read the JSON with `python3 -I` and select only the fields you need. Leave the session with `spawn client leave --name perfprobe`.


## 8. Runtime worker constants and teach strings (build 2792ef38e4f4)

Mined from the durable worker at /workspace/savi/.spawn/kernel/. These are runtime-only facts with no public doc. Counts are case-sensitive literal hits in the 28,968,772-byte file.

### 8.1 Fixed step, tick rate and shedding

- Default step is exactly `YbX={tick:0,dt:0.03333333333333333}` and `AdT($,Q,J=0.03333333333333333)`; `0.03333333333333333` appears 11 times, `tickBase` 30, `sim-health` 10. The string `"step 33.3 ms"` does not appear in the worker (it is a log formatter elsewhere).
- `Y7=30` is "the 30 Hz era default"; `C34=-9.81` and `aaB(){return tc8(0,-9.81,0)}` are the Earth-gravity default. This world overrides it with `ctx.place.gravity.y = -24`.
- `tickBase` is guarded: `"metricOfTickBase: tickBase must be a finite positive Hz value"`. A Tome config example in the worker is `ctx.place.tickBase = 20 (Hz; the world layer is engine.simulation.tickRateHz)`.
- Sim-health constants in one cluster: `LJ3=3, DJ3=20, MJ3=4, fIq=3, HT8=14, bJ3=12, iIq=8, hIq=6, zq6=3, flN=1000, lIq="tick-shed", EJ3=2048, Dq6=64`, plus `xlN="wake"` and `vIq=8388608` (8 MiB `sim-health.heap-climb`). `tick-shed` is the runtime name behind `pace.shedFraction`.

### 8.2 Sleep, parked bodies and islands

- `"Native sleep requires bound solver inputs"`: Mantle sleep needs bound bodies, contacts, scratch and sleep buffers.
- `"the body is parked (the browser reported this page hidden, or its link dropped) — the landing runs the tick it has resumed here"`: a parked simulation resumes on a tick. `"the seat holds it awake and nothing of this copy's moves to take it"`: a player's seat keeps a body awake.
- `$.wake(Q,J),$.raw.sleepTicks[Q]=0` — wake resets the sleep-tick counter. `physics/body-rest` is one `u8` state field with `replicate:"aoi"` (area-of-interest replication).
- Solver tolerances: `RP$=0.5, Qo2=240, oNz=0.05, nF0=1e9, MV8=1e-9, wF0=1e-6`; `settleIds=[];settleHandles=[]` back the settling pass.
- `"Mantle WASM is missing contact-cache kernels"` — the physics solver ("Mantle") is a WASM module with separate contact-cache kernels.

### 8.3 Culling, LOD and streaming

- Voxel chunk streaming has a `lodRanges` config: `"LOD transition distances in meters for voxel chunk streaming"`. Defaults are `J=[Q*2,Q*4,Q*6]` and `J=[Q*1,Q*2,Q*3]` where Q is chunk size. Explicit defaults: max render distance 200 m, fade-out distance 40 m, max total instances 300,000.
- `"Audible reach in meters (default: 50): the voice holds its gain out to refDistance, falls ~1/d and hits exactly 0 here; the voice culls here too."` — audio distance culling.
- `"client terrain chunk build released: its chunk despawned (a world swap, a terrain teardown, or streaming eviction)"` — chunks are evicted, not just streamed in.
- Counts: `cull` 65, `frustum` 42, `stream` 1,886, `chunk` 2,534, `lod` 974, `LOD` 11, `instances` 315, `instanced` 30. There is no `nearRadius` identifier; the near lever is `updateSchedule.near.radius`.

### 8.4 Budgets, caps and watchdogs

- Worker-side timing config: `dj$={scriptSyncBudgetMs:5000, tickDrainBudgetMs:8, watchdogGraceMs:2000, workerRebuildAllowanceMs:3000, specMovedRetryLimit:2, workerIdleTtlMs:600000, laneSimShare:0.25}` (`R2T=0.25` is the same lane sim share).
- Teach strings: `"the script exceeded its ${...}ms synchronous budget on a host ticking normally"`, `"Job deadline exceeded: ${M0}ms with no progress"`, `"words kept arriving with no sim step (a throttled or frozen frame loop)"`.
- Per-call operation cap table: `qOF={read:50,see:250,call:50,spawn:5000,query:4000,raycast:1000,overlapPoint:500,overlapSegment:500,inputRay:100,cells:1500,fill:1000,cellsQuery:4000,cellState:300}`.
- Other caps: `BT$=262144` (cell region budget), `rw0=4096`, `VP5=16` default chunk edge, `JoQ=40` max chunk edge (`"voxel chunk refused: a ${$}-cell edge exceeds ${JoQ}"`), `fQ=33554432` (32 MiB memory limit), `memoMaxBytes` and `R5J` inline budget (`"renderer camera kind exceeds the inline budget: truncated"`).
- `budget` 553, `arrival` 1,424, `deadline` 336, `queue` 1,581, `throttle` 8. gm's own `MAX_SCAN`, `nearRadius`, `backpressure` and `SRI` literals are absent from this worker.

### 8.5 Render tier and texture caps

- `maxTextures:X.maxTextures??16`; `"texture packs larger than ${Q.budget??32} layers stay on the CPU backend (texture-array layer cap)"`.
- `VYG=[50,100,250]` are the quality tiers, `Vx$=10` s, `qk=0.1`, `JYG={ms:0.5}`; `jk=($)=>$>0?String(Math.round(1000/$))` derives fps from frameMs.
- `"lighting quality read before the session set its tier (setActiveLightingQuality): the class resolves at renderer init, never a module default"` — the quality tier is locked at renderer init.
- Counts: `frames` 860, `cpuMs` 45, `gpuMs` 51, `quality` 127, `pixel` 413, `fog` 331, `shadow` 454, `layer` 3,561.

### 8.6 Physics config defaults

- `"Gravity multiplier. 0 = no gravity, 1 = normal, 2 = double. Default 1."`, `"How springy: 0 settles without overshoot, 1 keeps wobbling (0..1, default 0.5)"`, `"Metres: the thickness of every spring joint's tip against the colliders (default 0)"`, `"physics world: raycast's direction must not be zero"`.


### 8.7 Boot fetch and caching

- `"[tree-fetch] head ${$.manifest.slice(0,8)} in ${Math.round($.ms)} ms: ${$.files} file(s)"` and `"[tree-lane] ahead of its room: ${U} place(s)' arrival leaves composed in ${Math.round(J6()-G)} ms"` — the lane composes arrival leaves ahead of the room.
- `"[runtime-worker] failed to prime deferred base asset manifests"` is the manifest-priming failure.
- `Y3j=50, V3j=250` gate partial packs (`J.length>=50 && P>=250 ms`); door timings are `cacheMs / walkMs / rowsMs`. Counts: `tree-fetch` 21, `tree-lane` 182, `manifest` 886, `cache` 364, `hash` 1,434. No SRI integrity hash literal — the SRI verification is done by the host, not this worker.

### 8.8 Hook dispatch

The hook alias table in **this build** is `Ak0` (23 entries), e.g. `var Ak0=[["onSpawn",["onSpawn","spawn"]],["onDestroy",["onDestroy","destroy","onDestory"]],["update",["update"]]...`. It keeps the `"onTrigger"` alias for `onTriggerEnter` and the typo alias `"onDestory"`. Named data exports are `Hq=["updateSchedule","scopes","ears"]`; catalog metadata lives in `GI0` / `YI0`. `Dk0=($)=>$==="forces"||$.startsWith("forces.")` is a forces predicate here, **not** the alias table — in the older b325c91e build `Dk0` was the alias table. Minified symbols are build-specific; see kernel-worker.md.


## 9. Docs-level physics and optimization facts that were missing from the notes

Checked against every one of the 28 files in engine-deep/; OMITTED facts were already covered and are not restated. Path prefixes: `[skills/X.md:N]` = `/workspace/savi/.spawn/engine/skills/X.md:N`, `[api-reference.md:N]` = `/workspace/savi/.spawn/engine/api-reference.md:N`.

### 9.1 LOD and instancing

1. There are five explicit LOD tiers: `"2 drops trim, 3 the big forms, 4 outline boxes, 5 one closed hull"` with level 1 finer than a no-LOD build `[skills/geometry.md:9]`.
2. LOD invariant: `"Levels keep outline and paint."` — a handover changes only interior detail, never silhouette or material `[skills/geometry.md:9]`.
3. The tree generator scales detail by `ctx.lod`: `const tiers = Math.round((H - yb) / [0, 1.2, 1.6, 2.6, 4, 6][lod]);` and `cards = Math.ceil((3 / lod) * w * v);` `[skills/trees.md:51,80]`.
4. Bespoke instanced geometry carries distance LODs: `lods?: { indices: [number, number]; distance?: number }[]` `[api-reference.md:804]`.
5. An instance set reads its near level **once per copy it draws** `[api-reference.md:1199]`.
6. Triangle counts are cached at build time: `"the count the engine holds from the build, so nothing runs again to read it"` `[api-reference.md:1199]`.
7. Ground detail streaming is tier-driven: `"low anywhere and medium on phones and tablets stream the near bands"`, while `"high and ultra append farther, coarser bands, coarse ground to camera.clip.far"` `[skills/heightmap-terrain.md:41]`.
8. `"stochastic hides repeats on far organic ground"` — a far-ground texture quality lever `[skills/heightmap-terrain.md:67]`.
9. `"Thousands in ONE object are an instance set (ctx.instances)"` is the scale path beyond one instanced mesh `[skills/geometry.md:18]`.
10. Crowds avoid per-body skeletons: `"no skeleton() per body"`, one instanced mesh swayed by the material's `positionNode` `[skills/geometry.md:18]`.
11. Mesh-backed decoration is instanced and slope-filtered: `"instanced cover; filter.maxSlope cuts slopes"` `[skills/heightmap-terrain.md:37]`.
12. Explicit decoration density caps: `density` is items/m² of bound ground (starter meadow 50, stubble 3) `[skills/heightmap-terrain.md:33]`.

### 9.2 Chunking, streaming and batching

13. Field paint is cheap and local: `"takes any radius (~1 ms at 11 m)"`, a PLAYER-layer dab seen by others a few ticks later `[skills/heightmap-terrain.md:43]`.
14. Voxel chunks rebuild incrementally: `"hash the day and params its cells read (0: none); only chunks whose key moved rebuild"` `[skills/voxel-terrain.md:52]`.
15. `verticalRange` bounds streaming, generating and slices; `lodRanges` defaults to `[96, 288]` `[skills/voxel-terrain.md:53]`.
16. Voxel writes are chunk-batched: `"one command per touched chunk"`, with `{ left }` reporting unreached or unread cells `[skills/voxel-terrain.md:60]`.
17. Voxel queries should use `"small radii, seldom, never per frame"` `[skills/voxel-terrain.md:64]`.
18. Changed-cell batches explicitly exclude streaming: `"by any hand (not streaming); boxes [{ min, max }], each one voxels.read"` `[skills/voxel-terrain.md:67]`.
19. Per-chunk batching groups `"its cubes (a chunk's sway as one)"` and bakes `"ordered overlays into chunk mesh + collider"` `[skills/voxel-terrain.md:56,69]`.
20. Block tick flags are opt-in: `"only the flags it needs"` (randomTick / scheduledTick / neighborChanged) `[skills/voxel-terrain.md:57]`.
21. `tree-fetch` is an undocumented kernel-internal logging tag (0 matches in all 23 skills, api-reference.md, README.md, skills.md and all 28 notes); see section 8.7.

### 9.3 Visibility, culling and cameras

22. View cameras are visibility- and device-gated: `"A view draws only while a player sees its face, smaller and rarer on a weak device."` `[skills/portals.md:30]`.
23. `"fog and shadows count from the eye"` — render-phase distances start at the camera `[skills/cameras.md:46]`.
24. Objects have an explicit visibility window: `visibleRange?: { min?, max? } | null` `[api-reference.md:513]`.
25. Shadows are per-light toggles: `shadow?: { enabled?: boolean; softness?: number }` `[api-reference.md:1120]` (also `atmosphere.sun.light.shadow` at 603).
26. Camera-arm casts are change-driven and size-filtered: `"ids from a multiple: true raycast aim to eye, on change"` and `minSize: 1` keeps posts, coins and branches from stopping it `[skills/cameras.md:12]`.
27. Spectators cost nothing: `"the body vanishes from every eye and collides with nothing"` while keeping the room slot `[skills/rooms-and-matchmaking.md:54]`.
28. Replication scope: must-see rows use `audience: "all"` `[skills/rooms-and-matchmaking.md:45]`; the field is `"near" | "all" | "local"` `[api-reference.md:649]`.

### 9.4 Cadence, render phase and device dials

29. Boot-time asset cost is deferred: `"one cook, not one a turn"`, and `"The DM comes once the file is live at world scale; compression lands later."` `[skills/uploaded-models.md:18,26]`.
30. Camera rig cadence is conditional: `onInput` ignores `dt`, and a live look rig reaches 120/s only while posing a target `[skills/cameras.md:8]`.
31. Tick-rate rows are interpolated per frame: `"its row steps per tick, but the engine lays that eye on the drawn body each frame"` `[skills/cameras.md:44]`.
32. HUD work belongs in CSS: `"a glide is CSS; read ctx.now() only to draw time"` `[skills/game-ui.md:11]`.
33. Scripts avoid per-frame art work: atlases `"re-run only when that changes"` and are `"per viewer, never a pan script"` `[skills/2d-mode.md:16,41]`.
34. Explicit render/tick dials: `targetFps?: number` and `graphics?: { perfectPixelArt?: boolean | number; antialias?: boolean }` `[api-reference.md:910,911]`.
35. `ctx.device.hold` is 0..1, `"the memory this viewer can carry"`; tier branches are render-only `[skills/fx.md:33]`.
36. Quality re-tiering is device-capped and adaptive: `"quality re-tiers their renderer to it, terrain reach included"` and `"late frames still lower resolution beneath it"` `[skills/player-settings.md:8]`.

### 9.5 Simulation ownership and amortised work

37. Simulation ownership is locality-gated: `simulatedBy` is `"null when no machine runs it now (as when it rests far from every player)"` `[api-reference.md:1195]`.
38. Platform rows run unattended: `"even with nobody near. = null undials; undialed, it stops in an empty place"` `[skills/platform-systems.md:34]`.
39. State writes avoid round trips and ping-pong: `"a dot write where the player simulates with no round trip and no save call"` `[skills/platform-systems.md:8]`; `"a second referee repairing the same fact from another place builds ping-pong"` `[skills/rooms-and-matchmaking.md:43]`.
40. Offline work is amortised to visits: `"a ctx.sql read in tick or a cron costs one call per visit"` and `"between visits nothing runs"` `[skills/rooms-and-matchmaking.md:46]`.
41. Room capacity planning: `"size it to matches × match size + lobby headroom"`; past that, per-match rooms by name `[skills/rooms-and-matchmaking.md:43]`.

### 9.6 Telemetry semantics

42. `drawCalls` includes `"every pass, the shadow maps included"` `[api-reference.md:1806]`.
43. `cpuMs` is renderer-only: `"the game's scripts and physics run apart and are not counted"`; `"A read empties this handle's list"` for frames `[api-reference.md:1808,1810]`.
44. `gpuMemoryMB` counts `"every texture and buffer its renderer made"`; heartbeat is `"one message every 5 s"` and `"Downloads of models, pictures and sounds are not counted."` `[api-reference.md:1812,1814]`.
45. Adaptive resolution: `renderScale` goes `"below 1 while it draws smaller to keep frames fast"`; player `latencyMs` is `"refreshed every few seconds"` `[api-reference.md:1813,1402]`.

### 9.7 Sleep and joints

46. Sleep state is readable per handle: `sleeping: boolean | null` and `awake: boolean | null` `[api-reference.md:1196,1197]`.
47. Driven joints keep bodies awake: `"they cost what any moving body costs, every tick; a still target lets them sleep"` `[api-reference.md:1066]`.

### 9.8 New explicit caps and offload knobs

48. `maxParticles: N` `[api-reference.md:2154]`, `expectedAlive: number` `[api-reference.md:983]`, `findPath(..., budget?)` `[api-reference.md:2025]`, and GPU compute offload `.compute(count, workgroupSize = 64)` `[api-reference.md:2186]`.


## 10. Physics spec facts missing from the notes

Same citation convention as section 9. Duplicates already written in section 9 (voxel batching, tier streaming, `sleeping`/`awake`, `simulatedBy: null`, `cpuMs` excluding scripts) are not repeated here. `[skills/physics.md:N]` is the 1,074-byte physics skill.

### 10.1 Body and collider spec

1. Primitive capsules size by `halfHeight`, while `physics.capsule` uses end-to-end `height`: `{ kind: "capsule"; radius?: number; halfHeight?: number; capSegments?; radialSegments? }` `[api-reference.md:553]`.
2. `autostep?: { maxHeight, minWidth } | false` `[api-reference.md:504]`.
3. Six named axis/rotation locks: `lockedAxes?: ["x" | "y" | "z" | "rotX" | "rotY" | "rotZ", ...]` `[api-reference.md:504]`; `PhysicsWorld.add` accepts the same list `[api-reference.md:1943]`.
4. Friction and restitution combine modes are `"average" | "min" | "multiply" | "max"` `[api-reference.md:504]`.
5. `timeScale` scales physics-adjacent systems explicitly: `"Scripts' dt, sim.js ctx.dtMs, physics, after() timers, animate, clips, sprites, particles, effects"` `[api-reference.md:1330]`.

### 10.2 Forces, impulses and joints

6. `ForceEntrySpec` supports an off-centre application `position?: Vec3` `[api-reference.md:976]`.
7. The `impulse` act payload is richer than a Vec3: `{ target: string; impulse?: Vec3; position?: Vec3; angularImpulse?: Vec3 }` `[api-reference.md:691]`.
8. Joint-limit `stiffness` units: `"N·m per radian past the stop, N per metre on a prismatic or spring joint"`; omitted `damping` is `"critical"` `[api-reference.md:1063]`.
9. Spring joints: `"Spring stiffness in N/m (spring joints only)"` `[api-reference.md:1068]` and `"Spring damping in N·s/m (spring joints only)"` `[api-reference.md:1069]`.
10. Joint `target` is `"measured as limits are"` and may be a quaternion `[api-reference.md:1065]`; `.target`/`.strength` also drive `"a ragdolled rig's bones too"` `[skills/physics.md:9]`.
11. `breakTorque` is `"Break when peak joint reaction torque exceeds this many newton-metres"` `[api-reference.md:1072]`; `JointBreakEvent.cause` is `"force" | "torque" | "force-and-torque"` `[api-reference.md:1054]`.

### 10.3 Contacts, raycasts and queries

12. The contact payload's `impulse` is `number`, with optional position and normal `[api-reference.md:868]`.
13. Overlap queries can include sensor volumes via `includeSensors?: boolean` `[api-reference.md:1235]`.
14. `raycast` tag filters and options: `tags?, anyTags?, excludeTags?, bodies?: "static" | "dynamic" | "all", through?, physicsOnly?` `[api-reference.md:1936]`; the PhysicsWorld overload filters with `ignoreEntities?: PhysicsBody[]` `[api-reference.md:1947]`.
15. Detached physics bodies expose `PhysicsBody.passThrough: PhysicsBody[]` `[api-reference.md:1954]`.
16. Raycast verdict reports `pendingColliders: string[]; pendingColliderCount: number; terrain: boolean | null; pendingGeometry?: string[]` `[api-reference.md:1451]` — queries can be partial while colliders/geometry are still loading.
17. `findPath` has a `budget?` option whose default is not stated `[api-reference.md:2025]`.
18. `TraverseCheckBlockReason` enumerates `"riser_exceeds_autostep" | "slope_exceeds_max" | "gap" | "ceiling"` and more `[api-reference.md:1753]`.

### 10.4 Voxel physics

19. `solid` (physics, default true) and `cutout` (alpha-tested art) are independent settings `[skills/voxel-terrain.md:55]`.
20. `liquidKind`, not non-solidity alone, makes a voxel liquid (`onLiquidEnter/Exit`) `[skills/voxel-terrain.md:55]`.
21. Pure shape resolvers from `builtin/block-shape` are shared by `"render, physics and support"` `[skills/voxel-terrain.md:71]`.

### 10.5 Vehicles, platforms and triggers

22. A parked vehicle cancels `"~0.6 of each wheel's slip per tick, bounded 0.2–0.4 of grip"` `[skills/vehicles.md:24]`.
23. Kinematic lifts `"carry riders and release them with momentum"` `[skills/interactive-objects.md:13]`.
24. Trigger traps `"re-arm timer on its own state"` `[skills/interactive-objects.md:12]`.
25. A seated rider has no body, so `"the car meets the glass and crossing it takes the driver"` `[skills/portals.md:27]` (also noted in README.md's upstream-update section).

## 11. Coverage after this run

The gap list in section 1 is now closed: sections 2-5 hold the measured runtime mechanisms, section 8 the worker constants, section 9 the docs-level optimization strategies, and section 10 the physics spec details. Every previously-zero keyword (`optimization`, `streaming`, `culling`, `broadphase`, `warmStart`, `CCD`, `arrivalBudget`, `shedFraction`, `pixelProvenance`, `body-rest`, `support-hold` as a phase) now appears in this file and is indexed below.

The two gaps that section 11 called "no public source found" were closed in section 13 by parsing the cached Mantle WASM binaries and the runtime worker: the full 44-export kernel ABI and the `findPath` budget default of 20000. The hook dispatcher's binding logic was decompiled in section 15 for build 2792ef38; only the surrounding minified scheduling functions remain build-specific (see kernel-worker.md). GPU telemetry was resolved in sections 12 and 14: a CPU eye stays `unmeasured` / `unsupported (no timestamp-query)`, while a GPU-rendered client produces real frame/GPU timings, quality tier, per-device health and the `tick-shed` governor (section 14). Only per-pass GPU attribution stays `warming` / empty even on that client.

## 12. CPU-rendered telemetry: a measured negative (superseded for frame timings by section 14)

Earlier sections used a headless (`--render none`) client, so `getPerformanceSnapshot()` reported `gpu.status "unsupported (no timestamp-query)"`, `scene.drawCalls 0`, `triangles 0` and no client health rows. That left GPU pass attribution as the one open measurement. This section settles it with a **CPU-rendered eye**.

### 12.1 Getting a rendered eye without the 120 MiB download

`spawn client join --render cpu` first installs a one-time browser runtime (`playwright@1.64.1` plus Chrome Headless Shell 156.0.8078.4, 120 MiB). That download stalled at 0% on this machine and the first join died with `"eye lost: The CPU eye died before its page stood (launch: Executable doesn't exist ...)"`. The client bundle at `/config/.cache/spawnco-client/<hash>/main.mjs` reveals the override:

```
function MM($=process.env){let Q=$.SPAWN_CLIENT_CHROMIUM_PATH?{executablePath:$.SPAWN_CLIENT_CHROMIUM_PATH}:{}, ...}
```

There is already a Chromium at `/data/cache/bin/chromium` (also `/usr/bin/chromium-browser` and `/data/cache/bin/google-chrome`). This joins successfully:

```
SPAWN_CLIENT_CHROMIUM_PATH=/data/cache/bin/chromium \
  spawn client join @lanmower/the-savi-gallery --render cpu \
  --engine 26ad9a7aa2a8a81fbf40ea21c91dab3f --ttl 600 --name gpuprobe
```

Join output: `"eyes: CPU frames at 640 × 360; the page is 1280 × 720"`, `page http://127.0.0.1:37081`, `"room: 1 entity · 1 player"`, engine `26ad9a7a`. A `--realm browser` exec confirmed the renderer really exists: `canvas: true`, rect `1280 × 720`, `devicePixelRatio 1`, `navigator.gpu: true`, `document.hidden: false`, `document.title "Spawn agent client"`.

### 12.2 What a rendered client actually reports

Game realm after 15 s and again after 35 s:

| Field | Headless (`--render none`) | CPU eye (`--render cpu`) |
|---|---|---|
| `ctx.view.fps` / `drawCalls` / `triangles` | 0 / 0 / 0 | 0 / 0 / 0 |
| `ctx.view.cpuMs` / `gpuMs` / `renderScale` | 0 / 0 / 0 | 0 / 0 / 0 |
| `ctx.view.memoryMB` | null | null |
| `ctx.view.pixel` | 0.0010691671651659738 | 0.0010691671651659738 |
| `netInBytes` / `netOutBytes` | 0 / 0 | 12002 / 22859 |
| `netInMessages` / `netOutMessages` | 0 / 0 | 37 / 32 |
| `client.frame` | `{cpuMs 0, gpuMs null, budgetMs 0}` | same, plus `verdict {code: "unmeasured", frameMs: null, pctOfBudget: null, causes: []}` |
| `client.gpu` | `unsupported (no timestamp-query)`, 0 passes | identical |
| `client.scene` | 0 drawCalls, 0 triangles, 0 groups | identical |
| `client.memory.pageMb` | null | 14.6 |
| `client.tier` / `renderScale` / `tierSummary` / `held` / `bakes` / `wire` / `bootRead` / `hud` | null | null |
| `getClientHealth().clients` | 0 | 0 |

The health note is unchanged even after 35 s: `"No client health reports yet; clients report every ~15s once their renderer is up; re-check shortly."` So `frame.verdict.code === "unmeasured"` with an empty `causes` array is the definitive marker that frame/GPU telemetry is not wired, even though the page has a canvas and WebGPU. **GPU pass attribution cannot be measured on this machine's CPU eye**; it needs a GPU-rendered client whose adapter supports timestamp queries. That closes the gap with a reason rather than leaving an open question.

### 12.3 What the rendered client did add

- `pace.measuredTickRate` reached `30.1` against a budget of 30, and `shedFraction` moved `0 → 0.002 → 0` across samples while `verdict` stayed `"on-budget"`. Adaptive tick shedding is live and observable even when the verdict is nominal.
- Under the rendered load, `client.tick` was `{p50Ms 9.7, p95Ms 59, budgetMs 33.3, lateMaxMs 998.6, gc "ran", lateGc "minor", maxMs 615.7, pctOfBudget 29}` — roughly 2× the headless p50 (4.3 ms) and 13% → 29% of budget, with a ~1 s late tick attributed to GC.
- `behavior` was `{totalEntities 186, updatedEntities 18, scheduleSkippedEvery 14, scheduleSkippedNear 0}` — the culling counters move with the room population but keep the same shape.
- `memory` gained `pageMb 14.6`, `things 1160`, `residencyThings 30` (vs 1145 / 15 headless), `heldMb 203.9`; `pingMs` was 735 (vs 389 headless).
- `server.top` stayed led by `tome/behavior-update` (p50 2.107 ms, p95 3.088 ms) and `physics/step` (p50 1.695 ms, p95 1.841 ms).

### 12.4 Cleanup

The rendered session `gpuprobe` was left; `spawn client status` reports no live sessions. Section 14 supersedes this negative result with a working GPU-rendered eye. The spawn client's CPU-eye page at `127.0.0.1:37081` is owned by that session and closes with it. The shared playwriter browser was listed before and after: it still has only the two pre-existing browsers and their single pre-existing blank pages; no playwriter page was opened or closed by this probe. The stalled `pwinstall` job was stopped.

## 13. The Mantle WASM kernel ABI and the findPath budget (both gaps closed)

Section 11 listed three things with "no public source found". A JIT search of the engine cache and the durable runtime worker closed two of them on 2026-11-06.

### 13.1 The physics solver is a real WASM binary, and its ABI is readable

The room-host cache holds `mantle-core.<sha>.wasm` files alongside each runtime worker — **18 files across 5 distinct sizes** (470,027 / 470,047 / 470,407 / 470,898 / 471,618 bytes), all with magic `00 61 73 6d 01 00 00 00` (WASM v1). A parse of the WASM export section (id 7) gives **44 exports, identical across all 5 builds**, so the ABI is stable even as the binary changes. A durable copy is at `/workspace/savi/.spawn/kernel/mantle-core.cedc1a4a242dce3143f075fe3dc65da79c6a1cf425cbd16db602450be8fd3ec7.wasm` (470,407 bytes). Section ids present: `[1,2,3,4,5,6,7,9,12,10,11]` (types, imports, functions, tables, memory, globals, exports, elements, data count, code, data).

Grouped exports:

- **Runtime/ABI (9):** `memory`, `mantle_abi_version`, `mantle_build_simd`, `mantle_alloc`, `mantle_free`, `_initialize`, `__indirect_function_table`, `_emscripten_stack_restore`, `emscripten_stack_get_current`. It is an Emscripten build with a SIMD variant flag.
- **Solver (10):** `mantle_solver_load`, `mantle_solver_prepare`, `mantle_solver_warm_start`, `mantle_solver_solve`, `mantle_solver_restitution`, `mantle_solver_commit_contacts`, `mantle_solver_integrate_velocities`, `mantle_solver_integrate_positions`, `mantle_solver_finalize`, `mantle_solver_substeps`. These map one-to-one onto the `mantle:*` phase names in section 2.1 (solverPrepare → prepare, warmStart → warm_start, velocitySolve → solve, relaxation → substeps, restitutionFinalize → restitution, integrate → the two integrate calls).
- **Sleep/islands (4):** `mantle_sleep_prepare`, `mantle_sleep_union`, `mantle_sleep_finish`, `mantle_sleep_step` — the `mantle:islandsSleep` phase is four WASM calls.
- **Contact cache (4):** `mantle_cache_seed`, `mantle_cache_store`, `mantle_contact_reuse`, `mantle_contact_assemble`. These are the kernels behind `persistentPairs` and `contactSeed`/`contactStore`. The worker guards them: `"Mantle WASM is missing the collision batch kernel"` (checks `mantle_world_collide` and `mantle_convex_scratch_bytes`), and a template guard `Mantle WASM is missing ${W}` over `mantle_ccd_bytes`, `mantle_ccd_step`, `mantle_convex_scratch_bytes`.
- **Ownership/mesh (9):** `mantle_owner_edit`, `mantle_owner_find`, `mantle_owner_seed`, `mantle_owner_store_commit`, `mantle_owner_mesh_scratch_bytes`, `mantle_owner_dispatch`, `mantle_owner_complete_fallback`, `mantle_owner_policy_set`, `mantle_owner_policy_clear`. Simulation ownership (`simulatedBy`) has dedicated WASM kernels.
- **Collision, CCD and ray (8):** `mantle_convex_scratch_bytes`, `mantle_collide_batch`, `mantle_collider_pose_batch`, `mantle_convex_batch`, `mantle_world_collide`, `mantle_surface_ray`, `mantle_ccd_bytes`, `mantle_ccd_step`.

The worker also exposes an audit switch: `CqN=globalThis.process?.env?.MANTLE_CCD_BOUND_AUDIT==="1"`. Solver numeric constants visible nearby: `WqN=48, FqN=6, $A0=1e-7, BqN=4, zqN=40, DqN=3, _c1=5.960464477539063e-8, Ec1=2*_c1+_c1*_c1+8*Number.EPSILON, LqN=64, PqN=0.9375, Sc1=64, ic1=84` (stride of a contact/word slot), and `CqN` for the CCD audit. `mantle_ccd_step` plus the `ccdToiIterations` / `ccdToiCapHits` counters in section 2.2 confirm continuous collision detection runs inside WASM.

### 13.2 The `findPath` budget default is 20000

`api-reference.md:2025` documents `budget?` without a value. The runtime worker contains the implementation:

```
var HrX=20000,d8F=16,vaA=3,WrX=1.5,kaA=2.5,ck8=0.05
let N=X?.budget,L=Math.floor(i2(N,HrX,"findPath budget")),P=g8F(D,kI0,uQ8,L*c1)
```

with `c1=4` in the nav scope and `bI0=($)=>Math.floor($/c1)`. So the default is **20,000** and the search expansion cap passed to `g8F` is `floor(budget) * 4` = **80,000** by default. The validator is:

```
function i2($,Q,J,Z=0){if(typeof $!=="number"||!Number.isFinite($))return Q;if($>Z)return $;return ne8(J,$,Z,`the default ${Q} stands`),Q}
```

A non-numeric, non-finite, or non-positive `budget` falls back to 20000 and emits `tome/value-floor` / `teach.value.degenerate-zero` with a message of the form `"findPath budget: <value> is at or under its floor (0); the default 20000 stands. Write a number above 0."`.

The nav module's own exports are `findNavPathWhole`, `findNavPath`, `NAV_PLAN_PROFILE`, `NAV_FINE_HORIZON_M` (16 m), `DEFAULT_NAV_AGENT`, plus census helpers. Its default agent class is `class a8F{radius=0.5;height=0.5;step=0.5;slopeCos=0.5;maxDrop=0.5}`. Note this differs from the documented `findPath` defaults at `api-reference.md:2022` ("maxDrop is 3 meters, bodies is all") — the class above is the internal nav-grid agent, not the caller-facing default. `VERBS._navPath = sense("findPath", ["from","to","opts"], noPath)` with `noPath = () => ({ points: [], ok: false })`, and the client-side verb table budgets `findPath` under `qOF` (see section 8.4).

### 13.3 What remains

The **minified dispatcher** was resolved in section 15: the `Ak0` → `__spawnRealmLib.$$25b` → `otJ` indirection chain, the `u3N` binder, the alias precedence, the `lateUpdate` → no-op `update` rule, and the ears/health validation are now readable. Only the surrounding per-tick scheduling functions remain minified and build-specific; their behaviour is measured in sections 2-3.

## 14. GPU-rendered telemetry (the GPU gap, resolved)

Section 12 concluded that a CPU eye leaves frame/GPU telemetry `unmeasured` and that a GPU-rendered client would be needed. That client is now available and the answer is: **frame and GPU timings, quality tier, per-device health and the adaptive governors are all measured; only per-pass GPU attribution stays warm/empty.** Setup, same override as section 12 but with `--render gpu`:

```
SPAWN_CLIENT_CHROMIUM_PATH=/data/cache/bin/chromium \
  spawn client join @lanmower/the-savi-gallery --render gpu \
  --engine 26ad9a7aa2a8a81fbf40ea21c91dab3f --ttl 600 --name gpu2
```

Join banner: `"eyes: GPU frames at 640 × 360 (in software on a machine with no GPU the browser can use; each screenshot names the adapter that drew it)"`, page `http://127.0.0.1:43805`, `"room: 541 entities · 1 player"`. Despite the banner's software caveat, the client's own tier report says `"rendering on NVIDIA NVIDIA GeForce RTX 3060 Laptop GPU (ampere architecture)"`, and `/dev/dri/renderD128` exists. `ctx.quality` is `"ultra"` (vs `"high"` headless/CPU).

### 14.1 Frame and view numbers

| Field | Headless | CPU eye | GPU eye |
|---|---|---|---|
| `ctx.view.fps` | 0 | 0 | **60** |
| `ctx.view.drawCalls` | 0 | 0 | **321** |
| `ctx.view.cpuMs` | 0 | 0 | **8.881** |
| `ctx.view.gpuMs` | 0 | 0 | **4.041** |
| `ctx.view.gpuMemoryMB` | 0 | 0 | **203** |
| `ctx.view.renderScale` | 0 | 0 | **1** |
| `ctx.view.pixel` | 0.0010691671651659738 | 0.0010691671651659738 | **0.0032075015530669015** |

`pixel` differs because the GPU eye draws 640 × 360 frames — the angle per screen pixel is the fov over the frame's rows, so a smaller frame gives a larger `pixel` and an earlier LOD handover at `c / ctx.view.pixel`. This is the first live confirmation that LOD handover distance is a function of the actual rendered frame size.

`client.frame`: `{cpuMs 8.881, gpuMs 4.041, budgetMs 16.666666666666668, fps 60, chipSlowed false, budgetBy "slot", frameMs 8.881, verdict {code "on-budget", frameMs 8.881, pctOfBudget 53, causes []}}`. The frame budget is **16.667 ms (60 fps)**, assigned "by slot", not the 33.333 ms simulation tick budget.

`client.frame.cpuStepsMs` gives the render-phase attribution, worst first: `lume/render 7.87`, `lume/prepare 3.127`, `lume/compute 1.535`, `lume/collect 1.528`, `prepare/primitives 1.182`, `prepare/terrain/decorations 0.895`, `lume/execute 0.89`, `prepare/terrain/decorations/ground 0.82`, `prepare/models 0.66`, `post-compute/lighting 0.592`, `shadow/sun/collect 0.583`, `adapter/total 0.548` ms. Note these overlap/sum above `cpuMs` — they are per-step samples, not a partition of one frame.

`client.scene`: `{drawCalls 321, triangles 0, uncountedDraws 0, drawless "rest", groups [{center "scatter:x6-bed", draws 0, tris 0, estimate true, asked 40, note "draws 0 % of its 40 instances at this budget"}], models []}`. The `estimate`/`asked` pair is the engine's own culling telemetry: a scatter group asked for 40 instances and drew 0 at this budget.

`client.tier`: `{class "ultra", source "measured", active "ultra", activeSource "detected", msPerMpx 1.1411495506763458, canvasPixelBudgetPx null, rendering "rendering on NVIDIA NVIDIA GeForce RTX 3060 Laptop GPU (ampere architecture)"}`. This matches the `VYG=[50,100,250]` quality tiers in section 8.5 — "ultra" is the top measured class.

**Per-pass GPU attribution stays unavailable.** `client.gpu` reported `{status "warming: read again in ~10s", passes []}` on the first read and on four further reads spaced 11 s apart (≈44 s total). So `gpuMs` is measured by the adapter timer, but the timestamp-query pass breakdown the `getPerformanceSnapshot()` note promises ("read again in ~10s for GPU pass attribution") does not populate in this headless GPU configuration. That is the final word on the gap: frame/GPU timing, tier, health and governors are documented here; pass-level attribution needs a client whose adapter supports timestamp queries.

### 14.2 Per-device health and adaptive quality

`getClientHealth()` went from 0 to **1** client, with note `"Per-device diagnostics, one entry per reporting client (newest snapshot each; reports land every ~15s). Quality is the device's adaptive render quality: the rows its governor holds."`

The client's `quality` row: `{pinned true, lowered false, atFloor false, memorySteps 0, renderScale 1, renderScaleAsked null, canvasScale 1, skipBloom false, sunCascades 3, farLand false, forced false, budgetFrameMs 16.666666666666668, frameMs 0, inGrace true, gpuOverBudget false, deviceClass "desktop", fps null, sceneSamples null}`. Its `qualitySummary`: `"picture fixed on this screen at the full picture: this screen is a body's page, so the adaptive quality never moves its picture; it draws every frame while a hand plays it or a perf read measures it..."` — a body's own page is **pinned** at full resolution; adaptive scaling applies to player-facing screens. Its `tierSummary`: `"graphics tier: ultra (measured 1.14 ms/Mpx on this machine) · rendering on NVIDIA NVIDIA GeForce RTX 3060 Laptop GPU (ampere architecture)"`. `renderer`: `{skippedDraws 0, parkedPipelines 0, pendingPipelines 0, clipLegs 1}`; `drawSummary` reports a clip still being fitted to the body (`"clip cdn/clip-waving-both-hands-loop.glb ... not playing for ~6s; asking: still being fitted to the body; the body plays its own clips meanwhile"`).

### 14.3 The tick-shed governor, observed end to end

`getClientHealth().clients[0].governors` exposes **`tick-shed`** as a real adaptive degradation strategy. Its `governorSummary` reads `"engine governors reducing work; designed degradation, not a bug: tick-shed: 1 backlog clamp shed 32.3ms of sim time in the last 26s: the sim runs in bounded slow motion instead of catch-up bursts (host-overload, for ~24s)"`.

The `recent` array shows the full lifecycle with events `engaged`, `level-changed`, `released`, always `why: "host-overload"`, and escalating levels:

- `engaged`: `"1 backlog clamp shed 2674.5ms of sim time in the last 5s"`
- `level-changed`: `"13 backlog clamps shed 4789.6ms of sim time in the last 10s"`
- `level-changed`: `"24 backlog clamps shed 5175.6ms of sim time in the last 21s"`
- `released`: `"31 backlog clamps shed 5627.5ms of sim time in the last 25s"`
- `engaged` / `released`: `"1 backlog clamp shed 32.3ms of sim time in the last 26s"`

So when the host is overloaded the engine **sheds accumulated sim time rather than replaying it in catch-up bursts**, and reports the shed amount, the number of backlog clamps, the reason, and timestamps. `pace.shedFraction` (sections 3 / 12) is the summary of this governor in `getPerformanceSnapshot()`. The worker's `lIq="tick-shed"` constant (section 8.1) is the same mechanism.

`getPixelProvenance({screen:[0.5,0.5]})` returned an empty object in this configuration, and `ctx.view.frames` was `[]` (a read empties the handle, as `api-reference.md:1810` says).

### 14.4 Cleanup

Session `gpu2` was left; `spawn client status` reports no live sessions. The GPU eye's page closes with its session. The shared playwriter browser was listed before and after: still the same two pre-existing browsers and their pages; no playwriter page was opened or closed by this probe. No commits or pushes were made.

## 15. The hook dispatcher, decompiled for build 2792ef38e4f4

Section 13.3 left "the full decompiled minified dispatcher" open. The **binding core is now decompiled**: the indirection chain and the function that turns a behavior module into a hook map are both readable. Only the surrounding bundle remains minified.

### 15.1 The indirection chain

The alias table `Ak0` (23 entries, section 8.8) is defined at line 516 and exported in the realm library map as `$$25b:Ak0`. The consumer module does not import it by name; it reads it lazily through `__spawnRealmLib`:

```
var otJ; var Uf1 = x(() => { otJ = __spawnRealmLib.$$25b });
```

`x` is the bundler's lazy initializer, so `otJ` becomes the alias table once that module is first touched. A separate scope reuses the name `Ak0` for an unrelated "unevaluated fact" predicate at line 4191 (`Ak0=($)=>$!==void 0&&($.unevaluated===!0||$.unmeasured===!0||KmY($))`), which is why a plain name search was misleading. The catalog arrays are `GI0` (crossing hooks), `YI0` (sim hooks), `KI0` (authoring hooks), merged as `Ev=[...GI0,...YI0,...KI0]` with `FI0=Hq=["updateSchedule","scopes","ears"]` as the named data exports.

### 15.2 The binder, verbatim (line 7374)

```
u3N=($)=>{let Q=$.default!==null&&typeof $.default==="object"?$.default:{},J={};
for(let[V,G]of otJ)for(let U of G){let q=$[U]??Q[U];if(typeof q==="function"){J[V]=q;break}}
if(J.lateUpdate!==void 0&&J.update===void 0)J.update=m3N;
let Z=$.updateSchedule!==void 0?$.updateSchedule:Q.updateSchedule;if(Z!==void 0)J.updateSchedule=Z;
let X=$.scopes!==void 0?$.scopes:Q.scopes;if(X!==void 0)J.scopes=X;
let Y=$.ears!==void 0?$.ears:Q.ears;if(Y!==void 0)J.ears=Y;
return J.health=z59($),J}
```

with `m3N=()=>{return}` (a no-op) and `z59($)` returning module health metadata. Readable renaming:

```js
function bindHooks(moduleNamespace) {
  const fallback = (moduleNamespace.default !== null &&
                    typeof moduleNamespace.default === 'object')
                   ? moduleNamespace.default : {};
  const hooks = {};
  for (const [canonical, aliases] of aliasTable) {
    for (const alias of aliases) {
      const candidate = moduleNamespace[alias] ?? fallback[alias];
      if (typeof candidate === 'function') {
        hooks[canonical] = candidate;
        break;
      }
    }
  }
  if (hooks.lateUpdate !== undefined && hooks.update === undefined)
    hooks.update = () => { return; };
  if (moduleNamespace.updateSchedule !== undefined) hooks.updateSchedule = moduleNamespace.updateSchedule;
  else if (fallback.updateSchedule !== undefined) hooks.updateSchedule = fallback.updateSchedule;
  if (moduleNamespace.scopes !== undefined) hooks.scopes = moduleNamespace.scopes;
  else if (fallback.scopes !== undefined) hooks.scopes = fallback.scopes;
  if (moduleNamespace.ears !== undefined) hooks.ears = moduleNamespace.ears;
  else if (fallback.ears !== undefined) hooks.ears = fallback.ears;
  hooks.health = moduleHealth(moduleNamespace);
  return hooks;
}
```

### 15.3 What the binder actually specifies

1. **First alias wins.** For each canonical hook name, aliases are tried in the table's order and the first function found is bound; the rest are ignored. So `spawn` is accepted for `onSpawn`, `onDestory` (typo) and `destroy` for `onDestroy`, and `onTrigger` for `onTriggerEnter` — but an explicit `onSpawn` outranks `spawn` because it appears first.
2. **Namespace beats default export.** A named export on the module namespace takes precedence; `export default { ... }` is only a fallback object.
3. **`lateUpdate` implies `update`.** If a module exports `lateUpdate` but no `update`, the binder inserts a no-op `update`. This is the exact mechanism behind the catalog note "A script that exports only `lateUpdate` runs on `update()`'s gate" — the gate exists because `update` is always present after binding.
4. **Named data exports are copied, not bound as hooks.** `updateSchedule`, `scopes` and `ears` are attached to the hook map as data, with the same namespace-over-default precedence. `ears` handlers are therefore read from the object's own data export, never wired as event listeners.
5. **Health metadata is attached.** `J.health=z59($)` gives each bound hook map a health record, which is what the sim-health / script-rows tables in section 3 report.

### 15.4 The surrounding dispatcher pieces

- `ROF=()=>{let $=new Set(BvQ);return{hooks:otJ.filter(([Q])=>$.has(Q)),module:TRF,freeze:!1,refused:hRF}}` — a second consumer filters the same alias table down to an allowed hook set (`BvQ`), returning a descriptor with `module`, `freeze` and `refused` fields.
- Ears validation emits `tome.compile.ears_salvaged` with the teach string `"ears: ${X.join("; ")}. Valid shape: export const ears = { open: (ctx, payload, meta) => … }: one handler per event name. The script's hooks still run; only the dropped rows are ignored."` — malformed `ears` rows are dropped without disabling the module's hooks.
- The catalog's `teach:"none"` hooks are collected as `BI0=new Set(Ev.filter(($)=>$.teach==="none").map(($)=>$.name))` — i.e., the engine knows which hooks should not be taught to the creator.
- The deprecated-hook upgrade table `gv` (for example `onPlayerJoin → onArrive`, `onPlayerDisconnected → onLeave`, `onWorldStart → …`) is part of the same module and explains the "one spelling, one home" verdicts elsewhere in the worker.

### 15.5 What is still minified

The functions that *call* the binder, schedule `update`/`lateUpdate` per tick, apply `updateSchedule` culling, and dispatch `onCollide`/`onTriggerEnter` remain minified and spread across the 29 MB bundle. Their behaviour is already measured live in sections 2-3 and 9-10; their source is build-specific because every engine build renames the short symbols. So the dispatcher's **data model and binding logic** are now documented for build 2792ef38; a full source-level decompilation of the whole worker is neither portable nor necessary for the engine notes. This closes the last gap listed in section 11.
