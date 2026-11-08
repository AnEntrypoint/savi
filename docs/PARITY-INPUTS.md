# Parity inputs

Provenance: orchestrator relay of witnessed peer reports on 2026-11-07. These inputs were originally delivered as peer messages, not as files. Verify each claim against the cited path before folding it into the documented featureset. `/tmp/spoint-parity/*` artifacts are ephemeral and must be cited only as provenance, never as a source.

## Owner directives

- "ok jayzee has made its initial version, push it all the way to spoint parity and savi parity".
- "communicate continuous documentation expansion and improvements to savi that we can get from spoint, we want savi to help the jayzee agent by expanding its work to parity with savis documented featureset, naming parity is not required and can be idealized but feture expansion to at least support everything spawn it learning is non negotiable, must be documented by savi or in ../savi, must be implemented in jayzee, as well as everything that spoint has made, and lives in ../spoint".
- "jayzee is unrelated to oscraft, its a spoint remake".
- "spoint is unrelated to oscraft".
- "we want the fx agent to roll out all the functionality it can observe in its own environment in its repo".

The parity relationship is jayzee <-> spoint, plus savi's documented featureset and spawn's learnings. Both jayzee and spoint are unrelated to oscraft. Naming parity is not required and may be idealized; feature parity is required.

## Documented featureset: /workspace/savi

Source paths: `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/scripts/openapi.json`, `/workspace/savi/.spawn/reference/http/CATALOG.md`, `/workspace/savi/.spawn/reference/http/api-types.md`, `/workspace/savi/spawn-engine/ASSET_SHAPES.md`, `/workspace/savi/spawn-engine/FEED_SCOPE.md`, `/workspace/savi/spawn-engine/PROJECT_ASSETS.md`, `/workspace/savi/spawn-engine/ASSETS.md`, `/workspace/savi/spawn-engine/FAULTS.md`, `/workspace/savi/.spawn/reference/README.md`, `/workspace/savi/.spawn/reference/tome/INDEX.md`, `/workspace/savi/.spawn/reference/skills/INDEX.md`, `/workspace/savi/.spawn/reference/engine-deep/`, `/workspace/savi/gaps/netcode-optimization-gaps.md`, `/workspace/savi/gaps/morluto-rea-pr-9234-ci-findings.md`, `/workspace/savi/.spawn/reference/COVERAGE.md`, `/workspace/savi/scripts/build-manual.mjs`, `/workspace/savi/scripts/check-manual.mjs`, `/workspace/savi/.github/workflows/publish.yml`.

- `ENDPOINTS.md` names 93 endpoints from an OpenAPI 3.1.0 spec with 62 paths: 39 in the published spec, 21 per-game or per-id, 3 disabled, 30 not in the spec. The header says 62 paths while published sections sum to 63; the 93 total and four headings reconcile.
- `CATALOG.md` has 70 HTTP doors: 17 exercised GETs and 53 documented but not exercised. `api-types.md` has 305 API type names; `ASSET_SHAPES.md` says 308. These are different fetches and scopes.
- `FEED_SCOPE.md` walked 3,421 projects and 66 engine versions with offset steps of 22. `PROJECT_ASSETS.md` counted 395 distinct asset URLs in 4 URL families.
- Tome: `INDEX.md` has 68 headings and 69 section files. Skills: 23 served skills. Builtin modules: the owner directive says 23; the local corpus enumerates 21 unique `builtin/` names (21 `builtin-*.md` sections matching 21 `| builtin/` table rows). `block-shape` appears in 4 reference files with no section or table row, so it is not a module. OPEN-028 records that the owner's 23 is not reproducible locally.
- `reference/README.md` indexes 208 files. `COVERAGE.md` records 26 verbatim job gaps and 5 open items.
- Completeness contract: `build-manual.mjs` generates `site/`, `check-manual.mjs` proves raw sha equality, displayed-text equality, link resolution, `.nojekyll`, seven workflow markers, manifest counts and manifest commit == HEAD; `publish.yml` builds and checks on every push to main, then deploys to Pages. Withheld from publication: `.spawn/reference/http/raw/`, `sources/`, `runs/`, `.playwriter/`, `site/`.
- `gaps/netcode-optimization-gaps.md` documents 24 undocumented `src/netcode/` modules, a verified silent ring-overflow bug, the wire scale and five owner improvements. `gaps/morluto-rea-pr-9234-ci-findings.md` records PR 9234 CI findings.

## Documented featureset: /workspace/spoint

