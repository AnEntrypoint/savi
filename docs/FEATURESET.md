# Documented featureset: savi and spoint parity

This is the durable featureset for the jayzee <-> spoint parity work, with savi's documented surface and spawn's learnings. It is folded from `docs/PARITY-INPUTS.md`, the orchestrator's relay. Every figure below is one of three things:

- REPRODUCED: re-run in this checkout with the command shown, and the output matches.
- MATCHES RELAY: the relay figure is confirmed by a stated arithmetic sum or by the source's own text, with the command shown.
- UNVERIFIED: not reproduced by a command here. The reason is given.

Ephemeral provenance such as `/tmp/spoint-parity/*` and `/tmp/spawn-probe/*` is never a source.

Parity relationship: jayzee <-> spoint, plus savi's documented featureset and spawn's learnings. Both jayzee and spoint are unrelated to oscraft. Naming parity is not required and may be idealized. Feature parity is required: everything spawn is learning must be supported, and everything spoint has made must be implemented in jayzee. The feature-support contract lives in `docs/OPEN-ITEMS.md` under "Required feature support", which is extended there and not duplicated here.

## Documented featureset: /workspace/savi

Sources: `ENDPOINTS.md`, `scripts/openapi.json`, `.spawn/reference/http/CATALOG.md`, `.spawn/reference/http/api-types.md`, `spawn-engine/ASSET_SHAPES.md`, `spawn-engine/FEED_SCOPE.md`, `spawn-engine/PROJECT_ASSETS.md`, `spawn-engine/ASSETS.md`, `spawn-engine/FAULTS.md`, `.spawn/reference/README.md`, `.spawn/reference/COVERAGE.md`, `.spawn/reference/tome/INDEX.md`, `.spawn/reference/skills/INDEX.md`, `.spawn/reference/engine-deep/`, `gaps/netcode-optimization-gaps.md`, `gaps/morluto-rea-pr-9234-ci-findings.md`, `scripts/build-manual.mjs`, `scripts/check-manual.mjs`, `.github/workflows/publish.yml`.

### Count witnesses

Each row was run in `/workspace/savi` on HEAD `992b328`.

