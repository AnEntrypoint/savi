# Documented featureset: savi and spoint parity

This is the durable featureset for the jayzee <-> spoint parity work, with savi's documented surface and spawn's learnings. It is folded from `docs/PARITY-INPUTS.md`, which is the orchestrator's relay. Every /workspace path below was checked to exist. Figures are marked REPRODUCED when a count was re-run in this checkout, or NOT REPRODUCED when the relayed number could not be re-derived with a simple count. `/tmp/spoint-parity/*` and `/tmp/spawn-probe/*` are ephemeral provenance, not sources.

Parity relationship: jayzee <-> spoint, plus savi's documented featureset and spawn's learnings. Both jayzee and spoint are unrelated to oscraft. Naming parity is not required and may be idealized. Feature parity is required: everything spawn is learning must be supported, and everything spoint has made must be implemented in jayzee. The feature-support contract (boot chain, GLB probing, endpoints, and so on) lives in `docs/OPEN-ITEMS.md` under "Required feature support" and is extended there, not duplicated here.

## Documented featureset: /workspace/savi

Sources: `ENDPOINTS.md`, `scripts/openapi.json`, `.spawn/reference/http/CATALOG.md`, `.spawn/reference/http/api-types.md`, `spawn-engine/ASSET_SHAPES.md`, `spawn-engine/FEED_SCOPE.md`, `spawn-engine/PROJECT_ASSETS.md`, `spawn-engine/ASSETS.md`, `spawn-engine/FAULTS.md`, `.spawn/reference/README.md`, `.spawn/reference/tome/INDEX.md`, `.spawn/reference/skills/INDEX.md`, `.spawn/reference/engine-deep/`, `gaps/netcode-optimization-gaps.md`, `gaps/morluto-rea-pr-9234-ci-findings.md`, `.spawn/reference/COVERAGE.md`, `scripts/build-manual.mjs`, `scripts/check-manual.mjs`, `.github/workflows/publish.yml`.

- Endpoints: `ENDPOINTS.md` names 93 endpoints from an OpenAPI 3.1.0 spec. The breakdown is 39 published, 21 per-game or per-id, 3 disabled, 30 not in the spec. The header says 62 paths while the sections sum to 63. The 93 total reconciles. (REPRODUCED: "93" appears in `ENDPOINTS.md`. Full breakdown is recorded as OPEN-001 and OPEN-003.)
- HTTP doors: `CATALOG.md` has 70 doors, 17 exercised GETs and 53 documented but not exercised. (NOT REPRODUCED: a simple GET-line count gives 35. Method unknown.)
- API types: `api-types.md` has 305 type names and `ASSET_SHAPES.md` has 308. They come from different fetches and scopes (OPEN-002). (NOT REPRODUCED: `api-types.md` has no lines matching `^#`, `^|`.)
- Feed: `FEED_SCOPE.md` walked 3,421 projects and 66 engine versions with offset steps of 22. (REPRODUCED: "3421" or "3,421" appears in `FEED_SCOPE.md`.)
- Assets: `PROJECT_ASSETS.md` counted 395 distinct asset URLs in 4 URL families. (REPRODUCED: "395" appears in `PROJECT_ASSETS.md`.)
- Tome: 69 section files in `.spawn/reference/tome/sections/`, including 21 `builtin-*` sections (REPRODUCED). The relay says `INDEX.md` has 68 headings (NOT REPRODUCED: the heading format did not match a simple count).
- Skills: the relay says 23 served skills (NOT REPRODUCED: `.spawn/reference/skills/` has 47 entries and the format is not settled).
- Builtin modules: the owner directive says 23. The local corpus enumerates 21 unique `builtin/` names, and `block-shape` is not a module. This is OPEN-028 and stays UNVERIFIED.
- Reference index: the relay says `reference/README.md` indexes 208 files (NOT REPRODUCED: a simple count of `.md` references gives 66). `COVERAGE.md` records 26 verbatim job gaps and 5 open items.
- Completeness contract: `build-manual.mjs` generates `site/`. `check-manual.mjs` proves raw sha equality, displayed-text equality, link resolution, `.nojekyll`, seven workflow markers, manifest counts and manifest commit equal to HEAD. `publish.yml` builds and checks on every push to main, then deploys to Pages. Withheld from publication: `.spawn/reference/http/raw/`, `sources/`, `runs/`, `.playwriter/`, `site/`.
- Netcode gaps: `gaps/netcode-optimization-gaps.md` documents 24 undocumented `src/netcode/` modules, a verified silent ring-overflow bug, the wire scale and five owner improvements (OPEN-024, HELD-OWNER). `gaps/morluto-rea-pr-9234-ci-findings.md` records PR 9234 CI findings.

