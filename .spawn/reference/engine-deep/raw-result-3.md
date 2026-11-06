The write was refused: subagents return findings as text, not report files. Here is the analysis in full, ending with the JSON line.

# Analysis: /workspace/game-6/scripts (top level and lib/)

Scope: the 22 top-level `scripts/*.js`, `scripts/lib/*.js` (2 files), and `scripts/lib/data/*.yml` (12 files). `scripts/ex/` and `scripts/buyables/` are out of scope. `scripts/architecture.json` is not a script and was not analysed.

Cross-checked against: ENGINE.md, api-a.md, api-b.md, skills-a.md, skills-b.md in `/workspace/savi/.spawn/reference/engine-deep/`. "ENGINE" means confirmed in the notes. "UNVERIFIED" means not in the notes; the kernel source is not in the clone.

Counts: 30 distinct ctx members, 183 uses (code and comments). Comment lines: 36% of humanoid-locomotion.js, 25% of player.js.

---

## 1. /workspace/game-6/scripts/arrival.js
- Hooks: `onArrive(ctx, player)`, `onLeave(ctx, player)` (both empty). ENGINE 2.2 confirms the names.
- Calls: none.
- What it does: empty doorway hooks. The header says a place-to-place move (`ctx.cross`) fires neither hook; ENGINE 2.2 records this as observed.
- Issues: none in code. The 8-line header is prose (INVARIANT 6).

## 2. /workspace/game-6/scripts/blocks-terrain.js
- Exports: `cave(x, y, z)` (helper), `materialAt({ x, y, z, noise, seedOffset })`. Voxel generator form (ENGINE skills-b voxel-terrain).
- Calls: `noise.fbm2`, `noise.simplex3`, `seedOffset(n)` (ENGINE). No `ctx.*`.
- What it does: Blocks island voxel generator. Returns "air", "water", "snow", "granite", "grass", "dirt", "crystal", "ore", "stone".
- Issues:
  - Line 26 returns `"water"`. It must be declared in `terrain.materials` with `collision: "none"` (ENGINE voxel-terrain). The declaration is out of scope (UNVERIFIED).
  - Lines 35-38: each solid cell calls `cave()` six times in `near`, and `ground()` runs two `fbm2` per cell. Generator CPU per cell (efficiency). Test `near` only inside the surface band.
  - Lines 1-2: prose header (INVARIANT 6); 2 comment lines of 39.

## 3. /workspace/game-6/scripts/camera.js
- Hooks: `update(ctx, dt)`. Helper export `finiteNumber(value, fallback)`.
- Imports: `./lib/data/camera.yml` (exists; `eyeHeight: 1.6`, matches cameras skill).
- Calls: `ctx.self.hideLocalPlayer`, `target`, `feetPosition`, `view`, `rotation`, `worldFeetPosition` (ENGINE). `ctx.player` (ENGINE). `.parent` on ObjectView (ENGINE, inferred). `.bounds?.obb.halfExtents.y` (`obb` named in ENGINE, `halfExtents` UNVERIFIED). `.effectiveScale?.y` (UNVERIFIED).
- What it does: first-person rig. Places the camera at the eye (eyeHeight scaled by body height), follows a seat when seated, copies the presented yaw and pitch into `rotation`.
- Issues:
  - Lines 43-44: `effectiveScale` and `halfExtents` are not in the notes. The eye height depends on them.
  - Line 29 `hideLocalPlayer = true` every tick: ENGINE cameras skill confirms per-tick use.
  - 21 of 51 lines are comments (header prose, INVARIANT 6).

## 4. /workspace/game-6/scripts/chat.js
- Export: `scopes = { gallery: { in, post, slow } }`. ENGINE 2.2 lists `scopes` as observed.
- Calls: none in code.
- What it does: one chat channel, "gallery", open to all.
- Issues:
  - Line 2: the comment says `ctx.emit("say", { text, scope: "gallery" })`. `say` is not in the notes' emit or ActPayloads lists (ENGINE 6.2 #14 already flags it).
  - Scope fields `in`, `post`, `slow` are not in the notes (UNVERIFIED).

