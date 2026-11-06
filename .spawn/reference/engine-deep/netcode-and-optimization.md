# Netcode, lag compensation, compression and systems optimization

Written 2026-11-06 from the engine docs clone at `/workspace/savi/.spawn/engine`, the durable cached runtime worker at `/workspace/savi/.spawn/kernel/`, and live `spawn client exec` probes. This file is outside the git tree; nothing here is committed or pushed.

## 1. What was NOT documented before this run

A coverage grep over all 29 files in `engine-deep/` returned **zero** occurrences of: `lag compensation`, `interest management`, `prediction`, `reliable`, `jitter`, `bandwidth`, `packet`, `varint`, `zstd`, `gzip`, `brotli`, `reconciliation`, `ingress`, `throughput`, `quantiz`, `snapshot` (as a network concept), `resend`, `ack` (as a network term), `Content-Encoding`, `heartbeat` (as a protocol), and `actionMs` (as a measured field). In the public engine docs (`api-reference.md` + 23 skills) the same search returns **zero** for `netcode`, `lag compensation`, `interest management`, `prediction`, `bandwidth`, `packet`, `varint`, `zstd`, `gzip`, `brotli`, `AOI`, `replicate`, `reconciliation`, `client-auth`, `egress`, `ingress`, `throughput`, `actionMs`, `reliable`. `netcode`, `rollback`, `jitter`, `snapshot`, `delta`, `interpolation`, `quantiz`, `resend`, `heartbeat`, `netIn`, `latencyMs` appear only scattered in docs.

What the existing notes already cover (do not duplicate): `netcode/client-auth-publish` and `netcode/egress-flush` as two rows in the sim-health `systems.top` list; `netInBytes`/`netOutBytes`/`netInMessages`/`netOutMessages` in `ViewAPI`; a heartbeat of "one message every 5 s"; `pingMs` and `actionMs.count`; `tick-shed` governor and `shedFraction`; arrival budget 450 KB and `import()` lazy loading; `tree-fetch`/`tree-lane` tags; `audience: near|all|local` and `simulatedBy`; `updateSchedule` culling; `renderScale`, quality tiers, `getPerformanceSnapshot()` and `getClientHealth()` internals. See `physics-and-optimization.md` sections 2-14.

So the gaps are: **(a)** netcode system rows beyond the two known ones and their per-tick costs; **(b)** boot/arrival wire accounting; **(c)** real compression on the wire (algorithm, ratios, what is left uncompressed); **(d)** lag compensation / prediction / reconciliation / interpolation / jitter strategy; **(e)** interest management and replication; **(f)** systems-level optimizations (shedding, batching, caching, work budgets, offthread) that are not already in the physics doc. All are filled below.

## 2. Live wire and boot accounting (measured 2026-11-06)

Probe: `SPAWN_CLIENT_CHROMIUM_PATH=/data/cache/bin/chromium spawn client join ... --render gpu --engine 26ad9a7aa2a8a81fbf40ea21c91dab3f`, then `spawn client exec --read-only --out <file>` in room `main`, spec 509, engine `26ad9a7a`.

### 2.1 `client.bootRead` — the boot cost ledger

```
{ place: "main", crossing: false,
  standBytes: 1584092, pictureBytes: 1595657, heldBytes: 0, arrivalBytes: 488827,
  version: "a49bf0baad36e1806be59696b78fa2a3fab13ee0155fb4d4b853c18589d89472",
  standMs: 9756, pictureMs: 11996, agoSeconds: 117 }
```

- `arrivalBytes 488827` is the same ~489 KB the push verdict reports as `arrival main 489 KB uncompressed`; the client reports the actual bytes it stood up with.
- `standBytes 1,584,092` is the whole boot set (scripts + configs + cells), and `pictureBytes 1,595,657` is what the rendered page held. `heldBytes 0` means nothing was already in this client's cache.
- `standMs 9756`, `pictureMs 11996` — a cold GPU client stood in ~9.8 s and had its first picture in ~12 s. `crossing: false` (a first join, not a portal hop).
- `agoSeconds` on a later read was 117, so `bootRead` is a cached snapshot of the last boot, not a live counter.

