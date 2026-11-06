# Engine API reference, first half (api-a)

Source: /workspace/savi/.spawn/engine/api-reference.md (2277 lines, 68 `##` headings). This file covers the first 34 headings, lines 32-425.

## Index

Preamble (lines 1-30, not a heading): coordinates, hook signatures, ctx.spawn/ctx.destroy, behavior paths, after-hook.
1. Identity - line 32
2. State - line 45
3. Properties - line 85
4. Movement - line 93
5. Terrain - line 114
6. Splines - line 129
7. Camera - line 135
8. Selection - line 146
9. Player - line 155
10. Timing - line 161
11. Jobs - line 173
12. Database - line 184
13. Clock - line 190
14. The Changed Cursor (Sim.Js) - line 196
15. Random - line 202
16. Logging - line 208
17. Events - line 216
18. Spec Patches & Scripts - line 224
19. World Queries - line 250
20. Places - line 261
21. Object Access - line 271
22. Lifecycle - line 294
23. Spec Mutation (God Mode) - line 305
24. Control - line 311
25. Trade - line 321
26. Joints - line 327
27. Ragdoll - line 336
28. Hierarchy - line 343
29. DM Hooks - line 351
30. Juice - line 358
31. Animation Mixer - line 380
32. Self - line 387
33. The Local Player (On A Camera Rig Alone) - line 413
34. The Spine (The Same Members Every Behavior Ctx Carries) - line 419

## Preamble conventions (lines 1-30)

- Coordinates are meters, Y up, negative Z forward. Rotations are degrees unless a field says otherwise. Hook dt is seconds; ctx.now() is milliseconds on the world clock.
- Behavior hooks: `onSpawn(ctx)`, `update(ctx, dt)`, `onCollide(ctx, other, contact)`. `ctx.self` is the object. Read another object with `ctx.getObject(id)`; select with `ctx.query(selector)`. Assigning a property on a handle changes it.
- On a 6.0 world: `ctx.spawn(spec)` creates, `ctx.destroy(id)` removes. A behavior path names a module in the world's scripts directory; export the named hooks from it.
- `physics` omitted gives no collider; `"static"` is a fixed solid; `"dynamic"` is a moving body. `feetPosition` is bottom center; flat primitives use their center. Parent-relative positions/rotations are local to the parent.
- Runtime behavior edits change the running game. Authored file edits and `ctx.commit(message, fn)` save to the world's tree.
- Save scopes: `player.state` is the player's saved data; `ctx.world.state` is shared within the room; `ctx.session` is local scratch.
- Use `ctx.now()` for game deadlines and `ctx.random()` for game randomness. `ctx.after(seconds, exportName, payload)` calls a named export after seconds.
- Asset fields hold CDN names or uploaded asset references. A reference to a file in the world's tree must name an existing file.
- Import functions from `builtin/<module>`. The docs door answers one section with `?section=<heading>`, lists headings with `sections`, and all with `?section=all`.
- A `?` in a field marks it optional. `=` in a field gives the engine default when the field is omitted.

## Identity and player records (lines 32-43)

Purpose: stable identity for players and objects.
- `player.userId`: use for saved player records. The player entity id changes on each join.
- `getObject` returns `null` when the object does not exist.
- `player.arrival.request`: `{ room, query }`, what the opened link asked for. `query` holds the game's own words, carried by the link's single `linkQuery` parameter. Example: `https://spawn.co/@you/game?linkQuery=tab%3Dshop` reads `{ tab: "shop" }`. No other query-string word reaches the game. Read it in `onArrive(ctx, player)`.
- Signatures (verbatim): `ctx.self.id`, `<player>.userId`, `<entity>.objectId`, `<entity>.arrival: { kind: "join" | "rejoin" | "link" | "respawn", link?, from?, through?, request? }`, `<entity>.pocket`, `<player>.isLocal`.

## State (lines 44-83)

