# Engine skills, part B (last 11 of 23, alphabetical), plus skills.md and README.md

Source: /workspace/savi/.spawn/engine/skills/*.md, read whole. Engine 6.0.0. Nothing here is from kernel source; the engine clone holds docs only.

Skills covered: platform-systems, player-settings, pointer-raycasting, portals, projectiles, rooms-and-matchmaking, spawn-engine, trees, uploaded-models, vehicles, voxel-terrain.

Note on "test or verify steps": none of the 11 files gives a test or verify procedure, except spawn-engine (which points at the Spawn client's `--help`, play controls and script logs). Where a file gives a check, it is listed under the skill.

---

## platform-systems
File: skills/platform-systems.md (hook: cheat-proof saves, SQL boards, timers, LLM jobs, notify players, player names)

What it does: durable player state, SQL tables for cross-player data, crons, LLM and text-check jobs, DMs, outside web calls, player names.

API calls and rules:
- `player.state` persists on rejoin over the template. Seed once with `player.state.run ??= {...}`. Never `= ...` on spawn (throws the save away). Reset with `player.state = {}` (`ctx.self.state = {}` in own behavior; `ctx.world.players` row from sim.js or run_script).
- One tick's writes (no await between) save as one piece.
- `ctx.sql` tagged template: `ctx.sql\`...\`` returns `{ rows, changes, lastInsertRowid }`. Binds with `${v}`. `@caller` binds the acting player.
- `scripts/db.js`: `export async function migrate(sql)`. Idempotent DDL; a throw does not block play; re-runs at next spec version.
- Dev and live are two databases. Schema carries to live on first call, rows do not; seed live with `INSERT ... ON CONFLICT DO NOTHING` in migrate().
- SQL budgets: ≤ 100 parameters per statement; ≤ 5 SELECTs joined by UNION / UNION ALL / INTERSECT / EXCEPT.
- Leaderboard board: each player's number in `player.state`, named under world.config.yaml `leaderboards` (`spawn api LeaderboardDef`).
- `platformState: ["gold", "inventory"]` on the player template makes keys cheat-proof where players meet.
- `simulatedBy: "platform"` on a row runs on Spawn's machine. `= null` undials. A moved row's finished onSpawn writes are not repeated; `ctx.self.session` starts with what onSpawn left. Keep no module state.
- `visibility: "owner"` on a row under a player (`spawn({ parent: player.id, visibility: "owner", ... })`) reaches only that player. `visibility: "platform"` reaches no player. Owner's HUD reads via `ctx.getObject(id)`, null elsewhere.
- Crons: `engine.crons: [{ schedule: "*/5 * * * *", script: "crons/respawn.js" }]` in world.config.yaml; file exports `async function cron(ctx)`. A minute is the finest step. One-shot is `ctx.after`.
- LLM: `ctx.job("llm:chat", { conversationId, system, message, media, maxHistory (20), model: "fast" | "smart" | OpenRouter id }, (r) => ...)`, reads `r.data.text`. Fourth arg `{ onPart: (p) => ... }` streams (`p.text`, `p.first`). `"llm:generate"` with `schema` returns `r.data.object`. `"llm:clear"` forgets. `r` is `{ ok, data, error: { message, code, retryAfterMs } }`, never thrown.
- `conversationId` is the memory, e.g. `"npc:" + npcId + ":" + playerId`.
- `ctx.job("text:check", { text }, (r) => ...)`: `r.data.ok` false means show own words. Posts nothing. `chat:send` is not a checker.
- Outside web: `fetch(url, { method: "POST", body })` inside a job's `run` (`jobs/<id>.js`). http/https, no private hosts. Pictures POSTed to `"/cdn/"` with content-type store once. Feeds use `new WebSocket(url)` in `async function* run`. Behaviors and sim.js on Spawn's machine reach no outside address.
- `ctx.job("player:token", {}, (r) => ...)` returns `r.data.token`, a signed JWT (`sub` = `player.userId`), verified at `https://www.spawn.co/api/.well-known/jwks.json`.
- Player names of players who left: `"player:names"` from owner's body (`spawn api job`).
- `ctx.notifyDm(message, { to: player, link: "+garden" })`. `to` is a player row or userId. Line max 1,000 characters. Max 5 a UTC day per world; grouped and held through their night; `notifyDmOnce` takes `{ to }` too. Lines not sent say why in getLogs.

