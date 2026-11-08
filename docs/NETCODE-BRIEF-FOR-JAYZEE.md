# Netcode brief for jayzee

Owner decisions on the five netcode items in `gaps/netcode-optimization-gaps.md` section 6, recorded as OPEN-024. Savi documents spoint and instructs jayzee. Savi makes no change to spoint or jayzee and does not run either. Jayzee reports each status as it finds it; savi takes it as reported and records it only when jayzee reports it.

Each change names the spoint reference it ports from. Each witness is a command jayzee runs in its own repository.

## Adopted

| Brief | Owner item | Change for jayzee | Witness jayzee must produce |
|---|---|---|---|
| J1 | 2 | Size the rewind ring from the window, and make every clamp visible. | A test drives 300 samples at 60 Hz with a 5000 ms window and rewinds to tick 0. It asserts the clamp counter rises by 1 and the returned sample tick equals the oldest stored tick. A second case at 4267 ms asserts the returned sample tick equals the clamp target. |
| J2 | 3 and 4 | Write `docs/netcode-wire.md` with the wire constants and layouts, as prose. | A test packs one bin record and one player record and asserts the lengths 29 and 22. A script asserts every constant in J2 below appears in `docs/netcode-wire.md`. |
| J3 | 1 | Generate `docs/netcode-modules.md` from `src/netcode`: one row per module with its exports and one-line purpose. | The script prints `modules N documented N` with the two numbers equal. It fails if any of the 24 modules named in J3 is missing. |

## Dropped

Owner item 5 (document gm `maxInflight: 8`) is not a jayzee change. The default is a gm run setting, and jayzee does not run gm. Not briefed. If the owner wants it documented, it belongs in gm, not in jayzee or spoint.

## J1: rewind ring sized from the window

Spoint reference: `src/netcode/LagCompensator.js`. The ring holds a fixed 256 samples (line 3), and `windowTicks = round(historyWindow * tickRate / 1000)` (line 51). Writes past capacity overwrite the oldest sample (lines 74-80).

Change:

- Capacity is `windowTicks + 1`, not a fixed 256. A window set by the caller is honoured, so the 1000 ms default still gives 61 slots at 60 Hz.
- `rewindAtTick` returns the stored sample's tick in its `tick` field, not the requested tick.
- A clamp increments the clamp counter in every case where the requested tick is older than the oldest stored tick (spoint lines 98-99).

Why: spoint's run in section 2 of the gaps file showed that a 5000 ms window overflowed the 256-sample ring silently, with the clamp counter unchanged. A 4267 ms window clamped to tick 43 but returned the tick 44 sample.

Why not clamp the window to 255 ticks: that changes the window the caller configured. Sizing from the window keeps it.

## J2: wire layouts in a doc, not in comments

Spoint reference: `src/netcode/SnapshotBinFormat.js` and `src/netcode/SnapshotEncoder.js`. Jayzee writes `docs/netcode-wire.md` and states each item below as prose:

- `WIRE_UNITS_PER_METER = 100` (SnapshotBinFormat.js:1). In spoint every use is in that one file, at lines 5-9, 13, 50, 51, 64, 66 and 101. Jayzee's witness lists its own use sites.
- `BIN_RECORD_BYTES = 29` (line 4) and `PLAYER_BIN_RECORD_BYTES = 22` (line 78).
- `packQuat` is smallest-three: a 2-bit index for the largest component, three 10-bit fields scaled by `QSCALE = 511 * sqrt(2)` (line 2), in a 32-bit word (lines 106-120).
- The reduced tier, `PLAYER_TIER_REDUCED = 1` (line 40), with its pose fields and the height-absent flag.
- The self block: input sequence, input depth, ground normal and wall planes (SnapshotEncoder.js:30-39).

Why a doc and not code comments: the owner's comment rule is that comments are not kept as prose, so the layouts go in the doc and the constants stay in code.

## J3: generated module index

Spoint reference: `gaps/netcode-optimization-gaps.md` section 1 lists 24 modules that no doc names. A generated index keeps up with the code; a hand-written section would drift.

The 24 modules: CollisionTileStreamer.js, EventLog.js, Hitscan.js, InputGuard.js, LockstepChecksum.js, LockstepGameLoop.js, LockstepInputTransport.js, NetcodeProfile.js, OutlierDetector.js, PeerSimSession.js, peerLoops.js, ReplayFile.js, ReplayRecorder.js, ReplayPlayer.js, RewindSpatialIndex.js, RollbackGameLoop.js, RollbackInputTransport.js, RollbackLoop.js, SnapshotBinFormat.js, SnapshotPacker.js, TeleportHold.js, TickSystemBase.js, WorkerBridgeProxy.js, controlFrame.js.

## Reporting

Jayzee reports J1 to J3 as built or open, each with its witness output. Savi records a brief item in OPEN-024 only when jayzee reports it. OPEN-024 stays OPEN until then.
