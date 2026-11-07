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
| HTTP doors 70 = 17 exercised + 53 documented; 66 with an HTTP verb | `cd http && grep -c -E '^\| [^\|]+ \| [^\|]+ \| [^\|]+ \| (exercised\|documented)' CATALOG.md` (spawn) for 70; `grep -c -E '^\| [^\|]+ \| (GET\|POST\|PUT\|PATCH\|DELETE) \| ' .spawn/reference/http/CATALOG.md` for 66 | 70 rows; 17 exercised; 53 documented; 66 with an HTTP verb in the Method column, 4 without (delete, play.attach, git, openapi) | REPRODUCED (savi, this pass; CATALOG sha256 1af9ca96…a982c). 66 + 4 = 70. An earlier draft gave 56 for the verb rows; that figure was wrong. |
| HTTP doors: 4 rows have no HTTP method | `grep` for rows whose Method column is not GET/POST/PUT/PATCH/DELETE | `delete`, `play.attach`, `git`, `openapi` (method not stated in source) | REPRODUCED. These are part of the 53. |
| API types 305 | Compare `cli/types/` file names with the names in `http/api-types.md` | 308 files in `cli/types/`; 305 match the list; 3 are `_list`, `_missing`, `_names` | REPRODUCED for 305 type files |
| `cli/types/` holds 308 files | `ls cli/types \| wc -l` (spawn) | 308 | REPRODUCED. These are 305 type files plus 3 `_` meta files (`_list.txt`, `_missing.txt`, `_names.txt`). |
| ASSET_SHAPES "names 308 types [verified]" | Live `GET /api/agent/v1/api` | needs a Bearer token (401 without); no credential used | UNVERIFIED. The live claim is not reproduced here (spawn). |
| Tome 68 distinct headings | `grep '^\| .* \| sections/' tome/INDEX.md \| cut -d'\|' -f2 \| sort \| uniq \| wc -l` | 68 (69 rows; `World Queries` appears twice) | REPRODUCED |
| Tome 69 section files | `ls tome/sections \| wc -l` | 69 | REPRODUCED |
| Builtin modules 21 | `ls tome/sections \| grep -c '^builtin-'` | 21 | REPRODUCED. The owner's 23 is not reproducible locally (OPEN-028). |
| Served skills 23 | `tail -n +5 skills/INDEX.md \| grep -c '^\| '` | 23 | REPRODUCED |
| Skills directory 47 entries | `cd skills && ls \| wc -l` (spawn) | 47 = 23 `.json` + 24 `.md` (the 24th is INDEX.md) | REPRODUCED |
| Skills INDEX byte column (`bytes (.md body)`) | `node` over the rows of `skills/INDEX.md`: D = column − `stat -c %s <id>.md`, for 23 rows | D = +1 for 21 rows (spawn-engine 1136 − 1135); D = −12 for cameras (9196 − 9208); D = +27 for heightmap-terrain (9789 − 9762) | REPRODUCED by savi, and jayzee re-derived the same signs from its MANIFEST.txt. The +1 fits a trailing newline, but the generator is not in the tree, so that reason is UNVERIFIED. The column is stale for cameras and heightmap-terrain against their served content. |
| Skills JSON `content` bytes | `<id>.json` `content` UTF-8 length minus `stat -c %s <id>.md`, for all 23 | difference 0 for all 23 | REPRODUCED by savi. jayzee did not check the bodies. The `content` field is a different field from the INDEX byte column. |
| Engine docs 27 | `find engine -type f \| wc -l` | 27 | REPRODUCED |
| CLI top-level 39 | `find cli -maxdepth 1 -type f \| wc -l` | 39 | REPRODUCED |
| HTTP 18 indexed + 33 raw | `find http -type f -not -path 'http/raw/*' \| wc -l`; `find http -path 'http/raw/*' \| wc -l` | 18 non-raw files; 33 raw | REPRODUCED |
| Reference index total 208 | Sum of the README's per-job figures (tome 74, skills 47, engine 27, cli 39, http 18, guide 3) | 208 arithmetic only | UNVERIFIED. The tome bucket is not reproduced: tome has 75 files (73 `.md`), so the sum is 207 or 209 (spawn). The guide bucket is also off, see below. |
| Tome tree 75 | `cd .spawn/reference && find tome -type f \| wc -l`; `find tome -maxdepth 1 -type f \| wc -l` (6); `ls tome/sections \| wc -l` (69) | 75 files: 69 section files, 6 directly under `tome/` (all.md, all-refetch-2026-11-04.md, guide.md, INDEX.md, raw-all.json, raw-guide.json), and 73 `.md` | REPRODUCED. All 75 are tracked at HEAD (`git ls-files .spawn/reference/tome \| wc -l` = 75). INDEX.md states no top-level count, so the earlier "5" is withdrawn as unsupported. |
| Guide 3 | `find guide -type f` | 5 files: `AGENTS-current.md`, `AGENTS-digest.md`, `served-guide.guide.txt`, `served-guide.json`, `served-guide.md` | UNVERIFIED. The index links 3, but the tree has 5. |
| Feed 3,421 projects, 66 engine versions | `grep` for `3421`/`3,421` in FEED_SCOPE.md | the figure appears in the text | UNVERIFIED for the walk. The text says it, but the walk is not re-run here, and 66 versions is not checked. |
| Assets 395 | `grep` for `395` in PROJECT_ASSETS.md | the figure appears in the text | UNVERIFIED for the URL count and the 4 families. The text says it, but the URL walk is not re-run here. |
| me.doors 60 keys | `cd .spawn/reference && node -e 'console.log(Object.keys(JSON.parse(require("fs").readFileSync("http/raw/agent-v1-me.bearer.body","utf8")).doors).length)'` | 42 keys in `doors` | UNVERIFIED as 60. The local Bearer body holds 42 keys, and the CATALOG header's 60 is not reproduced from it. The capture time of the 60 is not recorded. |
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
- Terrain: 21+ files including `PlanetFrame`, `ChartReanchor*`, `CaveSDF/CavePatches/client/core/CaveMeshes`, `GrassPlacementLod`, `BiomeOverride`, `ClimateCache`.
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

Each line gives the durable spoint path and line witness, or the grep that found no counterpart. Jayzee rows are `docs/PARITY.md` at `daaee8e`. Quoted open-item text for rows 13 and 36 is from that pin; spoint's line citations are unchanged.

