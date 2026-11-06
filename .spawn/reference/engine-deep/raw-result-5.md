Write to analysis-ex-2.md was refused (subagents return findings as text), so the full analysis follows. Engine notes: ENGINE.md, api-a.md, api-b.md. skills-a/skills-b were not read, so fx DSL, jev output shapes and skill-only APIs are marked unverified. All referenced helpers exist (trade-lib.js, minds-fx.js, c92-flock-mat.js, chase-camera.js, side-data.js, trader.js, tex-south.js, look-highlands.js, car77.yml, commons-market.yml).

Likely bugs are marked BUG. Other items are mismatches with the documented engine shapes or unverified calls.

**1. /workspace/game-6/scripts/ex/basket.js**
Hooks: ears.press. Calls: ctx.self.worldFeetPosition, ctx.self.state, ctx.emit(shake, playSound, damageNumber, squash, fx), ctx.destroy, ctx.spawn; imports from ./trade-lib.js.
Does: E gives a pinecone unless one is held.
Issues: shake not in the notes' ActPayloads list (unverified); RightHand attachment unverified (coneInHand not read).

**2. /workspace/game-6/scripts/ex/blocks-geo.js**
Hooks: geometry, collider. Calls (geometry context, unverified): ctx.params, ctx.quad, ctx.albedo, ctx.color, ctx.roughness, ctx.metalness, ctx.random, ctx.lod.
Does: pickaxe, pedestal and torch props by params.kind.
Issues: line 21 duplicate cap vertex (zero-area quad); line 55 ctx.random in geometry (determinism not stated); line 77-78 collider keys radiusTop/center not in the documented collider options.

**3. /workspace/game-6/scripts/ex/c92-belt.js**
Hooks: ears.press, updateSchedule every 0.5 s, update. Calls: ctx.spawn, ctx.query, ctx.destroy, ctx.emit(fx, playSound, flash), ctx.random, ctx.self.session.
Does: drops crates on a conveyor, removes fallen ones.
Issues: line 30 advances the timer by literal 0.5 instead of dt; line 15 uses the /cdn/ path form; line 26 fx DSL unverified.

**4. /workspace/game-6/scripts/ex/c92-flock.js**
Hooks: geometry. Calls (unverified): ctx.params.count, ctx.lod, ctx.tri, ctx.attribute, return {bounds}.
Does: 60 choughs in one instanced mesh with per-bird attributes.
Issues: line 5 ctx.params.count without ?. (throws if params absent); line 3 TAU unused; line 23 m0 unused; lines 11-12 first attribute write is dead.

**5. /workspace/game-6/scripts/ex/c92-obs.js**
Hooks: updateSchedule every 1 s, ears.press, update(ctx, dt). Calls: ctx.place.atmosphere.timeOfDay, ctx.place.atmosphere.sunState (path unverified), ctx.sleep (gap), animate with handle target, ctx.emit(playSound, damageNumber, fx).
Does: observatory clock and telescope aim.
Issues: line 6 return ctx.sleep() (sleep behavior not stated); line 14 sunState path unverified.

**6. /workspace/game-6/scripts/ex/c92-zip.js**
Hooks: ears.press, arrive, home (via ctx.after). Calls: ctx.getObject, ctx.after, animate (feetPosition x/y/z), ctx.emit(playSound, fx), rider.parent and rider.feetPosition writes.
Does: zipline ride, handle returns.
Issues: lines 10 and 18 direct .parent writes; docs give ctx.attach(entity, parent, offset) only; line 13/23 timers not cancelled on destroy.

**7. /workspace/game-6/scripts/ex/car77-geo.js**
Hooks: geometry, collider. Calls (unverified): ctx.params.kind, ctx.quad, ctx.tri, ctx.color, ctx.albedo, ctx.metalness, ctx.roughness, ctx.smooth, ctx.flat, ctx.emissive, ctx.lod.
Does: roadster body, wheels, steer wheel, gantry, stand, cone.
Issues: line 50 ux unused; line 43 normal fallback hack; lines 235-247 collider returns an array (acceptance unverified) with unverified keys.