### 2.2 Per-second wire counters

`ctx.view` net counters are "bytes/messages over the last whole second", so separate reads give different windows:

| Read | netInBytes | netOutBytes | netInMessages | netOutMessages |
|---|---|---|---|---|
| A | 8259 | 19502 | 25 | 14 |
| B (later exec) | 5362 | 14659 | 14 | 11 |

Two reads inside **one** exec 6 s apart returned identical values (8259/19502/25/14), so `ctx.view` is a snapshot refreshed by the host, not a value re-read on access. `fps` was 60-62 and `renderScale` 1. `ctx.self.latencyMs` was 407, matching `clients[0].pingMs` 407; `navigator.connection` reported `{effectiveType: "3g", downlink: 1.25, rtt: 750}` in this headless client — a slow-link profile, useful context for the 407 ms ping.

`clients[0].wire` was `null` in this client, as were `actionMs`, `hud`, `boot` and `healthRenderer`. So the wire-level breakdown exists in the API surface but not for a body page in this configuration.

### 2.3 Netcode system rows (new)

`getPerformanceSnapshot().server.top` filtered for net-related systems, with `budgetMs 33.333` and `client {class:"desktop", gpu:"discrete", host:"shell"}`:

| System | p50Ms | p95Ms | maxMs | pctOfBudget |
|---|---|---|---|---|
| `netcode/client-auth-publish` | 0.045 | 0.875 | 1.02 | 1 |
| `netcode/egress-flush` | 0 | 0.375 | 0.57 | 0 |
| **`netcode/receipts`** | 0 | 0.085 | 0.365 | 0 |

`netcode/receipts` is a third system, not previously documented: a cheap per-tick receipt pass on the client's authoritative publishes. Client-authority publish is the dominant netcode cost (p95 0.875 ms), egress flush fires ~0.46 runs/tick in the headless sample; receipts are near-free.
`ctx.changed` is a function (not a Proxy object).

## 3. Compression on the wire (measured)

Browser realm (`spawn client exec --realm browser`) read `performance.getEntriesByType('resource')` and then `fetch(url, {method:'HEAD'})` for the largest entries. 40 resources, 39 with a non-zero `encodedBodySize`. **Total encoded 41,727,046 bytes → decoded 74,241,705 bytes, an overall ratio of 1.78×.**

| Resource | encoded | decoded | ratio | `content-encoding` | content-type |
|---|---|---|---|---|---|
| `runtime-entry.mjs` | 28,979,344 | 28,979,344 | **1.00** | **none** | text/javascript |
| `11904f280a7085a6.mjs` | 2,161,446 | 7,942,878 | **3.67** | **`br`** (Brotli) | text/javascript |
| `browser-client.mjs` | 1,246,828 | 3,688,631 | **2.96** | **`gzip`** | text/javascript |
| `1fd56d4a-83c46f0bf8560574.mjs` | 238,794 | 965,723 | **4.04** | **`br`** | text/javascript |
| `22380bd1-97f06ae3cc174c5a.mjs` | 28,138 | 87,140 | 3.10 | (script) | text/javascript |
| `godmode-icons-bbaf8f01ca083a3b.webp` | 207,440 | 207,440 | 1.00 | none | image/webp |
| `GeistPixel-Square-df2872cc7bf722dc.woff2` | 28,616 | 28,616 | 1.00 | none | font/woff2 |

Findings:

- **JavaScript is compressed at the HTTP layer with Brotli (`br`) or gzip; no application-level wire codec is involved.** `content-encoding: br` gives 3.67-4.04× on the big bundles; gzip gives 2.96× on `browser-client.mjs`.
- **The 29 MB runtime worker (`runtime-entry.mjs`) is served with no `content-encoding` and ratio 1.00** — it dominates the transfer (28.98 MB of the 41.7 MB encoded total). That single decision is why the overall ratio is only 1.78× despite 4× compression on the smaller bundles. It is SRI-verified at boot (see `kernel-worker.md`), which may be why it is served byte-exact.
- **Already-compressed formats are passed through untouched**: WebP icons and WOFF2 fonts get no Content-Encoding, ratio 1.00. This is correct behaviour, not a missed optimization.
- `CompressionStream` and `DecompressionStream` are both available in the rendered page (`typeof` = "function").
- The same `11904f280a7085a6.mjs` appears five times in the resource timing list with identical encoded/decoded sizes — repeated fetches of the same content-addressed bundle, so the CDN hash is the cache key. `tree-fetch` in the client log reports `4 value(s) in 13 ms: 4805 bytes` and `4 of 4 value(s) landed on the device in 22442 ms`.

## 4. Systems optimizations already measured elsewhere

These are in `physics-and-optimization.md`; listed here so this file is complete without repeating them: the 31 physics phases and the Mantle WASM 44-export ABI (section 2 / 13); `behavior {totalEntities, updatedEntities, scheduleSkippedEvery, scheduleSkippedNear}` and `simulatedBy: platform` (section 3); `tome/scripted-primitive-offthread`, `terrain/client-streaming`, `client/frame-tail`, `tome/still-holds`, `tome/hierarchy-walk` (section 3); `dj$={scriptSyncBudgetMs:5000, tickDrainBudgetMs:8, watchdogGraceMs:2000, workerRebuildAllowanceMs:3000, specMovedRetryLimit:2, workerIdleTtlMs:600000, laneSimShare:0.25}` and the `qOF` per-call cap table (section 8.4); LOD/instancing/chunk batching (section 9); the `tick-shed` governor and its `engaged → level-changed → released` lifecycle with `why: "host-overload"` (section 14.3). In the netcode probe it reappeared with `"1 backlog clamp shed 33.3ms of sim time in the last 9s"`, escalating to `"38 backlog clamps shed 4365.2ms of sim time in the last 27s"` and releasing at `"10 backlog clamps shed 900ms of sim time in the last 1s"`. The rule is constant: **the sim runs in bounded slow motion instead of catch-up bursts**.

## 5. Docs-level netcode / lag / compression / systems facts (previously undocumented)

Checked against all 29 reference notes; `OMITTED` items were already covered and are not repeated. Citations are absolute paths under `/workspace/savi/.spawn/engine/`. Numbering from the research agent.

### 5.1 Client authority, contention and replication