Purpose: read and write per-object, per-player, per-room and per-session data.
- Assigning an entire state object replaces it. Assigning a field changes only that field. Deleting a field clears it.
- Changes made through game handles are shared.
- `player.state` has no size cap, nests to any depth, and loads whole at every join.
- Gotcha: a list or string is one value; every change sends and saves it whole. Keep large collections as a record keyed by id.
- Signatures: `ctx.self.state.*`, `ctx.state = ctx.self.state`, `ctx.self.session.*`, `ctx.world`, `ctx.world.state: Record<string, unknown>`, `ctx.world.camera: Record<string, unknown>`, `ctx.world.inputs: Record<string, unknown>`, `ctx.world.assets: Record<string, AssetMetadata | undefined>`, `ctx.world.mode: "dev" | "live"`, `ctx.world.version: number | null`, `ctx.world.id: string | null`, `ctx.world.address: string | null`, `ctx.world.players: PlayerQueryResult[]`, `ctx.world.playerCount: number`, `ctx.world.onlineCount: number`, `ctx.world.date: string`, `ctx.world.places: PlacesCollection`, `ctx.world.engine: EngineConfig`, `ctx.world.passThrough: Record<string, string[]>`, `ctx.world.routing: RoutingDef`, `ctx.world.ui: Record<string, unknown>`, `ctx.world.player: Record<string, unknown>`, `ctx.world.godMode: Record<string, unknown>`, `ctx.world.creatorTabs: CreatorTabDef[]`, `ctx.world.defaultPlace: string`, `ctx.world.settling: boolean`, `ctx.world.files: readonly string[]`, `ctx.session.*`.
- `ctx.files.read(path)` / `.write(path, text)` / `.delete(path)`.
- `ctx.view.camera = { eye, aim, fov } | { parent: id, eye, aim, fov } | null`.
- Also listed without type: `ctx.quality`, `ctx.self`, `ctx.place`.

## Properties (lines 84-91)

- `ctx.self.<prop>` (read and assign `ctx.self.<prop> = v`).
- `ctx.self.bounds: { min, max, size, center, obb, geometryPending? } | null`.

## Movement (lines 92-111)

Purpose: velocity, forces, grounding and contact.
- Velocity is meters per second. Force is newtons; torque is newton-meters, on world axes.
- `forces` holds named forces until a key is cleared with `null`. Dynamic bodies accept forces.
- A character body standing on a moving kinematic platform rides it: the engine carries it, and its velocity is relative to the platform.
- Signatures: `ctx.self.grounded`, `ctx.self.touching.wallLeft/.wallRight`, `ctx.self.touching.ceiling`, `ctx.self.velocity` (get and set), `ctx.self.forces.<key> = { force?, position?, torque? }`, `<entity>.velocity` (get and set), `ctx.self.angularVelocity` (get and set), `<entity>.angularVelocity = v`, `ctx.self.liquid.in`, `ctx.self.liquid.level`, `ctx.self.overlapping`.

## Terrain (lines 113-126)