**8. /workspace/game-6/scripts/ex/car77.js**
Hooks: ears.press, onControlBegin, onControlEnd, onInput, onCollide, update(ctx, dt). Imports: raycast (verified), builtin/vec3 rotate/add/sub/scale/dot/cross/normalize/length (verified), C from car77.yml. Calls: ctx.getObject, ctx.emit(playSound, squash, fx, shake), ctx.now, ctx.place.gravity, ctx.self.controller/velocity/angularVelocity/forces/session/audio, ctx.sleep (gap), child ids me.id+"/"+q.id (unverified form), bones.*.reach (unverified).
Does: four-wheel raycast car.
Issues: line 77 g unused; lines 127-134 F computed then void (dead); line 92 rearDriven recomputed per tick; lines 17 and 27 .parent writes; line 63-65 null driver leaves controller cleared but state.driver stale; line 167 ctx.sleep gap.

**9. /workspace/game-6/scripts/ex/chargecrystal.js**
Hooks: ears.charge (custom event name), payload {by, phase, held}. Calls: animate with string me.id target (lines 19, 23, 29), ctx.getObject, ctx.emit(playSound, flash, fx, shockwave, shake).
Does: hold-to-charge crystal.
Issues: animate target is a string, docs say handle (api-b 260); line 23 easeOutBack not in easing list (api-b 268); line 15 s.panel never set here; charge event and payload not in notes.

**10. /workspace/game-6/scripts/ex/chime.js**
Hooks: onSpawn, ears.press. Calls: ctx.place.objects[key], animate (string b.id target, loop, alternate), ctx.emit(playSound, shake, fx).
Does: wind chime sways and rings.
Issues: line 12 maxDistance not in documented playSound payload (api-b 121); lines 6/11 child id form unverified; line 7 string target.

**11. /workspace/game-6/scripts/ex/coin.js**
Hooks: onSpawn, onTriggerEnter. Calls: ctx.self.feetPosition (read/write), worldFeetPosition, ctx.emit(playSound, damageNumber), ctx.random, other.state.coins.
Does: coin pickup and hop.
Issues: line 3 and 11 mix local and world feet positions (same only when unparented); header refers to sim.js (not read).

**12. /workspace/game-6/scripts/ex/crane-camera.js**
Hooks: update(ctx, dt). Calls: ctx.self.state.center, feetPosition write, rotation {lookAt, include} (verified).
Does: orbiting script camera.
Issues: none verified; state.center set outside this file.

**13. /workspace/game-6/scripts/ex/dancer.js**
Hooks: onSpawn. Calls: ctx.self.anim.show (write).
Does: plays a clip on a mixer channel.
Issues: channel fields clip/weight/loop undocumented (api-a 248 gap); later state.clip changes ignored.

**14. /workspace/game-6/scripts/ex/door.js**
Hooks: ears.press, update(ctx, dt). Calls: ctx.self.state, rotation {yaw}, ctx.emit(playSound), ctx.sleep.
Does: swinging door.
Issues: line 12 return ctx.sleep() at goal and press (line 4) does not wake update; if sleep blocks update, the door cannot reopen (unverified, main risk).

**15. /workspace/game-6/scripts/ex/fr-ball.js**
Hooks: update(ctx, dt). Imports raycast. Calls: raycast(ctx, origin, dir, {distance, ignoreEntities}), hit.id/normal/position/distance (verified), ctx.getObject, ctx.emit(squash, fx with params, decal, playSound), ctx.destroy, feetPosition write, state.vel.
Does: ballistic iron ball with raycast-before-move hit detection.
Issues: line 13 sp=0 gives NaN direction (zero-speed ball); line 22 decal texture/normal not in documented decal payload (size, lifetime, opacity); line 18-19 squash target unverified; line 11 state write every tick.