- Worker bridge (row 13 open: "the worker bridge, which is injected and has no jayzee adapter"; row 47 partial): `src/sdk/WorkerEntry.js` lines 207-212 hold the `hasWorkerPostMessage` branch, with line 210 creating `WorkerTransport`, line 211 `ctx.onClientConnect(_transport)`, and line 212 `ctx.peerSession?.start()`. `src/transport/WorkerTransport.js` line 22 defines `WorkerTransport extends TransportWrapper`, lines 25-27 the constructor (`type = 'worker'`, `ready = true`), and lines 29-34 `send`, which posts `{ type: 'SEND_CLIENT', data: buf, mt }` with the buffer as a transfer. `client/core/WorkerRenderer.js` exists, and was not read in this pass.
- TickSystemBase timer (row 13 open: "the TickSystemBase timer"): `src/netcode/TickSystemBase.js` lines 8-23 hold the `_timerGranularityMs` probe, which measures `setTimeout(r, 1)` and keeps the worst value. Line 26 is `export class TickSystemBase`, line 42 `schedulerStats = { ticks, droppedMs, maxLateMs, spinWakeups, timerWakeups }`, and line 73 `getSchedulerStats()`. `start()` is at line 92 and sets `this._timer` at line 113, with `unref()` at line 114. `stop()` at lines 188-190 calls `clearTimeout`. Paused scheduler (a deliberate deviation recorded for jayzee row 13): `git grep -n -E "_schedule\(\) \{|this._state !== 'paused'|this._timer = setTimeout|this._state = 'paused'" -- src/netcode/TickSystemBase.js` gives line 101 `_schedule()`, line 102 `if (!this.running && this._state !== 'paused') return`, line 113 `this._timer = setTimeout(..., Math.max(0, wait))`, and line 176 `this._state = 'paused'`. spoint's `_schedule` still passes the guard while paused and arms a wake. jayzee arms none while paused. This is a difference, not a bug on either side.
- Stats interval (row 13 open: "the stats interval"): scoped negative for `TickSystemBase`. `git grep -n setInterval -- src/netcode` finds one hit, `src/netcode/PeerSimSession.js` line 135, `statsTimer = setInterval(() => post({ type: 'PEER_STATS', stats: this.getStats() }), STATS_POST_INTERVAL_MS)`. The stats interval lives in `PeerSimSession`, not `TickSystemBase`.
- Rollback-only PeerSimSession (row 13 open): `src/netcode/PeerSimSession.js` line 16 is `createPeerSimSession(ctx, { roster, localPubkey, post })`, and line 18 refuses a profile not in `PEER_SIMULATED_PROFILES`. Lines 93-98 are `observeRollback` with `before` and `after` snapshots of connected player positions. Lines 117-119 select `buildPeerLoop = PEER_LOOP_FACTORIES[profile.name]`, which throws when a profile has no loop. `src/netcode/peerLoops.js` line 9 is the frozen `PEER_LOOP_FACTORIES`, and line 25 derives `PEER_SIMULATED_PROFILES` from its keys. The rollback factory is located. `git grep -n -E "^export let PEER_LOOP_FACTORIES|^  rollback: \(|^  lockstep: \(" -- src/netcode/peerLoops.js` gives line 9 `export let PEER_LOOP_FACTORIES = Object.freeze({`, line 10 `rollback: (...) => {`, lines 11-14 that build the rollback transport and loops and return `{ loop, transport, voter: null }`, and line 16 where the lockstep entry starts. The rollback-only PeerSimSession stays OPEN.
- Bandwidth horizons (row 36 open: "bandwidth horizons, which are not in Metrics"): scoped negative: no named bandwidth horizon in the grep set below. `git grep -n -i horizon -- src/sdk/Metrics.js src/netcode src/sdk/TickHandler.js src/sdk/TickHandlerAOI.js` returns only `src/netcode/ConsensusVoter.js` lines 11, 93 and 97, which are checksum horizons. The closest is `src/sdk/TickHandlerAOI.js` line 6, `BANDWIDTH_BUDGET_BYTES_PER_TICK = 900`, with trim constants on lines 7-8, and the trim gate at `src/sdk/TickHandler.js` line 378. These are a per-tick byte budget, not a horizon.
- Host GC observer (row 36): jayzee ports it as `src/telemetry-pure/gcObserver.js` and lists it under Ported at `daaee8e`, so it is not an open item there. spoint side: `src/sdk/Metrics.js` line 71 is `createGcTracker()`, line 72 the histogram `spoint_gc_pause_ms`, lines 76-87 a `PerformanceObserver` with `observer.observe({ entryTypes: ['gc'], buffered: false })` at line 87, and line 96 `disconnect()`.
- `/metrics` route (row 36 render): `src/sdk/ServerAPI.js` line 148 routes `GET /metrics` to `handleMetrics`. `src/sdk/ServerAPIRoutes.js` line 112 is `handleMetrics(req, res, ctx)`. `src/sdk/Metrics.js` line 130 is `renderMetrics(sources = {})`, which emits Prometheus text. Consumers are `client/metrics-dashboard.html` line 393, which polls `/metrics`, and `scripts/perf-gate.mjs` line 48.
- TickHandler wiring (row 19 open: "the full tick ordering (movement, collision, physics, snapshot) has no witness; the tick orchestrator ... not ported"): `src/sdk/TickHandler.js` line 12 imports `recordSnapshotBytes` and `recordTickPhase` from `Metrics.js`. Lines 169 and 181 call `recordSnapshotBytes(buf.length)`. Line 572 calls `recordTickPhase` for `total`, `mv`, `phys` and `snap`, which is the tick ordering with its four phase timers. Line 592 is `onTick.getMetrics`.

## Stream 13: worker and transport-migration surface (spoint, read-only at `d5e3860`)

Corrected line numbers from spoint's correction messages are used throughout.

- Render worker protocol, separate from the netcode worker, with lowercase message types. `client/core/WorkerRenderer.js` lines 205-219 handle inbound `ready` (205), `frame` (210), `stopped` (215) and `error` (219). Line 247 posts `init` with the OffscreenCanvas transferred, line 266 posts `resize`, and line 295 posts `stop`, with a terminate after 250 ms (line 1). The stop confirm timeout is 1000 ms (line 3). Negative, grep at write time: `git grep -n "createWorkerRenderer" -- client src apps` returns callers only at `client/app.js` lines 287 and 292 (import at line 43). `git grep -n -E "type === 'init'|type: 'frame'|type === 'resize'" -- src/sdk/WorkerEntry.js` returns 0 hits, so the render protocol is not handled inside the netcode worker.
- Netcode worker entry, `src/sdk/WorkerEntry.js` (306 lines), with uppercase types. Line 40 `TRANSFORM_RING_CAPACITY = 64`, line 125 allocates `_transformRing`, line 130 sets `ctx.onClientConnect`. Lines 204-205 guard `hasWorkerPostMessage` and add the `message` listener. Line 207 handles `INIT`, and line 209 posts `INIT_ERROR` on failure. Line 210 creates `WorkerTransport`, line 211 calls `ctx.onClientConnect(_transport)`, line 212 calls `ctx.peerSession?.start()`, line 213 posts `TRANSFORM_RING`, and line 214 drains `_pending`. Line 219 handles `PEER_CONNECT`, which calls `_ctx.onClientConnect(t)` at line 223. Lines 227-285 return results for PEER_FRAME, PEER_LEFT, HMR_APP, HMR_TICK_HANDLER, SAVE_NOW and the DEBUG_COLLIDER messages via `self.postMessage`. Line 292 posts `WORKER_READY`. Lines 295-306 dispatch `CLIENT_MESSAGE`, `CLIENT_DISCONNECT`, `PEER_MESSAGE` and `PEER_DISCONNECT`.
- Migration inside the worker: none. `git grep -n -E "MIGRATE|0xb7|0xb8" -- src/transport src/sdk/WorkerEntry.js` returns 0 hits, and `git grep -n "TransportMigrationTrigger\|migrateTransport" -- src/sdk/WorkerEntry.js src/transport` returns 0 hits. The worker is not on the migration path.
- Transports, `src/transport/WorkerTransport.js` (69 lines). Line 22 is `export class WorkerTransport`, and line 37 is its `close()`, which sets `ready = false` and emits `close`. Lines 26-28 set `type = 'worker'` and `ready = true`. Line 33 posts `SEND_CLIENT` with the buffer transferred. Line 43 is `export class PeerTransport`, line 55 posts `PEER_SEND` with the buffer transferred, and line 59 is `PeerTransport.close()`. Line 65 is `_hotSwapWorkerTransport`, with line 69 `globalThis.__spointHmr?.acceptSelf?.(import.meta.url, _hotSwapWorkerTransport)`.
- Wire control frames, `src/protocol/MessageTypes.js`. Lines 34-37 hold RECONNECT 0x60, RECONNECT_ACK 0x61, STATE_RECOVERY 0x62 and DISCONNECT_REASON 0x63. Line 97 holds HOST_MIGRATE 0xad, and lines 114-115 hold MIGRATE 0xb7 and MIGRATE_ACK 0xb8.
- Server handoff, `src/sdk/ServerHandlers.js`. Lines 39-40 admit `MSG.MIGRATE` as `SOCKET_ADMISSION.MIGRATE`. Line 176 is `_handleMigrate`, which rejects a token under 8 characters and answers MIGRATE_ACK `{ ok: false }` when there is no session or no connected client. Lines 191-205 keep the old transport as `oldTransport` and restore it on a close before success. Line 206 calls `connections.addClient`, line 209 sends MIGRATE_ACK `{ ok: true, playerId, tick, structHash }`, and line 210 emits `playerMigrate`.
- Client trigger and swap. `src/client/TransportMigrationTrigger.js` line 1 sets the RTT poll to 1000 ms, line 6 sets the spike threshold to 300 ms, and line 7 sets the streak. Line 49 triggers on a network-information change, and lines 54-58 trigger on an RTT-spike streak. `src/client/PhysicsNetworkClient.js` line 288 is `migrateTransport(kind)`, with WebTransport at lines 292-309 and the WebSocket candidate at line 312. Line 317 calls `_confirmMigration`, lines 339-356 send MIGRATE with the session token (line 353), and line 346 waits for MIGRATE_ACK for up to 4000 ms. Line 320 calls `_swapToMigratedTransport`, which starts at line 358.
- Summary: the render worker (lowercase) is separate from the netcode worker (uppercase). Migration runs from the client trigger through `PhysicsNetworkClient.migrateTransport` to `ServerHandlers._handleMigrate`, and the worker is not part of it.

