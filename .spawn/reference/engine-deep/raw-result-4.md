The harness refused the write to `analysis-ex-3.md` (subagents must return findings as text), so the analysis follows in full. The chunk is 57 files (indices 3, 6, 9 … 171 of the 172 `ls` entries). Calls are counted as ctx member references (844 across the chunk, 40 distinct members), not per-file engine calls.

Cross-cutting issues, cited per file below:
- Audience shape: `{ nearby, radius }` and `{ player: by }` lack the `kind` field that api-b requires.
- Acts not in ActPayloads: `shake`, `say`, `impulse`, `noise`.
- Material key `texture` used where api-b specifies `albedo`.
- Trade refusal `"threw"` is not a documented refusal code.
- `ctx.place.gravity` is a scalar (vehicles.md), but goat.js and minds-goat.js read `.y`.

## bell.js
- Calls: `ears.ring`, `chime` (via `ctx.after`), `ctx.emit` playSound/flash/shake, `worldFeetPosition`.
- Does: the bell's ring ear schedules a chime, which plays a sound, a flash and a shake.
- Issues: L6 `shake` not in ActPayloads. L5 `flash` target/color fields unverified.

## booth.js
- Calls: `onTriggerEnter`, `onTriggerExit`, `ears["place-stone"]`, `other.camera =`, `ctx.spawn`, `ctx.destroy`, `ctx.random`, `ctx.emit` playSound/fx/squash.
- Does: entering swaps the player to a cursor rig; placing a stone spawns it, caps the count at 14, and emits dust and sound.
- Issues: L12, L16 `other.camera` set on a trigger row, not a documented player handle. L24 material key `texture`. Fx verb `floor=stick` unverified.

## c92-boat.js
- Calls: `ears.press`, `updateSchedule`, `update`, `ctx.emit` impulse/playSound/fx, `ctx.self.measure?.mass`.
- Does: a boat floats in its pond; press pushes it away; update pulls it back into its box.
- Issues: L7 `impulse` not in ActPayloads; `angularImpulse` and `measure.mass` unverified.

## c92-geo.js
- Calls: `geometry`, `collider`, `ctx.quad/tri/albedo/color/roughness/metalness/emissive/smooth/flat/lod/params`.
- Does: builds ten column-92 pieces from one script.
- Issues: none in logic. GeometryContext members not in the clone (unverified). L220, L223 return arrays from `collider` (unverified). L49 passes an oklch string to `ctx.color`.

## c92-orb-mat.js
- Calls: `material`; imports from `builtin/tsl` (`mx_noise_float`, `cameraPosition`, `normalWorld`, `positionLocal`, `positionWorld` and others) and `builtin/three`; `ctx.param`.
- Does: slate stone with moving lichen veins and a fresnel rim.
- Issues: none in logic. Most tsl exports and node methods are unverified.

## campad.js
- Calls: `onTriggerEnter`, `onTriggerExit`, `other.camera =` (crane rig).
- Does: stepping on the pad swaps to a crane camera; stepping off clears it.
- Issues: same trigger-row camera question as booth.js (L5, L7).

## car77-recall.js
- Calls: `ears.press`, yaml import of `car77.yml`, `car.controller`, `car.feetPosition/rotation/velocity/angularVelocity` writes, `car.state`, emit fx/playSound.
- Does: E calls an empty car back to its grid box.
- Issues: none found. `C.grid` shape depends on the yml (not in chunk).

## cart.js
- Calls: `update`, `splineLength` (builtin/spline), `ctx.self.spline = { id, at }`.
- Does: advances a cart along a rail each tick.
- Issues: L4 `|| 20` fallback hides a missing rail. Runs every tick with no `updateSchedule`, and freezes out of player range.

## chase-camera.js
- Calls: `update`, `ctx.self.target`, `view.yaw/pitch`, `frame`, `feetPosition` and `rotation = { lookAt, include }` writes.
- Does: chase rig; heading eases to the hull's yaw with a recenter.
- Issues: L5 assumes `target.rotation` is an object; a bare number (RotationSpec) would make this NaN. Constants match cameras.md.