| Figure | Command | Output | Status |
|---|---|---|---|
| Endpoints 93 = 39 + 21 + 3 + 30 | `sed` on ENDPOINTS.md section headings, one count per section (`## Listed in the published spec (39)`, `(21)`, `(3)`, `(30)`) | 39, 21, 3, 30; sum 93 | REPRODUCED |
| HTTP doors 70 = 17 exercised + 53 documented | `cd http && grep -c -E '^\| [^\|]+ \| [^\|]+ \| [^\|]+ \| (exercised\|documented)' CATALOG.md` (spawn) | 70; a split by status gives 17 exercised and 53 documented, not exercised | REPRODUCED (spawn). The Method column is not always an HTTP verb, so a method-column count gives 56, not 70. |
| HTTP doors: 4 rows have no HTTP method | `grep` for rows whose Method column is not GET/POST/PUT/PATCH/DELETE | `delete`, `play.attach`, `git`, `openapi` (method not stated in source) | REPRODUCED. These are part of the 53. |
| API types 305 | Compare `cli/types/` file names with the names in `http/api-types.md` | 308 files in `cli/types/`; 305 match the list; 3 are `_list`, `_missing`, `_names` | REPRODUCED for 305 type files |
| `cli/types/` holds 308 files | `ls cli/types \| wc -l` (spawn) | 308 | REPRODUCED. These are 305 type files plus 3 `_` meta files (`_list.txt`, `_missing.txt`, `_names.txt`). |
| ASSET_SHAPES "names 308 types [verified]" | Live `GET /api/agent/v1/api` | needs a Bearer token (401 without); no credential used | UNVERIFIED. The live claim is not reproduced here (spawn). |
| Tome 68 distinct headings | `grep '^\| .* \| sections/' tome/INDEX.md \| cut -d'\|' -f2 \| sort \| uniq \| wc -l` | 68 (69 rows; `World Queries` appears twice) | REPRODUCED |
| Tome 69 section files | `ls tome/sections \| wc -l` | 69 | REPRODUCED |
| Builtin modules 21 | `ls tome/sections \| grep -c '^builtin-'` | 21 | REPRODUCED. The owner's 23 is not reproducible locally (OPEN-028). |
| Served skills 23 | `tail -n +5 skills/INDEX.md \| grep -c '^\| '` | 23 | REPRODUCED |
| Skills directory 47 entries | `cd skills && ls \| wc -l` (spawn) | 47 = 23 `.json` + 24 `.md` (the 24th is INDEX.md) | REPRODUCED |
| Engine docs 27 | `find engine -type f \| wc -l` | 27 | REPRODUCED |
| CLI top-level 39 | `find cli -maxdepth 1 -type f \| wc -l` | 39 | REPRODUCED |
| HTTP 18 indexed + 33 raw | `find http -type f -not -path 'http/raw/*' \| wc -l`; `find http -path 'http/raw/*' \| wc -l` | 18 non-raw files; 33 raw | REPRODUCED |
| Reference index total 208 | Sum of the README's per-job figures (tome 74, skills 47, engine 27, cli 39, http 18, guide 3) | 208 arithmetic only | UNVERIFIED. The tome bucket is not reproduced: tome has 75 files (73 `.md`), so the sum is 207 or 209 (spawn). The guide bucket is also off, see below. |
| Tome tree 74 | `find tome -type f` | 75 files: 69 sections, plus 6 top-level files (`all.md`, `all-refetch-2026-11-04.md`, `guide.md`, `INDEX.md`, `raw-all.json`, `raw-guide.json`) | UNVERIFIED. The index says 5 top-level files, but the tree has 6. |
| Guide 3 | `find guide -type f` | 5 files: `AGENTS-current.md`, `AGENTS-digest.md`, `served-guide.guide.txt`, `served-guide.json`, `served-guide.md` | UNVERIFIED. The index links 3, but the tree has 5. |
| Feed 3,421 projects, 66 engine versions | `grep` for `3421`/`3,421` in FEED_SCOPE.md | the figure appears in the text | UNVERIFIED for the walk. The text says it, but the walk is not re-run here, and 66 versions is not checked. |
| Assets 395 | `grep` for `395` in PROJECT_ASSETS.md | the figure appears in the text | UNVERIFIED for the URL count and the 4 families. The text says it, but the URL walk is not re-run here. |
| me.doors 60 keys | none | none | UNVERIFIED. It is a count of keys in a source not re-read here. |
| Reference README "208 files" as a tree count | `find .spawn/reference -type f -not -path '*/raw/*' \| wc -l` | 563 files, of which 180 are `.md` | UNVERIFIED as a tree count. 208 is the index total, not a tree count. |
| ENDPOINTS header "62 paths" vs sections summing to 63 | none | none | UNVERIFIED here. This is OPEN-001 and stays OPEN. |

### Other savi facts

- Endpoints: `ENDPOINTS.md` names 93 endpoints from an OpenAPI 3.1.0 spec. The 93 total reconciles (REPRODUCED). The header vs section discrepancy is OPEN-001.
- Completeness contract: `build-manual.mjs` generates `site/`. `check-manual.mjs` proves raw sha equality, displayed-text equality, link resolution, `.nojekyll`, seven workflow markers, manifest counts and manifest commit equal to HEAD. `publish.yml` builds and checks on every push to main, then deploys to Pages. Withheld from publication: `.spawn/reference/http/raw/`, `sources/`, `runs/`, `.playwriter/`, `site/`.
- Site: `site/` is gitignored (`.gitignore` line 2 `site/`), and `git ls-files site` = 0 (REPRODUCED).
- Netcode gaps: `gaps/netcode-optimization-gaps.md` documents 24 undocumented `src/netcode/` modules, a verified silent ring-overflow bug, the wire scale and five owner improvements (OPEN-024, HELD-OWNER). `gaps/morluto-rea-pr-9234-ci-findings.md` records PR 9234 CI findings.

## Documented featureset: /workspace/spoint

Verified read-only at `d5e3860`, with spoint's own confirmation of the first four figures:

| Figure | Command | Output | Status |
|---|---|---|---|
| Commits 2,233 | `git -C /workspace/spoint rev-list --count HEAD` | 2233 | REPRODUCED |
| Tracked files 2,293 | `git -C /workspace/spoint ls-files \| wc -l` | 2293 | REPRODUCED |
| Status lines 0 | `git -C /workspace/spoint status --porcelain \| wc -l` | 0 | REPRODUCED |
| PRD rows 103 | `grep -c '^  - id:\|^- id:' .gm/prd.yml` | 103 | REPRODUCED. fixed 34, refuted 28, retired 26, open 15 (relay). |
| `work/rows/` 142 | `ls work/rows \| wc -l` | 142 | REPRODUCED |
| `apps/world/` 13 `.js` files | `ls apps/world/*.js \| wc -l` | 13 | REPRODUCED |
| `apps/maps/` 16 entries | `ls apps/maps \| wc -l` | 16 | REPRODUCED |
| `docs/` 20 `.md` pages | `find docs -name '*.md' \| wc -l` | 20 (22 files total) | REPRODUCED |
| `scripts/` 193 top-level entries | `ls scripts \| wc -l` | 193 | REPRODUCED |
| `src/stdlib-apps/` 29 apps | `ls src/stdlib-apps \| wc -l` (spoint) | 29 | REPRODUCED. The relay's 31 is not in the tree (spoint). |
| `scripts/` 115 `witness*.mjs` directly in `scripts/` | `git ls-files scripts \| grep -E '^scripts/[^/]*witness[^/]*\.mjs$' \| wc -l` (spoint) | 115 | REPRODUCED under this definition. A recursive basename match `(^\|/)witness[^/]*\.mjs$` under `scripts/` gives 7 (spoint). |
| `harness*.mjs` | `git ls-files \| grep -E '(^\|/)harness[^/]*\.mjs$' \| wc -l` (spoint) | 0 repo-wide. Under `scripts/` with the contains form `harness.*\.mjs$`, 6. | REPRODUCED. The relay's 6 uses the contains definition, not the prefix glob. |
| Verdict files, 76 | `git ls-files \| grep -i verdict \| wc -l` (spoint) | 78 total; 76 under `.gm/witness-out`, 2 under `scripts/lib` | REPRODUCED for `.gm/witness-out` only. |

- Protocol: `src/protocol/MessageTypes.js` (WIRE_PROTOCOL_VERSION 5, opcodes 0x01..0xc7, unreliable set, disconnect reasons), `msgpack.js` WIRE_STRUCTURES, `InputCodec.js`, `ComponentSchema.js`, `CursorEventStream.js`, `EventEmitter.js`.
- Netcode: `SnapshotBinFormat.js` (29-byte records, 22-byte player records, smallest-three quaternion), `SnapshotEncoder/Packer/NetworkState`, `ReplayFile` (magic `spointreplay`, v2), `LagCompensator/Hitscan/RewindSpatialIndex`, `CheatEjection/DesyncDetector/ConsensusVoter/EventLog/InputGuard/OutlierDetector/LockstepChecksum`, Lockstep*, Rollback*, `PeerSimSession`, `NetcodeProfile`, `ReplayRecorder/Player`, `TickSystem`, `PlayerManager`, `PhysicsIntegration`, `CollisionSystem`.
- Client: `PredictionEngine`, `ReconciliationEngine`, `SnapshotProcessor/Timeline`, `PredictionChart`, `interpolation`, `ClockSync`, `ChartEpochSync`, `ReconnectManager`, `TransportMigrationTrigger`.
- Transport: WebSocket, WebTransport/QUIC datagrams, Wireweave/WebRTC, Worker postMessage, `NetworkSimTransport`, `TransformRing`.
- Sharding: `Cluster*`, `Region*`, `ClusterHandoff`, `ShardingRefusal`.
- SDK and server: `ServerAPI`, `AgentAuthoringAPI`, `StaticHandler`, `DevHmr`, `RoomOrchestratorHttp`, `RoomDirectory/Pick/Routing/Health/Log`, `ServerPresence/Identity`, `NostrAuthServer`, `cronSchedule`, `llmJobs`, `UploadHandler`, `MinimapBake`, `WorldPersistence`, `PrefabLibrary/Spawner`, `SceneImport/TiledImport`, `WorldLocator`.
- Physics: Jolt World wrapper, `CharacterManager`, `ShapeBuilder`, `StaticTileIndex`, `FlightModel`, `VehiclePhysics`, Draco and Meshopt decompressors.
- Terrain: 21+ files including `PlanetFrame`, `ChartReanchor*`, `CaveSDF/CavePatches/CaveMeshes`, `GrassPlacementLod`, `BiomeOverride`, `ClimateCache`.
- Packages: `mapspinner/` (planet and terrain renderer), `streaming-gltf/` (EP_progressive_lod schemas), `ecs/`, `spoint-core/` (Rust scaffold).
- Game systems: `AbilityTree/QuestSystem/ProgressionSystem/StatsSystem/EventChainManager`; `src/animation/`; `src/pathfinding/` (`NavmeshQuery`, `ChartNavmeshQuery`, `RecastIntegration`).
- Client surfaces: `client/editor/`, `client/hud/`, `client/xr/`, `client/core/` (WebGPU and WebGL postFX, shadow, cascade and quality governors), `client/landing/`.
- Edge, deploy and shell: `edge/cf-do/`, `src-tauri/`, `bin/`, `scripts/`.
- `.gm/witness-out/savi-spawn-feature-gap.md` is a 60-claim gap report: 47 implemented, 13 remaining. The 47 are not independently verified.