**16. /workspace/game-6/scripts/ex/fr-cannon.js**
Hooks: ears.press with {by}. Calls: ctx.now, ctx.getObject, ctx.spawn, ctx.random, ctx.emit(playSound, fx, squash, screenShake with audience).
Does: fires a ball entity on a solved arc.
Issues: BUG line 18-19: T=dist/sp is 0 when target at muzzle, vel becomes NaN/Infinity; line 26 audience {nearby: m, radius} does not match Audience {kind:"nearby", position, radius?} (api-b 143); line 17 G=9.8 hard-coded, car77 and fr-gravity assume place gravity -24.

**17. /workspace/game-6/scripts/ex/fr-gravity.js**
Hooks: updateSchedule every 1 s, update, onTriggerEnter, onTriggerExit, ears.press. Calls: ctx.place.players, ctx.place.gravity read/write, worldFeetPosition, ctx.emit(playSound, fx).
Does: gravity pad switches place gravity.
Issues: line 7 local feetPosition compared with world c; lines 9/11 repeated hard-coded -24 fallback; place-wide gravity with per-pad restore can clobber when pads overlap (unverified).

**18. /workspace/game-6/scripts/ex/fr-marmot.js**
Hooks: onSpawn, update(ctx, dt) (no schedule), ears.press. Calls: ctx.self.anim.walk write/null, ctx.self.session, ctx.random, ctx.now, feetPosition/rotation writes, ctx.emit.
Does: wandering nameplate critter.
Issues: no updateSchedule, runs every tick per marmot (efficiency); anim channel fields undocumented; header depends on ui.js (not read).

**19. /workspace/game-6/scripts/ex/fr-pitstone.js**
Hooks: onOutOfBounds(ctx, event) returns false. Calls: feetPosition/velocity writes, ctx.getObject, ctx.emit(fx, playSound).
Does: returns fallen stone to rim.
Issues: "return false = handled" contract not in notes (api-b 185); event unused.

**20. /workspace/game-6/scripts/ex/fr-rain.js**
Hooks: ears.press. Exports RAIN, DRY. Calls: ctx.getObject, c.fx = {script} write, c.state.raining, ctx.emit(playSound).
Does: toggles cloud rain fx.
Issues: fx DSL (?mobile, @drops?, flick) unverified against skills-a.

**21. /workspace/game-6/scripts/ex/goat-geo.js**
Hooks: geometry, collider. Calls (unverified): ctx.lod, ctx.smooth, ctx.roughness, ctx.color, ctx.quad.
Does: mountain goat mesh.
Issues: line 27 collider uses halfHeight; documented capsule uses height and radius (api-b 83); blob poles produce zero-area quads.

**22. /workspace/game-6/scripts/ex/gradeswitch.js**
Hooks: ears.press. Calls: ctx.place.atmosphere.look = {script}, ctx.emit(playSound, screenFlash).
Does: swaps place grade.
Issues: line 5 look.script not documented (AtmosphereDef.look only lists toneMapping, api-b 95); scripts/look-default.js existence unverified.

**23. /workspace/game-6/scripts/ex/haptic.js**
Hooks: ears.press with {by}. Calls: ctx.emit("haptic", {kind:"heavy"}, {audience:{player:by}}), ctx.getObject, ctx.emit(playSound, shake, fx, screenShake).
Does: buzzes presser's device, rumble for others.
Issues: line 10 audience {player: by} vs {kind:"player", id}; line 17 audience {nearby: w, radius} vs {kind:"nearby", position, radius?}; line 15 shake undocumented.

**24. /workspace/game-6/scripts/ex/jukebox.js**
Hooks: ears.press. Calls: ctx.music.play(TRACK, {fade, loop, volume}), ctx.music.stop({fade}), ctx.self.fx write, ctx.emit(squash, playSound).
Does: room jukebox.
Issues: ctx.music argument shapes undocumented (api-a 244); NOTES fx DSL unverified.