Source paths: `/workspace/spoint/AGENTS.md`, `/workspace/spoint/DESIGN.md`, `/workspace/spoint/SKILL.md`, `/workspace/spoint/docs/`, `/workspace/spoint/src/`, `/workspace/spoint/client/`, `/workspace/spoint/apps/`, `/workspace/spoint/packages/`, `/workspace/spoint/bin/`, `/workspace/spoint/scripts/`, `/workspace/spoint/.gm/prd.yml`, `/workspace/spoint/.gm/witness-out/spawn-feature-gap.md`. Verified read-only at `d5e3860`: 2,233 commits, 2,293 tracked files, 20 docs pages, 103 PRD rows (fixed 34 / refuted 28 / retired 26 / open 15), 142 files in `work/rows/`, 76 tracked verdict paths.

- Protocol: `MessageTypes.js` (WIRE_PROTOCOL_VERSION 5, opcodes 0x01..0xc7, unreliable set, disconnect reasons), `msgpack.js` WIRE_STRUCTURES, `InputCodec.js`, `ComponentSchema.js`, `CursorEventStream.js`, `EventEmitter.js`.
- Netcode: `SnapshotBinFormat.js` (29-byte records, 22-byte player records, smallest-three quaternion), `SnapshotEncoder/Packer/NetworkState`, `ReplayFile` (magic `spointreplay`, v2), `LagCompensator/Hitscan/RewindSpatialIndex`, `CheatEjection/DesyncDetector/ConsensusVoter/EventLog/InputGuard/OutlierDetector/LockstepChecksum`, Lockstep* / Rollback* / `PeerSimSession` / `NetcodeProfile`, `ReplayRecorder/Player`, `TickSystem`, `PlayerManager`, `PhysicsIntegration`, `CollisionSystem`.
- Client: `PredictionEngine`, `ReconciliationEngine`, `SnapshotProcessor/Timeline`, `PredictionChart`, `interpolation`, `ClockSync`, `ChartEpochSync`, `ReconnectManager`, `TransportMigrationTrigger`.
- Transport: WebSocket, WebTransport/QUIC datagrams, Wireweave/WebRTC, Worker postMessage, `NetworkSimTransport`, `TransformRing`.
- Sharding: `Cluster*`, `Region*`, `ClusterHandoff`, `ShardingRefusal`.
- SDK/server: `ServerAPI`, `AgentAuthoringAPI`, `StaticHandler`, `DevHmr`, `RoomOrchestratorHttp`, `RoomDirectory/Pick/Routing/Health/Log`, `ServerPresence/Identity`, `NostrAuthServer`, `cronSchedule`, `llmJobs`, `UploadHandler`, `MinimapBake`, `WorldPersistence`, `PrefabLibrary/Spawner`, `SceneImport/TiledImport`, `WorldLocator`.
- Physics: Jolt World wrapper, `CharacterManager`, `ShapeBuilder`, `StaticTileIndex`, `FlightModel`, `VehiclePhysics`, Draco/Meshopt decompressors.
- Terrain: 21+ files including `PlanetFrame`, `ChartReanchor*`, `CaveSDF/CavePatches/client/core/CaveMeshes`, `GrassPlacementLod`, `BiomeOverride`, `ClimateCache`.
- Apps: `src/stdlib-apps/` 31 built-in placed apps; `apps/world/` 13 `.js` files including `index.js`, so 12 world definitions; ~40 app demos.
- Packages: `mapspinner/` (planet/terrain renderer), `streaming-gltf/` (EP_progressive_lod schemas), `ecs/`, `spoint-core/` (Rust scaffold).
- Game systems: `AbilityTree/QuestSystem/ProgressionSystem/StatsSystem/EventChainManager`; `src/animation/`; `src/pathfinding/` (`NavmeshQuery`, `ChartNavmeshQuery`, `RecastIntegration`).
- Client: `client/editor/`, `client/hud/`, `client/xr/`, `client/core/` (WebGPU/WebGL postFX, shadow/cascade/quality governors), `client/landing/`.
- Edge/deploy/shell: `edge/cf-do/`, `src-tauri/`, `bin/`, `scripts/` (193 top-level entries, 115 `witness*.mjs`, 6 `harness*.mjs`), 16 GLB maps in `apps/maps/`.
- `.gm/witness-out/spawn-feature-gap.md` is a 60-claim gap report: 47 implemented, 13 remaining. The 47 are not independently verified.

## Documentation streams relayed from the spoint peer

These were peer messages, not files; the durable equivalents are the /workspace paths above and `/workspace/spoint/.gm/witness-out/`.

