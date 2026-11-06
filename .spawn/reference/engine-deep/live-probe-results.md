# Live probe results (2026-11-05)

Probed with: spawn client join @lanmower/the-savi-gallery --ttl 600 --name probe (world 26f64424-cc19-43af-a9c3-666e4559bb05, room main, engine 2b2bcd38). Every exec ran with --read-only. The body was left at the end: "your body left the world. Your account stands 0 bodies now." No write, spawn, or SQL was sent.
Probe scripts: probes/probe-1.js to probe-4.js (gitignored).

## Measured facts

- Spec version 305. World version 303, mode live, networking multiplayer, behaviors [scripts/arrival.js].
- Place "main": tickBase 30, timeScale 1, gravity (0, -24, 0), damping 0. The gravity is not Earth's; the world sets it.
- Entities: 1502 at the probe, with 107 tagged interactable and 143 plinth. Full tag counts are in probe-2 output.
- Player body: id player/c_actor:pa_…, tags player. It stood at (0, 0.07, 0).
- Client: quality high, device desktop, 16 max textures.

## The API surface (ctx)

- ctx and api expose the same 45 keys in exec: _hostSeatLane, _lastPlaceId, after, awaitJob, cancel, changed, commit, cross, destroy, device, emit, enterPlace, error, files, getClientHealth, getLogs, getObject, getPerformanceSnapshot, getPixelProvenance, getTerrainHeight, job, log, notifyDm, notifyDmOnce, now, on, place, quality, query, random, self, session, sleep, spawn, sql, state, view, warn, world.
- ctx.world has 51 keys (address … voiceMood). ctx.place has 36 (acoustics … worldBounds). ctx.self has 14 (audience … visibility).
- ctx.session is empty in exec.
- The verbs (spawn, destroy, sleep, commit, query, …) are Proxy objects. Function.prototype.toString gives "function ProxyObject() { [native code] }". So their source cannot be read from the client. ctx.cross has arity 3; the rest report 0.
- ctx.sql is a tagged template: sql`...`. A statement that is not in a saved world script is refused in exec with law.sql.statement-not-published. Use a lib/ function, or the game_db verb, for SQL.
- Unknown entity fields are refused with a hint. An entity read of specId returns the warning: "is not an address on this entity: did you mean spectating?". The message lists the addresses. Application data belongs in entity.state.specId.

## Live engine behaviour seen in the room log

- "A tree-derived entity deviated by a local write": ex/chime.js (x4-chime, component tween/state) and ex/marmot.js (s5-marmot, component draw/played-clips) wrote to tree-derived components client-side. The engine says the entity "re-asserts on the wire from here". Writes to tree-derived components from a script that simulates locally do not stick.
- "terrain-support-hold": cone77-0 is held at its pose with no gravity and no contacts. The reason given: terrain chunk (0,0,-5) under its foot is not collidable in place "main" yet, and not streamed here. The body holds until the floor is installed.
- Log lines carry a stack and the script path, for example spawn-world:ex/chime.js (chime.js:10:17). A script fault is traceable to the file and line.

## Open, found by this probe

- The world's spawn area has a terrain chunk at (0,0,-5) that is not streamed for the arriving body. Objects standing there hold their pose. The owner should check the chunk.
- x4-chime and s5-marmot write tree-derived state from a script. Their writes are overwritten on the next tree sync. Either move the state to a server-side write or accept the re-assert.

## Probed later, in a preview room (see below)

- Hook run order (onSpawn, update, onCollide): measured. ears.press, onTriggerEnter and onInput have not been measured in order.
- ctx.destroy, ctx.sleep and ctx.commit: probed; force semantics not measured.
- Physics step rate (33.3 ms) and collision order (avenue before terrain stream): measured. Only one dynamic shape was tested.

## Probe 7 and 8 results (2026-11-05, room main, engine d97df42f, read-only except the spawn test)