## Stream 14: sharding and cluster surface (spoint, read-only at `d5e3860`)

Corrected MessageTypes lines from spoint's correction message are used.

- Control-frame opcodes, `src/protocol/MessageTypes.js`: line 130 TELEPORT_ACK 0xc3, line 132 COLLISION_CONFIG 0xc4, line 133 COLLISION_TILE 0xc5, line 135 CHART_REANCHOR 0xc6, and line 137 CLUSTER_HANDOFF 0xc7. Negative, grep at write time: `git grep -n -i -E "CLUSTER_HANDOFF_REFUSED|CLUSTER_HANDOFF_ACK|HANDOFF_ACK" -- src client scripts` returns 0 hits. There is no cluster-level handoff refusal or ack opcode, and the refusal travels through the region protocol below.
- Cluster handoff, `src/sharding/ClusterHandoff.js` (96 lines). Lines 6-8 hold the codes CLUSTER_LOCAL_PLAYER_ID_MALFORMED, HANDOFF_UNKNOWN_CLUSTER_LOCAL_PLAYER and HANDOFF_SESSION_NOT_JOINED. Line 15 is `class ClusterHandoffError`, thrown at lines 25, 31, 34, 77 and 85. `git grep -n ClusterHandoffError -- src` shows it only in this file (scoped negative: no use elsewhere in `src`). Line 29 is `exportPlayerHandoff`, and line 45 is `admitPlayerHandoff`, which creates the session at line 59 and returns `{ token, state, lastInput, transfer }` at line 60. Line 72 returns `{ ok: false, reason: HANDOFF_SESSION_NOT_JOINED }` as a value, not a throw. Line 75 is `applyAdmittedInputs`, line 83 is `releaseHandoffSource`, and line 90 sends the CLUSTER_HANDOFF frame to the client. Client follow: `src/client/BaseClient.js` line 89. Harness: `scripts/cluster-world-harness.mjs` lines 436-452 and 593-602.
- Cluster coordination: `src/sharding/ClusterCoordinator.js` line 3, `src/sharding/ClusterManager.js` line 6, `src/sharding/ClusterServerWorld.js` lines 16 and 30, `src/sharding/ClusterWorldHost.js` lines 1 (`ClusterWorldCapacityError`) and 10.
- Region router handoff, `src/sharding/RegionRouter.js` (416 lines). Lines 24-27 hold HANDOFF_IDLE, PLAYER_IDENTITY_UNMINTED, HANDOFF_UNMINTED and HANDOFF_UNKNOWN_PLAYER. Line 35 is `handoffTo`. Lines 245-257 are the boundary-crossing path, which refuses an in-flight handoff, mints `handoffTo`, and sends ACCEPT_HANDOFF to the destination. Line 261 is `_handleHandoffAccepted`, lines 264-276 handle identity failure and success, and line 292 is `_handleHandoffRefused`. Lines 88-89 map HANDOFF_ACCEPTED and HANDOFF_REFUSED.
- Region worker, `src/sharding/RegionWorkerEntry.js` (305 lines). Line 154 is `acceptHandoff`, line 157 creates `RegionIPCTransport`, lines 158-162 send HANDOFF_REFUSED with a code on transport error, line 191 sends HANDOFF_ACCEPTED, and line 277 maps ACCEPT_HANDOFF. Line 131 refuses on a boundary check, and line 215 sends WORKER_REFUSED and exits with code 1 on boot failure.
- Refusal codes, `src/sharding/ShardingRefusal.js` (70 lines). Lines 1-6 hold the constants, lines 8-9 are `messageRefusal`, and lines 40, 50 and 61 are `ClientConnectRefusedError`, `RegionWorkerRefusedError` (code at line 54) and `RegionSiblingRefusedError` (code at line 65). `src/sharding/RegionRouter.js` lines 148-154 reject the ready promise.
- Shipped worlds and the cluster flag: `apps/world/construct.js` line 3 and `apps/world/tps-game.js` line 3 declare `clusters: { enabled: false }`. Scoped negative: `git grep -n "clusters" -- apps/world` shows no clusters key in `apps/world/tutorial.js` or `apps/world/tutorial-rpg.js`. Spoint's AGENTS.md says tutorial.js declares clusters off, and this grep does not support that. The tutorial.js claim is UNVERIFIED, and the discrepancy is recorded here, not fixed, because spoint is read-only from savi. The parser refuses a mismatch at `apps/world/_shared/worldDefParse.js` lines 176-195.

## Stream 15: game systems, animation and pathfinding (spoint, read-only at `d5e3860`)

Each path:line was grepped in the same pass as the text that cites it. Where a feature has no consumer, the negative grep and its result are quoted.

- AbilityTree, `src/game/AbilityTree.js` (406 lines): line 3 `DEFAULT_ABILITIES`, line 51 `HOTKEY_MAP`, line 63 `DEFINITION_REFUSAL`, line 71 `definitionRefusal`, line 79 `createAbilityTree`, line 91 the refusal check. Consumer: `src/apps/Progression.js` line 32.
- ProgressionSystem, `src/game/ProgressionSystem.js` (237 lines): line 15 `isLegalCurve`, line 35 throws a TypeError for an illegal value, line 41 `createProgressionSystem`, lines 47-48 `calculateXpThreshold` throws for an illegal curve, line 59 the `default:` branch, line 150 the level loop, line 228 `getStatScaling`. Consumer: `src/apps/Progression.js` lines 31 and 114-116.
- Documentation error: `git grep -n "createAbilityTree" -- src/game/ProgressionSystem.js` returns 0 hits, but `src/game/README.md` line 32 imports `createAbilityTree` from `./ProgressionSystem.js`. The function lives in `AbilityTree.js`, so the README import is wrong. Recorded here, not fixed, because spoint is read-only from savi.
- StatsSystem, `src/game/StatsSystem.js` (395 lines): line 3 `defineStatsSystem`. Line 8 is a silent default: an invalid `xpPerLevel` becomes 100 with no refusal. This is the silent-default class, not a validated feature. Line 37 `_xpForLevel`, line 39 `_levelFromXP`, line 49 clamps to the floor and `maxLevel`. Consumer: `src/apps/AppContext.js` lines 36 and 310.
- QuestSystem, `src/game/QuestSystem.js` (261 lines): line 3 `defineQuestSystem`, line 261 default export. Consumer: `src/apps/AppContext.js` lines 35 and 300.
- EventChainManager, `src/game/EventChainManager.js` (470 lines): line 1 the class, line 19 `addChain`, lines 20-21 refuse a non-object spec with a TypeError. Consumers: `src/game/index.js` line 16 and `client/editor/EventChainPanel.js` lines 2 and 13. Negative: `git grep -n "EventChainManager" -- src/apps` returns 0 hits, so the editor panel is the only runtime use.
- Pathfinding. `src/pathfinding/NavmeshQuery.js` line 8 is the class, with the export at line 148. Consumer: `src/apps/AppContext.js` lines 27, 72-75, after a version check against `NAVMESH_FORMAT_VERSION`. `src/pathfinding/ChartNavmeshQuery.js` line 1 is the class. Consumer: `src/apps/AppContext.js` lines 28, 47, 501 and 516. `src/pathfinding/RecastIntegration.js` lines 1-2 import `recast-navigation`, pinned at `package.json` line 129 as `^0.43.1`. Line 4 is `NAVMESH_FORMAT_VERSION = 1`, line 12 `bakeNavmesh`, line 27 throws `recast solo navmesh generation failed`, line 34 `ringTurning`, and line 60 calls it inside the bake. The bake runs from `scripts/bake-navmesh.mjs` lines 5, 59 and 60, and refuses a result with 0 walkable polygons.
- Pathfinding with no runtime consumer. `src/pathfinding/costCorridor.js` line 165 is `findCostCorridor`. Negative: `git grep -n "findCostCorridor" -- src apps client` returns 0 hits outside `src/pathfinding`. Its only caller is `scripts/nav-cost-witness.mjs` lines 2 and 114. `src/pathfinding/findPathStatus.js` line 7 is `readPoint`.
- Animation, `src/animation`: `AnimationSystem.js` line 10 is the class, line 223 `setRagdollPlan`, line 281 the default export. Consumers: `src/apps/AppContext.js` lines 34 and 302, and `apps/character-animator/index.js` line 19. `scripts/animation-ragdoll-plan-witness.mjs` lines 6-13 exercise `setRagdollPlan`. The other modules are `AnimationController.js` line 3, `BlendTree.js` lines 31, 103, 170 and 204, `IKSolver.js` lines 41, 171, 214 and 250, `ProceduralSkeleton.js` lines 17-104, `RagdollPose.js` lines 3-26, `ragdollActivation.js` lines 3-36, `ShapeKeys.js` line 11, `SkeletonUtils.js` line 3, and `SpringBones.js` lines 28 and 125.
- Animation with no consumer outside its own module. Negative: `git grep -l -E "TwoBoneIKSolver|FootIKSolver|IKRig|IKChain|BlendTree1D|BlendTree2D|AnimationBlender|SpringBoneChain|springBonesOf|createShapeKeyDriver|RagdollPose|applyRagdollActivation|buildProceduralSkeleton|SkeletonUtils|createSkinnedBody" -- src apps client` returns 0 files outside `src/animation`. IK, blend trees, spring bones, shape keys, ragdoll pose, procedural skeleton and skeleton utils have no consumer.
- Summary. Wired: AbilityTree and ProgressionSystem (Progression.js), QuestSystem and StatsSystem (AppContext), NavmeshQuery and ChartNavmeshQuery (AppContext), AnimationSystem (AppContext and character-animator). Implemented without a runtime consumer: `findCostCorridor` and `bakeNavmesh`/`ringTurning` (scripts only), EventChainManager (editor only), and the IK, blend-tree, spring-bone, shape-key, ragdoll-pose and procedural-skeleton modules (none).

