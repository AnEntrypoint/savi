# Spawn engine 6.0.0: working guide

Entry point for the engine notes in this folder. Built from api-a.md, api-b.md, skills-a.md, skills-b.md, world-usage.md and pin-and-untracked.md. Primary source: the engine docs clone at `/workspace/savi/.spawn/engine` (`api-reference.md`, `skills/*.md`, `skills.md`, `README.md`, `engine.yaml`). The kernel source is not in the clone. Marks: "(inferred)" means beyond what the docs state; "(observed in game-6)" means seen only in the Savi Gallery tree; "(not stated)" means the docs leave it open.

## 1. What the engine is and how a world uses it

- Spawn engine 6.0.0 is the game runtime. A world's `.spawn/engine.yaml` pins it: `semver: 6.0.0` and an `sha256`. The live pin in the clone is `sha256: b5d10e377d047b1f2d5d303009fe45757aad4abb66fa9ab2a32951676d93b630` (HEAD `eb0aad2`, "kernel b5d10e377d04", fetched 2026-11-05; earlier pins are in the README pin history). The README calls the sha256 "the engine build's sha256" and does not say what bytes it covers. (engine.yaml, git log, README)
- The engine clone is read-only docs published by Spawn CI. The runtime worker (kernel) is cached and SRI-verified by the room host at /tmp/spawn-room-host-engine-cache-1000/; see kernel-worker.md. A 6.0 world clones it shallow with `git clone --depth 1 <url> .spawn/engine`, which is gitignored by the world's `.gitignore`. The docs do not write the URL out. (README, skills/spawn-engine.md)
- Clone contents: `api-reference.md` (the supported game API, 2277 lines, 68 `##` headings), `skills/<id>.md` (23 guides), `skills.md` (index), `engine.yaml`, `README.md`.
- Units and frames: meters, Y up, negative Z forward. Rotations are degrees unless a field says otherwise. Hook `dt` is seconds. `ctx.now()` is milliseconds on the world clock. Yaw 0 faces -Z. (api-a, preamble; api-b, builtin/vec3)
- A behavior path names a module in the world's `scripts/` directory. The module exports named hooks. Import supported functions from `builtin/<module>`. Game code does not import or inspect engine internals. (api-a preamble; skills/spawn-engine.md)
- Object placement: `feetPosition` is the bottom center. Flat primitives use their center. Parent-relative positions and rotations are local to the parent. `physics` omitted gives no collider; `"static"` is a fixed solid; `"dynamic"` is a moving body. (api-a, preamble)
- Edits: runtime behavior edits change the running game. Authored file edits and `ctx.commit(message, fn)` save to the world's tree. Asset fields hold CDN names or uploaded asset references; a reference to a file in the tree must name a file that exists. (api-a, preamble)
- Places have `mode`: `"3d"` (default), `"2d-side"`, `"2d-top"` or `"ui"`. A world whose places all have `mode: "ui"` draws nothing. (api-b, Named types; skills/2d-mode.md)
- One rate per room: the room steps every place at one rate, the default place's `tickBase`. Another place's `tickBase` is kept and read back but steps nothing. (api-b, PlaceDef)
- `timeScale` on a place scales that place's simulation: 0 stops, 1 normal, 2 double. `ctx.now()`, camera, UI and sound do not scale. Delete or `= null` returns it to 1. (api-b, PlaceScopeHandle)
- Save scopes: `player.state` is the player's saved data (no size cap, loads whole at each join). `ctx.world.state` is shared within the room. `ctx.session` is local scratch on this machine. (api-a, preamble and State; skills/platform-systems.md)
- Simulation placement: `update()` runs only while a player is near the object (stated locality default about 500 m); an object with no position always runs. Logic that must advance for everyone regardless of position belongs in `sim.js` (api-b, Behavior Hooks).
- Platform jobs (`llm:*`, `image:*`, `jev:*`, `mail:send`, `chat:send`, `text:check`, `player:token`, `player:names`) run on Spawn's side and answer through callbacks. Outside web calls only run inside a job's `run` (skills/platform-systems.md).

### How game-6 (the Savi Gallery) uses it (observed in game-6, world-usage.md)

- Root: `world.config.yaml`, `sim.js` (world referee), `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `design.md`, `templates/` (`camera.js`, `player.js`), `places/` (11 places: annex, blocks, highlands, main, observatory, sidescroll, topdown, vault, w7match, workshop, ws-locked), `scripts/` (top level, `lib/`, `buyables/`, `ex/` with about 130 exhibit modules, `ui/nametag.js`), `.spawn/`.
- Places with `config.yaml` and `mode: 3d`: main (heightmap, has `sim.js`), workshop, and others. Only main and workshop configs were read; the other places' modes are not confirmed (world-usage.md, section 1).
- Scene cells: `places/<place>/cells/x<cx>z<cz>.scene`, 47 cells across places (13 in main). Cell index is `round(x / 128)` (observed; the 128 m size is not stated in the API read). Header line: `# spawn-scene v2 yaml <cellKey>` (observed).
- Tunables live in `scripts/lib/data/*.yml`, imported directly (observed).

## 2. The hook model

### 2.1 Scopes on ctx

| Scope | What it is | Source |
|---|---|---|
| `ctx.self` | The object the behavior is on (camera rig handle for `camera.js`). Fields include `id`, `state`, `session`, `feetPosition`, `rotation`, `velocity`, `angularVelocity`, `grounded`, `touching`, `parent`, `controller`, `controlling`, `joints`, `ragdoll`, `anim`, `spline`, `objectId`, `pocket`, `worldFeetPosition`, `bounds`. | api-a, Self, Movement, Identity; api-b, ObjectView |
| `ctx.place` | The current place (`PlaceScopeHandle`): `id`, `name`, `players`, `playerCount`, `objects`, `state`, `atmosphere`, `terrain`, `voxels`, `tiles`, `fields`, `mode`, `gravity`, `tickBase`, `damping`, `timeScale`, `owner`. | api-b, PlaceScopeHandle |
| `ctx.world` | The world: `state`, `camera`, `inputs`, `assets`, `mode` ("dev" or "live"), `version`, `id`, `address`, `players`, `playerCount`, `onlineCount`, `date`, `places`, `engine`, `passThrough`, `routing`, `ui`, `player`, `godMode`, `creatorTabs`, `defaultPlace`, `settling`, `files`, `buyables`. | api-a, State |
| `ctx.player` | The local player in a camera rig context (`ctx.player` alone "gives no more detail"). | api-a, The Local Player |
| `ctx.view` | Read-only machine stats: `pixel`, `fps`, `drawCalls`, `triangles`, `cpuMs`, `gpuMs`, `frames`, `memoryMB`, `gpuMemoryMB`, `renderScale`, `netInBytes`, `netOutBytes`, `netInMessages`, `netOutMessages`, `site`. Also `ctx.view.camera`. Values are 0 or null on the server. | api-b, ViewAPI |
| `ctx.session` / `ctx.self.session` | Local scratch on this machine. | api-a, State |
| The spine | `ctx.place` and `ctx.world` are carried by every behavior ctx. | api-a, The Spine |

### 2.2 Hook names (behavior module exports)

