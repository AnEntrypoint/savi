CHUNK=scripts-top

Read every file in scope (22 top-level .js, 2 lib .js, 12 lib/data .yml). Engine calls were checked by identifier against the five notes files; anything absent is marked unverified. `ex/` was not analysed except to confirm that the files imported from it exist.

**Top-level scripts**

- **arrival.js** (L9, L11): empty `onArrive(ctx, player)` and `onLeave(ctx, player)` hooks. Header claims `ctx.cross` fires neither hook; notes say this was observed in game-6. No issues.
- **blocks-terrain.js** (L5, L19): exports `cave` and `materialAt({x,y,z,noise,seedOffset})`; the Blocks island ground is y 8, a hill to about 22. Uses `noise.fbm2`, `noise.simplex3`. Gap: no `heightAt` is exported here, so the source of heights is unverified.
- **camera.js** (L11, L29, L43-46, L50): sets `ctx.self.hideLocalPlayer`, `ctx.self.feetPosition`, `ctx.self.rotation` from `ctx.self.view`. Reads `ctx.self.target`, `ctx.player.parent`, `body.bounds`, `body.effectiveScale`, `worldFeetPosition`.
  - Issue L43: `body.bounds?.obb.halfExtents.y` throws when `bounds` is set but `obb` is not.
  - Issue L45: seated uses `worldFeetPosition` while unseated uses `feetPosition`. Frame consistency is unverified.
- **chat.js** (L2, L3-5): exports `scopes.gallery` with `in`, `post`, `slow: 3`. Issue L2: the comment cites `ctx.emit("say", ...)`, which notes flag as not shown by the emitter (observed in the notes). `slow` is unverified.
- **db.js** (L3-9): `migrate(sql)` with tagged-template SQL and `ON CONFLICT DO NOTHING`. Issue L8: gem_chests seed 6/0 is hardcoded here and duplicated in `lib/data/commons-market.yml` (chests). Changing the yml will not change the seed.
- **flat-starter-terrain.js** (L5-11): `heightAt()` returns `WORLD.terrain.baseHeight`; `materialAt` returns `{grass:1}`. No issues.
- **flower.js** (L7-37): geometry with `ctx.color`, `ctx.quad`, `ctx.sway(1)`. `quad` and `sway` are unverified (absent from notes).
- **grass-look.js** (L17-33): `material(ctx)` builds a `MeshStandardNodeMaterial` (builtin/three) using `ctx.scatter.groundTint`, `position`, `heightFraction`, and TSL `hash`, `cameraPosition`, `positionWorld`, `sunDirection`, `sunRadiance`. All unverified in notes. Logic at L31 checks out: `dot(-toEye, sunDirection)` is 1 when looking into the sun.
- **grass.js** (L11-34): one blade of two crossed quads, four triangles. Matches its comment. `ctx.sway` is unverified.
- **highlands-terrain.js** (L7-27): exports `valleyX`, `heightAt(ctx)` (uses `shore` from builtin/terrain) and `materialAt(ctx)` (`worldHeight`, `slope`, `noise`, `seedOffset`). No issues.
- **lighting.js** (L8-41): Cook-Torrance GGX, Smith G, Schlick F, Lambert diffuse. Formulas match the standard model. Uses `lights.each`, `light.direction`, `light.radiance`, `lights.ambient`, `lights.environment`, `surface.occlusion`. All unverified in notes. `light.color` and `light.shadow` are documented in the comments but never read.
- **look-default.js** (L1-4, L10, L18, L20, L22): `look(ctx)` applies a hardcoded grade.
  - Issue L18: the grade values duplicate `aesthetic.yml` L15 and do not read it, so they can drift.
  - Dead import: `vignette` and `grain` are only used in commented lines.
  - Issue L20: the commented vignette passes `color` as an RGB array, while `look-highlands.js` L5 passes an oklch string. The accepted type is unverified.
- **look-highlands.js** (L3-7): `grade` with `haze`, `vignette` with `ctx.param`, and `grain`. `haze` is unverified.
- **pebble.js** (L7-30): low six-sided geometry using `ctx.random`, `ctx.quad`, `ctx.tri`. `quad` is unverified. No issues.
- **routing.js** (L1-9): `pickRoom(ctx)` using `ctx.requestedRoomId`, `ctx.rejectedRooms`, `ctx.rooms`, `mostFullWithSpace`, `nextRoomName` from builtin/room-routing (notes confirm the names). Dead as shipped: the header says there is no routing block in world.config.yaml.
- **tex-gallery.js** (L3-7): `texture(ctx)` with `ctx.canvas`, `ctx.params`, `ctx.random`.
  - Issue L6: in the `rings` branch, `hue + r` concatenates when `hue` arrives as a query string. That yields `hsl(20060 ...)`, which is invalid CSS. `tex-south.js` L3 avoids this with `Number(hue)`. The string type of `ctx.params` is unverified.