## Stream 16: client prediction, reconciliation, snapshot timeline, clock sync, chart epoch sync, reconnect and transport migration (spoint, read-only at `d5e3860`)

Witnesses from spoint's grep, each re-grepped here at `d5e3860` in the same pass as the citation.

- Prediction lead cap: `git grep -n MAX_PREDICTION_LEAD_STEPS -- src` gives `src/client/BaseClient.js` line 17 (`const MAX_PREDICTION_LEAD_STEPS = 16`) and line 182 (`predEngine.predictionLeadSteps() < MAX_PREDICTION_LEAD_STEPS`). No other use in `src`.
- `slerpQuat`: defined at `src/client/interpolation.js` line 1. Its consumer is `src/client/SnapshotTimeline.js` line 1 (import) and line 25 (call). `git grep -n slerpQuat -- src client` has no other consumer; `src/client/interpolation.js` line 26 is an HMR hand-off, not a consumer.
- `PredictionChart`: the only consumer is `src/client/PredictionEngine.js` line 7, which imports `reexpressMotionState`, `copyAckedEntry` and `saveStepNormal`. `PredictionChart.js` line 34 and line 39 are its own HMR accept.
- `ReconnectManager` and `TransportMigrationTrigger`: `git grep -n -E "ReconnectManager|TransportMigrationTrigger" -- src client` shows them consumed only by `src/client/PhysicsNetworkClient.js` (line 3 imports ReconnectManager, line 8 imports the trigger, line 64 constructs the trigger, line 68 constructs ReconnectManager).
- Coverage, as spoint lists it and not re-grepped here: PredictionEngine, ReconciliationEngine, SnapshotTimeline and SnapshotProcessor, interpolation, ClockSync, ChartEpochSync, ReconnectManager, TransportMigrationTrigger and PredictionChart. The trigger's thresholds are in Stream 13.
- Jayzee mapping: row 48 (client loops, partial). Its open clause is quoted in `docs/JAYZEE-GAPS.md`.

## Stream 17: replay, lag compensation, anti-cheat, snapshot binary and wire (spoint, read-only at `d5e3860`)

Self-produced from `/workspace/spoint` at `d5e3860` (clean tree), not from a peer message. Each citation is `path:line` with the exact text found on that line. `scripts/check-featureset.mjs` re-reads every cited line with `git -C /workspace/spoint show d5e3860:<path>` before the gate passes. Negatives are recorded with the grep that produced them, at the same pin. Jayzee's rows for this area are 42 (binary snapshot), 43 (replay), 44 (lag compensation and hitscan), 45 (anti-cheat), 46 (protocol codecs) and 47 (transports and wire).

### Replay

- Replay file: `src/netcode/ReplayFile.js:3` (`export const SPOINTREPLAY_MAGIC = 'spointreplay'`), `src/netcode/ReplayFile.js:4` (`export const SPOINTREPLAY_VERSION = 2`), `src/netcode/ReplayFile.js:6` (`export function encodeReplay`), `src/netcode/ReplayFile.js:19` (`export function decodeReplay`). The decoder refuses a file whose magic is not the constant: `src/netcode/ReplayFile.js:22` (`if (!env || env.magic !== SPOINTREPLAY_MAGIC)`).
- Recorder and player: `src/netcode/ReplayRecorder.js:3` (`export class ReplayRecorder`), `src/netcode/ReplayRecorder.js:4` (`tickRate = 60, collisionSteps = 2`), `src/netcode/ReplayPlayer.js:4` (`export class ReplayPlayer`).
- Consumer: `scripts/replay-record-and-play.mjs:49` (`const recorder = new ReplayRecorder(`) and `scripts/replay-record-and-play.mjs:101` (`const player = new ReplayPlayer({`).
- Negative: `git grep -n -E 'SPOINTREPLAY_MAGIC|spointreplay' -- src client apps scripts` uses the magic only in `src/netcode/ReplayFile.js` (lines 3, 10, 22). The script's other hits are its output file name and log lines. `git grep -n -E 'ReplayRecorder|ReplayPlayer' -- src client apps scripts` has no consumer outside `scripts/replay-record-and-play.mjs` (lines 12, 13, 49, 101).

### Lag compensation and hitscan

- Constants: `src/netcode/LagCompensator.js:3` (`const HISTORY_CAPACITY = 256`), `src/netcode/LagCompensator.js:6` (`const REWIND_BUCKET_CAPACITY = 10`), `src/netcode/LagCompensator.js:7` (`const REWIND_REFILL_PER_SEC = 20`), `src/netcode/LagCompensator.js:8` (`const DEFAULT_MAX_ORIGIN_DRIFT_M = 2`).
- Methods: `src/netcode/LagCompensator.js:37` (`export class LagCompensator`), `src/netcode/LagCompensator.js:38` (`constructor(historyWindow = _envWindow() || 1000`), `src/netcode/LagCompensator.js:105` (`acceptRewind(shooterId, nowMs`), `src/netcode/LagCompensator.js:115` (`rewindAtTick(playerId, tick`), `src/netcode/LagCompensator.js:140` (`validateShotOrigin(`), `src/netcode/LagCompensator.js:152` (`detectTeleport(playerId, newPosition, threshold = 50`).
- Consumers: `src/sdk/server.js:45` (`new LagCompensator(undefined`), the same in `src/sdk/WorkerEntry.js:67`, and `scripts/lag-overflow-witness.mjs:35` (`const lc = new LagCompensator(4000, TICK_RATE)`).
- Hitscan: `src/netcode/Hitscan.js:3` (`export const DEFAULT_HITBOX = Object.freeze(`), `src/netcode/Hitscan.js:19` (`export function resolveFireRequest(`), `src/netcode/Hitscan.js:32` (`export function rayVsCapsule(`), `src/netcode/Hitscan.js:56` (`export function findHitLinear(players, shot)`), `src/netcode/Hitscan.js:70` (`export function findHitSpatial(players, shot, liveIndex = null)`).
- Consumer: `src/behaviours/combat.js:255` (`const found = ctx.combat.findHitSpatial(players, shot, rewindIndex)`).
- Negative: `git grep -n findHitLinear -- src client apps` returns only `src/netcode/Hitscan.js:56` and the generated typings at `client/editor/sdk-typings.generated.d.ts:708`. The linear finder's caller is `scripts/netcode-conditioner-harness.mjs:334`.
- Rewind index: `src/netcode/RewindSpatialIndex.js:1` (`export const REWIND_SLOP = 10`), `src/netcode/RewindSpatialIndex.js:4` (`constructor(cellSize = 16)`), `src/netcode/RewindSpatialIndex.js:80` (`export const DUPLICATE_PLAYER_ID = 'duplicate_player_id'`), `src/netcode/RewindSpatialIndex.js:82` (`export class RewindDuplicatePlayerIdError extends Error`), `src/netcode/RewindSpatialIndex.js:98` (`throw new RewindDuplicatePlayerIdError(p.id, firstIndex, i)`).
- Negative: `git grep -n -E 'RewindDuplicatePlayerIdError|DUPLICATE_PLAYER_ID' -- src client apps scripts` returns only `src/netcode/RewindSpatialIndex.js` (lines 80, 82, 84, 85, 86, 98).