From api-b, Behavior Hooks (exact):
- `onSpawn(ctx)`, `onDestroy(ctx)`
- `update(ctx, dt: number)`, `lateUpdate(ctx, dt: number)`
- `onInput(ctx, input: InputState)`
- `onCollide(ctx, other: ObjectQueryResult, contact: Contact)`
- `onTriggerEnter(ctx, other: ObjectQueryResult)`, `onTriggerExit(ctx, other: ObjectQueryResult)`
- `onCross(ctx, other: ObjectQueryResult, outcome: Extract<CrossOutcome, { crossed: true | "departing" }>)`
- `onRefuse(ctx, other: ObjectQueryResult, verdict: CrossVerdict)`
- `onLiquidEnter` / `onLiquidExit(ctx, other: ObjectQueryResult & { liquidKind?: string; markKind?: string })`
- `onSay(ctx, line: SaidLine)`
- `onSoundEnd(ctx, sound: SoundEndEvent)`
- `onOutOfBounds(ctx, event: OutOfBoundsEvent)`
- `onControlBegin(ctx, player: ObjectQueryResult)`, `onControlEnd(ctx, player: ObjectQueryResult)`
- `editor(ctx, obj: ObjectView)`, `visual(ctx, obj: ObjectView)`
- `onArrive(ctx, player)`, `onLeave(ctx, player)` (listed in api-a Identity via `player.arrival`; the names are used in game-6 `scripts/arrival.js`, observed)
- Named data exports: `export const updateSchedule = { every: N | { seconds: s }, near: { radius } }` (a data export, not a hook); `export const ears = { "<event>": (ctx, payload) => ... }`; `export const scopes = {...}` (sim and chat, observed); `export const cadence = "1s"` (sim, observed); `export const faculties = [...]` (portals skill).
- Named functions passed by string: `ctx.job(..., "<exportName>", payload)` and `ctx.after(s, "<exportName>", payload)` call a named export with `(ctx, payload)` (or `(ctx, r, payload)` for jobs).

Order: the docs do not state an order across hooks. Live preview-room measurement (live-probe-results.md, 2026-11-05) gives onSpawn → first update → onCollide(avenue) → onCollide(terrain stream), with terrain/support-hold released when onSpawn runs. Stated timing facts:
- `update()` is skipped on ticks the `updateSchedule` declines. `every: N` runs `update()` every N ticks with a per-entity phase. `dt` equals the declared cadence step (every x tick dt).
- `ObjectSpec.tick: { phase: "pre" | "post", order? }` sets tick phase (api-b, ObjectSpec). The order of pre/post relative to hooks is not stated.
- The room ticks `sim.js` on its own cadence (game-6 uses `"1s"` and `"250ms"`, observed).
- A `"+place"` door fires `onCross` / `onRefuse` (portals skill). The engine order between `onTriggerEnter` and `onCross` is not stated.
- Declaring `every` replaces a hand-rolled `tick % N` gate. Delete the gate; never keep both.
- A `scripts/arrival.js` header says a place-to-place move (`ctx.cross`) fires neither `onArrive` nor `onLeave` (observed in game-6). Trust the game-6 file as observed behavior, not as an engine statement.

### 2.3 Verbs (the calls a hook makes)

Entity and world:
- `ctx.spawn(spec: ObjectSpec): string`; `ctx.spawn(id: string, spec: ObjectSpec): string`
- `ctx.destroy(id?: string): void`; `ctx.destroy(ids: string[]): void`; `ctx.destroy(id: string, options: { force?: boolean }): void`; `ctx.destroy(ids: string[], options: { force?: boolean }): void` (what `id?` with no id does, and what `force` overrides: not stated)
- `ctx.getObject(id: string): ObjectView | null` (null when missing)
- `ctx.query(opts: ObjectQueryOptions): ObjectView[]`; `ctx.query(opts: ObjectQueryOptions & { select: "ids" }): string[]`; `ctx.query(opts: CrossingScopeQueryOptions): CrossingRecord[]`. Excludes self unless `ignoreSelf: false`.
- `ctx.attach(entity, parent, offset?)`; `ctx.self.parent`
- `ctx.getRoomId(): string`
- `ctx.presence(userIds): Promise<readonly PresenceRow[]>`
- `ctx.changed(glob): { path, value, prev }[]`
- `ctx.commit(message?, fn)`: saves a change to the world's tree (fn signature not stated)
- `ctx.resolveControls(surface?: string): { surface: TouchSurfaceDef; diagnostics: Array<{ code; message }> }`

Events:
- `ctx.emit(name: string, payload?: unknown, options?: { place?, to?, via?, audience? }): string | void`
- `ctx.emit<K extends ActName>(name: K, payload: ActPayloads[K], options?: { audience?: Audience }): string | void`
- `ctx.on(name: string, handler: TomeEventHandler, options?: TomeEventOptions): () => void` (returns unsubscribe). `TomeEventOptions = { place?, once? }`.

Time:
- `ctx.now(): number` (ms); `ctx.dtMs`; `ctx.gapMs`; `ctx.random(): number`
- `ctx.after(seconds: number, hookExport: string, payload?: unknown): string` (returns timer id)
- `ctx.cancel(id: string): void`
- `ctx.getTimers(ownerId?: string): Array<{ id; ownerId; dueInTicks; dueInSeconds; engineOwned; hook? }>`
- `ctx.sleep(seconds?)`: behavior not stated

Jobs:
- `ctx.job<T>(jobId: string, args: Record<string, unknown>, callback?: (result: JobResult<T>) => void, options?: JobOptions): string`
- `ctx.job(jobId: string, args: Record<string, unknown>, hookExport: string, payload?: unknown): string`
- `ctx.awaitJob<T>(requestId: string): Promise<JobResult<T>>`
- `ctx.proposePurchase(buyer: string | { readonly id: string }, itemId: string): string` (returns requestId; not proof of payment)

Players and DMs:
- `ctx.notifyDm(message: string, options?: NotifyDmOptions): void`
- `ctx.notifyDmOnce(key: string, message?: string, options?: NotifyDmOptions): void` (dedupe semantics not stated)
- `ctx.enterPlace(options: EnterPlaceOptions): string | null`; `ctx.enterPlace(entityId: string, options): string | null`
- `ctx.cross(entity, link, options?)`: door crossing, returns `{ crossed: true } | { crossed: "departing", link } | { crossed: false, verdict }` (routing skill)

Terrain and fields:
- `ctx.getWaterLevelAt(x: number, z: number, place?: string): number | null`
- `ctx.readField(name: string, x: number, z: number, place?: string): number`
- `ctx.getTerrainNormal(x: number, z: number, place?: string): Vec3 | null`
- `ctx.worldToScreen(position: Vec3): { x; y; depth; onScreen } | null`

Logging and files:
- `ctx.log(...args)`, `ctx.warn(...args)`, `ctx.error(...args)`
- `ctx.files.read(path)` (string or null), `.write(path, text)`, `.delete(path)`

Database:
- `ctx.sql` tagged template: `` ctx.sql`...` `` returns `{ rows, changes, lastInsertRowid }`; bind with `${v}`; `@caller` binds the acting player (platform-systems). `SqlAPI = { size(); backup(label); restore(target) }`.

Presentation and effects:
- `ctx.pulseFx(id: string, name: string, opts?: { at?: Vec3; data?: Record<string, unknown> }): void`
- `ctx.stopFx(id: string): void`; `ctx.getFxState(id: string): FxState | null`
- `ctx.music.*`; `<player>.music`, `<player>.ambience`