Gotchas:
- SQL runs at events, never per tick. A hook's call publishes with the save; one the save lacks answers `statement_not_published`.
- `onLeave` save may run on Spawn's machine if the tab dies; alone with no Spawn machine there, nobody runs it. Keep `onLeave` one fast call.
- `ctx.sql` calls queue one at a time; never time out, resend or read back. A call from a player's machine is a round trip: batch lists into one call.
- `@caller` errors `statement_not_player_invocable` where unbound (run_script, db.js, multiplayer cron/place hook: bind `${playerId}`).
- Money: `WHERE coins >= ${amount} AND ${amount} > 0`, credit gated on debit's `changes`.
- History grows without end: boards and totals read a running summary.

## player-settings
File: skills/player-settings.md (hook: creator policy: enable protections, lock controls)

What it does: creator policy over player settings (defaults and caps). Players own their settings; policy only shapes starting experience and bounds design.

API calls:
- `ctx.emit("openSettings", { page: "keys" })` opens a settings page; `"openAvatarEditor"` opens avatar editor. Emitted on player's press via ctx.self.
- run_script writes (saved via world.config.yaml `engine.playerSettings`):
  - `ctx.world.engine.playerSettings.defaults.accessibility.reduceFlashing = true`
  - `ctx.world.engine.playerSettings.caps.controls.lookSensitivity = false`
  - `... = null` removes the lock.
- `engine.playerSettings.defaults.accessibility: { reduceFlashing, reduceMotion }`: true only. false answers an error: may only be true.
- `engine.playerSettings.caps.accessibility`: never legal.
- `engine.playerSettings.caps.controls: { lookSensitivity, invertY }`: booleans, both honored by default.
- Not creator surfaces: `defaults.sound`, `defaults.controls`, `defaults.perf`, `caps.perf`.

Rules:
- `defaults` apply only to players who never chose. `caps` bound only families where creator holds design authority, never graphics quality.
- Refused field is dropped with a warning in run result and getLogs; legal keys beside it still apply.
- Patch only changed keys; null clears one.
- Quality is never pinned; a slow game is made cheaper in content.

Gotchas:
- A default "not applying" means the player already chose; nothing to fix.
- Accessibility is safe-direction only, by law; nothing can force flashing.

## pointer-raycasting
File: skills/pointer-raycasting.md (hook: click placement, cursor aim, touch tap/hold/press)

What it does: one `onInput` handles mouse and touch; ray from cursor or gesture point; placement ghost; click-to-interact; shooting.

Config and code:
- world.config.yaml: `inputs.actions: place: { mouse: "left", touch: { gesture: "tap" } }, cancel: { mouse: "right", touch: { gesture: "hold" } }`.
- `import { raycast, getInputRay } from "builtin/physics";`
- `getInputRay(ctx, input): { origin, direction, source } | null` (null = no camera).
- `raycast(ctx, origin, direction, { distance, bodies: "static", ignoreEntities, ... })`. `bodies` unnamed = `"all"`.
- `raycast(ctx, o, d, { multiple: true }): hit[]` sorted by distance; ignoreSelf true by default.
- `raycast(ctx, o, d, { verdict: true }): { hit, hits, verdict: { queryable, terrain, ... } }`.
- Touch gestures: `touch.gesture: "tap" | "double-tap" | "hold" | "press"`; `touch: { gesture, button: true }` keeps a chip.
- `ctx.emit("press", { by: ctx.self.id }, { to: hit.id })` for click-to-interact.
- `overlapPoint` / `overlapSegment: { objects, approximate, terrain }`.
- `ctx.spawn({ tags, audience: "local", primitive, material, feetPosition })` for ghost.
- `hit.normal`, `hit.position`, `hit.id`.

Rules:
- `source "pointer"`: pointer ray this client sampled. `source "camera"`: no pointer ray (run_script, non-onInput hook): camera's forward ray.
- Locked pointer (`pointerLock: true`): screen-center crosshair on all devices.
- Sprites are hit by default; text never. `physicsOnly: true` = colliders only.
- Rays see every solid body on the simulating machine.
- `raycastRender` is this client's picture only; gameplay verdicts use `raycast(ctx, ...)`.
- Drag past 8 px is camera, not gesture. Hold = 350 ms press-and-still.
- Shoot-from-player-toward-cursor: two casts (cursor ray to world target, then cast from shoulder, about 1.2 m above feetPosition).
- Click-to-move: state.goal = hit.position, walk via `findPath`.