### Anti-cheat

- Ejection: `src/netcode/CheatEjection.js:1` (`export function wireCheatEjection({ voter, transport, hostMigration, onEjected = null })`). Consumer: `src/netcode/peerLoops.js:20` (`wireCheatEjection({ voter, transport: loop })`).
- Desync: `src/netcode/DesyncDetector.js:1` (`const RESOLVED_TICK_HISTORY_MAX = 128`), `src/netcode/DesyncDetector.js:3` (`export const DEFAULT_CHECKSUM_INTERVAL_TICKS = 30`), `src/netcode/DesyncDetector.js:5` (`export class DesyncDetector`). Consumer: `scripts/lockstep-cheat-harness.mjs:16` (`const detector = new DesyncDetector({`). The grep for `DesyncDetector` outside its own module returns only that harness.
- Voter: `src/netcode/ConsensusVoter.js:9` (`export const DEFAULT_CONSECUTIVE_DESYNCS_REQUIRED = 3`), `src/netcode/ConsensusVoter.js:10` (`const DESYNC_LOG_LIMIT = 16`), `src/netcode/ConsensusVoter.js:13` (`export class ConsensusVoter`). Consumer: `src/netcode/peerLoops.js:18` (`const voter = new ConsensusVoter({`).
- Event log: `src/netcode/EventLog.js:11` (`export let EVENT_LOG_KINDS = [...REPLAY_HANDLERS.keys()]`), `src/netcode/EventLog.js:19` (`export class EventLog`), `src/netcode/EventLog.js:113` (`static deserialize(json)`). Consumer: `src/sdk/WorkerEntry.js:20` (`import { EventLog } from '../netcode/EventLog.js'`). Other `EventLog` matches are the editor's `EditorEventLog` and message names.
- Input guard: `src/netcode/InputGuard.js:1` (`const INPUT_BUCKET_CAPACITY = 120`), `src/netcode/InputGuard.js:2` (`const INPUT_BUCKET_REFILL_PER_SEC = 90`), `src/netcode/InputGuard.js:5` (`export function isInputRateLimited(clientId)`), `src/netcode/InputGuard.js:36` (`const ENVELOPE_HEADROOM_MULT = 3`), `src/netcode/InputGuard.js:46` (`export function enforceMovementEnvelope(state, movement)`).
- Negative: `git grep -n -E 'InputGuard|isInputRateLimited|enforceMovementEnvelope|sanitizeInputPayload' -- src client apps scripts` has no hit outside `src/netcode/InputGuard.js`; the module has no consumer at this pin.
- Outlier detector: `src/netcode/OutlierDetector.js:1` (`const HEADSHOT_WINDOW_SIZE = 20`), `src/netcode/OutlierDetector.js:3` (`const HEADSHOT_RATIO_THRESHOLD = 0.75`), `src/netcode/OutlierDetector.js:6` (`const FLAG_COOLDOWN_MS = 5000`), `src/netcode/OutlierDetector.js:16` (`export function recordHit(eventLog, shooterId,`).
- Negative: `git grep -n -E 'OutlierDetector|recordHit' -- src client apps scripts` has no hit outside its own module.
- Lockstep checksum: `src/netcode/LockstepChecksum.js:3` (`const SECOND_LANE_SEED = 0x1000193`), `src/netcode/LockstepChecksum.js:24` (`export function checksumBodies(tick, snap)`). Negative: `git grep -n -E 'LockstepChecksum|checksumBodies' -- src client apps scripts` has no hit outside its own module.

### Snapshot binary

- Format: `src/netcode/SnapshotBinFormat.js:1` (`const WIRE_UNITS_PER_METER = 100`), `src/netcode/SnapshotBinFormat.js:4` (`export const BIN_RECORD_BYTES = 29`), `src/netcode/SnapshotBinFormat.js:39` (`export const PLAYER_TIER_FULL = 0`), `src/netcode/SnapshotBinFormat.js:40` (`export const PLAYER_TIER_REDUCED = 1`), `src/netcode/SnapshotBinFormat.js:41` (`export const REDUCED_POSE_FIELDS = 5`), `src/netcode/SnapshotBinFormat.js:44` (`export function packReducedPlayerPose(id, x, z, yawN)`).
- Encoder: `src/netcode/SnapshotEncoder.js:57` (`export const PLAYER_LOD_FULL_COUNT = 30`), `src/netcode/SnapshotEncoder.js:58` (`export const PLAYER_LOD_REDUCED2 = 120 * 120`), `src/netcode/SnapshotEncoder.js:59` (`export const PLAYER_LOD_REDUCED_HZ = 5`), `src/netcode/SnapshotEncoder.js:131` (`const FIELD_POS = 1 << 0`), `src/netcode/SnapshotEncoder.js:64` (`return packReducedPlayerPose(p.id, px, pz, yawN)`).
- Packer: `src/netcode/SnapshotPacker.js:3` (`const ARENA_BYTES = 1 << 18`), `src/netcode/SnapshotPacker.js:114` (`export function packSnapshotBytes(type, seq, encoded, me, chartEpoch, memo)`). Consumer: `src/sdk/TickHandler.js:166` (`const spliced = packSnapshotBytes(MSG.SNAPSHOT, seq, encoded, me, chartEpoch, recordMemo)`).
- Reduced-pose reader: `src/client/SnapshotProcessor.js:52` (`const pose = unpackReducedPlayerPose(p, _reducedPose)`).

### Wire

- Protocol version: `src/protocol/MessageTypes.js:1` (`export let WIRE_PROTOCOL_VERSION = 5`). Consumer: `src/client/MessageHandler.js:117` (`if (serverVersion !== WIRE_PROTOCOL_VERSION) {`).
- Registry: `src/protocol/MessageTypes.js:146` (`export function isRegisteredMessage(id)`), `src/protocol/MessageTypes.js:154` (`export let UNRELIABLE_MSGS = new Set([`). Consumers outside the module: `scripts/src-batch1-rules-witness.mjs:15` (`assert.equal(isRegisteredMessage(unreliableId), true)`) and `scripts/chart-reanchor-wire-harness.mjs:120`.
- Input codec: `src/protocol/InputCodec.js:5` (`export const MAX_INPUT_BUTTONS = 32`), `src/protocol/InputCodec.js:6` (`export const MAX_INPUTS_PER_PACKET = 8`), `src/protocol/InputCodec.js:18` (`const FLAG_EPOCH_TAGGED = 0x80`), `src/protocol/InputCodec.js:242` (`export function tryEncodeInputPacket(schema, entries, chartEpoch = 0)`). Consumer: `src/client/BaseClient.js:191` (`const packet = tryEncodeInputPacket(schema, entries, this._chart.epoch ?? 0)`).

## Stream 19: terrain and chart reanchor (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 24 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. Two of spoint's own locations were corrected here: `CaveMeshes` is `client/core/CaveMeshes.js`, not under `src/terrain`, and the `ChartReanchor*` modules are in `src/terrain/`, not `src/sdk/chartState/`.

Planet frame and surface solve:
- `src/terrain/PlanetFrame.js:3` (`export let SURFACE_SOLVE_TOLERANCE_M = 1e-4`).
- `src/terrain/PlanetFrame.js:9` (`const GROUND_MEMO_SLOTS = 4096`).
- `src/terrain/PlanetFrame.js:27` (`export class SurfaceSolveError extends RangeError {`).
- `src/terrain/PlanetFrame.js:286` (`function groundHeightLocal(x, z, yGuess) {`).
- The memo slot is a mask over the slot count: `src/terrain/PlanetFrame.js:291` (`& (GROUND_MEMO_SLOTS - 1)`).

Chart anchors and reanchor:
- `src/shared/chartAnchor.js:9` (`export const CHART_ANCHORS_PER_FACE = 32`).
- `src/shared/chartAnchor.js:10` (`export const CHART_REANCHOR_ANGLE_DEG = 28`).
- `src/sdk/chartState/index.js:21` (`export function attachServerChartMigrators(ctx, service) {`). It has two callers: `src/sdk/WorkerEntry.js:117` (`if (s?.chartReanchor) attachServerChartMigrators(ctx, s.chartReanchor)`) and `src/sdk/ServerAPI.js:96` (`if (ctx._terrainStreamer?.chartReanchor) attachServerChartMigrators(ctx, ctx._terrainStreamer.chartReanchor)`).
- The `chartEpoch` occurrences by file, counted with `grep -c`: `src/terrain/ChartReanchorService.js` 4, `src/terrain/ChartReanchorTerrain.js` 4, `src/terrain/ColliderStreamer.js` 1, `src/terrain/FieldLattice.js` 1.

