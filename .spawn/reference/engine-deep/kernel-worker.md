# The runtime worker (kernel) is local, minified

Found 2026-11-05 while troubleshooting a stuck `spawn preview`. The headless-room-host log at `/config/.spawn/client-sessions/logs/<session>.log` prints the exact path:

```
[headless-room-host] ... booting {"engineVersion":"26ad9a7aa2a8a81fbf40ea21c91dab3f","engineSemver":"6.0.0"}
[headless-room-host] ... step=worker
[headless-room-host] ... runtime worker downloaded and SRI-verified {"engineVersion":"26ad9a7aa2a8a81fbf40ea21c91dab3f","entry":"file:///tmp/spawn-room-host-engine-cache-1000/b325c91e14501b7240748eab77c31d76b2bfb7888dc4808f0a9672c5d1c9122a/engine-client-runtime-worker.b325c91e....mjs","eyePipeWire":...}
```

`/tmp/spawn-room-host-engine-cache-1000/` held 30 engine versions on this machine, each `engine-client-runtime-worker.<sha>.mjs` about 29 MB. The file for engine `26ad9a7aa2a8` is 28,979,030 bytes over 13,770 lines and is ES-module JavaScript (minified, but readable in context). This closes the old "kernel source is not in any local file" claim: the client bundles hold no kernel, but the room host caches the verified worker.

A stuck preview showed `step=worker` with only `session warm answered {"status":204}`; the worker was not downloadable for that engine at that moment. Retrying later joined normally (engine `26ad9a7a`). So a preview that never prints `joined: session` is a worker-fetch problem, not a scene fault.

## Hook catalog and aliases in the worker

`var Dk0=` is the canonical hook name to accepted export aliases (24 entries):

```
onSpawn        <- onSpawn, spawn
onDestroy      <- onDestroy, destroy, onDestory   (the typo is an accepted alias)
update         <- update
lateUpdate     <- lateUpdate
onInput        <- onInput
onInteract     <- onInteract
onCollide      <- onCollide
onTriggerEnter <- onTriggerEnter, onTrigger
onTriggerExit  <- onTriggerExit
onCross        <- onCross
onRefuse       <- onRefuse
onLiquidEnter  <- onLiquidEnter
onLiquidExit   <- onLiquidExit
onNoise        <- onNoise
onSay          <- onSay
onSoundEnd     <- onSoundEnd
onAnimationEvent <- onAnimationEvent
onJointBreak   <- onJointBreak
onOutOfBounds  <- onOutOfBounds
onControlBegin <- onControlBegin
onControlEnd   <- onControlEnd
editor         <- editor
visual         <- visual
```

`var Bq=["updateSchedule","scopes","ears"]` is the named data exports. `$I0`, `QI0` and `JI0` are catalogs of crossings, sim hooks and authoring hooks, each with `family`, `signature`, `provenance` (`verbatim` or `new`) and notes. Catalog notes worth keeping:

- `update(ctx, dt)` pairs with `updateSchedule`; there is no world-level `onTick`.
- `lateUpdate` runs after the physics step, in each tick its object's `update()` ran in, on the machine that ran it. A script exporting only `lateUpdate` runs on `update()`'s gate.
- `onInput` "fires only on the player or controlled entity" (catalog wording). The live probe below saw `onInput` on a freshly placed object, so treat the wording as the documented rule, not an invariant.
- `onTriggerEnter(ctx, other)` and `onCollide(ctx, other, contact)` are `sim` family, `verbatim`.
- `onOutOfBounds` fires once when a body falls through the world bottom bound; returning false keeps the engine's recovery off.

The worker counts in this build: `onSpawn` 246, `onTriggerEnter` 30, `onCollide` 28, `ears` 669, `updateSchedule` 24, `onInput` 134.

## ctx.destroy force semantics, from source and live

Kernel string:

```
api.destroy did not delete "<id>": it is a live player's body; nothing changed. Pass { force: true } to delete a player on purpose.
```