Gotchas:
- Orthographic camera: composing ray from camera position plus cursor direction breaks; use getInputRay.
- Ghost uses `bodies: "static"` and `ignoreEntities` for itself.
- `mouse: "right"` alone is a chip on phone with no aim point; add a gesture. Never `inputs.touch.enabled: false` (kills gestures, stick, drag-look).
- Mesh collider of a static model is a surface; overlap point inside it answers nothing. Use overlap at changes, not per tick.
- `touch` tap/double-tap: with double-tap bound, single tap lands after 300 ms.

Verify: none stated.

## portals
File: skills/portals.md (hook: door to another place or world; mirror, monitor, minimap). Group: world-building.

What it does: gates/doors between places and worlds, live views (glass, mirror, camera monitor, minimap), carry rules, returns.

Spawn config and script:
- Spawn `{ id: "gate-east", tags: ["portal"], behavior: "scripts/gate.js", state: { link: "+cellar#gate-west" }, rotation: 90, primitive: { kind: "arch", width, height, depth }, physics: { body: "static", trigger: true }, material: { kind: "scripted", script: "engine/portal-ember", view: { link, spill, sound } }, children: [{ id: "arch", primitive: { kind: "archway", width, height, depth, thickness }, physics: "static", material: {...} }] }`.
- Hooks: `onTriggerEnter(ctx, other)` calling `ctx.cross(other, ctx.self.state.link)`; `onCross(ctx, other)`; `onRefuse(ctx, other, verdict)` (verdict.message).
- `ctx.emit("uiEvent", { name: "refused", payload: { message } })`.
- Links: `"+cellar#gate-west"`, `"@ress/cathedral +main"`, `"world:" + ...`, `player.den`.
- Material view: `material.view: { link, spill, sound, oneWay }`; `view: null` leaves plain face. Presets `script: "engine/portal-<name>"`: glass, water, ember, ink, veil, mirror-break, pixel, stained-glass, static, starfield, aurora, honeycomb, oil-slick. `params: { warp: 1 }` restores whole-glass look. `ctx.view(offset)` for no-preset doors.
- Cameras: `material: { color: "#0b0e12", view: { camera: "mirror" } }`; `view: { camera: { eye, aim, fov, projection: "orthographic", orthoSize } }`; `camera: { parent: id, eye, aim, fov }`. `layers`: `["default"]`, icons `["icons"]`, roofs `["roofs"]`, ghost `["ghost"]`. `hideLocalPlayer`. `place: "<id>"` films that place. `ctx.view.camera` takes both, never `place`.
- Exit: `#exit` written on both gates. A link naming only place steps out of the far gate with the matching link; else arrival or spawn.
- `spawn browse --creator <handle>` or `spawn browse "<words>"` finds worlds; `gate.destination.onlineCount` (null until known).
- Per-player door: script spawns with `audience: "local"` and `link: player.den`.
- Carry: `returnDoor` on arrival place `{ lifetime }` (30 s default) or `false`. `policy.admits` on arrival place, else root, else `world.config.yaml` `visitorsCarry: true` (default off). `ctx.crossing.actor.attachment`: `"attached" | "ridden" | "loose"`. Refused items in `player.pocket` (`ctx.self.pocket`, read-only `[{ objectId, kind, reason, from }]`).
- Foreign faculties: `world.config.yaml` `foreign: { faculties: [...] }`; or top-level `export const faculties = ["write:self"]` in the behavior.
- Identity: `ctx.self.objectId` = `world:<birth>#<name>`; `player/...` session id.
- Hit through door: `emit("hit", { damage, by }, { to: hit.address, via: hit.doors[0].id })`; `hit.door: { link, verdict: "unheld" | "through-spent" | "no-exit", message }`; `meta.origin = { world, actor, script, door, exit, address }`.

Gotchas:
- Latch: a player who turns around walks straight back until they step clear.
- Physics entity crossing a door has a round trip hiding it for a moment: wrong for a bullet.
- Player state: far world's save wins for keys it holds.
- Pairs of gates must be sized alike and face the approach side (gate faces -Z at rotation 0).
- Abroad, scripts turn the body and held items; aim uses look.

Verify: none stated.

## projectiles
File: skills/projectiles.md (hook: gun, arrows, fireballs, cannons)