## 5. /workspace/game-6/scripts/db.js
- Hook export: `migrate(sql)`. Matches ENGINE platform-systems.
- Calls: `sql` tagged template (parameter). `CREATE TABLE/INDEX IF NOT EXISTS`, `INSERT ... ON CONFLICT DO NOTHING` (ENGINE: seed live this way).
- What it does: idempotent DDL for `guestbook`, `summit_climbs`, `gem_chests`, plus the `gem_chests` seed.
- Issues: none confirmed.

## 6. /workspace/game-6/scripts/flat-starter-terrain.js
- Hooks (heightmap generator exports): `heightAt()`, `materialAt(ctx)`.
- Imports: `./lib/data/world.yml` (exists; `terrain.baseHeight: 0`).
- Calls: `WORLD.terrain.baseHeight`. `materialAt` returns `{ grass: 1 }` (weight form, ENGINE heightmap-terrain).
- What it does: flat placeholder ground.
- Issues:
  - `ctx` parameter of `materialAt` is unused (dead).
  - `grass` must be a declared material or its weight paints nothing (ENGINE). Declaration out of scope (UNVERIFIED).
  - Which world config references this file is not in scope (UNVERIFIED).

## 7. /workspace/game-6/scripts/flower.js
- Export: `geometry(ctx)`.
- Calls: `ctx.params`, `ctx.color` (ENGINE). `ctx.sway` (UNVERIFIED; grass.js comment also names it). `ctx.quad` (UNVERIFIED; ENGINE lists `ctx.tri` only).
- What it does: flower mesh (two stem quads, five petal quads, one heart quad).
- Issues: none confirmed. The heart quad at `h + 0.004` (line 36) sits over the inner petal hole, as the comment says.

## 8. /workspace/game-6/scripts/grass.js
- Export: `geometry(ctx)`.
- Calls: `ctx.color` (ENGINE). `ctx.quad`, `ctx.sway` (UNVERIFIED; comment line 9 names `ctx.sway` as a documented call).
- What it does: one grass blade, two crossed quads, four triangles.
- Issues: none confirmed. 11 of 26 lines are comments.

## 9. /workspace/game-6/scripts/grass-look.js
- Export: `material(ctx)`. ENGINE api-b builtin/three material export.
- Imports: `builtin/tsl` (`mix, hash, vec2, vec3, cameraPosition, positionWorld`: UNVERIFIED named exports). `builtin/lighting` (`sunDirection`, `sunRadiance`: ENGINE). `builtin/three` (`MeshStandardNodeMaterial`: UNVERIFIED).
- Calls: `ctx.scatter.groundTint`, `.position`, `.heightFraction` (UNVERIFIED; scatter fields not in notes).
- What it does: blade colour, clump tint, roughness, sun-through-blade glow.
- Issues: none confirmed. The sign of the sun-through term (line 31) is correct: `toEye.negate().dot(sunDirection)` is large when the blade lies between eye and sun.

## 10. /workspace/game-6/scripts/highlands-terrain.js
- Exports: `valleyX(z)`, `heightAt(ctx)`, `materialAt(ctx)`.
- Imports: `builtin/terrain` `shore` (ENGINE: `shore(height, level, opts?)`).
- Calls: `ctx.x`, `ctx.z`, `ctx.noise`, `ctx.seedOffset`, `ctx.worldHeight`, `ctx.slope`, `noise.fbm2` (ENGINE). Weight materials `sand`, `rock`, `snow`, `grass` (must be declared; UNVERIFIED).
- What it does: valley landform with sea shore past z 120.
- Issues:
  - Line 1: header says marks "(river, sea, terrace)" override it. `terrace` is not an ENGINE mark kind (sea, lake, river, path, road, flatten, clear-scatter, hole). Mismatch.
  - About 17k `heightAt` calls per 80 m chunk (ENGINE); two `fbm2` per call. Documented cost, not a bug.

