I could not write the file, because the harness rejected the Write call for a report file. The analysis follows as text, with the JSON line last.

# Analysis: scripts/ex chunk 1 of 3

Scope: the entries at 1-based ls index 1, 4, 7, ... of /workspace/game-6/scripts/ex (58 entries). Index 166 (w7) and 172 (ws) are directories, not files, and are not analysed here (see gaps). 56 .js files analysed.

Method: each file was read in full. Engine calls were checked against ENGINE.md, api-a.md, api-b.md, skills-a.md, skills-b.md and world-usage.md by substring search (awk). "Unverified" means the name or shape is not in the notes. Line numbers are the file's own.

Counting rule for the JSON line: calls = 103 distinct ctx member names (732 occurrences) across the 56 files, counted by `ctx\.[A-Za-z_.]+`; issues = bugs and notes-mismatches listed below.

---

### /workspace/game-6/scripts/ex/aurora.js
- Hooks/calls: export `material(ctx)`; `ctx.param`; builtin/tsl (`time`, `positionWorld`, `positionLocal`, `normalLocal`, `sin`, `smoothstep`, `mix`, `color`); builtin/three `MeshStandardNodeMaterial`.
- Does: TSL shader material with a moving band colour, emissive edge and vertex breathing.
- Issues: none. Unverified: `material` hook, builtin/tsl, builtin/three, `ctx.param` (none appear in the notes).

### /workspace/game-6/scripts/ex/bellbutton.js
- Hooks/calls: `ears.press`; `ctx.self.state`; `ctx.emit` ("ring" with `{to}`, "squash").
- Does: counts presses and rings each bell id in `state.bells` with a rising pitch and delay.
- Issues: none. `ring` is a custom event name; the receiver is in another file.

### /workspace/game-6/scripts/ex/bush.js
- Hooks/calls: `geometry(ctx)`; `ctx.params`, `ctx.lod`, `ctx.random`, `ctx.tri`, `ctx.albedo`, `ctx.color`.
- Does: builds a bush of leaf-card quads whose normals follow an oval, so the bush shades as one volume.
- Issues: none in code. Unverified: `ctx.tri` (GeometryContext is not in the clone, ENGINE 6.3), and the `scripts/tex-leaves.js?kind=` query-string texture path (line 15).

### /workspace/game-6/scripts/ex/c92-flock-mat.js
- Hooks/calls: `material(ctx)`; `ctx.param`; builtin/tsl (`attribute("bird","uint")`, `vec3`, `select`, `fract`, `cos`, `sin`, `float`); builtin/three `DoubleSide`.
- Does: per-vertex flock motion (orbit, flap, bob) and two-colour select in positionNode.
- Issues: none in code. Unverified: the `bird` vertex attribute must be written by the geometry, which is outside this file.

### /workspace/game-6/scripts/ex/c92-lift.js
- Hooks/calls: `ears.press(ctx, {by})`; `update(ctx, dt)`; `ctx.sleep()`; `ctx.self.state`, `ctx.self.session`, `ctx.self.worldFeetPosition`, `ctx.self.feetPosition` (write); `ctx.emit` ("press" with `{to}`, "flash", "playSound", "fx").
- Does: kinematic lift eases between `state.stops` on each E press; call buttons forward the press to `state.lift`.
- Issues: none in code. Unverified: `ctx.sleep` behaviour (ENGINE 6.3 gap); fx DSL `sprite(smoke-puff,...)`.

### /workspace/game-6/scripts/ex/c92-orb.js
- Hooks/calls: `ears.press`; `ctx.self.material.params` (write); `ctx.emit` ("playSound", "squash", "damageNumber", "fx").
- Does: cycles three material modes on each press and writes live material params.
- Issues: none in code. Unverified: `ctx.self.material.params` write path.

### /workspace/game-6/scripts/ex/car77-gate.js
- Hooks/calls: `onTriggerEnter(ctx, other)`; `ctx.getObject`, `ctx.now`, `ctx.self.session`, `ctx.self.state`, `ctx.query({tags})`, `ctx.emit` ("playSound", "fx"); reads `car.controller`, `cs.lapStart`; writes `o.feetPosition`, `o.rotation`, `o.velocity`.
- Does: times laps between a start and a checkpoint gate, writes the best lap to a board, resets knocked cones.
- Issues:
  1. Line 14: the 3 s debounce is stored on the gate session and checked before the checkpoint branch, so a checkpoint crossed within 3 s of the start gate is dropped.

### /workspace/game-6/scripts/ex/car77-voice.js
- Hooks/calls: exports `CHAR`, `PROC`, `setup({ctx, out, params})`; `ctx.audioWorklet.addModule`; `AudioWorkletNode`; `URL.createObjectURL`.
- Does: AudioWorklet inline-four exhaust synthesis; the hull feeds rpm, load, on, speed through `update(p)`.
- Issues:
  1. Lines 78-82: `addModule(...).catch(() => {})` swallows every worklet failure, so a broken processor is silent (weak debugging power).
- Unverified: `setup` audio hook and `ctx.audioWorklet` (not in notes).

