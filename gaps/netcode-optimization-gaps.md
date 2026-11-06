# Undocumented netcode, lag compensation, compression and concurrency

Survey of spoint at origin/main a85e9d8 (read-only). Every claim cites `path:line` in spoint. Each compression and lag-compensation claim is marked **verified** (read from the code, line cited) or **unverified** (not run or not located).

## 1. Coverage of src/netcode

The doc scan covered `AGENTS.md`, `README.md`, `SKILL.md`, `docs/*.md` (23 files) and `plan/*.md`. A module counts as documented when its file name appears in one of them.

- 35 modules in `src/netcode/`.
- 11 named in some doc. 24 named in none (below).

Undocumented modules, with what the code shows:

| Module | Exports | What it does |
|---|---|---|
| CollisionTileStreamer.js | createCollisionTileStreamer, COLLISION_TILE_RING, COLLISION_TILE_FORGET_RING | streams collision tiles around a player (verified: exports at file top) |
| EventLog.js | EventLog, EVENT_LOG_KINDS | append-only event log (verified: exports) |
| Hitscan.js | resolveFireRequest, rayVsCapsule, findHitLinear, findHitSpatial, DEFAULT_HITBOX | server-side hit resolution, capsule hitbox centerHeight 0.9, radiusSq 0.36, height 1.8 (verified: Hitscan.js:3, :19, :32) |
| InputGuard.js | isInputRateLimited, sanitizeInputPayload, enforceMovementEnvelope, envelopeSpeedCap | rate-limits and clamps client input (verified: InputGuard.js:5, :39, :46) |
| LockstepChecksum.js | createChecksumFold, checksumBodies | desync checksums (verified: exports) |
| LockstepGameLoop.js, LockstepInputTransport.js | createLockstepGameLoop, LOCKSTEP_DEFAULTS, INPUT_RETAIN_TICKS | RTS lockstep loop and input transport (verified: exports) |
| NetcodeProfile.js | NETCODE_PROFILES, resolveNetcodeProfile, DEFAULT_MIN_PEERS | profile selection; `docs/netcode.md` documents the profiles but not this file |
| OutlierDetector.js | recordHit | flags suspicious hit patterns into the event log (verified: OutlierDetector.js:16) |
| PeerSimSession.js, peerLoops.js | createPeerSimSession, PEER_LOOP_FACTORIES | simulated peers for testing (verified: exports) |
| ReplayFile.js, ReplayRecorder.js, ReplayPlayer.js | encodeReplay, decodeReplay, SPOINTREPLAY_MAGIC, SPOINTREPLAY_VERSION | replay format and recorder/player (verified: exports) |
| RewindSpatialIndex.js | RewindSpatialIndex, buildLiveIndex, REWIND_SLOP = 10, DEFAULT_REWIND_CELL_SIZE = 16 | spatial index for rewound positions (verified: RewindSpatialIndex.js:1, :78) |
| RollbackGameLoop.js, RollbackInputTransport.js, RollbackLoop.js | createRollbackGameLoop, ROLLBACK_DEFAULTS | rollback loop and transport (verified: exports) |
| SnapshotBinFormat.js, SnapshotPacker.js | packBinRecord, packQuat, snapshotPackCounts, packSnapshotBytes | binary snapshot wire format and packer (see section 3) |
| TeleportHold.js | beginTeleportHold, stepTeleportHold, TELEPORT_HOLD_MAX_MS | holds state across a teleport (verified: exports) |
| TickSystemBase.js | TickSystemBase | base tick system (verified: export) |
| WorkerBridgeProxy.js | createWorkerBridgeProxy | proxy into a worker (verified: export) |
| controlFrame.js | encodeControlFrame, parseControlFrame, dispatchControlFrame, createFrameClock | control-frame encoding and clock (verified: exports) |

Nothing in the docs explains the control-frame prefixes, the replay file format, or the relation between the three loops and the three netcode profiles beyond `docs/netcode.md`'s headings.

## 2. Lag compensation

Verified from `src/netcode/LagCompensator.js` and `src/netcode/Hitscan.js`:

- **History ring:** `HISTORY_CAPACITY = 256` samples per player (LagCompensator.js:3). Writes past capacity overwrite the oldest sample (LagCompensator.js:74-80).
- **Window:** `historyWindow` is in milliseconds. `windowTicks = round(historyWindow * tickRate / 1000)` (LagCompensator.js:51). Default `historyWindow` is 1000 ms (LagCompensator.js:38), which is 60 ticks at the default 60 Hz tick rate (LagCompensator.js:4).
- **Environment override:** `SPOINT_LAG_HISTORY_WINDOW` sets the window (LagCompensator.js:15). It is not in any doc (0 hits).
- **Future reports:** a reported tick more than `FUTURE_TOLERANCE_TICKS = 1` ahead of the current tick is rejected (LagCompensator.js:97).
- **Past reports:** a reported tick older than the window is clamped to the oldest allowed tick (LagCompensator.js:98-99).
- **Rewind rate limit:** a token bucket per shooter, capacity 10, refill 20 per second (LagCompensator.js:6-7, :105-106).
- **Origin drift:** `validateShotOrigin` allows a client origin up to 2 m from the shooter by default (LagCompensator.js:8, :138).
- **Interpolation:** samples between two ticks are blended with `nlerpQuat` (LagCompensator.js:23, :131).