## Documented featureset: /workspace/spoint

Verified read-only at `d5e3860`: 2,233 commits (REPRODUCED), 2,293 tracked files (REPRODUCED), 0 status lines (REPRODUCED), 20 `.md` pages under `docs/` (REPRODUCED; 22 files total), 103 PRD rows in `.gm/prd.yml` (REPRODUCED; fixed 34, refuted 28, retired 26, open 15), 142 files in `work/rows/` (REPRODUCED), 76 tracked verdict paths.

- Protocol: `src/protocol/MessageTypes.js` (WIRE_PROTOCOL_VERSION 5, opcodes 0x01..0xc7, unreliable set, disconnect reasons), `msgpack.js` WIRE_STRUCTURES, `InputCodec.js`, `ComponentSchema.js`, `CursorEventStream.js`, `EventEmitter.js`.
- Netcode: `SnapshotBinFormat.js` (29-byte records, 22-byte player records, smallest-three quaternion), `SnapshotEncoder/Packer/NetworkState`, `ReplayFile` (magic `spointreplay`, v2), `LagCompensator/Hitscan/RewindSpatialIndex`, `CheatEjection/DesyncDetector/ConsensusVoter/EventLog/InputGuard/OutlierDetector/LockstepChecksum`, Lockstep*, Rollback*, `PeerSimSession`, `NetcodeProfile`, `ReplayRecorder/Player`, `TickSystem`, `PlayerManager`, `PhysicsIntegration`, `CollisionSystem`.
- Client: `PredictionEngine`, `ReconciliationEngine`, `SnapshotProcessor/Timeline`, `PredictionChart`, `interpolation`, `ClockSync`, `ChartEpochSync`, `ReconnectManager`, `TransportMigrationTrigger`.
- Transport: WebSocket, WebTransport/QUIC datagrams, Wireweave/WebRTC, Worker postMessage, `NetworkSimTransport`, `TransformRing`.
- Sharding: `Cluster*`, `Region*`, `ClusterHandoff`, `ShardingRefusal`.
- SDK and server: `ServerAPI`, `AgentAuthoringAPI`, `StaticHandler`, `DevHmr`, `RoomOrchestratorHttp`, `RoomDirectory/Pick/Routing/Health/Log`, `ServerPresence/Identity`, `NostrAuthServer`, `cronSchedule`, `llmJobs`, `UploadHandler`, `MinimapBake`, `WorldPersistence`, `PrefabLibrary/Spawner`, `SceneImport/TiledImport`, `WorldLocator`.
- Physics: Jolt World wrapper, `CharacterManager`, `ShapeBuilder`, `StaticTileIndex`, `FlightModel`, `VehiclePhysics`, Draco and Meshopt decompressors.
- Terrain: 21+ files including `PlanetFrame`, `ChartReanchor*`, `CaveSDF/CavePatches/CaveMeshes`, `GrassPlacementLod`, `BiomeOverride`, `ClimateCache`.
- Apps: `src/stdlib-apps/` has 29 entries (files and directories). The relay says 31 built-in placed apps (NOT REPRODUCED). `apps/world/` has 13 `.js` files including `index.js` (REPRODUCED). `apps/maps/` has 16 entries (REPRODUCED).
- Packages: `mapspinner/` (planet and terrain renderer), `streaming-gltf/` (EP_progressive_lod schemas), `ecs/`, `spoint-core/` (Rust scaffold).
- Game systems: `AbilityTree/QuestSystem/ProgressionSystem/StatsSystem/EventChainManager`; `src/animation/`; `src/pathfinding/` (`NavmeshQuery`, `ChartNavmeshQuery`, `RecastIntegration`).
- Client surfaces: `client/editor/`, `client/hud/`, `client/xr/`, `client/core/` (WebGPU and WebGL postFX, shadow, cascade and quality governors), `client/landing/`.
- Edge, deploy and shell: `edge/cf-do/`, `src-tauri/`, `bin/`, `scripts/` (193 top-level entries, REPRODUCED). The relay says 115 `witness*.mjs` and 6 `harness*.mjs` (NOT REPRODUCED: a recursive count gives 7 `witness*.mjs` and 0 `harness*.mjs`).
- `.gm/witness-out/savi-spawn-feature-gap.md` is a 60-claim gap report: 47 implemented, 13 remaining. The 47 are not independently verified.

## Documentation streams relayed from the spoint peer

The durable equivalents are the /workspace paths above and `/workspace/spoint/.gm/witness-out/`.