- **tex-leaves.js** (L9-52): `meta` export and `texture(ctx)` for needle, broad and small leaf cards.
  - Dead ternary L9: `wid = small ? 30 : 30`.
  - Efficiency L10: `cover()` does a full `getImageData` readback inside the loop at L11, up to 26 times per texture at 512².
- **tex-south.js** (L2-20): sigil and splat textures with `ctx.canvas`, `ctx.params`, `ctx.random`. No issues.
- **tree.js** (L2-78): `geometry(ctx)` and `collider(ctx)` using `ctx.params`, `ctx.lod` (1 to 5 per notes), `ctx.random`, `ctx.tri`, `ctx.color`, `ctx.albedo`. Returns `{uvs, normals}` as the notes state. L46 relies on comma-in-if precedence (`if (lod<=2) tint(), card()`) and is hard to read but correct. No other issues.
- **player.js** (L9-10, L24-29, L53-55, L79, L127-130, L136-143): `onInput`, `update`, `onOutOfBounds`, plus w7 helpers.
  - Issue L28: `try { ctx.proposePurchase(...) } catch (e) {}` swallows failures silently, which hurts debugging.
  - Import L10 from `ex/fr-player.js` is outside this chunk (the file exists in ex/).
  - Unverified: `ctx.emit('milestone', ...)` (L127) and `ctx.job('text:check', ...)` callback `w7Checked(ctx, r, {text})` (L136-139, `r.ok` / `r.data.ok`).
- **ui.js** (L18-42, L63-155, L158-219): HUD `render(ctx, player)` default export plus named `cmPhoto`, `cmUpload`, `cmMic`, `cmStop`, `onMount(container)`, `onDestroy`.
  - Issue L31-35: `ex.title`, `ex.api`, `ex.wing` (L30-32), `s.prompt` and `use` (L35) are interpolated without escaping, while `ex.code` (L33) is escaped. Creator-controlled, so low risk.
  - Issue L31: `ex.title.toUpperCase()` throws if `title` is missing.
  - Issue L125-155: `cmMic` leaks the stream and `AudioContext` if `createMediaStreamSource` or later steps throw. The `cm-live` box also stays in the DOM.
  - Mismatch: `onMount(container)` (L89) vs notes `onMount(container, player)`.
  - Unverified: `window.spawn.chat.sharePicture({blob})` is called without the `scope` argument the notes list.
  - Hardcoded dial position L187 and colours throughout.
- **humanoid-locomotion.js** (L29-365): `update` and `onInput` gait logic, `sit()` pose export, PLAYER reads, `stepAngle`.
  - Config gaps: `PLAYER.speedOverride` (L255), `walkThreshold` / `runThreshold` / `sprintThreshold` (L289-291), `modelYaw` and `clips` are read but not defined in `lib/data/player.yml`. The reads fall back, so they are dead for the shipped config.
  - Unverified: `ctx.self.bones.*.ground` (L227), `ctx.self.model` and `ctx.world.assets[ref].gait` (L91-94, the notes do list `gait` in AssetMetadata), `anim.sit = { clip: sit }` with a function as clip (L223), `sit.units` and `sit.duration` (L139-140).
  - Heading maths at L167 and L184 is consistent with player.js L47-48.

**Top-level and lib data files**

- **lib/alpine-hat.js** (L2-16): `HAT_ID`, `HAT`, `dress(ctx, player)`. Issue: `HAT_ID` embeds `player.id`, which contains a slash (`player/<session>`). The first check at L13 uses the unprefixed id, while the second check at L13 uses `player.id + "/" + id`. The spawn at L14 uses the unprefixed id. The two existence checks do not match the spawn id, so duplicate or ghost hats are possible. Unverified against engine id rules.
- **lib/dialog.js** (L2-13): `page`, `next`, `nodeOf` over `hermit.yml`. Issues: the header (L1) says the player's input uses it, but player.js does not import it. `next()` returns the sentinel `"end"`, which is not a node, so `page(book,'end')` returns null. Callers must handle that.