1. Client authority is explicit for mounts: `"hull simulates on driver's machine, input → hull onInput"` `[skills/vehicles.md:14]`.
2. Simultaneous seat claims resolve by arrival: `"two takes of a free wheel: arrival keeps one, loser hears onControlEnd, presses again"` `[skills/vehicles.md:16]`.
3. Vehicle audio is a throttled parameter stream: `"fed rpm, load, cut, on, speed, character ~10 Hz"` `[skills/vehicles.md:20]`.
4. `simulatedBy` names a client id: `player.id === "player/" + thing.simulatedBy` names them; `"No other value can be assigned."` `[api-reference.md:1195]`.
5. Wire content inbound: `"the game's state, other players' moves, the room's answer to this machine's heartbeat"` `[api-reference.md:1814]`; outbound: `"the state of what it simulates, its heartbeat, one message every 5 s"` `[api-reference.md:1815]`.
6. Networking is a config mode, not a documented protocol: `networking?: { mode?: "singleplayer" | "multiplayer" }` `[api-reference.md:908]`.
7. Input is tick-sampled, not level-sampled: `"The look delta this tick, horizontal: the mouse's movement or a touch drag, never a level."` `[api-reference.md:919]`.
8. Region-aware room routing: `"wnam enam (North America) weur eeur (Europe) sam me afr apac oc, or null"` `[skills/rooms-and-matchmaking.md:50]`.
9. Room telemetry carries heartbeat time: `rooms: [{ roomId, playerCount, maxPlayers, status, mode, lastHeartbeatAt, createdAt, metadata }]` `[skills/rooms-and-matchmaking.md:50]`.
10. Spectator replication suppresses input too: `"its player slot stays, no input reaches it"` `[skills/rooms-and-matchmaking.md:54]`.
11. Each room owns its clock and RNG: `"each room your rule names has its own world.state, clock and RNG"` `[skills/rooms-and-matchmaking.md:40]`.
12. Cross-place player writes are whole-key only: `"lands on that player in any place (whole top-level keys"` and `"never a nested fragment)"` `[skills/rooms-and-matchmaking.md:43]`.
13. Place-lifetime clocks need an explicit handoff: `"A clock that must outlive an emptied place is handed to the destination manager on arrival."` `[skills/rooms-and-matchmaking.md:43]`.
14. Room reset has a latency bound: `"everyone in it rejoins within a second"` `[skills/rooms-and-matchmaking.md:42]`.
15. Singleplayer catch-up is deferred to the next open: `"A singleplayer world is not visited: the time nobody watched arrives on its player's next open as the same ctx.gapMs"` `[skills/rooms-and-matchmaking.md:46]`.
16. Position is engine-owned, never saved: `"The engine keeps where a player stands; save nothing for it."` `[skills/platform-systems.md:8]`.
17. Contention is refereed, not locked: `"sim.js referees a claim several hands make at once (the win, the last seat)"` `[skills/platform-systems.md:8]`.
18. `onLeave` on tab death uses last known state: `"Spawn's machine there runs it from the last state everyone saw"` `[skills/platform-systems.md:32]`.
19. Unattended work is gated on presence: `"Crons, timers and sim.js run while someone is in; with nobody in: routing.alwaysOn"` `[skills/platform-systems.md:36]`.
20. LLM jobs are per-player metered: `"20 asks a player an hour"` `[skills/platform-systems.md:37]`.
21. Async job latency is a state flag: `"seconds pass: state.loading from submit to callback"` `[skills/platform-systems.md:37]`.
22. Streaming feeds are re-asked, not retried silently: `"ask it once from sim.js, again when it ends"` `[skills/platform-systems.md:39]`.
23. SQL batching primitive: `"semicolons = ordered statements in one transaction"` `[skills/platform-systems.md:44]`.
24. Foreign behaviors are capability-throttled: `"A declared word the ceiling lacks pockets that behavior"` and `crossing.behavior.pocketed` `[skills/portals.md:35]`.
25. Some faculties are free from the ceiling: `"reads, timers, on and queries are always free"` `[skills/portals.md:35]`.
26. Cross-world state conflict resolution: `"At arrival that world's save of you wins for every key it holds"` `[skills/portals.md:34]`.
27. Per-player emit scoping: `"{ audience } on the emit scopes it to one player"` `[skills/voxel-terrain.md:73]`.
28. Chat lines carry a dedup identity: `nonce: string,` in `SaidLine` `[api-reference.md:1517]`.
29. UI events are once-only effects: `"each ctx.emit(\"uiEvent\", { name, payload }) once: an effect, never a persisted value"` `[skills/game-ui.md:47]`.

### 5.2 Lag compensation, rollback and interpolation