### /workspace/game-6/scripts/ex/cave.js
- Hooks/calls: `ears.press`; export `dry(ctx)` (timer target); `ctx.place.acoustics.reverb` (write); `ctx.place.objects[...]` (lamp, moss); `ctx.after`, `ctx.cancel`; `ctx.emit` ("playSound" with `maxDistance`, `bus`; "fx"; "shockwave").
- Does: toggles a cave reverb for the whole place and a lamp/moss look; auto-dries after 28 s.
- Issues: none in code. Unverified: `ctx.place.acoustics` (PlaceDef has `acoustics?`, but the PlaceScopeHandle list does not), and `bus` and `maxDistance` audio fields. Two caves in one place would fight over `reverb`.

### /workspace/game-6/scripts/ex/chests.js
- Hooks/calls: `onSpawn`; `ears.press` (async); `ctx.sql` (two UPDATE statements in one template); `ctx.self.simulatedBy` (documented, api-b 182); `ctx.after`; `ctx.getObject`; `ctx.world`; `ctx.emit` ("playSound", "damageNumber", "fx", "squash", "flash", "shake"); import `../lib/data/commons-market.yml`.
- Does: moves one gem from chest to chest in a SQL transaction guarded by `changes() = 1`.
- Issues:
  1. Lines 14 and 18: `boot` and `press` reschedule themselves with `ctx.after` while `simulatedBy` is not "platform". If the write is refused, they loop every 0.3-0.5 s with no cap.
  2. Line 23: atomicity of a two-statement `ctx.sql` template is asserted in the comment but not stated in the notes (gap).
  3. Line 40: `ctx.emit("shake", ...)` is not an ActPayload name in the notes (ENGINE 4.10 lists `screenShake`).

### /workspace/game-6/scripts/ex/climb.js
- Hooks/calls: `onSpawn`; `boot`; `ears.press` (async); `ctx.sql` (INSERT ... ON CONFLICT (user_id) DO UPDATE; SELECT ... LIMIT 10; COUNT); `ctx.world.date`; `ctx.getObject`; `ctx.log`; `ctx.emit`.
- Does: counts climbs per user in a shared table and renders the top ten on a board.
- Issues:
  1. Line 28: `p?.userId ?? by` falls back to the object id when there is no userId, so non-user keys enter the same table.
  2. Lines 17 and 21: the same self-rescheduling loop as chests.js when `simulatedBy` is not "platform".
- Unverified: the `summit_climbs` unique index on `user_id` (schema in db.js, not in this file; ON CONFLICT needs it).

### /workspace/game-6/scripts/ex/commons-ui-input.js
- Hooks/calls: `onInput(ctx, input)`; `input.actionData`, `input.pressed`; `ctx.self.session`, `ctx.self.state`, `ctx.self.id`; `ctx.emit` ("talk", "report" with `{to}`); `update(ctx)`; `ctx.getObject`; `ctx.self.feetPosition`, `ctx.self.worldFeetPosition`; imports `page`, `next`, `nodeOf` from ../lib/dialog.js.
- Does: reads ui.js button payloads (commonsUi) for dialog paging, panel messages and reports to the exhibit; closes panels when the player walks away.
- Issues: none in code. Unverified: `input.actionData` (onInput notes name only pressed, held, axes, and released). Line 8 drops a repeated identical payload unless pressed, by design.

### /workspace/game-6/scripts/ex/cursor-rig.js
- Hooks/calls: `update(ctx, dt)`; `onInput(ctx, input)`; `ctx.self.target`, `ctx.self.hideLocalPlayer`, `ctx.self.rotation` (lookAt with include), `ctx.self.feetPosition`; `ctx.player?.id`; `ctx.now`; `ctx.emit` ("charge" with `{to}`, "place-stone", "playSound"); builtin/physics `getInputRay`, `raycast`.
- Does: a script-driven cursor camera: orbit pose each tick; click raycasts into the world; hold mode times a charge.
- Issues:
  1. Line 25: `raycast(..., { distance, bodies: "static" })`. `bodies` is not an option named in the notes (raycast notes list `distance` and `ignoreEntities`).
- Notes check: `input.released` is documented (api-b 55). The cameras gotcha on `{source:"script"}` with `pointerLock:false` names driven hulls; this rig is not a hull, so the gotcha is not triggered, but confirm.

### /workspace/game-6/scripts/ex/dmbell.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.getObject(by)`; `ctx.notifyDmOnce(key, message, {to:{userId}, link:"+main"})`; `ctx.emit` ("shake", "flash", "fx", "playSound").
- Does: rings the presser's Spawn bell once per player per key.
- Issues:
  1. Line 7: `to: { userId }` and `link` in NotifyDmOptions are not shown in the notes; the notes example uses `to: player`. Dedupe semantics are a gap (ENGINE 6.3).

### /workspace/game-6/scripts/ex/editorpillar.js
- Hooks/calls: `editor(ctx, obj)`; `visual(ctx, obj)`; `ears.press(ctx, {by})`; `ctx.authoring.handle` (slider and menu); `ctx.getObject`; `obj.primitive`, `obj.material` (writes); `ctx.emit` ("playSound", "squash").
- Does: god-mode editor panel (Height slider, Colour menu) and an editors-only gauge; players step the colour.
- Issues: none in code. Unverified: `ctx.authoring` and its `handle` API (not in notes).