What it does: first-person gun viewmodel, hitscan, solved arcs, projectile entities, tracers, hits through doors.

Code (scripts/player-gun.js, yours to write; uses your `./lib/combat.js` `damage(ctx, id, amount, { source })`):
- `import { getInputRay, raycast } from "builtin/physics";`
- `onSpawn(ctx)`: `ctx.spawn({ audience: "local", scope: "session", feetPosition: { attach: "camera", x, y, depth, fov: 55 }, primitive: { kind: "scripted", script: "scripts/gen/rifle.js", sockets: { muzzle: [0, 0.07, -0.62] } } })`. `ctx.getObject(id)`.
- `onInput(ctx, input)`: `input.axes` (aimYawSin, aimYawCos, aimPitchN), `input.held.fire`, `input.pressed`, `ctx.now()`, `ctx.getObjectSocket(gunId, "muzzle")` returns `{ position, direction }`.
- `ctx.emit("fx", { position, attachTo, script, params: { dir } })`.
- `ctx.emit("cameraPunch", { direction, intensity }, { audience: { player: ctx.self.id } })`.
- `ctx.emit("playSound", { clip, position, pitch, volume })`.
- `raycast(ctx, origin, dir, { distance: RANGE, ignoreEntities: [ctx.self.id, gunId] })`; `hit.id`, `hit.position`, `hit.normal`.
- `ctx.emit("decal", { position, normal, texture, size, lifetime })`; `ctx.emit("hitstop", { duration }, { audience })`.
- `update(ctx, dt)`: spring constants (k 180, c 14; pistol 400 / 22). Sets `gun.feetPosition` with `attach: "camera"`, `gun.rotation`.
- `solveShot(from, to, speed, g, lead?) -> { vel, time } | null` from `builtin/ballistics`. `elevation(speed, g, distance, rise)` beside it.
- Projectile entity: `{ tags: ["projectile"], lifetime: 8, state: { vel, ownerId }, rotation: rotationFromDirection(vel), behavior: "scripts/arrow.js" }`.
- Per-step cast: `raycast(ctx, feet, dir, { distance: step * 1.5, ignoreEntities: [s.ownerId] })` before move.
- `hit.bone: { name, position, normal }`; `hits: "geometry"` meets drawn skin.
- Bullet-hell: `physics: { body: "kinematic", trigger: true }` with damage in `onTriggerEnter`; sim.js fires them.

Rules:
- Hitscan from the EYE via getInputRay then raycast. `query()` plus distance shoots through walls.
- Viewmodel: `feetPosition: { attach: "camera", x, y, depth, fov }` in camera-frame metres; `fov` gives own projection (guns 50-55, world 60-75). `audience: "local"` + `scope: "session"`.
- Arc: name the miss and fire nothing if solveShot is null. Ball flies under the g that you write in its update (`s.vel.y -= s.g * dt`); dynamic bodies use place gravity.
- Ball born a metre clear of muzzle, own hull in ignoreEntities.
- Tracer: one `path()` segment particle, additive, gone in 0.1 s (flash program).
- Hit through door: `hit.doors`, `hit.world`, `hit.address` (`"world:<id> +place#thing"`), `hit.door.verdict`.

Gotchas:
- `getObjectSocket` returns the world point as drawn (viewmodel corrected for fov); no declared socket returns forward end.
- Viewmodel per-tick write must carry fov every time.
- Aircraft-like per-tick rotation writes are not in this file; here `update` writes the gun pose each tick.
- A cylinder spawned and re-laid each tick pops in and out; use fx.
- Physics entity through a door: wrong for a bullet.
- Name: `rotationFromDirection(vel)`; nose is modelled forward, -Z.

Verify: none stated.

## rooms-and-matchmaking
File: skills/rooms-and-matchmaking.md (hook: invites, parties, matches, player cap, server game port)

What it does: explains that Spawn handles meeting and rooms; game builds match logic within a room; routing, pickRoom, instances, alwaysOn.

Config:
- world.config.yaml: `routing: { script: scripts/routing.js, maxPlayers: 20 }`. `routing.maxPlayers`, `routing.persistence: "persistent"` (default), `routing.alwaysOn: true` (off by default).
- `ctx.world.routing = { script, maxPlayers, persistence, alwaysOn } | null`.
- Arena template `places/arena/config.yaml`: `instance: party` (or `solo`), `persistence: ephemeral` (or `session`, `persistent`).

