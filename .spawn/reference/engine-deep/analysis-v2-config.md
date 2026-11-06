CHUNK=config

Scope: 16 chunk files read in full, plus the extra files needed to check calls (scripts/lib/data/player.yml and camera.yml, scripts/ex/fr-player.js, scripts/buyables/alpine-hat.js and commons-tip.js, and engine-deep api-a.md, api-b.md, skills-a.md, skills-b.md, ENGINE.md). Nothing was written and nothing was run.

Verification key: "verified" means the call or field appears in engine-deep. "unverified" means it does not. Line numbers refer to the file named in each heading.

**/workspace/game-6/world.config.yaml** (1.8K)
- Root keys: camera, lighting, defaultPlace, engine (behaviors, networking, ui.theme.font), inputs (actions, axes), player, ui.render, nametag, chat, authoring, leaderboards, buyables, achievements.
- Verified: camera and player template refs (ENGINE 4.7, cameras skill); inputs keys/keys-lists and `a/d` axes (cameras skill, interactive-objects); `mouse: wheelUp` on an action (game-ui line 197); `touch: { button }` (pointer-raycasting); `engine.ui.theme.font` (game-ui line 192); buyables name, description, priceSpoins, onPurchase, once, minSpoins (buyables skill line 58); leaderboards under world.config (platform-systems line 23).
- Unverified: root `lighting:` (api-b lists `lighting?` only on PlaceDef), `chat:`, `nametag:`, `authoring.starter`, `achievements`, `leaderboards.*.state`, `ui.render` as a root key, `networking.mode`.
- Issues: line 1 stale template instruction still present although `name` is filled (INVARIANT 6 sweep). Line 44 comment says nametag takes `(ctx, tag)`; ui.js uses `(ctx, player)`. Line 5 `lighting:` may be ignored, which would make scripts/lighting.js dead.

**/workspace/game-6/sim.js** (917B)
- Calls: ctx.world.state.sysTally (??=, read, write), ctx.world.places.main?.objects?.["sys69"], t.state.shown / t.state.msg. Exports: scopes, cadence, tick.
- Purpose: the world referee tallies a counter and mirrors it onto a sign once per second.
- Verified: ctx.world.places (api-a line 71); world.state. Unverified: `scopes` with `merge: "counter"`, `cadence`, `tick` export (ENGINE 2.2 says observed only).
- Issues: lines 9-10 `??=` initialises the parent `world.state.sysTally` outside the counter glob `world.state.sysTally.*` (line 6), so the first-boot init is not covered by the counter merge. Line 11 hard-codes place `main` and object `sys69`; if that object moves, the display silently stops. No writer for `sysTally.bumps` exists in this chunk (gap).

**/workspace/game-6/design.md** (2.3K)
- Passport TOTAL 166 (line 18) matches ui.js line 4. Win condition (line 5) matches.
- Issue: line 9 places list omits `ws-locked`, which exists under places/. Line 22 open question (489 KB vs 450 KB budget) is not checkable from this chunk.

**/workspace/game-6/AGENTS.md** (15.2K) and **/workspace/game-6/CLAUDE.md** (`@AGENTS.md`)
- Engine descriptions (ctx verbs, data scopes, places, cells, jobs, page marks) match ENGINE 1, 2.3 and 5.
- Issues: none that conflict with engine-deep. The "eight verbs" count (line 56) is loosely stated. Cell-size rule (round(x/128)) matches ENGINE 1 observed.

**/workspace/game-6/scripts/arrival.js** (779B)
- Exports onArrive(ctx, player) and onLeave(ctx, player). Both bodies are empty, so the file is a no-op.
- Verified: onLeave (platform-systems line 38); player.arrival.kind (api-a line 61).
- Unverified: onArrive is not in the api-b Behavior Hooks list (api-b lines 449-476). Lines 3-4 claim sim.js and "the place's policy hear" a ctx.cross move; not documented.