**25. /workspace/game-6/scripts/ex/lanterns.js**
Hooks: updateSchedule every 0.25 s, update. Calls: ctx.query x2, ctx.getObject, o.material, o.light.
Does: lanterns light near players.
Issues: line 5 one player query per lantern (N x M); line 8 getObject repeats the ObjectView already in hand; line 10 light distance key unverified.

**26. /workspace/game-6/scripts/ex/lichen-field.js**
Hooks: geometry. Calls (unverified): ctx.params.seed/count, ctx.roughness, ctx.color, ctx.tri, ctx.instances, ctx.instance, ctx.lod.
Does: 1000 instanced lichen blades.
Issues: lines 4 and 11 params without ?. (throws if absent); line 19 clamped positions pile up at bounds edge.

**27. /workspace/game-6/scripts/ex/market-geo.js**
Hooks: geometry, collider, exported hat. Calls (unverified): ctx.quad, ctx.tri, ctx.albedo, ctx.color, ctx.roughness, ctx.metalness, ctx.smooth, ctx.flat, ctx.random, ctx.lod.
Does: market stall, stele, rock, chest, counter, hat.
Issues: line 173 unknown kind silently renders hat; line 45 clamp closure redefined per iteration; lines 88/107 ctx.random in geometry.

**28. /workspace/game-6/scripts/ex/minds-bell.js**
Hooks: ears.press with {by}. Imports GOLD, S, above, nameOf from minds-fx.js. Calls: ctx.place.objects, ctx.emit(playSound, fx, flash).
Does: rings bell and sends goat.
Issues: flash target unverified; minds-fx helpers not read.

**29. /workspace/game-6/scripts/ex/minds-geo.js**
Hooks: geometry, collider. Calls: ctx.params, ctx.randomRange (line 97), ctx.lod, ctx.smooth, ctx.flat, ctx.albedo, ctx.color, ctx.roughness, ctx.metalness, ctx.quad.
Does: MINDS column props.
Issues: BUG (likely) line 97 ctx.randomRange is not in the notes (only ctx.random), throws for hedge at lod<=2; line 59 dead branch (robe is defaulted on line 53, never undefined); line 87 winding test uses one cross term only; line 128 ctx.flat called redundantly.

**30. /workspace/game-6/scripts/ex/minds-marmot.js**
Hooks: update (sleep 0.5 or 0.15), ears.press. Imports PINK, ZZZ, S, above from minds-fx.js. Calls: ctx.place.players, ctx.place.objects[s.panel], ctx.now, ctx.sleep, ctx.self.bones write, ctx.self.fx write, ctx.emit(playSound, fx, squash).
Does: sleeping marmot wakes within 4 m.
Issues: lines 9/11 wake check depends on update running during sleep (sleep semantics unverified); bone names head/body/tail1 unchecked against rig.

**31. /workspace/game-6/scripts/ex/minds-villager.js**
Hooks: update(ctx, dt), decided(ctx, r) job callback. Imports yawTo, turn. Calls: ctx.job("jev:decide", {state, questions}, "decided") (verified signature), ctx.query, ctx.random, ctx.sleep, feetPosition/rotation writes, r.data.answers.go.
Does: villagers ask jev where to go.
Issues: line 34 jev output shape (probabilities, choice) unverified; line 38 s.spots assumed present (throws if absent); line 8 ctx.sleep(2) gap.

**32. /workspace/game-6/scripts/ex/modsbook.js**
Hooks: ears.press with {by}. Calls: ctx.getObject(s.panel), panel.state writes, ctx.emit(playSound, squash, flash with target).
Does: mod facts lectern.
Issues: line 17 by unused; flash target unverified; page text claims unverified.

**33. /workspace/game-6/scripts/ex/obsgate.js**
Hooks: onTriggerEnter, onCross, onRefuse. Calls: ctx.cross (verified), ctx.emit(playSound, fx, damageNumber), verdict.message (verified).
Does: observatory gate crossing.
Issues: line 4 guard fails open when tags is not an array (every trigger crosses); duplicated in worldgate.js line 4.