Caves, grass and biomes:
- `src/terrain/TerrainPhysics.js:8` (`import { loadCaveCarveLayer } from './CaveSDF.js'`).
- `client/core/CaveMeshes.js:2` (`import { polygonizeCaveVolume, loadCaveCarveLayer } from '/src/terrain/CaveSDF.js'`). `CaveSDF` has these two importers and no others.
- `src/terrain/GrassPlacementLod.js:15` (`export function grassBladeReachM(q, law) {`) and `src/terrain/GrassPlacementLod.js:19` (`export function createGrassChunkLod(key, frame, anchorField, worldSeed, law, now, abandoned) {`). Its only importer is `client/core/Grass.js:9` (`import { createGrassChunkLod } from '/src/terrain/GrassPlacementLod.js'`).
- `src/terrain/BiomeOverride.js:4` (`export let CELL_M = 8`), `src/terrain/BiomeOverride.js:24` (`export function createBiomeOverride(strokes) {`) and `src/terrain/BiomeOverride.js:108` (`export function loadBiomeOverride(json) {`). Its importers were not checked, so no claim is made about them.
- `src/terrain/CavePatches.js:22` (`export function sdfSphere(wx, wy, wz, cx, cy, cz, r) {`) and `src/terrain/CavePatches.js:187` (`export function createSphericalCave(heights, width, spacing, cornerX, cornerZ, cx, cy, cz, radius, opts = {}) {`).

Static tile index:
- `src/physics/StaticTileIndex.js:3` (`export const STATIC_TILE_M = 16`) and `src/physics/StaticTileIndex.js:4` (`export const STATIC_TILE_MARGIN_M = 3`).
- Its importer is `src/physics/World.js:5` (`import { createStaticTileIndex } from './StaticTileIndex.js'`), and it is constructed at `src/physics/World.js:222` (`this._staticTiles = createStaticTileIndex(this, tileM)`).

Negatives (`git grep` or a path check at `d5e3860`):
- `src/terrain/CaveMeshes.js` does not exist at `d5e3860`.
- `CavePatches` has no importer. `git grep -l CavePatches d5e3860 -- src client apps packages edge scripts` lists 0 files. Its only other mention in the tree is `.gm/pool/pool.log`, which is outside those paths. So the `CavePatches` exports above have no importer.
- In `scripts`, `CavePatches`, `CaveSDF`, `GrassPlacementLod` and `StaticTileIndex` each match 0 files. `PlanetFrame` matches 10, `ChartReanchor` 3 and `ClimateCache` 3.
- `git grep -l -E 'ChartReanchorService|ChartReanchorTerrain' d5e3860 -- src/sdk/chartState` lists 0 files. The chartState directory does mention `onChartReanchor` in `src/sdk/chartState/migrateEntities.js` and `ctx.lastChartReanchor` in `src/sdk/chartState/index.js`, which are app hooks, not the service modules.

These facts are about spoint. Terrain runtime behaviour is not claimed here, and any runtime question goes to the owner.

## Stream 20: client render, editor and HUD, XR, and packages (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 31 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. Savi's listing of these packages (PARITY-INPUTS, FEATURESET and JAYZEE-GAPS row 55) names the packages and the `EP_progressive_lod` schemas only. None of the lines below appear in those listings.

Shadows and occlusion:
- Cascade 0 never renders when the sun does not cast shadows: `client/core/ShadowPipeline.js:19` (`const cascade0NeverRenders = sun.castShadow === false`), and the cascade count follows from it at `client/core/ShadowPipeline.js:20` (`cascadeCount = cascade0NeverRenders ? 1 : Math.max(1, Math.min(MAX_CASCADES`). The forced update is at `client/core/ShadowPipeline.js:152` (`forceUpdate`).
- The shadow cost probe reports a per-light-pass backend with split support off: `client/core/ShadowCostProbe.js:139` (`return { attached: true, backend: ARM_PER_LIGHT_PASS, splitSupported: false, reason: null }`), and its public entry is `client/core/ShadowCostProbe.js:195` (`installShadowCostProbe`).
- Scene occlusion imports the WebGPU Hi-Z tier from the package: `client/core/SceneOcclusion.js:3` (`import { WebGpuHizTier } from 'streaming-gltf/webgpu-hiz-tier'`). It selects that tier only on a WebGPU renderer: `client/core/SceneOcclusion.js:10` (`if (renderer && renderer.isWebGPURenderer) return new WebGpuHizTier(renderer, opts)`). Its tested-count line is `client/core/SceneOcclusion.js:182` (`queriedThisFrame: (tier.stats.entityTested || 0) + (tier.stats.queried || 0)`).
- The package export is `packages/streaming-gltf/package.json:16` (`"./webgpu-hiz-tier": "./src/webgpu-hiz-tier.js"`), and the class is `packages/streaming-gltf/src/webgpu-hiz-tier.js:64` (`class WebGpuHizTier`).
- Cull freeze switches instanced and batched meshes to manual cull: `client/core/CullFreeze.js:4` (`setInstancedCullAuto`), `client/core/CullFreeze.js:11` (`setBatchedMeshCullAuto`), and it marks visibility changed at `client/core/CullFreeze.js:14` (`mesh._visibilityChanged = true`).
- A cluster LOD mesh renders at most once per frame: `packages/streaming-gltf/src/cluster-lod-mesh.js:213` (`const alreadyRenderedThisFrame = this._lastRenderFrame === frame`), `packages/streaming-gltf/src/cluster-lod-mesh.js:214` (`if (alreadyRenderedThisFrame) return`) and `packages/streaming-gltf/src/cluster-lod-mesh.js:215` (`this._lastRenderFrame = frame`).
- The progressive LOD reader accepts the extension or the local extras key: `packages/streaming-gltf/src/model-pool.js:191` (`json?.extensions?.EP_progressive_lod ?? json?.extras?.LOCAL_progressive`).

XR and editor and HUD:
- Teleport arc bounds use a BVH only above a triangle threshold: `client/xr/XRWidgets.js:11` (`const ARC_BOUNDS_TREE_MIN_TRIANGLES = 2000`) and `client/xr/XRWidgets.js:141` (`if (triangles >= ARC_BOUNDS_TREE_MIN_TRIANGLES) geometry.computeBoundsTree()`).
- XR pointers are excluded through a user-data flag: `client/xr/XRSystem.js:52` (`object.userData.xrPointer = true`).
- Editor and HUD exports: `client/editor/EditorShell.js:21` (`export function createEditPanel({`), `client/hud/PeerHostUI.js:27` (`export function createRoomCodeUI(uiRoot, code, joinLink)`) and `client/hud/PeerHostUI.js:43` (`export function createPeerHostUI(uiRoot, getClient, iceServers)`).

Quality governor and tiers:
- The frame budget is 16.67 ms: `client/core/QualityGovernor.js:3` (`export const FRAME_BUDGET_MS = 16.67`).
- The tier choice is resolved against the creator's maximum: `client/core/QualityTierChoice.js:10` (`export function resolveQualityTier(requested, creatorMaxTier)`).
- The presets object: `client/core/QualityPresets.js:153` (`export const QualityPresets = {`).

Packages:
- The ECS package re-exports `createWorld` at `packages/ecs/src/index.js:1` (`createWorld`) and `createQuery` at `packages/ecs/src/index.js:2` (`createQuery`).
- The mapspinner package exports `createRenderer` at `packages/mapspinner/src/index.js:10` (`export async function createRenderer(gl, config = {})`) and `createPlanet` at `packages/mapspinner/src/index.js:15` (`export async function createPlanet(gl, config = {})`).
- The Rust crate is named `spoint-core`: `packages/spoint-core/Cargo.toml:2` (`name = "spoint-core"`).

Negatives (`git grep`, `git cat-file` or `git ls-tree` at `d5e3860`):
- `client/core/WebGpuHizTier.js` does not exist. The class is in `packages/streaming-gltf/src/webgpu-hiz-tier.js:64`, and a second copy is in `packages/streaming-gltf/examples/local-progressive/webgpu-hiz-tier.js:10` (`export class WebGpuHizTier {`), which client code does not import.
- Witness scripts that name these modules: `ShadowCostProbe`, `QualityGovernor`, `SceneOcclusion`, `EditorShell` and `PeerHostUI` each match 0 files under `scripts`. `ShadowPipeline`, `CullFreeze`, `XRWidgets` and `cluster-lod-mesh` each match 1 file, 1 file, 5 files and 1 file.
- `packages/spoint-core` has 0 `.js` files. It contains `Cargo.toml`, `Cargo.lock` and `src/lib.rs`.
- The name `EP_progressive_lod` is read in one file only, `packages/streaming-gltf/src/model-pool.js`, across `src`, `client`, `packages/streaming-gltf/src` and `scripts`.