## Jayzee parity rows and Tier B

These are read from `git -C /workspace/jayzee show HEAD:docs/PARITY.md` at jayzee `17ce428`. Jayzee is a spoint remake, and both are unrelated to oscraft.

- Row 13 (lockstep loop): "13. Lockstep loop with input delay 3, checksum every 30 ticks and stall 600. Source: spoint LockstepGameLoop." Spoint paths: `src/netcode/LockstepGameLoop.js`, `src/netcode/LockstepTickSystem.js`. Both exist in `/workspace/spoint` (REPRODUCED with `ls`). Whether jayzee has closed this row is peer-reported, not verified here.
- Row 36 (telemetry): "36. Telemetry: tick budget windows and bandwidth horizons. Source: spawn learnings 46 and 65 to 66; spoint `src/sdk/Metrics.js`." Spoint path `src/sdk/Metrics.js` exists (REPRODUCED with `ls`). Closure is peer-reported, not verified here.
- "Tier B" is not a defined classification in any durable repo. It is jayzee's internal plan shorthand (Tier A pure logic against Tier B Jolt-bound), and it comes from an ephemeral plan file, cited here as provenance only. Status: UNVERIFIED as a label. The concrete Jolt-bound surfaces are named by path in stream 11 above: `src/physics/World.js`, `src/physics/CharacterManager.js`, `src/physics/VehiclePhysics.js`, and `src/physics/joltLimits.js`.

## Documentation streams relayed from the spoint peer

The durable equivalents are the /workspace paths above and `/workspace/spoint/.gm/witness-out/`.

- Streams 1 to 6: the inventory artifacts (`INVENTORY.md`, `FAMILIES.md` with 19 families and 107 paths, `GAPS.md`, `prd-matrix.json` with 15 of 15 open rows, STALE 11, DOC-ONLY 2, REAL 2, and 5 non-PRD real gaps, `parity-crossmap.json`). The `check-refs` gap is two `package.json` refs to an absent `scripts/bundle-freshness-witness.mjs`. These artifacts live in `/tmp/spoint-parity/`, which is ephemeral provenance.
- Stream 7: CHARTEST-est-s1-3 is confirmed REAL at `src/terrain/PlanetFrame.js` `installGroundSource`, line 348 (verified). `src/netcode/LagCompensator.js` lines 6 and 7 hold `REWIND_BUCKET_CAPACITY = 10` and `REWIND_REFILL_PER_SEC = 20` (verified). `InputGuard` refills at 90 per second, at `src/netcode/InputGuard.js` line 2 (verified).
- Stream 8: the 13 unchecked savi and spawn gap claims, and the Wave C refinement. The delivery documents `.gm/WAVE_C_COMPLETION_SUMMARY.md` and `.gm/MODEL_BROWSER_DELIVERY.md` exist. Implementation is unverified.
- Stream 9: sandbox and static-serving surface. SES fails closed with `SandboxUnavailableError` at `src/sdk/SESCompartmentEvaluator.js:81` (verified). Timing-safe compare is at `src/sdk/authCompare.js:10` (verified). COEP `require-corp` is at `src/sdk/StaticHandler.js:108` (verified). Path containment is at `src/sdk/StaticHandler.js:149` (verified).
- Stream 10: the final cross-map counts and refreshed witnesses. These are peer-reported witnesses. The PRD counts were reproduced above.