**34. /workspace/game-6/scripts/ex/panel.js**
Hooks: onSpawn. Calls: ctx.on("ui:tap"), ctx.on("ui:reset") (verified, returns unsubscribe), ctx.getObject(by)?.displayName, ctx.emit(playSound).
Does: UI tap counter.
Issues: lines 3-8 unsubscribe discarded, no onDestroy, handlers stack on respawn; ENGINE.md 5.3 says sendAction arrives in onInput as input.pressed, not ctx.on, so "ui:tap" is unverified.

**35. /workspace/game-6/scripts/ex/pickaxe.js**
Hooks: ears.press with {by}. Imports animate. Calls: ctx.place.players, ctx.place.voxels read/write, pl.state.blockTool, pl.camera?.rotation?.yaw (unverified), ctx.emit(fx, playSound, damageNumber, voxelMarkSet, flash), animate (handle target).
Does: dig and place voxel blocks.
Issues: BUG lines 30-35 dig writes null, place requires m === null, but ENGINE.md 6.1 says only `=== false` confirms empty and null means unknown; sentinels "unloaded"/"water" undocumented (line 30); line 37 voxelMarkSet unverified; line 46 empty catch.

**36. /workspace/game-6/scripts/ex/plaza-stone.js**
Hooks: geometry, collider. Calls (unverified): ctx.params, ctx.lod, ctx.random, ctx.albedo, ctx.color, ctx.roughness, ctx.smooth, ctx.flat, ctx.emissive, ctx.metalness, ctx.quad, ctx.tri.
Does: plaza wall, bench, brazier.
Issues: lines 101 and 107 unknown kind falls to brazier silently; ctx.random in geometry.

**37. /workspace/game-6/scripts/ex/postman.js**
Hooks: updateSchedule 0.25 s, update, onMailSent job callback. Calls: ctx.self.isLocal (verified), ctx.job("mail:send", args, "onMailSent", payload) (verified), ctx.getObject, ctx.self.party/guild/partyMembership/displayName (PlayerQueryResult fields, unverified on body).
Does: local-only mail and party reporting.
Issues: mail:send args unverified (line 10); ctx.self body fields unverified (lines 17-20).

**38. /workspace/game-6/scripts/ex/ringboard.js**
Hooks: ears.press with {by}. Calls: ctx.getObject, p.state.galleryRings, p.displayName, ctx.self.state, ctx.emit(shake, flash, damageNumber, playSound).
Does: ring counter and top-five board.
Issues: line 9 board keyed by displayName, same-name players collide and overwrite; keys grow unbounded; line 8 debug "test" branch; line 1 config not read.

**39. /workspace/game-6/scripts/ex/sentry.js**
Hooks: updateSchedule every 3, update(ctx, dt). Imports raycast. Calls: raycast (verified), hit.distance/id, ctx.place.players, ctx.getObject(hit.id)?.tags, ctx.place.objects, beam.scale and beam.material writes, ctx.emit(playSound).
Does: sweeping beam turns red on players.
Issues: line 10 three overlapping player checks; String(hit.id).startsWith("player") is an id guess; !!ctx.getObject(hit.id) is true for any object; line 12 beam length assumes unit z mesh.

**40. /workspace/game-6/scripts/ex/side-camera.js**
Hooks: update(ctx, dt). Imports LEVEL from side-data.js. Calls: ctx.self.hideLocalPlayer (verified), ctx.self.target (verified), t.feetPosition/velocity (unverified fields), ctx.self.state.orthoSize, ctx.world.camera.aspect (verified), feetPosition/rotation writes.
Does: side-scroller camera follow.
Issues: BUG line 9 when stopped the look-ahead never decays (stays up to 2 m); line 7 fallback orthoSize 5.625 vs engine default 12 (api-b 223).