These are static facts about spoint. The GPU and XR runtime behaviour is not exercised here, and any runtime question goes to the owner.

## Stream 18: SDK server HTTP, static serving and server surface (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the exact source line at `d5e3860`. A self-check re-read all 25 snippets from `git -C /workspace/spoint show d5e3860:<path>` and matched 25 of 25 before this section was written. Nothing was written into spoint.

Static serving, COEP and path containment:
- The COEP value is `require-corp`: `src/sdk/StaticHandler.js:101` (`const COEP_VALUE = 'require-corp'`).
- The COEP header is sent with the COOP header: `src/sdk/StaticHandler.js:108` (`res.setHeader('Cross-Origin-Embedder-Policy', COEP_VALUE)`).
- A baked path containing `..` is refused: `src/sdk/StaticHandler.js:146` (`if (!bakedRel.includes('..'))`).
- Static files are contained to the served root after resolution and symlink realpath: `src/sdk/StaticHandler.js:227` (`if (fpResolved !== baseResolved && !fpResolved.startsWith(baseResolved + sep)) continue`).

Token comparison:
- The compare is `timingSafeTokenEqual`: `src/sdk/authCompare.js:10` (`export function timingSafeTokenEqual(a, b) {`).
- The Node path uses `crypto.timingSafeEqual`: `src/sdk/authCompare.js:2` (`const _nodeTimingSafeEqual = _isNode ? (await import('node:crypto')).timingSafeEqual : null`).
- A length mismatch still runs a dummy compare before returning false: `src/sdk/authCompare.js:15` (`if (bufA.length !== bufB.length) { _nodeTimingSafeEqual(bufA, bufA); return false }`).
- The editor token is checked on the upload route: `src/sdk/ServerAPIRoutes.js:48` (`if (_tok && !timingSafeTokenEqual(req.headers['x-editor-token'], _tok)) { res.writeHead(403); res.end('forbidden'); return }`). There are three call sites in that file, at lines 48, 57 and 148.
- The socket message token is checked the same way: `src/sdk/ServerHandlers.js:454` (`const ok = !!_tok && timingSafeTokenEqual(msg.payload?.token, _tok)`).
- Some routes require a loopback remote address: `src/sdk/ServerAPIRoutes.js:97` (`if (!isLoopbackAddress(remote)) { res.writeHead(403); res.end('forbidden'); return }`).
- The API sends a wildcard CORS origin: `src/sdk/ServerAPIRoutes.js:137` (`'Access-Control-Allow-Origin': '*',`).
- The server API entry is `src/sdk/ServerAPI.js:26` (`export function createServerAPI(ctx) {`).

Sandbox, upload, minimap, persistence, room orchestration, cron and LLM jobs:
- The SES preflight entry: `src/sdk/SESCompartmentEvaluator.js:34` (`export async function preflightSes({ importSes: doImport = importSes, lockdown: doLockdown = null, getCompartment = null, isFrozen = null } = {}) {`).
- A failed lockdown returns a reason code rather than throwing: `src/sdk/SESCompartmentEvaluator.js:44` (`if (!isAlreadyLockedDown(cause)) return { ok: false, Compartment: null, reasonCode: 'SES_LOCKDOWN_FAILED', cause }`).
- The upload size cap is 50 MiB: `src/sdk/UploadHandler.js:6` (`const MAX_SIZE = 50 * 1024 * 1024`), enforced at `src/sdk/UploadHandler.js:55` (`if (size > MAX_SIZE) { fail(413, 'too large'); return }`).
- On-demand minimap bakes are capped at 64 concurrent: `src/sdk/MinimapBake.js:10` (`const MAX_CONCURRENT_ON_DEMAND_MINIMAP_BAKES = 64`), with the bake entry at `src/sdk/MinimapBake.js:59` (`export function bakeMinimapIfMissing(worldName, tcfg, opts = {}) {`).
- The world snapshot format is version 1: `src/sdk/WorldPersistence.js:8` (`export let WORLD_SNAPSHOT_FORMAT_VERSION = 1`). The world name resolves from the definition, then the context, then the environment: `src/sdk/WorldPersistence.js:37` (`return ctx.currentWorldDef?.name || ctx.worldName || envWorldName() || null`).
- The room orchestrator router is `src/sdk/RoomOrchestratorHttp.js:55` (`export function startRoomOrchestratorRouter(orch, port) {`), and worker registration is `src/sdk/RoomOrchestratorHttp.js:60` (`if (req.method === 'POST' && url.pathname === '/workers/register') {`).
- Cron rejects a non-positive step: `src/sdk/cronSchedule.js:25` (`if (!(step >= 1)) throw new CronSyntaxError('bad-step'`).
- LLM jobs cap messages at 32 and prompts at 8000 characters: `src/sdk/llmJobs.js:12` (`const DEFAULT_MAX_PROMPT_CHARS = 8000;`) and `src/sdk/llmJobs.js:28` (`export function createLlmJobs({ provider = null, maxMessages = DEFAULT_MAX_MESSAGES, maxPromptChars = DEFAULT_MAX_PROMPT_CHARS } = {}) {`).

Negatives (`git grep` at `d5e3860`, scoped to `src`):
- `git grep -n -i -E 'Content-Security-Policy|Strict-Transport-Security' d5e3860 -- src` prints 0 lines, so no CSP or HSTS header is set.
- `git grep -n 'Cross-Origin-Resource-Policy' d5e3860 -- src` prints 0 lines.
- `git grep -n 'Access-Control-Allow-Origin' d5e3860 -- src` prints one line, `src/sdk/ServerAPIRoutes.js:137`.
- `git grep -n -i 'rate.\?limit' d5e3860 -- src/sdk/UploadHandler.js src/sdk/StaticHandler.js src/sdk/llmJobs.js` prints 0 lines, so none of those three paths has a rate limit.
- `git grep -c 'timingSafeTokenEqual(' d5e3860 -- src` reports `ServerAPIRoutes.js` 3, `ServerHandlers.js` 1 and `authCompare.js` 1.

These are facts about spoint. They do not change any jayzee row. Jayzee may idealize any of these parts, as the owner's clarification allows.

## Scoped spawn decoded-frame token scan (spawn-reported, aggregates re-derived here)

The inputs are spawn's scan output, which exists only in spawn's ephemeral directory and has no durable copy here: `dt/results.jsonl` (2580 rows) and `dt/keys.txt`. The aggregates were re-derived from those two files. The decode itself was not re-run, so the result stays scoped to spawn's run.

Four denominators, kept separate:
- 307 text-visible keys (the earlier census in the escape-token bullet above). This is a different scope.
- 11987 unique decoded-frame `world.assets` keys. `keys.txt` has 12186 lines, which is 11987 unique keys plus 199 duplicate lines.
- 2580 manifests reached. All returned status 200, and 1240 have `world.assets` keys. 1584 have a `/cdn/` slash.
- 399 worlds with `/cdn/` GLB references. This is the census denominator used elsewhere in this file and is not compared with the rows above.

Scoped results, decoded-frame scope only, re-derived:
- Frames 229921, gzip frames 1, decode failures 0.
- Key occurrences 12259 (the sum of `keyCount` over the 2580 rows). They exceed the per-manifest unique sum 12186 by 73, a gap closed below.
- Unique keys 11987: 11679 are `~2fcdn~2fvalue.<sha>` and 308 are `~2fcdn~2f<name>` with no sha.
- Three `~2f` scopes, never merged (spawn-reported, each 2 × its key denominator): 24518 = 2 × 12259 raw decoded-frame key occurrences; 24372 = 2 × 12186 per-manifest unique key lines; 23974 = 2 × 11987 unique keys across the 2580 scope. Each key carries exactly two `~2f`.
- `~3a` 0 and `~7e` 0 across the unique keys, with no key containing `spawnfile`, `https~3a` or a bare tilde. Bucket `3d` holds 22 keys, all `/cdn/` keys.
- `spawnfile` occurs 0 times across the decoded frames.