### /workspace/game-6/scripts/ex/fr-booth.js
- Hooks/calls: `onTriggerEnter(ctx, other)`; `onTriggerExit(ctx, other)`; `ears.press(ctx, {by})`; `other.camera` (write, including null); `other.tags`; `ctx.emit` ("playSound", "fx"); `ctx.getObject`.
- Does: a booth trigger swaps the entering player's camera to an iso or orbit rig; E swaps the mode for everyone inside.
- Issues:
  1. Line 8: the iso rig pairs `orientation.source: "script"` with `pointerLock: false`, the pairing the cameras gotcha warns about for driven hulls. Confirm the booth rig is not a hull.
- Unverified: camera `state` field.

### /workspace/game-6/scripts/ex/fr-geo.js
- Hooks/calls: `geometry(ctx)`; `collider(ctx)`; GeometryContext verbs `ctx.quad`, `ctx.tri`, `ctx.smooth`, `ctx.flat`, `ctx.albedo`, `ctx.color`, `ctx.params`, `ctx.lod`.
- Does: one script builds 12 frontier pieces (cannon, target, gantry, lever, tripod, booth, bellpost, top, liner, sign, cairn, cloud) with a far-LOD box path.
- Issues:
  1. Line 66: `x + 0.05 * Math.sign(-x) * 8` gives a 0.4 m offset, not the 0.05 m the surrounding pattern suggests. Check whether this is intended.
  2. Line 142: when `collider(ctx)` returns null (handle, liner), the far-LOD path falls back to a 1 m cube regardless of the piece's real size.
- Unverified: all GeometryContext verbs (ENGINE 6.3: GeometryContext not in the clone). `ctx.flat?.()` is called optionally, which suggests the verb may be absent.

### /workspace/game-6/scripts/ex/fr-joint.js
- Hooks/calls: `onSpawn`; `ears.press(ctx, {by})`; `ctx.self.joints` (write); `ctx.self.state.joint`; `ctx.getObject(by)`; `ctx.emit` ("impulse" with `{target, impulse, position}`, "playSound", "fx"); `ctx.random`.
- Does: each body declares its own joint from state and E shoves it with an impulse.
- Issues:
  1. Line 9: the stored joint object carries `to` and `type`, which are not JointOptions keys (ENGINE 4.10 lists `target`, `anchor`, `axis`, `limits`, ...). Check the joints schema.
  2. Line 18: `"impulse"` is not an ActPayload name in the notes (ENGINE 4.10).

### /workspace/game-6/scripts/ex/fr-pit.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.query({tags})`; `ctx.destroy(id)`; `ctx.spawn` (lifetime, dynamic physics, dodecahedron, `material.texture`, behavior, state); `ctx.random`; `ctx.emit` ("playSound").
- Does: E drops a stone down a shaft; at most four stones are kept.
- Issues:
  1. Line 7: `live.slice(4)` destroys whatever the query returns beyond the first four. Query order is not stated, so it is not "oldest first".
  2. Line 11: `rim: s.rim` is undefined when the state is unset.
  3. Header line 2: the out-of-bounds return value semantics of `onOutOfBounds` are not stated (ENGINE gap).

### /workspace/game-6/scripts/ex/fr-pool.js
- Hooks/calls: `ears.press`; `ctx.random`; `ctx.emit` ("fx", "playSound").
- Does: E tosses a pebble into a lake mark; the splash plays at a random point in radius 2.
- Issues:
  1. Lines 9-10: `c = s.pool` is unguarded; a missing `state.pool` throws on `c.x`.

### /workspace/game-6/scripts/ex/gate.js
- Hooks/calls: `update(ctx, dt)`; `ctx.sleep()`; `ctx.self.feetPosition` (write).
- Does: a kinematic slab eases its height toward `state.open`.
- Issues:
  1. Line 3: `s.baseY` has no default. If unset, `goal` is NaN and the slab's y becomes NaN every tick.
- Cross-file: plate.js writes `gate.state.open`, which matches this file.

### /workspace/game-6/scripts/ex/gong.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.emit` ("playSound", "shockwave", "slash", "screenFlash", "screenShake", "cameraPunch", "hitstop", "squash", "highlightSet" with `style:"glow"`, "damageNumber" with `value` and `crit`, "slowMo").
- Does: each strike plays the next built-in act in a fixed list.
- Issues:
  1. Line 6: `near` is declared and never used.
  2. Lines 10-17: audiences are `{player: by}` and `{nearby: ...}`. The notes define `Audience` as `{kind:"player", id}` and `{kind:"nearby", position, radius?}`.
  3. Line 16: `damageNumber` with `value` and `crit`, and `slash` (line 9), are not in the notes' ActPayload list.

### /workspace/game-6/scripts/ex/guestbook.js
- Hooks/calls: `onSpawn(ctx)`; `ears.press(ctx, {by})` (async); `ctx.sql` (SELECT, COUNT, INSERT); `ctx.world.date`; `ctx.log`; `ctx.emit` ("playSound").
- Does: appends a guestbook line, then reads the last five and the count into the book's state.
- Issues:
  1. Lines 2, 5-6 and 15: SQL runs in onSpawn and on press with no `simulatedBy === "platform"` guard. chests.js and climb.js use that guard, and api-b 182 and skills-b 25 document it. Check whether this file can run SQL on a client.