## 11. /workspace/game-6/scripts/humanoid-locomotion.js
- Hooks: `onInput(ctx, input)`, `update(ctx, dt)`.
- Exports: `sit()` (pose function), `sit.units = 'hips'`, `sit.duration = 0.1`.
- Imports: `./lib/data/player.yml` (exists); `builtin/math` `stepAngle` (ENGINE).
- Calls: `input.axes.aimYawSin`, `aimYawCos`, `moveX`, `moveZ` (ENGINE). `ctx.self.sprite`, `model`, `effectiveScale`, `yaw`, `mixer`, `bones.LeftFoot.ground` (UNVERIFIED; `rotation` is ENGINE, `yaw` and `bones` are not in the notes). `ctx.self.anim.<ch>` (ENGINE; channel fields are a documented gap). `ctx.self.session`, `state`, `velocity`, `feetPosition`, `parent`, `controller`, `id` (ENGINE). `ctx.world.assets[ref].gait` (ENGINE AssetMetadata). `ctx.sleep()` (ENGINE gap).
- What it does: turns a humanoid to its heading and picks Idle/Walk/Run/Sprint clips from the body's measured paces. Sits the body on a seat.
- Issues:
  - Line 223: `clip: clips.sit || sit` passes a JavaScript function as the anim clip. ENGINE and player.js lines 7-8 document clips as address strings. PLAUSIBLE mismatch.
  - Lines 225-228 and 238-239: `ctx.self.bones.LeftFoot.ground` throws if the body has no `LeftFoot` bone (a non-humanoid seated body). PLAUSIBLE crash, unguarded.
  - Lines 335-336: `ctx.self.yaw` is written every tick while `targetYaw` is numeric, even when steady (camera mode is always numeric). Possible wire churn; UNVERIFIED whether an equal write is a row.
  - Lines 91-99: `pacesOf` allocates a new object every tick (minor CPU).
  - Lines 282-283: example speeds (2.6, 5.4 m/s) do not match player.yml (`walkSpeed: 6`, no `runSpeed`). Comment only.
  - 131 of 365 lines are comments (36%), prose-heavy (INVARIANT 6).
  - Line 364: `ctx.sleep()` depends on an undocumented behaviour.

## 12. /workspace/game-6/scripts/lighting.js
- Export: `lighting(surface, lights)`. No hook named `lighting` in ENGINE 2.2 (UNVERIFIED).
- Imports: `builtin/tsl` `dot, max, mix, normalize, pow, clamp, float, vec3, oneMinus, PI` (UNVERIFIED).
- Calls: `lights.each`, `light.direction`, `light.radiance`, `lights.ambient`, `lights.environment`, `surface.occlusion` and the surface fields (all UNVERIFIED).
- What it does: Cook-Torrance GGX specular, Smith G, Schlick F, Lambert diffuse, ambient. Maths checked and standard.
- Issues:
  - Line 5: refers to a "looks" skill. ENGINE 6.2 #6: no such skill exists. Phantom reference.
  - 13 of 41 lines are comments.