**41. /workspace/game-6/scripts/ex/side-flag.js**
Hooks: ears.press (method form) with {by}. Calls: ctx.getObject, p.state.sideReset write, ctx.emit(playSound, fx).
Does: summit flag resets the run.
Issues: none confirmed; fx DSL unverified.

**42. /workspace/game-6/scripts/ex/side-ui.js**
Hooks: default render(ctx, player). Calls: player.state, ctx.getObject?.('side-flag').
Does: side-scroller HUD.
Issues: line 15 won.coins assumes an object while line 7 only tests truthiness, so sideWon:true prints "undefined / 3 coins" (writer unverified); line 2-4 style block re-emitted every render (efficiency); rail inset rule (ENGINE.md 5.3) followed correctly.

**43. /workspace/game-6/scripts/ex/sprite.js**
Hooks: ears.press. Calls: ctx.self.sprite write with texture script query string, ctx.emit(squash, playSound).
Does: re-bakes sprite hue.
Issues: texture script with query string not in notes (unverified); tex-south.js exists.

**44. /workspace/game-6/scripts/ex/summitbell.js**
Hooks: ears.press with {by}. Calls: ctx.emit("milestone"/"stat", ..., {audience:{player: by}}), ctx.emit(fx, playSound, shake, damageNumber), ctx.getObject(by).
Does: summit bell milestone.
Issues: lines 7-8 audience shape mismatch; milestone and stat not in notes list; line 10 maxDistance undocumented.

**45. /workspace/game-6/scripts/ex/synth.js**
Hooks: setup({ctx, out, params}) returning update/dispose/readout (contract undocumented). Browser audio only: addModule, AudioWorkletNode, GainNode, createObjectURL, setTimeout.
Does: additive pipe-organ AudioWorklet voice.
Issues: BUG lines 33/40 `fault ??=` does not replace the empty string set on line 40, so later processor errors are lost; line 26 blob URL never revoked; line 46 timer not cleared on repeat dispose; worklet line 19 allocates an array per 128-sample block.

**46. /workspace/game-6/scripts/ex/tarn.js**
Hooks: ears.press, still (via ctx.after). Calls: ctx.place.objects, w.material write, ctx.emit(fx, shockwave, playSound), ctx.after(3.5, "still"), s.mat (set elsewhere).
Does: pebble ripples on water surface.
Issues: BUG line 14 each press adds a still timer without ctx.cancel, so the first timer resets waves early; line 6 waveIntensity not a WaterMaterialSpec key (api-b 237-243); line 17 undefined material if s.mat missing.

**47. /workspace/game-6/scripts/ex/td-crystal.js**
Hooks: onTriggerEnter, ears.press with default {by}. Calls: ctx.self.visible = false (verified), ctx.getObject('td-tally'), ctx.emit(fx, playSound).
Does: one-time crystal pickup.
Issues: none confirmed; hidden object still gets trigger events (guarded); hard-coded id.

**48. /workspace/game-6/scripts/ex/td-sheep.js**
Hooks: update(ctx, dt) (no schedule), ears.press. Calls: ctx.now, ctx.random, feetPosition, ctx.self.velocity (verified api-a 87), ctx.emit(playSound, fx).
Does: wandering, grazing sheep.
Issues: BUG lines 6-8 when goal is null (35% of picks, and always after a press on line 15) the test !s.goal re-picks every tick, so grazing never holds and until is ignored; line 12 velocity-only movement with no declared body (unverified); line 7 silent default home.

**49. /workspace/game-6/scripts/ex/tex-side-coin.js**
Hooks: texture. Calls: ctx.atlas (unverified).
Does: 16x16 spinning coin.
Issues: none.

**50. /workspace/game-6/scripts/ex/tex-side-hero.js**
Hooks: texture. Calls: ctx.params.facing, ctx.atlas (unverified), f.animation, f.frame.
Does: climber sprite atlas.
Issues: none confirmed.