Physics (via `builtin/physics`, always pass ctx first, except `createWorld`):
- `raycast(ctx, origin, direction, opts?)`; `overlapPoint(ctx, point, opts?)`; `overlapSegment(ctx, a, b, opts?)`; `traverseCheck(ctx, from, to, opts?)`; `jumpCheck(ctx, from, to, { speed, jumpSpeed, ... })`; `getInputRay(ctx, input?)`; `createWorld(opts?: { gravity? }): Promise<PhysicsWorld>` (takes no ctx)

## 3. Quick reference: most-used calls

Each example is composed from the field names the notes give. Signatures are verbatim from the notes.

1. Spawn an object. `ctx.spawn(spec: ObjectSpec): string`
   ```js
   const id = ctx.spawn({ feetPosition: { x: 0, y: 0, z: 0 }, primitive: { kind: "cube", size: 1 }, physics: "static" });
   ```
2. Remove an object. `ctx.destroy(id?: string): void`
   ```js
   ctx.destroy(id);
   ```
3. Read another object. `ctx.getObject(id: string): ObjectView | null`
   ```js
   const door = ctx.getObject("gate-1"); if (door) door.state.open = true;
   ```
4. Query nearby. `ctx.query(opts: ObjectQueryOptions): ObjectView[]`
   ```js
   const near = ctx.query({ tags: ["interactable"], radius: 3 });
   ```
5. Emit and receive. `ctx.emit(name: string, payload?: unknown, options?): string | void` and `ctx.on(name: string, handler: TomeEventHandler, options?): () => void`
   ```js
   ctx.emit("press", { by: ctx.self.id }, { to: near.id });
   ```
   The receiver: `ctx.on("press", (ctx, { by }) => { ... })` in `onSpawn`, or `export const ears = { press: (ctx, { by }) => ... }`.
6. Deferred work. `ctx.after(seconds: number, hookExport: string, payload?: unknown): string`; `ctx.cancel(id: string): void`
   ```js
   const t = ctx.after(0.12, "vanish", { reason: "hit" });
   ```
7. Engine-side job. `ctx.job(jobId, args, callback?, options?): string`
   ```js
   ctx.job("text:check", { text }, (r) => { if (r.ok && r.data.ok === false) ctx.notifyDm("Try other words."); });
   ```
   Job ids: `llm:chat`, `llm:generate`, `llm:clear`, `jev:decide`, `mail:send`, `chat:send`, `chat:history`, `player:token`, `player:names`, `text:check`, `image:generate`, `image:segment`.
8. Direct DM. `ctx.notifyDm(message: string, options?: NotifyDmOptions): void`
   ```js
   ctx.notifyDm("Gate open.", { to: player });
   ```
9. Random and time. `ctx.random(): number`; `ctx.now(): number`
   ```js
   const roll = ctx.random(); const deadline = ctx.now() + 5000;
   ```
10. Places. `ctx.enterPlace(options: EnterPlaceOptions): string | null`
    ```js
    ctx.enterPlace({ place: "arena", at: "default" });
    ```
    `EnterPlaceOptions = { place, at?: PositionSpec | "last" | "default", createIfMissing? }`.
11. Leave the room for a door. `ctx.cross(entity, link)`
    ```js
    onTriggerEnter(ctx, other) { ctx.cross(other, ctx.self.state.link); }
    ```
12. Player records. `player.state`
    ```js
    player.state.run ??= { coins: 0 };
    ```
13. Read the arrival request. `player.arrival.request: { room, query }`
    ```js
    const tab = player.arrival.request?.query?.tab;
    ```
    Only the link's single `linkQuery` parameter reaches the game. `https://spawn.co/@you/game?linkQuery=tab%3Dshop` reads `{ tab: "shop" }`.
14. Camera for a player. `<player>.camera = { ... } | null`
    ```js
    player.camera = null;
    ```
15. Raycast. `raycast(ctx, origin, direction, opts?)` from `builtin/physics`
    ```js
    import { raycast } from "builtin/physics";
    const hit = raycast(ctx, origin, dir, { distance: 20, ignoreEntities: [ctx.self.id] });
    ```
    `raycast` defaults to 200 m and ignores the caller unless `ignoreEntities` names it.
16. Tween. `animate(ctx, target, keyframes, opts?): void` from `builtin/tween`
    ```js
    animate(ctx, ctx.self, { "state.yaw": 100 }, { duration: 0.5, easing: "easeOutCubic" });
    ```
    `opts`: `{ duration?, easing?, delay?, direction?: "normal" | "reverse" | "alternate", loop?: boolean | number }`, seconds for duration and delay. (The easing name must match `builtin/easing` exports; the notes list `easeOut` variants such as `easeOutBounce`, so `easeOutCubic` is inferred.)
17. Path finding. `findPath(ctx, from, to, opts?)` from `builtin/nav` returns `{ points, ok, partial? }`.
18. Process a camera or input. `onInput(ctx, input: InputState)`; `input.pressed.interact`, `input.held.fire`, `input.axes.moveX`.
19. Save camera for a player. `<player>.camera`. Engine axes: `lookX`, `lookY`, `aimYawSin`, `aimYawCos`, `aimPitchN`, `touchActive`, `touchTwist`, `pointerLocked`.
20. Probability decision. `ctx.job("jev:decide", { state, questions }, "decided")`; callback export `decided(ctx, r, payload)`.

## 4. Spec shapes (exact field names)

### 4.1 ObjectSpec (api-b, line 643)
`{ id?, tags?, state?, behavior?: "scripts/file.js" | [...], parent?, children?: ObjectSpec[], ...ObjectPropertiesSpec, place?, audience?: "near" | "all" | "local", visibility?: "owner" | "platform", lifetime?: number, tick?: { phase?: "pre" | "post", order? } }`

Parenting example (api-b): `api.spawn({ parent: 'pole-0', feetPosition: {x:0, y:3, z:0}, primitive: {kind:'sphere', radius:0.25} });`. Owner-only row: `spawn({ parent: player.id, visibility: "owner", ... })` (platform-systems).

### 4.2 ObjectPropertiesSpec (api-b, line 477)
Top-level keys: `feetPosition`, `rotation`, `yaw`, `scale` (number or `{ x, y, z }`), `visible`, `visibleInFirstPerson` (bool or null), `castShadow`, `receiveShadow`, `primitive`, `sprite`, `room`, `path`, `layout`, `material`, `physics`, `light`, `audio`, `interpolation`, `pivot`, `render`, `visibleRange`, `layers`, `visibleTo` (`"all" | "editors"`), `vector`, `jiggle`, `morph`, `bones`, `wisp`, `boxart`, `collider2d`, `ui`, `press`, `fx`, `voice`, `model`, `mixer`, `attachment`, `spline`, `scatter`.