## 13. /workspace/game-6/scripts/look-default.js
- Export: `look(ctx)`.
- Imports: `builtin/postfx` `grade`, `vignette`, `grain` (ENGINE: functions exist; option names UNVERIFIED).
- Calls: `ctx.scene` (ENGINE). `ctx.param('vignette', 0.2)` (commented, line 20; UNVERIFIED in postfx).
- What it does: grade (exposure 1.05, saturation 0.95, contrast 1.04, temperature -0.06).
- Issues:
  - Line 2 says "Out of the box it changes nothing". Line 17 says "Uncomment to start grading", but line 18 `grade(...)` is live. Header contradicts code. CONFIRMED.
  - Line 9: refers to a "looks" skill (phantom, ENGINE 6.2 #6).
  - Line 20: vignette colour as an array; look-highlands.js line 5 uses an `oklch(...)` string. PLAUSIBLE type mismatch.
  - Line 18 duplicates the grade values in `scripts/lib/data/aesthetic.yml` line 15. Drift risk.

## 14. /workspace/game-6/scripts/look-highlands.js
- Export: `look(ctx)`.
- Imports: `builtin/postfx` `grade`, `vignette`, `grain`.
- Calls: `ctx.scene` (ENGINE), `ctx.param("vignette", 0.18)` (UNVERIFIED), grade `haze` and `temperature` (UNVERIFIED), vignette colour as oklch string (UNVERIFIED).
- What it does: cooler, thinner grade, blue vignette, grain.
- Issues: see look-default.js (colour type). No comment besides the header.

## 15. /workspace/game-6/scripts/pebble.js
- Export: `geometry(ctx)`.
- Calls: `ctx.params`, `ctx.color`, `ctx.random`, `ctx.tri` (ENGINE). `ctx.quad` (UNVERIFIED).
- What it does: six-sided stone; ground ring, shoulder ring, crown; per-item random shape.
- Issues: none confirmed. Quad and tri winding (lines 27-28) is consistent.

## 16. /workspace/game-6/scripts/player.js
- Hooks: `onInput`, `update`, `onOutOfBounds(ctx, event)` (ENGINE 2.2). `w7Checked(ctx, r, { text })` is a named job callback (ENGINE: `(ctx, r, payload)`).
- Imports: `./lib/data/player.yml` (exists). `./ex/fr-player.js` (EXCLUDED: `frontierTick`, `frontierOOB` UNVERIFIED).
- Calls: `ctx.query({tags, radius})`, `ctx.emit` with `to`, `via`, `audience` (ENGINE). Acts `press`, `turn`, `w7post` (custom), `openSettings` (ENGINE, `page: 'keys'`), `playSound` (ENGINE, `audience: { player }`), `milestone` (UNVERIFIED). `ctx.proposePurchase(ctx.self, id)` (ENGINE). `ctx.self.state.purchases` (ENGINE, read-only). `ctx.self.session` (ENGINE). `ctx.job('text:check', { text, purpose }, 'w7Checked', { text })` (ENGINE form; `purpose` UNVERIFIED). `ctx.place.gravity.y` (ENGINE). `ctx.sleep(0.3)` (ENGINE gap). `ctx.now()`, `grounded`, `velocity`, `parent`, `controlling`, `displayName`, `isGuest`, `feetPosition`, `id` (ENGINE). Inputs `pressed.interact/jump/wheelUp/wheelDown/w7ui`, `axes.moveX/moveZ/aimYawSin/aimYawCos/w7spin`, `actionData` (ENGINE).
- What it does: WASD walking with eased intent, jump, gallery interaction (E), desk-dial turns, sign text checks, frontier fall-back.
- Issues:
  - Lines 32 and 114-118: `w7Desk` runs `ctx.query({ tags: ['w7-dial'], radius: 4 })` on every `onInput` call, which has no fixed rate (ENGINE cameras). Efficiency.
  - Line 10: imports from `./ex/` (outside this analysis; UNVERIFIED).
  - Line 85: `ctx.sleep(0.3)` relies on an undocumented behaviour (gap).
  - Line 130: playSound clip path with a leading slash (`/cdn/...`), ENGINE 6.2 #4 form mismatch.
  - 36 of 144 lines are comments (25%).

## 17. /workspace/game-6/scripts/routing.js
- Export: `pickRoom(ctx)` (async). ENGINE rooms-and-matchmaking.
- Imports: `builtin/room-routing` `mostFullWithSpace`, `nextRoomName` (ENGINE).
- Calls: `ctx.requestedRoomId`, `ctx.rejectedRooms`, `ctx.rooms` (ENGINE).
- What it does: honours a requested room, else the most-full room with space, else a new name.
- Issues: none. Not wired (no routing block in world config, ENGINE 6.2 #15).

## 18. /workspace/game-6/scripts/tex-gallery.js
- Export: `texture(ctx)` (ENGINE 2d-mode texture form).
- Calls: `ctx.canvas(128, 128)` (UNVERIFIED), `ctx.params`, `ctx.random` (ENGINE).
- What it does: checker, rings, runes textures by `?kind=`.
- Issues: none. No `meta`, so the default filter applies (UNVERIFIED default).

## 19. /workspace/game-6/scripts/tex-leaves.js
- Exports: `meta = { filter: "linear", wrap: "clamp" }` (ENGINE leaf-sprays), `texture(ctx)`.
- Calls: `ctx.canvas` (UNVERIFIED), `ctx.params.kind`, `ctx.random` (ENGINE). Browser canvas `getImageData`.
- What it does: twig-spray cards (broad, small, needle).
- Issues:
  - Line 9: `wid = small ? 30 : 30` has equal branches (dead ternary).
  - Lines 10-11: `cover()` reads back the full 512x512 canvas on every loop iteration (up to 26 reads). Bake-time CPU.
  - Coverage rule (0.4) matches ENGINE leaf-sprays.

## 20. /workspace/game-6/scripts/tex-south.js
- Export: `texture(ctx)`.
- Calls: `ctx.canvas` (UNVERIFIED), `ctx.params`, `ctx.random` (ENGINE).
- What it does: sigil and splat textures (No. 42 sprite, No. 43 decal).
- Issues: none.

## 21. /workspace/game-6/scripts/tree.js
- Exports: `geometry(ctx)`, `collider(ctx)`.
- Calls: `ctx.params.kind`, `ctx.params.h`, `ctx.lod`, `ctx.random`, `ctx.tri`, `ctx.color`, `ctx.albedo` (ENGINE, trees skill). Return shapes `{ uvs, normals }` and `{ kind: "cylinder", ... }` (ENGINE).
- What it does: oak, birch, fir, pine. Bark tubes and card crowns.
- Issues:
  - Lines 30, 32, 63: textures are `cdn/...` (no leading slash). `buyables/*.js` use `/cdn/` (ENGINE 6.2 #4). Inconsistent path forms.
  - Line 65: `(3 / lod)` divides by lod (documented 1 to 5; not reachable at 0).
  - Line 37: index 0 of the `[lod]` array is unused (harmless).
  - Line 46: `if (lod <= 2) tint(-0.3), card(...)` is correct; the comma expression is the whole body.

## 22. /workspace/game-6/scripts/ui.js
- Export: `render(ctx, player)` as default (ENGINE game-ui). Page globals: `onMount`, `onDestroy`, `cmPhoto`, `cmUpload`, `cmStop`, `cmMic`.
- Calls: `ctx.getObject?.`, `ctx.world.inputs.actions.interact.label`, `ctx.world.inputs.axes.moveZ.label`, `ctx.place.objects`, `ctx.now()`, `ctx.worldToScreen({x,y,z})`, `ctx.view.site`, `player.state`, `player.controlling.state`, `player.isGuest` (all ENGINE). Globals `sendAction`, `sendAxis`, `openLink`, `window.spawn.view.captureFrame`, `window.spawn.chat.sharePicture`, `window.spawn.assets.upload`, `window.spawn.user.upgradeGuest` (ENGINE). Attributes `data-modal`, `data-world-anchor`, `data-anchor-offset`, CSS `--anchor-depth`, `--spawn-chrome-reservation-right-inset` (ENGINE).
- What it does: gallery HUD: passport, exhibit card, prompt, control desk, signal desk, speedo, commons panels.
- Issues:
  - Lines 2 and 4: `TOTAL = 166` hardcoded (ENGINE 6.2 #13; drifts).
  - Line 31: `ex.title.toUpperCase()` is unguarded. If the exhibit state has no `title`, render throws and blanks the HUD (ENGINE game-ui gotcha). PLAUSIBLE.
  - Lines 30-32: `ex.no` and `ex.api` are not escaped; only `ex.code` is (line 33). Low risk, inconsistent.
  - Line 78 (`cmStop()`) and line 184 (`sendAxis`) have side effects inside `render`, which runs up to 30 times a second.
  - Lines 45-48 reference `scripts/ex/commons-ui-input.js` (excluded; UNVERIFIED).

## 23. /workspace/game-6/scripts/lib/alpine-hat.js
- Exports: `HAT_ID(pid)`, `HAT`, `dress(ctx, player)`.
- Calls: `ctx.getObject`, `ctx.spawn(id, spec)` (ENGINE). Spec keys `primitive: scripted`, `attachment: { bone: "Head" }`, `parent`, `feetPosition`, `scale`, `tags` (ENGINE). `material: { pbr: true }` (object-level `pbr` UNVERIFIED). Script `scripts/ex/market-geo.js` (EXCLUDED).
- What it does: spawns the alpine hat on a player's Head bone.
- Issues:
  - Line 1 says `shop.js` re-dresses owners. `scripts/shop.js` does not exist (ENGINE 6.2 #18; confirmed by listing). Dangling reference.
  - Line 13: `ctx.getObject(player.id + "/" + id)`: id form not in the notes (ENGINE 6.2 #10).

## 24. /workspace/game-6/scripts/lib/dialog.js
- Exports: `page`, `next`, `nodeOf`.
- Imports: `./data/hermit.yml` (exists).
- Calls: none engine.
- What it does: story-card pages and choices from YAML.
- Issues:
  - Line 1 says "the hermit and the player's input both use it". Neither in-scope file imports it. Caller UNVERIFIED.
  - `next()` may return the sentinel `'end'`; caller handling not in scope.

---

## YAML data files (scripts/lib/data/)

### 25. aesthetic.yml
- Keys: `name`, `palette`, `finish`, `era`, `mood`, `hour: 13`, `clouds`, `fog: { near, far }`, `ground`, `grade`, `reference`.
- In-scope importers: none. Header says "A script may import it".
- Issues: `grade` duplicates look-default.js line 18 (drift). `fog` has no `kind`; ENGINE AtmosphereDef requires `fog.kind` (`"linear"` with near/far, or `"exp2"`). PLAUSIBLE mismatch if fed to atmosphere. `clouds` shape not in notes.

### 26. camera.yml
- `eyeHeight: 1.6`. Importer: camera.js line 11. Matches ENGINE cameras skill. No issues.

### 27. car77.yml
- Keys: `mass`, `com`, `wheels` (four hubs), `mountY`, `rest`, `radius`, `spring`, `damper`, grip and engine values, `gears`, `seats`, `grid`.
- In-scope importers: none (likely `ex/`; UNVERIFIED).
- Issues: none. Comment arithmetic checks (0.31, 0.44). Values sit inside vehicles-skill bands. `com` vs ENGINE `centerOfMass` mapping UNVERIFIED.

### 28. commons-market.yml
- Keys: `shop.items.hat { buyable: alpine-hat, price: 25, once: true }`, `shop.items.tip { buyable: commons-tip, price: 5, min: 1 }`, `summit`, `wallet`, `chests { seedA: 6, seedB: 0 }`.
- In-scope importers: none (UNVERIFIED).
- Issues: `price` and `min` do not match the ENGINE buyables schema (`priceSpoins`, `minSpoins`). PLAUSIBLE if fed to buyables. `seedA/seedB` values match db.js `gem_chests` seeds; key mapping UNVERIFIED.

### 29. hermit.yml
- Keys: `title`, `nodes` (start, how, lichen, gift) with `text`, `react`, `choices [{label, go}]`, and `gift: lichenDust` on one node.
- Importer: dialog.js line 2.
- Issues: `react` and `gift` have no in-scope consumer (UNVERIFIED). The gift text says `player.state.lichenDust` rises by one; no in-scope writer. `go: end` is a sentinel.

### 30. player.yml
- Keys: `acceleration: 80`, `deceleration: 120`, `jumpSpeed: 10`, `turnInPlace: 90`, `turnSmoothing: 0.06`, `turnSpeed: 900`, `turnTo: movement`, `walkSpeed: 6`.
- Importers: player.js line 9, humanoid-locomotion.js line 29. Matches ENGINE cameras skill sample exactly.
- Issues: humanoid-locomotion.js reads keys absent here (`runSpeed`, `walkThreshold`, `runThreshold`, `sprintThreshold`, `clips`, `speedOverride`, `modelYaw`). All reads are guarded with `typeof`, `||` or `??`, so no crash; defaults govern behaviour.

### 31. race.yml
- Keys: `manager`, `karts` (4), `center`, `rx: 40`, `rz: 28`, `n`, `laps: 3`, `top`, `turn`, `pull`, `aiGas` (4), `aiLook`, `countdown`, `results`.
- In-scope importers: none (UNVERIFIED).
- Issues: none. Oval 80 x 56 m gives about 215 m perimeter, matching "~217 m". `aiGas` has four entries for four karts.

### 32. veh-bike.yml
- Keys: `mass`, `vMax`, `vBack`, `accel`, `brake`, `grip`, `leanMax: 28`, `steerLock`, `wheelbase`, `seat`.
- In-scope importers: none (UNVERIFIED). `leanMax 28` is inside the vehicles-skill band. No issues.

### 33. veh-heli.yml
- Keys: `mass`, `hoverFrac`, `liftMax`, `climb`, `descend`, `governor`, `sink`, `spoolUp`, `tiltRate`, `level`, `yawRate`, `drag`, `seat`.
- In-scope importers: none (UNVERIFIED).
- Issues: `drag: 0.35` is script air drag, not physics `linearDamping` (about 0.03). Different concept, not a bug. Line 12 comment is unclear prose.

### 34. veh-plane.yml
- Keys: `mass: 700`, `thrust: 9500`, `cl: 5.6`, `dragK`, `sideK`, rates, `vFly: 20`, `rollGrip`, `seat`.
- In-scope importers: none (UNVERIFIED).
- Issues: header says "stall ~16 m/s", but line 5's `lift = cl * v² * mass/100` lifts its weight (16800 N at gravity -24) near 21 m/s. Stall figure and lift constant disagree. PLAUSIBLE.

### 35. veh-tank.yml
- Keys: `mass: 3000`, `vMax: 7`, `vBack: 3`, `turnRate`, `accel`, `grip`, `turretRate`, `linkLen`, `reload`, `seat`.
- In-scope importers: none (UNVERIFIED). No issues.

### 36. world.yml
- `terrain.baseHeight: 0`. Importer: flat-starter-terrain.js line 3. No issues.

---

## Gaps
- `ctx.sleep` behaviour (player.js line 85; humanoid line 364).
- `ctx.self.yaw`, `.effectiveScale`, `.model`, `.bones`, `.mixer`, anim channel fields (humanoid, camera).
- `ctx.scatter` fields (grass-look.js); `ctx.canvas` (tex-*.js); `ctx.quad`, `ctx.sway` (flower, grass, pebble).
- `ctx.param` in the postfx context (look-default, look-highlands).
- `builtin/tsl` and `builtin/three` names; `builtin/lighting` beyond `sunDirection`/`sunRadiance`.
- A `lighting` export as a hook (lighting.js).
- Scope fields `in`, `post`, `slow` (chat.js). Emit act names `say`, `milestone`, `turn`, `w7post`.
- `text:check` argument `purpose` (player.js).
- `ObjectView.bounds.obb.halfExtents` (camera.js).
- Anim clip given as a function (`sit`, humanoid line 223); `sit.units` and `sit.duration`.
- Importers of aesthetic.yml, car77.yml, commons-market.yml, race.yml, veh-*.yml, and hermit.yml `react`/`gift`; the caller of dialog.js. Grep is not allowed; these would be in `scripts/ex/`.
- `scripts/ex/` (excluded): fr-player.js, market-geo.js, commons-ui-input.js.
- `scripts/architecture.json` (non-script, not analysed).
- Wiring of flat-starter-terrain.js and blocks-terrain.js into world config (not in scope).

```json
{"files": 36, "calls": 37, "issues": 25, "gaps": ["ctx.sleep behaviour undocumented (player.js:85, humanoid-locomotion.js:364)", "ctx.self.yaw/effectiveScale/model/bones/mixer and anim channel fields not in notes (humanoid-locomotion.js, camera.js)", "ctx.scatter fields not in notes (grass-look.js)", "ctx.canvas, ctx.quad, ctx.sway not in notes (tex-*.js, flower.js, grass.js, pebble.js)", "ctx.param in postfx context not in notes (look-default.js, look-highlands.js)", "builtin/tsl, builtin/three named exports not in notes (grass-look.js, lighting.js)", "lighting export is not a known hook (lighting.js)", "chat scope fields in/post/slow not in notes (chat.js)", "emit act names say, milestone, turn, w7post not in notes (chat.js, player.js)", "text:check purpose arg not in notes (player.js)", "ObjectView.bounds.obb.halfExtents not in notes (camera.js)", "anim clip as function and sit.units/sit.duration not in notes (humanoid-locomotion.js)", "importers of aesthetic, car77, commons-market, race, veh-*, hermit gift/react, and dialog.js unverified (grep not allowed; likely scripts/ex/)", "scripts/ex/ excluded: fr-player.js, market-geo.js, commons-ui-input.js", "scripts/architecture.json not analysed", "flat-starter-terrain.js and blocks-terrain.js world-config wiring not in scope"]}
```