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
| ENDPOINTS header "62 paths" vs sections summing to 63 | none | none | UNVERIFIED here. Not a contradiction: 62 is the spec path count and 63 sums named-endpoint buckets. This is OPEN-001, which stays OPEN for the owner. |

### Other savi facts

- Endpoints: `ENDPOINTS.md` names 93 endpoints from an OpenAPI 3.1.0 spec. The 93 total reconciles (REPRODUCED). The header and section counts measure different things (spec paths against named endpoints), so they do not contradict; this is recorded as OPEN-001.
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
- `.gm/witness-out/spawn-feature-gap.md` is a 60-claim gap report: 47 implemented, 13 remaining. The 47 are not independently verified.

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

### Stream 11: jayzee PARITY rows 6-10, 32, 33 at `17ce428` (spoint-witnessed at `d5e3860`)

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

Each line gives the durable spoint path and line witness, or the grep that found no counterpart. Jayzee rows are `docs/PARITY.md` at `2db34a0`. Quoted open-item text for rows 13 and 36 is from that pin; spoint's line citations are unchanged.

- Worker bridge (row 13 open: "the worker bridge, which is injected and has no jayzee adapter"; row 47 partial): `src/sdk/WorkerEntry.js` lines 207-212 hold the `hasWorkerPostMessage` branch, with line 210 creating `WorkerTransport`, line 211 `ctx.onClientConnect(_transport)`, and line 212 `ctx.peerSession?.start()`. `src/transport/WorkerTransport.js` line 22 defines `WorkerTransport extends TransportWrapper`, lines 25-27 the constructor (`type = 'worker'`, `ready = true`), and lines 29-34 `send`, which posts `{ type: 'SEND_CLIENT', data: buf, mt }` with the buffer as a transfer. `client/core/WorkerRenderer.js` exists, and was not read in this pass.
- TickSystemBase timer (row 13 open: "the TickSystemBase timer"): `src/netcode/TickSystemBase.js` lines 8-23 hold the `_timerGranularityMs` probe, which measures `setTimeout(r, 1)` and keeps the worst value. Line 26 is `export class TickSystemBase`, line 42 `schedulerStats = { ticks, droppedMs, maxLateMs, spinWakeups, timerWakeups }`, and line 73 `getSchedulerStats()`. `start()` is at line 92 and sets `this._timer` at line 113, with `unref()` at line 114. `stop()` at lines 188-190 calls `clearTimeout`. Paused scheduler (a deliberate deviation recorded for jayzee row 13): `git grep -n -E "_schedule\(\) \{|this._state !== 'paused'|this._timer = setTimeout|this._state = 'paused'" -- src/netcode/TickSystemBase.js` gives line 101 `_schedule()`, line 102 `if (!this.running && this._state !== 'paused') return`, line 113 `this._timer = setTimeout(..., Math.max(0, wait))`, and line 176 `this._state = 'paused'`. spoint's `_schedule` still passes the guard while paused and arms a wake. jayzee arms none while paused. This is a difference, not a bug on either side.
- Stats interval (row 13 open: "the stats interval"): scoped negative for `TickSystemBase`. `git grep -n setInterval -- src/netcode` finds one hit, `src/netcode/PeerSimSession.js` line 135, `statsTimer = setInterval(() => post({ type: 'PEER_STATS', stats: this.getStats() }), STATS_POST_INTERVAL_MS)`. The stats interval lives in `PeerSimSession`, not `TickSystemBase`.
- Rollback-only PeerSimSession (row 13 open): `src/netcode/PeerSimSession.js` line 16 is `createPeerSimSession(ctx, { roster, localPubkey, post })`, and line 18 refuses a profile not in `PEER_SIMULATED_PROFILES`. Lines 93-98 are `observeRollback` with `before` and `after` snapshots of connected player positions. Lines 117-119 select `buildPeerLoop = PEER_LOOP_FACTORIES[profile.name]`, which throws when a profile has no loop. `src/netcode/peerLoops.js` line 9 is the frozen `PEER_LOOP_FACTORIES`, and line 25 derives `PEER_SIMULATED_PROFILES` from its keys. The rollback factory is located. `git grep -n -E "^export let PEER_LOOP_FACTORIES|^  rollback: \(|^  lockstep: \(" -- src/netcode/peerLoops.js` gives line 9 `export let PEER_LOOP_FACTORIES = Object.freeze({`, line 10 `rollback: (...) => {`, lines 11-14 that build the rollback transport and loops and return `{ loop, transport, voter: null }`, and line 16 where the lockstep entry starts. The rollback-only PeerSimSession stays OPEN.
- Bandwidth horizons (row 36 open: "bandwidth horizons, which are not in Metrics"): scoped negative: no named bandwidth horizon in the grep set below. `git grep -n -i horizon -- src/sdk/Metrics.js src/netcode src/sdk/TickHandler.js src/sdk/TickHandlerAOI.js` returns only `src/netcode/ConsensusVoter.js` lines 11, 93 and 97, which are checksum horizons. The closest is `src/sdk/TickHandlerAOI.js` line 6, `BANDWIDTH_BUDGET_BYTES_PER_TICK = 900`, with trim constants on lines 7-8, and the trim gate at `src/sdk/TickHandler.js` line 378. These are a per-tick byte budget, not a horizon.
- Host GC observer (row 36): jayzee ports it as `src/telemetry-pure/gcObserver.js` and lists it under Ported at `2db34a0`, so it is not an open item there. spoint side: `src/sdk/Metrics.js` line 71 is `createGcTracker()`, line 72 the histogram `spoint_gc_pause_ms`, lines 76-87 a `PerformanceObserver` with `observer.observe({ entryTypes: ['gc'], buffered: false })` at line 87, and line 96 `disconnect()`.
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

## Stream 23: fire behaviour modules (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 21 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The fire kernel under `src/shared/fire/` is covered by PARITY row 26 (GAP-fire-kernel-witness). This stream covers the four behaviour modules that row does not name. Savi's documents name `fireKernel` only.

Weather reading:
- The two weather constants: `src/behaviours/fireWeather.js:5` (`const NO_WEATHER = Object.freeze({ kind: 'no-weather', intensity: 0, wind: null })`) and `src/behaviours/fireWeather.js:6` (`const UNREADABLE_WEATHER = Object.freeze({ kind: 'unreadable-weather', intensity: 0, wind: null })`).
- The reader is `src/behaviours/fireWeather.js:18` (`function parseWeather(w) {`). A non-finite intensity returns the unreadable kind at `src/behaviours/fireWeather.js:22` (`return { kind: 'unreadable-weather', intensity: 0, wind }`).
- The kinds follow the type field: `src/behaviours/fireWeather.js:24` (`if (w.type === 'rain') return { kind: 'rain', intensity, wind }`), `src/behaviours/fireWeather.js:25` (`if (w.type === 'snow') return { kind: 'snow', intensity, wind }`) and `src/behaviours/fireWeather.js:26` (`return { kind: 'dry-other', intensity, wind }`).
- Snow yields less rain: `src/behaviours/fireWeather.js:31` (`if (reading.kind === 'snow') return Math.round(reading.intensity * config.rainPerIntensity * config.snowRainFraction)`).
- The factory is `src/behaviours/fireWeather.js:35` (`export function createFireWeather({ config, readWeather, stepTicks, wind: initialWind = [0, 0, 0] }) {`), and each step reads the weather at `src/behaviours/fireWeather.js:45` (`reading = parseWeather(readWeather())`).

Spec and defaults:
- `src/behaviours/fireSpec.js:4` (`export const DEFAULT_FIRE = Object.freeze({`) and `src/behaviours/fireSpec.js:87` (`export function resolveFireSpec(spec) {`). The helpers are re-exported at `src/behaviours/fireSpec.js:134` (`export { describeValue, isVec3 }`).
- Gameplay defaults: `src/behaviours/fireSpec.js:145` (`export const DEFAULT_FIRE_GAMEPLAY = Object.freeze({ damageEveryTicks: 15, burnStatusSeconds: 4, statusDamagePerSec: 5`).
- The rain-per-intensity rule accepts an integer from 0 to 255: `src/behaviours/fireSpec.js:161` (`rainPerIntensity: { rule: 'an integer from 0 to 255'`).
- Weather defaults: `src/behaviours/fireSpec.js:168` (`export const DEFAULT_FIRE_WEATHER = Object.freeze({ rainPerIntensity: 255, snowRainFraction: 0.25`).

Firebreaks and gameplay:
- `src/behaviours/fireTerrain.js:1` (`export function createFirebreakFuel({ baseClassAt, breaks, frame, lattice, terrain }) {`). Construction refuses three cases: a non-positive planet radius at `src/behaviours/fireTerrain.js:4` (`frame.radius must be a positive finite number`), water breaks without both samplers at `src/behaviours/fireTerrain.js:8` (`firebreaks.water needs both a height and a sea-level sampler`), and kind breaks without a kind sampler at `src/behaviours/fireTerrain.js:9` (`firebreaks.kinds needs a terrain kind sampler`).
- The gameplay factory is `src/behaviours/fireGameplay.js:3` (`export function createFireGameplay({ appCtx, gameplay, getWorld, cellOfPosition, frameOf }) {`).

Negatives:
- `git grep -l -F` over `scripts` at `d5e3860` finds `fireGameplay`, `fireSpec`, `fireTerrain` and `fireWeather` in 0 files each, so none has a witness.
- Savi's `docs/FEATURESET.md`, `docs/PARITY-INPUTS.md` and `docs/JAYZEE-GAPS.md` each name these four modules 0 times.

These are static claims. The weather contract is pinned by reading the code, and the fire simulation is not run here.

## Stream 24: client editor modules (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 11 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint.

- `client/editor/EditorAutosave.js:34` (`[EditorAutosave] write failed:`): the recovery write logs and resolves false on a transaction error.
- `client/editor/EditorAutosave.js:35` (`[EditorAutosave] write error:`): the recovery write resolves false on a thrown exception.
- `client/editor/EditorAutosave.js:48` (`[EditorAutosave] read failed:`): the recovery read resolves null on a request error.
- `client/editor/EditorAutosave.js:49` (`[EditorAutosave] read error:`): the recovery read resolves null on a thrown exception.
- `client/editor/EditorAutosave.js:53` (`async function _deleteRecoverySnapshot() {`): the delete opens the database handle first.
- `client/editor/EditorAutosave.js:61` (`tx.onerror = () => resolve(false)`): the delete resolves false on a transaction error.
- `client/editor/EditorAutosave.js:62` (`} catch (e) { resolve(false) }`): the delete resolves false on a thrown exception.
- `client/editor/EditorFsBrowse.js:23` (`export function fsSaveBase(pendingSave) {`): the save base is null without a pending save.
- `client/editor/EditorFsBrowse.js:24` (`return pendingSave ? {`): the base carries `mtimeMs` only when it is finite.
- `client/editor/EditorApps.js:14` (`export function getAppCategory(app) {`): the category is the declared string, or else a name-prefix rule.
- `client/editor/EditorApps.js:27` (`if (name.startsWith('editor-')) {`): the `editor-` prefix maps to Editor Tools after the earlier rules.

Cluster: 28 files and 5950 lines, counted with `wc -l` over `git show d5e3860:<path>` for the `.js` files under `client/editor/` excluding `EditorShell.js`, `editor.js` and `wm/`. Excluding only `EditorShell.js` gives 32 files and 7184 lines, so reaching 28 needs the other two exclusions. The earlier figure of 5284 lines does not reproduce under any scope tried, including non-blank lines (5399), so 5950 is the derived figure.

Negatives:
- `scripts/` in savi names none of the 28 basenames, so 0 of 28 have a witness script.
- Outside this section, savi's docs name 26 of the 28 basenames 0 times. Four are named and disclosed: `EventChainPanel` as the editor consumer of EventChainManager at `docs/FEATURESET.md:178`, `EditorEventLog` in the event-log line at `docs/FEATURESET.md:223`, `FreddieChatPanel` as a code importer listed in the stream 25, part 2 section, and the editor panel that imports the procgen modules, listed as an importer in the stream 30 section. Each is recorded there and not claimed for stream 24.
- The editor is named at directory level, not by module, at `docs/PARITY-INPUTS.md:42`, `docs/FEATURESET.md:85`, and `docs/JAYZEE-GAPS.md:27`, `:73` and `:92`. Disclosed.

These are static claims. The IndexedDB recovery and the file browser are not run here.

## Stream 25: editor server-side modules in src/sdk (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 19 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The five modules are spoint's editor server-side subset with zero witness scripts and zero savi mentions, and they total 510 lines.

- `src/sdk/EditOpLog.js:1` (`const MAX_OPS = 10000`): the operation log has a 10000-entry ceiling.
- `src/sdk/EditOpLog.js:4` (`export function createEditOpLog() {`): the log is a factory.
- `src/sdk/EditOpLog.js:13` (`if (_ops.length > MAX_OPS) {`): the overflow check.
- `src/sdk/EditOpLog.js:14` (`_ops = _ops.slice(-PRUNE_HEADROOM)`): on overflow only the last PRUNE_HEADROOM operations are kept, and the block that drops the older ones makes no log call.
- `src/sdk/AgentEditServer.js:7` (`export function createAgentEditServer() {`): the agent edit server is a factory; the file is 120 lines.
- `src/sdk/PlaceInstances.js:1` (`INSTANCE_SCOPES = Object.freeze(['party', 'solo'])`): the scopes are a frozen list. Spoint's wording omitted `Object.freeze`; the line has it.
- `src/sdk/PlaceInstances.js:2` (`INSTANCE_LIFETIMES = Object.freeze(['ephemeral', 'session', 'persistent'])`): the lifetimes are a frozen list.
- `src/sdk/PlaceInstances.js:4` (`export function instanceRoomId(scope, groupId) {`): the room id is derived from the scope and group.
- `src/sdk/PlaceInstances.js:10` (`export class PlaceInstances {`): the class; the module has four exports in total.
- `src/sdk/PrefabSpawner.js:1` (`export class PrefabSpawner {`): the spawner class.
- `src/sdk/PrefabSpawner.js:10` (`const startMs = Date.now()`): the timing reads the wall clock.
- `src/sdk/PrefabSpawner.js:67` (`const elapsedMs = Date.now() - startMs`): the elapsed time from the wall clock.
- `src/sdk/PrefabSpawner.js:79` (`const startMs = Date.now()`): a second timing read.
- `src/sdk/PrefabSpawner.js:108` (`const elapsedMs = Date.now() - startMs`): the second elapsed time.
- `src/sdk/PrefabSpawner.js:232` (`Math.random().toString(36).slice(2, 8)`): an app-prefixed entity id from Math.random, so the ids are not reproducible.
- `src/sdk/PrefabSpawner.js:235` (`return 'placed-' + Math.random()`): a placed id from Math.random.
- `src/sdk/PrefabSpawner.js:237` (`return 'entity-' + Math.random()`): a fallback id from Math.random.
- `src/sdk/PrefabSpawner.js:241` (`export function createPrefabSpawner(appRuntime, prefabLibrary) {`): the spawner factory.
- `src/sdk/EditorHandlersSerialize.js:49` (`export { TEXT_EXTS, isTextFile, sanitizeFsError, WORLD_CONFIG_KEYS, serializeEntity, serializeWorld, serializeWorldSource }`): the module's re-export list.

Cluster: `EditOpLog.js` 39 lines, `AgentEditServer.js` 120, `PlaceInstances.js` 60, `PrefabSpawner.js` 242 and `EditorHandlersSerialize.js` 49, which is 510 lines by `wc -l`. `src/sdk/EditorHandlers.js` (1006 lines) is excluded from the cluster. Spoint reports it has three witness scripts, which this section does not verify. The editor token check on the stream 18 surface is not claimed here.

Negatives:
- `scripts/` names none of the five modules by basename, so 0 of 5 have a witness script.
- `docs/FEATURESET.md` outside this section, `docs/JAYZEE-GAPS.md`, `docs/OPEN-ITEMS.md` and `docs/PARITY-INPUTS.md` name none of the five modules.

These are static claims. The log overflow and the id generator are not exercised here.

## Stream 25, part 2: src/sdk modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 17 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The 17 modules total 1171 lines by `wc -l`, and their code importers were re-derived with `git grep -lF` at `d5e3860` (excluding each module's own file) and match spoint's list. Savi's `docs/` and `scripts/` name none of the 17 modules.

- `src/sdk/AppManifest.js:17` (`export function validateManifest(manifest) {`): manifest validation, imported by `bin/marketplace-install.js` and `bin/marketplace-registry.js`.
- `src/sdk/ChaseCamera.js:1` (`export const CHASE_CAMERA_DEFAULTS = Object.freeze({`): the chase-camera defaults; no code importer.
- `src/sdk/DevAppModuleVersions.js:31` (`export function registerAppModuleVersioning(appsDirs) {`): the module also exports `initialize` and `resolve`; imported by `src/sdk/server.js`.
- `src/sdk/DevHmrGraph.js:8` (`export function readImportMap(htmlPath) {`): the module graph; imported by `src/sdk/DevHmr.js`.
- `src/sdk/FreddieBridge.js:16` (`export function validateMessage(msg) {`): eleven exports, including the KIND constants, PRIMITIVES, LAYOUTS and `computeLayout`; imported by `apps/_lib/dataset-viz.js`, `client/editor/FreddieChatPanel.js` and `src/sdk/ServerAPIRoutes.js`.
- `src/sdk/PublicBenchmark.js:19` (`export function collectBenchmark(ctx) {`): imported by `src/sdk/ServerAPIRoutes.js`.
- `src/sdk/ReloadHandlers.js:32` (`export function createReloadHandlers(deps) {`): imported by `src/sdk/server.js`.
- `src/sdk/ReloadManager.js:26` (`export class ReloadManager {`): imported by `src/sdk/server.js`.
- `src/sdk/RoomLog.js:11` (`export class RoomLog {`): the module also exports `RoomLogError`; no code importer.
- `src/sdk/RoomProcessWorker.js:1` (`import { RoomDirectory } from './RoomDirectory.js'`): no exports; imported by `src/sdk/RoomOrchestrator.js`.
- `src/sdk/ServerIdentity.js:16` (`export function getServerIdentity() {`): also exports `logServerIdentity`; imported by `src/sdk/ServerBoot.js` and `src/sdk/StaticHandler.js`.
- `src/sdk/ServerTimeOfDay.js:5` (`export function createServerTimeOfDay(getConfig) {`): imported by `src/sdk/TickHandler.js`.
- `src/sdk/SharedEventEnvelope.js:1` (`export function generateEventId() {`): also exports `emitEnvelope` and `validateEnvelope`; no code importer.
- `src/sdk/TextureAtlas.js:11` (`export function atlasLayout(spec) {`): also exports `AtlasSpecError`; imported by `client/core/Vegetation.js` and `packages/streaming-gltf/src/octahedral-impostor-ez.js`.
- `src/sdk/WorkerBoot.js:2` (`await import('./WorkerEntry.js')`): no exports; imported by `client/BrowserServer.js` and `scripts/browser-server-worker-error-witness.mjs`.
- `src/sdk/appEventSender.js:11` (`export function stampSender(message, { id, fromClient }) {`): also exports `senderOf`; imported by `src/apps/AppContext.js`, `src/behaviours/combat.js`, `src/sdk/Relocation.js` and `src/sdk/ServerHandlers.js`.
- `src/sdk/scatterSpec.js:1` (`export class ScatterSpecError extends Error {`): also exports `parseScatterSpec`, `hashUnit` and `sampleScatter`; no code importer.