**/workspace/game-6/scripts/lighting.js** (2.4K)
- Exports lighting(surface, lights): Cook-Torrance GGX/Smith/Schlick with Lambert diffuse and an ambient term.
- Math checked: D, G, F, specular and diffuse terms are the standard forms.
- Unverified: builtin/tsl exports (dot, max, mix, normalize, pow, clamp, float, vec3, oneMinus, PI); `light.direction`, `light.radiance`, `lights.each`, `lights.ambient`, `lights.environment`, `surface.occlusion`. api-b builtin/lighting (line 2229) lists lightsAt, lightCount and similar, not these.
- Issues: line 5 refers to a "looks" skill that is absent from skills.md (ENGINE 6.2 item 6). Root-key `lighting:` placement is unverified (see world.config.yaml).

**/workspace/game-6/scripts/chat.js** (333B)
- Exports scopes.gallery { in, post, slow: 3 }.
- Unverified: chat `scopes`, `slow`, and the root `chat:` key. Line 2 names `ctx.emit("say", { text, scope })`; `say` is not a documented act, and no emitter exists in this chunk.

**/workspace/game-6/scripts/player.js** (7.8K)
- Calls: ctx.query({tags, radius}), ctx.emit (press, turn, openSettings, milestone, playSound, w7post), ctx.proposePurchase, ctx.job('text:check', args, 'w7Checked', payload), ctx.self.velocity/grounded/parent/state/session/controlling/feetPosition/id/displayName/controller, ctx.place.gravity.y, ctx.now, ctx.sleep(0.3), ctx.view.camera (via frontierTick), ctx.getObject. Hooks: onInput, update, onOutOfBounds; job callback w7Checked(ctx, r, payload).
- Verified: proposePurchase (api-a line 131); ctx.query radius (api-b); job callback shape (ENGINE 2.2); openSettings page keys (player-settings line 50); playSound clip/position/volume (projectiles line 147).
- Unverified: ctx.sleep wake behaviour (api-a line 229; the comment at lines 80-81 claims writes and onInput wake it); `milestone` act; `ctx.place.gravity.y`.
- Issues: line 28 `try { ctx.proposePurchase(...) } catch (e) {}` swallows all errors. Lines 80-81 vs 85: the wake claim is undocumented. Line 109 returns frontierOOB's boolean; the meaning of an onOutOfBounds return is not documented. Line 33 w7Ui runs `input.actionData?.w7ui` every frame; that is fine but the w7Desk query (line 114) runs on every onInput frame, which costs CPU.

**/workspace/game-6/scripts/camera.js** (2.8K)
- Calls: ctx.self.hideLocalPlayer, target, feetPosition, rotation, view, bounds.obb.halfExtents.y, effectiveScale.y, worldFeetPosition; ctx.player.parent chain.
- Verified: target (api-a line 253); view yaw/pitch in radians (cameras line 86); rotation in degrees; bounds.obb.halfExtents and the 1.6k eye formula (cameras line 102); hideLocalPlayer.
- Unverified: effectiveScale; worldFeetPosition (only in ENGINE 2.1 table, not in api-a/b).
- Issues: line 43 `body.bounds?.obb.halfExtents.y` guards `bounds` only. api-a line 79 notes `geometryPending?`, so `obb` can be absent and this throws every tick in first person. Fix: `?.obb?.halfExtents`. Line 17 exports finiteNumber needlessly.

**/workspace/game-6/scripts/humanoid-locomotion.js** (23.4K)
- Calls: ctx.self.sprite, parent, velocity, feetPosition, yaw, state, session, anim.{idle,walk,run,sprint,sit}, bones.LeftFoot/RightFoot.ground, mixer.sit, model, effectiveScale.y, controller, id; ctx.world.assets[ref].gait; ctx.now (no); ctx.sleep(); builtin/math stepAngle. Hooks: onInput, update; export sit().
- Verified: stepAngle(current, target, dt, {smoothing, maxDegPerSec}) (api-b line 264); AssetMetadata.gait (api-b); anim channel assignment with clip/weight/speed/loop (skills 2d-mode line 20 shows the pattern); bones.LeftHand.reach shape (vehicles line 314).
- Unverified: `bones.X.ground`, `mixer`, `effectiveScale`, `yaw` on self, anim null-clearing.
- Issues: lines 227-228 and 238-239 write `ctx.self.bones.LeftFoot.ground`; on a seated body with no foot bones this throws before `ctx.sleep()`, every tick. Line 223 `clip: clips.sit || sit` passes the exported function as a clip. Docs define clips as address strings; player.yml has no `clips` key, so the player always gets the function. Lines 281-282 quote 2.6 and 5.4 m/s; player.yml walkSpeed is 6 (player.yml line 13) and there is no runSpeed. Line 224 comment layout is long prose (INVARIANT 6 style), not a defect.

