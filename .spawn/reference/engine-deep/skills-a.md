# Engine skills, part A (first 12 alphabetically)

Source: /workspace/savi/.spawn/engine/skills/ (each section names its file). Quotes are verbatim from the docs. Items marked (inferred) go beyond what the doc states.

## 2d-mode
File: /workspace/savi/.spawn/engine/skills/2d-mode.md

What it does: 2D worlds with `mode: "2d-top" | "2d-side"`. `spawn starter 2d-top` (or `2d-side`) is the first call on a young world and sets mode, gravity, a drawn player (`scripts/tex-hero.js`, `?facing=` set), the rig, and a drawn wang ground.

API calls and fields:
- `tileAt({ x, y, world })` returns a 1-based atlas id per cell (0 or null = empty). x right, row 0 at the TOP.
- `solidTiles: [ids]` merges tiles from `tileAt` into colliders.
- `terrain: { kind: "tilemap", tileSize: 1, tileset: "scripts/<name>.js?a=<A>&b=<B>", tilesetColumns: 4, generator, solidTiles: [ids], width, height }`. Infinite unless BOTH width and height are set, then centered on the origin.
- `ctx.place.tiles[x][y] = id` paints for everyone; `= 0` carves; `delete` returns the cell to `tileAt`.
- `sprite.texture: "scripts/tex-<subject>.js?<params>"`, `sprite.size`, `sprite.upright: true`.
- `sprite.sortingLayer`, `.sortingOrder`, `.ySort`; `sprite.parallax: [fx, fy]`, `.repeatX: true`.
- `collider2d: { outline: [[x, y], ...] }` (3 or more points = convex hull).
- `camera.state: { orthoSize, heightOffset, distance }`.
- `ctx.self.velocity = { x, y: 0, z }` (2d-top) and `{ x: vx, y: v.y + GRAVITY * dt, z: 0 }` (2d-side).
- `ctx.atlas({ frameSize, animations: { idle: 2, walk: 4 }, fps, draw(g, f) })`; mixer plays by name via `ctx.self.anim.locomotion = { clip: "walk", weight }`.
- `light.fan`, points in metres from the lamp (`[x, z]` in 2d-top, `[x, y]` in 2d-side); `decay` defaults to 2, `decay: 1` soft linear.
- `spawn paint "<piece>, <style>" [--ref <pic>] --transparent --size 1024x1024`; `spawn cutout <pic>`.
- Wang atlas: 16 corner-mask tiles, id = mask + 1, bits TL=1 TR=2 BL=4 BR=8 (1 pure A, 16 pure B). Atlas is a texture script (`spawn api TextureScript`).
- Facing set: up, down, left, right, up-left, up-right, down-left, down-right. Bare ref = down pose (2d-side: right).