- Assets: ctx.world.assets has 76 entries. Most are "/cdn/value.<sha256>.<ext>" uploads (glb, mp4, jpeg, png); cdn names such as "/cdn/neutral-default-avatar.glb" and "/cdn/moodboard-painterly-fantasy/sfx-achievement-chime.mp3"; one absolute spawnfile.io URL (the fr61-figure model).
- Place "main": worldBounds { bottom: -20 }; defaultSpawnPoint { x: 0, y: { terrain: 0 }, z: 0 }; mode "3d"; terrain keys: decorations, generator, kind, materials, seed, marks, spacing. ctx.place.fields is empty. ctx.place.material and ctx.place.lighting are empty objects.
- Terrain height read with ctx.getTerrainHeight: 0 at (0,0), (10,0), (0,10), (-40,-270).
- Quality "high". ctx.session has no keys in exec.
- Object count varies between joins (1502, 585, 1480 seen). The room boots from the live tree and its count is not fixed.
- Tag counts (1480 objects): plinth 143, spline-generated 120, interactable 107, systems-wing 44, road 30, road-marking 22, fence 16, post-and-rail 16, cone77 14, boardwalk 14, powerline 13, wood-distribution 13.
- Spawn spec used: { feetPosition, primitive: { kind: 'box', width, height, depth }, lifetime }. A spawned object exposes: id, objectId, tags, feetPosition, state, behavior, place, audience, visibility, scope, retention, simulatedBy, controller, userId.
- ctx.sleep(0.5) in exec keeps the object visible. ctx.destroy(id) removes it at once (getObject returns null). ctx.destroy([id]) with an array also removes it. Provenance lists destroyedCount.
- ctx.spawn returns "object/<hash>/<n>".

## Hook order attempt (2026-11-05, final)

- A probe module (scripts/probe-hook-order.js, logging onSpawn, update, onCollide) and a placed row x-hook-probe in places/main/cells/x0z0.scene were pushed (commit 6b44544). The row was not in the live room: ctx.getObject found nothing, and ctx.query for the probe tag returned []. Total object count was 1479.
- Logs from the joined room contained no 'order:' lines and no scene warnings for the row.
- Cells near spawn load (cm-chat-* ids are present), so the cell was loaded but the row was not. Cause not found: rows may be served from a cached "live at server" copy.
- Both probe commits were reverted and pushed (f34590c). Probe 9 and 10 scripts are in probes/.
- The live room does not show pushed rows; use `spawn preview` to test tree changes without a push. Hook order was later measured in a preview room (see below).


## Hook order and physics, measured in a preview room (2026-11-05)

Tool: `spawn preview /workspace/game-6 --room <name> --render none --ttl 900` runs the working tree (origin/main plus uncommitted files) in its own room, with no push. Join it with `spawn client exec --read-only --name <preview session>` and read logs with `spawn client logs --name <session>`.

What made the first probes fail: a placed row with `primitive: {kind: scripted, script: X}` expects X to export `geometry()`. A behavior script goes in `behavior: X` on the row, and the primitive is a plain shape. Probe row: `behavior: scripts/probe-hook-order.js`, `physics: dynamic`, `primitive: {kind: box, ...}`.