**/workspace/game-6/scripts/ui.js** (17K)
- Calls: default render(ctx, player); onMount(container), onDestroy(); sendAction, sendAxis, openLink, window.spawn.{view.captureFrame, chat.sharePicture, assets.upload, user.upgradeGuest}, ctx.getObject, ctx.place.objects, ctx.now, ctx.worldToScreen, ctx.view.site, ctx.world.inputs.actions.interact.label, ctx.world.inputs.axes.moveZ.label, navigator.getGamepads, getUserMedia.
- Verified: render signature, ≤30/s, onMount/onDestroy, data-modal, data-world-anchor, --anchor-depth, the right-inset CSS var, sendAction/sendAxis, openLink (game-ui lines 170-190), inputs labels (interactive-objects line 319), captureFrame, upload error codes, worldToScreen.
- Unverified: `window.spawn.chat.sharePicture` is called without `scope`, which game-ui line 181 lists.
- Issues: line 4 TOTAL 166 is hard-coded and will drift (ENGINE 6.2 item 13). Line 184 calls sendAxis inside render(), a side effect on a path that runs up to 30 times a second; a 120 ms throttle limits it. Lines 29 and 32 interpolate `ex.api`, `ex.title`, `ex.no` and `ex.wing` unescaped; only `ex.code` is escaped (line 33). Line 31 `ex.title.toUpperCase()` throws if title is absent, which blanks the HUD (game-ui line 215). Line 97 omits `scope` (see above).

**/workspace/game-6/scripts/lib/data/player.yml** (read for context)
- Keys: acceleration 80, deceleration 120, jumpSpeed 10, turnInPlace 90, turnSmoothing 0.06, turnSpeed 900, turnTo movement, walkSpeed 6. These match skills-a line 105.
- Issue: header lines 4-5 claim walkThreshold, runThreshold and sprintThreshold are "named here"; none are.

**/workspace/game-6/scripts/lib/data/camera.yml** (read for context): `eyeHeight: 1.6`, matching camera.js fallback 1.6 and cameras skill line 109.

**/workspace/game-6/scripts/ex/fr-player.js** (read for context)
- frontierTick uses ctx.view.camera (verified api-a line 73) and ctx.self.state.flyby. frontierOOB uses ctx.emit playSound and fx.
- Unverified: fx DSL tokens `$size` and `a=0>.6:.2>0`, which are not in the fx skill.

**/workspace/game-6/scripts/buyables/alpine-hat.js** and **commons-tip.js** (read for context)
- onPurchase(ctx, buyer) matches buyables skill line 60. ctx.purchase.priceSpoins (commons-tip line 6) is verified by buyables skill line 61, so it is not an undocumented call.
- Unverified: damageNumber payload fields `text`, `color` and `position`. ActPayloads documents only size and lifetime for damageNumber (api-b line 120).

**/workspace/game-6/templates/camera.js** (199B)
- Matches cameras skill line 104 exactly.
- Issue: `state: { pitch: 0, yaw: 0 }` (line 7) is never read by scripts/camera.js, which reads ctx.self.view. This is dead state and a hazard, since writes to state.yaw or pitch turn the look (cameras line 116).

**/workspace/game-6/templates/player.js** (417B)
- Matches ENGINE 4.7 and the platformState rule (platform-systems line 24). Behaviour list (humanoid-locomotion, player, ex/commons-ui-input) all exist on disk.
- No defects found.