### /workspace/game-6/scripts/ex/holdable.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.getObject`; `ctx.spawn` (parent, attachment bone "RightHand", primitive, material, light); `ctx.destroy`; `ctx.self.visible`, `ctx.self.light` (writes); `ctx.emit` ("shake", "playSound").
- Does: E takes the lantern into a player's right hand; E again puts it back.
- Issues:
  1. Line 5: when `s.heldBy` is set, any presser takes the branch that destroys the held item and returns the lantern to the rim. The owner is not checked, so a second visitor can drop the first visitor's lantern.

### /workspace/game-6/scripts/ex/lakelever.js
- Hooks/calls: `ears.press(ctx)`; `ctx.place.terrain.marks` (write); `ctx.place.objects[...]`; `h.rotation`; `ctx.emit` ("playSound" with `maxDistance`).
- Does: a lever adds or removes a lake terrain mark beside the river.
- Issues:
  1. Line 9: the act label is inverted. `on = !marks[key]` is true when the lake is being created (line 7), but line 9 says "drain the lake (delete mark)" for `on`.
  2. Line 14: `s.at.x` throws when `state.at` is unset.
- Unverified: runtime writes to `place.terrain.marks` (skills-a 279 and skills-b 351 mention the runtimeEdits layer, not marks).

### /workspace/game-6/scripts/ex/lever.js
- Hooks/calls: `ears.press(ctx)`; `ctx.self.rotation` (write); `ctx.place.objects[state.lamp]`; `lamp.light`, `lamp.material` (writes); `ctx.emit` ("playSound").
- Does: a lever toggles another object's light and emissive material.
- Issues: none significant. A missing `state.lamp` is a silent no-op with no log.

### /workspace/game-6/scripts/ex/mailbox.js
- Hooks/calls: `ears.press(ctx, {by})` (async); `ctx.sql` (SELECT from guestbook); `ctx.getObject(ctx.self.id + "/flag")`; `p.behavior` (push); `p.state.postOut` (write); `ctx.after(6, "settle")`; `ctx.emit` ("playSound", "fx").
- Does: writes a postcard to the last guestbook signer for postman.js to send.
- Issues:
  1. Line 5: `p.behavior.push(...)` throws when `p.behavior` is undefined (the `?? []` guard only covers the includes check). It also mutates the array in place, unlike side-arrive.js lines 11-12 which reassign.
  2. Line 1 says the postcard goes "through Spawn's mail:send", but this file never calls a job. Only `postOut` state is written. Check postman.js.
  3. Line 20: `ctx.self.id + "/flag"` builds a nested id; the id form is not in the notes (ENGINE 6.2 item 10).

### /workspace/game-6/scripts/ex/marmot.js
- Hooks/calls: `onSpawn`; `ears.press`; `whistle(ctx)`; `ctx.self.anim.idle`, `ctx.self.anim.call` (writes); `ctx.after`; `ctx.self.state.calls`; `ctx.emit` ("fx", "playSound").
- Does: an idle tail-and-head clip plus a one-shot call clip on each press.
- Issues:
  1. Line 13: the `call` channel is set with `loop: false` and never cleared. Whether the engine clears a finished channel is not stated (api-a 248 and 276: channel fields not stated).
- Unverified: anim clip schema (clip as an object with tracks). statue.js uses a different form, a clip path string.

### /workspace/game-6/scripts/ex/minds-fx.js
- Hooks/calls: no hooks. Exports fx strings (`spark`, `GOLD`, `BLUE`, `PINK`, `GREEN`, `DUST`, `SPLASH`, `ZZZ`), `S` (sound paths), `nameOf`, `above`, `yawTo`, `turn`.
- Does: shared effect and math helpers for the Commons MINDS column.
- Issues: none in code. `DUST`, `SPLASH`, `ZZZ`, `PINK`, `GREEN` are not used in this chunk (check the rest of ex). Unverified: relative sibling imports from behaviour modules; fx `r=light(...)`.
- Math check: `yawTo` matches the yaw-0-faces-minus-Z convention; `turn` wraps the shortest arc.

### /workspace/game-6/scripts/ex/minds-guard.js
- Hooks/calls: `updateSchedule = { every: 2 }`; `update(ctx, dt)`; `ctx.sleep(2)`; `ctx.place.players`; `ctx.now`; `ctx.self.rotation`; `ears.noise(ctx, n)`; `ctx.place.objects[...]`; `ctx.emit` ("playSound", "damageNumber", "fx").
- Does: sweeps a post and turns toward the last heard noise for 5 s.
- Issues:
  1. Line 8: `s._yaw` is written into object state every two ticks, which may cost save writes.
- Unverified: the `noise` ear delivery (NoiseEvent is typed in ENGINE 4.10 but its emitter is not in the notes).

### /workspace/game-6/scripts/ex/minds-replay.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.now`; `ctx.emit` ("replay" with `{from, to, scale}` and `{audience:{player: by}}`, "playSound", "fx", "flash"); `ctx.place.objects[...]`.
- Does: replays the last 4 s for the presser at 0.6 speed.
- Issues:
  1. Line 6: `replay` is not an ActPayload in the notes, and `audience` uses the `{player: id}` shape, which differs from the notes. `by` is unguarded.