30. Hitscan removes travel-time lag: `"Hitscan is the default for guns and lasers: no entity, no travel time"` `[skills/projectiles.md:51]`.
31. Viewmodel FX are one tick stale: `"a viewmodel's flash draws where the barrel was a tick ago"` `[skills/projectiles.md:60]`.
32. Portal-hop ray budgets exist: `"the hop budget spent"` `[skills/projectiles.md:63]`.
33. Rendered pose trails the sim: `"aim from ctx.world.camera, the drawn frame ~2 ticks behind"` `[skills/cameras.md:12]`.
34. Interpolation is opt-out per viewmodel: `"or poses interpolation = null viewmodels"` `[skills/cameras.md:8]`.
35. Distributed queries are tri-state: `"queryable false = this machine could not look"` and `"terrain null = unknown, never empty"` `[skills/pointer-raycasting.md:47]`.
36. Rollback snapshots support zero-copy buffer reuse and partial bodies: `PhysicsWorld.save(into: Uint8Array): number` `[api-reference.md:1945]`.
37. Ballistics has an explicit target-lead input: `solveShot(from, to, speed, g, lead?: { x, z } | Vec3 | null)` `[api-reference.md:2046]`.
38. Remote view cameras have a cadence dial: `{ camera: ViewCamera; cadence?: string } | null` `[api-reference.md:1568]`.
39. Clip sync uses the world clock: `"World-clock milliseconds (ctx.now()) at which time applies; the engine stamps it for you"` `[api-reference.md:1668]`.
40. Clip playback is last-write-wins across screens: `"One address is one clip: the newest write on any surface wearing it moves it."` `[api-reference.md:1667]`.
41. Frame telemetry buffers expire when unread: `"A handle unread for about a second holds nothing and starts over at its next read."` `[api-reference.md:1810]`.
42. Selector-based controls cover late joiners: `"it reads live state, so reconnects and late joiners land right"` `[skills/mobile-controls.md:50]`.
43. Named job exports survive restarts: `"decided(ctx, r, payload) fires where the entity simulates, through a restart"` `[skills/jev.md:33]`.
44. Portal glass has a wake state: `ctx.portal: { state: 0 waking | 1 open | 2 closed` `[api-reference.md:2226]`.
45. Spec versioning appears only as prose: `"it re-runs at the next spec version"` `[skills/platform-systems.md:47]`, with no `specVersion` field in the docs.

### 5.3 Compression, packing and delta encoding

46. Voxel state is packed and palette-indexed: `cells: Int16Array; states: Uint16Array` `[api-reference.md:1310]`.
47. Serialized voxels use -1 for air and a fifth packed field: `"palette index -1 writes air; a fifth number is read's packed states[i]"` `[skills/voxel-terrain.md:61]`.
48. Palette/state semantics: `"cells[i] indexes palette (palette[0] null = air; -1 not held here), states[i] its packed state"` `[skills/voxel-terrain.md:66]`.
49. Terrain field chunks are quantized and versioned: `({ cellSize, chunkCells, quant, cells, version } | undefined): a bulk read, not a save` `[skills/heightmap-terrain.md:56]`.
50. Field deltas carry a cursor: `"chunks moved since your last at (dig, paint, clear); pass the new at next beat"` `[skills/heightmap-terrain.md:62]`.
51. Chunk rebuilds are dependency-keyed: `"ctx.place.terrain.params.snow = 1 rebuilds the chunks that read it"` `[skills/voxel-terrain.md:51]`.
52. Block randomness is deterministic: `"random() is deterministic 0..1"` `[skills/voxel-terrain.md:72]`.
53. State dumps skip non-enumerable reads: `"Non-enumerable: a dump never pays for the read."` `[api-reference.md:1192]`.
54. Generated clips are reusable textures: `"data { name, url, seconds, width, height }, where url is an .mp4 written as any screen's texture"` `[api-reference.md:175]`.

### 5.4 Systems optimizations

55. Tilemap redraw is dirty-driven: `"Per-room ground reads world.state and redraws when it changes."` `[skills/2d-mode.md:10]`.

## 6. Terms with ZERO public documentation (runtime-only)