**/workspace/game-6/jobs/sys-fetch.js** (322B)
- `export async function run(job, args)` fetches a URL and returns a line. Matches platform-systems line 31 (fetch inside a job's run).
- Issues: `args.url` is caller-supplied with no allowlist (relies on the platform's private-host block). Line 5 fallback `j.slip?.advice` belongs to a different API. Line 3 throws if the response is not JSON, which the platform reports as a job error.

**/workspace/game-6/jobs/ws-data-dice.js** (691B)
- Seeded LCG Monte Carlo estimate of pi; the arithmetic is correct and clamping is sound. `run` is synchronous; the skill's job examples use `async function*` for feeds (unverified for synchronous run).
- No defect found.

Summary of calls: about 70 distinct ctx, self, place, world and emit call sites across the chunk. Hooks: onInput, update, onOutOfBounds, onArrive, onLeave, onMount, onDestroy, onPurchase, tick, cadence, scopes, plus job callback w7Checked. Imports: builtin/math stepAngle, builtin/tsl (unverified names).

Issues (ranked): (1) humanoid 227-228/238-239 unguarded bones write; (2) humanoid 223 function passed as clip; (3) camera 43 unguarded obb; (4) ui 97 sharePicture without scope; (5) ui 4 hard-coded TOTAL; (6) ui 184 side effect in render; (7) ui 29-33 unescaped HUD fields and throw risk; (8) world.config 5 lighting root key may be ignored, leaving lighting.js dead; (9) lighting.js 5 phantom "looks" skill; (10) chat.js 2 undocumented `say` emit and unverified chat scopes; (11) sim.js 9-12 init outside counter glob; (12) sim.js 11 hard-coded place and object; (13) arrival.js onArrive not in hook list, file is a no-op; (14) design.md 9 omits ws-locked; (15) player.js 80-85 unverified sleep-wake contract; (16) player.js 28 silent catch; (17) player.js 109 onOutOfBounds return contract; (18) templates/camera.js 7 dead state; (19) player.yml 4-5 and humanoid 281-282 stale numbers and thresholds; (20) world.config 1 stale template comment; (21) world.config 44 nametag signature comment mismatch; (22) alpine-hat 9 and commons-tip 6 damageNumber fields unverified; (23) fr-player 22-23 fx DSL syntax unverified; (24) sys-fetch 3 and 5 caller-chosen URL and foreign fallback.

{"files": 16, "calls": 70, "issues": 24, "gaps": ["ctx.sleep wake semantics (api-a line 229 gives none; player.js lines 80-85 and humanoid line 364 rely on them)", "ctx.self.bones.<bone>.ground, ctx.self.mixer, ctx.self.effectiveScale, ctx.self.yaw, ctx.self.worldFeetPosition, ctx.self.displayName and anim channel fields (clip, loop, speed, blendIn) and null-clearing", "anim sit channel: whether a function is accepted as clip (humanoid line 223)", "onArrive hook (not in api-b hook list); onOutOfBounds return-value contract", "builtin/tsl exports and builtin/lighting light API used by lighting.js (light.direction, light.radiance, lights.each, lights.ambient, lights.environment, surface.occlusion)", "root world.config keys not in engine-deep: lighting, chat, nametag, achievements, authoring.starter, leaderboards.*.state, ui.render, networking.mode, buyables.once (buyables skill documents once)", "chat scopes (in, post, slow) and the 'say' emit; sim.js scopes with merge counter, cadence and tick exports", "window.spawn.chat.sharePicture required arguments (scope listed in game-ui line 181)", "damageNumber payload fields text and color; playSound fields beyond clip, position, volume, pitch", "fx DSL tokens $size and a=0>.6:.2>0", "milestone act and achievements mechanism", "writer for world.state.sysTally.bumps and leaderboard galleryRings (not in this chunk)", "ui.js inputs label on axes (only the actions label is documented, interactive-objects line 319)", "sync job run(job,args) in ws-data-dice.js versus async generator form in skills (platform-systems line 31)", "skills-a and skills-b read in full; player-settings, pointer-raycasting, trees, uploaded-models, platform-systems, GeometryContext, TextureScript, TerrainHeightmapDef and builtin/water remain outside the read set"]}