Purpose: water, terrain fields and surface normals.
- `ctx.getWaterLevelAt(x: number, z: number, place?: string): number | null`.
- `ctx.readField(name: string, x: number, z: number, place?: string): number`.
- `ctx.getTerrainNormal(x: number, z: number, place?: string): Vec3 | null`.
- Field chunks: `ctx.place.fields[name].runtime[chunk]` (read, assign `{ ...grid, cells }`, or `.cells = next`, or `delete`). `ctx.place.fields[name].authored[chunk] = { ...grid, cells }`. `Object.keys(ctx.place.fields[name].runtime)`. `ctx.place.fields[name].changes(at): { chunks, at }`.
- Gotcha stated: runtime and authored are separate; only the authored write is a file-tree edit (inferred from the doc's split of the two lists).

## Splines (lines 128-132)

- `ctx.self.spline = { id, at, orient?, offset? }`.

## Camera (lines 134-143)

- `ctx.world.camera` plus derived live reads `forward`, `fov`, `aspect`, `insetRight`. `aspect` is this screen's width divided by height. `insetRight` is the share (0..1) of that width that Spawn's rail covers at the right edge. Doc points to `skill:cameras` for more.
- `ctx.worldToScreen(position: Vec3): { x: number; y: number; depth: number; onScreen: boolean } | null`.
- `<player>.camera = {…}` and `<player>.camera = null`.
- `<player>.isGodMode`, `<player>.isEditor`.

## Selection (lines 145-152)

- `<player>.selection?.id`; `<player>.selection = entity | id`; `<player>.selection = null`.
- Gotcha stated: clear guarded by id: `if (p.selection?.id === x) p.selection = null`, so a late clear does not wipe a newer selection.
- `delete <player>.selection` or `= null`.

## Player (lines 154-158)

- `<player>.displayName`.

## Timing (lines 160-170)

Purpose: deferred work and tick deltas.
- `after` takes seconds and a named hook export. Its callback receives `(ctx, payload)`. `cancel` takes the returned timer id. `now` returns milliseconds.
- Signatures: `dt`, `ctx.dtMs`, `ctx.gapMs`, `ctx.after(seconds: number, hookExport: string, payload?: unknown): string`, `ctx.cancel(id: string): void`, `ctx.getTimers(ownerId?: string): Array<{ id: number | string; ownerId: string; dueInTicks: number; dueInSeconds: number; engineOwned: boolean; hook?: string }>`, `ctx.world.settling`.

## Jobs (lines 172-181)

Purpose: async engine jobs (LLM, mail, chat, player data, text check, image work).
- Job ids: `llm:chat`, `llm:generate`, `llm:clear`, `jev:decide`, `mail:send`, `chat:send`, `chat:history`, `player:token`, `player:names`, `text:check`, `image:generate`, `image:segment`.
- `image:generate`: args `{ prompt, width, height, transparent, tile }`. `width` and `height` are pixels; default 1536 by 1024 when unset. `tile: true` gives an opaque texture that repeats both ways with no seam. Data: `{ name, url, width, height }`; `url` is written as any texture. Gotcha stated: one picture per player per game; a player's next ask answers `paint_spent`, so keep the url in `player.state`.
- `image:segment`: args `{ image, prompt, points }`. `image` is a picture address or data URL; `prompt` names what to find; `points` is `[{ x, y, label }]` in the picture's pixels. Data: `{ masks: [{ name, url, width, height, box, score }] }`, one black-and-white PNG per thing, white where it is; `box` is its bounds in picture pixels.
- Signatures: `ctx.job<T>(jobId: string, args: Record<string, unknown>, callback?: (result: JobResult<T>) => void, options?: JobOptions): string`; `ctx.job(jobId: string, args: Record<string, unknown>, hookExport: string, payload?: unknown): string`; `ctx.awaitJob<T>(requestId: string): Promise<JobResult<T>>`; `ctx.proposePurchase(buyer: string | { readonly id: string }, itemId: string): string`.

## Database (lines 183-187)

- `ctx.sql: SqlAPI`. The doc gives no further detail in this section.

## Clock (lines 189-193)

- `ctx.now()`, milliseconds on the world clock.

## The Changed Cursor (Sim.Js) (lines 195-199)

- `ctx.changed(glob): { path, value, prev }[]`. Returns changed paths matching a glob, with new value and previous value.

## Random (lines 201-205)

- `ctx.random()`. Use for game randomness (per the preamble).

## Logging (lines 207-214)

- `ctx.log(...args: unknown[]): void`, `ctx.warn(...args: unknown[]): void`, `ctx.error(...args: unknown[]): void`.

## Events (lines 216-222)

- `ctx.emit<K extends ActName>(name: K, payload: ActPayloads[K], options?: { audience?: Audience }): string | void`.
- `ctx.emit(name: string, payload?: unknown, options?: { place?: string; to?: string; via?: string; audience?: Audience }): string | void`.
- `ctx.on(name: string, handler: TomeEventHandler, options?: TomeEventOptions): () => void` (returns unsubscribe).

## Spec Patches & Scripts (lines 224-248)

Purpose: patch world, place and god-mode specs from scripts.
- Patch targets: `ctx.place.atmosphere.*`, `ctx.world.player.*`, `ctx.world.camera.* = …`, `ctx.world.inputs.* = …`, `ctx.world.ui.render = 'scripts/hud.js'`, `ctx.world.creatorTabs`, `ctx.world.engine.* = …`, `ctx.world.defaultPlace = 'lobby' | ctx.world.places.lobby`.
- `ctx.resolveControls(surface?: string): { surface: TouchSurfaceDef; diagnostics: Array<{ code: string; message: string }> }`.
- God mode: `ctx.world.godMode.* = …` with keys `enabled`, `scope`, `behavior`, `brushes.<id>`, `movement.flySpeed`, `movement.sprintMultiplier`, `movement.verticalSpeed`, `camera.fov`, `visuals.disableFog`. Gotcha stated: a root assignment replaces, a `.leaf` assignment merges; a brush is validated as the brush that will stand.
- Routing: `ctx.world.routing = { script, maxPlayers } | null`; `.maxPlayers = 8` writes one key; `= null` turns routing off.
- Buyables: `ctx.world.buyables.<id> = { name, priceSpoins, minSpoins?, imageUrl?, description?, onPurchase? }`; `ctx.world.buyables.<id>.<field> = v`; `delete ctx.world.buyables.<id>` (or `= null`); `Object.keys(ctx.world.buyables)`; `'x' in ctx.world.buyables`.
- Brushes: `ctx.world.godMode.brushes.<id> = { paintScript, label, icon, color?, defaultRadius, defaultStrength, feather?, field? }`.
- Places: `ctx.world.places.<p> = { mode, terrain, atmosphere, objects, … }`; `ctx.place.<dial> = …` or `ctx.world.places.<p>.<dial>.<leaf> = …`; `delete ctx.world.places.<p>`.

## World Queries (lines 250-259)

- `ctx.query` excludes self by default; `ignoreSelf: false` includes it.
- `ctx.query(opts: ObjectQueryOptions & { select: "ids" }): string[]`; `ctx.query(opts: CrossingScopeQueryOptions): CrossingRecord[]`; `ctx.query(opts: ObjectQueryOptions): ObjectView[]`.
- `ctx.place.players` lists the current place's players.
- Note: this heading name repeats at line 441 (second "World Queries" section, a separate list).

## Places (lines 261-269)

- `ctx.enterPlace(options: EnterPlaceOptions): string | null`; `ctx.enterPlace(entityId: string, options: EnterPlaceOptions): string | null`.
- `<entity>.place`, `<player>.place`, `ctx.place.objects`.

## Object Access (lines 271-292)

- `ctx.getRoomId(): string`.
- `ctx.presence(userIds: ReadonlyArray<string | { readonly userId: string }>): Promise<readonly PresenceRow[]>`.
- `ctx.getObject(id: string): ObjectView | null`.
- `ctx.getVibeAudio(id: string): VibeAudioSnapshot | null`.
- `ctx.getObjectBoneNames(id: string): BoneNamesResult`; `ctx.getObjectMorphTargetNames(id: string): MorphTargetNamesResult`.
- `ctx.getObjectSocket(id: string, name: string): { position: Vec3; direction: Vec3; confidence: number } | null`.
- Tiles: `ctx.place.tiles[x][y] = id`; `= 0`; `delete ctx.place.tiles[x][y]`; read `ctx.place.tiles[x][y]`.
- Also: `<entity>.state.*`, `ctx.self.audio.params.<name> = v`, `<entity>.<prop>` (get and set), `<entity>.children`, `ctx.world.mode`.

## Lifecycle (lines 294-303)

Purpose: create and remove objects.
- `ctx.spawn(spec: ObjectSpec): string`; `ctx.spawn(id: string, spec: ObjectSpec): string`.
- `ctx.destroy(id?: string): void`; `ctx.destroy(ids: string[]): void`; `ctx.destroy(id: string, options: { force?: boolean }): void`; `ctx.destroy(ids: string[], options: { force?: boolean }): void`.
- `force` is listed as optional; the doc does not say what it overrides (gap).
- Gap: `ctx.destroy(id?)` with no id is listed; the doc does not say what it destroys.

## Spec Mutation (God Mode) (lines 305-309)

- `ctx.commit(message?, fn)`. Saves a change to the world's tree (per preamble). The doc does not give fn's signature (gap).

## Control (lines 311-319)

Purpose: hand an object to a controller.
- `<entity>.controller = ctx.self.id`; `<entity>.controller = null`; `<entity>.controller = playerId`.
- `ctx.self.controller`; `ctx.self.controlling`.

## Trade (lines 321-325)

- `ctx.trade(mine: string, opts: { with: string; for: string } | null): TradeReceipt`.
- Doc gives no more detail (gap: what `mine`, `with`, `for` refer to beyond their types, and `TradeReceipt` shape).

## Joints (lines 327-334)

- `ctx.self.joints[id] = { to, type, … }`; `delete ctx.self.joints[id]`.
- `ctx.self.joints[id].motor = { velocity, maxForce }`; `ctx.self.joints[id].limits = [min, max]`.

## Ragdoll (lines 336-341)

- `ctx.self.ragdoll = {…}`; `ctx.self.ragdoll = null` releases it.

## Hierarchy (lines 343-349)

- `ctx.self.parent`.
- `ctx.attach(entity: string | { readonly id: string }, parent: string | { readonly id: string } | null, offset?: { position?: Vec3; rotation?: RotationSpec; scale?: Vec3; pivot?: PivotSpec; attachment?: ObjectAttachmentSpec | null; replaces?: string }): void`.
- `ctx.sleep(seconds?)`. Doc gives no detail on what sleep does (gap).

## DM Hooks (lines 351-356)

- `ctx.notifyDm(message: string, options?: NotifyDmOptions): void`.
- `ctx.notifyDmOnce(key: string, message?: string, options?: NotifyDmOptions): void`. The "once" key form is per the name only (inferred dedupe by key; not stated).

## Juice (lines 358-378)

Purpose: screen effects and audio per player.
- Gotcha stated: a layer pushed onto `<player>.look` fades in over `fade` seconds (default 0.25 when unset; 0 means at once) to its `intensity` (0 to 1, default 1). It fades out the same way when it leaves the list: by `= []`, `.splice`, or at the end of its `duration`.
- `<player>.letterbox = intensity`; `<player>.vignette = intensity | { intensity, color }`; `<player>.effects.<name> = intensity`; `delete <player>.effects.<name>`.
- `<player>.look.push('scripts/look-x.js' | { look, intensity, duration, fade, priority, params })`; `<player>.look = []`.
- `<player>.hidden = [ids]`; `<player>.atmosphere.*`; `delete <player>.atmosphere.<key>`.
- `ctx.stopFx(id: string): void`; `ctx.pulseFx(id: string, name: string, opts?: { at?: Vec3; data?: Record<string, unknown> }): void`; `ctx.getFxState(id: string): FxState | null`.
- `<player>.music = clip | null`; `<player>.ambience = clip | null`; `ctx.music.*`.

## Animation Mixer (lines 380-385)

- `ctx.self.anim.<ch> = {…}`; `ctx.self.anim.<ch>`. The doc gives no field list for the channel (gap).

## Self (lines 387-411)

Purpose: the camera-rig handle `ctx.self`, typed fields.
- `ctx.self.id: string`; `ctx.self.state: TomeCameraState`; `ctx.self.session: Record<string, unknown>`; `ctx.self.feetPosition: Vec3`; `ctx.self.rotation: RotationSpec`; `ctx.self.up: Vec3 | null`; `ctx.self.frame: RotationSpec | string | { readonly id: string } | null`; `ctx.self.target: CameraTargetView | null`; `ctx.self.view: { yaw: number; pitch: number } | undefined`.
- Camera options (all typed optional, nullable): `pointerLock?: boolean | "drag" | { drag: "left" | "right" | "middle" } | { unadjustedMovement: boolean } | null`; `fov?: number | null`; `clip?: { near?: number | null; far?: number | null } | null`; `orientation?: CameraOrientationDef | null`; `sensitivity?: number | null`; `minPitch?: number | null`; `maxPitch?: number | null`; `pixelSnap?: boolean | null`; `hideLocalPlayer?: boolean | null`; `projection?: "perspective" | "orthographic" | null`; `layers?: string[] | null`.
- Defaults for these optional fields are not stated here (gap).

## The Local Player (On A Camera Rig Alone) (lines 413-417)

- `ctx.player`. Doc gives no more detail.

## The Spine (The Same Members Every Behavior Ctx Carries) (lines 419-424)

- `ctx.place` and `ctx.world`: the members every behavior ctx carries (per heading).

## Named-type references used here (not defined in this half)

Vec3, RotationSpec, PivotSpec, ObjectAttachmentSpec, ObjectSpec, ObjectQueryOptions, CrossingScopeQueryOptions, CrossingRecord, ObjectView, JobResult, JobOptions, EnterPlaceOptions, NotifyDmOptions, TradeReceipt, TomeEventHandler, TomeEventOptions, ActName, ActPayloads, Audience, SqlAPI, PlacesCollection, EngineConfig, RoutingDef, CreatorTabDef, AssetMetadata, PlayerQueryResult, PresenceRow, VibeAudioSnapshot, BoneNamesResult, MorphTargetNamesResult, FxState, CameraTargetView, CameraOrientationDef, TomeCameraState, TouchSurfaceDef. Their definitions are in the "Named types (full)" section (line 665), outside this half.

## Gaps

- `ctx.destroy(id?)` with no id: effect not stated.
- `ctx.destroy` `force` option: what it overrides not stated.
- `ctx.commit(message?, fn)`: fn signature not stated.
- `ctx.trade` fields `mine`, `with`, `for` and `TradeReceipt` shape not stated.
- `ctx.sleep(seconds?)`: behavior not stated.
- `ctx.self.anim.<ch>` channel fields not stated.
- Optional `ctx.self` camera fields: defaults not stated.
- `ctx.sql` (SqlAPI) methods not stated in this half.
- `ctx.notifyDmOnce` dedupe semantics not stated.
- Named types are defined outside this half (line 665 onward).