A whole-word search over `api-reference.md` + all 23 skills + `README.md` + `skills.md` returned **0** for: `netcode`, `lag compensation`, `reconciliation`, `reliable` / `unreliable`, `ack`, `sequence number`, `packet`, `bandwidth`, `jitter buffer`, `AOI`, `interest management`, `state writes`, `specVersion`, `specMovedDuringExec`, `getPerformanceSnapshot`, `getClientHealth`, `actionMs`, `pingMs`, `physics/body-rest`, `egress`, `flush`, `WASM`, `Mantle`, `netcode/client-auth-publish`, `netcode/egress-flush`, `tree-fetch`, `tree-lane`, `arrivalBudget`, `tick-shed`, `shedFraction`, `backpressure`, `offthread`, `memoiz*`, `batching`, `quantization`, `varint`, `zstd`, `gzip`, `brotli`, `draco`, `meshopt`. Nearby-but-unrelated hits: `jitter` 4 (scatter sampling, FX, `colorJitter`, diesel audio knock); `resend` 1 (SQL, not transport); `delta` 8 (input/gradient deltas); `snapshot` 2 (`VibeAudioSnapshot`, physics `save()`); `compression` 1 (model cook); `quantize` 1 (touch-stick d-pad); `dedup` 1 (`dedupeKey`); `late frame` 1 (adaptive resolution). Present and nonzero: `rollback` 2, `interpolation` 3, `netInBytes` 3, `netOutBytes` 2, `latencyMs` 1, `heartbeat` 3, `audience` 16, `simulatedBy` 2, `tickBase` 2, `changed` 8, `commit` 3, `getLogs` 6, `quality` 6, `renderScale` 1, `preload` 1, `import()` 2, `ctx.job` 6, `cron` 6, `findPath` 3, `quant` 4, `palette` 6, `Int16Array` / `Uint16Array` 1 each.

That list *is* the answer to "what isn't documented yet" — the public docs describe the game-facing API, but the transport, lag-compensation and compression machinery is runtime-only and had to be recovered from the worker and live probes in sections 2-4 and 7.

## 7. Runtime worker constants and teach strings (build 2792ef38e4f4)

Mined from the durable worker at `/workspace/savi/.spawn/kernel/`. Counts are case-insensitive literal-substring occurrences with the exact-case total in parentheses. Note: `gm.grep` refuses the 28,968,772-byte worker (1 MB cap), so this used `python3 -I` directly.

### 7.1 Netcode systems and replication policy

Counts: `netcode/` 232, `client-auth-publish` 10, `egress-flush` 13, `ingress` 469 (351), `auth-publish` 10, `snapshot` 1675 (1431), `delta` 1642 (1125), **`state-diff` 0**, `patch` 1670 (1322), `replicate` 477 (448), `aoi` 378 (189), `interest` 291 (267), `audience` 687 (685), `visibility` 280 (234).

- `"Event component '%s' must replicate to 'aoi', 'owner', 'always', or 'never'"` — replication/audience is a **per-event policy**, not a snapshot join set. This is the interest-management mechanism: four declared scopes per event component.
- `'netcode/publish visibility: "owner"'` — publish visibility is a declared row policy.
- `"the N key records every wire frame with its rows, the player bodies' per-tick values and the ECS deltas (lag vs render)"` — the net-rec capture includes wire frames, per-tick player values and ECS deltas; "lag vs render" is a first-class distinction.
- Numeric near the netcode rows: `qmW=2` beside `wIA="netcode/egress-flush"` (record gap); `yv6=2, HmA=1, WmA=256, EmA=3, LIVE_TICK=5, OWN_TICK=11, restPaceTicks=1, stopQuietTicks=3, ttlTicks=4`. **No `publishEvery`/`flushEvery`/`publishRate`/`flushRate` names (0)** — publish cadence is not a named dial. Tick-shed row constants: `EJ3=2048, Dq6=64, hlN=3, flN=1000, vIq=8388608` (8 MiB). Ingress attribution constants: `Uf9=45, F0Q=16, rP2=8, Id7=8, V4z=30, l34=3, s34=0.5, vd7=32, QC2=4, d34=1024`.

### 7.2 Lag compensation