### Stream 11: jayzee PARITY rows 6-10, 32, 33 (spoint-witnessed at `d5e3860`)

Rows are ranked rows in jayzee `docs/PARITY.md` at `17ce428`. Each line below is a spoint witness with a durable path and line number. Re-verify with `git -C /workspace/spoint show d5e3860:<path>`.

- Row 6, physics kernel (sleep, CCD, persistent contacts, warm start): `src/physics/World.js` lines 91-92 set `mTimeBeforeSleep = 0.25` and `mPointVelocitySleepThreshold = 0.05`. Line 127 sets `cs.mMotionQuality = J.EMotionQuality_LinearCast` from `opts.linearCast`, the only CCD path. Lines 310-311 hold `SetMotionQuality` and line 557 reads `GetMotionQuality`. Line 167 sets `OnContactPersisted = () => {}`, so persistent contacts are observed but not used. `git grep -i warmstart -- src/physics src/shared` finds nothing, so spoint has no explicit warm-start setting.
- Row 7, joints, springs, axis locks, friction and restitution: `src/physics/joltLimits.js` line 6 holds `DEFAULT_JOLT_LIMITS` (maxBodies 10240, maxBodyPairs 65536, maxContactConstraints 10240), with the byte constants on lines 1-6 and `JoltLimitsError` at line 10. This is the Jolt-bound limits surface, which jayzee does not port. `src/physics/constraintLimits.js` and `src/physics/jointMap.js` are 57 lines each. jayzee's port is `src/motion-pure/constraintLimits.js`.
- Row 8, character controller: `src/physics/CharacterManager.js` line 6 sets `DEFAULT_MAX_SLOPE_ANGLE_RAD = 0.7854`, which is 45 degrees, not 60. Line 26 uses it as the default `maxSlopeAngle`. `src/shared/characterStep.js` line 4 sets `MIN_WALKABLE_NORMAL_Y = 0.5` (a 60-degree normal-Y floor), and line 11 gates walkability on it. `CharacterManager.js` is 285 lines and Jolt-bound, so it is not ported.
- Row 9, queries (raycast, overlap, filters, pending geometry): `src/physics/World.js` line 794 dispatches raycast, and line 832 is `raycast(origin, direction, maxDistance = 1000, excludeBodyId = null)`. Lines 811-813 build the broad-phase, body and shape filters. Line 867 checks `this._dormant.pendingCount > 0`. No separate overlap method was found in `src/physics/World.js`, so overlap is NOT FOUND for this path.
- Row 10, vehicles: `src/physics/VehiclePhysics.js` line 32 exports `installVehiclePhysics(PhysicsWorld)`, and lines 42-55 use the Jolt vehicle constraint and wheel settings (Jolt-bound). `src/physics/FlightModel.js` line 25 exports `flightForces({ velocity, rotation }, opts = {})` and line 12 `rotateByQuat`. This is the ported flight model, jayzee `src/motion-pure/flightModel.js`.
- Row 32, apps runtime and hook order: `src/apps/AppRuntime.js` line 430 is `_startTrimeshBuild(entityId, entity)`. Line 438 calls `colliderBuildError(...)` and line 440 sets `entity.collider = null`. This is the GAP-trimesh-failure-propagation path, which is spoint-owned and held. Lines 36-39 define `colliderBuildError` (`err.name = 'ColliderBuildError'`). Lines 339-344 bind the update list: line 340 binds `s.update` when it is a function, and line 344 binds `api.tick` for behaviours. `onInput` is in `client/AppModuleSystem.js` line 136 and in `apps/*/index.js`. `git grep -E '\bonSpawn\b|\blateUpdate\b' -- src apps client` finds 0 hits, so `onSpawn` and `lateUpdate` are not in tracked code.
- Row 33, scripting limits: `src/sdk/SESCompartmentEvaluator.js` line 71 sets `_maxStepsPerTick = opts.maxStepsPerTick ?? 1000000`. Lines 122-129 hold the `__sandboxSteps` counter, `__sandboxMaxSteps`, and `__checkBudget`, which throws `[Sandbox] CPU budget exceeded`. `_wrapSource` (lines 135-143) injects no budget call, and `git grep "__checkBudget\|__sandboxSteps" -- ':!node_modules'` finds only the definitions. The step cap is defined but never incremented in tracked code. No 32 MiB memory cap and no 5 s kill were found in tracked `src`, `apps` or `sdk`.