and, in the array path, `"<id>" is a live player's body — destroyObjects keeps players; call api.destroy("<id>", { force: true }) if you truly mean this player.` The guard is `cz7($,Z)` (a live player's body) and `w4_` throws when `force !== true`.

Live check in a joined room (`spawn client exec`, our own test body):

```
ctx.destroy(playerId)                 -> error "api.destroy did not delete ... it is a live player's body; nothing changed. Pass { force: true } to delete a player on purpose."
ctx.destroy(playerId, { force: true }) -> removed: true
```

Plain `ctx.destroy` already removes runtime-spawned objects, tree-derived objects (`cm-top-rock`, `cm-editor-label`) and parents with children (`sys70`). `force` is specifically the override that permits deleting a live player's body; it is not a general "skip the tree" flag.

## Hook order, measured after the client attached

A preview room (`origin/main` plus a pushed probe commit) had a trigger box `x-probe-hooks` with `behavior: scripts/probe-hooks2.js` and `physics: {body: kinematic, trigger: true}`, plus two dynamic spheres. `ctx.commit('probe: place a falling trigger ball', () => ctx.spawn({..., behavior: 'scripts/probe-hooks2.js', physics: 'dynamic'}))` placed a live ball whose hooks ran after the exec (the exec output says: "1 thing(s) spawned or given a behavior: each one's onSpawn runs once, live, on the room right after this script").

`spawn client logs` (tick numbers from the room clock):

```
1666  p2:ears.press                         (from ctx.emit('press', ..., {to: 'x-probe-hooks'}))
6682  p2:onSpawn                           (new ball)
6682  p2:onInput                           (same tick)
6682  p2:update dt=0.03333333333333333      (same tick)
6700  p2:onTriggerEnter object/...          (on x-probe-hooks, 18 ticks later)
6705  p2:onCollide terrain/stream/main/0:0:0 (on the ball, 5 ticks later)
```

So on the spawn tick: `onSpawn` → `onInput` → `update`. `onTriggerEnter` and `onCollide` fire on later ticks once the ball reaches the trigger and ground. `ears.press` fires on the emit, not on a tick.

`dt` is exactly `0.03333333333333333`; the worker defines `var G_X=0.03333333333333333` and the sim-health line reports `step 33.3 ms`. `update` ran once per tick (`probe-hooks2.js update ... x904` over 902 ticks).

## Other live findings in that room

- Plain `ctx.spawn({..., behavior: 'scripts/probe-hooks2.js'})` fails: `Behavior error in compile ... Script source not found in spec.scripts`. Adding `scripts: {...}` is refused: `[Tome] spawn(""): "scripts" is not a key of an object: dropped.`. Inside `ctx.commit(message, fn)`, the same `ctx.spawn` with `behavior` binds the tree script and its `onSpawn` runs. Behavior must be a placed row or a committed placement, never an inline spec.
- Runtime-spawned objects do not fall even with `physics: 'dynamic'` (y stayed 40 over 20 samples at 50 ms). A placed dynamic row does fall and settles on the floor.
- Built-in job ids in the worker include `video:generate` (the `job_not_found` teach string lists `llm:chat, llm:generate, llm:clear, jev:decide, mail:send, chat:send, chat:history, text:check, image:generate, image:segment, video:generate`). It was not invoked: it generates a paid clip.

## Limits

- The `/tmp` cache is ephemeral, but a durable copy now lives at `/workspace/savi/.spawn/kernel/engine-client-runtime-worker.2792ef38e4f49eacedf6dd47091dc173fd2cd665de3b1cf1395654985e29b510.mjs` (28,968,772 bytes, sha256 prefix 2792ef38e4f4). It is the worker that contains `partyCancel`; all kernel facts in this file can be re-derived from it after the /tmp cache is cleared. The hash in the directory name is the worker file's own SRI hash, not the engine version.
- The worker is minified. Its embedded catalog and teach strings are authoritative for names and signatures; the minified dispatch code itself was not decompiled.
- `lateUpdate` was also measured live: it runs right after `update` in the same tick (q-probe logs at tick 6857). Two dynamic shapes with different starts (sphere from y=20, box from y=45) reached ground at ticks 1833 and 1853. The minified dispatch code itself was not decompiled; the catalog and teach strings are authoritative enough for names, signatures and guards.

## The docs pin tracks the runtime engine

Room-host logs in this session named engines `2c12092a39415236febc137b3e3f29ac`, `b8e64d1f8d0b31be9ac19274f9917ce5`, `26ad9a7aa2a8a81fbf40ea21c91dab3f`, `d6697aeb` and `a21c252a`. The engine docs clone has commits `8cb061a kernel 26ad9a7aa2a8`, `6f82c94 kernel d6697aeb6aeb` and `0240920 kernel a21c252a594d`, whose subjects match those prefixes. So the kernel sha256 in engine.yaml is the pin of the same runtime worker the room host downloads and SRI-verifies; it is not a separate docs-only identifier.

## A docs change reaches the runtime worker

`partyCancel` is absent from the older cached workers (d843800d1534, b325c91e1450) and present three times in the newer ones (1e6ae6f76b4a, 2792ef38e4f4), while `partyAdd` is present in all four. The docs commit 4134071 added `partyCancel` to ActPayloads. So the cached worker files are a usable live check on whether a documented API change has reached the runtime, without a room boot.

One more direct match: `spawn client status` once fell back to "running the client this stack last served here (954479ae3de3)" after a transient ECONNRESET, and the docs clone has commit `cd4d3ce kernel 954479ae3de3`. The client's fallback engine identifier is the same artifact the docs pin names.

## Durable local source

The newest cached runtime worker was copied out of /tmp into /workspace/savi/.spawn/kernel/ on 2026-11-05. That directory is outside the game-6 git tree, so nothing here can be committed to the world. The copy closes the "kernel source is not local" gap for this engine build.

The minified dispatcher was not fully decompiled: minified symbol names change per engine build. In the b325c91e worker the hook alias table is `Dk0`; in the 2792ef38 worker `Dk0` is instead a predicate for `forces` keys, and the alias table has a different name. Any decompilation therefore has to be redone against the specific cached worker; the durable copy makes that possible without a room boot.

The physics solver is a WASM module: durable copy `/workspace/savi/.spawn/kernel/mantle-core.cedc1a4a242dce3143f075fe3dc65da79c6a1cf425cbd16db602450be8fd3ec7.wasm` (44 exports, including `mantle_cache_seed`/`mantle_contact_assemble`/`mantle_ccd_step`). Full ABI and the `findPath` budget default of 20000: `physics-and-optimization.md` section 13.
The hook dispatcher's binding logic (alias table -> `__spawnRealmLib.$$25b` -> `otJ`, the `u3N` binder, first-alias-wins, `lateUpdate` implies a no-op `update`): `physics-and-optimization.md` section 15.