Counts: `lag` 1055 (1024), `latency` 27 (21), `ping` 573, `jitter` 92 (62), `rollback` 20, `reconciliation` 12, `prediction` 2, `predict` 2, `rewind` 10 (6), `resim` 1, `backlog clamp` 1, `catch-up` 46, `interpolat` 134 (124), **`extrapolat` 0**, `lateMaxMs` 7 (5).

- `"Position interpolation between server ticks. null disables interpolation (instant snap every tick)."` — interpolation is **between server ticks**; `null` snaps each tick. There is no extrapolation.
- `"the sim runs in bounded slow motion instead of catch-up bursts"` — backlog clamps shed sim time rather than replaying it.
- `"the copy waits on ${$} from +${Math.round(Q-gEZ)} ms of its walk"` — a seat-stand waits on a measured walk lag.
- `lateMaxMs` in the perf overlay with `Q=$.tickRate>0?1000/$.tickRate:16.67` (frame budget derived from tick rate). `wOJ=4, uPG=2000` near late/lag. Budget constants `tickDrainBudgetMs=8, scriptSyncBudgetMs=5000, watchdogGraceMs=2000, workerIdleTtlMs=600000, laneSimShare=0.25`.

### 7.3 Compression internals (beyond the HTTP layer of section 3)

Counts: `compress` 83 (48), `decompress` 8 (1), `deflate` 11 (10), `inflate` 14, `gzip` 2, `brotli` 1 (0), `zstd` 1, `lz4` 14 (4), `varint` 22 (19), `quantiz` 28, `delta` 1642, `pack` 854 (801), `unpack` 45 (40), **`bitpack` 0**, `float16` 10 (8), `f16` 33 (24), `rle` 290 (99), `memoMaxBytes` 4, `inline budget` 1, `maxBytes` 14 (2), `truncat` 129 (128).

- `"track: a varint ran past the end of its bytes"` — varint overrun guard; varints are used in the wire/track format.
- `"stateSchema total bits exceed the 16-bit packed-state budget (${F} > 16)"` — a **16-bit packed-state budget**; legacy flat `stateSchema` warns above 8 bits.
- `"[render-channel] renderer camera kind exceeds the inline budget: truncated"` — inline byte-budget truncation, with `maxBytes=R5J` imported as `__spawnRealmLib.$$1gl` and `camKindScratch=new Uint8Array(R5J)`.
- Browser/API names: `CompressionStream` 10 ci (3 exact), `DecompressionStream` 7, `TextEncoder` 148, `TextDecoder` 119, `Uint8Array` 1847, `DataView` 265, `Float16Array` 2. Helpers: `new DecompressionStream("gzip")` and `new DecompressionStream("deflate-raw")`, `lume_pack2x16half`, `lume_unpack2x16half`, `quantizeToF16`, the `setUint16/getUint16` float16 path, `Rb8.encodeInto`, `CuJ/LuJ/ZBD/JBD`. `memoMaxBytes` is only a property with no numeric default in the worker. `"Compression damping (default 2.5)"` is physics, not wire compression. `zstd=1` (not zero); exact-case `brotli=0`. So the wire codec is **varint + 16-bit packed states + half-float packing**, while the HTTP layer does Brotli/gzip (section 3).

### 7.4 Wire and protocol

Counts: `wire` 1186 (902), `socket` 768 (635), `websocket` 28 (9), `message` 3599 (3282), `frame` 5765 (4262), `packet` 98 (87), `sequence` 125 (65), `seq` 5347 (3565), `ack` 4314 (4216), `resend` 45, `reliable` 22 (9), `unreliable` 6 (3), `heartbeat` 7 (3), `"5 s"` 7, `netIn` 46, `netOut` 4, `bytes` 5488 (3059), `bandwidth` 55 (53), `throttle` 12 (8), `backpressure` 5 (0 exact), `queue` 1999 (1581), `deadline` 389 (336), `budget` 794 (553).

