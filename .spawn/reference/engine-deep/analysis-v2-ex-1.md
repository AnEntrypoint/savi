CHUNK=ex-1
Selection: the ls index counts .js files only (170 files, 0-based). Indices 0,3,...,168 gave 57 files. `weather.js` (index 169) was read by mistake and is excluded. Engine notes were checked against ENGINE.md, api-a.md, api-b.md, skills-a.md and skills-b.md. Items not in those notes are marked unverified.

**1. /workspace/game-6/scripts/ex/aurora.js**
- Calls: `material(ctx)`, `ctx.param`, builtin/tsl (color, positionWorld, positionLocal, normalLocal, time, sin, smoothstep, mix), builtin/three MeshStandardNodeMaterial.
- Does: TSL shader material with moving colour bands and a breathing skin.
- Issues: `colorNode`, `emissiveNode`, `positionNode` property names are not in the notes (unverified).

**2. /workspace/game-6/scripts/ex/bellbutton.js**
- Calls: `ears.press`, `ctx.self.state`, `ctx.emit("ring", …, {to})`, `ctx.emit("squash")`.
- Does: fans a ring event out to each bell by id.
- Issues: none in-file. The "ring" receiver is outside this chunk (gap).

**3. /workspace/game-6/scripts/ex/bush.js**
- Calls: `geometry(ctx)`, `ctx.params`, `ctx.lod`, `ctx.random`, `ctx.tri`, `ctx.color`, `ctx.albedo("scripts/tex-leaves.js?kind=…")`; returns `{uvs, normals}`.
- Does: builds a bush from shaded leaf-card clusters.
- Issues: `ctx.tri` is documented only in the trees skill (skills-b 239). `ctx.color` is never reset after the loop (L19), unlike fr-geo.js.

**4. /workspace/game-6/scripts/ex/c92-flock-mat.js**
- Calls: `material(ctx)`, builtin/tsl (attribute, float, vec3, sin, cos, fract, color, select, positionLocal, time), builtin/three (MeshStandardNodeMaterial, DoubleSide), `.greaterThan`.
- Does: GPU flock motion: circling, bobbing and flapping in positionNode.
- Issues: `attribute("bird","uint")` needs the attribute on the geometry (tsl gotcha, api-b 302), which this file cannot verify. `attribute`, `select`, `greaterThan`, `DoubleSide` are not in the notes (unverified).

**5. /workspace/game-6/scripts/ex/c92-lift.js**
- Calls: `ears.press({by})`, `update(ctx,dt)`, `ctx.self.state/session/feetPosition/worldFeetPosition`, `ctx.sleep()`, `ctx.emit` (press, flash, playSound, fx).
- Does: kinematic lift eased between two stops; the call button forwards presses.
- Issues: L20 and L29 depend on `ctx.sleep()`, whose behaviour is not stated (gap). L13 `flash.color` is not in the documented flash payload (unverified).

**6. /workspace/game-6/scripts/ex/c92-orb.js**
- Calls: `ears.press`, `ctx.self.material.params` (assign), `ctx.emit` (playSound, squash, damageNumber, fx).
- Does: E steps the orb's live shader params through three modes.
- Issues: `ctx.self.material` is not in the documented self fields (unverified). `damageNumber` `text`/`color` are not in the documented payload (only size and lifetime are).

**7. /workspace/game-6/scripts/ex/car77-gate.js**
- Calls: `onTriggerEnter`, `ctx.getObject`, `ctx.now`, `ctx.self.session`, `ctx.query({tags})`, `ctx.emit` (playSound, fx), writes to `car.state`, `board.state`, cone `feetPosition/rotation/velocity`.
- Does: lap start, far-checkpoint and finish timing with a best-lap board.
- Issues: L14 stamps the 3 s debounce before the `cp` lapStart check, so an early pass blocks the next 3 s. `ctx.self.session` is per-machine (api-a 17), so the debounce is per client, not shared.

**8. /workspace/game-6/scripts/ex/car77-voice.js**
- Calls: `setup({ctx,out,params})`, `ctx.audioWorklet.addModule` (unverified), `AudioWorkletNode`, `URL.createObjectURL`, `CHAR`/`PROC` exports.
- Does: inline-four exhaust synth as an AudioWorklet, fed rpm/load/on.
- Issues: L75–82 `.catch(() => {})` swallows worklet load errors, so failures are silent (debugging power). The `setup` contract for `kind:"program"` audio is not in the notes (only the fields, vehicles 312). `speed` is named in the header but never read. L85 revokes the object URL in dispose, which can run before addModule settles.