Measured order (log ms from the room's clock): onSpawn at 224, update-first at 227, onCollide with `avenue` at 275, onCollide with `terrain/stream/main/0:0:0` at 278 and then repeats (x17 by 518). The `terrain-support-hold` ran until onSpawn ran (released at 227).

Physics: the dynamic box started at y=2 and rested at y=0.05 on the floor. The sim-health line gives a 33.3 ms step (30 Hz tick).

Collision order: `onCollide` with the static avenue fires before the terrain stream chunk. The terrain stream repeats per contact.


## ctx.commit write probe (preview room, 2026-11-05)

Ran `ctx.commit(message, fn)` in a preview room (`spawn preview`, no push). `fn` ran and called `ctx.spawn({...})`. The result: `ops: [{op: "place", cell: "places/main/cells/x0z0.scene", id, overrides}]`, `placedOver` the same cell, `says` set to the message, `changesApplied: true`, `worldMutated: true`. The world version stayed at 470 in the preview. So ctx.commit records a place op against the cell file that holds the spawn point, and the spawned object is in the room. The write does not run in a live world without a push. The `fn` argument is not given a spec; mutations are calls made inside `fn`.


## Final runtime probe (2026-11-05, joined room main, read-only)

`spawn client join @lanmower/the-savi-gallery --ttl 300 --name probe`, then `spawn client exec --read-only --name probe`. Result: `ctx.world.version` is 303, `typeof ctx.awaitJob` is "function", and the ctx keys matching /job/i are `job` and `awaitJob`. So the runtime has the awaitJob path the new docs pair with `video:generate`. The preview banner calls the tree "version v475" while a joined room reports `ctx.world.version` 303: those are different version numbers, not a stale room. The session was left ("your account stands 0 bodies now") and the two abandoned preview sessions were left by name.
The join banner names the room engine as d6697aeb, which is neither the docs clone HEAD fb764b7 nor its kernel pin 1042969a3d94: the docs pin and the runtime engine hash are different identifiers.


## Hook and destroy probe batch (2026-11-05, preview room hooks4, engine 26ad9a7a)

A pushed probe commit (fbd159a, later reverted as 02cc5c8) placed `x-probe-hooks` (trigger box, `behavior: scripts/probe-hooks2.js`), and two dynamic spheres. `spawn preview /workspace/game-6 --room hooks4 --render none --ttl 900` booted specVersion 477 with those rows; the joined live rooms stayed on specVersion 305 and never saw them.

- `ctx.emit('press', { by }, { to: 'x-probe-hooks' })` rang `p2:ears.press` (tick 1666).
- `ctx.commit('probe: place a falling trigger ball', () => ctx.spawn({ ..., behavior: 'scripts/probe-hooks2.js', physics: 'dynamic' }))` bound the tree behavior. Log order: `p2:onSpawn`, `p2:onInput`, `p2:update dt=0.03333333333333333` all at tick 6682; `p2:onTriggerEnter` at 6700; `p2:onCollide terrain/stream/main/0:0:0` at 6705.
- Plain `ctx.spawn` with `behavior` fails with "Script source not found in spec.scripts"; adding `scripts: {...}` is refused ("scripts" is not a key of an object: dropped).
- Runtime-spawned objects with `physics: 'dynamic'` stayed at y=40 over 20 samples at 50 ms; placed dynamic rows fall.
- `ctx.destroy` without force removed runtime objects, tree-derived objects (cm-top-rock, cm-editor-label) and parents (sys70). On a live player body it refused: "api.destroy did not delete ... it is a live player's body; nothing changed. Pass { force: true } to delete a player on purpose." With `{ force: true }` it removed the body. See kernel-worker.md for the kernel strings.
- Full hook catalog, aliases, force guard and the 30 Hz constant are in kernel-worker.md.


## Rendered visual check and publish (2026-11-05)

A playwriter page was opened in a separate browser context at `https://www.spawn.co/@lanmower/the-savi-gallery@dev?world=1` (1280x720) and screenshotted after the world booted: `/workspace/savi/.spawn/visual/spawn-dev.png` (loading screen) and `/workspace/savi/.spawn/visual/spawn-dev-2.png` (rendered world). The rendered frame shows the HUD banner "S/W to walk the avenue. every plinth is a working power", the PASSPORT counter "0 / 166 exhibits", and two dark-blue plinth label plates with white text. So restored `ui` markup renders on world-space faces.

`POST /api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f/publish` returned HTTP 200 with `{"ok":true,"fold":"now","movedFrom":"197982bb4eab606ccea35398e2ac405147e13515","publish":{"id":"3db5540a-0230-49fc-a103-4b5102a1bab4", ... "spec_version":508, "world_commit":"f66e3e6d7c0b2fdc18b07eea2913d715ed4d4815"}}`. The public page now serves spec 508 with the full signage restored. A push never publishes by itself; this POST was the explicit step.


## Full hook order, lateUpdate and two dynamic shapes (2026-11-05, preview room qprobe3)

A preview room at specVersion 508 carried uncommitted probe rows: `q-probe-trigger` (kinematic trigger box), `q-probe-a` (dynamic sphere from y=20), `q-probe-b` (dynamic box from y=45), all with `behavior: scripts/q-probe.js` exporting onSpawn, update, lateUpdate, onInput, onTriggerEnter and onCollide.

The two different shapes both fell and reported ground contacts at different ticks: `q:onCollide terrain/stream/main/0:0:0` for `q-probe-a` at tick 1833 and for `q-probe-b` at 1853. So a sphere and a box with different start heights reach the ground on different ticks, as expected.

To capture hooks after the client attached, `ctx.commit('q: place a fresh probe after the client attached', () => ctx.spawn({ ..., behavior: 'scripts/q-probe.js' }))` placed a live ball. The log order, all at tick 6857:

```
6857  q:onSpawn
6857  q:onInput
6857  q:update dt=0.03333333333333333
6857  q:lateUpdate dt=0.03333333333333333
6878  q-probe-trigger  q:onTriggerEnter
```

So `lateUpdate` runs after `update` in the same tick, measured live rather than inferred from the kernel catalog alone. `onInput` fired on a freshly placed non-player object, which conflicts with the catalog note that it "fires only on the player or controlled entity": treat the catalog wording as the documented rule, not an invariant. sim-health confirmed `q-probe.js lateUpdate` and `q-probe.js update` running once per tick per object (for example x2694 lateUpdate calls over 898 ticks across three probe objects).

A local `feetPosition` write on a placed tree-derived object does not restart physics (both objects stayed at the written heights over 20 samples); the engine re-asserts tree-derived components, so runtime repositioning is not a way to sample a fall.


## video:generate invoked (2026-11-05)

A joined room with `--engine 26ad9a7aa2a8a81fbf40ea21c91dab3f` (a cached worker, needed because the newest engine's worker was not downloadable) ran `ctx.job('video:generate', { prompt, seconds: 5, aspect })`.

- `aspect: '16:9'` was refused: `Invalid request: aspect: Invalid enum value. Expected '16x9' | '9x16' | '1x1' | '4x3' | '3x4' | '21x9'`. The api-reference lists `aspect` but not its enum; the runtime does.
- `awaitJob(id)` inside `run_script` is refused with `console_cannot_await`: "A job starts when the run that asked for it lands ... To keep a job's result, call ctx.job from a behavior or sim.js hook and keep the result in state."
- With `aspect: '16x9'` and no awaitJob, the job started as `job-exec3-67` and returned `job video:generate (job-exec3-67): failed; This clip was not made: this game can't make more clips right now. Try again in about 8 hours. (fuel_empty)`.

So the job id, argument shape and fuel guard are confirmed live; the clip itself cannot be produced until the game's clip fuel refills (about 8 hours). Nothing was spent and no asset was created.


## Kernel rollout and the published boot check (2026-11-05)

After publishing spec 508, a cold headless browser at https://www.spawn.co/@lanmower/the-savi-gallery was screenshotted at 30 s (`/workspace/savi/.spawn/visual/spawn-published.png`), 75 s (`spawn-published-2.png`) and 130 s (`spawn-published-3.png`). All three still show "Still downloading the game. Keep this tab open." with the progress bar advancing from about 4/11 to 9/11. The earlier @dev page with partial signage rendered in about 37 s (`spawn-dev-2.png`).

This is an engine rollout gap, not a tree fault. The room-host logs in this session named engines f896c16d and 6daf04f6 whose workers timed out at step=worker, and the engine docs clone now has commits `c79c896 kernel f896c16ddb10` and `5aeb778 kernel 6daf04f60128`: the docs pin advanced before those workers became downloadable. Forcing a cached engine with `--engine 26ad9a7aa2a8a81fbf40ea21c91dab3f` made a joined room boot in about 8 s, which confirms the cause. The published page was left as is; a later retry should boot once the rollout completes.