Code:
- `scripts/routing.js`: `import { mostFullWithSpace, nextRoomName } from "builtin/room-routing";` `export async function pickRoom(ctx)`. ctx: `requestedRoomId`, `rejectedRooms`, `player { userId, username, isGuest, lastRoom, region }`, `rooms [...]`, `game { appId, variantId, roomMode }`.
- `builtin/room-routing`: `firstOpenRoom(ctx)`, `mostFullWithSpace(ctx)`, `nextRoomName(ctx.rooms, exclude)`, `roomFor(key)`.
- Door: `cross(entity, "+arena", ...)` returns `{ crossed: true } | { crossed: "departing", link } | { crossed: false, verdict }`. `ctx.self.place`. `delete ctx.world.places[name]` ends it.
- `cross(entity, "world:" + ctx.world.id + "/room:" + name, { createIfMissing: { params, state } })`.
- `ctx.place.objects["match-manager"]`, `ctx.place.owner`, `mgr.state.phase`.
- `ctx.getRoomId()`.
- `player.spectating = true | false`.
- `policy.admits(ctx, e)` runs in copy; `ctx.place.owner`, `ctx.place.players`.
- `ctx.gapMs` on first tick after alwaysOn visit.
- Physics in own world: `createWorld()`; reads take it as first argument.

Rules:
- Room name: lowercase letters, digits, `_`, `-`, up to 64 characters. null, throw or bad name fall back.
- `pickRoom` returns requested room even before it exists.
- Full room refuses at door; pick reruns with `ctx.rejectedRooms`.
- `maxPlayers` is one cap for every room; counts bodies including agent bodies, not Savi helper or wisp bodies.
- `alwaysOn`: every 15 minutes for 24 hours after last player left, runs crons owed (each once in order), ticks sim.js with `ctx.gapMs`, fires due `ctx.after`, saves.
- Offline progress: `state.gold += ratePerMs * ctx.gapMs`, or a cron using `ctx.now()` against a stamp in `world.state`.
- Room-wide match state has ONE writer (the manager).
- `spawn room reset <name>` empties a room's transients; reset `main` after tests.

Gotchas:
- Sharing: a Write or run_script changes the one tree every room boots from; an edit from a match room empties every room permanently.
- `getObject(them)` null from another place and when they left: branch on the `.place` first.
- `ctx.rooms[].metadata` is telemetry, never game data.
- Player port: no server-authoritative movement; coins and bags use `platformState`.

Verify: none stated; `spawn room reset` is the only operational tool named.