**lib/data YAML**

- **aesthetic.yml**: look data. The header says a script may import it, but no file in this chunk does. Its `grade` duplicates look-default.js L18. `hour`, `clouds` and `fog` are unused in this chunk.
- **camera.yml**: `eyeHeight: 1.6`, read by camera.js L11 and L44. Consistent.
- **car77.yml**: tuning. The comment arithmetic at L12-13 checks out (spring sqrt(5500/62.5)/30 is about 0.31; damper 820/30/62.5 is about 0.44). No issues.
- **commons-market.yml**: prices and chest seeds. Issue: `chests.seedA: 6` and `seedB: 0` duplicate db.js L8 with no link, so they can drift. The `hat` item references `alpine-hat`, which lives in buyables/ (outside this chunk).
- **hermit.yml**: story card nodes start, how, lichen, gift. Mismatch L12: the text says "your body's onInput reads it", but player.js onInput does not handle `commonsUi` ops. The handler is in `ex/commons-ui-input.js` (ui.js L48). Gap: the `gift: lichenDust` increment (L26) has no reader or writer in this chunk.
- **player.yml**: movement numbers. Keys read by player.js and humanoid-locomotion.js. The header names clip thresholds that are not in the file (see humanoid notes above).
- **race.yml**: Issue: the header says about 217 m per lap and about 17 s at full gas. The Ramanujan ellipse perimeter for 40 by 28 is about 215 m, and 217 / 14 is about 15.5 s. `results: 8` against 4 karts is unexplained. Both are minor.
- **veh-bike.yml**, **veh-tank.yml**: numbers only. No issues.
- **veh-heli.yml**: numbers only. No issues.
- **veh-plane.yml**: Issue: the header says top speed is about 46 m/s, but with `dragK 0.0042` applied as `dragK * v^2 * mass` and thrust 9500 N, the balance point is near 57 m/s. Mismatch is likely; runtime check needed.
- **world.yml**: `terrain.baseHeight: 0`, read by flat-starter-terrain.js only. blocks-terrain uses y 8. Which place uses which is outside this chunk.

**Gaps (unverified in notes or outside chunk)**

- TSL and three: `hash`, `cameraPosition`, `positionWorld`, `MeshStandardNodeMaterial`.
- Scatter and material fields: `ctx.scatter.groundTint`, `heightFraction`, `position`.
- Lighting surface and light fields: `lights.each`, `light.radiance`, `light.direction`, `lights.ambient`, `lights.environment`, `surface.occlusion`.
- Scripted geometry: `ctx.quad`, `ctx.sway`.
- Self fields: `ctx.self.effectiveScale`, `ctx.self.bones`, `ctx.self.model`, `ctx.self.sprite`, `ctx.self.mixer`. Partially covered by notes, not confirmed.
- Hooks: `render` default export for HUD, `sit` as a clip function, `onMount` argument list.
- Act names: `milestone`, `say` (chat.js L2).
- Job callback: `text:check` result shape (player.js L136-139).
- Files referenced from `ex/` (fr-player.js, commons-ui-input.js, market-geo.js): outside this chunk, only existence was checked.
- Consumers of `hermit.yml` `gift`, `aesthetic.yml`, and the veh-*.yml and race.yml numbers: not in this chunk.

**Files**: 36 (22 top-level .js, 2 lib .js, 12 lib/data .yml).

{"files": 36, "calls": 110, "issues": 22, "gaps": ["heightAt source for blocks-terrain.js not in chunk", "TSL hash/cameraPosition/positionWorld and MeshStandardNodeMaterial unverified in notes", "ctx.scatter groundTint/heightFraction/position unverified", "lights.* and surface.occlusion, light.radiance/direction unverified", "ctx.quad and ctx.sway unverified", "ctx.self.effectiveScale/bones/model/sprite/mixer partly unverified", "render default export and sit clip function unverified as hooks", "milestone and say act names unverified", "text:check job callback shape unverified", "ex/ files fr-player.js, commons-ui-input.js, market-geo.js outside chunk", "hermit.yml gift lichenDust has no reader or writer in chunk", "aesthetic.yml not imported by any chunk file", "veh-plane top-speed comment vs dragK formula needs runtime check", "commons-market.yml chest seeds duplicated in db.js with no link"]}