**51. /workspace/game-6/scripts/ex/tex-side-tiles.js**
Hooks: texture. Calls: ctx.canvas (unverified), ctx.random.
Does: four granite tiles.
Issues: line 4 `(r()*4) | 0 & 3`: `& 3` is dead (harmless).

**52. /workspace/game-6/scripts/ex/torches.js**
Hooks: ears.press. Calls: ctx.place.objects[id], f.fx write, f.state.power/reach, ctx.emit(fx, playSound, flash, damageNumber).
Does: lights or snuffs cave flames.
Issues: line 22 maxDistance undocumented; lines 4-9 fx DSL unverified; lines 17-18 missing ids skipped silently.

**53. /workspace/game-6/scripts/ex/trader-geo.js**
Hooks: skeleton (export), geometry, collider. Calls (unverified): ctx.bone, ctx.quad, ctx.color, ctx.roughness, ctx.smooth, ctx.lod.
Does: rigged shopkeeper marmot.
Issues: bone names match skeleton() (consistent); ctx.bone and skeleton contract unverified.

**54. /workspace/game-6/scripts/ex/typestone.js**
Hooks: ears.press, exported plateUi. Calls: ctx.getObject, plate.ui write, ctx.emit(playSound, squash, flash with target).
Does: cycles font on sample plate.
Issues: line 12 per-object ui HTML string unverified (ENGINE.md 5.3 describes ui.js); `at` attribute and class names unverified.

**55. /workspace/game-6/scripts/ex/vaultcounter.js**
Hooks: updateSchedule 1 s, update. Calls: ctx.place.players[0], ctx.self.place (verified), ctx.place.playerCount (verified).
Does: vault visit counter.
Issues: line 4 reads the first player, not necessarily the copy owner; line 9 fallback dead since playerCount is documented.

**56. /workspace/game-6/scripts/ex/wallet.js**
Hooks: updateSchedule 0.5 s, update, ears.press with {by}. Imports M from commons-market.yml. Calls: ctx.place.players, ctx.getObject(by), p.state.coins write, lichenBadges, ctx.emit(playSound, damageNumber, flash, fx).
Does: balance display and coin-debit purchase.
Issues: line 25 purchase debits a player-writable balance directly, not via buyables/proposePurchase (ENGINE.md 5.6 point 7, 6.1); check and debit are one tick, so not racy here.

**57. /workspace/game-6/scripts/ex/worldgate.js**
Hooks: onTriggerEnter, onCross, onRefuse. Calls: ctx.cross (verified), ctx.emit(playSound, fx, damageNumber), verdict.message (verified).
Does: plaza gates to other places.
Issues: line 4 same fails-open guard as obsgate.js; near-duplicate of obsgate.js.

**Gaps (not stated by the notes):** ctx.sleep behavior; ctx.destroy with no id; animate target type (string vs handle); Audience shape in emit options; ctx.randomRange; ctx.instance/instances; ctx.atlas/canvas/bone and the geometry context; ctx.music.play/stop arguments; decal texture/normal; playSound maxDistance; squash/flash/shake/screenShake target and fields; voxel null semantics vs docs; waveIntensity; onOutOfBounds return contract; direct .parent writes; skills-a fx DSL and jev output shapes (skills-a not read).

{"files": 57, "calls": 56, "issues": 144, "gaps": ["ctx.sleep behavior not stated", "ctx.destroy with no id not stated", "animate target string vs handle", "emit Audience shape mismatch in several files", "ctx.randomRange not in notes", "ctx.instance/instances and geometry context (quad, tri, bone, atlas, canvas) not in clone", "ctx.music.play/stop argument shapes not stated", "decal texture/normal not in documented payload", "playSound maxDistance not in documented payload", "voxel null vs docs (only === false is empty)", "waveIntensity not a WaterMaterialSpec key", "onOutOfBounds return contract not stated", "direct .parent writes not documented (ctx.attach is)", "skills-a fx DSL and jev output shapes not read in this pass"]}