## spawn's FINAL scan corrections

Scoped to the scanned sets. Sources: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/spawn/maps/glb-urls-all.tsv`, `/workspace/spawn/maps/head404-confirmed-worlds.txt`, `/workspace/spawn/maps/head-present-manifest404-worlds.txt`, `/workspace/spawn/maps/unverified-noncdn-refs.tsv`. The spawnfile probe output at `/tmp/spawn-probe/sf/` is ephemeral.

- Full spawnfile-family scan: 16 of 16 shards, 2,848 worlds, 0 refs, 0 worlds, 0 unique URLs. This is scoped to the scanned set and is not a proof of universal absence (OPEN-007, INFERRED).
- `/cdn/` family: 2,416 verified GLB refs across 399 worlds, 2,355 unique sha256, each HEAD 200 `model/gltf-binary` with glTF magic. 2,416 is a LOWER BOUND for that family only (OPEN-006).
- Missing heads: head404 total 256, all inside the earlier 259 list. The 259 list over-counts by 3 head-present missing-manifest worlds: `5db79de6dae84ceca2ddb9b9a0e216d9`, `fd80e9d941624c2fbc48fc89193a7417`, `ffb0a8fbdca948a5933be7bd62fb44b5`. The correct missing-head count is 256. The original list is kept as recorded (OPEN-011).
- head status 0 once: world `9f7b1a067caa46e2b2c1c7dceb48bc2b`, re-check HEAD 200, transient. Manifest 404 three times, with head.json 200 on re-check (OPEN-012).
- Non-CDN refs: 83 first-seen status 0, 81 resolved HEAD 200 on retry, 2 open (ttf 401 credentialed; mp4 connection timeout). `unverified-noncdn-refs.tsv` has 84 lines including the header, which is 83 data rows (OPEN-013, OPEN-014).
- Still OPEN: the full spawnfile key path is ELIDED (`spawn-engine/FAULTS.md` F3 shows `world.assets/3d/https~3a~2f~2fspawnfile.io~2f…glb.yaml` with no complete example). spawnfile.io bytes are UNCONFIRMED. "All GLBs on /cdn/" is INFERRED. The `world.assets/<xx>/` bucket rule is UNDETERMINED after 74 tested pairs. The name encoder is decode-only. Resolve redirect and gone bodies, and manifest frames after the sheet, are not captured (OPEN-008, OPEN-010, OPEN-015, OPEN-016).
- Scoped Observation under OPEN-009, UNVERIFIED: one live `lanmower/deepfall` page, filtered on `/spawnfile|bigspawn/`, hit `rqr3rdr46-playco.spawnfile.io`, `blob:` URLs and `play.bigspawn.net` with `glbLike: []` over 30 requests. This is one page, not a family scan, and it does not contradict the 0 refs over 2,848 worlds.

## Stream 12: spoint counterparts for jayzee rows 13, 19, 36 and 47 (read-only at `d5e3860`)

Each line gives the durable spoint path and line witness, or the grep that found no counterpart. Jayzee rows are `docs/PARITY.md` at `17ce428`. The open-item text is quoted from those rows' Status.

- Worker bridge (row 13 open: "the worker bridge, which is injected and has no jayzee adapter"; row 47 partial): `src/sdk/WorkerEntry.js` lines 207-212 hold the `hasWorkerPostMessage` branch, with line 210 creating `WorkerTransport`, line 211 `ctx.onClientConnect(_transport)`, and line 212 `ctx.peerSession?.start()`. `src/transport/WorkerTransport.js` line 22 defines `WorkerTransport extends TransportWrapper`, lines 25-27 the constructor (`type = 'worker'`, `ready = true`), and lines 29-34 `send`, which posts `{ type: 'SEND_CLIENT', data: buf, mt }` with the buffer as a transfer. `client/core/WorkerRenderer.js` exists, and was not read in this pass.
- TickSystemBase timer (row 13 open: "the TickSystemBase timer"): `src/netcode/TickSystemBase.js` lines 8-23 hold the `_timerGranularityMs` probe, which measures `setTimeout(r, 1)` and keeps the worst value. Line 26 is `export class TickSystemBase`, line 42 `schedulerStats = { ticks, droppedMs, maxLateMs, spinWakeups, timerWakeups }`, and line 73 `getSchedulerStats()`. `start()` is at line 92 and sets `this._timer` at line 113, with `unref()` at line 114. `stop()` at lines 188-190 calls `clearTimeout`.
- Stats interval (row 13 open: "the stats interval"): scoped negative for `TickSystemBase`. `git grep -n setInterval -- src/netcode` finds one hit, `src/netcode/PeerSimSession.js` line 135, `statsTimer = setInterval(() => post({ type: 'PEER_STATS', stats: this.getStats() }), STATS_POST_INTERVAL_MS)`. The stats interval lives in `PeerSimSession`, not `TickSystemBase`.
- Rollback-only PeerSimSession (row 13 open): `src/netcode/PeerSimSession.js` line 16 is `createPeerSimSession(ctx, { roster, localPubkey, post })`, and line 18 refuses a profile not in `PEER_SIMULATED_PROFILES`. Lines 93-98 are `observeRollback` with `before` and `after` snapshots of connected player positions. Lines 117-119 select `buildPeerLoop = PEER_LOOP_FACTORIES[profile.name]`, which throws when a profile has no loop. `src/netcode/peerLoops.js` line 9 is the frozen `PEER_LOOP_FACTORIES`, and line 25 derives `PEER_SIMULATED_PROFILES` from its keys. The factory line for the rollback profile was not located in this pass.
- Bandwidth horizons (row 36 open: "bandwidth horizons, which are not in Metrics"): scoped negative: no named bandwidth horizon in the grep set below. `git grep -n -i horizon -- src/sdk/Metrics.js src/netcode src/sdk/TickHandler.js src/sdk/TickHandlerAOI.js` returns only `src/netcode/ConsensusVoter.js` lines 11, 93 and 97, which are checksum horizons. The closest is `src/sdk/TickHandlerAOI.js` line 6, `BANDWIDTH_BUDGET_BYTES_PER_TICK = 900`, with trim constants on lines 7-8, and the trim gate at `src/sdk/TickHandler.js` line 378. These are a per-tick byte budget, not a horizon.
- Host GC observer (row 36, jayzee `gc.js`): `src/sdk/Metrics.js` line 71 is `createGcTracker()`, line 72 the histogram `spoint_gc_pause_ms`, lines 76-87 a `PerformanceObserver` with `observer.observe({ entryTypes: ['gc'], buffered: false })` at line 87, and line 96 `disconnect()`.
- `/metrics` route (row 36 render): `src/sdk/ServerAPI.js` line 148 routes `GET /metrics` to `handleMetrics`. `src/sdk/ServerAPIRoutes.js` line 112 is `handleMetrics(req, res, ctx)`. `src/sdk/Metrics.js` line 130 is `renderMetrics(sources = {})`, which emits Prometheus text. Consumers are `client/metrics-dashboard.html` line 393, which polls `/metrics`, and `scripts/perf-gate.mjs` line 48.
- TickHandler wiring (row 19 open: "the full tick ordering (movement, collision, physics, snapshot) has no witness; the tick orchestrator ... not ported"): `src/sdk/TickHandler.js` line 12 imports `recordSnapshotBytes` and `recordTickPhase` from `Metrics.js`. Lines 169 and 181 call `recordSnapshotBytes(buf.length)`. Line 572 calls `recordTickPhase` for `total`, `mv`, `phys` and `snap`, which is the tick ordering with its four phase timers. Line 592 is `onTick.getMetrics`.

## Feature-support contract

The feature-support contract is not duplicated here. It lives in `docs/OPEN-ITEMS.md` under "Required feature support", which is extended with the spawn learnings from this document.