- `rotation` accepts a number (yaw), `{ yaw?, pitch?, roll? }`, `{ x, y, z, w }`, or `{ lookAt: PositionSpec, include?: [...] }`.
- `physics` accepts `"none" | "static" | "dynamic" | "kinematic" | "character" | false` or `{ body, collider?, trigger?, mass?, density?, friction?, frictionCombine?, restitution?, restitutionCombine?, linearDamping?, angularDamping?, gravityScale?, lockedAxes?, layer?, autostep?, maxSlopeClimbAngle?, minSlopeSlideAngle?, slideEnabled?, snapToGroundDistance?, characterMass?, applyImpulsesToDynamicBodies?, offset?, capsule?, up? }`. Example from game-6 (observed): `physics: { body: "static", trigger: true }`.
- `collider`: `"auto" | "box" | "sphere" | "capsule" | "cylinder" | "mesh" | "none" | str | { kind?: str }`.
- `scatter`: `bounds`, `sampling` (`poisson`, `grid`, `random`, `clustered`, `edge`), `count`, `seed`, `templates`, `variation`, `surface`, `filter`.
- Gotcha: `physics.capsule` `height` and `radius` are in the object's own meters; scale multiplies them. Height 2 on a scale-8.9 body collides 17.8 m tall. `height` is end to end.
- Default character capsule: 1.9 m tall, radius 0.35 m (uploaded-models).

### 4.3 Primitives (api-b, line 543)
`PrimitiveSpec` is a union of `kind` variants, each `& PrimitiveBase`. Kinds: `cube`, `box`, `sphere`, `cylinder`, `capsule`, `plane`, `torus`, `octahedron`, `tube`, `cone`, `ring`, `tetrahedron`, `icosahedron`, `dodecahedron`, `pyramid`, `lathe`, `extrude`, `circle`, `torusKnot`, `frustum`, `ellipsoid`, `superellipsoid`, `hollowCylinder`, `hemisphere`, `arch`, `archway`, `squareArch`, `wall`, `line`, `custom`, `scripted`, `points`.
- `{ kind: "cube"; size?: number; segments?: number }`
- `{ kind: "wall"; width: number; height: number; depth: number; holes?: ...; facing?: "z" | "x" | "y" }`
- `{ kind: "scripted"; script: ScriptRef; params?; seed?; forward?; sockets? }` (`sockets` e.g. `{ muzzle: [0, 0.07, -0.62] }` in projectiles)
- `{ kind: "points"; count; bounds? }`: one round point per copy.
- `PrimitiveBase = { materialKey?, overrides?: DrawMaterialOverrides, sockets? }`.
- A scripted primitive's `collider()` may return a heightfield (`spawn api ColliderHeightfield`).
- Forward axis: `model.forward` / primitive `forward: "+z"`; the default facing is -Z.