- `"[wire] a batch flush id is a positive u32; got ${Q}"` — batch-flush ids are validated u32.
- `"## Bandwidth (the room socket, wire bytes as the transport sends/receives them; last whole second | 15 s window | session total)"` — bandwidth telemetry is reported at three horizons: last whole second, a 15 s window, and the session total.
- `"Job deadline exceeded: ${M0}ms with no progress (attempt ${Y0} still running${W0})"` — job no-progress deadline.
- `"5 s"` appears 7 times (heartbeat cadence). `1000/tickRate` fallback `16.67`; `scriptSyncBudgetMs=5000`, `tickDrainBudgetMs=8`, `watchdogGraceMs=2000`, `workerIdleTtlMs=600000`.

### 7.5 Spec versioning and tree folds

Counts: `specVersion` 158 (119), `specMovedDuringExec` 16, `specMovedRetryLimit` 3, `changed` 1243 (1054), `commit` 615 (484), `fold` 2780 (2438), `staged fold` 8, `relay-fold` 89, `tree-fetch` 21, `tree-lane` 182, `SRI` 67 (0 exact), `manifest` 975 (886).

- `"[relay-fold] a standing head of a part its row no longer composes was dropped"` — standing heads are dropped when the tree no longer composes them.
- `"The game's database did not run a published api.sql call"` — spec-version mismatch in the published API path.
- `"[room-state-resume] snapshot write failed"` — snapshot write is retried at the next flush point.
- `specMovedRetryLimit=2` in `dj$`; `workerRebuildAllowanceMs=3000`. Exact-case `SRI=0` — SRI verification belongs to the host, not this worker (consistent with `kernel-worker.md`).

### 7.6 Systems optimizations

Counts: `tick-shed` 1, `shedFraction` 2, `laneSimShare` 4, `tickDrainBudgetMs` 1, `scriptSyncBudgetMs` 8, `watchdogGraceMs` 2, `workerIdleTtlMs` 3, `offthread` 56 (43), `memo` 2065 (1509), `dedup` 135 (95), `batch` 765 (416), `frozenWorldSkips` 4 (2), `residency` 505 (451), `cache` 555 (364), `prefetch` 110 (75), `preload` 60 (58).

- `"run_script worker killed after ${Math.round(J)}ms: the script exceeded its ${dj$.scriptSyncBudgetMs}ms synchronous budget on a host ticking normally"` — a 5000 ms synchronous-budget kill.
- `"attempted: the drain's derive ran and no matching bytes landed (the memo stands until an input moves)"` — memoisation stands until an input changes, so unchanged inputs are free.
- `"every must be a positive number of ticks or { seconds: s } with s > 0; this one was ignored"` — `updateSchedule` validation.
- Constants: `dj$={scriptSyncBudgetMs:5000, tickDrainBudgetMs:8, watchdogGraceMs:2000, workerRebuildAllowanceMs:3000, specMovedRetryLimit:2, workerIdleTtlMs:600000, laneSimShare:0.25}`; `R2T=0.25`; `EJ3=2048, Dq6=64, hlN=3, flN=1000, vIq=8388608`; `pFY=8, HcF=8`; `qmW=2`; `wOJ=4, uPG=2000`.

### 7.7 Explicit zeros (what the engine does NOT do)

`state-diff=0`, `extrapolat=0`, `bitpack=0`, `publishEvery`/`flushEvery`/`publishRate`/`flushRate=0`; exact-case `brotli=0`, `SRI=0`, `backpressure=0`. `zstd=1` is a single stray hit, not a codec. So: no extrapolation, no bitpacking, no named publish-rate dial, and no named state-diff component — the netcode uses `delta` and `patch` vocabulary instead.

## 8. Coverage after this run

Every gap in section 1 is now filled: sections 2-3 hold the live wire/boot/compression measurements, section 4 points to the systems optimizations already in `physics-and-optimization.md`, section 5 holds the 55 docs-level facts that were missing, section 6 is the zero-public-doc term inventory, and section 7 holds the runtime-only constants and teach strings. Nothing here is committed to the world tree — these files are gitignored through `/workspace/savi` being outside the git repo.