### /workspace/game-6/scripts/ex/minds-wisp.js
- Hooks/calls: `updateSchedule = { every: { seconds: 0.3 } }`; `update(ctx)`; `ctx.sleep(3)`; `ctx.place.players` (`feetPosition`, `displayName`, `id`); `ctx.self.wisp` (write); `ctx.place.objects[...]` (card); `ctx.emit` ("playSound", "fx"); `ears.press`.
- Does: a speech-card NPC greets the nearest player by name within reach.
- Issues:
  1. Lines 13-14: `near.displayName` and `s.name` are unguarded, so unnamed players and an unset name produce "undefined" in the speech card.

### /workspace/game-6/scripts/ex/musicbox.js
- Hooks/calls: `ears.press(ctx)`; `ctx.self.audio` (write, null to stop); `ctx.place.objects[...]` (`${id}/child-0`, `"x15-notes"`); `lid.rotation`; `notes.fx` (write); `ctx.emit` ("playSound").
- Does: opens or shuts the lid; the music row comes and goes with it.
- Issues:
  1. Line 11: the scene id `"x15-notes"` is hard-coded. A renamed row is a silent no-op.
- Unverified: audio row fields `gain`, `loop`, `spatial`, `maxDistance`, `bus`.

### /workspace/game-6/scripts/ex/organ.js
- Hooks/calls: `ears.press(ctx)`; export `dim(ctx, {k})`; `animate` (builtin/tween); `ctx.self.audio.params` (writes); `ctx.place.objects[...]`; `pipe.material` (write); `ctx.after`; `ctx.emit` ("fx", "playSound").
- Does: a program voice plays a herder's call one note per press; the matching pipe lights and dims.
- Issues:
  1. Line 17: `animate(ctx, pipe.id, ...)` passes an id string; the notes' examples pass an object. `scale` as an array keyframe and `easeOutQuad` are not in the notes.
- Unverified: `kind: "program"` audio with `script` and `params`.

### /workspace/game-6/scripts/ex/pathbot.js
- Hooks/calls: `updateSchedule = { every: 2 }`; `update(ctx, dt)`; `findPath(ctx, from, to, {})` (builtin/nav); `ctx.now`; `ctx.place.players`; `ctx.place.gravity`; `me.velocity`, `me.rotation` (writes).
- Does: walks along findPath points to the nearest player within 10 m, else home.
- Issues:
  1. Lines 5 and 7: `home = s.home` is unguarded; `home.x` throws when `state.home` is unset.

### /workspace/game-6/scripts/ex/plate.js
- Hooks/calls: `onTriggerEnter(ctx, other)`; `onTriggerExit(ctx, other)`; `ctx.place.objects[...]` (gate, plate); `gate.state.open` (write); `plate.feetPosition` (write); `ctx.emit` ("playSound").
- Does: a pressure plate tracks who stands on it and opens its gate.
- Issues:
  1. Line 14: `ctx.self.state.plateY` is unguarded; a missing value gives NaN y.

### /workspace/game-6/scripts/ex/portal.js
- Hooks/calls: `onTriggerEnter(ctx, other)`; `onCross(ctx, other)`; `onRefuse(ctx, other, verdict)`; `ctx.cross(other, state.link)`; `ctx.log`; `ctx.emit` ("playSound", "fx").
- Does: a portal crosses the player to the far place and plays effects on arrival.
- Issues:
  1. Line 3: the guard only stops entities whose `tags` is an array without "player". If `tags` is absent or not an array, every entity is crossed. fr-booth.js line 12 uses the opposite default.

### /workspace/game-6/scripts/ex/reseed.js
- Hooks/calls: `ears.press(ctx)`; `ctx.getObject`; `f.primitive` (read `params.seed`; write a scripted primitive); `f.worldFeetPosition`; `ctx.emit` ("fx", "squash", "playSound").
- Does: E reseeds a lichen field by rewriting its scripted primitive.
- Issues:
  1. Lines 5-6: the seed is read from and kept in `primitive.params`, but ENGINE 4.3 gives the scripted primitive a separate `seed?` field. The comment on line 1 says "one write of primitive.params" while the code writes the whole primitive.

### /workspace/game-6/scripts/ex/screenacts.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.emit` ("flash", "highlightSet" with `style:"glow"`, "screenFlash", "cameraPunch", "haptic" with `{kind:"heavy"}`, "squash", "shockwave", "playSound") with `{audience:{player: by}}`.
- Does: one press runs four acts: the thing flashes, the presser's screen flashes, camera kick, pad buzz.
- Issues:
  1. Lines 4-6: `audience: {player: by}` differs from the notes' `{kind:"player", id}`, and `by` is unguarded.

### /workspace/game-6/scripts/ex/side-arrive.js
- Hooks/calls: `onArrive(ctx, e)`; `onLeave(ctx, e)`; `e.sprite`, `e.hidden`, `e.state`, `e.behavior` (writes).
- Does: dresses a player as the climber and gives them side-runner.js when they enter the side-scroller; undresses on leave.
- Issues:
  1. Cross-file: it relies on `onArrive` and `onLeave`. ENGINE 2.2 says a place-to-place move (`ctx.cross`) fires neither hook (observed in arrival.js), so a door into the side-scroller may leave the player undressed. Verify the path.