### 4.4 Materials (api-b, Named types)
`MaterialSpec = StandardMaterialSpec | WaterMaterialSpec | ScriptedMaterialSpec`.
- `StandardMaterialSpec` gotchas: `time` is the `.mp4` playhead in seconds (a write jumps every screen); `speed` default 1; `textureScale` is meters per tile under `wrap: "repeat"`, default 1, reads nothing without wrap; `dissolve` 0 intact to 1 gone.
- `alphaTest`: alpha cutoff 0..1 (three's alphaTest). `renderOrder`: higher draws later among transparent things.
- `ScriptedMaterialSpec = { kind: "scripted", script, params?, ... }`.
- `WaterMaterialSpec = { kind: "water", ... }`: `waveFrequency` default 7.3728 (higher means shorter waves); `waveHeightScale` 0 gives a flat sheet; `flowDirection` and `swellDirection` are normalized X/Z vectors (on faces steeper than 60 degrees water runs down regardless); `foamStrength` (a fall is aerated regardless); `flowSpeed` 0 is still glass (0.1 moves foam about 1.2 m/s); `wakeSeconds`.
- `tint`: an OKLCH string (`Color = OklchString`).
- Art path: game-6 uses both `cdn/texture-...` and `/cdn/...` forms; see gotchas.

### 4.5 Atmosphere, terrain, inputs (api-b, line 589, 619, 634)
- `atmosphere: { sky?, ground?, fog?, sun?, ambient?, hemisphere?, environmentIntensity?, clouds?, stars?, moon?, wind?, wet?, rain?, timeOfDay?, cycle?, look? }`.
  - `sky.kind`: `"color" | "gradient" | "rayleigh" | "realistic"` (`realistic` takes `model: "rayleigh" | "hosek"`).
  - `fog.kind`: `"linear"` (`near`, `far`) or `"exp2"` (`density`).
  - `timeOfDay`: 0-24.
  - `cycle`: `{ periodMs, epoch, bands? }`, `{ frozen: 0-24 }`, or `{ lengthSeconds, startTime?, anchorHour?, anchorTick? }`.
  - `look.toneMapping`: `"aces" | "neutral" | "none" | "linear" | "reinhard" | "cineon" | "agx"`.
- `terrain: { kind: "heightmap", seed?, materials?, generator?: "scripts/file.js", verticalRange?, marks?, water?, material? }`.
  - `marks` kinds: `sea`, `lake`, `river`, `path`, `road`, `flatten`, `clear-scatter`, `hole`. `lake`: `at`, `radius`, `level?`, `depth?`, `bedMaterial?`, `liquid?`. `flatten.falloffCurve`: `"smooth" | "cliff" | "linear"`. Mark defaults are not stated.
  - `MarkShape`: `{ kind: "circle", radius }` | `{ kind: "ellipse", radiusX, radiusZ }` | `{ kind: "rectangle", width, depth, rotation? }` (skills/heightmap-terrain.md).
  - `t.materials.sand = { albedo: "cdn/texture-terrain-sand-realistic-albedo.png", tint: "oklch(0.82 0.06 80)", textureScale: 2 }`. Default `textureScale` 2.5 m per tile in the skill; the api-b StandardMaterialSpec default is 1 (conflict, see gotchas).
  - Material options: `id, albedo, pbr, tint, normal, roughness, textureScale, metalness, normalStrength, roughnessIntensity, antiTiling ("none" | "stochastic"), filter ("pixel" | "linear"), macro`.
  - Decorations: `t.decorations.layers.<id>`, `bindings.<materialId>: [layerId]`, `t.decorations = null` removes all.
  - Voxel terrain (skills/voxel-terrain.md): `terrain: { kind: "voxel", seed, verticalRange: { min: -32, max: 256 }, generator, materials, marks }`; `lodRanges` default `[96, 288]`; `terrain.meshing.style "smooth"`.
- Inputs (api-b, line 634): keys are case-insensitive. A key is a letter, a digit (`"1"` the number row), a name (`space`, `shift`, `ctrl`, `alt`, `enter`, `escape`, `backspace`, `delete`, `f1`-`f12`, `up`/`down`/`left`/`right`), or any KeyboardEvent.code (`KeyE`, `Digit1`, `Numpad0`, `ArrowUp`). Tab is reserved. Gamepad triggers `Gamepad:LT` and `Gamepad:RT` are analog 0..1.
  - `InputAxisDef = { keys?, mouse?: "deltaX" | "deltaY" | "wheelY" | "wheelX", gamepad?, deadzone?: 0-1 }`
  - `InputActionDef = { keys?, mouse?, gamepad?, modifiers?, activeOn?: "keydown" | "hold" | "keyup", touch?, active? }`
  - Example from game-6 (observed): `actions: jump: { keys: [space] }`, `axes: moveX: { keys: a/d }`.

### 4.6 Scene rows (game-6, observed)
Cell files: a quoted or bare id key, then flat fields at one indent. Fields seen: `feetPosition`, `id`, `material`, `physics`, `primitive`, `rotation`, `scale`, `state`, `tags`, `behavior`, `children`, `vector`, `ui`, `spline`, `light`, `castShadow`, `attachment`. Behavior is scalar `behavior: scripts/...` in cells and an array in templates. Splines: `spline: { kind: road | fence, points: [[x, y, z], ...], width }`. Portal: `material: { kind: scripted, script: engine/portal-aurora, view: {...} }`, `physics: { body: static, trigger: true }`, `state: { link: "+workshop#ws-return", name }`, `tags: [portal, worldgate]`.

### 4.7 Templates
`templates/camera.js` exports `export const camera = { behavior: ["scripts/camera.js"], kind: "custom", orientation: { source: "look" }, sensitivity: 3, state: { pitch: 0, yaw: 0 } }`. `templates/player.js` exports `export const player` with `behavior: [...]` and `physics: { body: "character" }` (game-6, observed). Templates are referenced from `world.config.yaml` (`camera: templates/camera.js#camera`, `player: templates/player.js#player`).

### 4.8 Primitives in a template vs a row
A template `primitive` with a scripted kind takes `{ kind: "scripted", script: "scripts/tree.js", params: { kind, h }, seed }` (trees skill). A template with no visual wears the avatar (2d-mode).

### 4.9 Cameras (api-a, Self; cameras skill)
- Def: `CustomCameraDef`: `kind: "custom"`, `sensitivity?` (default 3), `minPitch?` (default -1.4, 80 degrees down), `maxPitch?` (default 1.4, 80 degrees up), `pointerLock?`, `hideLocalPlayer?`.
- `CameraCommon`: `fov?` (degrees across the short edge; unset means 60), `clip?`, `behavior?`, `pixelSnap?`, `projection?`, `layers?`.
- Optional `ctx.self` camera fields: `pointerLock`, `fov`, `clip`, `orientation`, `sensitivity`, `minPitch`, `maxPitch`, `pixelSnap`, `hideLocalPlayer`, `projection: "perspective" | "orthographic"`, `layers`. Defaults not stated for most.
- `ctx.view.camera = { eye, aim, fov } | { parent: id, eye, aim, fov } | null`.

### 4.10 Other shapes used in calls
- `Audience = { kind: "player"; id } | { kind: "nearby"; position; radius? } | { kind: "all" } | { kind: "place"; placeId? }`
- `ObjectQueryOptions`: `radius?`, `center?`, `tags?`, `anyTags?`, `excludeTags?`, `ignoreSelf?`, `place?`, `select?: "objects" | "ids"`, `objectId?`.
- `ObjectQueryResult = { id, tags, feetPosition, state, userId?, objectId? }`.
- `JobOptions`: `priority?: "low" | "normal" | "high" = "normal"`, `deadlineMs?` (a platform job waits at most 800000 ms), `dedupeKey?`, `retries?`, `onPart?`, `count?`, `room?`.
- `JobResult = { ok, data?, error?, durationMs }`; `JobError = { message, code?, retriable?, attempts, deadlineExceeded?, retryAfterMs?, details? }`.
- `JointOptions`: `anchor?` (default [0,0,0]), `targetAnchor?` (default [0,0,0]), `axis?`, `limits?`, `motor?: { velocity, maxForce }`, `target?`, `strength?`, `restLength?` (default 0), `stiffness?` (default 0), `damping?` (default 0), `contactsEnabled?`, `breakForce?`, `breakTorque?`. Limits: revolute `[min, max]` radians; prismatic `[min, max]` metres; spherical `{ cone, twist }`. `strength` 0 or absent means no drive; `breakForce` 0 breaks under any load; unset or Infinity never breaks.
- `RotationSpec = number | { yaw?, pitch?, roll? } | { x, y, z, w } | { lookAt, include? }`; a bare number means yaw.
- `PositionSpec`: `{ x, z }`, `{ x, y, z }`, `{ x, z, y: TerrainOffset }`, `{ x, z, y: "surface" }`, `{ tile: [number, number], offset? }`, or `CameraAttachPositionSpec`.
- `ForwardAxis = "-z" | "+z" | "+x" | "-x"`.
- `HapticKind = "soft" | "light" | "medium" | "rigid" | "heavy" | "selection" | "success" | "warning" | "error"`.
- `RoutingDef = { script?, maxPlayers?, persistence?, alwaysOn? }`.
- `EngineConfig`: `networking?`, `ui?`, `graphics?`, `playerSettings?`, `simulation?: { tickRateHz? }`, `behaviors?`, `crons?`.
- `PlaceDef`: `mode?` (`"3d" | "2d-side" | "2d-top" | "ui"`), `gravity?`, `tickBase?`, `damping?`, `terrain?`, `atmosphere?`, `camera?`, `material?`, `lighting?`, `sky?`, `inputs?`, `ui?`, `listenerEntity?`, `acoustics?`, `fields?`, `fieldConfig?`, `objects?`, `defaultSpawnPoint?`, `defaultSpawnRotation?`, `arrival?`, `returnDoor?`, `pregenerate?`, `mintedFrom?`, `instance?` (`"shared" | "party" | "solo"`), `persistence?` (`"ephemeral" | "session" | "persistent"`), `policy?`, `worldBounds?`.
- `SplineSpec.kind`: road, pipe, fence, hedge, powerline, wall, guardrail, handrail, railway, streetlight, stringlight, bannerline, conveyor, canal, curb, stairs, boardwalk, bollard, barrier, zipline, aqueduct, coaster, data-only, scripted. Defaults: `bulbSpacing` 0.4 (stringlight); `wireSag` 0.8 m per 10 m span on draped wires; on pole wires 0.35 (powerline), 0.18 (zipline), 0.45 (others).
- `OutOfBoundsEvent = { bottom, position, placeId, respawnPoint }`; default `bottom` is 64 m under the lowest floor.
- `SoundEndEvent = { soundId, clip, durationSeconds }`; before pitch the clip plays `durationSeconds / pitch`.
- `NoiseEvent = { position, radius, kind, sourceId, tick, data? }` (radius in metres before the listener's hearing multiplier).
- `ActPayloads` (acts sent with `ctx.emit`): `playSound` (`volume = 1`, `pitch = 1`, `mode: "overlap" | "restart"`, `follow?`), `preload: { refs }`, `decal` (`size = 0.5`, `lifetime = 30`, `opacity = 1`), `shockwave`, `screenShake` (`duration = 0.2`), `screenFlash` (`duration = 0.15`, `intensity = 0.35`), `hitstop: { duration }`, `cameraPunch` (`intensity = 0.3`), `slowMo: { scale, duration, easing? }`, `zoomTo` (`duration = 0.5`, `easing = "easeOut"`), `flash` (`duration = 0.1`, `intensity = 0.9`), `squash` (`axis = "y"`, `intensity = 0.3`, `duration = 0.15`), `highlightSet` (`style = "outline"`), `damageNumber` (`size = 1`, `lifetime = 1.5`), `haptic`, `openSettings` (`page?`).

## 5. Recipes

Each recipe names the skill that covers it. Read the skill whole before building in its territory; `spawn-engine` first (skills/skills.md).

### 5.1 Add an object
1. Pick a shape: a primitive (section 4.3), a model (`model: "cdn/x.glb"`), or a scripted geometry. Skills: `geometry` (scripted meshes, `geometry(ctx)` and `collider(ctx)`), `uploaded-models` (dropped .glb, `layout.box`, sockets), `trees` (scatter, templates), `voxel-terrain` (blocks).
2. Place it: as a scene row in `places/<place>/cells/x<cx>z<cz>.scene` (keyed by `feetPosition`), or at runtime `ctx.spawn(spec)` (section 3, item 1).
3. Physics: `physics: "static"` for fixed solids; `{ body: "dynamic" }` to move; `physics: { body: "static", trigger: true }` for a volume that reports `onTriggerEnter`.
4. Verify: the skills give no test procedure except spawn-engine (the Spawn client's `--help`, play controls and script logs).

### 5.2 Add a behavior
1. Write `scripts/<name>.js` and export the hooks it needs (section 2.2).
2. Attach it: `behavior: "scripts/<name>.js"` on the row, or `behavior: [...]` on a template.
3. For a per-tick rule, use `update(ctx, dt)`. For a rate, add `export const updateSchedule = { every: N }` and delete any `tick % N` gate. For logic that must run for everyone, put it in `sim.js` (`export const cadence = "1s"`, `export function tick(ctx)`).
4. For interaction, see `interactive-objects`: proximity query in `update()`, a `press` ear, a trigger volume, a state write on another handle, or an animated kinematic motion.
5. Skills: `interactive-objects`, `vehicles`, `projectiles`, `pointer-raycasting`, `physics` (joints), `jev` (decisions).

### 5.3 Add a UI element
1. Write `scripts/ui.js` with `export default function (ctx, player)` returning an HTML string. It is called whenever what it reads moves, at most 30/s.
2. Named exports are page globals for `onclick`. `onMount(container, player)` and `onDestroy(container)` receive `#tome-game-mount`.
3. Send actions with `sendAction(name, payload, { down, relockPointer })` and axes with `sendAxis(name, value)`. Behavior sees them in `onInput` as `input.pressed.<name>`, `input.held.<name>`, `input.axes.<name>`.
4. Respect the right rail: `right: calc(var(--spawn-chrome-reservation-right-inset, 50px) + 24px)` for right-edge plates across its rows; `right: 24px` above and below. Never hide, move or cover the rail.
5. World signs and plates: `<div face="front" width="1.6m" style="font-size:140px">` or `data-world-anchor="<id>"` with `data-anchor-offset="x y z"`.
6. Skill: `game-ui`. Sound never lives in HTML, except one mute. A game must not build click-to-start, a tap-for-sound gate, a mic button, a nickname or a login.

### 5.4 Add a place
1. Create `places/<name>/config.yaml` with `mode`, `terrain` or `atmosphere`, `gravity`, `defaultSpawnPoint`, `worldBounds`, and any `instance`, `persistence`. Place cells go in `places/<name>/cells/`.
2. Enter it with `ctx.enterPlace({ place: "<name>", at: "default" })` or with a door (`ctx.cross`). `at` takes `PositionSpec | "last" | "default"`; `createIfMissing` creates it.
3. Rooms and instances: `instance: "party" | "solo" | "shared"`, `persistence: "ephemeral" | "session" | "persistent"` (`routing.persistence` default `"persistent"`). A routing script exports `pickRoom(ctx)` and imports `builtin/room-routing` (`firstOpenRoom`, `mostFullWithSpace`, `nextRoomName`, `roomFor`). `routing.maxPlayers` is one cap for every room.
4. Skills: `rooms-and-matchmaking`, `2d-mode` (2D places), `voxel-terrain`, `heightmap-terrain`.

### 5.5 Add a portal
1. Spawn a gate: `{ id, tags: ["portal"], behavior: "scripts/gate.js", state: { link: "+cellar#gate-west" }, rotation: 90, primitive: { kind: "arch", width, height, depth }, physics: { body: "static", trigger: true }, material: { kind: "scripted", script: "engine/portal-ember", view: { link, spill, sound } } }`.
2. In `scripts/gate.js`: `onTriggerEnter(ctx, other) { ctx.cross(other, ctx.self.state.link); }`; `onCross(ctx, other)`; `onRefuse(ctx, other, verdict)` (`verdict.message`).
3. Links: `"+cellar#gate-west"` (place plus spawn), `"@ress/cathedral +main"`, `"world:" + ...`, `player.den` (per-player door). Exit: `#exit` written on both gates.
4. Presets: `script: "engine/portal-<name>"` with glass, water, ember, ink, veil, mirror-break, pixel, stained-glass, static, starfield, aurora, honeycomb, oil-slick. `params: { warp: 1 }` restores the whole-glass look.
5. Carry: `returnDoor` on arrival place `{ lifetime }` (30 s default) or `false`. `policy.admits`, else `visitorsCarry: true` in `world.config.yaml` (default off). Refused items are in `player.pocket`.
6. Gotchas: pairs of gates sized alike and facing the approach side (a gate faces -Z at rotation 0). A latch makes a player who turns around walk back until clear.
7. Skill: `portals`.

### 5.6 Save player data
1. Seed once: `player.state.run ??= { ... }`. Never `= ...` on spawn; it throws the save away.
2. Reset: `player.state = {}` (in own behavior `ctx.self.state = {}`).
3. Write in one tick with no await between: the writes save as one piece.
4. Keep large collections as a record keyed by id; a list or string is one value and every change saves it whole (api-a, State gotcha).
5. Cross-player and durable data: SQL. `scripts/db.js` exports `async function migrate(sql)` (idempotent DDL). Run SQL at events, never per tick, e.g. `` ctx.sql`UPDATE boards SET score = ${s} WHERE id = ${id}` ``. Dev and live are two databases; seed live with `INSERT ... ON CONFLICT DO NOTHING`.
6. Cheat-proof keys: `platformState: ["gold", "inventory"]` on the player template.
7. Purchases: `player.state.purchases[buyableId]` (platform-owned; read-only to scripts).
8. Skills: `platform-systems`, `buyables`. Money: `WHERE coins >= ${amount} AND ${amount} > 0`, credit gated on debit's `changes`.

### 5.7 Add a timer
1. One-shot: `const id = ctx.after(seconds, "<export>", payload);` and later `ctx.cancel(id)`. The named export receives `(ctx, payload)`. Check pending timers with `ctx.getTimers(ownerId?)`.
2. Recurring per object: `export const updateSchedule = { every: N }` with `update(ctx, dt)`.
3. Recurring per world: `engine.crons: [{ schedule: "*/5 * * * *", script: "crons/respawn.js" }]` in `world.config.yaml`, with `export async function cron(ctx)` in the file. A minute is the finest step.
4. Deadlines: use `ctx.now()` for game deadlines and `ctx.random()` for game randomness.
5. Skills: `platform-systems` (crons, `ctx.after`), `rooms-and-matchmaking` (`alwaysOn` runs owed crons and due `ctx.after` every 15 minutes for 24 hours after the last player leaves).

## 6. Gotchas and known inconsistencies (with source)

### 6.1 Documented gotchas (by area)
- Hooks and timing: `update()` runs only near players (about 500 m). Declaring `every` replaces a `tick % N` gate; never keep both. `dt` equals the cadence step. (api-b, Behavior Hooks)
- Lifecycle: `ctx.destroy(id?)` with no id is listed but its effect is not stated. `force` on destroy is not described. (api-a, Lifecycle; gap)
- State: a list or string is one value, saved whole. `player.state` loads whole at every join. (api-a, State)
- Joints: `strength` 0 or absent means no drive; a driven joint keeps bodies awake. (api-b, JointOptions)
- Physics: `height` in capsules is end to end and multiplied by scale. (api-b, ObjectPropertiesSpec)
- Inputs: a binding reads every connected gamepad as one; `ui.js` reads each with `navigator.getGamepads()`; behavior scripts have no gamepad access. Tab is reserved. `pointerLocked` acquisition has no pulse; watch the axis rise. (api-b, Inputs; EngineInputAxes)
- Places: a place's `timeScale` 0 freezes only its simulation. (api-b)
- Water: `waveHeightScale` 0 is flat; a fall is aerated regardless of `foamStrength`. (api-b, WaterMaterialSpec)
- Raycast: `raycast` defaults to 200 m and ignores the caller. `faceIndex` only on drawn-triangle hits. (api-b, builtin/physics; RaycastHit)
- Overlap: `overlapPoint` and `overlapSegment` return intersecting collider volumes; a mesh collider of a static model is a surface, so overlap inside it answers nothing. (api-b; pointer-raycasting)
- Nav: `findPath` `ok: false` is a cut-off path to the reachable spot nearest the goal; `partial: true` means ask again later; an empty list with no `partial` means no path. `maxDrop` default 3 m. (api-b, builtin/nav)
- Physics world: `createWorld(opts)` takes no ctx and moves only on `step(dt)`. A 50-body step costs about 1.5 ms on a phone. (api-b, builtin/physics)
- Trade: both sides must call `ctx.trade`; never a lock, timer or escrow object. (interactive-objects)
- Camera rigs: never `{ source: "script" }` with `pointerLock: false` on a driven hull; a write to `state.yaw` or `.pitch` turns the look by its offset. (cameras)
- Look: `state.collisionDist` stays unwritten unless the rig owns the cast; arm at most half the narrowest space walked. (cameras)
- Mobile: never hand-roll a DOM stick or chip the surface offers; renaming `moveX`/`moveZ` removes the stick; verbs past the cap of 4 chips drop with a log. (mobile-controls)
- UI: a render throw blanks the HUD until one succeeds; `.plate` never sets `position` or `display`; invisible elements still catch clicks; `system-ui` throws away the face; Escape frees a locked cursor and closes Spawn's chat, so the game must not open anything on Escape. (game-ui)
- Projectiles: `getObjectSocket` returns the world point as drawn; a physics entity crossing a door is wrong for a bullet. (projectiles, portals)
- Fx: `stretch` is seconds of travel (0.02 on a stalk; 0.1 reads as hay). `count: N` holds until destroyed; a moving emitter leaves particles unless `inheritVelocity`, `space: "local"` or `attachTo` is used. (fx)
- Vehicles: loads move no kinematic body; per-tick `rotation` or `velocity` writes undo aircraft loads; a mid-ride script edit re-runs `onSpawn` and `onControlBegin`. (vehicles)
- Voxels: `voxels.fill` fires no per-cell hooks; `onBreak` fires per-cell breaks only; `"air"` is empty and must never be a material; only `=== false` confirms empty (null means unknown). (voxel-terrain)
- Platform: `onLeave` may run on Spawn's machine if the tab dies; keep it one fast call. `ctx.sql` calls queue one at a time. `@caller` errors `statement_not_player_invocable` where unbound. (platform-systems)
- Buyables: a failed purchase never reaches world code (no failure hook); do not put a sql or job inside `onPurchase`. (buyables)
- Player settings: `defaults.accessibility` may only be true; `caps.accessibility` is never legal; quality is never pinned. (player-settings)
- Rooms: a write or `run_script` changes the one tree every room boots from; an edit from a match room empties every room. `getObject(them)` is null from another place. (rooms-and-matchmaking)
- Portals: latch, round trip for physics entities crossing a door, far world's save wins for keys it holds. (portals)
- Terrain: `heightAt` runs about 17k times per 80 m chunk; a track or river is a mark, never a loop. `material: { kind: "water" }` is a picture; nothing swims. Walking stops past 45 degrees on a graded path. (heightmap-terrain)
- Geometry: `collider(ctx)` is the shell a body touches; opaque faces draw both sides; never add a second copy facing back. (geometry)
- 2D: 2d-top has no ground collider, ever; never flip a sprite for facing; every paint redraws the whole picture. (2d-mode)
- Uploaded models: `ctx.attach` is for piece swap only; a `{ bone }` or `{ socket }` attachment written first rides its anchor once loaded. (uploaded-models)
- Fields: bulk field read is not a save; dug ground keeps by default. A material's weight adds to natural ground. (heightmap-terrain)

### 6.2 Inconsistencies between the notes and the docs
1. Pin: `pin-and-untracked.md` and the clone engine.yaml now agree: `sha256: b5d10e377d04...` with HEAD `eb0aad2`. The sha256 prefix matches the kernel prefix in each commit subject (observed). Whether "kernel" and "engine build" are the same artifact is inferred from the matching prefix.
2. `api-reference.md` is present in the clone (`.spawn/engine/api-reference.md`, 116.8K, 68 `##` headings). Notes in `skills-b.md` (gaps) and `README.md` say it is not in the clone; that is wrong. The notes' line counts (2277 lines) match the file.
3. Texture default: `heightmap-terrain.md` says `textureScale` default 2.5 m per tile; api-b `StandardMaterialSpec` says default 1 meter per tile under `wrap: "repeat"`. The two scopes may differ (terrain material vs object material); not resolved by the docs.
4. Art path form: `scripts/buyables/*.js` and `scripts/ex/car77-gate.js` use `/cdn/...` (leading slash, observed); `places/main/config.yaml` and cell rows use `cdn/texture-...` (no slash, observed). The engine docs write `cdn/...` throughout (api-b, Asset fields in api-a). The resolver's handling of the leading slash is not stated.
5. Material vocabulary: most cell rows use `texture`, `repeat`, `wrap`; `cm44-path-n` uses `key: Std/PBR`, `map`, `mapRepeat`, `textureWrapMode` and an integer `tint` (observed). The api-b material spec uses `albedo`, `tint` (OKLCH string). Not reconciled.
6. Phantom skill: `scripts/lighting.js` names a "looks" skill; `skills.md` lists 23 ids and none is `looks` (observed). The postfx look is documented in api-b (`builtin/postfx`).
7. Hook names used by game-6 but not in the engine's behavior list: none for `onInput`, `onOutOfBounds`, `onTriggerEnter`, `onLeave`, `onPurchase`, `onMount`, `onDestroy`, `ears`, `scopes`, `cadence` (all are in the docs, api-a/api-b or skills). `onSpawn` is documented in api-b. Observed in game-6 but absent from the docs: none found in the read set.
8. Undocumented ctx members observed in game-6 read set: `ctx.sleep`, `ctx.job`, `ctx.proposePurchase`, `ctx.changed`, `ctx.worldToScreen`, `ctx.purchase`, `ctx.player`, `ctx.requestedRoomId`, `ctx.rooms`, `ctx.rejectedRooms`, `ctx.self.view`, `ctx.self.target`, `ctx.self.controlling`, `ctx.self.hideLocalPlayer`, `ctx.self.worldFeetPosition`, `ctx.self.bounds`. All except `ctx.sleep` and `ctx.purchase` appear in api-a or api-b; `ctx.sleep` behavior and `ctx.purchase` fields are not stated.
9. `ctx.emit` options: game-6 uses `{ to }` and `{ audience: { player } }` (observed); both appear in api-a's `ctx.emit` signature.
10. Object id forms: `ctx.getObject(player.id + "/" + id)` (game-6 `scripts/lib/alpine-hat.js`) and scene ids like `object/x06206b45542ac2ec/4` are not described by the notes.
11. Engine-path script: `material.script: engine/portal-aurora` refers to a path outside the tree; inferred to be an engine-supplied preset (portals skill lists `engine/portal-aurora` among presets).
12. Nametag: game-6 `ui/nametag.js` comment says earshot comes from `world.config.yaml`; the config has no `earshot` key; the cell reads `ctx.world.earshot ?? 40` (observed). Not in the docs.
13. Game-6 `scripts/ui.js` hardcodes `TOTAL = 166` (observed); it will drift.
14. Game-6 `scripts/chat.js` comment mentions `ctx.emit("say", ...)` which the emitter did not show (observed).
15. Routing: `scripts/routing.js` is not wired; `world.config.yaml` has no routing block (observed). Routing is documented in rooms-and-matchmaking.
16. Sim cadence format: `sim.js` uses `"1s"` and `places/main/sim.js` uses `"250ms"`; both used in game-6 (observed). The docs do not list accepted formats.
17. Spline rows at the origin: game-6 `w7-*` splines have feetPosition (0,0,0) with far points (observed); allowed by the cell rule, unusual.
18. `scripts/ex/w7/index.js` (named in a plan) does not exist (observed); `shop.js` also does not exist at the top level of `scripts/` (observed).
19. Stale status in game-6 `.spawn/agent-interface.md` (observed in the world, not the engine) says `design.md` is absent; it exists.
20. Heightmap `verticalRange` shape: skills write `{ min, max }`; the terrain spec lists `verticalRange?` with no shape. Consistent with the skill example.

### 6.3 Gaps (not stated by the docs)
- `ctx.destroy(id?)` with no id; `force` option.
- `ctx.commit(message?, fn)`: fn signature.
- `ctx.trade` fields `mine`, `with`, `for`: the full `TradeReceipt` is `offered: true` (with `id`, `give`, `with`, `for`) or `offered: false` with `refused` and `message` (interactive-objects); the input shape is only typed.
- `ctx.sleep(seconds?)`: behavior.
- `ctx.self.anim.<ch>` channel fields.
- `ctx.sql` (SqlAPI) methods beyond size, backup and restore.
- `ctx.notifyDmOnce` dedupe semantics.
- Defaults for most `builtin/noise`, `builtin/water`, `builtin/three` helpers, and terrain mark fields.
- `CameraCommon.behavior` and `layers` defaults.
- `ObjectView.parent` and `children` semantics (inferred from names).
- Named types `Quat`, `Vec3Like`, `Seconds`, `ObjectAPI`, `Bus`, `EdgeHint`, `SessionOutfit`, `SessionWisp`, `DrawMaterialOverrides`, `DrawMaterialParamTable`, `CrossOutcome`, `CrossVerdict`, `CrossingTerminalState`, `TouchSurfaceDef`, `MarkShape` (defined in skills), `TerrainMarkSpec`, `LiquidSpec`, `EnvView`, `EnvFlow` are referenced but not defined in the read docs.
- `spawn api GeometryContext`, `spawn api TextureScript`, `spawn api TerrainHeightmapDef`, `spawn api builtin/water`: runtime forms are not in the clone.
- The kernel source is not in the clone; no engine internals are stated or verified here.
- Test or verify steps: none in the skills except spawn-engine (client `--help`, play controls, script logs) and `?touch=1` for mobile.
- Hook ordering across `onSpawn`, `update`, `lateUpdate`, `onCollide`, `onInput` is not stated.

## 7. Where to look

- Netcode, lag compensation, compression, wire/boot accounting and systems optimizations: `netcode-and-optimization.md`.

- Physics solver phases, counters, LOD/streaming/culling strategies and runtime performance budgets: `physics-and-optimization.md` (new in this round; it closes the physics/optimization gaps).

| File | Covers |
|---|---|
| ENGINE.md (this file) | Entry point: model, hooks, quick reference, spec shapes, recipes, gotchas, where to look. |
| api-a.md | `api-reference.md` lines 1-425 (headings 1 to 34): preamble conventions, identity, state, properties, movement, terrain, splines, camera, selection, player, timing, jobs, database, clock, changed cursor, random, logging, events, spec patches, world queries, places, object access, lifecycle, spec mutation, control, trade, joints, ragdoll, hierarchy, DM hooks, juice, animation mixer, self, local player, spine. |
| api-b.md | `api-reference.md` lines 426-2277 (headings 35 to 68): compat state and properties, second world queries, behavior hooks, object spec shapes (ObjectPropertiesSpec, PrimitiveSpec, AtmosphereDef, TerrainDef, Inputs, ObjectSpec, Parenting, UI rules), named types, and the `builtin/*` modules. |
| skills-a.md | 12 skill guides: 2d-mode, buyables, cameras, fx, game-ui, geometry, heightmap-terrain, interactive-objects, jev, leaf-sprays, mobile-controls, physics. |
| skills-b.md | 11 skill guides: platform-systems, player-settings, pointer-raycasting, portals, projectiles, rooms-and-matchmaking, spawn-engine, trees, uploaded-models, vehicles, voxel-terrain; plus `skills.md` and engine `README.md`. |
| world-usage.md | How game-6 (the Savi Gallery) uses the engine: file layout, ctx call catalog and counts (read set only), hook and export names, scene and template conventions, input and UI wiring, inconsistencies with the API reference. |
| pin-and-untracked.md | `engine.yaml` pin (stale sha256 in that note; live value in section 1 above), recent engine commits, and the untracked `keys.py` and `probe.sh` in the engine clone. |
| README.md | Index of this folder with file sizes and the gitignore note. |

Live engine files (outside this folder): `/workspace/savi/.spawn/engine/api-reference.md` (API), `/workspace/savi/.spawn/engine/skills/<id>.md` (guides, 23 files), `/workspace/savi/.spawn/engine/skills.md` (index), `/workspace/savi/.spawn/engine/engine.yaml` (pin), `/workspace/savi/.spawn/engine/README.md`.

## Live facts (probe 2026-11-05, engine 173ce246 / ac91f61a)

- ctx.spawn takes one spec object (or id, spec). Spec keys: feetPosition, primitive: { kind, size }, lifetime, parent, children, tags, state, behavior, place, audience, visibility, tick. name and position are NOT keys: the engine drops them with a warning.
- primitive uses "kind" (box, sphere, ...), not "type".
- ctx.spawn returns an id like "object/<hash>/0". ctx.getObject(id) finds it at once; ctx.destroy(id) removes it at once, and the destroyed-spawn provenance lists it (destroyedCount).
- ctx.destroy has arity 0 in exec; the force option is documented in api-reference.md:301.
- ctx.sql is a tagged template. Inline statements are refused unless they are saved in a world script (law.sql.statement-not-published).
- ctx.world and ctx.place hold 51 and 36 fields. Verbs print as ProxyObject: their source is not readable.
- Log warnings: a tree-derived entity written locally "re-asserts on the wire" (ex/chime.js, ex/marmot.js); a cell whose terrain chunk is not streamed holds its pose with no gravity (terrain-support-hold).
- Hook order measured in preview rooms: onSpawn -> onInput -> update on the spawn tick, then onTriggerEnter and onCollide on later ticks; ears.press on emit. The kernel catalog and aliases are in kernel-worker.md.