Placement and file rules:
- 2d-top: y grows down-screen (+Z). Up-input is −z. Bodies pinned to the plane.
- 2d-side: y grows down (−Y). Player z 1.5; level geometry z −1..0; plates −15..−3; foreground 3+.
- 2d-top: world objects are SOLID (`physics: "static"`). A tall sprite collides at its FEET via `collider2d` (image space, y down, normalized, v = 1 is the feet). Foot band example: `[[0.32, 0.86], [0.68, 0.86], [0.68, 1], [0.32, 1]]`. Ground decals are `physics: "none"`. 2d-top has NO ground collider.
- 2d-side: depth dressing is non-solid. Plates, canopies, signs take `physics: "none"`. Solid is the playable band (`solidTiles`, platforms, blockers).
- A 2d-side ground is a surface band over a borderless fill; boxes are platforms and blockers, never the running surface.
- Solid tiles are colliders in BOTH modes. `tiles[x][y]` gating is only for non-physical movement (grid-snap).
- Sprite texture scripts: `export function texture(ctx)`; first canvas IS the texture (nearest-sampled).
- Texel density: 32 texels per metre; 2d-top hero 32×40 frame; 2d-side hero 56×64.
- Backdrop: strip script (starter `scripts/tex-sky.js`) on a camera-attached sprite; torus-tileable (every period divides the width).
- HUD icons, signs, words: crisp vectors (inline `<svg>` in ui.js, or an object's `vector:`).
- Lights sit off the play plane (2d-top y ≈ 1.5–3; 2d-side z ≈ 1.5–3). Plates are unlit.
- Stairs and cliffs to walk on need a 3D place, pixel-art 3D camera, and `engine.graphics.perfectPixelArt`.
- Hopping between 2D and 3D places: a template `sprite` stays on in 3D; a template with no visual wears the avatar there; the 2D place's `onArrive` adds the `sprite`.

Test or verify steps: none stated in the doc.

Gotchas:
- 2d-top has no ground collider, ever.
- Use `ctx.self.velocity` in 2d-side with gravity bent in by the script; a wander script without it floats.
- Never flipX or negative scale for facing; the script draws each pose.
- Always author `sprite.size` on a scripted ref.
- Every paint or edit redraws the whole picture; no two calls agree on size or build. A one-frame fix pastes only the fixed part.
- Light shines through sprites unless bounded with `light.fan`.
- Each paint or edit redraws the picture, keeping no source pixel.

## buyables
File: /workspace/savi/.spawn/engine/skills/buyables.md

What it does: repeatable purchases (unless `once: true`), one per account for once-items. The platform owns payment and the purchase record.

API calls and fields:
- `world.config.yaml` → `buyables.<id>`: `name`, `description`, `priceSpoins` (integer up to 10000; 1 Spoin = $0.01; creators keep 50%), `imageUrl` (a /cdn/ address; else a Spoin icon), `once`, `onPurchase` (a script), `minSpoins` (pay-what-you-want, tip jar).
- `ctx.proposePurchase(buyer, id)`: returns a requestId; never proof of payment. Buyer is an entity handle or id, subject-first.
- `onPurchase(ctx, buyer)`: runs once on verified completion.
- `ctx.purchase: { buyableId, transactionId, priceSpoins, … }` inside onPurchase only.
- `player.state.purchases[buyableId]` → `{ transactionId, at }`, read-only; undefined until bought.
- Runtime: `ctx.world.buyables.<id> = { name, priceSpoins, minSpoins?, imageUrl?, description?, onPurchase? }`; `ctx.world.buyables.<id>.<field> = v`; `delete ctx.world.buyables.<id>` (or `= null`); `ctx.world.buyables.<id>` reads the record; `Object.keys(ctx.world.buyables)` and `'x' in ctx.world.buyables` list them.

Placement and file rules:
- Definitions live in `world.config.yaml` under `buyables.<id>`. `onPurchase` is a script file (example `scripts/buyables/grant-cape.js`).
- Stall offer is named on the stall's ui plate (`ctx.self.state.buyable = "golden-cape"`); the engine draws no prompt.

Test or verify steps: the owner or editor buys free. Press the stall: the checkout says free, `onPurchase` runs, and `purchases` records it.

Gotchas:
- The record is written by the platform alone; a script or client write never saves.
- `player.state.purchases` is the gate for equips, doors and "owned" badges.
- Do not put a sql or job inside onPurchase: the purchase can still be released.
- No failure hook. A cancelled payment never reaches world code. A failure the platform cannot start toasts the buyer and leaves `purchase.refused.<why>` in getLogs.
- A rejoin dresses from the record: check `ctx.self.state.purchases?.[id]` in the player's onSpawn.

## cameras
File: /workspace/savi/.spawn/engine/skills/cameras.md

What it does: camera definition, rig script, and the layering of camera control (third person, first person, chase, iso, top-down, 2D).

API calls and fields:
- Def: `camera: templates/camera.js#camera` in `world.config.yaml`. Rig: `scripts/camera.js`.
- Rig hooks: `onInput(ctx, input)` (no fixed rate); `update(ctx, dt)` (once per tick, 120/s while it poses its target).
- `ctx.self` is the rig: `.state.*`, `.target` (hull while driven: `.feetPosition`, `.rotation` in degrees), `.view.yaw/.pitch` (radians, +pitch looks UP, undefined before frame 1), `.feetPosition`, `.rotation = { yaw, pitch, roll }` in degrees | a quaternion | `{ lookAt: p, include: ["yaw", "pitch"] }`, `.hideLocalPlayer`, `.pointerLock`, `.fov`, `.clip`, `.orientation` (`= undefined` clears), `.frame`, `.parent`.
- `ctx.world.camera.aspect` (width ÷ height, live), `.insetRight`, `.fov`, `state.orthoSize`.
- `ctx.player.faded = { [id]: 0.35 }` (opacity; `{ opacity, fade: 0 }` snaps; `{}` shows all).
- `ctx.place`: the target's.
- `player.camera.pointerLock = false`; `player.camera = {…}` (whole camera); `player.camera = null` (hard cut).
- `ctx.world.camera` swaps durably for everyone.
- Orientation: `orientation = { source: "look" }` / `{ source: "script" }`; `authoredAxes: ["yaw", "pitch"]` for a cutscene hold.
- Look orbit state: `state.heightOffset` (1.8), `state.lateralOffset` (0), `state.desiredDist` (6), `state.collisionDist`, `state.lookOffsetY` (1.5).
- `raycast` from "builtin/physics", `minSize: 1`.
- Axes: `input.axes.lookX/lookY`, 0.0006 rad per pixel (×1.75 during a drag). `zoomIn: { mouse: wheelY }` under `inputs.axes`; `distance -= zoomIn × sens`. Engine axes: `lookX/lookY/aimYawSin/aimYawCos/aimPitchN`. `"a/d"` reads −1/+1.
- Mount: set the layer in the hull's `onControlBegin(ctx, player)`; clear in `onControlEnd`.
- Chase camera: `player.camera = { kind: "custom", behavior: ["scripts/chase-camera.js"], orientation: { source: "look" }, pointerLock: true }`; `onControlEnd: player.camera = null`. Constants `DIST = 7, HEIGHT = 3.7, AIM = 1.4, HEADING_RATE = 5, RECENTER = 1.5, REST = 0.35`.
- Iso: `{ source: "script" }`, `pointerLock: false`, `projection: "orthographic"`, yaw 0.785, pitch 0.615, distance 2 × orthoSize, pivot +1.5.
- Top-down 3D: `rotation = { yaw: 0, pitch: -90 }`, height 15, follow 8/s.
- Pixel-art 3D: orthographic, `rotation = { yaw: 0, pitch: -45 }`, `state.orthoSqueeze = Math.SQRT1_2`, `perfectPixelArt`.
- 2D: `mode: 2d-top | 2d-side`, orthographic, `pixelSnap: true`, camera z only clips.
- First person: eye at feet + `1.6k` (k = `2×ctx.player.bounds.obb.halfExtents.y/1.8`), `hideLocalPlayer = true` per tick.
- Seat in a moving car: `ctx.self.parent = ctx.self.frame = carId`, `feetPosition` = eye in its metres, no rotation.
- Samples: `templates/camera.js`: `export const camera = { behavior: ["scripts/camera.js"], kind: "custom", orientation: { source: "look" }, sensitivity: 3, state: { pitch: 0, yaw: 0 } }`. `2d-side` def: `{"behavior":["scripts/camera.js"],"kind":"custom","orientation":{"source":"script"},"pixelSnap":true,"pointerLock":false,"state":{"orthoSize":5.625}}`. 2d-top the same with orthoSize 12.
- `scripts/lib/data/player.yml`: acceleration 80, deceleration 120, jumpSpeed 10, turnInPlace 90, turnSmoothing 0.06, turnSpeed 900, turnTo movement, walkSpeed 6.
- `world.config.yaml` inputs: `actions: jump: { keys: [space] }`; `axes: moveX: { keys: a/d }, moveZ: { keys: s/w }`.

Placement and file rules:
- Rig at `scripts/camera.js`; first-person eye reads `./lib/data/camera.yml` (eyeHeight 1.6).
- Toggled modes (chase/hood/cockpit) are ONE script with `state.mode`; never a script swap, never `state = {…}` (it wipes yaw/pitch).
- A 2d-top camera.yml holds orthoSize 12, minOrthoSize 5, maxOrthoSize 30, follow 8.

Test or verify steps: none stated in the doc.

Gotchas:
- A write to `state.yaw` or `.pitch` turns the look by its offset from `view`; the mouse keeps turning it. A rig reading `lookX`/`lookY` sees its write exactly.
- Never use `{ source: "script" }` + `pointerLock: false` on a driven hull: boarding frees the cursor and kills the look.
- Leave `state.collisionDist` unwritten unless you own the cast. Arm ≤ half the narrowest space walked.
- Query rows and `target.state` land at tick rate: smooth them (5–12/s) before using them for the eye.
- Script mode mouse sensitivity: `sensitivity` is the rig's alone; scale by `sens`; <1 is broken, 1.5–2 deliberate.
- Iso: distance nearer than 2 × orthoSize clips the foreground.

## fx
File: /workspace/savi/.spawn/engine/skills/fx.md

What it does: field-based particle and light effects (impacts, beams, explosions, weather, auras) via a program string or file.

API calls and fields:
- `ctx.emit("fx", { position, script: "fx\npop …", params: { normal } })`.
- File form: `scripts/effects/x.fx.js`: `import { fx, pop, … } from "builtin/fx"; export function effect(ctx) { …; return fx(a, b); }`. Params in `ctx.params` (a NaN in a number slot is refused). A file exporting the program string draws nothing.
- Object: `fx: { script, params }` plays at its feet and follows it.
- Verbs: `pop <name> …` with keys `n`, `at`, `on`, `rate`, `life`, `v`, `size`, `acc`, `col`, `sz`, `a`, `rot`, `r`, `burst`, `count`, `space`, `inh`, `stretch`, `align`, `floor`, `glo`.
- Shapes for `on=`/`at=`: `disc(r)`, `sphere(r)`, `box(hx,hy,hz)`, `arc()`, `line(len,ax,ay,az)`, `point()`, `path(js{pts})`.
- Sprite: `sprite(tex, blend, align, stretch s, soft[, lit=true, axis=<0,1,0>, repeat=6;1, glow=.1, filter=pixel, depthTest=false, sortingLayer=75, sortingOrder=2])`.
- Textures: `soft-disc smoke-puff ember mote flame-wisp leaf droplet snowflake petal stalk chip grain splinter shard`.
- Light: `r=light(<1,.55,.24>,$glo*30,12)`.
- Mesh: `mesh({ shape: "card", blend: "add", material })`; `mesh({ script: "scripts/blade.js" })`.
- Ribbon: `ribbon()` with `pos:`/`vel:`; `ribbon facing=camera|ground|<0,1,0>`.
- Jagged strike: about 15 midpoint points fed to `path()` with `align: "segment"`; SVG path data (`{ plane: "xz", size }`) or `entity(id)`.
- Builtins: `cone(deg) sdir() blast(s) ci() up(s) grav() buoy(k) drag(k) radial(s) attract(k) vortex(k) force(f) hdr(r,g,b) spin(rps) curl(f) noise(x) flick(hz,amt) fire() env(...) time() floorh() wind() entity(id) parent(name) field(js{…}) orbit(...) seek(target,speed) along(js{pts},t)`.
- Tier context: `ctx.quality`, `ctx.device`, `ctx.device.hold` (0..1), `ctx.device.quality`.
- Material hook: `material(ctx)` file over `ctx.fx` (uvAlong, uvAcross, viewDir, normal, color, alpha, `params.<name>`, `scene(offset)`, `texture(uv)`).
- Starter example: a `pop straw` burst of 18–30 with `life=.8..1.5`, `v=<%normal|0,1,0>*(2.5..5*%power|1)+sdir()*(.6..1.6)`, `r=sprite(stalk,alpha,velocity,.02)`.

Placement and file rules:
- Effect programs go inline in the emit string, or in `scripts/effects/<name>.fx.js` for real code or reuse.
- Pass `params` through the emit or the file's `ctx.params`.

Test or verify steps: none stated in the doc.

Gotchas:
- `stretch` is seconds of travel. 0.02 on a stalk or chip; 0.1 reads as a hay blade.
- On `align=axis` the slot is metres.
- Debris is a hard-edged card (5–12 cm, `alpha`), never a soft dot stretched. Sparks and embers are streaks (`ember`, `add`, ≤ 0.03).
- `hdr(5,3,1)` through `alpha` clips to white. Smoke with `add` never darkens.
- `rate` reads emitter values; `cone() sdir() blast()` roll once at birth; `acc` and bindings run every tick. Coupling reads the previous tick.
- `count: N` holds until destroyed; `burst` with a life ends. A moving emitter leaves particles behind: use `inheritVelocity` for trails, `space: "local"` or `attachTo: <id>` for auras.
- Weather: `fx follow=player` with `n=` and `wrap=` on a `box()` slab; `n` is the only density knob.
- Some features pull effects onto the CPU: timed ribbons (`lifetime`), ground ribbons, ribbons with several `textures`, `path(entity(id))`, `parent()`, `light({ perParticle })`. Dense sprite mass is its own effect. Tens of thousands alive is working scale.
- Tier branches are render-only: counts, sizes, rates, never lifetimes or windows.
- `distort` sprites shift what stands behind; under .002 nothing paints.
- `//` starts a comment in the grammar.

## game-ui
File: /workspace/savi/.spawn/engine/skills/game-ui.md

What it does: HUD, menus, world signs and panels in ui.js; the engine's pixel-face theme; the right-rail reservation.

API calls and fields:
- `export default function (ctx, player)` in ui.js returns an HTML string; called whenever what it reads moves, ≤30/s. Named exports are page globals for onclick.
- `player.controlling?.state ?? player.state`; `ctx.world.inputs.axes?.moveX?.label`.
- `sendAction(name, payload, { down, relockPointer })`; `sendAxis(name, value)` into `input.axes.<name>`.
- `ctx.emit("haptic", { kind: "light" })`.
- `openLink(url)` (discord.gg or spawn.co only, ≤3/min).
- `onMount(container, player)` / `onDestroy(container)`; container = `#tome-game-mount`.
- `audio.context`, `audio.bus("UI" | "SFX" | "Music")`, `audio.buffer(ref)`.
- `window.spawn.assets.upload({ blob, name }): { url }`; error codes `guest_not_allowed`, `rate_limited` (`e.retryAfterSeconds`).
- `window.spawn.user.upgradeGuest()`.
- `window.spawn.view.captureFrame({ type, quality, maxSize, camera? }): Blob`; code `capture_unavailable`.
- `navigator.mediaDevices.getDisplayMedia({ audio: true })`.
- `window.spawn.chat.sharePicture({ blob, scope }): { url, width, height }`.
- `window.spawn.on("event", (name, payload) => …)` in onMount; `ctx.emit("uiEvent", { name, payload })`.
- `data-interactive` marks a custom element clickable.
- `spawn-canvas` element: the game's viewport.
- `ctx.worldToScreen(position): { x, y, depth, onScreen } | null`.
- `ctx.world.engine.ui.referenceHeight` (1080).
- `ctx.self.inputHeld: boolean`.
- `navigator.getGamepads()`, `navigator.languages`.
- CSS vars: `--spawn-chrome-reservation-right-inset` (default 50px), `--spawn-chrome-reservation-right-top`, `--spawn-chrome-reservation-right-height`, `--spawn-safe-area-top|right|bottom|left` (0px), `--spawn-touch-corner-band-height` (0px).
- `data-world-anchor="<id>"` and `data-anchor-offset="x y z"` for a plate that follows a thing; `--anchor-depth` for fade.
- `data-modal` for a surface that owns the screen.
- Font: `engine.ui.theme.font` in world.config.yaml: Jersey 10 or Geist Pixel Square (Grid/Circle/Triangle/Line); or an uploaded .woff2 named in `@font-face`.
- Theme classes: `.plate`, `.lbl`, `.num`; keyframes `kick`, `fade`.
- Words on a thing: `<div face="front" width="1.6m" style="font-size:140px">`. Panels: floating plate with no background and a margin. Screen the ui draws: `material.canvas`.
- Icons: `spawn paint "<what>" --size 1024x1024`; or inline `<svg>` with `<symbol>` and `<use>`; or `<img src="scripts/tex-icons.js?slot=heart">`.
- `html { cursor: none }`; `url(…), auto`.
- Hotbar: `mouse: "wheelUp"` / `"wheelDown"` actions.
- Pause: `ctx.place.timeScale`.

Placement and file rules:
- The rail is Spawn's: never hide, move, or cover it. Keep right-edge plates clear with `right: calc(var(--spawn-chrome-reservation-right-inset, 50px) + 24px)` across its rows; `right: 24px` above and below.
- Opened panels across the rail rows: `max-width: calc(100vw - 2 * (var(--spawn-chrome-reservation-right-inset, 50px) + 24px))`.
- Tables only some players need are `import()`ed where first needed.
- Secret cards: owner rows under their player (platform-systems).
- Sound never lives in HTML, nor its settings but one mute.
- Control words are labels (`turn`), never keys as text.

Test or verify steps: none stated in the doc.

Gotchas:
- A game must not build click-to-start, tap-for-sound gate, mic button, nickname, or login; only a sign-in button on `player.isGuest`, if asked.
- Escape frees a locked cursor and closes Spawn's chat, so the game must not open anything on Escape or `pointerLockLost`.
- Do not add or remove a start screen unasked (`ui.startScreen`).
- Nodes match by `id`; a changed inline `animation` replays it. Loops should only move opacity or a transform; `stroke-dashoffset` repaints every frame.
- A render throw blanks the HUD until one succeeds.
- `.plate` never sets `position` or `display` (authored rules beat utilities).
- Invisible elements still catch clicks; use `visibility:hidden` on panel-less backdrops.
- `system-ui` throws away the face.
- Microphone, camera, SpeechRecognition, geolocation share the platform's ask; never gate on `track.muted`.
- A plate fitting a 390 px phone: side by side they `flex-wrap`.

## geometry
File: /workspace/savi/.spawn/engine/skills/geometry.md

What it does: building 3D meshes (buildings, creatures, characters, vehicles) through `geometry(ctx)` and `collider(ctx)`.

API calls and fields:
- `ctx.lod` (1 finest through 5 one closed hull).
- `ctx.place.players`, `terrain: kind: "off"`.
- `ctx.groundY`, `ctx.groundNormal` (per post).
- `ctx.albedo("cdn/texture-limewash-plaster.png")` and `ctx.albedo(null)`.
- `ctx.color` (linear value; L 0.6 ≈ ×0.2).
- `ctx.bone(name)`, `skeleton()`, `jiggle.bones`, skin `{ joints, weights }`.
- `ctx.instances` (instance set).
- `forward: "+z"` in the `primitive`.
- `pitch` (positive tips the nose up).
- `ctx.view.pixel` (for level handover distance).
- `flatten` mark, `road` mark with `spline`, `scripted` `snapToTerrain` spline with `profile()`.
- `kinematic` or `dynamic` object carries `ctx.self.joints`.
- CDN model: `cdn/model-red-fox.glb`.
- Returns and full ctx: `spawn api GeometryContext`.

Placement and file rules:
- Frame: −Z forward, +Y up, origin where it attaches.
- Scale: body is a 1.9 × 0.7 m capsule, eye 1.6; doors 1.1–1.3 × 2.2–2.4 m; ceilings 2.7–3.5; rooms ≥ 4 m; stairs 0.18 rise / 0.28 tread.
- One `light` per room (torch or hearth 20–40).
- Floor first, under `ctx.place.players`, before `terrain: kind: "off"`.
- Script + params + seed = ONE mesh, shared by all naming it.
- Crowd (fish, birds, leaves): ONE instanced mesh swayed by its `scripted` material's `positionNode`.

Test or verify steps: none stated in the doc.

Gotchas:
- `collider(ctx)` is only the shell a body touches. Props meet a sheet from above either way, from below only on its CCW side. Walkers from either side.
- Opaque faces draw both sides; never a second copy facing back.
- `ctx.color` over a texture tints by linear value: tint at L 0.9+ and darken with lights.
- A model talks by its jaw or mouth key; never add a mouth.
- Ground is prepared, never floated over.
- A tunnel is your tube round the camera.

## heightmap-terrain
File: /workspace/savi/.spawn/engine/skills/heightmap-terrain.md

What it does: heightmap landforms, water, materials, decoration and field paint.

API calls and fields:
- `heightAt(ctx)` and `materialAt(ctx)` in `scripts/terrain.js`. `ctx` includes `x, z, noise, seedOffset`; `materialAt` adds `worldHeight, slope, height01, normal`.
- `noise.fbm2({ x, z, frequency, octaves, seed })`; `seedOffset(n)`. Set frequency (default 1 cycle/m). `ridged` and `billowed2` are ≥ 0.
- `import { shore } from "builtin/terrain"`; `shore(height, SEA)`.
- `t = place.terrain`; `t.marks.sea = { kind: "sea", level: 0, floorMaterial: "sand" }`.
- Marks: `sea`, `lake` (at, radius, level, depth, bedMaterial, liquid), `river` (points, width, depth, closed, bedMaterial, liquid), `path` (points, width, material, edgeMaterial, noise, falloff, clearScatter, grade, maxGrade), `road` (points or spline, closed, width, material, edgeMaterial, edgeWidth, falloff, clearScatter), `flatten` (center, height, shape, falloff, falloffCurve, maxGrade, material, edgeMaterial, clearScatter), `clear-scatter` (center, shape), `hole` (points).
- MarkShape: `{ kind: "circle", radius }` | `{ kind: "ellipse", radiusX, radiusZ }` | `{ kind: "rectangle", width, depth, rotation? }`.
- `t.materials.sand = { albedo: "cdn/texture-terrain-sand-realistic-albedo.png", tint: "oklch(0.82 0.06 80)", textureScale: 2 }`. Defaults: `textureScale` 2.5 m per tile.
- Materials options: `id, albedo, pbr, tint, normal, roughness, textureScale, metalness, normalStrength, roughnessIntensity, antiTiling ("none" | "stochastic"), filter ("pixel" | "linear"), macro`.
- Decorations: `t.decorations.layers.<id>` and `bindings.<materialId>: [layerId]`; `t.decorations = null` removes all. Layer: `items`, `material`, `density`, `paint`, `paintedOnly`, `constraints` (slopeRange, heightRange), `noise`, `cluster`. Item kinds: `sprite` and `scripted`. `settings` (maxDistance, fadeDistance, budget, enabled).
- Scatter: `scatter.surface.mesh`; `filter.maxSlope`.
- `t.material = { kind: "scripted", script, params }`.
- `terrain.stroke(field, { center, radius, fn })`; `fn(p, inset, current)` returns the written layer's cell. Hook clears with `current - ctx.readField(field, p.x, p.z)`.
- `delete ctx.place.terrain.runtimeEdits` drops the PLAYER layer.
- Field API: `ctx.getWaterLevelAt(x, z, place?)`; `ctx.readField(name, x, z, place?)`; `ctx.place.fields[name].runtime[chunk]` (chunk `{ cellSize, chunkCells, quant, cells, version }`); `ctx.place.fields[name].authored[chunk]` (creator layer); `ctx.place.fields[name].changes(at)`; `ctx.getTerrainNormal(x, z, place?)`.
- Liquid: `ctx.self.liquid.in`, `ctx.self.liquid.level` (null when dry); `physics.density = 1000` lets velocity.y dive.
- `terrain.water?: LiquidSpec` (the liquid for every dug pond).
- Field names: `"terrain:natural-mask"`, `"terrain:height"`, `"terrain:water"` (metres of water over ground).
- Terrain top-level: `terrain.kind: "heightmap"`, `seed`, `materials`, `generator: "scripts/file.js"`, `verticalRange: { min, max }`, `marks`, `water`, `material`, `decorations`.
- Bulk field read is not a save: dug ground keeps by default.
- Mark kind `sea` reach: `{ shape: "rectangle", … }` or `{ shape: "halfplane", edge, offset }`.

Placement and file rules:
- `heightAt` runs ~17k times per 80 m chunk: a track or river is a mark, never a loop over points.
- `terrain.marks` override the generator.
- Painted `scripts/tex-*.js` ground is drawn ground: only on a creator's ask. A tint alone is flat painted ground: only on a creator's ask.
- Any other material id must be added whole or its weight paints nothing.
- Path posts: one scripted object (see geometry), never a bed, a `ctx.instance` per step along `points` at `ctx.groundY`.
- A graded path: a `path` mark with `grade: true` or a `road` with `spline`; never `materialAt`.
- Nothing grows under a thing on the ground, or on a path or road unless a stroke paints its layer there.
- Ground detail reach depends on the viewer's graphics tier (low, medium, high, ultra). Read `graphics tier:` with `spawn perf --frame` (player-settings skill).

Test or verify steps: the doc names `spawn perf --frame` as the way to read the graphics tier on coarse far ground. No other verify steps stated.

Gotchas:
- Every coast but a cliff passes through `shore(height, SEA)`.
- A `material: { kind: "water" }` plane is a picture: nothing swims.
- A scripted `liquid.material` replaces the whole native look; keep foam, caustics and fresnel as nodes from `spawn api builtin/water`.
- Edits are live for everyone.
- Hook dabs are the player layer, visible to this room; `run_script` that persists, a god-mode brush, or `.authored` write paints the creator layer that publish takes.
- A material's weight adds to natural ground (1 ≈ half the cell); `"terrain:natural-mask"` at 1 lays the paint alone.
- Walking stops past 45° on a graded path.
- Cover ends where its item draws 2 px, within `maxDistance`.

## interactive-objects
File: /workspace/savi/.spawn/engine/skills/interactive-objects.md

What it does: pickups, levers, doors, plates, traps, dialog, held items, and trades.

API calls and fields:
- `world.inputs.actions.interact = { keys: ["e"] }` declares the interact action.
- `input.pressed.interact` in the player's `onInput`; `interactable` query within 3 m; `ctx.emit("press", { by: ctx.self.id }, { to: nearest.id })`.
- `ctx.on("press", …)` in the target's `onSpawn`; `ctx.getObject(by)` gets the presser.
- `ctx.world.inputs.actions.interact.label` (device control word).
- `ears.press = (ctx, { by }) => …` (exported `ears` object).
- `physics: { body: "static", trigger: true }`, `onTriggerEnter/Exit`, `overlapping` map.
- `ctx.place.objects["gate-1"].state.open = true`.
- `playSound` with `position: ctx.self.worldFeetPosition`, `volume`.
- `ctx.emit("impulse", { target: other.id, impulse })`; `hurt` event via `ctx.on`.
- `ctx.after(0.12, "vanish")`.
- `rotation: { pitch: 90 }` for flat coin (`cylinder`).
- `physics: { body: "static", surfaceVelocity: [0, 0, 2] }` for a belt (m/s).
- `player.camera.pointerLock = false` and `player.camera = null` for dialog.
- `spawn({ parent: ctx.self.id, tags: ["carried"], attachment: { bone: "RightHand" } })` for a held item.
- `ctx.trade(mine, { with, for } | null)`; returns `{ offered, id, give, with, for }` or `{ offered: false, refused, message }`. Refusals: `"unknown-target" | "not-held" | "not-mine" | "same-party" | "withdrawn"`. Mark rides `state.__trade`.
- Door: `physics: "kinematic"`, `pivot: [0, 0.5, 0.5]`, `tags ["door", "interactable"]`, `state { open: false, yaw: 0 }`. Ease yaw at 300 °/s toward 100 (open) / 0 (shut).
- `data-world-anchor="<id>"` for a prompt that follows the thing.

Placement and file rules:
- Five shapes: proximity query in `update()`; `press` ear; trigger volume; state write on another handle; animated kinematic motion.
- Plate = two entities: invisible trigger (~1.5 m tall) over the visible plate.
- Author doors closed, facing the doorway, `yaw: 0`. Open state lives on the door's own row: one door for every player.
- The prompt is the game's HUD (see game-ui); the engine draws none.
- A shop sells through its own `ui` plate, `<button id="buy-sword">` rings `ctx.on("ui:buy-sword", (ctx, { by }) => …)`.
- Held item is read back as that row, never player state.

Test or verify steps: none stated in the doc.

Gotchas:
- `pivot` is ignored on dynamic bodies; a swinging door is `kinematic`.
- A kinematic door moves AND blocks; the collider rides the leaf.
- Write `rotation` yourself, eased in `update()`.
- A coin is invisible edge-on without `rotation: { pitch: 90 }`.
- A room change re-creates held-item bodies.
- Trade: both sides must call `ctx.trade`; both marks standing changes both hands in one tick; never a lock, timer, or escrow object.
- Dialog: `update()` ends it when they walk off.

## jev
File: /workspace/savi/.spawn/engine/skills/jev.md

What it does: `jev:decide` gives a mind (boss, NPC, crowd, puzzle) a probability-based decision in about half a second.

API calls and fields:
- `ctx.job("jev:decide", { state, questions }, "decided")`.
- `ctx.place.players`, `ctx.now()`, `ctx.random()`.
- Question types: `boolean` returns `{ type, probability }`; `choice` returns `{ type, choice, probabilities: { option: p } }` with `criteria` keys as options; `score` returns `{ type, score, probabilities }` with `criteria` as ordered steps.
- Response: `r.ok`, `r.data.answers.<name>`, `r.error.code` on failure.
- Callback export: `decided(ctx, r, payload)` (named export); a `(r) => …` callback lives only as long as its hook.
- `media` for pictures, as in `llm:chat`.

Placement and file rules:
- Ask once per decision on the mind's own clock (`nextAt`), never per tick; none while `ctx.place.players` is empty.
- Memory is the mind's state (`state.recent`).

Test or verify steps: none stated in the doc.

Gotchas:
- Sample with `ctx.random()` against the probabilities; never take the top answer (argmax makes clones).
- A failed ask is `r.ok: false`; keep the last plan and ask next cycle.
- Metered to the world like `llm:chat`; a 768 px picture is four plain asks, the largest fifteen.
- Facts must be small and typed.

## leaf-sprays
File: /workspace/savi/.spawn/engine/skills/leaf-sprays.md

What it does: leaf textures for bushes, hedges, ivy and tree crowns, drawn by a texture script.

API calls and fields:
- `spawn api TextureScript`; `scripts/tex-leaves.js?kind=needle`.
- `export const meta = { filter: "linear", wrap: "clamp" }` (the doc says "exports `meta`").
- Object material: `material: { alphaTest: 0.5 }`.
- Canvas is 512 px square.
- Count check: `getImageData`; under 0.4 of pixels with alpha over 128 means draw more shoots.
- `ctx.color` on the card multiplies; keep near white.

Placement and file rules:
- Card size: about 2 m across on a tree, 1 m on a bush. A pixel is 4 or 2 mm. Species leaf 6–15 cm = 15–40 px (tree) or 30–75 px (bush).
- Crown: many cards crossing its volume, mixed sizes and tilts; dark cards in the heart.
- Bush: cluster of cards round a low oval. Hedge: same along a long box. Ivy: lies flat on the wall.
- Lowest boughs stay above a walker's head where paths go under a tree.

Test or verify steps: the getImageData count check (under 0.4 of pixels with alpha over 128 means draw more).

Gotchas:
- Leaves stop short of the card edge; a cut leaf draws a straight line.
- Leaves pack toward the upper corners; a sparse spray vanishes far off.
- Needle cards are their own picture, never counted; draw under sprigs first and darker.

## mobile-controls
File: /workspace/savi/.spawn/engine/skills/mobile-controls.md

What it does: touch controls: an auto draft projected from inputs, or authored surfaces in `inputs.touch`.

API calls and fields:
- `inputs.touch.surfaces.<name>` (complete document; `default` is active when no selector picks).
- Surface fields: `orientation` ("landscape" | "portrait" | "any"), `sticks` (≤ 2; `x`, `y`, `zone`, `anchor` "floating" | "fixed", `position`, `visibility` "fade" | "always", `quantize` 4 | 8), `buttons` (`action` or `axis`, `drag: { x, y }`, `label`, `icon`, `zone`, `slot` 1–4, `size` "primary" | "secondary", `role` "confirm" | "cancel"), `pads` (`x`, `y`, `mode` "absolute" | "relative", `zone`, `label`), `gestures` (`tap`, `double-tap`, `hold`, `press`), `look`, `pinch`, `symmetric`.
- `inputs.touch.style: css`; `inputs.touch.active: scripts/controls.js` (default export `(ctx) => name` or `{ surface, labels }`); `inputs.touch.enabled: false` (kill switch).
- `inputs.actions.<name>.touch: { button, label, slot, gesture }`; `inputs.actions.<name>.active: script`.
- `ctx.resolveControls(name?): { surface, diagnostics }`.
- `ctx.world.inputs.touch = { surfaces: { default: { ...draft, sticks: [] } } }` (in run_script).
- `input.actionData?.fire` on release: `{ x, y, magnitude }`.
- `input.axes.touchActive: 1 | 0`; `input.axes.touchTwist` (radians).
- `sendAction("sprint", undefined, { down: true })` / `{ down: false }`.
- `?touch=1` on the game URL for a desktop preview.
- Place override: `ctx.world.places.<p>.inputs.touch`.
- Draft contract: stick projects only from axes named `moveX`/`moveZ` (`moveY` in 2D). Cap of 4 chips; ranking authored slot → common verb names (jump first) → declaration order.

Placement and file rules:
- Authored surfaces live in `world.config.yaml` under `inputs.touch`; the selector is a script file (example `scripts/controls.js`).
- Per-mode controls use the selector, not a spec edit.
- Style: `[data-part="button"]`, `[data-pressed]`, `[data-part="stick"]`, `[data-part="thumb"]`.

Test or verify steps: `?touch=1` on the game URL, with `target` "player" and `device` "phone" for the phone frame.

Gotchas:
- Never hand-roll a DOM stick or a chip the surface offers; a chip size or layout the surface does not offer is your own HTML control, driven by sendAction.
- Rename moveX/moveZ and the stick vanishes.
- Verbs past the cap drop, loudly (logged per phone on the draft).
- The engine never merges surfaces; declaring one replaces the draft whole.
- An unusable document parks players to the draft.
- Over 4 selector swaps a second are suppressed.
- `pinch` is `zoomIn`; drag-look needs lookX/lookY bound.

## physics
File: /workspace/savi/.spawn/engine/skills/physics.md

What it does: joints for limbs built from parts (a ball-and-socket limb with limits).

API calls and fields:
- `ctx.self.joints.shoulder = { to: "torso", type: "spherical", anchor, targetAnchor, axis, limits: { cone, twist: [min, max] } }`.
- `.limits = {}` forgets the limit; `limp` is `{ cone: Math.PI }`.
- `.target = { x, y, z, w }` turns it from its first-target pose; `.strength` 0..1.
- `ctx.self.ragdoll` for a rigged model ragdolls whole (see uploaded-models).

Placement and file rules:
- Build the limb mid-range, then mint with its limits; the pose at first limits is cone 0, twist 0, kept through `.limits` retunes and re-runs.
- In a chain each link joins the link above, which stands first.
- `axis` is the limb's line in this body's frame. A half left out of limits is free (`{ cone: 0 }` only spins; `twist: [0, 1]` turns one way).
- Radians throughout.

Test or verify steps: none stated in the doc.

Gotchas:
- Stops are soft: hits press a twist past its edge, the harder the further, then it settles inside.
- Twist sign: `to` turns right-handed about axis, seen from this body; the limb's own right-handed turn counts down.

---

Coverage note: all 12 files were read in full (2d-mode, buyables, cameras, fx, game-ui, geometry, heightmap-terrain, interactive-objects, jev, leaf-sprays, mobile-controls, physics). Several referenced docs were not in scope and were not read: player-settings, pointer-raycasting, trees, uploaded-models, platform-systems, `spawn api GeometryContext`, `spawn api TextureScript`, `spawn api TerrainHeightmapDef`, `spawn api builtin/water`.