**9. /workspace/game-6/scripts/ex/cave.js**
- Calls: `ears.press`, `dry`, `ctx.place.acoustics.reverb`, `ctx.place.objects["${id}/lamp"]` and `/moss`, `.light`, `.material`, `ctx.emit` (playSound with maxDistance and bus "Voice", fx, shockwave), `ctx.after`, `ctx.cancel`.
- Does: E turns the place into a reverberant cave and the yodel plays; it dries after 28 s.
- Issues: `place.acoustics` is not in PlaceScopeHandle (api-b 189; unverified). `bus:"Voice"` and `maxDistance` are not documented (only UI/SFX/Music are named). L13 and L16 replace whole `material` objects. `${id}/lamp` child ids are undocumented (ENGINE 6.2 #10).

**10. /workspace/game-6/scripts/ex/chests.js**
- Calls: `ears.press` (async), `onSpawn`, `boot`, `pressLater`, `ctx.sql` (two statements in one template, `changes()`), `ctx.getObject`, `ctx.after`, `ctx.self.simulatedBy` (read and write), `ctx.emit` (playSound, damageNumber, fx with params, squash, flash, shake); YAML import.
- Does: moves one gem between chests in a single transaction.
- Issues: L23 relies on two statements being atomic with a `changes()=1` guard. The notes say nothing about multi-statement or atomic `ctx.sql` (platform 19–22), so a failed second statement could lose a gem. `r.changes` (L24) is unverified for multi-statement calls. L40 `shake` is not in the documented ActPayloads. `onSeat`/`pressLater` are duplicated in climb.js (L10–21).

**11. /workspace/game-6/scripts/ex/climb.js**
- Calls: `ears.press` (async), `onSpawn`, `boot`, `pressLater`, `refresh`, `ctx.sql` (SELECT, COUNT, INSERT … ON CONFLICT DO UPDATE), `ctx.getObject`, `ctx.world.date`, `ctx.log`, `ctx.emit`, `simulatedBy`.
- Does: counts climbs per user into a top-ten board.
- Issues: L28 falls back to `by` (the ephemeral entity id, which changes each join, api-a 59) when `p` is gone, writing a non-durable key into the table. `COUNT(*)` runs on every press (L8, L30) on a history that grows without end (platform 42). Helper duplicated from chests.js.

**12. /workspace/game-6/scripts/ex/commons-ui-input.js**
- Calls: `onInput` (`input.actionData`, `input.pressed`, `ctx.self.session`), `update(ctx)`, `ctx.emit` (talk, report with `{to}`), `ctx.getObject`, `ctx.self.feetPosition`; imports `../lib/dialog.js` (page, next, nodeOf; not in notes).
- Does: player-side handler for the Commons UI column; dialog paging and panel messages; reports to the exhibit.
- Issues: L26 accepts any `https://` URL as a photo or hang address, and the exhibit then uses it as a texture (see uipanel-exhibit.js), so outside images are rendered. L25–29 says "Shared in chat" for a photo even with no valid url. L17 `s[n.gift]` writes an arbitrary state key from dialog data. `lib/dialog.js` existence is unverified.

**13. /workspace/game-6/scripts/ex/cursor-rig.js**
- Calls: `update(ctx,dt)`, `onInput`, `getInputRay`, `raycast(ctx,o,d,{distance,bodies:"static"})`, `ctx.self.target`, `ctx.self.feetPosition`, `ctx.self.rotation = {lookAt, include}`, `ctx.self.hideLocalPlayer`, `ctx.player?.id`, `ctx.now`, `ctx.emit` (charge, playSound).
- Does: cursor camera rig; click places a stone, hold charges.
- Issues: none clearly wrong. The rotation and lookAt use matches the cameras skill (skills-a 86).

**14. /workspace/game-6/scripts/ex/dmbell.js**
- Calls: `ears.press`, `ctx.getObject`, `ctx.notifyDmOnce(key, msg, {to:{userId}, link:"+main"})`, `ctx.emit` (shake, flash, fx, playSound).
- Does: rings the presser's notifyDm bell once per player.
- Issues: L7 `to:{userId}` is an object form. The notes say `to` is a player row or userId (skills-b 34), so this is unverified. L11 `shake` is undocumented.

**15. /workspace/game-6/scripts/ex/editorpillar.js**
- Calls: `editor(ctx,obj)` with `ctx.authoring.handle({slider|menu})`, `visual(ctx,obj)` (torus plus child box), `ears.press`, `ctx.emit` (playSound, squash), `obj.primitive`, `obj.material`.
- Does: god-mode colour and height panel for a pillar; players step its colour with E.
- Issues: `ctx.authoring` and the handle, slider and menu API are not in the notes (unverified). `material.unlit` (L17) is unverified. L24 spreads a read view into `me.material`.

**16. /workspace/game-6/scripts/ex/fr-booth.js**
- Calls: `onTriggerEnter`, `onTriggerExit`, `ears.press`, `other.camera = {…}|null` (cameras 90), `ctx.getObject`, `ctx.emit` (playSound, fx).
- Does: stepping in gives the player an iso or orbit camera rig; E swaps modes.
- Issues: `state.inside` can go stale if a player leaves without a trigger exit (unverified). L23 `s.swaps` is written and never read (dead state). The camera def matches the cameras skill.

**17. /workspace/game-6/scripts/ex/fr-geo.js**
- Calls: `geometry(ctx)`, `collider(ctx)`, `ctx.lod`, `ctx.params`, `ctx.albedo`, `ctx.color`, `ctx.quad`, `ctx.smooth()`, `ctx.flat?.()`, `ctx.roughness()`, `ctx.metalness()`.
- Does: frontier wing meshes (cannon, target, gantry, lever, tripod, booth and others) and their colliders.
- Issues: L4–9 `face` is copied verbatim into soundlab-geo.js L4–9. `ctx.quad`, `ctx.smooth`, `ctx.flat`, `ctx.roughness`, `ctx.metalness` are not in the geometry notes (skills-a 222–260; unverified). The optional call at L36 suggests `flat` may not exist. L66 brace width depends on the sign of x (works, but hard to read).

**18. /workspace/game-6/scripts/ex/fr-joint.js**
- Calls: `onSpawn`, `ears.press`, `ctx.self.state.joint`, `ctx.self.joints[name] = o` (physics 445), `ctx.getObject`, `ctx.emit` (impulse, playSound, fx with `floor=stick`), `ctx.random`.
- Does: declares a joint from state on spawn; E shoves the body.
- Issues: `impulse` is documented only as an example in skills-a 324, not as a payload (unverified). `floor=stick` is unverified in the fx verbs.

**19. /workspace/game-6/scripts/ex/fr-pit.js**
- Calls: `ears.press`, `ctx.query({tags})`, `ctx.destroy(id)`, `ctx.spawn({tags, lifetime, feetPosition, primitive dodecahedron, physics "dynamic", material{texture,…}, behavior, state})`, `ctx.random`, `ctx.emit playSound`.
- Does: drops stones into a shaft and caps live stones at four.
- Issues: L7 `live.slice(4)` assumes an order that `ctx.query` does not document, so the cap may remove any stones (gap). L11 `material.texture` against api-b StandardMaterialSpec `albedo` (ENGINE 6.2 #5, unreconciled). `dodecahedron radius` is unverified.

**20. /workspace/game-6/scripts/ex/fr-pool.js**
- Calls: `ears.press`, `ctx.random`, `ctx.emit` (fx with cone and sdir, playSound).
- Does: a pebble toss makes a splash and ripple fx at a random point in the lake.
- Issues: L9–10 `s.pool` has no default, so an unset row throws. Otherwise consistent.

**21. /workspace/game-6/scripts/ex/gate.js**
- Calls: `update(ctx,dt)`, `ctx.self.state.baseY/open`, `ctx.self.feetPosition`, `ctx.sleep()`.
- Does: eases a kinematic gate slab to its open height.
- Issues: L4 sleeps and relies on being woken when `open` flips; wake semantics are not stated (gap). `update` runs only near players (ENGINE 18), so a far gate's collider stays put (gap). "Kinematic" is not declared in this file.

**22. /workspace/game-6/scripts/ex/gong.js**
- Calls: `ears.press` over ACTS, `ctx.emit` (playSound, shockwave, slash, screenFlash, screenShake, cameraPunch, hitstop, squash, highlightSet, damageNumber, slowMo) with `{audience:{player:by}}`.
- Does: each strike plays the next built-in act and floats its name.
- Issues: L6 `near` is declared and never used (dead code). `{audience:{player}}` lacks the `kind:"player"` of the Audience type (api-b 143); this form is only observed (ENGINE 6.2 #9). L16 `damageNumber` `value`/`crit` are unverified.

**23. /workspace/game-6/scripts/ex/guestbook.js**
- Calls: `onSpawn` (refresh), `ears.press` (async), `refresh`, `ctx.sql` (SELECT, COUNT, INSERT), `ctx.getObject`, `ctx.world.date`, `ctx.log`, `ctx.emit playSound`.
- Does: shared guestbook; signing inserts a row and shows the last five names.
- Issues: the table grows without limit and `COUNT(*)` scans it on every press and spawn (platform 42). L2 runs SQL from onSpawn without the simulatedBy guard that chests and climb use (platform 25, 39). `ORDER BY id` needs an id column defined in db.js (not in chunk).

**24. /workspace/game-6/scripts/ex/holdable.js**
- Calls: `ears.press`, `ctx.getObject`, `ctx.destroy`, `ctx.spawn({parent, tags, attachment:{bone:"RightHand"}, feetPosition, primitive, material, light})`, `ctx.self.visible`, `ctx.self.light`, `ctx.emit` (shake, playSound).
- Does: picks up a lantern into the right hand; E sets it back.
- Issues: if the holder leaves or a room change destroys the held item (interactive-objects 349), `s.heldBy` stays set and the base lantern stays hidden (L23) until someone presses. `shake` is unverified.

**25. /workspace/game-6/scripts/ex/lakelever.js**
- Calls: `ears.press`, `ctx.place.terrain.marks[key]` (write and delete), `ctx.place.objects[handle].rotation`, `ctx.self.worldFeetPosition`, `ctx.emit` playSound with `maxDistance:120`.
- Does: a lever adds or removes a lake mark beside a river.
- Issues: L14 `maxDistance` is undocumented. The notes do not say whether mark writes are runtime or authored (gap). `s.at` is read without a default (L7, L14).

**26. /workspace/game-6/scripts/ex/lever.js**
- Calls: `ears.press`, `ctx.self.state`, `ctx.self.rotation = {pitch}`, `ctx.place.objects[lamp].light`, `.material`, `ctx.emit playSound`.
- Does: a lever turns another object's light and emissive material on or off (exhibit 10).
- Issues: L6 writes `rotation` without yaw, which drops yaw. L8 replaces the whole `lamp.material` object, and replace semantics are not stated (gap). `emissive` is not confirmed by the notes.

**27. /workspace/game-6/scripts/ex/mailbox.js**
- Calls: `ears.press` (async), `settle`, `ctx.sql` (SELECT … LIMIT 1), `ctx.getObject`, `p.behavior` (read and push), `p.state.postOut`, `ctx.self.state`, `ctx.after`, `ctx.now`, flag child rotation.
- Does: E sends a postcard to the last guestbook signer.
- Issues: L5 `p.behavior.push` throws when `p.behavior` is undefined, and an in-place push on an engine array is not guaranteed to persist (side-arrive L12 assigns instead). Header L1 says the postcard goes "through Spawn's mail:send", but the file never calls `mail:send`. It only writes `postOut` for postman.js, which is outside this chunk. L21 sets roll only.

**28. /workspace/game-6/scripts/ex/marmot.js**
- Calls: `onSpawn`, `ears.press`, `whistle`, `ctx.self.anim.idle/call` (clip data with tracks, loop, weight), `ctx.self.state`, `ctx.after`, `ctx.emit` (fx, playSound).
- Does: marmot idle loop and a whistle with a call animation.
- Issues: the anim channel shape (clip.duration, tracks, loop, weight) is a documented gap (ENGINE 6.3). The IDLE and CALL objects are shared by reference across instances (L2, L3, L12). L12 repeats the onSpawn write.

**29. /workspace/game-6/scripts/ex/minds-fx.js**
- Calls: none. Exports spark, GOLD, BLUE, PINK, GREEN, DUST, SPLASH, ZZZ, S, nameOf (`ctx.place.players`), above, yawTo, turn.
- Does: shared effect, sound and maths helpers for the minds column.
- Issues: `yawTo` (L27) and `turn` (L28) are correct. PINK, GREEN, DUST, SPLASH, ZZZ and several S entries are unused by the three consumers in this chunk. Check other chunks before removing them.

**30. /workspace/game-6/scripts/ex/minds-guard.js**
- Calls: `updateSchedule={every:2}`, `update(ctx,dt)`, `ears.noise`, `ctx.place.players`, `ctx.sleep(2)`, `ctx.now`, `ctx.self.rotation={yaw}`, state writes, `ctx.place.objects`, `ctx.emit` (playSound, damageNumber, fx).
- Does: a guard that turns toward heard noises.
- Issues: delivery of noise events to `ears.noise` is not in the notes (only the NoiseEvent shape, ENGINE 4.10; unverified). `ctx.sleep(2)` combined with `every:2` has no stated interaction. L8 writes `_yaw` into state every 2 ticks, which churns saves (minor).

**31. /workspace/game-6/scripts/ex/minds-replay.js**
- Calls: `ears.press`, `ctx.now`, `ctx.emit("replay", {from,to,scale}, {audience:{player:by}})`, `ctx.emit` (playSound, fx, flash), `ctx.place.objects`.
- Does: replays the last 4 s to the presser at 0.6 speed.
- Issues: the units of replay `from` and `to` (ms or s) are not stated (api-b 129); L6 assumes ms. The audience shape is the observed form (see gong).

**32. /workspace/game-6/scripts/ex/minds-wisp.js**
- Calls: `updateSchedule={every:{seconds:0.3}}`, `update`, `ears.press`, `ctx.place.players` (feetPosition, displayName), `ctx.sleep(3)`, `ctx.self.wisp` (write), `ctx.place.objects[card].state`, `ctx.emit` (playSound, fx).
- Does: a wisp NPC greets players by name when they come within reach.
- Issues: `ctx.self.wisp` read and write shape is unverified (L17). `ctx.sleep(3)` semantics are a gap. The loop over all players runs every 0.3 s per wisp (acceptable).

**33. /workspace/game-6/scripts/ex/musicbox.js**
- Calls: `ears.press`, `ctx.self.state.playing/act`, `ctx.self.audio` (assign TUNE or null), `ctx.place.objects["x15-notes"]`, `ctx.place.objects["${id}/child-0"]`, `.rotation`, `.fx = {script}`, `ctx.emit playSound`.
- Does: lid toggles the music row and the note fx.
- Issues: audio fields gain, loop, maxDistance and spatial are unverified (only the `audio` key is in ObjectPropertiesSpec). `x15-notes` is a hard-coded id.

**34. /workspace/game-6/scripts/ex/organ.js**
- Calls: `ears.press`, `dim`, builtin/tween `animate` (scale waypoints, easeOutQuad), `ctx.self.audio` (program with params, spatial, maxDistance, gain) and `audio.params`, `ctx.place.objects[pipe-k]`, `pipe.material = …`, `pipe.state.h`, `ctx.emit` (fx, playSound), `ctx.after(0.9,"dim",{k})`.
- Does: each press plays the next note on a program voice and lights its pipe.
- Issues: L13 references scripts/ex/synth.js, which is outside this chunk (existence unverified). L20–31 replaces whole pipe materials. Rapid presses stack `dim` timers (harmless because of the lit check at L29).

**35. /workspace/game-6/scripts/ex/pathbot.js**
- Calls: `updateSchedule={every:2}`, `update(ctx,dt)`, builtin/nav `findPath(ctx,f,goal,{})`, `ctx.place.players`, `ctx.place.gravity.y`, `ctx.now`, `me.session`, `me.velocity` and `me.rotation` writes.
- Does: maze bot paths to the nearest player.
- Issues: L11 accepts `r.points` without checking `ok`, so a cut-off path is followed (the nav notes say this is a valid answer, but the file does not handle it explicitly). L7 has no default for `s.home`. L18 overwrites velocity every tick.

**36. /workspace/game-6/scripts/ex/plate.js**
- Calls: `onTriggerEnter`, `onTriggerExit`, `ctx.self.state.on`, `ctx.place.objects` (gate, plate), `gate.state.open`, `plate.feetPosition`, `ctx.emit playSound`.
- Does: a pressure plate opens its gate while someone stands on it.
- Issues: L14 uses `state.plateY`, which is undefined unless set, so the plate y becomes NaN. If an exit never fires, the gate stays open (unverified).

**37. /workspace/game-6/scripts/ex/portal.js**
- Calls: `onTriggerEnter`, `ctx.cross(other, state.link)`, `onCross`, `onRefuse`, `ctx.log`, `ctx.emit` (playSound, fx).
- Does: a gate to another place, with a crossing effect.
- Issues: L12 `onRefuse` only logs, while worldgate.js shows a damageNumber for the same case. The tag check (L3) differs from fr-booth's idiom. The header says the glass shows the far place through `material.view.link`, but the file never sets material (gap).

**38. /workspace/game-6/scripts/ex/reseed.js**
- Calls: `ears.press`, `ctx.getObject`, `f.primitive` (read and replace), `f.worldFeetPosition`, `ctx.emit` (fx, squash, playSound).
- Does: E reseeds a scripted lichen field.
- Issues: L6 replaces the whole primitive and hard-codes `script:"scripts/ex/lichen-field.js"`. The header (L1) says it writes only primitive.params, and the field's own script is ignored. L8 fx `col=oklch(...)` grammar is unverified.

**39. /workspace/game-6/scripts/ex/screenacts.js**
- Calls: `ears.press` over STEPS, `ctx.emit` (flash, highlightSet, screenFlash, cameraPunch, haptic with `{audience:{player:by}}`, squash, shockwave, playSound).
- Does: one press runs four acts: thing flash and glow, presser screen flash, camera punch, heavy haptic.
- Issues: `by` may be undefined (L4–5, L10), which targets nobody. `flash.color` and `highlightSet` fields are unverified.

**40. /workspace/game-6/scripts/ex/side-arrive.js**
- Calls: exports HERO (texture, size, upright, lit), `onArrive`, `onLeave`, `e.sprite`, `e.hidden`, `e.state`, `e.behavior` (read and write).
- Does: dresses players as the climber and gives them the runner on arrival; undresses on leave.
- Issues: `lit:false` is unverified. onLeave does not fire on ctx.cross (observed, ENGINE 6.2 and arrival.js), so side-runner L16 compensates. `tex-side-hero.js` existence is unverified.

**41. /workspace/game-6/scripts/ex/side-data.js**
- Calls: none. Exports LEVEL and `solid(x,r)`.
- Does: level table and solidity test for the side-scroller.
- Issues: `LEVEL.start` is assigned by reference to feetPosition in side-runner L21. If the engine keeps the reference, later mutation could change the shared level data (unverified). The row semantics match the header.

**42. /workspace/game-6/scripts/ex/side-runner.js**
- Calls: `update(ctx,dt)`, `me.place`, `me.session`, `me.feetPosition/velocity` writes, `me.grounded`, `me.sprite`, `me.anim.locomotion`, `me.hidden`, `me.state`, `ctx.query({anyTags,radius})`, `ctx.getObject(flag).state.summits`, `ctx.emit` (playSound, fx, screenShake with audience).
- Does: runner logic: facing and animation frames, coins, crab bounce, flag win.
- Issues: L53 `flag.state.summits += 1` gives NaN unless summits was initialised elsewhere. L4 builds the SFX prefix with a runtime `'https://spawn.co/…'.replace(…)` string trick; use a literal. L32–33 assumes it runs after player.js, but hook order is not stated (ENGINE 6.3 gap). `anim.locomotion.loop` is unverified.

**43. /workspace/game-6/scripts/ex/soundlab-geo.js**
- Calls: `geometry(ctx)`, `collider(ctx)`, `ctx.lod` (no default), `ctx.albedo`, `ctx.color`, `ctx.roughness`, `ctx.metalness`, `ctx.quad`, local face, box and tube.
- Does: four geometry forms (organ, post, bells, cave).
- Issues: L4–9 duplicates fr-geo.js `face`. L52, L66 and L85 use `ctx.lod` raw; undefined makes `<= 2` false and selects low detail, while fr-geo uses `?? 1`. The cave collider (L114) is a 0.3 m slab at the back (z 0.4 to 0.7), not the arch walls spanning z −0.7 to 0.7, so players can pass through side walls (geometry notes: the collider is the shell a body touches). `roughness` and `metalness` are unverified.

**44. /workspace/game-6/scripts/ex/statue.js**
- Calls: `ears.press`, `hush`, `ctx.self.anim.talk` (write and null), `ctx.after(4.5,"hush")`, `ctx.emit playSound` with maxDistance.
- Does: voice-line exhibit; E plays the next line and a talk animation.
- Issues: L11 uses the anim clip address `cdn/clip-talk-loop.glb` (no leading slash), while L10 uses `/cdn/...` for sounds. Both forms appear in one file (ENGINE 6.2 #4). L12–13 do not cancel the earlier `hush` timer, so a second press lets the first timer clear the new talk animation early. The anim value shape is unverified and `maxDistance` is undocumented.

**45. /workspace/game-6/scripts/ex/survey.js**
- Calls: `ears.press`, `ctx.place.terrain.heightAt(x,z)`, `ctx.emit` (damageNumber with size and lifetime, fx, playSound, squash), `ctx.self.state.line`.
- Does: samples terrain height at eight points on a line and shows each reading.
- Issues: `ctx.place.terrain.heightAt` is not in the notes. heightAt appears only as the generator ctx and builtin/three `ctx.terrain` (heightmap 267, 289), so this is unverified.

**46. /workspace/game-6/scripts/ex/sys-wing.js**
- Calls: `ears.press` (KIND dispatch), `updateSchedule={every:{seconds:1}}`, `update`, `ctx.sleep`, `ctx.spawn` (scope "session", lifetime, physics dynamic), `ctx.commit` with `ctx.files.read/write`, `ctx.notifyDmOnce`, `ctx.job("sys-fetch",…,"sysFetched")`, `ctx.job("llm:generate",…,"sysRiddled")`, `ctx.world.state.sysTally`, `ctx.getObject`, `raycast`, `overlapPoint`, `traverseCheck`, `animate` (relative "+=360"), `ctx.emit` (fx, playSound, flash, shake, milestone, stat, highlightSet, squash).
- Does: twelve readout steles (fuse, beacon, fetch, riddle, tally, seal, page, laser, trophy, bell, lamps, snow).
- Issues: L88 `traversable` and `blockedBy` fields of TraverseCheckResult are not stated (gap). `milestone` (L98), `stat` (L98) and `shake` (L109) acts are not in the notes. L157 declares a 1 Hz schedule for all twelve steles, though only the beacon needs it, so every stele wakes each second to sleep. L163 `s.busyMsg` is never set, so the condition is dead. L33 `SPARKS.replace("burst=18..26","rate=24")` silently does nothing if the constant changes. L59 mutates a nested `world.state` object, and the header's "never lost to a race" is unverified. L46 and L54 callbacks read `r.data.line` and `r.data.object`, which are outside this chunk (sys-fetch job). The ctx.commit fn signature is a gap (L77).

**47. /workspace/game-6/scripts/ex/td-camera.js**
- Calls: `update(ctx,dt)`, `ctx.self.target`, `ctx.player`, `ctx.self.session.at`, `ctx.self.feetPosition`, `ctx.self.rotation {yaw,pitch,roll}`.
- Does: top-down follow camera straight down over the player.
- Issues: the height is 20 (L5) where the cameras recipe uses 15. This is not a bug. Otherwise consistent with cameras 99.

**48. /workspace/game-6/scripts/ex/td-policy.js**
- Calls: `onArrive`, `onLeave`, `entity.sprite = {texture, size, ySort, upright}`, `entity.tags`.
- Does: dresses meadow arrivals as a drawn hero and hands the avatar back on leave.
- Issues: `td-art.js` existence is unverified. onLeave does not fire on ctx.cross (observed), and nothing else in this chunk resets the sprite on a door exit.

**49. /workspace/game-6/scripts/ex/td-tiles.js**
- Calls: `texture(ctx)`, `ctx.canvas(128,64)`, `ctx.random` (`R = ctx.random`, L3).
- Does: 128×64 top-down tile atlas (grass, flowers, water, path, sand).
- Issues: L3 detaches `ctx.random` from its object, which fails if it depends on `this`. Tiles 5–7 are duplicate grass fillers (L14). `ctx.canvas` is not in the notes (unverified).

**50. /workspace/game-6/scripts/ex/tex-side-flag.js**
- Calls: `texture(ctx)`, `ctx.atlas({frameSize, animations:{wave:3}, fps, draw(g,f)})`, `f.frame`, canvas `fillRect`.
- Does: a 48×128 waving summit-flag atlas.
- Issues: matches 2d-mode atlas usage (2d-mode 20). `f.frame` is unverified. No bugs found.

**51. /workspace/game-6/scripts/ex/tex-side-sky.js**
- Calls: `texture(ctx)`, `ctx.canvas(8,128)`, oklch fillStyle.
- Does: vertical sky gradient strip for the side-scroller backdrop.
- Issues: `ctx.canvas` and oklch in canvas gradients are unverified. Matches the backdrop rule (2d-mode 35).

**52. /workspace/game-6/scripts/ex/toast.js**
- Calls: `ears.press`, `ctx.emit("uiEvent", {name,payload}, {audience:{player:by}})`, `ctx.emit` (flash with color, playSound).
- Does: sends a one-off toast to the presser's ui.js.
- Issues: `flash.color` is unverified. The uiEvent route matches game-ui.

**53. /workspace/game-6/scripts/ex/trade-lib.js**
- Calls: none directly. Exports SFX, RESTOCK_S, `held(ctx,by,tag)` (`ctx.query`, `ctx.getObject`, `g.parent?.id`), `isPlayer`, spec builders (`parent`, `attachment`, scripted pinecone), SPARKLE and NEEDLES fx.
- Does: shared helpers for the trade stall.
- Issues: `ObjectView.parent` is inferred, not stated (gap). `scripts/ex/trade-geo.js` (L18) and `scripts/ex/pinecone.js` are outside the chunk and unverified. RESTOCK_S is unused here.

**54. /workspace/game-6/scripts/ex/turntable.js**
- Calls: `ears.press`, `ctx.place.objects["${id}/top/mini"]`, `mini.model` (assign with `forward`, `materials`), `ctx.emit` (squash, fx, playSound).
- Does: swaps a small uploaded model's paint on a turntable.
- Issues: L4 uses the leading-slash form `/cdn/value.…glb`, while uploaded-models 267 uses `cdn/value.<sha>…` (ENGINE 6.2 #4). L22 reassigns the whole model each press, which may reload the asset rather than override materials only. L12 `col=<.79,.63,.15>><.56,.68,.54>` has a doubled `>`, which looks like a grammar typo (fx grammar unverified). `${id}/top/mini` is an undocumented id form.

**55. /workspace/game-6/scripts/ex/uipanel-exhibit.js**
- Calls: `ears.press`, `ears.report`, `quiet`, `ctx.getObject`, `pl.state.cmPanel` (write), `ctx.self.light` (write), `ctx.after(20,"quiet")`, `ctx.emit` (playSound, squash, fx, flash), `print.material` and `show.material` (assign with texture).
- Does: opens a ui panel on the presser and handles photo, hang and mic reports.
- Issues: L8 has the same doubled `>` typo as turntable L12. L27 and L30 render the player-supplied URL as a texture (see commons-ui-input L26). `texture` is the unreconciled key (ENGINE 6.2 #5). L25 says "shared" even when the print board is missing. Otherwise consistent with commons-ui-input's report to `from`.

**56. /workspace/game-6/scripts/ex/wallet.js**
- Calls: `updateSchedule={every:{seconds:0.5}}`, `update`, `ears.press`, `ctx.place.players` (feetPosition, displayName, state), `ctx.getObject`, `p.state.coins` and `lichenBadges` (read and write), `ctx.emit` (playSound, damageNumber, flash, fx, shake), builtin YAML `M.wallet`.
- Does: a coin counter where players spend balance on a badge.
- Issues: L25–26 keeps the balance in plain `player.state.coins`. Cheat-proofing needs `platformState` on the player template (platform 24; ENGINE 5.6 #6), and that declaration is not in this chunk (gap). The debit and credit are in one tick (atomic per ENGINE 5.6 #3). L8 loops over all players every 0.5 s, which is acceptable.

**57. /workspace/game-6/scripts/ex/worldgate.js**
- Calls: `onTriggerEnter`, `ctx.cross(other, state.link)`, `onCross`, `onRefuse` (damageNumber with lifetime), `ctx.emit` (playSound, fx).
- Does: plaza gate to other places of the same world.
- Issues: none in-file. Refusal feedback here differs from portal.js (see there). Matches the portals skill.

Gaps for the parent:
- `ctx.sleep` semantics and wake behaviour (c92-lift, gate, minds-guard, minds-wisp, sys-wing).
- `ctx.commit` fn signature (sys-wing L77).
- Multi-statement `ctx.sql` atomicity and `changes` (chests L23).
- `ctx.query` ordering (fr-pit L7).
- Hook and behaviour execution order (side-runner L32).
- Replay `from`/`to` units (minds-replay).
- Anim channel and clip shape (marmot, statue, side-runner).
- Mark writes, runtime or authored (lakelever).
- Material assignment: whether it replaces or merges (cave, lever, organ, uipanel-exhibit).
- Undocumented act payloads: shake, milestone, stat, impulse, damageNumber extra fields, flash color, playSound bus and maxDistance.
- `ctx.authoring` API (editorpillar), `ctx.audioWorklet` and program audio setup contract (car77-voice), `ctx.canvas`, `ctx.quad`, `ctx.roughness`, `ctx.metalness`, `ctx.smooth`, `ctx.flat`.
- `place.acoustics`, `place.terrain.heightAt`, `ObjectView.parent`, `TraverseCheckResult` fields.
- Existence unverified (outside chunk): synth.js, trade-geo.js, pinecone.js, td-art.js, tex-side-hero.js, lichen-field.js, fr-pitstone.js, postman.js, motion.js, jobs/sys-fetch.js, lib/dialog.js.
- Per-machine session debounce (car77-gate).
- `platformState` on the player template for coins and sysSeals (wallet, sys-wing).

Duplicated code to consolidate: `face` in fr-geo.js and soundlab-geo.js; `onSeat`/`boot`/`pressLater` in chests.js and climb.js.

Totals: 57 files, about 70 distinct engine calls (approximate), about 60 issues, all as above.

{"files": 57, "calls": 70, "issues": 60, "gaps": ["ctx.sleep semantics and wake", "ctx.commit fn signature", "multi-statement ctx.sql atomicity and changes()", "ctx.query ordering", "hook/behaviour execution order", "replay from/to units", "anim channel shape", "mark writes runtime vs authored", "material assignment replace vs merge", "undocumented act payloads: shake, milestone, stat, impulse, damageNumber extra fields, flash color, playSound bus and maxDistance", "ctx.authoring API", "ctx.audioWorklet and program audio setup contract", "ctx.canvas, ctx.quad, ctx.roughness, ctx.metalness, ctx.smooth, ctx.flat", "place.acoustics", "place.terrain.heightAt", "ObjectView.parent", "TraverseCheckResult fields", "existence of synth.js, trade-geo.js, pinecone.js, td-art.js, tex-side-hero.js, lichen-field.js, fr-pitstone.js, postman.js, motion.js, jobs/sys-fetch.js, lib/dialog.js", "per-machine session debounce", "platformState declaration on player template"]}