- Streams 1-6: the spoint inventory artifacts (`INVENTORY.md`, `FAMILIES.md` 19 families / 107 paths, `GAPS.md`, `prd-matrix.json` 15/15 open rows with STALE 11 / DOC-ONLY 2 / REAL 2 and 5 non-PRD real gaps, `parity-crossmap.json`), the `check-refs` gap (two package.json refs to an absent `scripts/bundle-freshness-witness.mjs`), gap naming and PRD matrix classes.
- Stream 7: CHARTEST-est-s1-3 confirmed REAL at `src/terrain/PlanetFrame.js` `installGroundSource` line 348; `src/netcode/LagCompensator.js` lines 6-7 `REWIND_BUCKET_CAPACITY=10` and `REWIND_REFILL_PER_SEC=20`, plus `InputGuard` 90/s at line 2.
- Stream 8: the 13 unchecked savi/spawn gap claims and the Wave C refinement — delivery docs `.gm/WAVE_C_COMPLETION_SUMMARY.md` and `.gm/MODEL_BROWSER_DELIVERY.md` exist, implementation unverified.
- Stream 9: spoint sandbox and static-serving surface — SES fails closed with `SandboxUnavailableError` at `src/sdk/SESCompartmentEvaluator.js:81`, timing-safe compare at `src/sdk/authCompare.js:10`, COEP `require-corp` at `src/sdk/StaticHandler.js:108`, path containment at `:149`.
- Stream 10: the final cross-map counts at the time plus refreshed witnesses (PRD matrix 15/15, check-gaps PASS, chartest GAP-CONFIRMED, check-families 19/107/0, check-refs exit 1).

## spawn's FINAL scan corrections

Source paths: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/spawn/maps/glb-urls-all.tsv`, `/workspace/spawn/maps/head404-confirmed-worlds.txt`, `/workspace/spawn/maps/head-present-manifest404-worlds.txt`, `/workspace/spawn/maps/unverified-noncdn-refs.tsv`, `/tmp/spawn-probe/sf/spawnfile-scan-*.jsonl` (ephemeral probe output).

- Full spawnfile-family scan: 16/16 shards, 2,848 worlds, 0 refs / 0 worlds / 0 unique URLs. This is scoped to the scanned set, not a proof of universal absence.
- `/cdn/` family: 2,416 verified GLB refs across 399 worlds, 2,355 unique sha256, each HEAD 200 `model/gltf-binary` with glTF magic. 2,416 is a LOWER BOUND for that family only.
- Missing-head reconciliation: head404 total 256, all 256 inside the earlier 259 list, 0 outside. The 259 list over-counts by 3 head-present missing-manifest worlds: `5db79de6dae84ceca2ddb9b9a0e216d9`, `fd80e9d941624c2fbc48fc89193a7417`, `ffb0a8fbdca948a5933be7bd62fb44b5`. Correct missing-head count is 256; the original `open-missing-head-worlds.txt` is kept as recorded.
- head status 0 x1: world `9f7b1a067caa46e2b2c1c7dceb48bc2b`, re-check HEAD 200, transient. manifest 404 x3 had head.json 200 on re-check.
- Non-CDN refs: 83 first-seen status 0, 81 resolved HEAD 200 on retry, 2 open (ttf 401 credentialed; mp4 connection timeout); `unverified-noncdn-refs.tsv` has 84 lines including the header = 83 data rows.
- Remains OPEN: full spawnfile key path ELIDED (`FAULTS.md` F3 shows `world.assets/3d/https~3a~2f~2fspawnfile.io~2f…glb.yaml` with no complete example); spawnfile.io bytes UNCONFIRMED; "all GLBs on /cdn/" INFERRED; `world.assets/<xx>/` bucket rule UNDETERMINED after 74 tested pairs; name encoder decode-only; resolve redirect/gone bodies and manifest frames after the sheet not captured.
- The live `lanmower/deepfall` probe hit spawnfile.io hosts (`rqr3rdr46-playco.spawnfile.io`, blob: URLs) and play.bigspawn.net with `glbLike: []` over 30 requests. This is ONE page with a `/spawnfile|bigspawn/` filter caveat, not a family scan; record as a scoped Observation under OPEN-009, UNVERIFIED.

## Feature-support contract already in the register

`/workspace/savi/docs/OPEN-ITEMS.md` has a "Required feature support" section listing the spawn boot chain, `~2f`/`~3a` file-map escapes, `/cdn/value.<sha>.<ext>` content-addressed GLBs with sha256 + glTF magic + HEAD 200, 16-shard HEAD/Range probing with retry, tolerance of 256 missing heads, bounded-offset feed enumeration, address->worldId/appId/creator resolution, creator profiles with no direct GLB URLs, world-store JSON values vs binary /cdn/ assets, local store names, `derivedGeometry shards:16`, LOD 1.3.0, and the 93 endpoints / 23 skills / 68 Tome headings / 23 builtin modules. Extend that section rather than duplicating it.