- Notes check: `<player>.hidden` is documented (api-a 242). The `sprite` and `behavior` writes on an ObjectView are not confirmed by the notes.

### /workspace/game-6/scripts/ex/side-data.js
- Hooks/calls: none (data module). Exports `LEVEL`, `solid(x, r)`.
- Does: the side-scroller level table and a tile solidity test.
- Issues: none. `LEVEL.flagX` is not read in this chunk (side-runner reads the flag row position).

### /workspace/game-6/scripts/ex/side-runner.js
- Hooks/calls: `update(ctx, dt)`; `ctx.self.place`, `ctx.self.session`, `ctx.self.sprite` (write), `ctx.self.anim.locomotion` (write), `ctx.self.grounded`, `ctx.self.velocity` (write), `ctx.self.hidden` (write), `ctx.self.state`; `ctx.query({anyTags, radius})`; `ctx.getObject`; `ctx.emit` ("playSound", "fx", "screenShake" with `{audience:{player: me.id}}`); imports `LEVEL` (side-data.js) and `HERO` (side-arrive.js).
- Does: rides the player: facing and gait frames, coins, the crab bounce-back, the flag win.
- Issues:
  1. Line 4: `SFX` is built by a `.replace` on a URL string; a literal path does the same job.
  2. Line 53: `flag.state.summits += 1` is NaN when `summits` is unset.
  3. Line 16: `me.place !== 'sidescroll'` assumes `ctx.self.place` is a place id string. Unverified.
  4. Line 50: `audience: {player: me.id}` uses the non-notes shape.

### /workspace/game-6/scripts/ex/soundlab-geo.js
- Hooks/calls: `geometry(ctx)`; `collider(ctx)`; `ctx.params`, `ctx.lod`, `ctx.quad`, `ctx.albedo`, `ctx.color`, `ctx.roughness`, `ctx.metalness`.
- Does: four sound-lab forms (organ, post, bells, cave) from one script.
- Issues:
  1. Lines 52 and 66: `ctx.lod <= 2` has no default. When `lod` is absent the low-detail branch runs, unlike fr-geo.js and bush.js, which use `?? 1`.
- Unverified: GeometryContext verbs (ENGINE 6.3).

### /workspace/game-6/scripts/ex/statue.js
- Hooks/calls: `ears.press(ctx)`; `hush(ctx)` (timer target); `ctx.self.anim.talk` (write, a clip path string); `ctx.after(4.5, "hush")`; `ctx.emit` ("playSound" with `maxDistance`).
- Does: plays the next voice line and a talk animation for 4.5 s.
- Issues:
  1. Lines 11-12 and 15: the `ctx.after` id is not kept, so a second press within 4.5 s is cut short when the first press's `hush` fires and clears the channel the second press set.
- Unverified: `anim` channel shape (the clip here is a `.glb` path string; marmot.js uses an inline object).

### /workspace/game-6/scripts/ex/survey.js
- Hooks/calls: `ears.press(ctx)`; `ctx.place.terrain.heightAt(x, z)`; `ctx.emit` ("damageNumber" with size and lifetime, "fx", "playSound", "squash").
- Does: samples eight heights along a line and shows each.
- Issues:
  1. Line 7: `?? 0` maps a null height to 0.0 m and puts the beam at y=0, which misleads the reader.
- Unverified: `heightAt` signature (named only in the heightmap gotcha, ENGINE 6.1).

### /workspace/game-6/scripts/ex/sys-wing.js
- Hooks/calls: `updateSchedule = { every: { seconds: 1 } }`; `update(ctx)`; `ctx.sleep(...)`; `ears.press(ctx, {by})` dispatching to KIND; exports `sysPop`, `sysCool`, `sysFetched`, `sysRiddled`; `ctx.after`; `ctx.job("sys-fetch", ..., "sysFetched")`; `ctx.job("llm:generate", ..., "sysRiddled")`; `ctx.world.state.sysTally` (write); `ctx.commit` with `ctx.files.read/write`; builtin/physics `raycast`, `overlapPoint`, `traverseCheck`; builtin/tween `animate`; `ctx.spawn` (lifetime, `scope:"session"`, dynamic physics); `ctx.notifyDmOnce`; `ctx.emit` ("playSound", "fx", "flash", "squash", "shockwave", "shake", "milestone", "stat", "highlightSet"); `ctx.getObject`.
- Does: fourteen interactive kinds on the systems wing: fuse, beacon, fetch, riddle, tally, seal, page, laser, trophy, bell, lamp, snow.
- Issues:
  1. Line 46: `ctx.job("sys-fetch", ...)` points at a `jobs/sys-fetch.js` that is not in the tree (`scripts/` has no `jobs` directory). The job id is not in the platform job list (ENGINE 3 item 7). Line 152 reads `r.data.object`, and `sysFetched` (line 147) reads `r.data.line`, neither of which is shown by the notes.
  2. Lines 59 and 69: `ctx.world.state.sysTally` is updated in the behaviour, but the comment says it is a "counter scope in sim.js". The race-free claim is not stated.
  3. Line 60: `shown` is read and never written, so the message always says "1 bumps". Dead state.
  4. Line 163: `busyMsg` is read and never written; the guard is dead.
  5. Lines 70 and 64: the comment says `platformState` keeps `sysSeals` safe, but this file does not declare it. Check the player template.
  6. Line 116: `ctx.emit("fx", ..., {audience:{player: by}})` runs with an undefined `by` when no presser is passed (no guard, unlike lines 114-115).
  7. Lines 71, 101, 129: `animate` gets an id string (`m.id`, `id`), not an object, and uses relative keyframes such as `"+=360"` and array scales, none of which are in the notes. Line 127 `scope: "session"` on spawn is not in the ObjectSpec list (ENGINE 4.1).