These negatives hold only in the decoded-frame scope of the 2580 manifests reached. They are not a universal absence. The spawnfile key path stays ELIDED, the bucket rule stays UNDETERMINED, and the 2 non-CDN refs and the 2 404 keys stay scoped observations. The 73-line gap is CLOSED as a witnessed resolution. Spawn's `reconcile-gap.mjs` over `kw/key-world.jsonl` (spawn-reported) gives dtRawKeyCountSum 12259, kwPerManifestUniqueSum 12186, withinManifestRepeatSum 73, manifestsWithRepeats 61, negativeDiffs 0, kwUniqueAcrossAll 11987 and missing 0. Savi re-derived the arithmetic from `kw/key-world.jsonl` and spawn's `dt/results.jsonl`: 61 manifests differ between the two counts, the differences sum to 73, and `kw/key-world.jsonl` has no key repeated within any manifest. The mechanism, repeats within one manifest in the raw scan, is spawn's and is not re-derived here. The 199 cross-manifest duplicate lines (12186 − 11987) are a separate figure, not part of the 73.

## Scoped spawn body witnesses

These are body-level witnesses from spawn. They are scoped as stated, do not change any OPEN status, and do not close the rows they touch. Witness copies are durable at `/workspace/spawn/maps/witness/`, with the checkers `manifest-chain.mjs` and `manifest-hashmatch.mjs` alongside.

- Manifest frames after the sheet, for 3 manifests only. `5a526ee6…` (gm-manhattan): 513116 bytes, 69 hashes, 69 frames after the sheet and 70 in total; chain exact to EOF; 69 of 69 frame-body sha256 values are in `sheet.hashes`. `d0d3c548…` (GTA Earth): 186349 bytes, 80 hashes, 80 of 80 in the sheet, chain exact (81 frames including the sheet). `cbd886b0…` (bdabcf5a): 645995 bytes, 274 hashes, 274 of 274 in the sheet, chain exact (275 including the sheet). In each case, the manifest name equals `hashes[0]`. Ordered mapping, for these 3 manifests only: the body sha256 of frame i equals `sheet.hashes[i]` for every frame (69/69, 80/80, 274/274, `firstMismatchIndex` null; gm run `2026-11-07-15-45-12-c8e58a`, script copy `/workspace/spawn/maps/witness/`). A sample of 40 further manifests, taken evenly from 2580 distinct (about 1.7%), also matched: 40 of 40 returned HTTP 200, each chain ended exactly at EOF, and the ordered mapping held on every frame, with 2961 frames equal to 2961 hashes (spawn). Combined with the 3 above, 43 of 43 were reached. This is a sample, not a corpus-wide rule. Copies: `/workspace/spawn/maps/witness/manifest-sample40/`, with `manifest-check.mjs`. Corpus result, scoped to the 2580 distinct manifests reached (witness `spawn-evidence/data/manifests-all-results.jsonl`, 2580 lines): HTTP 200 for 2580; the chain ends exactly at EOF for 2580; frames equal hashes for 2580; parse errors 0; totals 229921 hashes equal 229921 frames, 566376956 bytes. Ordered frame i equals sheet hashes[i] for 2579 of 2580, 2579 of 2580 fully matching. The one exception is `d048ad0665b46944dea920d8daed8dbe85874fb4a9d8809339e88223cd853fca`: its sheet lists 3 hashes and frames 0 and 1 match. Frame 2 is gzip-wrapped (magic `1f8b08`), gunzips to 232 bytes of JSON index, and the sha256 of the decoded body equals sheet hashes[2]. The raw gzip bytes (sha256 `0016de86…`) are not in the sheet, which is why spawn's checker flagged it. Status: EXPLAINED. The durable census copies are in savi (`spawn-evidence/probe-scripts/verify-v3.mjs` and `spawn-evidence/data/manifests-all-v3-results.jsonl`), and the census below was re-derived from the copied rows. The corpus-wide census over the 2580 reached finds exactly one gzip-wrapped frame, this one: gzipFrames 1, gzipDecodedMatch 1, gzipFail 0, rawMatch 229920, rawFail 0. Both sibling passes have 0 hits outside this sheet (raw `0016de86…`, decoded `13abafd8…`). The sheet therefore hashes decoded content for gzip-wrapped frames. This holds for the 2580 reached only and is not a corpus rule for manifests not reached. The earlier raw-byte figure is kept as the audit trail, from before the gzip decode was known. The 40-manifest sample above is a subset of these 2580. Denominators, which are not interchangeable: 2580 is the distinct manifests in the cdn-scan jsonl (40 sampled, about 1.7%); 399 is the worlds with /cdn/ GLB refs, and 396 is that 399 less the 3 manifest worlds examined. Witness copies: `mf-gm-manhattan-scanned.bin`, `mf-gta-earth-scanned.bin` and `mf-bdabcf5a-scanned.bin`.
- Head drift, a single observed case and not a rule, UNVERIFIED: for world `41cd4649…`, head.json (seq 553) names manifest `3fa9a434…`, which returns 404 `unknown_world_store_key`. The scanned manifest `5a526ee6…` still returns 200.
- Resolve-adventure, partial. Trailing-slash `/api/resolve-adventure/` returns 308 to `https://www.spawn.co/api/resolve-adventure`, with body "Redirecting...". `http://www…` returns 308 to https. `https://spawn.co…` returns 307 to `https://www.spawn.co/…`, with body "Redirecting...". No address or an empty one returns 400 `{"ok":false,"error":"Invalid query"}`. Found and not_found return 200 JSON with `result.type` `found` or `not_found`. Gone (410) was NOT reached in 22 probes, so the gone half stays OPEN. Bodies: 16 copies at `/workspace/spawn/maps/witness/ra-*.body` and `rb-*.body`.

## Scoped spawn encoder and bucket witnesses

Partial, scoped witnesses from spawn. They do not close OPEN-010 or OPEN-015. Copies are in `/workspace/spawn/maps/witness/encoder-bucket/`. The scripts read `/tmp/spawn-probe` as an ephemeral input (labelled here, not a Source path) and `/workspace/spawn/maps/witness` as the durable input.

- Encoder `/` to `~2f`: `node encoder-test.mjs` gives `distinctKeys` 307, `~2f` escapes 614, `roundTripEncodeOfDecode` 307, and `fails` []. Scope: 307 distinct keys.
- Encoder `:` to `~3a`: witnessed only in the FAULTS F3 sample (`spawn-engine/FAULTS.md`), not in the 307. OPEN.
- Encoder `~` to `~7e`: unwitnessed. OPEN.
- Escape-token census over the reached file-map keys, SCOPED to text-visible keys (spawn-reported; the 307 keys, the `~2f` count and the round trip were re-run here with `spawn-evidence/maps/witness/encoder-bucket/encoder-test.mjs`): distinct keys 307, `~2f` 614 occurrences, round trip 307/307, `fails` []. Spawn-reported, not re-run here: 298 keys start `~2fcdn~2fvalue.` (content-addressed) and 9 start `~2fcdn~2f` with a name rather than a sha; `~3a` is 0 of 307 reached keys (it appears only in the FAULTS F3 sample, the ASSETS.md:35 placeholder and jayzee's fixtures); `~7e` has 0 reached occurrences (only encode code and jayzee's constructed fixture at `check-spawn.mjs:50`); bare tilde 0; spawnfile host 0. The manifest sample binaries have 0 `world.assets` matches, so this census covers text-visible keys only and makes no universal claim.
- Bucket `world.assets/<xx>/`: `node bucket-test.mjs` gives 1163 files, 298 distinct (xx, sha) pairs and 135 buckets. The best of 8 tested hash rules scores 2 matches, which is chance-level, so those rules are NEGATIVE. The rule itself stays OPEN (OPEN-015).
- `node bucket-test3.mjs` over 279 keys: `frameBody` 0, `frameWhole` 0, `keyText` 0, `valueSha` 0 matches. NEGATIVE for those four.

## Jayzee gap register

The per-row implementation gaps are in `docs/JAYZEE-GAPS.md`. It maps each FEATURESET group to its jayzee PARITY rows, quotes each open clause at jayzee `daaee8e`, and tags each gap required-in-jayzee. Rows 13 and 36 are UNVERIFIED as closed: jayzee's PARITY.md still says partial at `daaee8e`. Rows 62 to 65 are catalogs and are open.

## Feature-support contract

The feature-support contract is not duplicated here. It lives in `docs/OPEN-ITEMS.md` under "Required feature support", which is extended with the spawn learnings from this document.