**Finding (verified by running, `/tmp/lag-overflow/run.mjs`):** the ring holds 256 samples, about 4.27 s at 60 Hz. Driven with 300 samples at 60 Hz:
- Window 4000 ms (240 ticks): ring not full (242 samples). A rewind to tick 0 is clamped to 59, the clamp counter rises by 1, and the returned sample is the stored tick 58.
- Window 5000 ms (300 ticks): ring full (256 samples), oldest stored tick 44. A rewind to tick 0 resolves to 0, the clamp counter does **not** rise, and `rewindAtTick` returns the tick 44 sample. The overflow is silent.
- Window 4267 ms (256 ticks): ring full, oldest stored tick 44. The clamp target is 43 and the counter rises by 1, but the returned sample is tick 44, one tick off the clamp target.
- `rewindAtTick` returns the requested tick in its `tick` field, not the stored sample's tick. The position shows the stored sample.

Undocumented: the drift limit, the rewind bucket, the future tolerance, and the env override.

## 3. Compression and wire format

Verified from `src/netcode/SnapshotBinFormat.js` and `src/netcode/SnapshotEncoder.js`:

- **Bin record:** `BIN_RECORD_BYTES = 29` (SnapshotBinFormat.js:4). Player bin record: `PLAYER_BIN_RECORD_BYTES = 22` (SnapshotBinFormat.js:78).
- **Quaternion:** `packQuat` uses a smallest-three layout (SnapshotBinFormat.js:106-120). The largest component is stored as a 2-bit index. The other three are stored as 10-bit fields, scaled by `QSCALE = 511 * sqrt(2)` (SnapshotBinFormat.js:2). The packed word is 32 bits (SnapshotBinFormat.js:21).
- **Range checks:** position is clamped to a signed 32-bit wire range (`POS_I32_MAX`, SnapshotBinFormat.js:5, :18). Velocity is clamped to i16 (SnapshotBinFormat.js:17). Scale is clamped to u16 (SnapshotBinFormat.js:6, :19). A non-finite or out-of-range value throws `RangeError` (SnapshotBinFormat.js:12-14).
- **Reduced tier:** `PLAYER_TIER_REDUCED = 1` (SnapshotBinFormat.js:40). Pose fields and a height-absent flag exist (`REDUCED_POSE_FIELDS`, `REDUCED_HEIGHT_ABSENT`).
- **Pitch and yaw:** pitch is quantised to one byte over [-π/2, π/2]. Yaw is quantised to one byte over a full turn, and the two are packed into one 16-bit field (SnapshotEncoder.js:24-27).
- **Self block:** the viewer's own input sequence, input depth, ground normal and wall planes are sent in a self block (SnapshotEncoder.js:30-39).
- **Memoised head:** `snapshotHead` probes the live packer once per type and memoises it for the process, so it is valid only while `WIRE_STRUCTURES` in `src/protocol/msgpack.js` is fixed (SnapshotPacker.js header comment, verified).
- **Packer memo:** player records are packed once and copied into each viewer's bytes (SnapshotPacker.js header comment, verified).

`WIRE_UNITS_PER_METER` is defined at `src/netcode/SnapshotBinFormat.js:1` as `100`. Every use in spoint (12 lines, verified by gm's grep verb on `src/`) is in the same file: lines 5, 6, 7, 8, 9, 13, 50, 51, 64, 66 and 101. No other directory uses it. The gm grep verb returned no matches when given the whole `/workspace/spoint` root, so that search was unreliable; the per-directory searches are the valid ones.

Wire record sizes checked by running (`/tmp/wire-layout/check.mjs`): `BIN_RECORD_BYTES` = 29, `PLAYER_BIN_RECORD_BYTES` = 22, and both pack functions allocate the stated lengths. RESULT: PASS 5 wire-layout assertions hold.

Doc coverage: `docs/performance-optimization.md` Part 9 mentions unoptimised snapshots and Part 6 Example 4 mentions snapshot compression for 20+ players, but no doc gives the bit layouts above (`packQuat`, `BIN_RECORD_BYTES`, the reduced tier, the self block) or the byte budgets.

## 4. Systems optimization

Documented: `docs/performance-optimization.md` covers frame budget, profiling, physics pooling, LOD and snapshot size for creators. `docs/performance.md` holds measured findings for one terrain case.

Not documented (no hits for these terms in the docs scan):

- The per-player history ring and its 256-sample cap (section 2).
- `SnapshotPacker`'s per-type memo and the rule that it is valid only while the wire structures are fixed.
- `CollisionTileStreamer` ring sizes (`COLLISION_TILE_RING`, `COLLISION_TILE_FORGET_RING`).
- `RewindSpatialIndex` cell size (16) and slop (10).
- The worker bridge (`WorkerBridgeProxy.js`) and the tick base (`TickSystemBase.js`).

## 5. Subagent concurrency

Spoint's docs have no mention of subagent concurrency (0 hits for "subagent" and "maxInflight" across the docs scan). The concurrency rules live in gm, not in spoint.

Verified from gm's served skill and run events during this session: the run log reports `maxInflight: 8` by default, and a body that runs past its budget becomes a background run (from the gm skill's text, read via ReadMcpResourceTool). Neither is written down in spoint.

## 6. Open items for the owner

1. Decide whether `docs/netcode.md` gets a section for the 24 undocumented modules, or whether a generated index is enough.
2. Overflow confirmed by running (section 2). Decide whether to size the ring from the window, or clamp the window to 255 ticks.
3. `WIRE_UNITS_PER_METER` located and used only in `SnapshotBinFormat.js` (section 3). Decide whether to document the wire scale.
4. Decide whether the wire layouts belong in a doc or only in the code comments.
5. Document the gm concurrency defaults in spoint, or link to gm.