- Unverified: raycast hit fields (`distance`, `position`, `id`), overlapPoint and traverseCheck result shapes (`objects`, `traversable`, `blockedBy`), `ctx.commit` fn signature (gap), `ctx.sleep` behaviour (gap), milestone and stat acts, `easeInQuad`.

### /workspace/game-6/scripts/ex/td-camera.js
- Hooks/calls: `update(ctx, dt)`; `ctx.self.target`, `ctx.player`, `ctx.self.session`, `ctx.self.feetPosition` and `ctx.self.rotation` (writes).
- Does: a top-down orthographic rig that follows the player with an eased position.
- Issues: none. The `projection` setting is in the place camera, not in this file.

### /workspace/game-6/scripts/ex/td-policy.js
- Hooks/calls: `onArrive(ctx, entity)`; `onLeave(ctx, entity)`; `entity.sprite` (write).
- Does: dresses an arriving player as a drawn hero and hands the avatar back on leave.
- Issues:
  1. Same cross-place caveat as side-arrive.js: ENGINE 2.2 says `ctx.cross` fires neither hook. Verify that a door into the meadow dresses the player.
- Unverified: `ySort` and the texture path with query string `?kind=hero`.

### /workspace/game-6/scripts/ex/td-tiles.js
- Hooks/calls: `texture(ctx)`; `ctx.canvas(128, 64)`; `ctx.random` (taken as a detached reference, line 3).
- Does: builds a 128x64 top-down tile atlas (grass, flowers, water, path, sand).
- Issues:
  1. Line 3: `R = ctx.random` is a detached method reference. Any engine implementation that reads `this` will break; call it as `ctx.random()` inside a wrapper.
- Unverified: `ctx.canvas` (texture script API is not in the clone).

### /workspace/game-6/scripts/ex/tex-side-flag.js
- Hooks/calls: `texture(ctx)`; `ctx.atlas({frameSize, animations, fps, draw(g, f)})`; `f.frame`.
- Does: a three-frame waving summit flag atlas.
- Issues: none. Unverified: atlas API.

### /workspace/game-6/scripts/ex/tex-side-sky.js
- Hooks/calls: `texture(ctx)`; `ctx.canvas(8, 128)`.
- Does: a vertical oklch sky gradient, 128 rows.
- Issues: none. Unverified: `ctx.canvas`.

### /workspace/game-6/scripts/ex/toast.js
- Hooks/calls: `ears.press(ctx, {by})`; `ctx.emit` ("uiEvent" with `{name, payload}` and `{audience:{player: by}}`, "flash", "playSound").
- Does: sends a one-off toast message to the presser's ui.js.
- Issues:
  1. Line 6: `uiEvent` is not an ActPayload name in the notes, and `by` is unguarded in the audience shape.

### /workspace/game-6/scripts/ex/trade-lib.js
- Hooks/calls: no hooks. Exports `SFX`, `RESTOCK_S`, `held`, `isPlayer`, spec builders (`crystalOnCounter`, `crystalInHand`, `coneInHand`, `coneInPaws`), `SPARKLE`, `NEEDLES`. Calls `ctx.query({tags})`, `ctx.getObject`.
- Does: shared helpers and object specs for the trade stall.
- Issues:
  1. Line 11: `held()` scans every tagged object and compares `g.parent?.id === by`. ObjectView `parent` semantics are inferred (ENGINE 6.3), and the spawn `parent` value is an id string. A mismatch in shape would make `held()` always return null.
- Unverified: material `transparent` and `opacity` fields. `RESTOCK_S` is exported and unused in this chunk.

### /workspace/game-6/scripts/ex/turntable.js
- Hooks/calls: `ears.press(ctx)`; `ctx.self.state`; `ctx.place.objects[...]` (`${id}/top/mini`); `mini.model` (write with `{id, forward, materials}`); `mini.worldFeetPosition`; `ctx.emit` ("squash", "fx", "playSound").
- Does: E toggles a tinted model override on the small hut.
- Issues:
  1. Line 12: `col=<.79,.63,.15>><.56,.68,.54>` has a `>><` token that looks malformed. The same shape is in uipanel-exhibit.js line 8. Check it against the fx grammar.
- Unverified: `materials` override form (DrawMaterialOverrides is not defined in the clone), and the nested id.