- Streams 1 to 6: the inventory artifacts (`INVENTORY.md`, `FAMILIES.md` with 19 families and 107 paths, `GAPS.md`, `prd-matrix.json` with 15 of 15 open rows, STALE 11, DOC-ONLY 2, REAL 2, and 5 non-PRD real gaps, `parity-crossmap.json`). The `check-refs` gap is two `package.json` refs to an absent `scripts/bundle-freshness-witness.mjs`. These artifacts live in `/tmp/spoint-parity/`, which is ephemeral provenance.
- Stream 7: CHARTEST-est-s1-3 is confirmed REAL at `src/terrain/PlanetFrame.js` `installGroundSource`, line 348 (verified). `src/netcode/LagCompensator.js` lines 6 and 7 hold `REWIND_BUCKET_CAPACITY = 10` and `REWIND_REFILL_PER_SEC = 20` (verified). `InputGuard` refills at 90 per second, at `src/netcode/InputGuard.js` line 2 (verified).
- Stream 8: the 13 unchecked savi and spawn gap claims, and the Wave C refinement. The delivery documents `.gm/WAVE_C_COMPLETION_SUMMARY.md` and `.gm/MODEL_BROWSER_DELIVERY.md` exist. Implementation is unverified.
- Stream 9: sandbox and static-serving surface. SES fails closed with `SandboxUnavailableError` at `src/sdk/SESCompartmentEvaluator.js:81` (verified). Timing-safe compare is at `src/sdk/authCompare.js:10` (verified). COEP `require-corp` is at `src/sdk/StaticHandler.js:108` (verified). Path containment is at `src/sdk/StaticHandler.js:149` (verified).
- Stream 10: the final cross-map counts and refreshed witnesses. PRD matrix 15 of 15, check-gaps PASS, chartest GAP-CONFIRMED, check-families 19 / 107 / 0, check-refs exit 1. These are peer-reported witnesses. The PRD counts were reproduced above.

## spawn's FINAL scan corrections

Scoped to the scanned sets. Sources: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/spawn/maps/glb-urls-all.tsv`, `/workspace/spawn/maps/head404-confirmed-worlds.txt`, `/workspace/spawn/maps/head-present-manifest404-worlds.txt`, `/workspace/spawn/maps/unverified-noncdn-refs.tsv`. The spawnfile probe output at `/tmp/spawn-probe/sf/` is ephemeral.

- Full spawnfile-family scan: 16 of 16 shards, 2,848 worlds, 0 refs, 0 worlds, 0 unique URLs. This is scoped to the scanned set and is not a proof of universal absence (OPEN-007, INFERRED).
- `/cdn/` family: 2,416 verified GLB refs across 399 worlds, 2,355 unique sha256, each HEAD 200 `model/gltf-binary` with glTF magic. 2,416 is a LOWER BOUND for that family only (OPEN-006).
- Missing heads: head404 total 256, all inside the earlier 259 list. The 259 list over-counts by 3 head-present missing-manifest worlds: `5db79de6dae84ceca2ddb9b9a0e216d9`, `fd80e9d941624c2fbc48fc89193a7417`, `ffb0a8fbdca948a5933be7bd62fb44b5`. The correct missing-head count is 256. The original list is kept as recorded (OPEN-011).
- head status 0 once: world `9f7b1a067caa46e2b2c1c7dceb48bc2b`, re-check HEAD 200, transient. Manifest 404 three times, with head.json 200 on re-check (OPEN-012).
- Non-CDN refs: 83 first-seen status 0, 81 resolved HEAD 200 on retry, 2 open (ttf 401 credentialed; mp4 connection timeout). `unverified-noncdn-refs.tsv` has 84 lines including the header, which is 83 data rows (OPEN-013, OPEN-014).
- Still OPEN: the full spawnfile key path is ELIDED (`spawn-engine/FAULTS.md` F3 shows `world.assets/3d/https~3a~2f~2fspawnfile.io~2f…glb.yaml` with no complete example). spawnfile.io bytes are UNCONFIRMED. "All GLBs on /cdn/" is INFERRED. The `world.assets/<xx>/` bucket rule is UNDETERMINED after 74 tested pairs. The name encoder is decode-only. Resolve redirect and gone bodies, and manifest frames after the sheet, are not captured (OPEN-008, OPEN-010, OPEN-015, OPEN-016).
- Scoped Observation under OPEN-009, UNVERIFIED: one live `lanmower/deepfall` page, filtered on `/spawnfile|bigspawn/`, hit `rqr3rdr46-playco.spawnfile.io`, `blob:` URLs and `play.bigspawn.net` with `glbLike: []` over 30 requests. This is one page, not a family scan, and it does not contradict the 0 refs over 2,848 worlds.