## spawn-engine
File: skills/spawn-engine.md (description: Read a world's engine API, edit its game files, and test the result.)

What it does: the entry guide for working on any Spawn world.

Steps stated:
- Account and HTTP API: https://www.spawn.co/llms.txt. Keep token in `SPAWN_TOKEN`; send as Bearer on API requests.
- Existing world docs: `GET /api/sdk/v1/<worldId>/agent/docs` with token. Guide for format, examples, editing tools, asset uploads. API reference by section: `?section=<heading>` answers one section in tomeApi; `sections` lists headings.
- 6.0 world is a git repo: clone its URL, read AGENTS.md. Engine reference is `api-reference.md` in the repo named by `.spawn/engine.yaml`.
- Edit files and push to main. Read push result and resolve errors.
- Older world: follow the document API described by its docs response.
- Use field names, units, hook arguments and import names from the engine reference.
- Test: use the installed Spawn client's `--help` for play controls, game code execution and screenshots. Check edited game with those tools and script logs.
- A game does not import or inspect the engine implementation.

Gotchas: none beyond these; the file says do not import engine internals.

## trees
File: skills/trees.md (hook: forest, woods, park). Group: world-building.

What it does: one tree geometry script for species; scatter placement by run_script.

Code:
- `scripts/tree.js` params `{ kind, h }` (h metres). Exports `geometry(ctx)` and `collider(ctx)`.
- ctx members used: `ctx.params`, `ctx.lod`, `ctx.random()`, `ctx.tri(...)`, `ctx.color(\`oklch(...)\`)`, `ctx.albedo(path)` (bark or `scripts/tex-leaves.js?kind=<leaf>`). Returns `{ uvs, normals }`.
- `collider(ctx)` returns `{ kind: "cylinder", radiusTop, radiusBottom, height, center }`.
- Species rows in `SPECIES` (oak, birch, fir, pine). Fields: leaf, hue, bark texture, base, spread, lobes, trunk, dome, pow, droop.
- run_script: `spawn("wood", { feetPosition: { x, y: { terrain: 0 }, z }, scatter: { bounds: { shape: "circle", radius: 50 }, count: 110, seed: 7, variation: { scale: [0.8, 1.25], yaw: [0, 360] }, templates } })`. Templates: `{ primitive: { kind: "scripted", script: "scripts/tree.js", params: { kind, h }, seed }, material: { alphaTest: 0.5 }, physics: "static" }`.

Rules:
- Each template has its own seed; copies share one mesh.
- Sprays are 2 m, toward 3 m past an 18 m crown (leaf-sprays file).
- Far wood leaves physics off.

Gotchas and numbers:
- 12 m oak is about 750 triangles at lod 1, 120 at lod 5.
- A species is a row; a new shape is a branch.

Verify: none stated.

## uploaded-models
File: skills/uploaded-models.md (hook: a dropped/built .glb, picture to model: place, dress, socket, mouth/talk, ?parts)

What it does: place and dress uploaded .glb models, attach children, play clips, read bones and sockets.

Code:
- `spawn({ id, feetPosition, physics: "static" | "character", layout: { box: { min, max } }, model: { id: "cdn/x.glb", materials: { slot: { texture, roughness, metalness } } } | "cdn/x.glb", children: [{ id, attachment: { socket | skin: true | bone | part }, model }] })`.
- `ctx.getObjectBoneNames(id)`, `ctx.getObjectMorphTargetNames(id)`, `ctx.getObjectSocket(id, name): { position, direction, confidence } | null`.
- `ctx.self.ragdoll = {...}` (null releases); joints[bone].strength.
- `ctx.attach(entity, parent, { position, rotation, scale, pivot, attachment, replaces })`.
- `ctx.getObject(id).skeleton` rows by `name`; `currentWorldPosition` per bone.
- Clips: `"cdn/...clip"` address; name match case-insensitive, `Armature|` ignored.
- Picture to 3D: `cdn/value.<sha>.png.glb`, `?static` for unrigged statue. Chat picture: `spawn attachments download`, then `spawn upload`. Fetch: `spawn fetch` shows facing.
- Rig: humanoid gets Idle, Walk, Run, Sprint, Jump. Mixamo-style bones get foot grounding. Platform-known rigs play library clips by address. `spawn clip import` prints address.
- Hitbox: `render: false` box primitive with `collider: "box"`; model on a child.
- `physics.capsule`, `collider: "capsule"`. Default character capsule 1.9 m tall, radius 0.35 m.
- Facing: engine, CDN model and dropped file face -Z. Use `model.forward: "+z" | "+x" | "-x"` to turn onto -Z once. `rotation` turns whole object; `forward` turns mesh, sockets and parts.
- `layout.box` in meters.

Rules:
- A read holds the hook until the model loads. A `{ bone }` or `{ socket }` attachment written first rides its anchor once loaded.
- Shape-key read `[]` and socket `null` = none.
- Skinned child: `attachment: { skin: true | { map: { childBone: parentBone } } }`. One child per garment; its own feetPosition/rotation/scale mean nothing.
- Body with shape keys: `{ bone }` or `{ skin }` child follows keys.
- Snake_case socket names resolve on any model.
- Model unrigged: plays baked clips, no bone attachments, IK or library clips.
- Missing clip name plays idle (else first) clip; `getLogs()` lists real ones.
- Material slots keyed by GLB material name (node names fallback). Miss lists real names in getLogs().
- `model.parts.<name>: { visible, ...material }`; `?parts=a,b` cuts a nameless mesh; `?extract=a` mints one as a model.

Gotchas:
- DM height and bounds are in-game size, not the thumbnail. Collider coarse until hull cooks.
- A DM calling it too heavy: fix source or Blender.
- Name each material slot for its surface in Blender.
- Jaw: a face talks by jaw bone or mouth key; weight jaw to mouth in Blender if neither.
- Check pose by knee/foot `currentWorldPosition`.
- `ctx.attach` is for piece swap only.

Verify: the file says to check pose by drawn bone positions; no test procedure given.

## vehicles
File: skills/vehicles.md (hook: cars/trucks/karts/tanks)

What it does: vehicle physics, rider seating, control mounts, and recipes for car, tank, ship, two-wheelers, race, kart, airplane, helicopter.

API:
- `physics: { body: "dynamic", collider: "box", mass, centerOfMass: [x, y, z] }` (local, pivot at feet).
- `ctx.place.gravity` (-24 in 3D starter). `update(ctx, dt)` at 30 Hz.
- `input.axes.moveX` (+right), `.moveZ`, `.aimYawSin/Cos`; `input.held.jump`, `input.pressed.interact`.
- `export function collider() { return { kind: "box", width, height, depth }; }`.
- `render: false` on parent; children drawn.
- `hull.controller = player.id` mounts; null dismounts.
- `onControlBegin(ctx, player)`, `onControlEnd(ctx, player)`; `player.camera` = chase rig / null.
- `ctx.emit("press", { by: ctx.self.id }, { to: hullId })`; `ears.press = (ctx, { by }) => ...`.
- `ctx.self.parent = hullId; ctx.self.feetPosition = seatFeet; ctx.self.parent = null`.
- `player.controlling.state` in scripts/ui.js.
- `interpolation: { teleportThreshold }` (past 2 m/tick hull warps).
- `audio: { kind: "program", script, params, spatial: true }`.
- Seats: `scripts/lib/data/car.yml` `seats: [{ id, x, y, z }, ...]`.
- Hands: `bones.LeftHand.reach = { object: <grip-l id> }`, RightHand on grip-r; LeftFoot/RightFoot on `<seat id>-foot-l` / `-foot-r`; `null` on step-out.
- Tank: `vL, vR = throttle·vMax ∓ steer·vTurn`.
- Ship: `physics: { body: "dynamic", density }`.
- Airplane: held loads; `grip-l`, `grip-r`; `skeleton()`, `ctx.bone()`.
- Helicopter: thrust = collective × hull up × sqrt(max(0, dot(up, worldUp))); linearDamping ~0.03.
- Arcade kart: `friction: 0`.

Tuning bands at gravity -24 (car): mass 200-300; spring 4000-6000; damper 600-900 per corner; rest 0.45-0.55 m; radius 0.33-0.35; grip 0.8-1.1; clearance 0.12-0.25. Stability: `sqrt(k / cornerMass) / 30 <= 0.3`, `damper / 30 / cornerMass <= 0.5`.

Rules:
- Engine sleeps still bodies; parked car rests on grade.
- Wheels are hub children: `yaw` steers, `pitch` spins.
- State = intent (gas, steer, driverId, HUD) written on change; spin and pose in script memory.
- Seats: each the floor under hips of seated 1.8 m body: hips 0.40 up, shoulders 0.84, head top 1.40. Nothing across space below roof, 1.5 m over each seat point.
- Two-wheelers: rest length = loaded hub height + 0.3 m; roll torque with w ≈ 8/s; road bike lean 20-30°, scooter 12-18°.
- Race: one referee in sim.js runs grid, countdown, race, results.

Gotchas (given in file):
- Loads move no kinematic body. A car ignoring gas has a kinematic hull; a self-driving one leaves stale forces.
- Aircraft `update` writes loads only; per-tick `rotation` or `velocity` writes undo them.
- Rider writes rider, hull writes hull; a cross write lands a round trip later.
- Mid-ride script edit re-runs `onSpawn` and `onControlBegin`: find wheels by id.

Verify: none stated.

## voxel-terrain
File: skills/voxel-terrain.md (hook: block worlds: dig-and-place, caves)

What it does: block terrain via a generator, voxel read/write API, block scripts, marks and structures.

Config (places/main/config.yaml, by run_script):
- `place.terrain = { kind: "voxel", seed, verticalRange: { min, max }, generator: "scripts/terrain.js", materials: {...}, marks: {...} }`.
- Defaults: `verticalRange` `{ min: -32, max: 256 }`; `lodRanges` `[96, 288]`.
- `terrain.meshing.style "smooth"`.
- `terrain.materials.<id>`: color, tones, growth, pattern, solid (default true), cutout, collision ("none" for ground cover/liquids), liquidKind, surfaceInset, emissive, emissiveIntensity, countsAsTerrainSurface, wind `{ force }`, blockBehavior `{ script, randomTick, scheduledTick, neighborChanged }`, pattern.flowSpeed, flowDirection.
- `terrain.marks.<key>`: kinds flatten | clear | pond | river | path | structure, applied in that order.
- `terrain.structures: [{ id, priority, placement, template }]`; placement at | scatter | grid | cluster; template `{ kind: "builder", source }` or `{ kind: "serialized", data }`.
- `delete ctx.place.terrain.runtimeEdits` drops player edits for everyone.

Script (scripts/terrain.js): `export function materialAt({ x, y, z, noise, seedOffset })`; `noise.fbm2`, `noise.simplex3`; returns material id or "air". `export function dayKey(ctx)`.
- Block script exports: `stateSchema`; `geometry`, `collider`, `raycastShape`, `surface` (each `(state)`); `onRandomTick(block)`, `onScheduledTick(block)`, `onNeighborChanged(block, { dx, dy, dz, materialId })`, `onInteract(block, player)`, `onBreak(block)`.
- `block`: `{ x, y, z, materialId, state, get(), set(materialId, state), break(), isSolid(), schedule(delayTicks), random(), spawn(def) }`; trailing offsets dx, dy, dz.

Voxel API:
- `ctx.place.voxels[x][y][z]` integer cell coords; world = cell × cellSize (0.125 to 2). Read returns id, null for air, or "unloaded". Assignment "stone" places, null breaks and fires onNeighborChanged.
- `voxels.solid(x, y, z): true | false | null`.
- `voxels.fill(min, max, material | null, { state })`; returns `{ left }` for made things.
- `voxels.stamp(source, cell, { author, id })`; source is structure id, builder script exporting `build()` over `builtin/voxels` part(), or `{ bounds, palette, voxels }`.
- `voxels.raycast(origin, dir, { distance = 64, includeLiquids, place })`: `{ position, normal, distance, voxel, adjacentVoxel, materialId, state } | null`.
- `ctx.place.terrain.colorAt(x, y, z, normal)`.
- `voxels.query({ tag, radius, center, place })`; unsorted.
- `voxels.interact(x, y, z)` runs onInteract.
- `voxels.read(min, max)`: `{ min, size, palette, cells, states }`; inclusive corners; x fastest, then z, then y.
- `onVoxelsChanged(ctx, boxes)` in sim.js.
- `voxelMarkSet { markId, voxel, outline, fill, pulse, duration }` / `voxelMarkClear { markId }`.
- `ctx.day`, `ctx.params`; a land.wgsl `override snow: i32 = 0;`.

Rules:
- Every click lands the same tick for every player.
- Cold young world: voxels starter first (one call; dig.js: left breaks, right places).
- ctx.x/y/z are world meters regardless of cellSize.
- voxels.fill fires no per-cell hooks; use fills for walls, floors, rooms.
- Live dig cost: 3-5 ms per cell or small fill, plus its chunk's mesh and collider that tick.
- Only a persistent place keeps edits itself.
- Past lodRanges, far land draws to min(camera.far, linear fog far).
- 2D place plays one slice (defaultSlices.sideZ / topY); voxel calls answer in slice cells.

Gotchas:
- Per cell: player edits > structures > marks > generator. Structure holes fall through.
- `"air"` is empty: never define it as a material.
- `onBreak` fires per-cell breaks only; fills do not fire it.
- Physics: `solid` default true; liquids and ground cover need `collision: "none"` only for those; solid leaves hold players on canopy.
- Only `=== false` confirms empty; null means unknown.

Verify: none stated.

---

## skills.md (index)
- Instruction: read `skills/<id>.md` whole before building in its territory; `spawn-engine` first.
- Lists 23 skill ids with trigger phrases. Part B ids are the 11 covered above.

## README.md (engine vocabulary)
- Engine 6.0.0. Read-only, published by Spawn CI from the shipping build.
- A 6.0 world's `.spawn/engine.yaml` names this repo; clone shallow into the world: `git clone --depth 1 <url> .spawn/engine` (gitignored), same token.
- Contents: `api-reference.md` (supported game API), `skills/<id>.md` (guides, skills.md is index), `engine.yaml` (pin and engine build sha256).
- Note: `api-reference.md` and kernel source are not in this clone; skills docs say so only indirectly.

---

Gaps:
- No file in this set gives a test or verify procedure except spawn-engine (client --help, play controls, script logs).
- The engine docs do not state engine internals; nothing here about internals is inferred.
- api-reference.md is named by README and spawn-engine but is not in this clone.
- Several signatures (for example `ctx.job` callback internals, `raycast` option defaults beyond those listed) are not fully specified in the source docs.