### /workspace/game-6/scripts/ex/uipanel-exhibit.js
- Hooks/calls: `ears.press(ctx, {by})`; `ears.report(ctx, {by, op, url, kind})`; `quiet(ctx)`; `ctx.getObject(by)`, `ctx.getObject(s.show)`, `ctx.getObject(s.print)`; `pl.state.cmPanel` (write); `print.material`, `show.material`, `show.ui` (writes); `ctx.self.light` (write); `ctx.after(20, "quiet")`; `ctx.emit` ("playSound", "fx", "squash", "flash").
- Does: opens the ui.js panel on the presser; receives reports and shows photos, a hung picture or a live mic.
- Issues:
  1. Line 8: the LICHEN fx has the same `>><` token as turntable.js line 12.
  2. Lines 27 and 30: `material: {texture: url}` uses `texture`, while the StandardMaterialSpec in the notes uses `albedo` (ENGINE 6.2 item 5).
- Cross-file: the `report` payload matches commons-ui-input.js line 31 (`{by, op, url, kind}`, `to: p.from`).

### /workspace/game-6/scripts/ex/weather.js
- Hooks/calls: `ears.press(ctx)`; `ctx.place.objects[ROW]`; `ctx.destroy(ROW)`; `ctx.spawn(ROW, {tags, feetPosition: {x, z, y:{terrain: 0}}, audience: "all", fx, audio})`; `ctx.place.atmosphere` (writes clouds, fog, wind, wet); `ctx.emit` ("screenFlash").
- Does: cycles clear, rain and snow with an fx follow-player row, plus the place's sky and audio.
- Issues:
  1. Lines 25-26: `ctx.destroy(ROW)` and `ctx.spawn(ROW, ...)` run with the same id in one call. Destroy timing is not stated (ENGINE 6.3 gap), so the spawn may collide with the row being removed.
  2. Line 24: `MODES[s.mode]` throws if `state.mode` holds an unknown value.
  3. Line 11: the quality selector `?ultra:24000|low:4000|12000` has an unlabelled default. Check the fx grammar.
- Unverified: `TerrainOffset` shape `{terrain: 0}` (ENGINE 4.10 names the type only); `audio` row fields; fx DSL (`follow=player`, `collide`, `floor=stick`).

---

### Not analysed
- /workspace/game-6/scripts/ex/w7 (index 166) is a directory with 26 files. Not analysed in this chunk.
- /workspace/game-6/scripts/ex/ws (index 172) is a directory with about 60 files. Not analysed in this chunk.

### Gaps (not answerable from the notes)
- GeometryContext verbs: `ctx.quad`, `ctx.tri`, `ctx.smooth`, `ctx.flat`, `ctx.roughness`, `ctx.metalness` (ENGINE 6.3).
- Texture script API: `ctx.canvas`, `ctx.atlas`, `ctx.param`, and the `texture`/`material` export contract.
- Editor panel API: `ctx.authoring.handle`.
- Audio: `setup` hook, `ctx.audioWorklet`, `kind:"program"` audio, audio row fields.
- Engine behaviour: `ctx.sleep` (ENGINE 6.3), `ctx.commit` fn signature, `ctx.destroy` then `ctx.spawn` on the same id, `onOutOfBounds` return value, `ctx.self.joints` writes, `ctx.self.anim` channel fields.
- Audience shape: files use `{player: id}` and `{nearby: ...}`; notes define `{kind:"player", id}`.
- ActPayload names not in the notes: `shake`, `slash`, `impulse`, `milestone`, `stat`, `uiEvent`, `replay`; `highlightSet` style `"glow"`; easings `easeOutQuad`, `easeInQuad`.
- Physics and nav result shapes: raycast `bodies` option and hit fields, overlapPoint and traverseCheck result fields, `input.actionData`.
- Object id forms: `ctx.self.id + "/child"` used in about 20 places (ENGINE 6.2 item 10).
- Job `sys-fetch`: no `scripts/jobs` directory and no platform job of that name.
- fx DSL beyond `stretch` and `count` (quality `?ultra:`, `follow=player`, gradient `>` tokens).
- `TerrainOffset`, `ObjectView.parent` semantics, `scope` on spawn, `ctx.place.acoustics` writes.
- `simulatedBy` is documented (api-b 182), but guestbook.js does not follow the seat rule it implies (see issues).

{"files": 56, "calls": 103, "issues": 61, "gaps": ["w7 and ws are directories (index 166, 172), not analysed", "GeometryContext verbs ctx.quad/tri/smooth/flat/roughness/metalness not in notes", "ctx.canvas/ctx.atlas/ctx.param texture API not in notes", "ctx.authoring.handle not in notes", "setup audio hook, ctx.audioWorklet, program audio kind not in notes", "ctx.sleep behaviour not stated", "ctx.commit fn signature not stated", "ctx.destroy then ctx.spawn same id: timing not stated", "onOutOfBounds return semantics not stated", "Audience shape: files use {player:id}, notes {kind:'player',id}", "ActPayloads not in notes: shake, slash, impulse, milestone, stat, uiEvent, replay; easeOutQuad, easeInQuad", "raycast bodies option and hit fields; overlapPoint/traverseCheck result fields; input.actionData", "object id forms ctx.self.id+'/child' (ENGINE 6.2 #10)", "job sys-fetch: no scripts/jobs dir, not a platform job id", "fx DSL beyond stretch/count (quality ?ultra:, follow=player)", "TerrainOffset shape, ObjectView.parent semantics, spawn scope field, place.acoustics writes", "anim channel fields and clip shapes", "guestbook.js SQL without simulatedBy seat guard (api-b 182)"]}