Negatives: `git grep -lF` at `d5e3860` finds no importer for `ChaseCamera`, `RoomLog`, `SharedEventEnvelope` and `scatterSpec` outside their own files.

Not folded here, with the reason for each:
- `ServerBoot.js` and `StaticCache.js`: savi's docs name neither, and stream 18 does not name them either, so they are not covered by #18. They are folded as stream 28 below.
- `bundleFreshness.js`: held owner decision.
- `EditorHandlers.js`: already excluded, because it has witness scripts.
- `chartWire.js`: chart re-anchor wire, #19 territory, not verified here.
- `ServerWeather.js`: fire wind, #23 adjacency, not verified here.
- The two chartState migrators, `migratePlayers.js` and `migrateWorldAnchors.js`, are not folded in this section. They are folded per file in the stream 19 addendum below. An earlier sentence here said savi's docs do not name them, and that was wrong.

These are static claims. No server is started and no migration is run.

## Stream 26: src/behaviours modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 19 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. Spoint's narrowing took the 35 tracked `src/behaviours/*.js` files, removed 5 fire-named files (covered by stream 23), removed 11 with a case-sensitive basename hit in savi's docs or gaps, and kept these 19, which total 2210 lines by `wc -l` and 46 `export` lines.

- `src/behaviours/buoyancy.js:3` (`export function defineBuoyancy(spec = {}, appCtx = null) {`): imported by `src/apps/AppContext.js`; witnessed by `scripts/define-spec-coverage-witness.mjs`.
- `src/behaviours/cameraRig.js:129` (`export function defineCameraRig(spec = {}, appCtx = null) {`): imported by `src/apps/AppContext.js`; no witness script.
- `src/behaviours/checkpoint.js:3` (`export function defineCheckpoint(spec = {}, appCtx) {`): imported by `src/apps/AppBehaviours.js` and `src/apps/AppContext.js`; witnessed by `scripts/checkpoint-nested-radius-witness.mjs` and `scripts/define-spec-coverage-witness.mjs`.
- `src/behaviours/decisionPipe.js:1` (`export class DecisionPipeError extends Error {`): imported only by `src/behaviours/decisionRuntime.js`, so it has no witness of its own.
- `src/behaviours/decisionRuntime.js:9` (`export function createDecisionRuntime({ ask, random, now,`): no code importer; witnessed by `scripts/decision-runtime-witness.mjs`.
- `src/behaviours/destructibleSpec.js:3` (`export function validateDestructibleSpec(spec) {`): imported by `src/behaviours/destructible.js`; no witness script.
- `src/behaviours/fluid3d.js:25` (`export function createFluid3DBody(spec = {}, appCtx = null) {`): imported by `src/apps/AppContext.js`; no witness script.
- `src/behaviours/game-fsm.js:12` (`export class GameFSMError extends Error {`): imported by `apps/_lib/game-fsm.js`, `src/animation/AnimationController.js`, `src/apps/AppContext.js` and `src/behaviours/README.md`; no witness script.
- `src/behaviours/gamemode.js:1` (`export function defineGameMode(spec = {}, appCtx = null) {`): imported by `apps/_lib/gamemode.js` and `src/apps/AppContext.js`; no witness script.
- `src/behaviours/pickup.js:3` (`export function definePickup(spec = {}, appCtx) {`): imported by `src/apps/AppBehaviours.js` and `src/apps/AppContext.js`; witnessed by `scripts/define-spec-boundary-witness.mjs`.
- `src/behaviours/projectile.js:3` (`export function sweepProjectile(raycast, from, velocity, dt) {`): 18 lines; no code importer, and `git grep` finds no file importing it by exact path; no witness script.
- `src/behaviours/projectileGravity.js:9` (`export function stepProjectile({ position, velocity, gravity = -9.81, dt } = {}) {`): no code importer; witnessed by a behaviour witness script.
- `src/behaviours/shrinking-zone.js:51` (`export function defineShrinkingZone(spec = {}, appCtx = null) {`): imported by `apps/_lib/shrinking-zone.js` and `src/apps/AppContext.js`; no witness script.
- `src/behaviours/specBoundary.js:39` (`export function parseDefineSpec(name, spec, schema) {`): imported by `src/apps/AppContext.js`, by three `scripts/define-spec-*` witnesses and by eight behaviour files (buoyancy, checkpoint, combat, health, path, pickup, teams, weapon).
- `src/behaviours/steering.js:52` (`export function defineSteering(spec = {}, appCtx) {`): imported by `apps/_lib/steering.js`, `src/apps/AppBehaviours.js` and `src/apps/AppContext.js`; no witness script.
- `src/behaviours/teams.js:4` (`export const COLORBLIND_SAFE_PALETTE = [`): imported by `apps/_lib/teams.js`, `scripts/define-spec-boundary-witness.mjs`, `src/apps/AppBehaviours.js` and `src/apps/AppContext.js`.
- `src/behaviours/trade.js:49` (`export function settleTrade({ proposer, responder, offer, request, withdrawn = false } = {}) {`): imported only by `scripts/two-sided-trade-witness.mjs`.
- `src/behaviours/voxels.js:208` (`export function createVoxelPart(spec) {`): imported only by `scripts/voxels-witness.mjs`.
- `src/behaviours/weapon.js:6` (`export function defineWeapon(spec = {}, appCtx) {`): imported by `apps/_lib/weapon.js`, `scripts/define-spec-boundary-witness.mjs` and `src/apps/AppContext.js`.

Negatives: `git grep` for the exact `behaviours/projectile.js` path at `d5e3860` finds no importer, and the file is 18 lines. Savi's `docs/` and the `.js`/`.mjs` files in `scripts/` name none of the 19 modules by basename. The only word hits are incidental: `trade` and `voxels` in the description fields of `scripts/openapi.json`, which is not a module reference.

Directory-level disclosure: `JAYZEE-GAPS.md` row 53 names buoyancy, fluid, destructible core and health as family-level jayzee status. It does not name these files.

These are static claims. No behaviour is run here.

## Stream 27: src/apps modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 19 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. Spoint's narrowing took the 23 tracked `src/apps/*.js` files and removed 4 with a case-sensitive savi basename hit (AppContext, AppRuntime, Progression, Ragdoll), which leaves these 19. They total 2545 lines by `wc -l` and 54 `export` lines. Importers were re-derived with exact-path `git grep -lE` at `d5e3860` and match spoint's list.