## cinema.js
- Calls: `ears.press`, `screen.material = { texture, unlit }`, emit flash/shake/squash/playSound.
- Does: E rolls the next reel onto the screen.
- Issues: L13 `shake` not in ActPayloads. L11 `unlit` unverified.

## commons-bell.js
- Calls: `ears.press`, emit `say` with `scope: "gallery"`, emit playSound/squash/flash/fx, panel state writes.
- Does: ringing the bell posts a line to a chat scope.
- Issues: L10 `say` not in ActPayloads; route unverified (ENGINE.md 6.2 #14).

## crystal.js
- Calls: `geometry`, `collider`, `ctx.random` (L19-21), `ctx.quad/tri/color/emissive/lod`.
- Does: a seeded crystal cluster as one mesh.
- Issues: L19-21 `ctx.random()` inside geometry with no documented seed source; clients may build different shards.

## decal.js
- Calls: `ears.press`, emit decal/fx/squash/playSound, `ctx.random`.
- Does: E sprays a lichen decal on a wall with a spray burst.
- Issues: L7 decal keys `normal`, `texture`, `rotation`, `fade` not in the documented decal payload. L10 fx `%dx|-2` syntax unverified.

## earshot.js
- Calls: `onSpawn`, `ears.press`, reads `ctx.world.earshot`, `voiceMood`, `voice`, emit playSound/shockwave/squash.
- Does: shows earshot and voice settings on a board.
- Issues: L7-9 those `ctx.world` fields are not documented (ENGINE.md 6.2 #12). L10 `displayName` on an ObjectView unverified.

## fr-booth-cam.js
- Calls: `update`, `hideLocalPlayer`, `session`, `target`, `view`, `projection`, `feetPosition`, `rotation` writes.
- Does: iso or orbit camera rig for the booth.
- Issues: L9 default `orthoSize` 7; TomeCameraState defaults to 12 (api-b).

## fr-flyby.js
- Calls: `ears.press`, `p.state.flyby` write, `ctx.now`, emit fx/playSound.
- Does: writes a fly-by record onto the presser's saved state.
- Issues: L10 the record persists across rejoin until fr-player clears it.

## fr-ik.js
- Calls: `onSpawn`, `ears.press`, `bones.RightHand.reach`, `animate` with `easeInOutSine`, emit fx/playSound.
- Does: the figure's hand follows a brass grip to the next hold.
- Issues: `bones` on ObjectView unverified; `easeInOutSine` inferred.

## fr-pause.js
- Calls: `ears.press`, `resume` (named export), `update`, `place.timeScale`, `ctx.after`, `ctx.now`, `ctx.sleep()`, `rotation` write, emit playSound x2/fx/screenFlash.
- Does: a lever freezes the place for 3 s via timeScale 0.01.
- Issues: L17 audience lacks `kind`. L19 the timer is assumed to run on the slowed clock (inferred). L29 `ctx.sleep` unstated. The reset backstop runs only near players.

## fr-player.js
- Calls: `frontierTick`, `frontierOOB`, `state.flyby` read and delete, `view.camera` set/null, `feetPosition` and `velocity` writes.
- Does: plays the fly-by on the presser's screen; resets a body that falls into the pit.
- Issues: L16 the OOB return semantics are unstated, and the hook name differs from `onOutOfBounds`. L19 `RIM` is a shared object assigned by reference.

## fuse.js
- Calls: `ears.press`, `boom`, `rearm` (via `ctx.after`), `ctx.self.fx` write, `visible`, emit fx/shockwave/screenShake/playSound.
- Does: a 3-second fuse, then a blast, then a rearm.
- Issues: L22 audience lacks `kind`. L9 `ctx.self.fx` object write unverified.

## goat.js
- Calls: `updateSchedule`, `update`, `decided` (jev callback), `ctx.job("jev:decide", ..., "decided")`, `place.gravity.y`, `near.velocity`, emit damageNumber/playSound/impulse.
- Does: a goat asks jev what to do, samples the odds, then walks, flees, bleats or hops.
- Issues: L21 `gravity.y` on a scalar gives NaN velocity. L19 unguarded `home.x` throws when unset. L33 `impulse` not in ActPayloads. L10 `near.velocity` not documented. L31 damageNumber fields unverified.

## grove.js
- Calls: `ears.press`, `place.objects[id].scatter` write, emit fx/playSound.
- Does: E thickens or thins the pine grove by rewriting the scatter count.
- Issues: L7 `{ ...s.bed, count }` drops `bounds` and `templates` if `bed` is unset. L11 fx `spin=` and `rot=` keys unverified.

## hermit.js
- Calls: `ears.press`, `ears.talk`, imports `page`/`nodeOf` from `dialog.js`, `player.state.dialog` write, emit squash/shake/fx/playSound.
- Does: E opens a dialog card; nodes trigger reactions and count gifts.
- Issues: L17 `shake` not in ActPayloads. L27, L31 `displayName` on ObjectView unverified.

## kart.js
- Calls: `rotate` (builtin/vec3), `ears.press`, `onControlBegin`, `onControlEnd`, `onInput`, `controller`, `forces.drive/turn`, `velocity`, `angularVelocity`, `ctx.getObject(me.id + "/" + w)`, `player.camera`.
- Does: E takes the wheel; held forces drive the kart; E again steps out.
- Issues: L42 composite id unverified (ENGINE.md 6.2 #10); the whole `rotation` write `{ yaw, roll: 90 }` resets any pitch spin. L29 `getObject(driver)` unguarded for null.

## launchpad.js
- Calls: `onTriggerEnter`, `other.physics`, `other.tags`, `place.players`, `other.velocity` write, emit fx/shockwave/playSound/impulse.
- Does: a jump pad kicks walkers by velocity and loose bodies by impulse.
- Issues: L8 `other.physics` not a documented ObjectQueryResult field, so loose bodies may skip the dynamic branch. L13 `impulse` not in ActPayloads. KICK math is consistent.

## look-toon.js
- Calls: `look` (postfx); imports `grade`, `vignette`, and many tsl names; `ctx.scene`, `ctx.param`, `ctx.viewZAt`, `ctx.normal(uv)`.
- Does: posterizes the frame into bands with ink at depth steps and creases.
- Issues: L11 `ctx.viewZAt` not documented (only `viewZ`). `screenUV`, `screenSize` and the vignette options are unverified.

## marmot-geo.js
- Calls: `skeleton`, `geometry`, `collider`, `ctx.bone/quad/color/roughness/smooth/lod`.
- Does: rigged marmot geometry with body, head, jaw and tail bones.
- Issues: none in logic. Hex strings to `ctx.color` (L24, L27) unverified.

## minds-bouncer.js
- Calls: `update` (no schedule), `ctx.sleep(2)`, `place.players`, `feetPosition` and `scale` writes.
- Does: a ball bounces on a timer, squashing near the floor.
- Issues: L6 `s.floor` unguarded, so `feetPosition.y` becomes NaN if unset. L3 `ctx.sleep` unstated.

## minds-goat.js
- Calls: `update`, `findPath` (builtin/nav), imports from `minds-fx.js`, `place.gravity.y` (L7, L23), `grounded`, `ctx.sleep(2)`, `place.objects[panel].state`, `ctx.after(3, "home")`.
- Does: a goat walks a `findPath` route to its bell goal, re-plans about every 0.8 s, then walks home.
- Issues: L7, L23 gravity `.y` NaN as in goat.js. L5 module-level `routes` Map is state outside `ctx`, which platform-systems.md says to avoid.

## minds-pebble.js
- Calls: `ears.press`, `land` (via `ctx.after`), `ctx.spawn` with `material.texture`, `animate` with waypoint array on `feetPosition.y`, emit noise/playSound/fx.
- Does: a pebble arcs onto the yard; landing emits a noise for nearby ears.
- Issues: L19 `noise` not in ActPayloads; payload uses `by` where NoiseEvent wants `sourceId` and `tick`; audience lacks `kind`. L9 material key `texture`.

## minds-well.js
- Calls: `updateSchedule` (1 s), `update`, `ears.press`, `ctx.query({ tags })`, `ctx.sleep(3)`, `v.state` reads and writes.
- Does: tallies villagers' plans onto a panel each second; press calls the square.
- Issues: L9 `n[v.state.plan]++` gives NaN for an unexpected plan. L13 repeats the lookup. L7 query has no radius, so it scans the whole place each second.

## motion.js
- Calls: `onSpawn`, `animate` on `feetPosition.y` (`"+=0.6"`), `scale`, `rotation.yaw` (`"+=360"`), `easeInOutSine`, `linear`, loop, direction.
- Does: bob, pulse or spin on the room clock.
- Issues: L7 `scale: [1, 1.3, 1]` is an array keyframe, but `scale` is a number or `{x,y,z}` (api-b). Likely wrong; unverified.

## oracle.js
- Calls: `ears.press`, `ctx.job("llm:chat", {...}, callback)`, `ctx.getObject`, emit playSound.
- Does: asks the LLM for a fortune; shows the reply or a fallback.
- Issues: L13-16 the `loading` lock clears only inside the callback. If the callback is dropped (jev.md: inline callbacks live only as long as the hook), the oracle locks permanently. A named export is safer.

## partystone.js
- Calls: `ears.press`, `getObject(by)`, reads `party`, `guild`, `displayName`, `p.behavior.push` (L4), `p.state.socialAsk`, emit shake x3 (composite ids)/playSound/fx.
- Does: a party/guild readout; attaches a carrier behaviour to the presser.
- Issues: L4 writes to a runtime behaviour list (undocumented). L10-11 PlayerQueryResult fields read from an ObjectView (unverified). L16 `shake` not in ActPayloads.

## pinecone.js
- Calls: `ears.offer`, `ctx.trade(self.id, { with, for })`, `getObject(trader)`, state writes.
- Does: the held pinecone's side of a two-sided trade.
- Issues: L5 catch sets `refused: "threw"`, not a documented refusal (api-b TradeReceipt).

## pondlever.js
- Calls: `ears.press`, `ctx.place.terrain.marks` read, write, delete, emit playSound.
- Does: E adds or removes a lake mark `ex-gallery-pond`.
- Issues: L4 `marks` read unguarded. L6 `at: s.at` may be undefined. Persistence of runtime mark writes unverified.

## replay.js
- Calls: `ears.press`, emit flash and `replay` with `{ audience: { player: by } }`, `ctx.now`.
- Does: replays the last five seconds, slowed, on the presser's screen.
- Issues: L6 audience lacks `kind`. `from`/`to` assumed to be milliseconds (unverified).

## roomsboard.js
- Calls: `updateSchedule` (3 s), `update`, `ears.press`, `ctx.getRoomId?.()`, `world.playerCount/onlineCount/mode`, emit.
- Does: shows room, players here, online count and world mode.
- Issues: none significant.

## shop.js
- Calls: `ears.press` (payload `checkout`), `ears["ui:buy-hat"]`, `ears["ui:buy-tip"]`, `updateSchedule`, `update`, `ctx.proposePurchase`, `ctx.sleep()`, `purchases` reads, `dress` from `alpine-hat.js`.
- Does: a hat stall; press opens checkout; buyers are re-dressed on update.
- Issues: L15 `try { proposePurchase } catch (e) {}` swallows failures. L22 `checkout` payload not documented. L28 `ctx.sleep()` unstated. L29 loops all players every 2 s.

## side-crab.js
- Calls: `onSpawn`, `animate` on `feetPosition.x` (`easeInOutSine`, loop, alternate), `ctx.self.anim.walk = { clip, weight, loop }`.
- Does: a scree crab patrols between two x positions.
- Issues: L7 anim `loop` unverified (skills-a gives `clip` and `weight` only). L5 `s.from` unguarded.

## side-level.js
- Calls: exports `tileAt({ x, y })`; imports `solid` from `side-data.js`.
- Does: tiles the side-scroller ground.
- Issues: L3-5 assume y decreases downward; the 2d-side orientation is unverified. The `world` argument is unused.

## signboard.js
- Calls: `ears.press`, `ears["ui:post"]`, `ears["ui:next"]`, `ctx.awaitJob(ctx.job("text:check", ...))`, `r.error`, emit flash/playSound.
- Does: posts a line only if `text:check` passes.
- Issues: L12 `"check failed: " + r.error` concatenates a JobError object, so the state shows "[object Object]".

## statebox.js
- Calls: `ears.press`, `getObject(by)`, `p.state.galleryMine` write, emit damageNumber x2/squash/playSound.
- Does: a stone counts room presses or the presser's own presses.
- Issues: damageNumber `text` and `color` unverified. No other issues.

## sundial.js
- Calls: `ears.press`, `noon` (via `ctx.after`), `place.atmosphere.timeOfDay` write, `ctx.cancel`, emit playSound.
- Does: E steps the hour through dusk, night, dawn and noon; a timer restores noon.
- Issues: L9 cancel of an already-fired timer id unguarded (unverified harmless).

## sys-geo.js
- Calls: `geometry` (returns `{ uvProjection }`), `collider`, `ctx.emissive`, `ctx.noise3d` (L32), `ctx.quad/tri/albedo/color/metalness/roughness/smooth/flat/lod/params`.
- Does: builds the systems-wing masonry and fittings from one script.
- Issues: L112 `ctx.emissive(3, 0.35, 0.25)` differs from the string form used elsewhere. L32 `noise3d` unverified. L143 return shape unverified. L2 header omits `stele`. `bell` and `medal` return null from `collider`.

## td-art.js
- Calls: `texture`, `ctx.canvas(w, h)` (unverified), `ctx.params.kind`.
- Does: draws every top-down sprite from one script.
- Issues: none. `ctx.canvas` not in notes.

## td-ground.js
- Calls: exports `tileAt({ x, y })`; no engine calls.
- Does: tiles the top-down meadow.
- Issues: L9 the `Math.sin` hash may differ across x64 and arm, so tile ids could diverge if `tileAt` runs on several machines. "Solid" comes from `solidTiles` in config, not this file.

## td-tally.js
- Calls: `ears.press`, `ctx.query({ tags, radius, center })`, `ctx.getObject(c.id)` with state and visible writes, emit playSound.
- Does: resets the meadow crystals and sets `found` to 0.
- Issues: L1 header says it counts, but the code only resets. L3 redundant `getObject`, unguarded.

## tex-side-crab.js
- Calls: `texture`, `ctx.atlas({ frameSize, animations, fps, draw(g, f) })`, `f.frame`.
- Does: draws the crab's two-frame walk atlas.
- Issues: none. Matches skills-a 2d-mode.

## tex-side-peaks.js
- Calls: `texture`, `ctx.canvas(256, 96)`, `ctx.params.layer`.
- Does: draws far and near mountain parallax strips.
- Issues: L11 the snow stripe `x % 9` breaks at the wrap (256 % 9 = 4). The sine terms do tile.

## texspinner.js
- Calls: `ears.press`, `ctx.random`, `ctx.self.material = { texture, roughness }` (whole-material write), emit playSound.
- Does: E swaps the cube's texture script to the next kind with a random hue.
- Issues: L6 material key `texture`. L7 hard-coded `% 3` should use `KINDS.length`. The whole-material write resets other fields.

## trade-geo.js
- Calls: `geometry`, `collider`, exported helper `pinecone`, `ctx.quad/tri/flat/albedo/roughness/color/metalness/emissive("#6fb8ff")/lod`.
- Does: stall, basket and pinecone pieces.
- Issues: exporting a `pinecone` helper from a geometry script collides in name with the pinecone behaviour file. `metalness(null)` unverified.

## trader.js
- Calls: `onSpawn`, `ears.press`, `settle` and `restock` (named exports via `ctx.after`), inline `anim` clip objects, `ctx.spawn`, `ctx.destroy`, `ctx.trade` (two forms), `emit("offer", ..., { to: cone })`, `g.parent?.id`.
- Does: trades the stall's crystal for a visitor's pinecone, settles it, then restocks.
- Issues: L29, L42 `refused: "threw"` not a documented refusal. L29, L42 silent catches; L42 hides failed cancels. L39 `parent.id` inferred. Inline clip shape unverified.

## uilane-geo.js
- Calls: `geometry`, `collider`, `ctx.quad/albedo/color/metalness/roughness/emissive/smooth/flat/lod`, `ctx.random` (L60-62), `ctx.params`.
- Does: Commons UI column pieces: hermit, booth, easel, horn, lectern.
- Issues: L60-62 `ctx.random()` in geometry without a documented seed; clients may differ.

## vaultgate.js
- Calls: `onTriggerEnter`, `onCross`, `onRefuse`, `other.tags`, `other.state.vaultVisits` write, `ctx.cross`, `ctx.log`, `verdict.message`.
- Does: a solo-instance gate counts the visit on the walker's save and crosses them.
- Issues: L4 the guard passes trigger rows with no tags array through. L5 writes to a trigger result's state (live handle unverified).

## wanderer.js
- Calls: `update` (no schedule), `ctx.self.session`, `ctx.sleep` (x2), `ctx.random` (x3), `animate` on `feetPosition.x/z`, `rotation`, `anim.idle` and `pet`, emit playSound/fx/squash.
- Does: a marmot wanders its plinth by tweens; press pets it with a heart burst.
- Issues: L13-22 the wander schedule sits in `ctx.self.session`, which is local scratch, so it can diverge across machines. L9 HEARTS fx has `col=<...>><...>`, which looks malformed (unverified). `ctx.sleep` unstated.

## worldorb.js
- Calls: `ears.press`, `ctx.self.material = { kind: "scripted", script: "engine/portal-<preset>", view: { link, spill, sound } }`, emit playSound/fx/damageNumber.
- Does: a scrying orb cycles four world portal views.
- Issues: L15 `view.sound: 0` shape unverified. All four presets are listed in portals.md.

## Gaps (not stated by the notes)
- `ctx.sleep(seconds?)` behaviour.
- Anim channel fields beyond `clip` and `weight` (`loop`, inline clip objects).
- GeometryContext members and return values (`quad`, `tri`, `smooth`, `flat`, `noise3d`, `random`, `emissive` signatures); absent from the clone.
- `builtin/tsl` exports, `ctx.viewZAt`, `ctx.canvas`, postfx `vignette` options.
- Acts `say`, `shake`, `impulse`, `noise`, and decal extra keys absent from ActPayloads.
- Trigger and query row fields (`camera`, `physics`, `velocity`, `party`, `guild`, `displayName`, `bones`) are not in the documented shapes.
- Runtime terrain mark persistence.
- Fx grammar items: `floor=stick`, `spin=`, `>>`, `%var|default`.
- Helper modules outside the chunk (`minds-fx`, `trade-lib`, `dialog`, `alpine-hat`, yml files, `side-data`, `tex-gallery`, `crane-camera`, `cursor-rig`, `player.js` wiring).

{"files": 57, "calls": 844, "issues": 27, "gaps": ["ctx.sleep behaviour unstated", "anim channel fields beyond clip and weight unverified", "GeometryContext members and return values not in clone", "builtin/tsl and postfx helpers unverified", "acts say, shake, impulse, noise and decal extra keys not in ActPayloads", "trigger and query row fields unverified", "runtime terrain mark persistence unstated", "fx grammar items unverified", "helper modules outside chunk not read"]}