- `src/apps/AccountState.js:6` (`export class AccountStateError extends Error {`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/AppBehaviours.js:9` (`export const BEHAVIOUR_FACTORIES = Object.freeze({`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/AppGameplay.js:21` (`export const MAX_FOOTPRINT_INTRUSION_M = 0.15`): imported by `client/app.js`, `client/editor/sdk-typings.generated.d.ts`, `src/apps/AccountState.js` and `src/apps/AppContext.js`; no witness script.
- `src/apps/AppLoader.js:29` (`export class AppLoader {`): imported by `src/sdk/WorkerEntry.js` and `src/sdk/server.js`; witnessed by `scripts/app-loader-refusal-witness.mjs`.
- `src/apps/AppPhysics.js:13` (`export function parseInteractable(config = {}) {`): imported by `src/apps/AppContext.js`, `src/apps/AppRuntime.js` and `src/apps/AppRuntimePhysics.js`; no witness script.
- `src/apps/AppRuntimePhysics.js:5` (`export function mixinPhysics(runtime) {`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/AppRuntimeState.js:33` (`export { containedAssetPath, tagAppState, untagAppState,`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/AppRuntimeStaticMotion.js:4` (`export function captureTransform(xf, e) {`): imported by `src/apps/AppRuntime.js`, `src/apps/AppRuntimeTick.js` and `src/static/BakeCodeVersion.js`. The last is an importer only; stream 22 does not name this module.
- `src/apps/AppRuntimeTick.js:11` (`export function mixinTick(runtime) {`): imported by `src/apps/AppRuntime.js` and `src/static/BakeCodeVersion.js` (importer only); no witness script.
- `src/apps/AppSeats.js:1` (`export class SeatError extends Error {`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/ComponentPool.js:10` (`export function createComponentPool(spec) {`): imported by `apps/_lib/ComponentPool.js`, `src/behaviours/health.js`, `src/behaviours/steering.js` and `src/sdk/scaffold.js`; no witness script.
- `src/apps/CustomVersion.js:1` (`export function installCustomVersion(entity) {`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/EcsEntityMap.js:7` (`export function createEcsEntityMap() {`): imported by `src/apps/AppRuntime.js` and `src/static/BakeCodeVersion.js` (importer only); no witness script.
- `src/apps/EventBus.js:1` (`export class EventBus {`): imported by `src/apps/AppRuntime.js`, `src/sdk/WorkerEntry.js` and `src/sdk/server.js`; no witness script.
- `src/apps/HotReloadQueue.js:3` (`export class HotReloadQueue {`): imported by `src/apps/AppRuntime.js`; no witness script.
- `src/apps/SurfaceSelector.js:3` (`export function parseSurfaceSelector(spec) {`): imported by `client/core/MobileControls.js`; no witness script.
- `src/apps/SurfaceSelectorRuntime.js:7` (`export function createSurfaceSelectorRuntime({ labels = {}, maxSwapsPerSecond = 4, now,`): imported by `scripts/touch-selector-channels-witness.mjs`, which is its witness.
- `src/apps/appImports.js:1` (`export const ENGINE_ALIASES = Object.freeze({`): imported by `client/BrowserServer.js`, `src/apps/AppLoader.js`, `src/apps/appsManifest.js`, `scripts/check-app-imports.mjs` and `scripts/static-export.mjs`; witnessed by `check-app-imports.mjs` and `static-export.mjs`.
- `src/apps/appsManifest.js:10` (`export function resolveAppEntry(name, dirs) {`): imported by `src/sdk/ServerBoot.js` (an importer only; ServerBoot is not covered by stream 18 and is not claimed here), `scripts/bundle-apps-manifest.mjs` and `scripts/static-export.mjs`; witnessed by `bundle-apps-manifest.mjs` and `static-export.mjs`.

Negatives: `git grep -lE "/<name>\.js['\"]"` over `scripts/*.mjs` and `scripts/*.js` at `d5e3860` finds no file for the 15 modules with no witness script (AccountState, AppBehaviours, AppGameplay, AppPhysics, AppRuntimePhysics, AppRuntimeState, AppRuntimeStaticMotion, AppRuntimeTick, AppSeats, ComponentPool, CustomVersion, EcsEntityMap, EventBus, HotReloadQueue, SurfaceSelector). Savi's `docs/` and `scripts/` name none of the 19 modules, except `AppBehaviours`, which appears only as an importer in four of the stream 26 citations. That is disclosed here and not claimed for stream 26. Conversely, `steering` appears in this section only as the importer `src/behaviours/steering.js` of `ComponentPool`, a disclosed mention for stream 26.

Directory-level disclosure: `JAYZEE-GAPS.md:65` (row 32, apps runtime) is jayzee's family-level status. `docs/FEATURESET.md:116` names only `AppRuntime.js` line 430. The consumers of `src/apps/AppContext.js` named at `docs/FEATURESET.md` lines 173 to 181 are excluded from this stream.

These are static claims. No app is loaded or run here.

## Stream 28: ServerBoot and StaticCache, not covered by #18 (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 18 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The two modules total 684 lines (`src/sdk/ServerBoot.js` 308, `src/sdk/StaticCache.js` 376) and carry 33 `export` lines (15 and 18). Stream 18 does not cover them, so they are folded here and not claimed for #18.

- `src/sdk/ServerBoot.js:16` (`export function buildUniquePathList(paths) {`): the first of 15 exports, which also include `collectWatchableFiles`, `CLIENT_ROOT_BUNDLE`, `CLIENT_ROOT_RAW`, `clientBundleFreshness`, `workerBundleFreshness`, `clientRootState`, `staticClientRoot`, `buildStaticDirs`, `assertNodeModulesLinked`, `resolveAppsDirs`, `worldScopedManifestFile`, `ensureServedAppsManifest`, `boot` and `installGracefulShutdown`.
- `src/sdk/ServerBoot.js:23` (`export function collectWatchableFiles(dir, out = []) {`): the watchable file walk.
- `src/sdk/ServerBoot.js:39` (`export const CLIENT_ROOT_BUNDLE = 'bundle'`): the bundled client root name.
- `src/sdk/ServerBoot.js:42` (`export function clientBundleFreshness(sdkRoot) {`): the bundle freshness check.
- `src/sdk/ServerBoot.js:56` (`export function staticClientRoot(sdkRoot) {`): the static client root.
- `src/sdk/ServerBoot.js:75` (`export function buildStaticDirs(sdkRoot, project, appsDirs) {`): the static directory list.
- `src/sdk/ServerBoot.js:107` (`export function assertNodeModulesLinked(sdkRoot) {`): the node_modules link check.
- `src/sdk/ServerBoot.js:130` (`export async function ensureServedAppsManifest(sdkRoot, appsDirs, {`): the served apps manifest.
- `src/sdk/ServerBoot.js:166` (`export async function boot(overrides = {}) {`): the boot entry point.
- `src/sdk/ServerBoot.js:291` (`export function installGracefulShutdown(server, presence = null) {`): the shutdown hook.
- `src/sdk/StaticCache.js:16` (`export function compress(raw, encoding) {`): the first of 18 exports, which also include `compressAsync`, `GZIP_EXTENSIONS`, `MAX_CACHEABLE_BYTES`, `ByteBudgetLRU`, `fileCache`, `transformedCache`, `contentHashETag`, `isNodeModulesPath`, `STATIC_CACHE_DIR`, `CACHE_REFUSAL`, `readCacheEntry`, `pruneStaticCache`, `getCached`, `getTransformedCached`, `prewarmCompression`, `parseRange` and `serveRangeable`.
- `src/sdk/StaticCache.js:25` (`export const GZIP_EXTENSIONS = new Set(`): the gzip extension set.
- `src/sdk/StaticCache.js:27` (`export const MAX_CACHEABLE_BYTES = 20 * 1024 * 1024`): the 20 MiB cacheable ceiling.
- `src/sdk/StaticCache.js:31` (`export class ByteBudgetLRU {`): the byte-budget LRU.
- `src/sdk/StaticCache.js:82` (`export function contentHashETag(fp, raw, mtime) {`): the content-hash ETag.
- `src/sdk/StaticCache.js:155` (`export function readCacheEntry(fp, encoding, stamp) {`): the cache read.
- `src/sdk/StaticCache.js:340` (`export function parseRange(rangeHeader, totalSize) {`): the range parser.
- `src/sdk/StaticCache.js:361` (`export function serveRangeable(req, res, buf, headers) {`): the ranged serve.

Importers, from exact-path `git grep -lE` over `src`, `client`, `apps`, `packages`, `scripts`, `bin` and `edge` at `d5e3860`: `ServerBoot.js` is imported by `bin/router-boot.js`, `src/sdk/server.js`, `src/sharding/RegionRouter.js` and `src/sharding/RegionWorkerEntry.js`. `StaticCache.js` is imported only by `src/sdk/StaticHandler.js`. The two sharding files sit in the area that #13 and #14 cover; `ServerBoot.js` is not named there, and the sharding files are cited only as importers.

Witnesses: `git grep -lE "StaticCache|ServerBoot" -- scripts` at `d5e3860` finds no file, so neither module has a witness script. Savi's `docs/JAYZEE-GAPS.md`, `docs/OPEN-ITEMS.md`, `docs/PARITY-INPUTS.md` and `scripts/` name neither module. `docs/FEATURESET.md` names both only as importers and as the not-covered statement in the stream 25 part 2 and stream 27 sections.

These are static claims. No server is booted and no cache is exercised here.

## chartState per-file migrators (stream 19 addendum, spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 4 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The two migrators are folded per file here, so they are no longer covered at directory level only.

- `src/sdk/chartState/migratePlayers.js:25` (`export function createPlayerMigrator({ playerManager, networkState, lagCompensator, physicsIntegration }) {`): the player migrator factory. The file is 51 lines with one export.
- `src/sdk/chartState/migrateWorldAnchors.js:5` (`export function createWorldAnchorMigrator({ ctx, stageLoader }) {`): the world-anchor migrator factory. The file is 27 lines with one export.
- `src/sdk/chartState/index.js:3` (`import { createPlayerMigrator } from './migratePlayers.js'`): the only importer of `migratePlayers.js`.
- `src/sdk/chartState/index.js:5` (`import { createWorldAnchorMigrator } from './migrateWorldAnchors.js'`): the only importer of `migrateWorldAnchors.js`.

Witnesses: `git grep -l` for either basename under `scripts/` at `d5e3860` finds no file, so neither migrator has a witness script. Neither is imported outside `chartState/index.js`.

These are static claims. No migration is run here.

## Stream 29: client HUD modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 17 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. Spoint's narrowing took the 18 tracked `client/hud/*.js` files and removed `PeerHostUI.js`, which is covered at `docs/FEATURESET.md` line 561. The 17 remaining files total 2254 lines by `wc -l` and carry 31 `export` lines.

- `client/hud/Chat.js:21` (`export function createChatHUD(uiRoot, getBridge) {`): the chat HUD factory. Its importer is `client/app.js`.
- `client/hud/ChatQuickWheel.js:3` (`export const DEFAULT_QUICK_MESSAGES`): the default quick messages, with a second export; imported by `client/app.js`.
- `client/hud/EmoteWheel.js:31` (`export function createEmoteWheel(slots) {`): the emote wheel; imported by `client/app.js` and `client/hud/ChatQuickWheel.js`.
- `client/hud/HudStats.js:3` (`export function publishHudStat(key, value) {`): the HUD stat publisher, with three exports; imported by `client/app.js` and `client/xr/XRSystem.js`.
- `client/hud/MeshDebugPanel.js:17` (`export function createMeshDebugPanel(uiRoot) {`): the mesh debug panel; imported by `client/app.js` and `client/core/RenderControls.js`.
- `client/hud/MinimapGlyphs.js:20` (`export function paintChunkGlyphs(ctx, packed, originX, originZ, pxPerMeter, dpr, relief) {`): the chunk glyph painter; imported by `client/hud/MinimapHUD.js`.
- `client/hud/MinimapHUD.js:28` (`export function minimapGridOrigin(centreM, spanM, cells) {`): the minimap grid origin, with five exports; imported by `client/app.js`.
- `client/hud/MinimapModels.js:36` (`export function createModelFootprints() {`): the model footprints; imported by `client/hud/MinimapHUD.js`.
- `client/hud/MinimapPlacements.js:6` (`export const GLYPH_STRIDE = 4`): the glyph stride, with four exports; imported by `client/hud/MinimapGlyphs.js` and `client/hud/MinimapHUD.js`.
- `client/hud/MobileControlsUI.js:107` (`export function createMobileControlsUI(controls, buttons = DEFAULT_MOBILE_BUTTONS) {`): the mobile controls UI; imported by `client/app.js`.
- `client/hud/PauseMenu.js:48` (`export function createPauseMenu({ requestPointerLock = null,`): the pause menu; imported by `client/app.js`.
- `client/hud/RenderDebugPanel.js:3` (`export function leafPhrase(leafOffM) {`): the render debug panel, with four exports; imported by `client/app.js` and `client/core/RenderControls.js`.
- `client/hud/SettingsMenu.js:80` (`export function createSettingsMenu({ getCam = () => null,`): the settings menu; imported by `client/app.js`.
- `client/hud/VoiceIndicator.js:43` (`export function createVoiceIndicator(uiRoot, getBridge,`): the voice indicator; imported by `client/app.js`.
- `client/hud/createLoadingScreen.js:3` (`export function createLoadingScreen(loadingManager) {`): the loading screen; imported by `client/app.js`.
- `client/hud/createLobby.js:21` (`export function createLobby({ world = null, onClose: onCloseCb = null } = {}) {`): the lobby; imported by `client/app.js`.
- `client/hud/ensureStyle.js:1` (`export function ensureStyle(id, css) {`): the style helper, imported by ten `client/hud` files, including `PeerHostUI.js`.

Witnesses: `git grep -lwF` over `scripts/` at `d5e3860` finds no file for any of the 17 names.

Savi: the case-sensitive word `Chat` has no hit in `docs/` or `gaps` (the `docs/OPEN-ITEMS.md` line 167 phrase "chat contract" is lowercase and generic). `docs/PARITY-INPUTS.md:42`, `docs/FEATURESET.md:85`, `docs/JAYZEE-GAPS.md:73` and `docs/JAYZEE-GAPS.md:92` are directory-level client lists and name none of the 17 modules.

These are static claims. No HUD is rendered here.

## Stream 30: src/procgen modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 14 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The four modules are the whole `src/procgen` directory, and they total 563 lines by `wc -l` and 13 `export` lines.

- `src/procgen/LSystem.js:13` (`export function expandLSystem({ axiom, rules = {}, iterations = 1, seed = 1337 }) {`): L-system expansion, with four exports in the module; imported by `client/editor/ProcgenPanel.js`.
- `src/procgen/LSystem.js:80` (`export function interpretTurtle(symbolString, {`): the turtle interpreter.
- `src/procgen/LSystem.js:143` (`export function generateLSystemTree({ axiom, rules = {}, iterations = 1, seed = 1337, ...turtleOpts }) {`): the tree generator.
- `src/procgen/LSystem.js:149` (`export let PRESETS = {`): the preset table.
- `src/procgen/NoiseTerrain.js:35` (`export function createNoise2D(seed = 1337) {`): the 2D noise factory, with four exports in the module; imported by `client/editor/ProcgenPanel.js` and `src/procgen/TextureScript.js`.
- `src/procgen/NoiseTerrain.js:59` (`export function createFbm2D(seed = 1337, opts = {}) {`): the fractal noise factory.
- `src/procgen/NoiseTerrain.js:76` (`export function generateHeightfield(opts = {}) {`): the heightfield generator.
- `src/procgen/NoiseTerrain.js:143` (`export function createHeightSampler(opts = {}) {`): the heightfield sampler.
- `src/procgen/TextureScript.js:1` (`import { createFbm2D } from './NoiseTerrain.js'`): the texture module's only internal import; no importer outside the directory.
- `src/procgen/TextureScript.js:16` (`export function paintTexture({ width, height, seed = 1337, paint } = {}) {`): the texture painter, with one export.
- `src/procgen/WFC.js:13` (`export const DIRS = Object.freeze({`): the wave-function-collapse directions, with four exports in the module.
- `src/procgen/WFC.js:40` (`export function rulesFromSockets(tiles) {`): the socket rules.
- `src/procgen/WFC.js:64` (`export function runWFC({ width, height, tiles, rules, sockets, seed = 1337, maxSteps }) {`): the collapse run.
- `src/procgen/WFC.js:166` (`export function runWFCWithRetries(options, attempts = 20) {`): the retrying collapse; imported by `client/editor/ProcgenPanel.js`, which is the only consumer outside the directory for LSystem, NoiseTerrain and WFC.

Witnesses: `git grep -lwF` over `scripts/` at `d5e3860` finds no file for `LSystem`, `NoiseTerrain`, `TextureScript`, `WFC` or `procgen`, and a case-insensitive whole-word search for `procgen` finds none either.

Savi: none of `LSystem`, `NoiseTerrain`, `TextureScript`, `WFC` or `procgen` appears in `docs/` or `scripts/`, and the directory string `src/procgen` has zero hits. `ProcgenPanel` appears in savi's docs only in this section and in the stream 24 disclosure, and has no hit in scripts. Its importer role here is disclosed. This section does not claim that stream 24 covers `client/editor/ProcgenPanel.js`.

These are static claims. No procedural generation is run here.

## Stream 31: src/effects modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 7 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The directory has two modules, which total 275 lines by `wc -l` and carry four `export` lines.

- `src/effects/DamageEffects.js:1` (`export function createDamageEffects(scene, camera, audioListener, config = {}) {`): the damage-effects factory, the module's only export. It is consumed at runtime, not by an import in the apps tree.
- `client/app.js:17` (`import * as DamageEffects from '/src/effects/DamageEffects.js'`): the client's import of the module.
- `client/app.js:1942` (`window.__damageEffects = DamageEffects`): the client publishes the module as a window global.
- `apps/hit-feedback/index.js:72` (`window.__damageEffects?.createDamageEffects?.(engine.scene, engine.camera, null)`): the hit-feedback app reads the global at runtime through an optional chain.
- `src/effects/fxProgram.js:13` (`export class FxProgramError extends Error {`): the program error class, one of three exports.
- `src/effects/fxProgram.js:79` (`export function parseFxProgram(source) {`): the program parser.
- `src/effects/fxProgram.js:107` (`export function createFxSimulation(program) {`): the simulation factory. The module has no importer: `git grep` for `fxProgram` at `d5e3860`, excluding its own file, finds no file.

Witnesses: `git grep -lwF` over `scripts/` at `d5e3860` finds no file for `DamageEffects` or `fxProgram`.

Savi: `DamageEffects`, `fxProgram`, the directory string `src/effects`, the phrases `damage effect` and `fx program`, and the case-insensitive basename matches all have zero hits in `docs/`, `gaps` and `scripts/`.

These are static claims. No effect is played and no program is parsed here.

## Stream 32: src/physics modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The 10 citations were re-read from `git -C /workspace/spoint show d5e3860:<path>` before this section was written, and nothing was written into spoint. The six modules total 508 lines and carry 20 `export` lines, counted by the gate from `git show`.

- `src/physics/DracoDecompressor.js:3` (`export async function getDracoDecoder() {`): the Draco decoder loader, imported only by `src/physics/GLBLoader.js`. No witness script.
- `src/physics/DracoDecompressor.js:16` (`export async function decompressDracoMesh(buf, json, prim, binOffset, meshName) {`): the Draco mesh decode.
- `src/physics/GLBLoader.js:5` (`export let SKIP_MATS = new Set(`): the material names skipped by the loader. The module has six exports and is imported by two `src/apps` modules, two other `src/physics` modules, one `src/sdk` module and the bake script `scripts/bake-navmesh.mjs`. Its only script importer is the bake script, which is a bake and not a witness, so this is disclosed here and no witness is claimed.
- `src/physics/GLBLoader.js:48` (`export function extractStandardMesh(buf, json, prim, binOffset, meshName) {`): the standard mesh extraction.
- `src/physics/GLBMath.js:1` (`export function mat4Identity() {`): the 4x4 identity; imported by `scripts/bake-navmesh.mjs` (a bake script, not a witness) and `src/physics/GLBLoader.js`. Disclosed, with no witness claimed.
- `src/physics/GLBMath.js:5` (`export function mat4TRS(t, r, s) {`): the translation-rotation-scale matrix, one of five exports.
- `src/physics/MeshoptDecompressor.js:3` (`export async function getMeshoptDecoder() {`): the meshopt decoder loader, imported only by `src/physics/GLBLoader.js`. No witness script.
- `src/physics/MeshoptDecompressor.js:16` (`export async function extractMeshWithMeshopt(buf, json, prim, binOffset, meshName) {`): the meshopt mesh extraction.
- `src/physics/pivotTransform.js:10` (`export function pivotTransform({ position, pivot = [0, 0, 0], quaternion = [0, 0, 0, 1], scale = [1, 1, 1] } = {}) {`): the pivot transform, with three exports. Its only importer is `scripts/pivot-riders-witness.mjs`, which is its witness.
- `src/physics/surfaceVelocity.js:4` (`export function beltVelocity({ surfaceVelocity = [0, 0, 0],`): the belt velocity, with two exports. Its only importer is `scripts/surface-velocity-witness.mjs`, which is its witness.

Witnesses: `git grep -lwF` over `scripts/` at `d5e3860` finds no witness for `DracoDecompressor` or `MeshoptDecompressor`. `pivotTransform` and `surfaceVelocity` are witnessed by their own scripts. `GLBLoader` and `GLBMath` are imported only by the bake script, and that is not a witness.

Savi: none of the six basenames is named in savi's docs or scripts outside this section, and the gate checks this.

These are static claims. No mesh is decoded here.

## Stream 33: src/shared modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. Fourteen `src/shared` modules total 1074 lines by `wc -l`. Savi's docs and scripts were scanned case-insensitively for the 14 basenames, outside this section, and the gate repeats the scan. Zero module-level mentions were found, except `SpawnSurface`, whose only hit is the identifier `spawnSurfaceGround` in `docs/JAYZEE-GAPS.md`, a different name in `src/sdk/Relocation.js`. The 45 `src/shared` files give this set of 14 once the fire modules, the chart modules and `cacheCodeVersions` are set aside. Those are covered elsewhere or are not in this stream.

- `src/shared/MinimapBiome.js:9` (`export function biomeColor(height, temp, humidity, seaLevel) {`): 83 lines, 4 exports. Imported by one client HUD module (cited under stream 29 as an importer only), `scripts/bake-minimap.mjs` and `scripts/circumnavigate.mjs`. Both scripts are witnesses.
- `src/shared/SpawnSurface.js:21` (`export function columnSurfaces(raycast, x, topY, z) {`): 79 lines, 2 exports. Imported by two `src/apps` modules and `src/sdk/Relocation.js`. No tracked witness script at `d5e3860`.
- `src/shared/ballistics.js:21` (`export function elevation(speed, g, distance, rise) {`): 68 lines, 2 exports. Imported by `scripts/ballistics-lead-witness.mjs`, which is its witness. `scripts/check.mjs` also names it.
- `src/shared/bookmarks.js:33` (`export function listBookmarks(worldDef, frame, fromBase = null) {`): 56 lines, 1 export. Imported by `client/core/Relocation.js`. No tracked witness script at `d5e3860`.
- `src/shared/canonicalJSON.js:8` (`export function canonicalJSON(value) {`): 15 lines, 1 export. Imported by `src/netcode/LockstepGameLoop.js`, `src/netcode/RollbackGameLoop.js`, `src/sdk/WorldPersistence.js` and `src/shared/terrainConfig.js`. No tracked witness script at `d5e3860`.
- `src/shared/clusterAssignment.js:4` (`export let CLUSTER_STAY_FACTOR = 1.25`): 220 lines, 8 exports. Imported by `src/sharding/ClusterManager.js` (the stream 14 sharding module, cited as an importer only) and `src/shared/clusterConfig.js`. No tracked witness script at `d5e3860`.
- `src/shared/colliderLattice.js:2` (`export const COLLIDER_DEFAULT_EXTENT_M = 510`): 84 lines, 5 exports. Imported by `client/core/TerrainBackdrop.js` through a dynamic import. Witnessed by `scripts/grass-seam-card-witness.mjs` and `scripts/nearfield-lod-lattice-witness.mjs`.
- `src/shared/equipment.js:1` (`export let EQUIP_UNARMED = 0`): 46 lines, 12 exports. Imported by `client/app.js` and `src/apps/AppRuntime.js`. Witnessed by `scripts/world-movement-parse-witness.mjs`.
- `src/shared/materialSlots.js:33` (`export function parseMaterialSlots(raw) {`): 46 lines, 1 export. Imported by `src/sdk/EditorHandlers.js`. No tracked witness script at `d5e3860`.
- `src/shared/modelLoadErrors.js:3` (`export function modelLoadRefusal(url, cause) {`): 76 lines, 9 exports. Imported by `client/core/SceneSetup.js`, `client/core/modelLoadGate.js`, `src/sdk/EditorHandlers.js` and `src/sdk/ServerAPI.js`. Witnessed by five scripts: `entity-loader-refusal-witness.mjs`, `failed-entity-no-env-done-witness.mjs`, `placed-model-load-witness.mjs`, `prefab-load-witness.mjs` and `three-loader-error-witness.mjs`.
- `src/shared/relevanceRadius.js:1` (`export let DEFAULT_RELEVANCE_RADIUS_M = 200`): 11 lines, 2 exports. Imported by `src/sdk/ServerHandlers.js`, `src/sdk/TickHandler.js`, `src/sdk/WorkerEntry.js`, `src/sdk/server.js`, `src/spatial/Octree.js` and `src/stage/Stage.js`. Witnessed by `scripts/cluster-world-harness.mjs`, `scripts/lib/verify-doc-claims.mjs` and `scripts/netcode-conditioner-harness.mjs`.
- `src/shared/vec3.js:7` (`export function readVec3(value, name = 'value') {`): 74 lines, 14 exports. Imported by one `src/behaviours` module, `src/interaction/pressRouter.js`, `src/physics/pivotTransform.js` and `src/physics/surfaceVelocity.js`. Witnessed by `scripts/vec3-witness.mjs`, `scripts/pivot-riders-witness.mjs`, `scripts/surface-velocity-witness.mjs` and a behaviour witness script. `scripts/check.mjs` also names it.
- `src/shared/worldPresets.js:7` (`export let WORLD_PRESETS = Object.freeze({ tps, arena, planet, platformer, rts })`): 56 lines, 2 exports. Imported by 12 modules: `client/app.js`, `src/sdk/MinimapBake.js`, a reload handler in `src/sdk`, `src/sdk/ServerAPI.js`, `src/sdk/WorkerEntry.js`, `src/sdk/WorldLocator.js`, `scripts/bake-heightfield.mjs`, `scripts/bake-minimap.mjs`, `scripts/bake-navmesh.mjs`, `scripts/bundle-apps-manifest.mjs`, `scripts/check-app-imports.mjs` and `scripts/circumnavigate.mjs`. Seven scripts name it, and the bake and check scripts are the witnesses.
- `src/shared/worldResolve.js:14` (`export let WORLD_NOT_A_PLAIN_OBJECT = 'world-not-a-plain-object'`): 160 lines, 6 exports. Imported by `client/app.js`, a reload handler in `src/sdk`, `src/sdk/ServerAPI.js` and `src/sdk/WorkerEntry.js`. Witnessed by `scripts/world-movement-parse-witness.mjs` and `scripts/lib/verify-doc-claims.mjs`.

No tracked witness script at `d5e3860`: `SpawnSurface`, `bookmarks`, `canonicalJSON`, `clusterAssignment` and `materialSlots`. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for these five.

## Stream 34: top-level bin boot and tooling scripts (spoint, read-only at `d5e3860`)

The eight top-level `bin/*.js` files total 1313 lines by `wc -l`: `create-app.js` 97, `create-project.js` 152, `marketplace-install.js` 121, `marketplace-registry.js` 248, `room-orchestrator-boot.js` 173, `room-worker-boot.js` 146, `router-boot.js` 59 and `templates.js` 317. `bin/project-template` and `bin/project-templates` are excluded: they are template app files, and their basename hits are generic `index` matches.

- `create-app.js` is named by `package.json`, by `server.js` through a dynamic import, and by `src/sdk/AgentAuthoringAPI.js`. Savi's docs and scripts have no hit for it.
- `create-project.js` is named by `package.json`. Savi's docs and scripts have no hit for it.
- `room-orchestrator-boot.js` is named by `package.json`. Savi names `RoomOrchestrator` only in surface lists, not this boot script. Savi's docs and scripts have no hit for the basename.
- `room-worker-boot.js` is named by no tracked source file. Savi's docs and scripts have no hit for it.
- `marketplace-install.js` and `marketplace-registry.js` are named by no tracked source file. Savi has one hit each, at `docs/FEATURESET.md` in the stream 25 part 2 section. That line says an app-manifest module is imported by these files, so it is an importer mention and not coverage of the boot script.
- `router-boot.js` is named by `package.json`. Savi has one hit, in the stream 28 section, which says `ServerBoot.js` is imported by it. That is an importer mention, not coverage.
- `templates.js` is imported by `bin/create-app.js` and `src/sdk/AgentAuthoringAPI.js`. Savi's only hit is an incidental word in `scripts/openapi.json`, which the gate excludes.

Overlap with the sharding and region streams: streams 13 and 14 name `RegionWorkerEntry` and `RegionRouter`, not these boot scripts, so this stream adds no claim to them.

Witnesses: `git grep -lF` over `scripts/` at `d5e3860` returns no file for any of the eight. Negatives: `room-worker-boot` has no tracked reference at all, and `marketplace-install` and `marketplace-registry` have none in tracked source. Each of these is a grep witness, not a run.

## Stream 35: client/core grass family with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The four modules total 832 lines by `wc -l`, and their export lines total 44 by `^export`. Savi's docs and scripts have zero case-insensitive word hits for the four basenames outside this section. The savi lines that mention grass name family-level rows or other files: `docs/JAYZEE-GAPS.md` row 39 at family level, `src/terrain/GrassPlacementLod.js` in the terrain area (rows 52 and the stream 20 terrain text), and `client/core/CaveMeshes` and `GrassPlacementLod` in the client lists. None names these four files.

- `client/core/GrassClump.js:38` (`export function makeClumpAlphaTexture() {`): 100 lines, 2 exports. Imported by `client/core/Grass.js` and `client/core/GrassMaterial.js`. No tracked witness script at `d5e3860`.
- `client/core/GrassMaterial.js:14` (`export const MAX_BENDERS = 8`): 323 lines, 15 exports. Imported by `client/core/Grass.js` and `client/core/GrassTSL.js`. No tracked witness script at `d5e3860`.
- `client/core/GrassTSL.js:17` (`export { MAX_BENDERS, MAX_DECALS, UNUSED_BENDER_SLOT_XZ, makeWind }`): 226 lines, 3 exports. Imported by `client/core/Grass.js`. No tracked witness script at `d5e3860`.
- `client/core/GrassWindField.js:3` (`export const GRASS_WIND_FIELD_CELLS = 64`): 183 lines, 24 exports. Imported by `client/core/GrassMaterial.js`. Witnessed by `scripts/grass-wind-field-seam-witness.mjs`, the only witnessed module in this family.

No tracked witness script at `d5e3860`: `GrassClump`, `GrassMaterial` and `GrassTSL`. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for each of the three.

## Stream 36: client/core environment tint and weather modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The eight modules total 682 lines by `wc -l`. Savi's docs and scripts have zero case-insensitive word hits for the eight basenames, and for the words `wetness`, `underwater` and `weather material`. The word `tint` appears only inside other words. `client/core` family rows in `docs/JAYZEE-GAPS.md` and `docs/PARITY-INPUTS.md` name the directory, not these files.

- `client/core/WeatherGpu.js:3` (`export function makeSeedAttributes(capacity, fillSeed) {`): 44 lines, 5 exports. Imported by `client/core/Weather.js`. No tracked witness script at `d5e3860`.
- `client/core/WeatherMaterials.js:3` (`export function makeStreakGeo() {`): 206 lines, 8 exports. Imported by `client/core/Weather.js`. No tracked witness script at `d5e3860`.
- `client/core/WeatherMaterialsTSL.js:11` (`export function makeRainMaterialTSL() {`): 99 lines, 4 exports. Imported by `client/core/Weather.js`. No tracked witness script at `d5e3860`.
- `client/core/WetnessTint.js:6` (`export function installWetnessTint() {`): 63 lines, 3 exports. Imported by `client/app.js`, `client/core/SSR.js` and `client/core/SSRWebGPU.js`. No tracked witness script at `d5e3860`.
- `client/core/WetnessTintTSL.js:6` (`export const wetnessUniform = uniform(0)`): 39 lines, 4 exports. Imported by `client/ModelPoolAdapter.js`. No tracked witness script at `d5e3860`.
- `client/core/UnderwaterTint.js:11` (`export const SEA_SURFACE_GLSL = [`): 99 lines, 4 exports. Imported by `client/core/SSR.js` and `client/core/SceneSetup.js`. No tracked witness script at `d5e3860`.
- `client/core/UnderwaterTintTSL.js:10` (`export const seaUniform = uniform(new THREE.Vector4(-100000, 0, 0, 0))`): 62 lines, 5 exports. Imported by `client/ModelPoolAdapter.js`. No tracked witness script at `d5e3860`.
- `client/core/PostFxLook.js:1` (`export class PostFxLookError extends Error {`): 70 lines, 5 exports. No importer in code. Witnessed by `scripts/postfx-graph-structure-witness.mjs`, `scripts/postfx-look-witness.mjs` and `scripts/postfx-render-graph-witness.mjs`, the only witnessed module in this stream.

No tracked witness script at `d5e3860`: the seven other modules. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for each of them.

## Stream 37: client/core culling, occlusion and terrain occlusion modules (spoint, read-only at `d5e3860`)

This stream covers four modules and two held files. The two held files, `OcclusionPolicy` and `OcclusionQueryBudget`, are named per file here, so that their coverage does not rest on the family-level prose in `docs/JAYZEE-GAPS.md` row 39. Each citation is a `git show d5e3860` re-read.

- `client/core/CullingHub.js:1` (`export function createCullingHub() {`): 25 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/TerrainOcclusion.js:6` (`export function createTerrainOcclusion(gl, opts = {}) {`): 228 lines, 1 export. Imported by `client/core/TerrainBackdrop.js`. No tracked witness script at `d5e3860`.
- `client/core/WebGPUCullingHubIntegration.js:34` (`export async function runVegetationScalePerfAB({ counts = [12000, 30000],`): 193 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/WebGPUCullingProbe.js:1` (`export async function probeWebGPU() {`): 176 lines, 3 exports. Imported by `client/core/SceneSetup.js` and `client/core/WebGPUCullingHubIntegration.js`. No tracked witness script at `d5e3860`.
- `client/core/OcclusionPolicy.js:1` (`export function createOcclusionPolicy(config = {}) {`): 110 lines, 1 export. Imported by `client/core/SceneOcclusion.js` and `client/core/TerrainOcclusion.js`. No tracked witness script at `d5e3860`. Held before this stream, now accepted as coverage by this per-file entry.
- `client/core/OcclusionQueryBudget.js:1` (`export function createOcclusionQueryBudget(opts = {}) {`): 79 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`. Held before this stream, now accepted as coverage by this per-file entry.

The four modules total 622 lines and the two held files total 189, for 811 lines in the stream. `SceneOcclusion.js` is covered by its own citation at `docs/FEATURESET.md` (see the occlusion lines above) and is not part of this stream. None of the six has a witness script.

## Stream 38: client/core bloom and FSR1 modules with no savi mention (spoint, read-only at `d5e3860`)

The four modules total 790 lines by `wc -l`. Savi's docs and scripts have zero case-insensitive word hits for `Bloom`, `BloomWebGPU`, `FSR1` and `FSR1WebGPU`, and the words `bloom`, `FSR` and `fsr1` have zero hits. The `upscal` substring appears only in `scripts/openapi.json`, which is unrelated.

- `client/core/Bloom.js:55` (`export class Bloom {`): 247 lines, 4 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/BloomWebGPU.js:38` (`export class BloomWebGPU {`): 155 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/FSR1.js:65` (`export class FSR1 {`): 241 lines, 4 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/FSR1WebGPU.js:52` (`export class FSR1WebGPU {`): 147 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: all four.

## Stream 39: client/core screen-space ambient occlusion and reflection modules with no savi mention (spoint, read-only at `d5e3860`)

The four modules total 1175 lines by `wc -l`. Savi's docs and scripts have zero word hits for `SSAO`, `SSAOWebGPU`, `SSR` and `SSRWebGPU`, checked word-bounded and case-insensitively. Substring hits of `ssr` inside other words are not module mentions. The words `ssao`, `ambient occlusion`, `screen-space` and `reflection` have zero hits.

- `client/core/SSAO.js:113` (`export class SSAO {`): 289 lines, 4 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/SSAOWebGPU.js:81` (`export class SSAOWebGPU {`): 194 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/SSR.js:114` (`export class SSR {`): 361 lines, 4 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/SSRWebGPU.js:127` (`export class SSRWebGPU {`): 331 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: all four.

## Stream 40: client/core player LOD and vertex-animation-texture modules with no savi mention (spoint, read-only at `d5e3860`)

The five modules total 807 lines by `wc -l`. Savi's docs and scripts have zero word hits for the five basenames and for `PlayerLOD`, `VAT`, `vertex animation` and `animation texture`. Substring hits of `vat` inside other words are not module mentions.

- `client/core/PlayerLOD.js:6` (`export const PLAYER_LOD_FULL_COUNT = 30`): 248 lines, 10 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/PlayerLODTSL.js:5` (`export function createDotMaterialTSL(matrixNode) {`): 21 lines, 1 export. Imported by `client/core/PlayerLOD.js`. No tracked witness script at `d5e3860`.
- `client/core/PlayerVAT.js:7` (`export { bakeVAT, bakeVATMultiClip }`): 301 lines, 5 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/PlayerVATBake.js:62` (`export function bakeVAT(skinnedMesh, mixerRoot, clip, opts = {}) {`): 155 lines, 2 exports. Imported by `client/core/PlayerVAT.js` and `client/core/PlayerVATTSL.js`. No tracked witness script at `d5e3860`.
- `client/core/PlayerVATTSL.js:6` (`export { bakeVAT, bakeVATMultiClip }`): 82 lines, 2 exports. Imported by `client/core/PlayerVAT.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: all five.

## Stream 41: client/core rock and vegetation shading modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The four modules total 496 lines by `wc -l`. Savi's docs and scripts have zero case-insensitive word hits for `Rocks`, `RocksTSL`, `VegetationTSL` and `VegetationAmbientTSL`. The substring `rock` appears in `docs/JAYZEE-GAPS.md` only as `RockPhysics`, a different module. `Vegetation.js`, `VegetationBuild.js` and `VegImpostorTier.js` are separate streams and are not in this one.

- `client/core/Rocks.js:83` (`export async function createRocks(opts = {}) {`): 342 lines, 1 export. Imported by `client/app.js`. Its only script mention is `scripts/rock-model-exclusion-witness.mjs`, which reads `client/core/Rocks.js` as source text and does not import it. That is a source-text witness, not an import witness, and it is disclosed as such.
- `client/core/RocksTSL.js:22` (`export function applyRockTextureTSL(material) {`): 39 lines, 2 exports. Imported by `client/core/Rocks.js`. No tracked witness script at `d5e3860`.
- `client/core/VegetationTSL.js:3` (`export function makeWindUniformsTSL() {`): 35 lines, 5 exports. Imported by `client/core/Vegetation.js`. No tracked witness script at `d5e3860`.
- `client/core/VegetationAmbientTSL.js:10` (`export const vegAmbientUniforms = {`): 80 lines, 3 exports. Imported by `client/core/Vegetation.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: `RocksTSL`, `VegetationTSL` and `VegetationAmbientTSL`. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for each of them.

## Stream 42: vegetation core, build and impostor-tier modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The three modules total 1731 lines by `wc -l`: `client/core/Vegetation.js` 917, `client/core/VegetationBuild.js` 581 and `client/core/VegImpostorTier.js` 233.

- `client/core/Vegetation.js:55` (`export async function createVegetation(opts = {}) {`): 917 lines, 1 export. Imported by `client/app.js` and `apps/world/_shared/worldDefParse.js` (the second through a string `readBy` reference). Savi names it in `docs/FEATURESET.md:344`, where it is an importer of one atlas module only. That is importer-only, so it is NOT coverage of this module. Three scripts name it: `scripts/lib/verify-doc-claims.mjs`, `scripts/lint/comment-lint.mjs` (a lint scope) and `scripts/rock-model-exclusion-witness.mjs` (a source-text read). None is recorded here as a behavioural witness.
- `client/core/VegetationBuild.js:110` (`export function treeTextureHalveRefusals() { return _halveRefusals.slice() }`): 581 lines, 5 exports. Imported by `client/core/Vegetation.js`. No tracked witness script at `d5e3860`.
- `client/core/VegImpostorTier.js:10` (`export const IMPOSTOR_DISSOLVE_FADE_BAND_M = 3.0`): 233 lines, 5 exports. Imported by `client/core/Vegetation.js` and `client/core/VegetationBuild.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: `VegetationBuild` and `VegImpostorTier`. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for either.

## Stream 43: WebGPU instancing pair with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The two modules total 1247 lines by `wc -l`: `client/core/WebGPULodInstancer.js` 970 and `client/core/WebGPUInstancing.js` 277. Savi's docs and scripts have zero case-insensitive word hits for either basename, `WebGPU instancing` or `instancing`.

- `client/core/WebGPULodInstancer.js:7` (`export const LOD_REEVAL_MOVE_M = 0.5`): 970 lines, 2 exports. Imported by `client/core/Vegetation.js`, which is stream 42, and by `scripts/.veg-lod-mismatch-probe.mjs`. Three scripts name it: `scripts/.veg-lod-mismatch-probe.mjs`, `scripts/.veg-lod-path-probe.mjs` and `scripts/.veg-lod-stream-control.mjs`. None of the three prints a `RESULT:` line, so none is a witness under the check rule (exit 0 plus `RESULT: PASS`). The stream-control script defines its own copy of the instancer and does not import this module, so it exercises a copy, not the module.
- `client/core/WebGPUInstancing.js:8` (`export function isWebGPUInstancingSupported(renderer) {`): 277 lines, 5 exports. Imported by nine `client/core` modules already cited in streams 35, 36, 40 and 42: `Grass.js`, `GrassTSL.js`, `PlayerLOD.js`, `PlayerLODTSL.js`, `PlayerVAT.js`, `PlayerVATTSL.js`, `VegImpostorTier.js`, `Weather.js` and `WeatherMaterialsTSL.js`. Those are importer-only citations of this module, so they are NOT coverage. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: `WebGPUInstancing`. `git grep -lwF` over `scripts/` returns no file for it. `WebGPULodInstancer` has three script names and no behavioural witness.

## Stream 44: render graph and program readiness modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The three modules total 789 lines by `wc -l`: `client/core/RenderGraph.js` 273, `client/core/RenderGraph.nodes.js` 234 and `client/core/ProgramReadiness.js` 282. Savi's docs and scripts have zero case-insensitive word hits for the three basenames, `render graph`, `rendergraph`, `render node` and `program readiness`. `readiness` appears in unrelated PR and terrain text.

- `client/core/RenderGraph.js:1` (`export function createRenderGraph(nodes, opts = {}) {`): 273 lines, 1 export. Imported by `client/app.js`. Witnessed by two behavioural scripts, `scripts/postfx-graph-structure-witness.mjs` and `scripts/postfx-render-graph-witness.mjs`. Each imports the module and prints `RESULT:`.
- `client/core/RenderGraph.nodes.js:29` (`export function buildRenderSectionNodes() {`): 234 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/ProgramReadiness.js:3` (`export function renderDeferringUnreadyPrograms(renderer, scene, camera) {`): 282 lines, 8 exports. Imported by `client/app.js`, `client/core/Grass.js`, `client/core/PlacementScheduler.js`, `client/core/RenderGraph.nodes.js`, `client/core/Rocks.js`, `client/core/SSAO.js`, `client/core/SSR.js`, `client/core/SceneSetup.js`, `client/core/ThreeVdrs.js` and `client/core/Vegetation.js`. Most of those are already cited in streams 35, 39, 41 and 42, and they are importer-only, so they are NOT coverage. Witnessed by `scripts/program-readiness-render-witness.mjs`, which imports the module and prints `RESULT:`. `scripts/lint/comment-lint.mjs` also names it, as a lint scope, which is not a behavioural witness.

No tracked witness script at `d5e3860`: `RenderGraph.nodes`.

## Stream 45: client/core diagnostics and profiling probes with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The five modules total 1135 lines by `wc -l`. Savi's docs and scripts have zero case-insensitive word hits for the five basenames, `profiler`, `overdraw`, `runtime stats`, `collider debug` and `debug overlay`, outside this stream.

- `client/core/PerformanceProfiler.js:8` (`export function createPerformanceProfiler(renderer, scene) {`): 395 lines, 1 export. Imported by `client/core/DevToolsIntegration.js`, an unsent `client/core` module. `client/app.js` does not import it. No tracked witness script at `d5e3860`.
- `client/core/RuntimeStats.js:52` (`export function createRuntimeStats() {`): 185 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/OverdrawProbe.js:49` (`export function createOverdrawProbe({ renderer, scene, camera, readIntervalMs`): 292 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/MeshDebug.js:58` (`export function installMeshDebug({ maxTicks = POLL_MAX_TICKS } = {}) {`): 155 lines, 1 export. Imported by `client/app.js` and by one `client/hud` module. No tracked witness script at `d5e3860`.
- `client/core/ColliderDebug.js:44` (`export function createColliderDebug({ scene, frame, cfg }) {`): 108 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/FrameMetrics.js:4` (`export function createPerfTracker() {`): 233 lines, 5 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`. This is the explicit per-file mention for the held module. The concept-level phrase "the frame metrics" in `docs/JAYZEE-GAPS.md` row 59 is prose and is NOT the coverage; this entry is.

No tracked witness script at `d5e3860`: all six. `git grep -lwF` over `scripts/` at `d5e3860` returns no file for any of them.

## Stream 46: client/core scheduling, yield, load-gate and band modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The six modules total 335 lines by `wc -l`: 161, 99, 13, 38, 15 and 9. Savi's docs and scripts have zero case-insensitive word hits for `StreamingScheduler`, `PlacementScheduler`, `macrotaskYield`, `TileExtent` and `drawBands` outside this stream. `modelLoadGate` is the exception, and it is covered below.

- `client/core/StreamingScheduler.js:4` (`export function scoreRequest(features = {}) {`): 161 lines, 3 exports. Imported by `client/app.js` and `client/core/CacheRevalidationSweep.js`. No tracked witness script at `d5e3860`.
- `client/core/PlacementScheduler.js:13` (`export function resolveCameraPose(camera, out) {`): 99 lines, 3 exports. Imported by `client/app.js` and `client/core/RenderGraph.nodes.js`. No tracked witness script at `d5e3860`.
- `client/core/macrotaskYield.js:1` (`export function macrotaskYield() {`): 13 lines, 1 export. Imported by `client/core/Grass.js`, `client/core/Rocks.js`, `client/core/Vegetation.js` and `client/dev/HmrRuntime.js`. No witness import. `scripts/lib/verify-doc-claims.mjs` names it inside a claim string about the Grass prewarm at line 521. That is docs-claim text, not an import or a witness, and it is NOT coverage.
- `client/core/modelLoadGate.js:10` (`export async function prefetchModel(url, load) {`): 38 lines, 3 exports, the third being `runModelLoadGate` at line 20. Imported by `client/EntityLoader.js` and `client/app.js`. Witnessed by three behavioural scripts. Each imports the module and prints `RESULT:`: `scripts/model-gate-failure-witness.mjs`, `scripts/model-load-gate-witness.mjs` and `scripts/singleplayer-model-gate-witness.mjs`. These three were checked directly at `d5e3860` with `git grep -lwF` and a `RESULT` check, not accepted from a peer. The importer-only hit at FEATURESET.md:568, in the stream 33 modelLoadErrors entry, cites `modelLoadGate.js` as an importer of `src/shared/modelLoadErrors.js`. That hit is NOT coverage for `modelLoadGate`.
- `client/core/TileExtent.js:4` (`export function commitTileExtent(where, heightFn, sampleXZ, bounds, minY, maxY, padM) {`): 15 lines, 1 export. Imported by `client/core/Grass.js`, `client/core/Rocks.js` and `client/core/Vegetation.js`. No tracked witness script at `d5e3860`.
- `client/core/drawBands.js:1` (`export const WATER_TRANSPARENT_DRAW_BAND = -1`): 9 lines, 9 exports. Imported by `client/core/Weather.js`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: five of the six modules. `modelLoadGate` has three behavioural witnesses. The `git grep -lwF` hit for `macrotaskYield` is the claim string above, and that file is not a witness for it.

## Stream 47: client/core touch and keybinding input modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The four modules total 497 lines by `wc -l`: 286, 35, 46 and 130. Savi's docs, gaps and scripts have zero word-bounded hits for `TouchDraft`, `TouchSurfaceSpec` and `keybindings`. `MobileControls` has one savi hit, an importer-only citation in the stream 27 section at FEATURESET.md:410, and that hit is NOT coverage for `MobileControls`.

- `client/core/MobileControls.js:7` (`export class MobileControls {`): 286 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/TouchDraft.js:4` (`export function touchDraftFromBindings(bindings, layout, responsive) {`): 35 lines, 1 export. Imported by `client/core/MobileControls.js`. No tracked witness script at `d5e3860`.
- `client/core/TouchSurfaceSpec.js:1` (`export class TouchSurfaceSpecError extends Error {`): 46 lines, 4 exports. No importer in `src`, `client`, `apps`, `packages`, `scripts`, `bin` or `edge` at `d5e3860`. No tracked witness script at `d5e3860`.
- `client/core/keybindings.js:1` (`export const DEFAULT_KEY_BINDINGS = Object.freeze({`): 130 lines, 5 exports. No importer at `d5e3860`. No tracked witness script at `d5e3860`.

No tracked witness script at `d5e3860`: all four.

## Stream 48: client boot, connection and loading state modules with no savi mention (spoint, read-only at `d5e3860`)

The four modules total 423 lines by `wc -l`: 158, 148, 94 and 23. Savi's docs, gaps and scripts have zero word-bounded hits for `ClientMachine`, `ConnectionStatus`, `LoadingMachine` and `PreviewReload`.

- `client/core/ClientMachine.js:4` (`export const clientMachine = createMachine({`): 158 lines, 2 exports. Imported by `client/app.js`. No witness import. `scripts/lib/verify-doc-claims.mjs` names it inside a claim string at line 489, which says `TOGGLE_EDITOR` is sent in `client/app.js`. That is docs-claim text, not an import or a witness, and it is NOT coverage.
- `client/core/ConnectionStatus.js:56` (`export function createConnectionStatus() {`): 148 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/LoadingMachine.js:7` (`export const notModelFailure = ({ context }) => context.modelFailure !== true`): 94 lines, 8 exports. Imported by `client/app.js`. Witnessed by two behavioural scripts, each of which imports it and prints `RESULT:`: `scripts/force-ready-model-failure-witness.mjs` and `scripts/loading-machine-model-failure-witness.mjs`. These two were checked directly at `d5e3860` with an import regex and a `RESULT` check.
- `client/core/PreviewReload.js:4` (`export function startPreviewReload({`): 23 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.

Witnessed: `LoadingMachine` only. The other three are witness-less.

## Stream 49: client/core relocation, transform lerp and floating origin modules with no savi mention (spoint, read-only at `d5e3860`)

The three relocation and lerp modules total 301 lines by `wc -l`: 100, 85 and 116. Savi's docs, gaps and scripts have zero word-bounded hits for `RelocationSearch`, `RelocationSettle` and `TransformLerp`. The relocation family appears in savi only at FEATURESET.md:562, in the stream 33 bookmarks entry, which names `client/core/Relocation.js` as an importer of `src/shared/bookmarks.js`. That line does not name these two modules and is NOT coverage for them.

- `client/core/RelocationSearch.js:90` (`export async function searchBookmark(kind, ctx) {`): 100 lines, 1 export. Imported by `client/core/Relocation.js`. No tracked witness script at `d5e3860`.
- `client/core/RelocationSettle.js:45` (`export async function whenSettled({ idleFrames,`): 85 lines, 1 export. Imported by `client/core/Relocation.js`. No tracked witness script at `d5e3860`.
- `client/core/TransformLerp.js:3` (`export const STRIDE = 17`): 116 lines, 5 exports. Imported by `client/core/SceneGraph.js`. No tracked witness script at `d5e3860`.
- `client/core/FloatingOrigin.js:3` (`export const REBASE_THRESHOLD_M = 8000`): 61 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`. This is the explicit per-file mention that releases the hold on `FloatingOrigin.js`. The concept-level phrase "floating origin" in `docs/JAYZEE-GAPS.md` row 39 (line 72) is prose and is NOT the coverage; this entry is. `scripts/lib/verify-doc-claims.mjs` names the rebase claim at line 462, but it imports nothing from the module, so it is not a witness.

No tracked witness script at `d5e3860`: `RelocationSearch`, `RelocationSettle`, `TransformLerp` and `FloatingOrigin`.

## Stream 50: client/core decal, cache sweep, exact patch frame and multi viewport modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The four modules total 400 lines by `wc -l`: 104, 131, 93 and 72. Savi's docs, gaps and scripts have zero word-bounded hits for `DecalSystem`, `ExactPatchFrame` and `MultiViewport`. `CacheRevalidationSweep` appears only in the stream 46 section, as an importer of `client/core/StreamingScheduler.js`.

- `client/core/DecalSystem.js:10` (`export function createDecalSystem(scene, THREE) {`): 104 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/CacheRevalidationSweep.js:12` (`export function createCacheRevalidationSweep(opts = {}) {`): 131 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/ExactPatchFrame.js:47` (`export function createExactPatchFrame(frame) {`): 93 lines, 1 export. Imported by `client/core/Grass.js`, `client/core/Rocks.js` and `client/core/Vegetation.js`. Behavioural witnesses: `scripts/grass-seam-card-witness.mjs` and `scripts/shared-lattice-surface-witness.mjs`. Each loads the module with `await import(href('client/core/ExactPatchFrame.js'))` and prints `RESULT:` twice. Both were checked at `d5e3860`.
- `client/core/MultiViewport.js:9` (`export function createMultiViewport(renderer, scene) {`): 72 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.

## Stream 51: client/core expression, tree texture, replay, grid, shadow and editor kit modules with no savi mention (spoint, read-only at `d5e3860`)

The seven modules total 347 lines by `wc -l`: 67, 112, 75, 35, 51, 1 and 6. These are the modules whose names appear in the concept-level prose of `docs/JAYZEE-GAPS.md` rows 39 and 59. That prose is NOT per-file coverage. Each module has its own entry below. Savi's docs, gaps and scripts have zero word-bounded hits for all seven basenames outside those prose lines.

- `client/core/ExpressionCodes.js:1` (`export const EXPR_NEUTRAL = 0`): 67 lines, 15 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/TreeTextureBudget.js:2` (`export let TREE_TEXTURE_SOURCE_PX = 1024`): 112 lines, 14 exports. Imported by `client/core/Vegetation.js` and `client/core/VegetationBuild.js`. No tracked witness script at `d5e3860`.
- `client/core/ReplayBuffer.js:1` (`export function createReplayBuffer({`): 75 lines, 2 exports. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/GroundNodeGrid.js:9` (`export function createGroundNodeGrid(sampleExact) {`): 35 lines, 1 export. Imported by `client/core/Weather.js`. No tracked witness script at `d5e3860`.
- `client/core/CascadeShadowSelectTSL.js:4` (`export function installCascadeShadowSelectTSL(cascadeLights, splitExtents) {`): 51 lines, 3 exports. Imported by `client/core/ShadowPipeline.js`. No tracked witness script at `d5e3860`.
- `client/core/ShadowLayers.js:1` (`export const SHADOW_CASTER_ONLY_LAYER = 30`): 1 line, 1 export. Imported by `client/core/ShadowPipeline.js` and `client/core/WebGPULodInstancer.js`. `scripts/.veg-lod-stream-control.mjs` imports it through an absolute `file:///C:/dev/spoint/...` path and prints no `RESULT:` line, so it is NOT a witness. No tracked witness script at `d5e3860`.
- `client/core/EditorKit.js:1` (`export const editorKit = import('game-editor-kit').catch((e) => {`): 6 lines, 1 export. Imported by `client/app.js` and `client/editor/EditorShell.js`. No tracked witness script at `d5e3860`.

## Stream 52: client/core dev tools, scene graph, spectator, debug log, frame capture and sculpt overlay modules with no savi mention (spoint, read-only at `d5e3860`)

The six modules total 454 lines by `wc -l`: 50, 158, 90, 37, 13 and 106. Savi's docs and scripts name `DevToolsIntegration`, `SceneGraph` and `SculptOverlay` only in lines that are not coverage. Those lines are listed below.

- `client/core/DevToolsIntegration.js:7` (`export function installDevTools(renderer, scene, networkClient) {`): 50 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`. The importer-only citation of `DevToolsIntegration.js` in the stream 45 section names it as an importer of `PerformanceProfiler.js`. That citation is NOT coverage.
- `client/core/SceneGraph.js:5` (`export function createSceneGraph(scene, floatingOrigin) {`): 158 lines, 1 export. Imported by `client/app.js`. `scripts/netcode-conditioner-harness.mjs` loads it dynamically, but that script prints no `RESULT:` line, so it is NOT a witness. No tracked witness script at `d5e3860`. The importer-only citation in the stream 49 section names it as the importer of `TransformLerp.js`. That citation is NOT coverage.
- `client/core/SpectatorMode.js:1` (`export function createSpectatorMode({`): 90 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.
- `client/core/debug-log.js:26` (`export function dbg(namespace) {`): 37 lines, 1 export. Imported by `client/app.js`, `client/core/Grass.js`, `client/core/Rocks.js`, `client/core/SceneOcclusion.js`, `client/core/TerrainBackdrop.js`, `client/core/VegImpostorTier.js`, `client/core/Vegetation.js` and `client/core/VegetationBuild.js`. `client/core/RenderControls.js` names the path as a `readAt` string at line 346. That string is NOT an import and NOT coverage. No tracked witness script at `d5e3860`.
- `client/core/frameCapture.js:1` (`export async function captureHudFreeFrame({`): 13 lines, 1 export. No importer. `git grep -lw captureHudFreeFrame` at `d5e3860` finds only the module, so the export is unreferenced. No tracked witness script at `d5e3860`.
- `client/core/SculptOverlay.js:7` (`export function createSculptOverlay(terrainBackdrop) {`): 106 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`.

## Stream 53: client/core worker render protocol, time of day and world panels modules with no savi mention (spoint, read-only at `d5e3860`)

The three modules total 348 lines by `wc -l`: 78, 140 and 130. Savi's docs, gaps and scripts have zero word-bounded hits for all three basenames.

- `client/core/WorkerRenderProtocol.js:1` (`export const WORKER_MESSAGE = Object.freeze({`): 78 lines, 14 exports. Imported by `client/workers/OffscreenRenderWorker.js` as a namespace import (`import * as PROTOCOL`). No tracked witness script at `d5e3860`.
- `client/core/TimeOfDay.js:52` (`export function createTimeOfDay(sun, ambient, opts = {}) {`): 140 lines, 1 export. Imported by `client/app.js`. No tracked witness script at `d5e3860`. Its state is read through the globals `window.__timeOfDay` and `window.__timeOfDayApi`. `scripts/tsl-parity/bodies.mjs` drives `window.__timeOfDayApi`, which makes it a consumer of the global. That is NOT a per-file mention of the module.
- `client/core/WorldPanels.js:83` (`export function createWorldPanels(THREE, scene) {`): 130 lines, 2 exports (`WorldPanelError` and `createWorldPanels`). Imported by `client/AppModuleSystem.js`. No tracked witness script at `d5e3860`.

## Stream 54: client/core fluid surface, mapspinner feasibility probe and static instance store modules with no savi mention (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The three modules total 613 lines by `wc -l`: 237, 195 and 181. Savi's docs, gaps and scripts have zero word-bounded hits for `FluidSurface`, `MapspinnerWebGPUFeasibility` and `StaticInstanceStore`.

- `client/core/FluidSurface.js:10` (`export function sampleScalarField(positions, count, minX, minZ, maxX, maxZ, smoothingRadius, cellSize) {`): 237 lines, 4 exports (`sampleScalarField`, `marchingSquares`, `findBoundaryEdges` and `buildFluidSurfaceMesh`). Imported by `client/EntityLoaderMeshBuild.js`, which takes `buildFluidSurfaceMesh`. No tracked witness script at `d5e3860`.
- `client/core/MapspinnerWebGPUFeasibility.js:154` (`export function runFeasibilityProbe() {`): 195 lines, 1 export. No importer and no `scripts/` reference at `d5e3860`. No tracked witness script at `d5e3860`.
- `client/core/StaticInstanceStore.js:8` (`export function createStaticInstanceStore(opts = {}) {`): 181 lines, 1 export. Imported by `client/EntityLoader.js`. No tracked witness script at `d5e3860`.

## Stream 55: client/core three VDRS, terrain backdrop and scene setup modules with no savi mention (spoint, read-only at `d5e3860`)

The three modules total 1035 lines by `wc -l`: 259, 310 and 466. Savi's FEATURESET names each of them only as an importer of other modules. Those citations are NOT coverage and are disclosed below.

- `client/core/ThreeVdrs.js:80` (`export class ThreeVdrs {`): 259 lines, 4 exports (`ThreeVdrs`, `createThreeVdrsController`, `THREE_VDRS_WEBGPU_UNSUPPORTED` and `installThreeVdrs`). Imported by `client/app.js`. No tracked witness script at `d5e3860`. The importer-only citation in the stream 44 section names it as an importer of `ProgramReadiness.js`. That citation is NOT coverage.
- `client/core/TerrainBackdrop.js:35` (`export async function createTerrainBackdrop(renderer, scene, cfg = {}) {`): 310 lines, 2 exports (`prewarmMapspinnerPlanetModules` and `createTerrainBackdrop`). Imported by `client/app.js`. No tracked witness script at `d5e3860`. `scripts/lib/verify-doc-claims.mjs` names the module only in line-keyed claim maps. It is a doc-claim checker, so it is NOT a behavioural witness and NOT coverage. The importer-only citations in the stream 33 and stream 37 sections are NOT coverage either.
- `client/core/SceneSetup.js:14` (`export function createScene() {`): 466 lines, 21 export statements. Imported by `client/app.js`. `scripts/three-loader-error-witness.mjs` reads `client/core/SceneSetup.js` as source text at its line 15 and prints `RESULT:`. That is a source-text witness of the file's text, NOT a runtime witness of its behaviour. The importer-only citations in the stream 33, 36, 37 and 44 sections are NOT coverage.

## Stream 56: edge Cloudflare Durable Object files with no savi mention (spoint, read-only at `d5e3860`)

The four files total 272 lines by `wc -l`: 59, 102, 21 and 90. Savi's docs, gaps and scripts have zero word-bounded hits for `accept-request`, `do-client-probe`, `jolt-edge-init`, `spoint-do` and `SpointGameRoom`.

- `edge/cf-do/accept-request.js:29` (`export function acceptRoomRequest(request) {`): 59 lines, 3 exports (`acceptRoomRequest`, `acceptEdgeRequest` and `refuseResponse`). Imported by `edge/cf-do/spoint-do.js`. No tracked witness script at `d5e3860`.
- `edge/cf-do/do-client-probe.mjs:1` (`import WebSocket from 'ws'`): 102 lines, 0 exports. A top-level Node script with no importer. It is run by hand against a live Worker and prints a JSON result with an `ok` field. It prints no `RESULT:` line, so it is NOT a RESULT witness. No tracked witness script at `d5e3860`.
- `edge/cf-do/jolt-edge-init.js:8` (`export function initJoltForEdge() {`): 21 lines, 1 export. Imported by `edge/cf-do/spoint-do.js`. No tracked witness script at `d5e3860`.
- `edge/cf-do/spoint-do.js:41` (`export class SpointGameRoom {`): 90 lines, 2 exports, the class and the default Worker export at line 73. Imported by no module, as the Worker entry. No tracked witness script at `d5e3860`.

## Stream 57: src/sdk modules with no per-file citation (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The seven modules total 356 lines by `wc -l`: 39, 52, 30, 51, 58, 76 and 50. The citation test uses the full repository path, so a shorthand name in a list is NOT a citation.

- `src/sdk/WorldLocator.js:7` (`export function worldRoots(project, sdkRoot) {`): 39 lines, 5 exports (`worldRoots`, `findWorldFile`, `readDefaultWorldName`, `locateWorld` and `loadWorldModule`). Imported by 13 tracked files at `d5e3860`, including `bin/router-boot.js`, `src/sdk/MinimapBake.js`, `src/sdk/RoomDirectory.js`, `src/sdk/ServerBoot.js` and the bake and harness scripts. Five RESULT-printing scripts import it and call `loadWorldModule`: `scripts/chart-reanchor-wire-harness.mjs`, `scripts/cluster-world-harness.mjs`, `scripts/grass-seam-card-witness.mjs`, `scripts/planet-multiplayer-harness.mjs` and `scripts/shared-lattice-surface-witness.mjs`. The last two load it through `href(...)`. All five are behavioural witnesses, checked by import and RESULT at `d5e3860`. The stream 57 message's "no witness names it for behaviour" does not hold for this module. `src/static/BakeCodeVersion.js` lists it as a bake input, which is NOT coverage.
- `src/sdk/RoomHealth.js:1` (`export class RoomHealthError extends Error {`): 52 lines, 2 exports (`RoomHealthError` and `createRoomHealth`). No importer in the tracked tree. No tracked witness script at `d5e3860`.
- `src/sdk/RoomPick.js:3` (`export class RoomPickError extends Error {`): 30 lines, 2 exports (`RoomPickError` and `selectRoomForJoin`). Imported by `src/sdk/RoomOrchestrator.js`. No tracked witness script at `d5e3860`.
- `src/sdk/RoomRouting.js:22` (`export function firstOpenRoom(rooms, options = {}) {`): 51 lines, 4 exports. No importer in `src/`. `scripts/room-routing-witness.mjs` imports the exports and prints `RESULT:`, so it is a behavioural witness. That file is the only one.
- `src/sdk/SceneImport.js:28` (`export function mapSceneObject(object, kindToTemplate, index = 0) {`): 58 lines, 2 exports (`mapSceneObject` and `mapScene`). No importer in the tracked tree. No tracked witness script at `d5e3860`.
- `src/sdk/TiledImport.js:58` (`export function importTiledMap(map) {`): 76 lines, 1 export. No importer in the tracked tree. No tracked witness script at `d5e3860`.
- `src/sdk/scaffold.js:34` (`export async function scaffold() {`): 50 lines, 1 export. No importer in the tracked tree. `scripts/lib/verify-doc-claims.mjs` names it in a claim string and imports nothing from it, so that is NOT a witness. No tracked witness script at `d5e3860`.

Disclosed, NOT coverage: the savi lists in `docs/PARITY-INPUTS.md` and `docs/FEATURESET.md` name these modules as shorthand list items. `docs/JAYZEE-GAPS.md` row 50 names `RoomHealth`, `RoomPick` and `RoomRouting` in concept-level prose. `docs/FEATURESET.md` names `WorldLocator` only as an importer of `worldPresets.js` in the stream 33 section.

## Stream 58: src/sdk server presence, room directory, agent authoring and nostr auth modules (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the first export at `d5e3860`. The four modules total 510 lines by `wc -l`: 109, 102, 126 and 173. `ServerWeather.js` is HELD by spoint and is NOT in this stream.

- `src/sdk/NostrAuthServer.js:27` (`export function createNostrAuthServer({ enableChallenge = false, challengeTimeoutMs = DEFAULT_TIMEOUT_MS } = {}) {`): 109 lines, 1 export. Imported by `src/sdk/ServerHandlers.js`. No tracked witness script at `d5e3860`.
- `src/sdk/ServerPresence.js:37` (`export async function createServerPresence(opts = {}) {`): 102 lines, 1 export. Imported by `src/sdk/ServerBoot.js`. No tracked witness script at `d5e3860`.
- `src/sdk/RoomDirectory.js:6` (`export class RoomDirectory {`): 126 lines, 1 export. Imported by `bin/room-worker-boot.js` and by the `src/sdk` process worker covered in stream 25, part 2. No tracked witness script at `d5e3860`. The importer-only citation of `RoomDirectory` in that stream 25, part 2 section is NOT coverage.
- `src/sdk/AgentAuthoringAPI.js:51` (`export function createAgentAuthoringHandler() {`): 173 lines, 1 export. Imported by `src/sdk/ServerAPI.js` and routed for `/agent/` paths. `scripts/verify-app.mjs` calls the read routes `/agent/apps` and `/agent/entities` over HTTP against a live server and prints `RESULT:`. That is a live behavioural witness of the read routes only. The module is not imported there, and no tracked witness covers the write routes.

Disclosed, NOT coverage: `docs/PARITY-INPUTS.md`, `docs/FEATURESET.md` and `docs/JAYZEE-GAPS.md` row 50 list all four modules as concept-level prose. `docs/FEATURESET.md:580` records that `src/sdk/AgentAuthoringAPI.js` names `create-app.js`. That is a reference from another module, and it is NOT coverage of `AgentAuthoringAPI.js`.

## Improvement opportunities (not behaviour to match)

The owner's rule is that the documented featureset is a floor. Where spoint's design is weaker, jayzee should build the better version, and matching spoint's behaviour is not the requirement. Each item below is spoint's weaker design, recorded here as an improvement opportunity for jayzee.

- `src/connection/SessionStore.js:11` (`this.ttl = options.ttl || 30000`): a silent default for the session time-to-live. An explicit option that is missing or zero falls back to 30000 without a warning.
- `src/game/StatsSystem.js:8` (`? spec.xpPerLevel : 100`): a silent experience-per-level default of 100 when the spec does not give a positive number.
- `src/sdk/SESCompartmentEvaluator.js:125` (`endowments.__checkBudget = () => {`): the budget check is defined here and has no caller anywhere in the repository at `d5e3860`, so the step budget is not enforced through it.
- `src/static/BakeCodeVersion.js:147` (`inputs: BAKE_INPUTS_GLB_TRANSFORM`): the GLB transform pin lists a named set of inputs, not the import closure of its entry, so an edit to an unlisted import does not change the pin.

The items below come from streams 33, 34 and 35. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce. Each one is a place where spoint's design could be done better.

- `src/shared/SpawnSurface.js:68` (`const poseY = Number.isFinite(terrainY) ? Math.max(pose[1], terrainY) : pose[1]`): a non-finite `terrainY` silently takes the branch that ignores it. The argument check validates `pose[1]` but not `terrainY`.
- `src/shared/colliderLattice.js:10` (`return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null`) and `src/shared/colliderLattice.js:19` (`const extent = positiveFinite('physics.extent', tphys.extent) ?? COLLIDER_DEFAULT_EXTENT_M`): an invalid `physics.extent` or `physics.resolution` returns null, which the `??` replaces with a literal default, so no refusal is raised.
- `src/shared/MinimapBiome.js:38` (`if (!Number.isFinite(h)) { out[0] = 0; out[1] = 0; out[2] = 0; out[3] = 0; return null }`): a non-finite height zero-fills the output and returns null, a sentinel for absence.
- `bin/room-orchestrator-boot.js:14` (`const workerCount = parseInt(process.env.ROOM_WORKER_COUNT || '2', 10)`) and `bin/room-worker-boot.js:59` (`const workerCommandPort = parseInt(process.env.WORKER_COMMAND_PORT || '0', 10)`): numeric environment values are parsed with no finite check, so an invalid value becomes NaN rather than a refusal.
- `bin/router-boot.js:25` (`const cellSize = parseInt(process.env.SHARD_CELL_SIZE || String(shardCfg.cellSize ?? 0), 10) || undefined`): a 0 or NaN is turned into undefined without a refusal.
- `bin/marketplace-registry.js:7` (`const PORT = parseInt(process.env.PORT || '3100', 10)`): PORT has no finite check.
- `bin/marketplace-install.js:17` (`let registryUrl = process.env.MARKETPLACE_REGISTRY || 'http://localhost:3100'`): the registry URL silently defaults to localhost.
- `client/core/GrassTSL.js:33` and `client/core/GrassMaterial.js:152` (`const d = density || GRASS_DENSITY`): any falsy density, including 0, silently becomes the default.
- `client/core/GrassClump.js:73` (`const N = Number.isFinite(segments) && segments >= 1 ? segments | 0 : 3`) and `client/core/GrassClump.js:74` (the same form for `cards`): an invalid value becomes a literal default without a refusal.
- `client/core/GrassWindField.js:137` (`const r = Number.isFinite(reach) && reach > 0 ? reach : GRASS_WIND_FIELD_REACH_M`): an invalid reach silently takes the default.
- `client/core/GrassMaterial.js:117` (`return Number.isFinite(v) ? v : fallback`): a silent fallback.
- The grass law is held in one place, `GRASS_DENSITY` from `src/terrain/GrassPlacement.js`, but the shader-side fade is still written in both `GrassTSL` and `GrassMaterial`. A change to one side alone can desynchronise them. This is a design candidate, not a defect.

The items below come from streams 36 to 40. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/WetnessTint.js:54` (`const v = THREE.MathUtils.clamp(Number.isFinite(w) ? w : 0, 0, 1)`) and `client/core/WetnessTintTSL.js:36` (`const v = Number.isFinite(w) ? Math.min(1, Math.max(0, w)) : 0`): an absent or invalid wetness silently becomes 0, a sentinel for absence.
- `client/core/UnderwaterTint.js:89` (`if (Number.isFinite(planetRadius) && planetRadius > 0) _seaUniform.value[SEA_RADIUS] = planetRadius`): an invalid planetRadius is skipped silently, which leaves the previous uniform in place.
- `client/core/UnderwaterTintTSL.js:51` (`if (!Number.isFinite(seaY)) return`): a non-finite seaY is a silent no-op.
- `client/core/PostFxLook.js:38` (`const exposure = look.exposure ?? 1`): a silent default for an optional field.
- `client/core/CullingHub.js:15` (`per[name] = s || null`): a null sentinel. Lines 17 and 18 skip non-finite values silently.
- `client/core/TerrainOcclusion.js:8` (`const minCandidates = opts.minCandidates ?? 32`), `:9` (`const maxElev = opts.maxElev ?? 200`) and `:24` (`let maxQueriesPerFrame = opts.maxQueriesPerFrame ?? 32`): silent defaults for absent options. Line 25 drops an invalid `setMaxQueriesPerFrame` value without a refusal.
- `client/core/TerrainOcclusion.js:135` (`|| 1` on a length), `:178` (`const s = halfSize || 1`) and `:207` (`size: rec.size || 1`): silent literal defaults.
- `client/core/WebGPUCullingHubIntegration.js:35` (`const viewProjection = vp || DEFAULT_PERSPECTIVE_VIEW_PROJECTION`): an invalid view-projection is silently replaced. Line 93 (`return mesh.count || 0`) turns an absent count into 0.
- `client/core/WebGPUCullingHubIntegration.js:141` (`failOpens: 1`): a failed GPU compute cull is reported on a fail-open path. Per AGENTS.md a GPU and CPU divergence culls the wrong cells, so this is worth a look. This is a candidate, not a verified defect.
- `client/core/Bloom.js:100` and `client/core/BloomWebGPU.js:62` (`const scale = RenderControls.get('bloomResolutionScale') || 0.5`): a stored 0 silently becomes 0.5.
- `client/core/Bloom.js:157` and `client/core/BloomWebGPU.js:122` (`Math.max(1, RenderControls.get('bloomBlurPasses') || 1)`): a stored 0 silently becomes 1, and a non-finite value is not refused.
- `client/core/FSR1.js:216` (`if (dpr == null) return false`) and `:217` (`window.devicePixelRatio || 1`): a literal default for an absent device pixel ratio.
- `client/core/Bloom.js:87` and `client/core/FSR1.js:83` read `RenderControls.get('bloomIntensity')` and `RenderControls.get('fsr1Sharpness')` straight into uniform values at construction, with no validation at that boundary.
- `client/core/SSR.js:212` and `client/core/SSRWebGPU.js:218` (`this.userData.wetness || 0`): an absent wetness and a zero wetness are not distinguished.
- `client/core/SSR.js:272` and `client/core/SSRWebGPU.js:277` (`THREE.MathUtils.clamp(_getWeatherWetness() || 0, 0, 1)`): a missing weather reading becomes 0 silently, the same class as `WetnessTint.js:54`.
- `client/core/SSR.js:243` and `client/core/SSRWebGPU.js:250` (`this._sharedGBuffer = gbufferTexture || null`): a null sentinel for an absent G-buffer.
- `client/core/SSRWebGPU.js:292` (`const underwaterTint = typeof window !== 'undefined' ? window.__underwaterTint : null`): a global read with a null fallback, not an injected dependency.
- `client/core/PlayerLOD.js:81`, `:82` and `:83` (`opts.dotCellM || 25`, `opts.dotSize || 1.4`, `opts.capacity || 512`), repeated at `:135` to `:137`: literal defaults in two places, so a zero is replaced silently and the two copies can drift apart.
- `client/core/PlayerVAT.js:137` and `:141` (`const nominal = opts.nominalSpeed || 4.0`): a zero becomes 4.0. Line 120 derives `blendHighSpeed` from the same literal.
- `client/core/PlayerVAT.js:202` (`try { im.setUniformAt(id, name, value) } catch (_) {}`): a failed uniform write is dropped without a report.
- `client/core/PlayerVAT.js:293` and `:295`: `null` is the sentinel for an absent renderer or mesh.
- `client/core/PlayerVATBake.js:77` (`const maxTexSize = opts.maxTexSize || 4096`) and `:148` (`baked[0] || null`).

The items below come from stream 41. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/Rocks.js:89` (`const worldSeed = (opts.worldSeed ?? cfg.seed ?? 0) | 0`): a non-finite seed is coerced to 0 silently.
- `client/core/Rocks.js:92` and `:97`: a non-finite config value falls back to a literal (`cfg.renderDistance || 320`, `MAX_INSTANCES` 12000), and a zero value is silently replaced.
- `client/core/Rocks.js:102` and `:118`: a failed geometry build becomes `null` or `-1` with a `console.error`, and the build continues. That is a sentinel for absence rather than a refusal with a code.
- `client/core/Rocks.js:276` (`if (!Number.isFinite(px) || !Number.isFinite(pz)) return 0`): a non-finite position returns a count of 0.
- `client/core/VegetationAmbientTSL.js:50` (`return Number.isFinite(v) ? v : fallback`): a silent fallback. Line 54 sets `muS` to 1 when the elevation is non-finite. Line 61 skips the ambient update silently when a value is non-finite.
- `client/core/VegetationTSL.js:9` (`if (typeof window !== 'undefined' && window.__vegWind != null) wind.uVegWind.value = +window.__vegWind`): the global is written to a uniform with no finite check first.

The items below come from stream 42. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/Vegetation.js:75` (`console.error('[veg] @dgreenheck/ez-tree failed to load -- vegetation skipped this session (rest of the client is unaffected):', e?.message || e)`): a failed load skips all vegetation for the session and logs an error. The rest of the client continues. This is a fail-soft choice to weigh, not a verified defect.
- `client/core/Vegetation.js:79` (`const renderDistance = Number.isFinite(cfg.renderDistance) ? cfg.renderDistance : 640`) and the other `Number.isFinite(cfg.x) ? cfg.x : literal` lines in the 79 to 116 block: invalid config becomes a literal default at one boundary, with no refusal.
- `client/core/Vegetation.js:115` and `:116` read `?vegVariants=` from the URL. The `SHAPE_VARIANTS` line clamps the value, and a non-numeric value falls back silently.
- `client/core/Vegetation.js:199` and `:254` (`console.warn('[veg] impostor bake failed (mesh-LOD-only):'`): an impostor bake failure falls back to mesh LOD only with a warning.
- `client/core/Vegetation.js:378` (`catch (_) { list = null }`): a placement failure is swallowed and the list becomes null.
- `client/core/VegetationBuild.js:90` (`try { if (await decodeImage(img)) { t.needsUpdate = true; return } } catch (_) {}`): a decode failure is swallowed, and a size check takes over.
- `client/core/VegetationBuild.js:493` (`const presetName = PRESET[name] || name`) and `:516` (`const target = TARGET_H[name] || 9`): silent literal defaults for an absent name or height.
- `client/core/VegImpostorTier.js:91` (`const capacity = Math.min(opts.maxInstances || 20000, opts.initCapacity || 4096)`): silent literal defaults for absent options.
- `client/core/VegImpostorTier.js:147`, `:158`, `:185`, `:222` and `:231` wrap `addLOD`, `setUniformAt`, `removeInstances`, `setAttributeAt` and `releaseId` in `try { } catch (_) {}`, so a failed write is dropped with no report.
- `client/core/Vegetation.js:262` logs and rethrows a species failure, which is consistent with the AGENTS.md rule, so it is not a candidate.

The note below is a DOCUMENTATION IMPROVEMENT OPPORTUNITY, scoped to one example in savi's reference. Savi's reference gives `new LineBasicNodeMaterial({ color, linewidth: 3 })` at `.spawn/reference/engine/api-reference.md:2198`, and `.spawn/reference/engine-deep/api-b.md:309` says `linewidth` is in CSS pixels at every distance. Jayzee's gate at `37bd320` accepts the example as written (`scripts/check-upstream-builtin-three.mjs:93`), and jayzee keeps this note OPEN in its AGENTS.md. The claim that three's public docs give a line width of 1 on most WebGL platforms, so that `Line2NodeMaterial` may be needed for every-distance width, is NOT verified here: three is not installed in this repository, and the claim is recorded as the reviewer's statement, not a checked fact.

The items below come from streams 43 and 44. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce. Items marked NEEDING A CHECK are not yet verified in what they do.

- `client/core/WebGPULodInstancer.js:139` (`const hysteresis = Number.isFinite(opts.hysteresis) ? opts.hysteresis : 0`) and `:140` and `:141` (`shadowDistance` with `-1` as its no-shadow value): a non-finite option silently takes a default, and the `-1` sentinel stands in for "no shadow" without a refusal.
- `client/core/WebGPULodInstancer.js:296` (`return rec === null || rec === undefined ? -1 : id`): `-1` is the sentinel for absence.
- `client/core/WebGPUInstancing.js:14` (`if (!interleaved) throw new Error(`): a prose `Error` with no code at a refusal boundary.
- `client/core/RenderGraph.js:22` (`const t = (n.targets && n.targets[key]) || key`): a silent default for a missing target name.
- `client/core/RenderGraph.js:151` (`if (hook && (typeof hook.before !== 'function'`): a prose `TypeError`. A null hook clears the profiler.
- `client/core/RenderGraph.js:227` (`try { node.run(ctx) } catch (e) { ... _nodeThrew(node.id, e, graph.frameId); return }`): NEEDING A CHECK. The node's failure is caught and `_nodeThrew` runs, but what `_nodeThrew` reports has not been verified here.
- `client/core/RenderGraph.nodes.js:39` (`ctx.vegetation ? ctx.vegetation.renderDistance || 0 : 0`): a zero stands in for an absent distance, which AGENTS.md's no-sentinel-for-absence rule forbids.
- `client/core/RenderGraph.nodes.js:56` (`const planetRadius = (ctx.terrainBackdrop.planet && ctx.terrainBackdrop.planet.radius) || 63600`): a silent literal default for a planet radius.
- `client/core/RenderGraph.nodes.js:170` (`const scale = +RenderControls.get('threeVdrsScale') || 1.0`): a stored 0 is replaced by 1.0.
- `client/core/ProgramReadiness.js:5` (`renderer.deferredProgramDraws = renderer.deferredProgramDraws || 0`): writes a property onto the renderer when it is absent.
- `client/core/ProgramReadiness.js:93` and `:206` (`window.__spointAsyncPipelineEscort !== false` and `window.__spointDeferFirstUse !== false`): default-on flags, so an absent global enables the path.
- `client/core/ProgramReadiness.js:18`, `:114` and `:242` (`} catch (e) {`): NEEDING A CHECK. What these blocks do with the error has not been verified here.

The items below come from stream 45. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/PerformanceProfiler.js:167` and `:170` (`(t.width || 0) * (t.height || 0)` and `(g.vertices || 0)`): a missing size counts as 0 bytes, so memory is undercounted without a flag.
- `client/core/PerformanceProfiler.js:179` to `:181` (`info.render?.calls || 0` and `scene?.children?.length || 0`): an absent counter becomes 0, so a zero reading cannot be told apart from no data.
- `client/core/PerformanceProfiler.js:57` (`const dpr = window.devicePixelRatio || 1`): a silent literal default.
- `client/core/RuntimeStats.js:76` (`rttHistory.push(Math.max(0, rtt || 0))`): a missing RTT becomes 0 ms, which is also a valid reading. The two cases cannot be told apart. This is a candidate for a distinct missing marker, not a defect. Lines 82 to 87 use the same `|| 0` for render and player counters.
- `client/core/OverdrawProbe.js:219` (`try { RenderControls.set(STATS_KEY, next) } catch (_) {}`): a swallowed write.
- `client/core/OverdrawProbe.js:283` (`setViewCeiling: (n) => { if (Number.isFinite(n) && n > 0) ceilingUniform.value = n }`): an invalid ceiling is ignored with no refusal.
- `client/core/ColliderDebug.js:49` (`const extent = Number.isFinite(phys.extent) && phys.extent > 0 ? phys.extent : 256`): a literal default for an invalid extent, the same shape as the `colliderLattice.js` candidate in stream 33. The `resolution` line uses the same literal form.
- `client/core/ColliderDebug.js:75` (`if (!Number.isFinite(h)) h = -1000`): a magic `-1000` stands in for an absent height.
- `client/core/MeshDebug.js:51` and `:94` (`?? '-'` and `?? null`): display-only absence sentinels, listed for completeness.

The items below come from stream 46. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/StreamingScheduler.js:5` (`const distance = Number.isFinite(features.distance) && features.distance >= 0 ? features.distance : Infinity`): a non-finite or negative distance silently becomes Infinity, so the request ranks as the farthest rather than being refused.
- `client/core/StreamingScheduler.js:6` (`const screenSize = Number.isFinite(features.screenSize) && features.screenSize > 0 ? features.screenSize : 1`): an invalid screen size takes a literal 1.
- `client/core/StreamingScheduler.js:8` (`const gameplayBoost = Number.isFinite(features.gameplayBoost) ? Math.min(1, Math.max(0, features.gameplayBoost)) : 0`): an invalid boost becomes 0.
- `client/core/StreamingScheduler.js:134` (`try { rec.run() } catch (e) { }`): an empty catch. NEEDING A CHECK, not a defect verdict.

`client/core/modelLoadGate.js` is a conforming example, not a defect. It refuses bad input with coded refusals at lines 11, 22 and 23: `model-prefetch-url-invalid`, `model-gate-hooks-invalid` and `model-gate-failure-hook-invalid`.

The items below come from streams 48 and 49. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/ClientMachine.js:138` (`return (m && typeof m === 'object' && m.spectator) ? m.spectator : null`): an absent spectator returns null, a null sentinel for absence.
- `client/core/ConnectionStatus.js:135` (`const rttOk = Number.isFinite(rtt)`): a non-finite RTT takes the not-ok branch silently. This needs a check against the RTT display.
- `client/core/LoadingMachine.js:33` (`event.reasonCode || 'model load failed'`): a missing reason code becomes a prose label, so the failure is reported but its cause is lost.
- `client/core/LoadingMachine.js:39` (`entityPending: ({ event }) => event.count ?? 0`): a missing count is read as zero pending entities. NEEDING A CHECK.
- `client/core/PreviewReload.js:14` (`if (seen === null) seen = build`): null is the first-build sentinel.
- `client/core/RelocationSearch.js:28` (`return Number.isFinite(y) ? elevationAtLocal(frame, x, y, z) : NaN`): NaN is the absence value for a non-finite `y`. NEEDING A CHECK against AGENTS.md's "no NaN for absence" rule, not a defect.
- `client/core/RelocationSettle.js:21` (`const pending = (poolStats?.inFlight || 0) + (deferred?.queued ?? deferred?.pending ?? 0) + (scheduler?.queued || 0) + hpfPending`): an absent count becomes 0, and the two deferred field names fall back silently.
- `client/core/RelocationSettle.js:48` (`throw new Error('whenSettled: no connected client')`): a refusal with no code. AGENTS.md asks for codes at refusal boundaries.
- `client/core/RelocationSettle.js:61` (`patchExact = Number.isFinite(frame._patchHeightOrNull(p[0], p[2]))`): a non-finite height turns into false silently.
- `client/core/TransformLerp.js:19` (`if (!(Number.isFinite(target.rx) && Number.isFinite(target.ry) && Number.isFinite(target.rz) && Number.isFinite(target.rw))) return`): a non-finite target rotation drops the update with no report.

Observation, not a finding, scoped to the tracked tree at `d5e3860`: `.gm/pool/pool.log` line 1625 records an honest PASS 38/38 for ClientCorePlayerVATBake, and no tracked script names PlayerVATBake at `d5e3860`. The same log names `scripts/decal-system-witness.mjs`, `scripts/SculptOverlay-witness.mjs` and `scripts/DebugLog-witness.mjs`, and none of the three is tracked at `d5e3860`. The log records provenance and is not a witness, so this discrepancy stays OPEN and is not resolved here.

The items below come from streams 50 to 53. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/DecalSystem.js:64` (`if (!origin || !target) return`): a missing origin or target is a silent no-op with no report.
- `client/core/CacheRevalidationSweep.js:14` (`const staleMs = Number.isFinite(opts.staleMs) && opts.staleMs >= 0 ? opts.staleMs : STALE_MS`) and `client/core/CacheRevalidationSweep.js:15` (`const maxPerSweep = Number.isFinite(opts.maxPerSweep) && opts.maxPerSweep > 0 ? opts.maxPerSweep : MAX_ENQUEUED_PER_SWEEP`): an invalid option falls back to a literal default with no refusal.
- `client/core/ExactPatchFrame.js:11` (`const seed = Number.isFinite(frame.anchorHeight) ? frame.anchorHeight : 0`): 0 is a sentinel for an absent anchor height.
- `client/core/MultiViewport.js:17` (`camera = new THREE.PerspectiveCamera(opts.fov ?? 60`): silent literal defaults for the camera options.
- `client/core/MultiViewport.js:34` (`function getPane(id) { return panes.get(id) || null }`): null for an unknown pane.
- `client/core/ExactPatchFrame.js:75` (`if (y === null) { missing = true; throw new NoGroundHeightError(x, z) }`) is a conforming example, not a defect. It throws a named error for missing ground, as AGENTS.md asks.
- `client/core/GroundNodeGrid.js:7` (`const _nodeY = (h) => Number.isFinite(h) ? h : NO_GROUND_Y`): a sentinel height for a non-finite sample. NEEDING A CHECK against AGENTS.md's sentinel rule, not a defect.
- `client/core/ExpressionCodes.js:47` (`if (!expressionManager || typeof expressionManager.getValue !== 'function') return EXPR_NEUTRAL`): a missing manager returns neutral with no signal.
- `client/core/ExpressionCodes.js:51` (`try { v = expressionManager.getValue(name) || 0 } catch (_e) { continue }`): getValue failures are dropped, and a zero reading is replaced by 0 silently.
- `client/core/ReplayBuffer.js:3` (`throw new Error('createReplayBuffer requires maxFrames >= 1')`): a prose Error, not a refusal code.
- `client/core/CascadeShadowSelectTSL.js:9` (`uniform((splitExtents && splitExtents[idx]) || 0)`) and `client/core/CascadeShadowSelectTSL.js:45` (`farEdge.value = extents[idx] || 0`): silent zero defaults for missing split extents.
- `client/core/EditorKit.js:4` (`console.error('[kit]', reason)`): the import failure is logged, with no refusal code.
- `client/core/TreeTextureBudget.js:33` (`throw new TreeTextureBudgetError('not-a-number'`) is a conforming example, not a defect. It throws a coded refusal, as AGENTS.md asks.
- `client/core/SceneGraph.js:22` (`feetOffset: opts.feetOffset ?? 0.91`): a silent literal default for the feet offset.
- `client/core/SceneGraph.js:155` (`function setLocalPlayer(id) {}`): an empty function. NEEDING A CHECK, not a verified defect. Spoint reports a call at `client/app.js:1236`, and that call has not been run to confirm it is a no-op.
- `client/core/SculptOverlay.js:44` (`const res = render.SCULPT_RES || 256`): a silent literal default.
- `client/core/SculptOverlay.js:63` (`radius <= 0) return false`): a bare refusal with no reason code.
- `client/core/SculptOverlay.js:98` (`const cx = Number.isFinite(centerX) ? centerX : 0`): a non-finite centre becomes the origin silently.
- `client/core/debug-log.js:11` (`} catch {`): a catch on the query decode. NEEDING A CHECK.
- `client/core/DevToolsIntegration.js:23` (`(renderer.info.render.calls * GPU_MS_PER_DRAW_CALL_ESTIMATE) : 0`): an unknown draw-call count becomes a GPU estimate of 0 with no signal.
- `client/core/frameCapture.js:8` (`throw new Error('capture_unavailable')`): a code string as the Error message, not a coded error class.
- `client/core/TimeOfDay.js:53` (`let dayLengthSec = Number.isFinite(opts.dayLengthSec) && opts.dayLengthSec > 0 ? opts.dayLengthSec : 600`): an invalid option takes a literal default with no refusal.
- `client/core/TimeOfDay.js:54` (`let t = Number.isFinite(opts.startFraction) ? ((opts.startFraction % 1) + 1) % 1 : 0.3`) and `client/core/TimeOfDay.js:58` (`const tiltDeg = Number.isFinite(opts.azimuthTiltDeg) ? opts.azimuthTiltDeg : 23`): literal defaults for invalid options.
- `client/core/TimeOfDay.js:92` (`try { onDirectionChange(dir) } catch (_) {}`): a consumer callback's error is swallowed with no log.
- `client/core/TimeOfDay.js:121` (`function setFraction(frac) { if (Number.isFinite(frac)) {`): a non-finite input is ignored silently.
- `client/core/WorkerRenderProtocol.js:67` (`if (!isWorkerRefusalCode(code)) {`): the one place the module refuses in prose, for an undeclared refusal code. Minor.
- `client/core/WorldPanels.js:73` (`canvas.getContext('2d')`): the context is not checked for null, and line 59 uses it directly.

The items below come from streams 54 to 56. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `client/core/MapspinnerWebGPUFeasibility.js:150` (`rationale: '613 gl.* call sites across 5 files.`): the rationale prose hard-codes counts. Spoint's own measurement at `d5e3860` gives 821 call sites across the five existing files, which is NOT verified here. This is a stale-prose issue, not a runtime one.
- `client/core/StaticInstanceStore.js:55` (`try { bucket.bvh = new MeshBVH(bucket.geometry) } catch (e) { }`): an empty catch. A BVH build failure is silent, and the bucket is left with no BVH and no signal.
- `client/core/StaticInstanceStore.js:60` (`if (_entityToSlot.has(entityId)) return entityId`): a re-add of an existing entity is a silent no-op, and a new transform is not applied.
- `client/core/StaticInstanceStore.js:9` (`let _capacity = Math.max(64, opts.initialCapacity || 1024)`): a silent literal default.
- `client/core/StaticInstanceStore.js:82` (`if (slot == null) return false`), `client/core/StaticInstanceStore.js:94` (`if (slot == null || !_active[slot]) return null`), `client/core/StaticInstanceStore.js:105` (`if (slot == null || !_active[slot]) return -1`) and `client/core/StaticInstanceStore.js:120` (`return slot == null ? -1 : _lodTier[slot]`): sentinels for absence, with no refusal code.
- `client/core/FluidSurface.js:135` (`const ox = originPos?.[0] || 0`): a silent zero default for each origin component.
- `client/core/FluidSurface.js:142` (`if (!Number.isFinite(minX)) return null`) and `client/core/FluidSurface.js:146` (`if (n2d === 0) return null`): null sentinels.
- `client/core/TerrainBackdrop.js:30` (`import('/node_modules/mapspinner/src/tsl/planet-tsl.js').catch(() => {})`): a promise swallow. Silent catches also sit at `client/core/TerrainBackdrop.js:210` (`} catch (_) { glTex = null }`), `client/core/TerrainBackdrop.js:272` (`} catch (_) {}`) and `client/core/TerrainBackdrop.js:300` (`} catch (_) {}`). Failures on these paths are silent. NEEDING A CHECK.
- `client/core/TerrainBackdrop.js:42` (`const radius = cfg.radius || 6360000`): a silent literal planet radius.
- `client/core/TerrainBackdrop.js:185` (`const epoch = Number.isFinite(frame.chartEpoch) ? frame.chartEpoch : 0`): a silent epoch of 0.
- `client/core/ThreeVdrs.js:169` (`const s = Math.min(1.0, Math.max(0.3, scale || 1.0))`): a zero or NaN scale becomes 1.0 silently, and the 0.3 floor is a literal.
- `client/core/ThreeVdrs.js:248` (`export const THREE_VDRS_WEBGPU_UNSUPPORTED = `): a prose reason string in place of a code.
- `client/core/ThreeVdrs.js:240` (`if (on !== appliedOn) { window.__threeVdrs = on; appliedOn = on }`): a window global write. Spoint's tracked-tree search found no reader of `__threeVdrsScale` or `__threeVdrsState`. NEEDING A CHECK: a write-only mirror, not confirmed as a silent-no-op knob.
- `client/core/SceneSetup.js:18` (`if (typeof window !== 'undefined' && !Number.isFinite(window.__fogFar)) window.__fogFar = 200`): a default written into a window global.
- `client/core/SceneSetup.js:323` (`const _far = s.fogFar ?? 200`): literal defaults for absent config, and a present but invalid value passes through unvalidated.
- `client/core/SceneSetup.js:69` (`} catch (_) { return false }`): `probeWebGL2` returns false with no log.
- `client/core/SceneSetup.js:312` (`MeshoptDecoder.useWorkers(2)`): a failure is warn-only.
- `client/core/SceneSetup.js:164` (`if (!probeWebGL2()) { const e = new Error('WebGL2 is not available'); e.code = 'NO_WEBGL2'; throw e }`) is a conforming example, not a defect. It throws a coded error, as AGENTS.md asks.
- `edge/cf-do/jolt-edge-init.js:12` (`WebAssembly.instantiate(wasmModule, imports).then(instance => {`): no rejection handler. If instantiate fails, the init promise never settles. NEEDING A CHECK: read from the source, not run under workerd.
- `edge/cf-do/spoint-do.js:63` (`server.accept()`): the socket is accepted before `_ensureCtx` is awaited, so a rejection leaves the socket unclosed. NEEDING A CHECK.
- `edge/cf-do/spoint-do.js:32` (`} catch (e) { return false }`) and `edge/cf-do/spoint-do.js:37` (`try { this.ws.close() } catch (e) {}`): both are silent.
- `edge/cf-do/accept-request.js:4` (`const DEFAULT_ROOM_BINDING = 'SPOINT_GAME_ROOM'`) and `edge/cf-do/accept-request.js:5` (`const DEFAULT_ROOM_KEY = 'probe-room'`): the probe default stays a silent production fallback when the environment value is absent.
- `edge/cf-do/accept-request.js:32` (`: refused(UPGRADE_REQUIRED_STATUS, 'expected websocket upgrade')`), `edge/cf-do/accept-request.js:43` (`return refused(NO_ROOM_BINDING_STATUS, 'no durable object binding "' + bindingName + '" on this Worker')`) and `edge/cf-do/accept-request.js:51` (`'edge Worker has no STATIC_ORIGIN configured for non-WebSocket requests'`): prose reason strings with no reason code.
- `edge/cf-do/do-client-probe.mjs:52` (`const rec = players.find(p => Array.isArray(p) && p[0] === playerId) || players[0]`): if the probe's own player is missing, it falls back to the first record, which may belong to another player. A silent default inside a manual probe.

The items below come from streams 57 and 58. They are GREP-BASED CANDIDATES, not verified defects, and they are not behaviours jayzee must reproduce.

- `src/sdk/WorldLocator.js:27` (`const requested = name === '' ? null : name`): an empty name silently means the default world.
- `src/sdk/WorldLocator.js:30` (`if (worldName == null) return { name: null, path: null }`) and `src/sdk/WorldLocator.js:37` (`if (!path) return {}`): an absent world reaches an empty definition with no refusal. NEEDING A CHECK: whether any caller reaches the `{}` path.
- `src/sdk/WorldLocator.js:38` (`.default || {})`): an absent default export is silently `{}`.
- `src/sdk/RoomPick.js:22` (`const requested = request.requestedRoom && open.find(`) and `src/sdk/RoomPick.js:23` (`if (requested) return requested`): a requested room that is not open is ignored silently.
- `src/sdk/RoomHealth.js:42` (`ratio: ticks ? overBudgetTicks / ticks : 0`): zero stands in for no ticks.
- `src/sdk/SceneImport.js:8` (`if (value == null) return [0, 0, 0]`) and `src/sdk/SceneImport.js:15` (`if (value == null) return [0, 0, 0, 1]`): an absent position or rotation becomes the origin or the identity, with no refusal. `src/sdk/SceneImport.js:37` (`object.scale ?? [1, 1, 1]`) is a literal default.
- `src/sdk/SceneImport.js:38` (`custom: object.state && typeof object.state === 'object'`): a non-object state silently becomes `{}`.
- `src/sdk/TiledImport.js:70` (`width: map.width,`): the map width is passed through unvalidated.
- `src/sdk/scaffold.js:44` (`spawnSync('bunx', ['skills', 'add', 'AnEntrypoint/spawnpoint'`): a remote package is fetched at run time with no version pin and no confirmation. A supply-chain observation for review, not a verdict.
- `src/sdk/scaffold.js:20` (`source = source.replace(ENGINE_DIR_IMPORT`): NEEDING A CHECK on whether `ENGINE_DIR_IMPORT` covers every engine directory.
- `src/sdk/RoomRouting.js:46` (`const requestedRoomId = body.requestedRoomId ?? body.requested ?? null`): two field names are accepted silently.
- `src/sdk/AgentAuthoringAPI.js:53` (`const token = process.env.SPOINT_AGENT_TOKEN`) and `src/sdk/AgentAuthoringAPI.js:54` (`if (token && req.headers['x-agent-token'] !== token) {`): if the token is unset the check is skipped, so the `/agent/` routes run unauthenticated. SECURITY CANDIDATE. Run live against spoint's handler at `d5e3860` on a loopback HTTP listener: with the token unset, a POST to `/agent/destroy-entity` with no header reaches the route and returns 404 `no such entity`, and `GET /agent/apps` returns 200. With the token set, no header or a wrong header returns 403, and the right header passes. The full `ServerAPI` dispatch was not booted, so the `/agent/` prefix guard and the `0.0.0.0` bind remain read from source.
- `src/sdk/AgentAuthoringAPI.js:83` (`try { content = getTemplateContent(template) } catch { content = null }`): any template error is reported as an unknown template.
- `src/sdk/AgentAuthoringAPI.js:122` (`const eid = (typeof id === 'string'`): an invalid or taken id is silently replaced by a generated id.
- `src/sdk/AgentAuthoringAPI.js:125` (`const pos = Array.isArray(position)`): an invalid position falls back to a default position with no refusal.
- `src/sdk/AgentAuthoringAPI.js:150` (`port: ctx?.port || 3002`): a literal default port.
- `src/sdk/AgentAuthoringAPI.js:170` (`json(res, 500, { ok: false, error: String(e?.message || e) })`): the error message is echoed to the client.
- `src/sdk/NostrAuthServer.js:21` (`arr[i] = Math.floor(Math.random() * 256)`): the challenge nonce falls back to `Math.random()` when no secure source is available. NEEDING A CHECK on reachability.
- `src/sdk/NostrAuthServer.js:9` (`catch { _nodeCrypto = false; return false }`) and `src/sdk/NostrAuthServer.js:44` (`try { transport.close() } catch {}`): silent catches.
- `src/sdk/NostrAuthServer.js:60` (`.slice(0, MAX_PUBKEY_LEN)`): the pubkey is truncated silently instead of refused.
- `src/sdk/NostrAuthServer.js:73` (`created_at: payload?.created_at || 0`) and `src/sdk/NostrAuthServer.js:74` (`kind: payload?.kind || NIP98_HTTP_AUTH_KIND`): silent defaults.
- `src/sdk/ServerPresence.js:16` (`} catch { }`): an empty catch on the identity file. NEEDING A CHECK on whether an unparsable identity file is silently replaced with a new key.
- `src/sdk/ServerPresence.js:20` (`await mkdir(join(process.cwd(), 'data')`): the failure is ignored, and the identity path is built from the working directory, not the project root.
- `src/sdk/ServerPresence.js:94` (`try { await publish('offline') } catch { }`): silent.
- `src/sdk/ServerPresence.js:99` (`publish('heartbeat').catch(() => {})`): heartbeat failures never surface.
- `src/sdk/RoomDirectory.js:8` (`throw new Error('RoomDirectory requires { sdkRoot }')`): a prose error with no reason code. The same holds for the other refusals in this module.
- `src/sdk/RoomDirectory.js:36` (`if (this._reservedPorts.has(port)) throw new Error(`): an explicit port is checked only against in-flight reservations. NEEDING A CHECK.
- `src/sdk/RoomDirectory.js:44` (`physicsRadius: worldDef.physicsRadius || 0`): silent zero defaults.
- `src/sdk/RoomDirectory.js:48` (`...opts.configOverrides,`): the spread comes last, so overrides can replace `port`, `worldPath` or `appsDirs`.
- `src/sdk/RoomDirectory.js:88` (`handle.server.stop()`): not inside a try. NEEDING A CHECK on whether a throw leaves a stale handle registered.
- `src/sdk/RoomDirectory.js:111` (`const avgTickMs = budgets.length ? ts._tickBudgetSum / budgets.length : 0`): a zero average stands in for no ticks yet.

## Stream 21: session store, stage loader and stage (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The citations were re-read from `git -C /workspace/spoint show d5e3860:<path>`, and the line counts were checked: `src/connection/SessionStore.js` has 121 lines and `src/stage/Stage.js` has 109. Nothing was written into spoint. Savi's documents name `SessionStore` 0 times and `StageLoader` 0 times.

Session store:
- The class and its TTL default: `src/connection/SessionStore.js:9` (`export class SessionStore {`) and `src/connection/SessionStore.js:11` (`this.ttl = options.ttl || 30000`).
- The expiry test skips pinned sessions: `src/connection/SessionStore.js:79` (`if (!session.pinned && Date.now() - session.lastTouched > this.ttl) {`). The timer uses the same TTL: `src/connection/SessionStore.js:92` (`}, this.ttl)`).
- Two consumers pass their own TTL: `src/sdk/WorkerEntry.js:71` (`const sessions = new SessionStore({ ttl: 60000 })`, imported at `src/sdk/WorkerEntry.js:5` (`import { SessionStore } from '../connection/SessionStore.js'`)) and `src/sdk/server.js:48` (`const sessions = new SessionStore({ ttl: config.sessionTTL || 60000 })`, imported at `src/sdk/server.js:7` (`import { SessionStore } from '../connection/SessionStore.js'`)).

Stage loader and stage:
- The config error class: `src/stage/StageLoader.js:7` (`export class StageConfigError extends TypeError {`), with its reason code at `src/stage/StageLoader.js:13` (`this.reasonCode = typeof reason?.code === 'string' ? reason.code : null`).
- The loader resolves the cluster config from the shared module: `src/stage/StageLoader.js:4` (`import { resolveClusterConfig, declaredWeaponRangeM } from '../shared/clusterConfig.js'`), calls it at `src/stage/StageLoader.js:32` (`clusterConfig = resolveClusterConfig(tcfg.clusters`), and throws when a radius is declared without enabled clusters: `src/stage/StageLoader.js:46` (`throw new StageConfigError('stage-radius-not-cluster-resolved'`). The loader class itself is at `src/stage/StageLoader.js:49` (`export class StageLoader {`).
- The stage module re-exports the flat ring height from its shapes module: `src/stage/Stage.js:6` (`export { FLAT_RING_HALF_HEIGHT_M } from './stageShapes.js'`), and the class is at `src/stage/Stage.js:8` (`export class Stage {`).

Negatives:
- A silent default on a caller's zero: `src/connection/SessionStore.js:11` uses `options.ttl || 30000`, so an explicit `ttl: 0` becomes 30000. `src/sdk/server.js:48` has the same shape with `config.sessionTTL || 60000`. Neither cited consumer passes 0. This is the silent-default shape, not a verified runtime bug.
- `git grep -l -F SessionStore d5e3860 -- scripts` lists 0 files, so no witness script names the session store.
- `git grep -l -E 'StageLoader|stage/Stage\.js' d5e3860 -- scripts` lists one file, `scripts/lib/verify-doc-claims.mjs`. No script exercises the loader's throw paths.
- Savi's `docs/FEATURESET.md`, `docs/PARITY-INPUTS.md` and `docs/JAYZEE-GAPS.md` each contain 0 matches for `SessionStore` and 0 for `StageLoader`.

These are static claims. Runtime behaviour of the session timer and the stage loader is not exercised here.

## Stream 22: static asset pipeline and bake code-version pins (spoint, read-only at `d5e3860`)

Each line gives `path:line` and the snippet at `d5e3860`. The citations were re-read from `git -C /workspace/spoint show d5e3860:<path>`. The `BAKE_INPUTS_GLB_TRANSFORM` list is at lines 25 to 29 and the `BAKE_TRANSFORMS` array has 8 records. Nothing was written into spoint, and no pin was recomputed.

Bake code-version pins:
- The pin hashes each listed file's path and its CRLF-normalised text: `src/static/BakeCodeVersion.js:9` (`export function bakeCodeVersion(relFiles) {`), `src/static/BakeCodeVersion.js:10` (`const cacheKey = relFiles.join('|')`), `src/static/BakeCodeVersion.js:13` (`const h = createHash('sha1')`), `src/static/BakeCodeVersion.js:16` (`h.update(rel)`) and `src/static/BakeCodeVersion.js:17` (`h.update(readFileSync(p, 'utf8').replace(/\r\n/g, '\n'))`).
- The GLB transform inputs are five files: `src/static/BakeCodeVersion.js:24` (`export const BAKE_INPUTS_GLB_TRANSFORM = [`), with `./GLBTransformer.js`, `./GLBDraco.js`, `./GLBKtx2.js`, `./GLBVrmPassthrough.js` and `../shared/fnv1a.js` at lines 25 to 29. The version is `src/static/BakeCodeVersion.js:136` (`export const GLB_TRANSFORM_CODE_VERSION = bakeCodeVersion(BAKE_INPUTS_GLB_TRANSFORM)`).
- The transform records start at `src/static/BakeCodeVersion.js:146` (`export const BAKE_TRANSFORMS = [`). The first record at `src/static/BakeCodeVersion.js:147` (`{ name: 'GLB_TRANSFORM', entries: ['./GLBTransformer.js'], inputs: BAKE_INPUTS_GLB_TRANSFORM, version: GLB_TRANSFORM_CODE_VERSION }`) takes its version from `inputs`, and `entries` is a separate listing. The pin therefore covers the listed input files, not their import closure.

Modules and exports:
- Draco and Meshopt helpers: `src/static/GLBDraco.js:1` (`export function hasDraco(jsonChunk) {`), `src/static/GLBDraco.js:5` (`export function hasMeshopt(jsonChunk) {`), `src/static/GLBDraco.js:60` (`export async function stripDraco(inputBuffer) {`) and `src/static/GLBDraco.js:96` (`export async function compressMeshopt(inputBuffer) {`).
- KTX2 binary and availability: `src/static/GLBKtx2.js:18` (`export const KTX_BIN = _ktxCandidates.find(p => existsSync(p)) || _ktxCandidates[0]`), `src/static/GLBKtx2.js:20` (`export function ktxAvailable() {`) and `src/static/GLBKtx2.js:40` (`export async function imageToKtx2(imageBuffer, mode = 'basis-lz', tmpBase = 'tex') {`).
- KTX2 extraction: `src/static/KTX2Extract.js:28` (`export function extractKtx2Images(transformedGlbBuf) {`), `src/static/KTX2Extract.js:53` (`export function getKtx2Extracted(srcPath) {`) and `src/static/KTX2Extract.js:92` (`export function resolveKtx2File(srcPath, imageIndex) {`).
- Progressive bake containment: `src/static/ProgressiveBake.js:199` (`export function isContainedPath(outDir, relative) {`) and `src/static/ProgressiveBake.js:205` (`export function resolveBakedFile(srcPath, relative) {`).
- The GLB transformer: `src/static/GLBTransformer.js:47` (`export function getCachePath(glbPath) {`), `src/static/GLBTransformer.js:144` (`export function getTransformed(filepath) {`), `src/static/GLBTransformer.js:150` (`export async function getTransformedHashAsync(filepath) {`), `src/static/GLBTransformer.js:157` (`export async function getTransformedAsync(filepath) {`) and `src/static/GLBTransformer.js:168` (`export async function prewarmFiles(files, label = 'referenced') {`).
- The fetch manifest: `src/static/FetchManifest.js:46` (`export async function buildManifestEntries(worldDef, project, sdkRoot) {`) and `src/static/FetchManifest.js:93` (`export async function buildFetchManifest(worldName, worldDef, project, sdkRoot) {`).
- The VRM passthrough extensions: `src/static/GLBVrmPassthrough.js:25` (`export const VRM0Passthrough = makeVrmPassthroughExtension('VRM')`) and `src/static/GLBVrmPassthrough.js:26` (`export const VRMCVrmPassthrough = makeVrmPassthroughExtension('VRMC_vrm')`).

Negatives:
- `git grep -l -F` over `scripts` at `d5e3860` finds `FetchManifest` in 0 files, `GLBDraco` 0, `GLBTransformer` 0, `GLBVrmPassthrough` 0, `KTX2Extract` 0 and `ProgressiveBake` 0. `BakeCodeVersion` is named in 4 files and `GLBKtx2` in 1.
- Savi's three documents name each of the eight modules 0 times.
- `src/static/GLBKtx2.js:18` falls back to `_ktxCandidates[0]` when no candidate exists, and that path may not exist. The guard is `ktxAvailable` at `src/static/GLBKtx2.js:20`, which checks `existsSync` first. Nothing is wrong here; this is the fallback shape.

These are static claims. The pins are not recomputed, and the KTX2 and Draco tools are not run.

## Spawn consolidated learning record (spawn-local, status per figure)

The record is `/workspace/spawn/maps/spawn-learning-record.md`, which is spawn-local and not in savi. Each figure below carries its status. "Re-derived" means this document's author re-computed it from a file named in the line; "spawn-reported" means spawn's probe or test was not re-run here.

- Manifests and frames, re-derived from the durable copy `spawn-evidence/data/manifests-all-v3-results.jsonl` (`node` over its 2580 lines): 2580 rows, 2580 status 200, 2580 eof true, 2580 framesEqualHashes true, 229921 frames, 1 gzip frame, 1 gzip decode match, 0 gzip failures, 0 raw failures, 0 hitRaw and 1 hitDec.
- Worlds with `/cdn/` GLB refs, 399, re-derived from `/workspace/spawn/maps/glb-urls-all.tsv` (2416 rows, 399 distinct worlds). The file is spawn-local.
- Unique decoded-frame keys, 11987, re-derived from spawn's `dt/keys.txt` in `/tmp/spawn-probe` (ephemeral, no durable copy here).
- Text-visible keys, 307, spawn-reported. The witness `spawn-evidence/maps/witness/encoder-bucket/encoder-test.mjs` scans `/tmp/spawn-probe` (ephemeral) and `/workspace/spawn/maps/witness`. Its re-run today gives `distinctKeys` 11987, because `/tmp/spawn-probe` now holds `dt/keys-unique.txt`. The 307 is therefore not reproduced by that script at its current inputs.
- Non-CDN data rows, 83, re-derived as the data-row count of `/workspace/spawn/maps/unverified-noncdn-refs.tsv`. Its first-pass 200 count (81) is spawn-reported.
- `/cdn/`-only probe, re-derived from `/tmp/spawn-probe/cdn-named/results.jsonl` (421 rows, ephemeral): named-cdn stripped of `.yaml` 302 for 304 rows and error for 4 (the 4 timeouts retried to 302), named-cdn with `.yaml` 401 for 10, value-sha controls 200 for 20, non-CDN rows 200 for 82 and 401 for 1. The 304 redirect targets are 304 distinct `value-origin` locations. The claim that the bytes come only from `/cdn/` is weakened for the named family and stays INFERRED.
- Gone 410 (39 probes, no body-level 410), the bucket rule (UNDETERMINED), the error keys, the mp4 retry (200 for a bounded read) and the spawnfile.io bytes (UNCONFIRMED) are spawn-reported. Network probes and bucket tests were not re-run here.

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
- 307 text-visible keys, spawn-reported and historical, durable from 38 content-addressed contributor contents. Re-run 2026-11-07: `node text-visible-307-derive-durable.mjs` in spawn's `maps/witness` reads only the 38 files in `witness/text-visible-307-inputs/` (6.6 MB, `hashMismatches` 0) and returns 307 distinct keys, 298 value keys, 9 named keys, `~2f` 614 occurrences, `~3a` 0 and `~7e` 0; `sort -u witness/text-visible-307-keys.txt | wc -l` is 307. Whether those 38 contents are the complete contributor set rests on an ephemeral mtime-cutoff scan of 1154 files, which is not durable, and the original 1173-file input is not reproduced. The encoder-test script still returns 11987 from newer files, so it does not reproduce the 307. This is a different scope.
- 11987 unique decoded-frame `world.assets` keys. `keys.txt` has 12186 lines, which is 11987 unique keys plus 199 duplicate lines. spawn-reported: its only input is the ephemeral `dt/keys.txt`.
- 2580 manifests reached. All returned status 200, and 1240 have `world.assets` keys. 1584 have a `/cdn/` slash.
- 399 worlds with `/cdn/` GLB references. This is the census denominator used elsewhere in this file and is not compared with the rows above. spawn-reported: its input is the spawn-local `glb-urls-all.tsv`, not a durable file in savi.

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
- Head drift, a single observed case and not a rule, UNVERIFIED: for world `41cd4649…` (full id `41cd46499614484ca9261ce32e257e22`), head.json (seq 553) names manifest `3fa9a4345a66f3a4ed34d6b4a0169750fa9ac4f5951ce29e5af9d008d3a5f75a`. Witnessed on 2026-11-07 with one GET: that manifest returns 200 `application/octet-stream`, 513116 bytes, so the earlier 404 `unknown_world_store_key` is NOT reproduced. The condition that selects that error is OPEN. The saved bodies hold only error text with no URL, so the condition cannot be characterised. Witnessed on 2026-11-07: `GET /world-store/git/41cd46499614484ca9261ce32e257e22/head.jsn`, a misspelled resource name under the same valid world, returns 404 `application/json`, 35 bytes, `{"error":"unknown_world_store_key"}`; the control `head.json` returns 200, 1673 bytes, naming `3fa9a434…`. The key is therefore selected here by a non-existent resource name in one request, which is not a rule for the drifted head. The scanned manifest `5a526ee6…` still returns 200.
- Head presence for the three head-present worlds, witnessed on 2026-11-07: `5db79de6dae84ceca2ddb9b9a0e216d9`, `fd80e9d941624c2fbc48fc89193a7417` and `ffb0a8fbdca948a5933be7bd62fb44b5` each return head 200 `application/json` with `"manifest":null` and `"seq":0`. The earlier manifest 404 for these three is not reproduced, because the head names no manifest to fetch.
- `head_not_found`, witnessed: `GET /world-store/git/<uuid>/head.json` returns 404 `application/json`, 26 bytes, `{"error":"head_not_found"}`, for `03ebf64172574b90ba8805e0f8a9b6d5` and for the all-zero id `00000000000000000000000000000000`. Spawn also reports `040ed504…` with the same body; that id was not re-fetched here.
- `value_not_found`, scoped observation of two absent hashes, not a rule: `GET /world-store/values/<64 zeros>` and `/<64 f>` each return 404 `application/json`, 27 bytes, `{"error":"value_not_found"}`. `GET /world-store/manifests/<64 zeros>` and `/<64 f>` each return 404 101 bytes, `{"error":"value_not_found","hash":…}`.
- Resolve-adventure, partial. Trailing-slash `/api/resolve-adventure/` returns 308 to `https://www.spawn.co/api/resolve-adventure`, with body "Redirecting...". `http://www…` returns 308 to https. `https://spawn.co…` returns 307 to `https://www.spawn.co/…`, with body "Redirecting...". No address or an empty one returns 400 `{"ok":false,"error":"Invalid query"}`. Found and not_found return 200 JSON with `result.type` `found` or `not_found`. Gone (410) was NOT reached in 22 probes, so the gone half stays OPEN. Bodies: 16 copies at `/workspace/spawn/maps/witness/ra-*.body` and `rb-*.body`.

## Scoped spawn encoder and bucket witnesses

Partial, scoped witnesses from spawn. They do not close OPEN-010 or OPEN-015. Copies are in `/workspace/spawn/maps/witness/encoder-bucket/`. The scripts read `/tmp/spawn-probe` as an ephemeral input (labelled here, not a Source path) and `/workspace/spawn/maps/witness` as the durable input.

- Encoder `/` to `~2f`: `node encoder-test.mjs` gives `distinctKeys` 307, `~2f` escapes 614, `roundTripEncodeOfDecode` 307, and `fails` []. Scope: 307 distinct keys. Spawn-reported and historical: at the current inputs the same script returns 11987.
- Encoder `:` to `~3a`: witnessed only in the FAULTS F3 sample (`spawn-engine/FAULTS.md`), not in the 307. OPEN.
- Encoder `~` to `~7e`: unwitnessed. OPEN.
- Escape-token census over the reached file-map keys, SCOPED to text-visible keys (spawn-reported; the 307 keys, the `~2f` count and the round trip were reproduced once at the earlier inputs with `spawn-evidence/maps/witness/encoder-bucket/encoder-test.mjs`; at the current inputs that script returns 11987, so the 307 is held open): distinct keys 307, `~2f` 614 occurrences, round trip 307/307, `fails` []. Spawn-reported, not re-run here: 298 keys start `~2fcdn~2fvalue.` (content-addressed) and 9 start `~2fcdn~2f` with a name rather than a sha; `~3a` is 0 of 307 reached keys (it appears only in the FAULTS F3 sample, the ASSETS.md:35 placeholder and jayzee's fixtures); `~7e` has 0 reached occurrences (only encode code and jayzee's constructed fixture at `check-spawn.mjs:50`); bare tilde 0; spawnfile host 0. The manifest sample binaries have 0 `world.assets` matches, so this census covers text-visible keys only and makes no universal claim.
- Bucket `world.assets/<xx>/`: `node bucket-test.mjs` gives 1163 files, 298 distinct (xx, sha) pairs and 135 buckets. The best of 8 tested hash rules scores 2 matches, which is chance-level, so those rules are NEGATIVE. The rule itself stays OPEN (OPEN-015).
- `node bucket-test3.mjs` over 279 keys: `frameBody` 0, `frameWhole` 0, `keyText` 0, `valueSha` 0 matches. NEGATIVE for those four.
- Five reconciled denominators, spawn-reported from spawn's consolidated audit, kept separate: 2580 manifests (re-counted from the copy manifest file, 2580 rows and 2580 unique manifest ids); 399 worlds (re-counted from `glb-urls-all.tsv`, 2416 rows); 11987 unique decoded keys, which are 11679 `~2fcdn~2fvalue.<sha>` keys plus 308 named keys with no sha; 288 maps-only keys; and 307 text-visible keys, historical. The set relation is 288 inside 307 inside 11987, with 19 keys in 307 that are not in the 288. The ten sha-based bucket counts in spawn's §5 have no script re-run and are spawn-reported only; they are not independently verified.

## Jayzee gap register

The per-row implementation gaps are in `docs/JAYZEE-GAPS.md`. It maps each FEATURESET group to its jayzee PARITY rows, quotes each open clause at jayzee `2db34a0`, and tags each gap required-in-jayzee. Rows 13 and 36 are UNVERIFIED as closed: jayzee's PARITY.md still says partial at `2db34a0`. Rows 62 to 65 are catalogs and are open.

## Feature-support contract

The feature-support contract is not duplicated here. It lives in `docs/OPEN-ITEMS.md` under "Required feature support", which is extended with the spawn learnings from this document.
