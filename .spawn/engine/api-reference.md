# Spawn game API

Use this reference with the world's guide. The guide gives complete placement and template examples, the world's editing format, and the tools for testing it.

Coordinates use meters, Y up, and negative Z forward. Rotations use degrees unless a field says otherwise. Hook dt is seconds; ctx.now() is milliseconds on the world clock.

Object behavior hooks receive ctx first: onSpawn(ctx), update(ctx, dt), onCollide(ctx, other, contact). ctx.self is the object. Read another object with ctx.getObject(id); select objects with ctx.query(selector). Assign a property on a handle to change it.

On a 6.0 world, ctx.spawn(spec) creates an object. ctx.destroy(id) removes it. A behavior path names a module in the world's scripts directory. Export the named hooks from that module.

physics omitted gives no collider. physics: "static" makes a fixed solid. physics: "dynamic" makes a moving body. feetPosition is the bottom center; flat primitives use their center. Parent-relative positions and rotations are local to the parent.

Runtime behavior edits change the running game. Authored file edits and ctx.commit(message, fn) save changes to the world's tree. player.state is the player's saved data; ctx.world.state is shared within the room; ctx.session is local scratch data.

Use ctx.now() for game deadlines and ctx.random() for game randomness. ctx.after(seconds, exportName, payload) calls a named export after the given seconds.

Asset fields contain CDN names or uploaded asset references. The world's guide gives the upload endpoint. A reference to a file in the world's tree must name a file that exists.

Import supported functions from builtin/<module>. The declarations are the sections after this one, listing the fields, parameters, return shapes, and modules of this version: the docs door answers one section with ?section=<heading>, lists every heading in sections, and answers them all with ?section=all. A question mark marks an optional field. A value after = in a field is the value the engine uses when you omit that field.

This behavior records a timer in object state:

```js
export function onSpawn(ctx) {
  ctx.self.state.startedAt = ctx.now();
}
export function update(ctx, dt) {
  ctx.self.state.elapsedSeconds = (ctx.now() - ctx.self.state.startedAt) / 1000;
}
```

## Identity

Use player.userId for saved player records. The player entity id changes on each join. getObject returns null when the object does not exist. player.arrival.request is what the link the player opened asked for: { room, query }. query holds the game's own words, which the link carries in its one linkQuery word: https://spawn.co/@you/game?linkQuery=tab%3Dshop reads { tab: "shop" }. No other word of the link's query string reaches the game. Read it in onArrive(ctx, player).

```ts
ctx.self.id
<player>.userId
<entity>.objectId
<entity>.arrival: { kind: "join" | "rejoin" | "link" | "respawn", link?, from?, through?, request? }
<entity>.pocket
<player>.isLocal
```

## State

Assigning an entire state object replaces it. Assign a field to change only that field; delete a field to clear it. Changes made through game handles are shared. A player's save, `player.state`, has no size cap and nests to any depth, and it loads whole at every join. A list or a string is one value that every change sends and saves whole, so keep a large collection as a record keyed by id.

```ts
ctx.self.state.*
ctx.state = ctx.self.state
ctx.self.session.*
ctx.world
ctx.world.state: Record<string, unknown>
ctx.world.camera: Record<string, unknown>
ctx.world.inputs: Record<string, unknown>
ctx.world.assets: Record<string, AssetMetadata | undefined>
ctx.world.mode: "dev" | "live"
ctx.world.version: number | null
ctx.world.id: string | null
ctx.world.address: string | null
ctx.world.players: PlayerQueryResult[]
ctx.world.playerCount: number
ctx.world.onlineCount: number
ctx.world.date: string
ctx.world.places: PlacesCollection
ctx.world.engine: EngineConfig
ctx.world.passThrough: Record<string, string[]>
ctx.world.routing: RoutingDef
ctx.world.ui: Record<string, unknown>
ctx.world.player: Record<string, unknown>
ctx.world.godMode: Record<string, unknown>
ctx.world.creatorTabs: CreatorTabDef[]
ctx.world.defaultPlace: string
ctx.world.settling: boolean
ctx.world.files: readonly string[]
ctx.session.*
ctx.files.read(path) / .write(path, text) / .delete(path)
ctx.view.camera = { eye, aim, fov } | { parent: id, eye, aim, fov } | null
ctx.quality
ctx.self
ctx.place
```

## Properties

```ts
ctx.self.<prop>
ctx.self.<prop> = v
ctx.self.bounds: { min, max, size, center, obb, geometryPending? } | null
```

## Movement

Velocity uses meters per second. forces holds named forces until a key is cleared with null. Force uses newtons and torque uses newton-meters on world axes. Dynamic bodies accept forces. A character body standing on a moving kinematic platform rides it: the engine carries it, and its velocity is relative to the platform.

```ts
ctx.self.grounded
ctx.self.touching.wallLeft/.wallRight
ctx.self.touching.ceiling
ctx.self.velocity
ctx.self.velocity = v
ctx.self.forces.<key> = { force?, position?, torque? }
<entity>.velocity
<entity>.velocity = v
ctx.self.angularVelocity
ctx.self.angularVelocity = v
<entity>.angularVelocity = v
ctx.self.liquid.in
ctx.self.liquid.level
ctx.self.overlapping
```

## Terrain

```ts
ctx.getWaterLevelAt(x: number, z: number, place?: string): number | null
ctx.readField(name: string, x: number, z: number, place?: string): number
ctx.place.fields[name].runtime[chunk]
ctx.place.fields[name].runtime[chunk] = { ...ctx.place.fields[name].grid, cells }
ctx.place.fields[name].runtime[chunk].cells = next
delete ctx.place.fields[name].runtime[chunk]
ctx.place.fields[name].authored[chunk] = { ...ctx.place.fields[name].grid, cells }
Object.keys(ctx.place.fields[name].runtime)
ctx.place.fields[name].changes(at): { chunks, at }
ctx.getTerrainNormal(x: number, z: number, place?: string): Vec3 | null
```

## Splines

```ts
ctx.self.spline = { id, at, orient?, offset? }
```

## Camera

```ts
ctx.world.camera (+ derived forward/fov/aspect/insetRight live reads; aspect = this screen's width ÷ height, insetRight = the share of that width Spawn's rail covers at the right edge, 0..1; in skill:cameras)
ctx.worldToScreen(position: Vec3): { x: number; y: number; depth: number; onScreen: boolean } | null
<player>.camera = {…}
<player>.camera = null
<player>.isGodMode
<player>.isEditor
```

## Selection

```ts
<player>.selection?.id
<player>.selection = entity | id
<player>.selection = null, guarded by id: if (p.selection?.id === x) p.selection = null
delete <player>.selection / = null
```

## Player

```ts
<player>.displayName
```

## Timing

after takes seconds and a named hook export; its callback receives (ctx, payload). cancel takes the returned timer id. now returns milliseconds.

```ts
dt · ctx.dtMs · ctx.gapMs
ctx.after(seconds: number, hookExport: string, payload?: unknown): string
ctx.cancel(id: string): void
ctx.getTimers(ownerId?: string): Array<{ id: number | string; ownerId: string; dueInTicks: number; dueInSeconds: number; engineOwned: boolean; hook?: string }>
ctx.world.settling
```

## Jobs

The engine's jobs are llm:chat, llm:generate, llm:clear, jev:decide, mail:send, chat:send, chat:history, player:token, player:names, text:check, image:generate, image:segment, and video:generate. image:generate paints one picture per player per game from that player's words: args { prompt, width, height, transparent, tile }, with width and height in pixels (1536 by 1024 when unset), and tile true for an opaque texture that repeats both ways with no seam; data { name, url, width, height }, where url is written as any texture. A player's next ask answers paint_spent, so keep the url in player.state. image:segment finds the things a picture shows: args { image, prompt, points }, with image a picture's address or a data URL, prompt the words that name what to find, and points [{ x, y, label }] in the picture's pixels; data { masks: [{ name, url, width, height, box, score }] }, one black-and-white PNG per thing found, white where it is, with box its bounds in the picture's pixels. video:generate makes a clip from words with the model spawn video uses: args { prompt, seconds, aspect, image }, with seconds 5 to 15 and image an optional first frame; data { name, url, seconds, width, height }, where url is an .mp4 written as any screen's texture. A clip takes minutes, so ask it from a cron and wait there with await ctx.awaitJob(id).

```ts
ctx.job<T>(jobId: string, args: Record<string, unknown>, callback?: (result: JobResult<T>) => void, options?: JobOptions): string
ctx.job(jobId: string, args: Record<string, unknown>, hookExport: string, payload?: unknown): string
ctx.awaitJob<T>(requestId: string): Promise<JobResult<T>>
ctx.proposePurchase(buyer: string | { readonly id: string }, itemId: string): string
```

## Database

```ts
ctx.sql: SqlAPI
```

## Clock

```ts
ctx.now()
```

## The Changed Cursor (Sim.Js)

```ts
ctx.changed(glob): { path, value, prev }[]
```

## Random

```ts
ctx.random()
```

## Logging

```ts
ctx.log(...args: unknown[]): void
ctx.warn(...args: unknown[]): void
ctx.error(...args: unknown[]): void
```

## Events

```ts
ctx.emit<K extends ActName>(name: K, payload: ActPayloads[K], options?: { audience?: Audience }): string | void
ctx.emit(name: string, payload?: unknown, options?: { place?: string; to?: string; via?: string; audience?: Audience }): string | void
ctx.on(name: string, handler: TomeEventHandler, options?: TomeEventOptions): () => void
```

## Spec Patches & Scripts

```ts
ctx.place.atmosphere.*
ctx.world.player.*
ctx.world.camera.* = …
ctx.world.inputs.* = …
ctx.resolveControls(surface?: string): { surface: TouchSurfaceDef; diagnostics: Array<{ code: string; message: string }> }
ctx.world.godMode.* = … (enabled · scope · behavior · brushes.<id> · movement.flySpeed · movement.sprintMultiplier · movement.verticalSpeed · camera.fov · visuals.disableFog: root = replaces, .leaf = merges, a brush is validated as the brush that will stand)
ctx.world.ui.render = 'scripts/hud.js'
ctx.world.creatorTabs
ctx.world.engine.* = …
ctx.world.routing = { script, maxPlayers } | null (.maxPlayers = 8 writes one key; = null turns routing off)
ctx.world.buyables.<id> = { name, priceSpoins, minSpoins?, imageUrl?, description?, onPurchase? }
ctx.world.buyables.<id>.<field> = v
delete ctx.world.buyables.<id> (= null removes too)
ctx.world.buyables.<id>
ctx.world.godMode.brushes.<id> = { paintScript, label, icon, color?, defaultRadius, defaultStrength, feather?, field? }
ctx.world.godMode.brushes.<id>
Object.keys(ctx.world.buyables) / 'x' in ctx.world.buyables
ctx.world.places.<p> = { mode, terrain, atmosphere, objects, … }
ctx.place.<dial> = … / ctx.world.places.<p>.<dial>.<leaf> = …
delete ctx.world.places.<p>
ctx.world.defaultPlace = 'lobby' | ctx.world.places.lobby
```

## World Queries

query excludes self by default; set ignoreSelf: false to include it. ctx.place.players lists the current place's players.

```ts
ctx.query(opts: ObjectQueryOptions & { select: "ids" }): string[]
ctx.query(opts: CrossingScopeQueryOptions): CrossingRecord[]
ctx.query(opts: ObjectQueryOptions): ObjectView[]
ctx.place.players
```

## Places

```ts
ctx.enterPlace(options: EnterPlaceOptions): string | null
ctx.enterPlace(entityId: string, options: EnterPlaceOptions): string | null
<entity>.place
<player>.place
ctx.place.objects
```

## Object Access

```ts
ctx.world.places.<p>
ctx.getRoomId(): string
ctx.presence(userIds: ReadonlyArray<string | { readonly userId: string }>): Promise<readonly PresenceRow[]>
ctx.world.mode
ctx.getObject(id: string): ObjectView | null
<entity>.state.*
ctx.self.audio.params.<name> = v
ctx.getVibeAudio(id: string): VibeAudioSnapshot | null
<entity>.<prop>
ctx.getObjectBoneNames(id: string): BoneNamesResult
ctx.getObjectMorphTargetNames(id: string): MorphTargetNamesResult
ctx.getObjectSocket(id: string, name: string): { position: Vec3; direction: Vec3; confidence: number } | null
<entity>.children
<entity>.<prop> = v
ctx.place.tiles[x][y] = id
ctx.place.tiles[x][y] = 0
delete ctx.place.tiles[x][y]
ctx.place.tiles[x][y]
```

## Lifecycle

```ts
ctx.spawn(spec: ObjectSpec): string
ctx.spawn(id: string, spec: ObjectSpec): string
ctx.destroy(id?: string): void
ctx.destroy(ids: string[]): void
ctx.destroy(id: string, options: { force?: boolean }): void
ctx.destroy(ids: string[], options: { force?: boolean }): void
```

## Spec Mutation (God Mode)

```ts
ctx.commit(message?, fn)
```

## Control

```ts
<entity>.controller = ctx.self.id
<entity>.controller = null
<entity>.controller = playerId
ctx.self.controller
ctx.self.controlling
```

## Trade

```ts
ctx.trade(mine: string, opts: { with: string; for: string } | null): TradeReceipt
```

## Joints

```ts
ctx.self.joints[id] = { to, type, … }
delete ctx.self.joints[id]
ctx.self.joints[id].motor = { velocity, maxForce }
ctx.self.joints[id].limits = [min, max] or { min, max, stiffness, damping }
```

## Ragdoll

```ts
ctx.self.ragdoll = {…} (= null releases it)
ctx.self.ragdoll = null
```

## Hierarchy

```ts
ctx.self.parent
ctx.attach(entity: string | { readonly id: string }, parent: string | { readonly id: string } | null, offset?: { position?: Vec3; rotation?: RotationSpec; scale?: Vec3; pivot?: PivotSpec; attachment?: ObjectAttachmentSpec | null; replaces?: string }): void
ctx.sleep(seconds?)
```

## DM Hooks

```ts
ctx.notifyDm(message: string, options?: NotifyDmOptions): void
ctx.notifyDmOnce(key: string, message?: string, options?: NotifyDmOptions): void
```

## Juice

A layer pushed onto <player>.look fades in over fade seconds (0.25 when unset, 0 at once) to its intensity (0 to 1, default 1). It fades out the same way when it leaves the list: = [], .splice, or the end of its duration.

```ts
<player>.letterbox = intensity
<player>.vignette = intensity | { intensity, color }
<player>.effects.<name> = intensity
delete <player>.effects.<name>
<player>.look.push('scripts/look-x.js' | { look, intensity, duration, fade, priority, params })
<player>.look = []
<player>.hidden = [ids]
<player>.atmosphere.*
delete <player>.atmosphere.<key>
ctx.stopFx(id: string): void
ctx.pulseFx(id: string, name: string, opts?: { at?: Vec3; data?: Record<string, unknown> }): void
ctx.getFxState(id: string): FxState | null
<player>.music = clip | null
<player>.ambience = clip | null
ctx.music.*
```

## Animation Mixer

```ts
ctx.self.anim.<ch> = {…}
ctx.self.anim.<ch>
```

## Self

```ts
ctx.self
ctx.self.id: string
ctx.self.state: TomeCameraState
ctx.self.session: Record<string, unknown>
ctx.self.feetPosition: Vec3
ctx.self.rotation: RotationSpec
ctx.self.up: Vec3 | null
ctx.self.frame: RotationSpec | string | { readonly id: string } | null
ctx.self.target: CameraTargetView | null
ctx.self.view: { yaw: number; pitch: number } | undefined
ctx.self.pointerLock?: boolean | "drag" | { drag: "left" | "right" | "middle" } | { unadjustedMovement: boolean } | null
ctx.self.fov?: number | null
ctx.self.clip?: { near?: number | null; far?: number | null } | null
ctx.self.orientation?: CameraOrientationDef | null
ctx.self.sensitivity?: number | null
ctx.self.minPitch?: number | null
ctx.self.maxPitch?: number | null
ctx.self.pixelSnap?: boolean | null
ctx.self.hideLocalPlayer?: boolean | null
ctx.self.projection?: "perspective" | "orthographic" | null
ctx.self.layers?: string[] | null
```

## The Local Player (On A Camera Rig Alone)

```ts
ctx.player
```

## The Spine (The Same Members Every Behavior Ctx Carries)

```ts
ctx.place
ctx.world
```

## State (The Compat Spellings Of Ctx.Self.State)

```ts
ctx.self.state
ctx.self.state = {…}
ctx.self.state.<key> = v
```

## Properties (The Compat Spellings Of Ctx.Self.Feetposition / .Rotation)

```ts
ctx.self.feetPosition / .rotation
ctx.self.feetPosition = … / .rotation = …
```

## World Queries

query excludes self by default; set ignoreSelf: false to include it. ctx.place.players lists the current place's players.

```ts
ctx.place.players
```

## Behavior Hooks

Export these functions from a behavior module. onInput reads named axes and actions declared in the world's inputs. pressed and released apply on the transition; held stays true while the action is held.

```ts
onSpawn(ctx)
onDestroy(ctx)
update(ctx, dt: number)
lateUpdate(ctx, dt: number)
onInput(ctx, input: InputState)
onCollide(ctx, other: ObjectQueryResult, contact: Contact)
onTriggerEnter(ctx, other: ObjectQueryResult)
onTriggerExit(ctx, other: ObjectQueryResult)
onCross(ctx, other: ObjectQueryResult, outcome: Extract<CrossOutcome, { crossed: true | "departing" }>)
onRefuse(ctx, other: ObjectQueryResult, verdict: CrossVerdict)
onLiquidEnter(ctx, other: ObjectQueryResult & { liquidKind?: string; markKind?: string })
onLiquidExit(ctx, other: ObjectQueryResult & { liquidKind?: string; markKind?: string })
onSay(ctx, line: SaidLine)
onSoundEnd(ctx, sound: SoundEndEvent)
onOutOfBounds(ctx, event: OutOfBoundsEvent)
onControlBegin(ctx, player: ObjectQueryResult)
onControlEnd(ctx, player: ObjectQueryResult)
editor(ctx, obj: ObjectView)
visual(ctx, obj: ObjectView)
updateSchedule, data export, not a hook: export const updateSchedule = { every: N | { seconds: s }, near: { radius } }. update() runs only while a player is near the object (the engine's locality default, ~500 m; an object with no position always runs; a rule that must advance for everyone wherever they stand is sim.js, not an update()). The engine skips update() on ticks the schedule declines: every runs update() every N ticks (deterministic per-entity phase: a cohort auto-spreads). dt = the declared cadence step (every × tick dt), so integrate-by-dt code just works. Declaring every REPLACES a hand-rolled tick % N gate, delete the gate line, never keep both: the engine's per-entity phase and the body's own phase rarely coincide, so a script that keeps its gate mostly stops running. A path that must run every tick (aggro, sprint, a raising burst) is a reason to declare the gate wide enough in the export; the schedule is the file's, not a runtime dial.
async and import() in a hook or ear: the part before the first await runs in the tick, the rest later on the same ctx. import() answers an ES module's exports. A file only import() names stays out of arrival, so code only some moments need is its own module, import()ed where first needed: let seeder; export const ears = { "match:start": async (ctx) => { seeder ??= await import("./lib/seeder.js"); seeder.seedAll(ctx); } };
```

## ObjectPropertiesSpec (full)

physics.capsule height and radius are in the object's own meters, and the object's scale multiplies them like every collider: height 2 on a scale-8.9 body collides 17.8 m tall. height is end to end, caps included.

```ts
ObjectProperties = {
  feetPosition?: PositionSpec,
  rotation?:
    | deg
    | { yaw?, pitch?, roll? }
    | { x, y, z, w }
    | { lookAt: PositionSpec, include?: ["yaw" | "pitch" | "roll", ...] },
  yaw?: deg,
  scale?: num | { x, y, z },
  visible?: bool,
  visibleInFirstPerson?: bool | null,
  castShadow?: bool,
  receiveShadow?: bool,

  primitive?: PrimitiveSpec,
  sprite?: { texture: "/cdn/value.<sha>.png", size?: [x, y], billboard?: "none" | "yaw" | "full", upright?: bool, cutout?: bool, alphaCutoff?: num, pixelsPerUnit?: num, anchor?: [x, y], tint?: Color, opacity?: num, blend?: "alpha" | "add" | "multiply" | "subtract" | "screen", lit?: bool, emissive?: num, normalStrength?: num, flipX?: bool, flipY?: bool, sortingLayer?: num, sortingOrder?: num, ySort?: bool, filter?: "pixel" | "linear", parallax?: [x, y], repeatX?: bool, uvRect?: { x, y, width, height }, events?: Record<string, Record<string, str>> | null, trail?: { interval?: num, life?: num, count?: num, tint?: Color | [Color, Color], fade?: "alpha" | "shrink" | "both", blend?: "normal" | "additive" } | null, material?: ScriptedMaterialSpec },
  room?: { width: num, depth: num, height?: num, wallThickness?: num, floorThickness?: num, ceiling?: bool, material?: MaterialSpec, wallMaterial?: MaterialSpec, floorMaterial?: MaterialSpec, ceilingMaterial?: MaterialSpec, openings?: [{ side: "north" | "south" | "east" | "west", width: num, offset?: num }, ...] },
  path?: { mode?: "tube", points?: [[x, y, z] | PositionSpec, ...], beziers?: [{ from: [x, y, z] | PositionSpec, c1: [x, y, z] | PositionSpec, c2: [x, y, z] | PositionSpec, to: [x, y, z] | PositionSpec }, ...], radius?: num, closed?: bool, samples?: num | "auto", up?: [x, y, z], revision?: num },
  layout?: { box?: { min?: { x?, y?, z? }, max?: { x?, y?, z? } } },

  material?: MaterialSpec,

  physics?: "none" | "static" | "dynamic" | "kinematic" | "character" | false | { body: "none" | "static" | "dynamic" | "kinematic" | "character", collider?: "auto" | "box" | "sphere" | "capsule" | "cylinder" | "mesh" | "none" | str | { kind?: str }, trigger?: bool, mass?: num, density?: num, friction?: num, frictionCombine?: "average" | "min" | "multiply" | "max", restitution?: num, restitutionCombine?: "average" | "min" | "multiply" | "max", linearDamping?: num, angularDamping?: num, gravityScale?: num, lockedAxes?: ["x" | "y" | "z" | "rotX" | "rotY" | "rotZ", ...], layer?: str, autostep?: { maxHeight, minWidth } | false, maxSlopeClimbAngle?: deg , minSlopeSlideAngle?: deg , slideEnabled?: bool, snapToGroundDistance?: num | false , characterMass?: num, applyImpulsesToDynamicBodies?: bool, offset?: num, capsule?: { height?, radius? } , up?: [x, y, z] | { x, y, z } },

  light?: LightSpec,
  audio?: { kind: "vibe" | "program", script: "scripts/file.js", gain?: 0-2, params?: Record<string, any>, bus?: str, spatial?: bool, maxDistance?: num, refDistance?: num, rolloffFactor?: num, priority?: num, paused?: bool } | { kind?: "clip", clip: "cdn/sound.mp3", gain?: 0-2, pitch?: num, loop?: bool, end?: num, loopStart?: num, loopEnd?: num, spatial?: bool, maxDistance?: num, refDistance?: num, rolloffFactor?: num, bus?: str, priority?: num } | null,

  interpolation?: { teleportThreshold: num } | null,

  pivot?: "feet" | "center" | "top" | [x, y, z] | { x, y, z },
  render?: bool,
  visibleRange?: { min?, max? } | null,
  layers?: [str, ...] | null,
  visibleTo?: "all" | "editors",
  vector?: str,
  jiggle?: bool | { amount?: 0-1, bounce?: 0-1, gravity?: 0-1, wind?: { force?: num }, bones?: [str, ...], radius?: num, limit?: deg, colliders?: [{ bone?: str, entity?: str, offset?: [x, y, z], tail?: [x, y, z], radius: num }, ...] } | [{ amount?: 0-1, bounce?: 0-1, gravity?: 0-1, wind?: { force?: num }, bones?: [str, ...], radius?: num, limit?: deg, colliders?: [{ bone?: str, entity?: str, offset?: [x, y, z], tail?: [x, y, z], radius: num }, ...] }, ...] | null,
  morph?: Record<string, num> | null,
  bones?: Record<string, { rotate?: [x, y, z], offset?: [x, y, z], scale?: num, visibleInFirstPerson?: bool, mass?: num, reach?: { x: num, y: num, z: num, rotation?: num | { yaw?, pitch?, roll? } | { x, y, z, w } } | { object: str, offset?: { x, y, z }, rotation?: num | { yaw?, pitch?, roll? } | { x, y, z, w } } | { to: { x: num, y: num, z: num, rotation?: num | { yaw?, pitch?, roll? } | { x, y, z, w } } | { object: str, offset?: { x, y, z }, rotation?: num | { yaw?, pitch?, roll? } | { x, y, z, w } }, pole?: { x, y, z } | { object: str, offset?: { x, y, z } }, weight?: num, blendIn?: num, blendOut?: num }, aim?: { x, y, z } | { object: str, offset?: { x, y, z } } | { to: { x, y, z } | { object: str, offset?: { x, y, z } }, weight?: num, blendIn?: num, blendOut?: num }, ground?: 0-1 }> | null,
  wisp?: { color: str, state?: "unlit" | "idle" | "weaving" | "settling" | "guttering" | "sleeping", expression?: "auto" | "curious" | "happy" | "sleepy", shape?: "classic" | "slender" | "twin", burnStyle?: "calm" | "crackle" | "pulse" | "wave", seed?: num, size?: num, mouth?: 0-1 } | null,
  boxart?: { game: str } | null,
  collider2d?: { outline: [[x, y], ...] },
  ui?: str | null,
  press?: { radius: num, strength?: num, at?: [x, y, z], below?: num } | [{ radius: num, strength?: num, at?: [x, y, z], below?: num }, ...] | null,
  fx?: { script: "scripts/file.js", params?: Record<string, any>, seed?: num, paused?: bool, enabled?: bool, time?: num | null },
  voice?: { gain: 0-1 } | null,
  model?: "cdn/model.glb" | { id, offset?: [x, y, z] },
  mixer?: { <channelName>: { clip: string, weight?: num, speed?: num, loop?: "once"|"loop"|"pingpong", blendIn?: num, blendOut?: num, talking?: true } },
  attachment?: { bone: "RightHand" } | { skin: true } | { socket: "muzzle" } | { part: "turret" },
  spline?: SplineSpec,
  scatter?: {
    bounds: ScatterBounds,
    sampling: { strategy: "poisson", minDistance } | { strategy: "grid", spacing, jitter? } | { strategy: "random" } | { strategy: "clustered", clusters, radius } | { strategy: "edge", band? },
    count: num, seed: num,
    templates: [{ ...ObjectPropertiesSpec, weight?, tags?, state?, behavior? }, ...],
    variation?: { scale?: [min, max], yaw?: [min, max] },
    surface?: "terrain" | { y: num },
    filter?: { maxSlope?: num, minSlope?: num, materials?: [terrainMaterialId, ...] },
  },
}
```

## PrimitiveSpec (full)

A scripted primitive's collider() may return a heightfield: an object's ground from a grid of heights, as one collider (`spawn api ColliderHeightfield`).

```ts
PrimitiveSpec =
  | { kind: "cube"; size?: number; segments?: number } & PrimitiveBase
  | { kind: "box"; width?: number; height?: number; depth?: number; widthSegments?: number; heightSegments?: number; depthSegments?: number } & PrimitiveBase
  | { kind: "sphere"; radius?: number; widthSegments?: number; heightSegments?: number; phiStart?: number; phiLength?: number; thetaStart?: number; thetaLength?: number } & PrimitiveBase
  | { kind: "cylinder"; radiusTop?: number; radiusBottom?: number; height?: number; radialSegments?: number; heightSegments?: number; openEnded?: boolean; thetaStart?: number; thetaLength?: number } & PrimitiveBase
  | { kind: "capsule"; radius?: number; halfHeight?: number; capSegments?: number; radialSegments?: number } & PrimitiveBase
  | { kind: "plane"; width?: number; height?: number; widthSegments?: number; heightSegments?: number } & PrimitiveBase
  | { kind: "torus"; radius?: number; tube?: number; radialSegments?: number; tubularSegments?: number; arc?: number } & PrimitiveBase
  | { kind: "octahedron"; radius?: number; detail?: number } & PrimitiveBase
  | { kind: "tube"; points: Array<[number, number, number]>; radius?: number; radialSegments?: number; tubularSegments?: number; closed?: boolean; straight?: boolean } & PrimitiveBase
  | { kind: "cone"; radius?: number; height?: number; radialSegments?: number; heightSegments?: number; openEnded?: boolean; thetaStart?: number; thetaLength?: number } & PrimitiveBase
  | { kind: "ring"; innerRadius?: number; outerRadius?: number; thetaSegments?: number; phiSegments?: number; thetaStart?: number; thetaLength?: number } & PrimitiveBase
  | { kind: "tetrahedron"; radius?: number; detail?: number } & PrimitiveBase
  | { kind: "icosahedron"; radius?: number; detail?: number } & PrimitiveBase
  | { kind: "dodecahedron"; radius?: number; detail?: number } & PrimitiveBase
  | { kind: "pyramid"; radius?: number; height?: number; segments?: number; width?: number; depth?: number; thetaStart?: number } & PrimitiveBase
  | { kind: "lathe"; points: Array<[number, number]>; segments?: number; phiStart?: number; phiLength?: number } & PrimitiveBase
  | { kind: "extrude"; shape: Array<[number, number]> | string; holes?: Array<Array<[number, number]>>; depth?: number; bevelEnabled?: boolean; bevelThickness?: number; bevelSize?: number; bevelSegments?: number; curveSegments?: number } & PrimitiveBase
  | { kind: "circle"; radius?: number; segments?: number; thetaStart?: number; thetaLength?: number } & PrimitiveBase
  | { kind: "torusKnot"; radius?: number; tube?: number; radialSegments?: number; tubularSegments?: number; p?: number; q?: number } & PrimitiveBase
  | { kind: "frustum"; radiusTop?: number; radiusBottom?: number; height?: number; segments?: number } & PrimitiveBase
  | { kind: "ellipsoid"; radiusX?: number; radiusY?: number; radiusZ?: number; widthSegments?: number; heightSegments?: number } & PrimitiveBase
  | { kind: "superellipsoid"; a?: number; b?: number; c?: number; n1?: number; n2?: number; segments?: number } & PrimitiveBase
  | { kind: "hollowCylinder"; innerRadius?: number; outerRadius?: number; height?: number; radialSegments?: number; openEnded?: boolean } & PrimitiveBase
  | { kind: "hemisphere"; radius?: number; segments?: number; direction?: "up" | "down" } & PrimitiveBase
  | { kind: "arch"; width?: number; height?: number; depth?: number; segments?: number } & PrimitiveBase
  | { kind: "archway"; width?: number; height?: number; depth?: number; thickness?: number; segments?: number } & PrimitiveBase
  | { kind: "squareArch"; width?: number; height?: number; depth?: number; archWidth?: number; archHeight?: number; segments?: number } & PrimitiveBase
  | { kind: "wall"; width: number; height: number; depth: number; holes?: Array<{ x: number; bottomY?: number; y?: number; w: number; h: number }>; facing?: "z" | "x" | "y" } & PrimitiveBase
  | { kind: "line"; points?: [number, number, number][]; segments?: boolean; count?: number; bounds?: { min: [number, number, number]; max: [number, number, number] } }
  | { kind: "custom"; geometry: BespokeGeometrySpec; forward?: ForwardAxis; sockets?: PrimitiveSockets }
  | { kind: "scripted"; script: ScriptRef; params?: Record<string, unknown>; seed?: number; forward?: ForwardAxis; sockets?: PrimitiveSockets }
  | { kind: "points"; count: number; bounds?: { min: [number, number, number]; max: [number, number, number] } }

PrimitiveBase = {
  materialKey?: string
  overrides?: DrawMaterialOverrides
  sockets?: Record<string, { x: number; y: number; z: number } | [number, number, number] | { position: { x: number; y: number; z: number } | [number, number, number]; direction?: { x: number; y: number; z: number } | [number, number, number] }>
}
```

## AtmosphereDef (full)

```ts
atmosphere: {
  sky?:
    | { kind: "color", color: Color, params?: Record<string, num | bool | [num | [num, ...], ...] | { size: [x, y], data: [num, ...] }> }
    | { kind: "gradient", horizon: Color, zenith: Color, params?: Record<string, num | bool | [num | [num, ...], ...] | { size: [x, y], data: [num, ...] }> }
    | { kind: "rayleigh", turbidity?: num, rayleighCoefficient?: num, mieCoefficient?: num, mieDirectionalG?: num, skyColor?: Color, rayleighColor?: Color, mieColor?: Color, groundAlbedo?: Color, horizonTint?: Color, zenithTint?: Color, saturation?: 0-2, sunDiskSize?: num, sunDiskIntensity?: num, params?: Record<string, num | bool | [num | [num, ...], ...] | { size: [x, y], data: [num, ...] }> }
    | { kind: "realistic", model: "rayleigh", turbidity?: num, rayleighCoefficient?: num, mieCoefficient?: num, mieDirectionalG?: num, skyColor?: Color, rayleighColor?: Color, mieColor?: Color, groundAlbedo?: Color, horizonTint?: Color, zenithTint?: Color, saturation?: 0-2, sunDiskSize?: num, sunDiskIntensity?: num, params?: Record<string, num | bool | [num | [num, ...], ...] | { size: [x, y], data: [num, ...] }> }
    | { kind: "realistic", model: "hosek", turbidity?: num, rayleighColor?: Color, mieColor?: Color, groundAlbedo?: Color, horizonTint?: Color, zenithTint?: Color, saturation?: 0-2, sunDiskSize?: num, sunDiskIntensity?: num, params?: Record<string, num | bool | [num | [num, ...], ...] | { size: [x, y], data: [num, ...] }> },
  ground?: bool,
  fog?:
    | { kind: "linear", color?: Color | null, near: num, far: num, height?: { base?, falloff } }
    | { kind: "exp2", color?: Color | null, density: num, height?: { base?, falloff } },
  sun?: { rotation?: { pitch?, yaw? }, orbit?: { noonYaw?, maxElevation? }, light?: { color?: Color, intensity?: num, shadow?: bool | { enabled?: bool, softness?: num } } },
  ambient?: { light?: { color?: Color, intensity?: num } },
  hemisphere?: { skyColor?: Color, groundColor?: Color, intensity?: num },
  environmentIntensity?: num,
  clouds?: { enabled?: bool, density?: 0-1, altitude?: num, thickness?: num, speed?: num, color?: Color, opacity?: 0-1, shadow?: 0-1, texture?: "/cdn/value.<sha>.png" },
  stars?: { enabled?: bool, density?: 0-1, brightness?: 0-2, size?: num, twinkle?: bool, color?: Color, milkyWay?: 0-1 },
  moon?: { enabled?: bool, phase?: 0-1, size?: num, color?: Color, intensity?: num },
  wind?: { direction?, speed? },
  wet?: 0-1,
  rain?: 0-1,
  timeOfDay?: 0-24,
  cycle?: { periodMs: num, epoch: num, bands?: [[fromHour, speed], ...] } | { frozen: 0-24 } | { lengthSeconds, startTime?, anchorHour?, anchorTick? },
  look?: { script?: "scripts/file.js", filter?: "pixel" | "linear", toneMapping?: "aces" | "neutral" | "none" | "linear" | "reinhard" | "cineon" | "agx", params?: Record<string, num | bool | str>, cube?: { parent: str, eye?: [x, y, z] } },
}
```

## TerrainDef heightmap (full)

```ts
terrain: {
  kind: "heightmap",
  seed?: num | str,
  materials?: [{ id: str, albedo?: "/cdn/value.<sha>.png", pbr?: bool, tint?: Color, normal?: str, roughness?: str, textureScale?: num, metalness?: num, normalStrength?: num, roughnessIntensity?: num, antiTiling?: "none" | "stochastic", filter?: "pixel" | "linear", macro?: { scale?, hue?, value? } }, ...],
  generator?: "scripts/file.js",
  verticalRange?: { min, max },
  marks?: Record<string, { kind: "sea", level: num, reach?: { shape: "rectangle", width: num, depth: num, center: { x, z } } | { shape: "halfplane", edge: "north" | "south" | "east" | "west", offset: num }, floorMaterial?: str, liquid?: LiquidSpec } | { kind: "lake", at: { x, z }, radius: num, level?: num, depth?: num, bedMaterial?: str, liquid?: LiquidSpec } | { kind: "river", points: [[x, z] | [x, z, level], ...], width: num, depth?: num, closed?: bool, bedMaterial?: str, liquid?: LiquidSpec } | { kind: "path", points: [[x, y], ...], width: num, material?: str, edgeMaterial?: str, noise?: num, falloff?: num, clearScatter?: bool, grade?: bool, maxGrade?: num } | { kind: "road", points?: [[x, y], ...], spline?: [[x, y, z], ...], closed?: bool, width: num, material?: str, edgeMaterial?: str, edgeWidth?: num, falloff?: num, clearScatter?: bool } | { kind: "flatten", center: { x, z }, height: num | { terrain: num }, shape: MarkShape | { kind: "path", points: [[x, y], ...], width: num }, falloff: num, falloffCurve?: "smooth" | "cliff" | "linear", maxGrade?: num, material?: str, edgeMaterial?: str, clearScatter?: bool } | { kind: "clear-scatter", center: { x, z }, shape: MarkShape | { kind: "path", points: [[x, y], ...], width: num } } | { kind: "hole", points: [[x, y], ...] }>,
  water?: LiquidSpec,
  material?: ScriptedMaterialSpec,
}
```

## Inputs (full)

```ts
Keys (case-insensitive): a letter ("e"), a digit ("1" = the number row), a name (space, shift, ctrl, alt, enter, escape, backspace, delete, f1-f12, up/down/left/right), or any KeyboardEvent.code (KeyE, Digit1, Numpad0, ArrowUp). Tab is reserved. Gamepad triggers as analog axes: Gamepad:LT/RT (0 to 1).
InputAxisDef = { keys?: str, mouse?: "deltaX" | "deltaY" | "wheelY" | "wheelX", gamepad?: "leftStickX" | "leftStickY" | "rightStickX" | "rightStickY" | "Gamepad:LT" | "Gamepad:RT" | "Gamepad:Axis<N>", deadzone?: 0-1 }
InputActionDef = { keys?: [key, ...], mouse?: "left" | "right" | "middle" | "mouse4" | "mouse5" | "wheelUp" | "wheelDown", gamepad?: "a" | "b" | "x" | "y" | "lb" | "rb" | "lt" | "rt" | "start" | "select" | "l3" | "r3" | "dpadUp/Down/Left/Right" | "Gamepad:Button<n>", modifiers?: [str, ...], activeOn?: "keydown" | "hold" | "keyup", touch?: { button?: bool, label?: str, slot?: 1 | 2 | 3 | 4, gesture?: "tap" | "double-tap" | "hold" | "press" }, active?: "scripts/file.js" }
Gamepads: a binding reads every connected controller as one; ui.js reads each controller apart with navigator.getGamepads(), a behavior script has none.
```

## ObjectSpec (full)

```ts
ObjectSpec = {
  id?: str, tags?: [str, ...], state?: Record<str, any>, behavior?: "scripts/file.js" | [...],
  parent?: str, children?: ObjectSpec[], ...ObjectPropertiesSpec ,
  place?: str, audience?: "near" | "all" | "local", visibility?: "owner" | "platform", lifetime?: num, tick?: { phase?: "pre" | "post", order? },
}
```

## Parenting (full)

```ts
api.spawn({ parent: 'pole-0', feetPosition: {x:0, y:3, z:0}, primitive: {kind:'sphere', radius:0.25} });
```

## UI rules (full)

```ts
Full screen: in ui.js, document.documentElement.requestFullscreen() on a press fills the screen with the game, HUD and rail; document.exitFullscreen() leaves; document.fullscreenEnabled is true on computers and Android phones, never on an iPhone.
```

## Named types (full)

A world whose places all have mode "ui" draws nothing, so it opens on a computer or phone with no 3D graphics (no WebGPU). highlightSet width is in pixels of a 1080p picture; when width is omitted, it is 2 for outline and about 16 for glow and pulse.

```ts
ActName = keyof ActPayloads

ActPayloads = {
  damageNumber: { position: Vec3; value?: number; text?: string; color?: Color; crit?: boolean; size?: number = 1; lifetime?: number = 1.5 },
  playSound: { clip: string; position?: Vec3; volume?: number = 1; pitch?: number = 1; loop?: boolean; mode?: "overlap" | "restart"; bus?: string; priority?: number; maxDistance?: number; refDistance?: number; follow?: boolean },
  stopSound: { soundId: string },
  preload: { refs: string[] }, // warms each sound, texture or model before its first use on the machines that hear it (the acting player's by default), so a game loads ahead of a moment it sees coming: emit it when those assets become likely; only machines in the room when it is sent hear it, so a room with no player in it warms no player, and one that joins later is not warmed; fire-and-forget, nothing shown, the world unchanged
  fx: { position: Vec3; script: string; params?: Record<string, unknown>; seed?: number; tags?: string[]; attachTo?: string },
  decal: { position: Vec3; normal: Vec3; texture: string; size?: number | [number, number] | [number | [number, number], number | [number, number]] = 0.5; rotation?: number | [number, number]; lifetime?: number = 30; fade?: number; color?: Color; opacity?: number | [number, number] = 1; attachTo?: string },
  slash: { position: Vec3; size?: number; shape?: "tightUniform" | "broadUniform" | "tightWidening" | "broadWidening" | "crescent" | "longCrescent" | "circle"; noise?: "none" | "forward" | "backward" | "stableDissolve"; glow?: "none" | "light" | "medium" | "intense" | "max"; timing?: "quick" | "standard" | "slow" | "verySlow"; body?: number; edge?: number; fade?: number; edgeColor?: Color; edgeAlpha?: number; bodyColor1?: Color; bodyColor1Alpha?: number; bodyColor2?: Color; bodyColor2Alpha?: number; bodyColor3?: Color; bodyColor3Alpha?: number; outwardGlow?: number; outwardGlowWidth?: number; outwardGlowSpeed?: number; rotation?: { yaw?: number; pitch?: number; roll?: number }; velocity?: { x?: number; y?: number; z?: number }; scaleVelocity?: number; rotationVelocity?: { yaw?: number; pitch?: number; roll?: number }; attachTo?: string },
  shockwave: { position: Vec3; speed?: number = 0.5; thickness?: number = 0.5; intensity?: number = 0.5; edgeFade?: number = 0.5; scale?: number = 1; easing?: "linear" | "easeOut" | "easeIn" = "linear" },
  screenShake: { intensity: number; duration?: number = 0.2 },
  screenFlash: { color?: Color; duration?: number = 0.15; intensity?: number = 0.35 },
  hitstop: { duration: number },
  cameraPunch: { direction: Vec3; intensity?: number = 0.3 },
  slowMo: { scale: number; duration: number; easing?: boolean | string },
  replay: { from: number; to: number; camera?: ViewCameraPose | { parent: string; eye?: Vec3; aim?: Vec3 | "forward" | string; fov?: number; projection?: "perspective" | "orthographic"; orthoSize?: number; layers?: string[] }; scale?: number; cue?: boolean; hud?: boolean },
  zoomTo: { target: Vec3 | string; duration?: number = 0.5; easing?: string = "easeOut"; offset?: Vec3; hold?: number },
  flash: { target: string; color?: Color; duration?: number = 0.1; intensity?: number = 0.9 },
  shake: { target: string; intensity: number; duration: number },
  squash: { target: string; axis?: "x" | "y" | "z" = "y"; intensity?: number = 0.3; duration?: number = 0.15 },
  impulse: { target: string; impulse?: Vec3; position?: Vec3; angularImpulse?: Vec3 },
  highlightSet: { target: string; color?: Color; style?: "outline" | "glow" | "pulse" | "xray" = "outline"; duration?: number; width?: number; intensity?: number },
  highlightClear: { target: string },
  outlinePage: { color?: Color; duration?: number = 0.45; width?: number = 3; pulses?: number = 1 },
  uiEvent: { name: string; payload?: unknown },
  haptic: { kind: HapticKind | "dual-rumble" | "trigger-rumble"; startDelay?: number; duration?: number; strongMagnitude?: number; weakMagnitude?: number; leftTrigger?: number; rightTrigger?: number },
  milestone: { step?: number; name?: string },
  stat: { name: string; value?: number; by?: string; vs?: string },
  voxelMarkSet: { markId: string; voxel: VoxelCoord; outline?: VoxelMarkOutlineOptions | null; fill?: VoxelMarkFillOptions | null; pulse?: VoxelMarkPulseOptions | null; duration?: number },
  voxelMarkClear: { markId: string },
  partyAdd: { player: string | { readonly id: string } },
  partyCancel: { player: string | { readonly id: string } },
  partyLeave: {},
  partyJoin: { player: string | { readonly id: string } },
  partyPortal: {},
  guildAdd: { player: string | { readonly id: string } },
  guildKick: { player: string | { readonly id: string } },
  guildRank: { player: string | { readonly id: string }; rank: "member" | "officer" },
  openSettings: { page?: "sound" | "voice" | "look" | "keys" | "screen" | "live" },
  openAvatarEditor: {},
}

AnimationFrameEvent = {
  name: string,
  animation: string,
  frame: number,
}

AnimationKeyframeValue = number | string | number[] | string[] | { value: number | string; duration?: number; easing?: string }[]

AssetMetadata = {
  boundsVersion?: number,
  triangles?: number,
  skinned?: boolean,
  clips?: string[],
  gait?: Record<string, number>,
  gaitVersion?: number,
  bounds?: { min: [number, number, number]; max: [number, number, number]; size: [number, number, number]; center: [number, number, number] },
  sockets?: Record<string, AssetSocketEntry>,
  parts?: Record<string, AssetPartEntry>,
  partsVersion?: number,
  sprite2d?: AssetSprite2DEntry,
  duration?: number,
  kind?: string,
  name?: string,
  uploadedAt?: string,
  bytes?: number,
}

AssetPartEntry = {
  center: [number, number, number],
  size: [number, number, number],
  groundOffsetY?: number,
  tris: number,
  confidence: number,
  version: number,
}

AssetSocketEntry = {
  position: [number, number, number],
  groundOffsetY: number,
  bone?: string,
  boneOffset?: [number, number, number],
  confidence: number,
  version: number,
}

AssetSprite2DEntry = {
  version: number,
  meta: null | Sprite2DMetaSpec,
}

AtmosphereSunState = {
  direction: [number, number, number],
  rotation: { pitch: number; yaw: number },
  color: number, // 0xRRGGBB.
  intensity: number,
  body: "sun" | "moon",
}

Audience = | { kind: "player"; id: string } | { kind: "nearby"; position: Vec3; radius?: number } | { kind: "all" } | { kind: "place"; placeId?: string }

AuthoredClipFunction = ((t: number) => Record<string, { position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] | number }>) & {
  duration?: number,
  fps?: number,
}

BehaviorHealth = {
  broken: BehaviorHookHealth[],
}

BehaviorHookHealth = {
  hook: string,
  script: string,
  error: string,
  line?: string,
  tick: number,
  running: "inert" | "running",
  count?: number,
}

BehaviorRef = ScriptRef | ScriptRef[]

BespokeGeometrySpec = {
  positions: number[],
  indices?: number[],
  normals?: number[],
  uvs?: number[],
  colors?: number[],
  emissive?: number[],
  metalness?: number[],
  roughness?: number[],
  textureRuns?: { texture: string; start: number; count: number }[],
  instances?: { layout?: Record<string, string>; data?: number[]; count?: number; lods?: { indices: [number, number]; distance?: number }[]; bounds?: { min: [number, number, number]; max: [number, number, number] } },
  bounds?: { min: [number, number, number]; max: [number, number, number] },
  revision?: number,
}

BlendEquation = "add" | "subtract" | "reverse-subtract" | "min" | "max"

BlendFactor = "zero" | "one" | "src" | "one-minus-src" | "src-alpha" | "one-minus-src-alpha" | "dst" | "one-minus-dst" | "dst-alpha" | "one-minus-dst-alpha" | "src-alpha-saturated"

BoneInfo = {
  index: number,
  name: string,
  parentName: string | null,
  localPosition: Vec3,
  modelPosition: Vec3,
  currentWorldPosition: Vec3 | null,
  currentWorldRotation: { x: number; y: number; z: number; w: number } | null,
  currentWorldScale: Vec3 | null,
  timestamp: number | null,
  fist: { position: Vec3; grip: Vec3; fingers: Vec3; palm: Vec3 } | null,
}

BoneInfoResult = BoneInfo[]

BoneNamesResult = string[]

CameraAttachPositionSpec = {
  attach: "camera",
  x?: number,
  y?: number,
  depth?: number,
  fov?: number,
}

CameraCommon = {
  fov?: number, // Camera FOV override, in degrees across the screen's short edge: top to bottom on a wide screen, side to side on a screen taller than wide. Unset, 60.
  clip?: { near?: number; far?: number } | null,
  behavior?: BehaviorRef,
  pixelSnap?: boolean,
  projection?: "perspective" | "orthographic",
  layers?: string[],
}

CameraDef = CustomCameraDef | LegacyCameraDef

CameraOrientationDef = {
  source: "look" | "script",
  authoredAxes?: ("yaw" | "pitch")[],
}

CameraTargetView = ObjectView & {
  effectiveScale: Vec3,
}

ClipPlane = {
  normal: [number, number, number],
  constant: number,
}

Color = OklchString

Contact = {
  position?: Vec3,
  normal?: Vec3,
  impulse: number,
}

CreatorTabDef = {
  id: string,
  title: string,
  icon: string,
  script: ScriptRef,
  shortcut?: string,
}

CrossingScopeQueryOptions = {
  scope: "crossings",
  since?: number,
  state?: CrossingTerminalState | readonly CrossingTerminalState[],
  world?: string,
  entityId?: string,
  actorId?: string,
}

CubicBezierSpec = {
  from: SplinePointSpec,
  c1: SplinePointSpec,
  c2: SplinePointSpec,
  to: SplinePointSpec,
}

CustomCameraDef = CameraCommon & {
  kind: "custom",
  state?: TomeCameraState,
  orientation?: CameraOrientationDef,
  sensitivity?: number = 3,
  minPitch?: number, // The lowest pitch of the engine-integrated look, in radians (+ looks up): the mouse, the stick and a `state.pitch` write stop here. Default -1.4 (80° down); -Math.PI / 2 looks straight down.
  maxPitch?: number, // The highest pitch of the engine-integrated look, in radians. Default 1.4 (80° up); Math.PI / 2 looks straight up.
  pointerLock?: boolean | "drag" | { drag: "left" | "right" | "middle" } | { unadjustedMovement: boolean },
  hideLocalPlayer?: boolean,
}

Degrees = number

EngineConfig = {
  networking?: { mode?: "singleplayer" | "multiplayer" },
  ui?: { theme?: { font?: string }; targetFps?: number; referenceHeight?: number },
  graphics?: { perfectPixelArt?: boolean | number; antialias?: boolean },
  playerSettings?: { defaults?: { accessibility?: { reduceFlashing?: boolean; reduceMotion?: boolean } }; caps?: { controls?: { lookSensitivity?: boolean; invertY?: boolean; fov?: boolean } } },
  simulation?: { tickRateHz?: number },
  behaviors?: ScriptRef[],
  crons?: { schedule: string; script: ScriptRef }[],
}

EngineInputAxes = {
  lookX?: number, // The look delta this tick, horizontal: the mouse's movement or a touch drag, never a level.
  lookY?: number, // The look delta this tick, vertical.
  aimYawSin?: number, // The sine of the camera's yaw.
  aimYawCos?: number, // The cosine of the camera's yaw.
  aimPitchN?: number, // The camera's pitch, from -1 (looking down) to 1 (looking up).
  camPosX?: number, // The camera's world position in metres, x.
  camPosY?: number, // The camera's world position in metres, y.
  camPosZ?: number, // The camera's world position in metres, z.
  pointerOriginX?: number, // The pointer's world ray: its origin in metres, x.
  pointerOriginY?: number, // The pointer's world ray: its origin in metres, y.
  pointerOriginZ?: number, // The pointer's world ray: its origin in metres, z.
  pointerDirX?: number, // The pointer's world ray: its unit direction, x.
  pointerDirY?: number, // The pointer's world ray: its unit direction, y.
  pointerDirZ?: number, // The pointer's world ray: its unit direction, z.
  touchActive?: number, // 1 while touch is the live input, 0 on a keyboard and a mouse.
  touchTwist?: number, // The two-finger twist this tick in radians, + clockwise on the screen; 0 with any other finger count.
  pointerLocked?: number, // 1 while the aim is the crosshair (the pointer lock, or a finger under a lock-preferring camera), 0 while the cursor is free. Lock acquisition has no pulse: watch this axis rise. `input.pressed.pointerLockLost` pulses when it falls.
}

EnterPlaceOptions = {
  place: string,
  at?: PositionSpec | "last" | "default",
  createIfMissing?: PlaceCreateOptions,
}

FieldChunkGrid = {
  cellSize: number,
  chunkCells: number,
  quant: number,
}

FieldChunkHandle = {
  cellSize: number,
  chunkCells: number,
  quant: number,
  cells: number[],
  version: number,
}

FieldConfig = {
  retention?: FieldRetention,
}

FieldLayerHandle = {
  [chunkKey: string]: FieldChunkHandle | undefined,
}

FieldRetention = "durable" | "session"

FilesAPI = {
  read(path: string): string | null,
  write(path: string, text: string): void,
  delete(path: string): void,
}

ForceEntrySpec = {
  force?: Vec3,
  position?: Vec3,
  torque?: Vec3,
}

ForwardAxis = "-z" | "+z" | "+x" | "-x"

FxState = {
  populations: Array<{ name: string; rate: number; lifetime: { min: number; max: number } | null; persistentCount: number | null; expectedAlive: number; alive: number | null; maxParticles: number | null; sinks: Array<{ kind: "sprite"; texture: string; blend: "alpha" | "add" | "multiply" | "subtract" | "screen" | "distort" } | { kind: "mesh"; shape: "box" | "cylinder" | "sphere" | "card" } | { kind: "ribbon"; texture: string | null } | { kind: "light"; radius: number; dynamic?: true }>; expectedSize: { start: number; peak: number } }>,
  totalExpectedAlive: number,
  totalAlive: number | null,
}

GameUIDef = UIDef & {
  startScreen?: boolean,
}

GodModeVisualSpec = ObjectProperties & {
  children?: ObjectSpec[],
  tags?: string[],
}

HapticKind = "soft" | "light" | "medium" | "rigid" | "heavy" | "selection" | "success" | "warning" | "error"

InputPointer = {
  x: number, // Screen pixel X coordinate
  y: number, // Screen pixel Y coordinate
  ndcX: number, // Normalized device coordinates X (-1 to 1, left to right)
  ndcY: number, // Normalized device coordinates Y (-1 to 1, bottom to top)
  overUi: boolean,
}

InputState = {
  axes: EngineInputAxes & Record<string, number>,
  held: Record<string, boolean>,
  pressed: Record<string, boolean> & { pointerLockLost?: boolean },
  released: Record<string, boolean>,
  pressedAt: Readonly<Record<string, number>>,
  actionData?: Record<string, unknown>,
  pointer?: InputPointer,
}

InputsDef = {
  axes?: Record<string, InputAxisDef>,
  actions?: Record<string, InputActionDef>,
  touch?: { enabled?: boolean; surfaces?: Record<string, TouchSurfaceDef>; active?: ScriptRef; style?: string },
  reservedAxisAliasesReported?: string[],
}

JobError = {
  message: string,
  code?: string,
  retriable?: boolean,
  attempts: number,
  deadlineExceeded?: boolean,
  retryAfterMs?: number,
  details?: unknown,
}

JobOptions = {
  priority?: "low" | "normal" | "high" = "normal",
  deadlineMs?: number, // Deadline in ms before job is treated as stale. A platform job (llm:, image:, jev:) waits at most 800000 ms.
  dedupeKey?: string,
  retries?: number,
  onPart?: (part: unknown) => void,
  count?: number,
  room?: string,
}

JobResult = {
  ok: boolean,
  data?: T,
  error?: JobError,
  durationMs: number,
}

JointBreakEvent = {
  jointId: string,
  type: JointType,
  cause: "force" | "torque" | "force-and-torque",
  force: number, // Peak constraint reaction force this tick (N).
  torque: number, // Peak constraint reaction torque this tick (N·m).
}

JointOptions = {
  anchor?: Vec3, // Anchor on THIS body: metres in its own frame, from its feet (default: [0,0,0])
  targetAnchor?: Vec3, // Anchor on the other body (`to`): metres in its own frame, from its feet (default: [0,0,0])
  axis?: Vec3,
  limits?: [number, number] | { min: number; max: number; stiffness?: number; damping?: number } | { cone?: number; twist?: [number, number]; stiffness?: number; damping?: number }, // Min/max limits: revolute, radians `to` turns against this body about axis, 0 where the two frames agree (this body's own turn stops at -max); prismatic, metres along axis; spring, metres between the anchors; { min, max, stiffness, damping } is the same window. A spherical joint takes { cone, twist }, both measured from the pose the two bodies stand in when the form is set (at the mint for a joint made with it): cone the half-angle in radians `to` swings off that pose, twist [min, max] radians it turns about its line (a ragdoll shoulder: { cone: 1.2, twist: [-0.8, 0.8] }); a half left out stays free. On every joint, stiffness (N·m per radian past the stop, N per metre on a prismatic or spring joint) and damping (N·m·s per radian or N·s per metre, left out: critical) make the stops a spring that pushes back harder the further past
  motor?: { velocity: number; maxForce: number },
  target?: number | { x: number; y: number; z: number; w: number }, // The pose the joint's drive pulls to, measured as `limits` are: revolute, radians; prismatic, metres along axis; spherical, a rotation `{ x, y, z, w }` (a THREE.Quaternion works) from the pose the two bodies stand in when the first target is set. Spring and fixed joints take none.
  strength?: number, // 0..1: how firmly the joint pulls to its target (0 or absent: no drive). It eases there like a critically damped spring, with no overshoot; 1 holds firm. A driven joint keeps its bodies awake while its target moves, and they cost what any moving body costs, every tick; a still target lets them sleep.
  restLength?: number, // Spring rest length in meters (spring joints only, default: 0)
  stiffness?: number, // Spring stiffness in N/m (spring joints only). Unset, 0: the spring pulls nothing and its damping is unread, so only its limits hold the two bodies (a rope).
  damping?: number, // Spring damping in N·s/m (spring joints only), read only while stiffness is above 0. Unset, 0.
  contactsEnabled?: boolean,
  breakForce?: number, // Break when peak joint reaction force exceeds this many newtons. 0 breaks under any load; unset (or Infinity) never breaks.
  breakTorque?: number, // Break when peak joint reaction torque exceeds this many newton-metres. 0 breaks under any load; unset (or Infinity) never breaks.
}

JointType = "revolute" | "fixed" | "spherical" | "prismatic" | "spring"

JumpCheckFloor = {
  top: number,
  by: string,
}

JumpCheckMover = {
  id: string,
  side: "from" | "to" | "both",
  period: number | null,
  periodFit?: number,
  sampledSeconds: number,
  share: number,
  windows: [number, number][],
  closest?: { rise: number; run: number; maxRun?: number; reason: JumpCheckReason; in: number },
}

JumpCheckReason = "rise_exceeds_apex" | "run_exceeds_reach" | "no_floor_at_from" | "no_floor_at_to" | "terrain_unloaded"

JumpCheckResult = {
  reachable: boolean,
  reason?: JumpCheckReason,
  floorFrom: JumpCheckFloor | null,
  floorTo: JumpCheckFloor | null,
  rise?: number, // floorTo.top − floorFrom.top, metres (when both stand)
  run: number, // Horizontal metres from `from` to `to`
  apex: number, // Metres the arc rises above the take-off floor
  maxRun?: number, // Horizontal metres the feet carry before they come down to the landing's height; absent when the rise is above the apex
  time?: number, // Seconds in the air to the landing's height
  approximate: string[],
  exact?: string,
  mover?: JumpCheckMover,
  params: { speed: number; jumpSpeed: number; gravity: number; capsuleRadius: number; capsuleHeight: number; maxStep: number; body: string | null },
}

LegacyCameraDef = CameraCommon & {
  kind?: undefined,
  state?: TomeCameraState,
  pointerLock?: boolean | "drag" | { drag: "left" | "right" | "middle" } | { unadjustedMovement: boolean },
  hideLocalPlayer?: boolean,
}

LightAimSpec = "down" | "forward" | PositionSpec

LightSpec = | { kind: "ambient"; color?: Color; intensity?: number } | { kind: "hemisphere"; skyColor?: Color; groundColor?: Color; intensity?: number } | { kind: "directional"; color?: Color; intensity?: number; specular?: number; aim?: LightAimSpec; shadow?: { enabled?: boolean; softness?: number }; followCamera?: boolean } | { kind: "point"; color?: Color; intensity?: number; specular?: number; distance?: number; decay?: number; fan?: [number, number][]; passes?: ("screen" | "camera")[]; shadow?: { enabled?: boolean } } | { kind: "spot"; color?: Color; intensity?: number; specular?: number; distance?: number; angle?: number; penumbra?: number; decay?: number; aim?: LightAimSpec; passes?: ("screen" | "camera")[]; shadow?: { enabled?: boolean } } | { kind: "rect"; color?: Color; intensity?: number; specular?: number; width?: number; height?: number; distance?: number; aim?: LightAimSpec; passes?: ("screen" | "camera")[] }

LinePrimitiveSpec = {
  kind: "line",
  points?: [number, number, number][],
  segments?: boolean,
  count?: number,
  bounds?: { min: [number, number, number]; max: [number, number, number] },
}

MaterialOverridesSpec = DrawMaterialOverrides

MaterialSpec = StandardMaterialSpec | WaterMaterialSpec | ScriptedMaterialSpec

MorphTargetNamesResult = string[]

NoiseEvent = {
  position: Vec3,
  radius: number, // Emit radius in meters (before the listener's hearing multiplier).
  kind: string,
  sourceId: string,
  tick: number,
  data?: unknown,
}

NotifyDmOptions = {
  wake?: boolean,
  to?: string | { userId?: string | null },
  link?: string,
  savi?: string | { userId?: string | null },
}

ObjectAttachmentSpec = {
  bone?: string,
  skin?: true | { map?: Record<string, string> },
  socket?: string,
  part?: string,
}

ObjectAudience = "local" | "near" | "all"

ObjectQueryOptions = {
  radius?: number, // meters from center to each row's feetPosition
  center?: Vec3,
  tags?: string[],
  anyTags?: string[],
  excludeTags?: string[],
  ignoreSelf?: boolean,
  place?: string,
  select?: "objects" | "ids",
  objectId?: string,
}

ObjectQueryResult = {
  id: string,
  tags: string[],
  feetPosition: Vec3,
  state: Record<string, unknown>,
  userId?: string | null,
  objectId?: string,
}

ObjectRetention = "none"

ObjectView = ObjectQueryResult & Omit<Partial<ObjectProperties>, keyof ObjectQueryResult> & {
  worldFeetPosition: Vec3,
  worldRotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number; readonly yaw: number; readonly pitch: number; readonly roll: number },
  place: string,
  audience: ObjectAudience,
  visibility: ObjectVisibility | null,
  scope: "session" | "world",
  retention: ObjectRetention | "current",
  lifetime?: number, // Seconds left before the engine destroys this object: the row's `lifetime`, counted down live; `undefined` when the row carries none. Read and write, on ctx.self and every handle: `bolt.lifetime = 480` re-stamps the countdown from now (0 ends it at the next tick), `= null` clears it and the object lives on. `spawn({ lifetime: 5, … })` stamps it at birth. Non-enumerable: a dump never pays for the read.
  template?: string,
  name: string | null,
  simulatedBy: string | null, // Who runs it now: `"server"` (Spawn's machine for the room), `"platform"` (a row set to `"platform"`, below), a player's client id (that player's machine: their body's id is `"player/" + clientId`, so `player.id === "player/" + thing.simulatedBy` names them), or `null` when no machine runs it now (as when it rests far from every player). Read and write on ctx.self and every handle. `bank.simulatedBy = "platform"` keeps it running on the machine that runs sim.js, even with no player near, and saves that choice. `= null` restores ordinary behavior. No other value can be assigned.
  sleeping: boolean | null,
  awake: boolean | null,
  measure: { readonly volume: number; readonly mass: number } | null,
  triangles: number | null, // The triangles of the mesh this thing's geometry built (a `geometry(ctx)` generator, a custom geometry): its finished mesh, what it draws up close, the count the engine holds from the build, so nothing runs again to read it. An instance set reads its near level once per copy it draws. `null` until the mesh is built, and on a thing drawn from no geometry of its own (a model's count is `ctx.world.assets[ref].triangles`; a box or a sphere). Read-only; the same dot on ctx.self; non-enumerable.
  skeleton: BoneInfoResult,
  destination: { readonly onlineCount: number | null } | null,
  env: EnvView,
  velocity: Vec3,
  angularVelocity: Vec3,
  forces: Record<string, ForceEntrySpec | null | undefined>,
  controller: string | null,
  controlling: ObjectView | null,
  anim: Record<string, unknown>,
  behavior: string[],
  behaviorHealth?: BehaviorHealth,
  spectating: boolean,
  gains?: Partial<Record<Bus, number>>,
  parent: ObjectView | null,
  children: ObjectView[],
}

ObjectVisibility = "owner" | "platform"

OklchString = string

OutOfBoundsEvent = {
  bottom: number, // The bound that was crossed (`worldBounds.bottom`, or the place's default: 64 m under its lowest floor: a heightmap's built ground, a voxel volume's floor, else the spawn point or the origin plane).
  position: Vec3,
  placeId: string,
  respawnPoint: Vec3,
}

OverlapOptions = {
  place?: string,
  ignoreSelf?: boolean,
  ignoreEntities?: string[],
  tags?: string[],
  anyTags?: string[],
  excludeTags?: string[],
  includeSensors?: boolean,
}

OverlapResult = {
  objects: string[],
  approximate: string[],
  terrain: boolean | null,
}

PivotSpec = "feet" | "center" | "top" | [u: number, v: number, w: number] | Vec3

PlaceCreateOptions = PlaceDef & {
  persistence: PlacePersistence,
}

PlaceDef = {
  mode?: PlaceMode,
  gravity?: Vec3,
  tickBase?: number, // Hz. The room steps every place at ONE rate, the default place's tickBase; another place's tickBase is kept and read back, and steps nothing.
  damping?: number,
  terrain?: TerrainDef,
  atmosphere?: AtmosphereDef,
  camera?: CameraDef,
  material?: MaterialSpec,
  lighting?: string,
  sky?: string,
  inputs?: InputsDef,
  ui?: GameUIDef,
  listenerEntity?: string,
  acoustics?: { reverb?: number },
  fields?: Record<string, SerializedField>,
  fieldConfig?: Record<string, FieldConfig>,
  objects?: ObjectSpec[],
  defaultSpawnPoint?: PositionSpec,
  defaultSpawnRotation?: RotationSpec,
  arrival?: string,
  returnDoor?: false | { lifetime?: number },
  pregenerate?: boolean,
  mintedFrom?: string,
  instance?: PlaceInstance,
  persistence?: PlacePersistence,
  policy?: { admits?: string; onArrive?: string; onLeave?: string },
  worldBounds?: WorldBoundsDef,
}

PlaceFieldHandle = {
  runtime: FieldLayerHandle,
  authored: FieldLayerHandle,
  grid: FieldChunkGrid,
  changes(at?: number): { readonly chunks: string[]; readonly at: number },
}

PlaceFieldsHandle = {
  [fieldName: string]: PlaceFieldHandle,
}

PlaceInstance = "shared" | "party" | "solo"

PlaceMode = "3d" | "2d-side" | "2d-top" | "ui"

PlaceObjectsCollection = Iterable<ObjectView> & {
  [objectId: string]: ObjectView | undefined,
}

PlacePersistence = "ephemeral" | "session" | "persistent"

PlaceScopeHandle = {
  id: string,
  name: string,
  players: PlayerQueryResult[],
  playerCount: number, // Everyone standing in this place, the players past `players`' 64 included. Read-only.
  objects: PlaceObjectsCollection,
  state: Record<string, unknown>,
  atmosphere: Record<string, unknown> & { readonly sunState?: AtmosphereSunState | null },
  terrain: Record<string, unknown> & { readonly marks: Record<string, unknown>; readonly materials: Record<string, unknown> | Array<Record<string, unknown> & { id: string }>; runtimeEdits?: undefined; readonly spacing: number | null; heightAt(x: number, z: number): number | null; materialAt(x: number, z: number): string | null; colorAt(x: number, y: number, z: number, normal: Vec3 | readonly [number, number, number]): { color: Color; roughness: number; metalness: number; emissive: Color; emissiveIntensity: number } | null; scatterIn(min: { x: number; z: number }, max: { x: number; z: number }): ScatterInstance[]; stroke(field: string, brush: TerrainBrush): TreeOpsVerdict | undefined },
  voxels: { readonly [x: number]: { readonly [y: number]: { [z: number]: string | null } }; solid(x: number, y: number, z: number): boolean | null; raycast(origin: Vec3, direction: Vec3, options?: VoxelRaycastOptions): VoxelRaycastHit | null; fill(min: Vec3, max: Vec3, material: string | null, opts?: VoxelFillOptions): boolean; stamp(structure: VoxelStructureSource, cell: Vec3, opts?: PlaceStructureOptions): boolean; query(options: VoxelQueryOptions): VoxelQueryHit[]; interact(x: number, y: number, z: number): boolean; read(min: Vec3 | readonly [number, number, number], max: Vec3 | readonly [number, number, number]): { min: [number, number, number]; size: [number, number, number]; palette: Array<string | null>; cells: Int16Array; states: Uint16Array } },
  tiles: { readonly [x: number]: { [y: number]: number | null } },
  fields: PlaceFieldsHandle,
  mode: PlaceMode | undefined,
  gravity: Vec3,
  tickBase: number,
  damping: number,
  listenerEntity: string | undefined,
  acoustics: Record<string, unknown>,
  fieldConfig: Record<string, unknown>,
  defaultSpawnPoint: Record<string, unknown>,
  defaultSpawnRotation: Record<string, unknown>,
  arrival: string | undefined,
  returnDoor: false | Record<string, unknown>,
  pregenerate: boolean | undefined,
  persistence: PlacePersistence | undefined,
  policy: Record<string, unknown>,
  worldBounds: Record<string, unknown>,
  mintedFrom: string | undefined,
  owner: string | null,
  timeScale: number, // The rate this place's simulation runs at, the same for everyone in it: 0 stops it, 1 is normal speed, 2 is twice it. Scripts' `dt`, sim.js `ctx.dtMs`, physics, `after()` timers, `animate`, clips, sprites, particles, effects, the water, the sky's clouds and stars, foliage sway and a material's `time` here run at it; `ctx.now()`, the camera, UI and sound do not. Room state, saved with the room; delete / = null returns it to 1.
}

PlaceStructureOptions = {
  place?: string,
  author?: boolean,
  id?: string,
}

PlacesCollection = Iterable<PlaceScopeHandle> & {
  [placeName: string]: PlaceScopeHandle | undefined,
}

PlayerFriend = {
  userId: string,
  displayName: string,
  portraitUrl: string | null,
}

PlayerGuild = {
  id: string,
  name: string,
  rank: "member" | "officer" | "leader",
}

PlayerMail = {
  id: string,
  from: PlayerMailPerson,
  to: PlayerMailPerson,
  topic: string,
  text: string,
  at: number,
  read: boolean,
  retracted: boolean,
}

PlayerMailPerson = {
  userId: string,
  displayName: string,
}

PlayerParty = {
  id: string,
  leader: boolean,
  size?: number,
}

PlayerProfile = {
  displayName: string,
  userId?: string,
  avatarUrl?: string,
  outfit?: SessionOutfit,
  wisps?: readonly SessionWisp[],
  den?: string,
  portraitUrl?: string,
  isGuest?: boolean,
  isTestAccount?: boolean,
}

PlayerQueryResult = ObjectQueryResult & {
  displayName: string | null,
  userId: string | null,
  portraitUrl: string | null,
  place: string,
  isLocal: boolean,
  isEditor: boolean,
  isGodMode: boolean,
  isGuest: boolean,
  isTestAccount: boolean,
  party: PlayerParty | null,
  partyMembership: PlayerParty | null | undefined,
  guild: PlayerGuild | null,
  latencyMs: number | null, // This player's ping: this machine's round trip to the room's server, whole ms, refreshed every few seconds; a number on the machine whose eyes this player is (`ctx.self.latencyMs` in ui.js and in a player behavior; the players row where `isLocal` is true), null on every other player's row, on the server and before the first measurement. Read-only: the wire measures it, a game never writes it.
  inputHeld: boolean,
  talking: boolean,
  mail: readonly PlayerMail[],
  friends: readonly PlayerFriend[],
  spectating: boolean,
  wisps: readonly SessionWisp[],
  den: string | null,
  region: EdgeHint | null,
}

PointsPrimitiveSpec = {
  kind: "points",
  count: number, // how many points, one round point a copy (instanceIndex 0 to count − 1), each placed by the object's PointsNodeMaterial (builtin/three): positionNode, sizeNode in CSS pixels
  bounds?: { min: [number, number, number]; max: [number, number, number] },
}

PositionSpec = { x: number; z: number } | { x: number; y: number; z: number } | { x: number; z: number; y: TerrainOffset } | { x: number; z: number; y: "surface" } | { tile: [number, number]; offset?: [number, number, number] } | CameraAttachPositionSpec

PresenceRow = {
  userId: string,
  world: string | null | undefined,
  room: string | null | undefined,
}

PrimitiveSockets = Record<string, Vec3 | [number, number, number] | { position: Vec3 | [number, number, number]; direction?: Vec3 | [number, number, number] }>

RaycastHit = {
  position: Vec3,
  normal: Vec3,
  distance: number,
  id: string | null,
  world?: string,
  address?: string,
  durableId?: string | null,
  doors?: ReadonlyArray<{ id: string; link: string; world: string; exit: string | null }>,
  far?: { position: Vec3; normal: Vec3 },
  door?: { link: string; verdict: "through-spent" | "unheld" | "no-exit"; message: string },
  approximate?: true,
  faceIndex?: number, // on a drawn-triangle hit (hits: "geometry" or "both"): the triangle's index in the thing's one list of faces (a model's meshes in order), the same triangle at rest or posed; absent on a collider, sprite or bounds hit
  bone?: { name: string; position: Vec3; normal: Vec3 }, // on a drawn-triangle hit (hits: "geometry" or "both") on a rigged thing: the bone the skin at the hit rides most (`name`), and the hit's `position` and `normal` in that bone's frame, the frame `attachment: { bone: name }` places a child in; absent on a collider, sprite or bounds hit and on a thing with no rig
}

RaycastProbeResult = {
  hit: RaycastHit | null,
  hits: RaycastHit[],
  verdict: RaycastVerdict,
}

RaycastVerdict = { queryable: false; reason: "colliders-not-loaded"; message: string; terrain: boolean | null; pendingGeometry?: string[] } | { queryable: true; pendingColliders: string[]; pendingColliderCount: number; terrain: boolean | null; pendingGeometry?: string[] }

RectangleSplineShapeSpec = {
  kind: "rectangle",
  center: SplinePointSpec,
  width: number,
  depth: number,
  yaw?: number,
}

RoadHedgesSpec = {
  sides?: RoadsideFeatureSides,
  width?: number,
  height?: number,
  gap?: number,
  style?: "trimmed" | "wild",
}

RoadLampPostsSpec = {
  sides?: RoadsideFeatureSides,
  spacing?: number,
  offset?: number,
  poleHeight?: number,
  style?: | "streetlight-classic" | "streetlight-curved" | "streetlight-lantern" | "streetlight-double" | "streetlight-globe" | "streetlight-modern" | "streetlight-pendant" | "streetlight-industrial" | "streetlight-victorian" | "streetlight-art-deco" | "streetlight-harbor" | "streetlight-park" | "streetlight-neon" | "streetlight-rustic" | "streetlight-campus" | "streetlight-gaslamp" | "streetlight-boulevard" | "streetlight-solar" | "streetlight-transit" | "streetlight-pagoda",
}

RoadMarkingsSpec = {
  centerLine?: boolean,
  edgeLines?: boolean,
  dashLength?: number,
  gapLength?: number,
  width?: number,
  color?: Color,
}

RoadRoadsideSpec = {
  sidewalks?: boolean | RoadSidewalksSpec,
  hedges?: boolean | RoadHedgesSpec,
  lampPosts?: boolean | RoadLampPostsSpec,
  markings?: boolean | RoadMarkingsSpec,
}

RoadSidewalksSpec = {
  sides?: RoadsideFeatureSides,
  width?: number,
  height?: number,
  gap?: number,
}

RoadsideFeatureSides = "left" | "right" | "both"

RotationSpec = number | { yaw?: number; pitch?: number; roll?: number } | { x: number; y: number; z: number; w: number } | { lookAt: PositionSpec; include?: ("yaw" | "pitch" | "roll")[] }

RoutingDef = {
  script?: ScriptRef,
  maxPlayers?: number,
  persistence?: PlacePersistence,
  alwaysOn?: boolean,
}

SaidLine = {
  text: string,
  scope: string,
  by: PlayerQueryResult,
  kind: string,
  at: number,
  nonce: string,
  picture?: SharedPicture,
}

ScatterBounds = | { shape: "circle"; radius: number } | { shape: "rectangle"; width: number; depth: number } | { shape: "polygon"; points: [number, number][] } | { shape: "ring"; innerRadius: number; outerRadius: number } | { shape: "path"; points: [number, number][]; width: number } | { shape: "field"; field: string; threshold?: number; density?: number }

ScatterInstance = {
  id: string | null,
  bed: string,
  feetPosition: Vec3 | null,
  yaw: number | null,
  scale: Vec3 | null,
  bounds: { min: Vec3; max: Vec3; size: Vec3; center: Vec3 },
}

ScriptRef = string

ScriptedMaterialSpec = {
  kind: "scripted",
  color?: Color,
  emissive?: Color,
  emissiveIntensity?: number,
  metalness?: number,
  roughness?: number,
  opacity?: number,
  transparent?: boolean,
  alphaTest?: number, // three's alphaTest: the alpha cutoff (0..1) under which a texel is cut
  side?: "front" | "back" | "double",
  depthWrite?: boolean,
  depthTest?: boolean,
  renderOrder?: number, // draw order among transparent things (higher draws later)
  polygonOffset?: boolean,
  polygonOffsetFactor?: number,
  polygonOffsetUnits?: number,
  blending?: "none" | "normal" | "additive" | "subtractive" | "multiply" | "custom",
  blendSrc?: BlendFactor,
  blendDst?: BlendFactor,
  blendEquation?: BlendEquation,
  blendSrcAlpha?: BlendFactor,
  blendDstAlpha?: BlendFactor,
  blendEquationAlpha?: BlendEquation,
  premultipliedAlpha?: boolean,
  colorWrite?: boolean,
  clippingPlanes?: ClipPlane[] | null,
  clipIntersection?: boolean,
  clipShadows?: boolean,
  underwater?: UnderwaterSpec,
  drawsOver?: string[] | { parts: string[]; strength?: number; angle?: number },
  outline?: boolean | { color?: Color; width?: number; warm?: number; lightness?: number } | null,
  script: ScriptRef,
  params?: Record<string, number | boolean | string | DrawMaterialParamTable>,
  view?: { link: string; oneWay?: boolean; spill?: number; sound?: number } | { camera: ViewCamera; cadence?: string } | null,
}

SerializedVoxelTemplate = {
  version: 1,
  bounds: [[number, number, number], [number, number, number]],
  palette: string[],
  voxels: Array<[number, number, number, number] | [number, number, number, number, number]>,
}

SharedPicture = {
  url: string,
  width: number,
  height: number,
}

SoundEndEvent = {
  soundId: string,
  clip: string,
  durationSeconds: number, // The clip's decoded length, or the span its `audio:` clip row played, from where it began to its `end` or the clip's end (before pitch: it played for durationSeconds ÷ pitch).
}

SplineLightStripsSpec = {
  color?: Color,
  intensity?: number,
  width?: number,
}

SplinePointSpec = [number, number, number] | PositionSpec

SplineSample = {
  position: Vec3,
  tangent: Vec3,
  normal: Vec3,
  lateral: Vec3,
  rotation: { x: number; y: number; z: number; w: number },
  distance: number, // Distance along the spline in meters.
  progress: number, // Normalized progress along the spline from 0 to 1.
}

SplineShapeSpec = RectangleSplineShapeSpec

SplineSpec = {
  kind: "road" | "pipe" | "fence" | "hedge" | "powerline" | "wall" | "guardrail" | "handrail" | "railway" | "streetlight" | "stringlight" | "bannerline" | "conveyor" | "canal" | "curb" | "stairs" | "boardwalk" | "bollard" | "barrier" | "zipline" | "aqueduct" | "coaster" | "data-only" | "scripted",
  script?: ScriptRef,
  params?: Record<string, unknown>,
  seed?: number,
  points?: SplinePointSpec[],
  beziers?: CubicBezierSpec[],
  shape?: SplineShapeSpec,
  samples?: number | "auto",
  closed?: boolean,
  cornerMode?: "smooth" | "hard",
  style?: SplineStyle,
  snapToTerrain?: boolean,
  yOffset?: number,
  up?: [number, number, number],
  width?: number | number[],
  radius?: number,
  spacing?: number, // meters between posts / bulbs / bollards
  bulbSpacing?: number, // Distance in meters between bulbs along a stringlight strand (default 0.4: a dense warm festoon), on both the draped and `poles: true` layouts. `spacing` never thins the bulbs: that field is the support pitch (poles every `spacing` when supports exist).
  overlap?: number,
  beltSpeed?: number,
  lightStrips?: boolean | SplineLightStripsSpec,
  roadside?: RoadRoadsideSpec,
  tangentAxis?: "x" | "z",
  height?: number,
  thickness?: number,
  poleHeight?: number, // Wire height for the wire kinds (powerline, stringlight, bannerline, zipline, streetlight). `points` above the terrain ARE the wire line; points at terrain height hang the wire ~`poleHeight` above the ground. When poles exist (default on powerline, `poles: true` on stringlight/bannerline, always on streetlight/zipline) each pole runs from the terrain under it up to the line.
  poles?: boolean,
  wireCount?: number,
  wireHeight?: number,
  wireSag?: number, // Strand looseness for the wire kinds. On a draped wire (stringlight and bannerline without `poles: true`, a powerline with `poles: false`) it is meters of droop per 10 m of span, default 0.8: sag scales with each span's length (a 0.6 run dips ~1 m on a 17 m crossing and ~1.8 m on a 30 m one), so long building-to-building runs hang deep and short hops stay tidy. Where poles stand (a powerline by default, `poles: true` on stringlight/bannerline, always on streetlight/zipline) it is absolute meters of droop per pole-to-pole span instead, since generated pole spans are uniform `spacing`-sized: default 0.35 on a powerline, 0.18 on a zipline, 0.45 on the others.
  wireRadius?: number,
  rolls?: number[],
  revision?: number,
}

SplineStyle = | "picket" | "privacy" | "post-and-rail" | "split-rail" | "iron" | "chain-link" | "trimmed" | "wild" | "wood-distribution" | "steel-transmission" | "metal" | "old-wood" | "streetlight-classic" | "streetlight-curved" | "streetlight-lantern" | "streetlight-double" | "streetlight-globe" | "streetlight-modern" | "streetlight-pendant" | "streetlight-industrial" | "streetlight-victorian" | "streetlight-art-deco" | "streetlight-harbor" | "streetlight-park" | "streetlight-neon" | "streetlight-rustic" | "streetlight-campus" | "streetlight-gaslamp" | "streetlight-boulevard" | "streetlight-solar" | "streetlight-transit" | "streetlight-pagoda"

Sprite2DMetaSpec = {
  outline?: [number, number][],
  world_height?: number,
  target_size?: number,
  style?: "pixel" | "non-pixel",
  kind?: "sprite" | "texture",
  anchor_uv?: [number, number],
  view?: string,
  content_box?: [number, number, number, number],
}

SqlAPI = {
  size(): Promise<number>,
  backup(label: string): Promise<{ label: string; bookmark: string; ts: number }>,
  restore(target: string | number | { label?: string; ts?: number }): Promise<{ restoredTo: string }>,
}

StandardMaterialSpec = {
  texture?: string | null,
  time?: number, // The .mp4 clip's playhead in seconds: every player's screen shows `paused ? time : time + speed * (ctx.now() - timeAt) / 1000`, and a write jumps every screen. One address is one clip: the newest write on any surface wearing it moves it. An .m3u8 plays its live point.
  timeAt?: number, // World-clock milliseconds (ctx.now()) at which `time` applies; the engine stamps it for you.
  paused?: boolean,
  speed?: number, // The .mp4 clip's playback speed on every player's screen (default 1; 0.5 is half speed): a write keeps the frame it shows and plays on at the new speed.
  view?: { link: string; oneWay?: boolean; spill?: number; sound?: number } | { camera: ViewCamera; cadence?: string } | null,
  canvas?: string | null,
  pbr?: boolean | "fal1",
  normalMap?: string,
  roughnessMap?: string,
  metalnessMap?: string,
  alphaMap?: string,
  normalScale?: number,
  alphaTest?: number, // three's alphaTest: the alpha cutoff (0..1) under which a texel is cut
  color?: Color,
  repeat?: [number, number],
  textureScale?: number, // meters per tile under wrap: "repeat" (divides the 1-tile-per-meter density; default 1); without wrap: "repeat" it reads nothing
  wrap?: "repeat" | "clamp",
  filter?: "pixel" | "linear",
  metalness?: number,
  roughness?: number,
  opacity?: number,
  transparent?: boolean,
  emissive?: Color,
  emissiveIntensity?: number,
  emissiveMap?: string,
  unlit?: boolean,
  dissolve?: number, // 0 intact → 1 gone; tween it for a spawn-in / death-out
  side?: "front" | "back" | "double",
  vertexColors?: boolean,
  depthWrite?: boolean,
  depthTest?: boolean,
  renderOrder?: number, // draw order among transparent things (higher draws later); in a 2D place it is a mesh's layer among sprite sortingLayers; a part that must read through another part of its own character wears drawsOver instead
  drawsOver?: string[] | { parts: string[]; strength?: number; angle?: number },
  outline?: boolean | { color?: Color; width?: number; warm?: number; lightness?: number } | null,
  polygonOffset?: boolean,
  polygonOffsetFactor?: number,
  polygonOffsetUnits?: number,
  blending?: "none" | "normal" | "additive" | "subtractive" | "multiply" | "custom",
  blendSrc?: BlendFactor,
  blendDst?: BlendFactor,
  blendEquation?: BlendEquation,
  blendSrcAlpha?: BlendFactor,
  blendDstAlpha?: BlendFactor,
  blendEquationAlpha?: BlendEquation,
  premultipliedAlpha?: boolean,
  colorWrite?: boolean,
  clippingPlanes?: ClipPlane[] | null,
  clipIntersection?: boolean,
  clipShadows?: boolean,
  overrides?: MaterialOverridesSpec,
}

TerrainBrush = {
  center: Vec3,
  radius: number,
  fn: (p: { x: number; z: number }, inset: number, current: number) => number, // returns the cell's new value; `inset` is metres in from the rim (`radius` at the centre, 0 at the edge), so a 0..1 falloff is `inset / radius`; `current` is the cell's value now
}

TerrainOffset = {
  terrain: number,
}

TomeCameraState = Record<string, unknown> & {
  orthoSize?: number, // The orthographic view's half-height in metres, the dial a 2D place's rig zooms with: default 12 (20 in a "2d-top" place).
  orthoSqueeze?: number, // The orthographic view's height scale (1 or unset: no squeeze): the view keeps its width and shows `orthoSize × orthoSqueeze` metres above and below its centre. For an eye looking down at angle a below the horizon, `Math.sin(a)` draws a metre of ground depth as tall as a metre across; at 45° (`Math.SQRT1_2`) a metre of height too.
}

TomeEars = Readonly<Record<string, TomeEventHandler>>

TomeEventHandler = (ctx: ObjectAPI, payload: unknown, meta: TomeEventMeta) => void

TomeEventMeta = {
  name: string,
  sourceId: string,
  placeId: string,
  to?: string,
  origin?: { world: string; actor: string; script: string | null; door: string | null; exit: string | null; address: string },
}

TomeEventOptions = {
  place?: string,
  once?: boolean,
}

TradeReceipt = { offered: true; id: string; give: string; with: string; for: string } | { offered: false; refused: "unknown-target" | "not-held" | "not-mine" | "same-party" | "withdrawn"; message: string }

TraverseCheckBlockReason = "riser_exceeds_autostep" | "slope_exceeds_max" | "gap" | "ceiling" | "destination_below_floor" | "terrain_unloaded"

TraverseCheckOptions = {
  place?: string,
  body?: string,
  includeDynamicBodies?: boolean,
  ignoreEntities?: string[],
}

TraverseCheckResult = {
  traversable: boolean,
  blockedAt?: Vec3,
  reason?: TraverseCheckBlockReason,
  blockedBy?: string,
  detail?: { riser?: number; maxStep?: number; slopeDeg?: number; maxSlopeDeg?: number; clearance?: number; requiredClearance?: number; drop?: number },
  approximate: string[],
  exact?: string,
  params: { maxStep: number; maxSlopeDeg: number; capsuleRadius: number; capsuleHeight: number; body: string | null },
}

UIDef = {
  render?: ScriptRef,
}

UnderwaterSpec = {
  enabled?: boolean,
  depth?: number,
  color?: Color,
  visibility?: number,
  scatter?: number,
  distortion?: number,
}

UpdateSchedule = {
  every?: number | { seconds: number },
  near?: UpdateScheduleNearRule | readonly UpdateScheduleNearRule[],
}

UpdateScheduleNearRule = {
  tag?: string,
  radius: number,
}

Vec3 = {
  x: number,
  y: number,
  z: number,
}

ViewAPI = {
  camera: ViewCameraPose | { parent: string; eye?: Vec3; aim?: Vec3 | "forward" | string; fov?: number; projection?: "perspective" | "orthographic"; orthoSize?: number; layers?: string[] } | null,
  pixel: number, // the angle in radians one screen pixel spans at the middle of this machine's picture (its fov over its rows). A level whose smallest cube is c metres hands over at c / ctx.view.pixel metres. Read-only.
  fps: number, // the frames this machine's picture presented in its last second, a whole number. 0 before the first second and on a machine with no picture (the server). Read-only.
  drawCalls: number, // the draw calls this machine's picture made in its last frame, as three's renderer.info.render.calls counts them: every pass, the shadow maps included; read again once a second. 0 before the first second and on a machine with no picture (the server). Read-only.
  triangles: number, // the triangles this machine's picture drew in its last frame, in its view and its shadow maps. Read-only.
  cpuMs: number, // the milliseconds of CPU this machine's renderer spent on each frame, the mean over the frames its last second drew, fractional: the work before the GPU (the game's scripts and physics run apart and are not counted). A second that drew no frame keeps the reading before it. 0 before the first second and on a machine with no picture (the server). Read-only.
  gpuMs: number, // the milliseconds each frame of this machine's picture took on the GPU, the mean over the frames its last second drew by the GPU's own timer counted at its full clock, fractional, kept as cpuMs is. 0 where the adapter has no GPU timer (timestamp queries), before the first second and on a machine with no picture. Read-only.
  frames: { cpuMs: number; gpuMs?: number }[], // each frame this machine's picture drew since this handle's last read, oldest first, as `{ cpuMs, gpuMs }`: its CPU milliseconds as cpuMs measures them, and its GPU milliseconds by the GPU's own timer counted at its full clock, absent where the adapter has no GPU timer or the timer did not read that frame. Frames arrive about once a second, so a read between arrivals is `[]`. A read empties this handle's list. A handle unread for about a second holds nothing and starts over at its next read. [] on a machine with no picture. Read-only.
  memoryMB: number | null, // the memory Spawn uses, in whole megabytes, at the engine's newest reading: in the Spawn app, all of the app's memory on this machine; in Chrome and Edge, only the game page's JavaScript memory, which can be a minute or more old. null in Safari, on iPhone and iPad, in Firefox, before the first reading and on the server. Read-only.
  gpuMemoryMB: number, // the GPU memory this machine's picture holds, in whole megabytes: every texture and buffer its renderer made, as the engine counts what it asked the GPU for, read again once a second. 0 before the first second and on a machine with no picture (the server). Read-only.
  renderScale: number, // the share, on each side, of this machine's full picture at which the engine draws the world: 1 at full, 0.5 at half the width and height, below 1 while it draws smaller to keep frames fast. Full is the engine's own full picture, on a dense screen fewer pixels than the screen. The HUD (ui.js) is not scaled. Read again once a second, to a thousandth. 0 before the first second and on a machine with no picture (the server). Read-only.
  netInBytes: number, // the bytes this machine's connection to its room took in over its last whole second: every message the room sent it (the game's state, other players' moves, the room's answer to this machine's heartbeat, one message every 5 s). Downloads of models, pictures and sounds are not counted. 0 before the first second, with no room and on a machine with no picture (the server). Read-only.
  netOutBytes: number, // the bytes this machine's connection to its room sent over its last whole second, counted as netInBytes is: every message it sent the room (its inputs, the state of what it simulates, its heartbeat, one message every 5 s). Read-only.
  netInMessages: number, // the messages this machine's connection to its room took in over its last whole second, the same messages netInBytes counts the bytes of, one for each. Read-only.
  netOutMessages: number, // the messages this machine's connection to its room sent over its last whole second, the same messages netOutBytes counts the bytes of, one for each. Read-only.
  site: string | null, // the site whose page holds this machine's picture when it is not Spawn's own: the host of the page framing the game, as the browser names that page ("x.com" under a page at x.com, "platform.twitter.com" under X's embedded post on another site, a creator's own domain on their site); "" when the browser names no page around the frame. null on spawn.co's own pages, in the Spawn app, and on a machine with no picture (the server). Read-only.
}

ViewCamera = | "mirror" | { mirror: true; layers?: string[] } | (ViewCameraPose & { place?: string }) | { eye: Vec3; corners: [Vec3, Vec3, Vec3]; place?: string; layers?: string[] } | { parent: string; eye?: Vec3; aim?: Vec3 | "forward" | string; fov?: number; projection?: "perspective" | "orthographic"; orthoSize?: number; layers?: string[]; place?: string }

ViewCameraPose = {
  eye: Vec3,
  aim: Vec3 | string,
  fov?: number,
  projection?: "perspective" | "orthographic",
  orthoSize?: number,
  layers?: string[],
}

VoxelCoord = {
  x: number,
  y: number,
  z: number,
  place?: string,
}

VoxelFillOptions = {
  state?: number,
  place?: string,
}

VoxelMarkFillOptions = {
  color?: Color,
  opacity?: number = 0.14, // Fill opacity from 0 to 1.
  inset?: number = 0.08, // Offset from the voxel faces, as a share of the cell's side: 0.05 on a 0.5 m cell is 2.5 cm, inward in an open cell, outward round a block.
}

VoxelMarkOutlineOptions = {
  color?: Color,
  opacity?: number = 1, // Outline opacity from 0 to 1.
  inflate?: number = 0.03, // Extra world-space size added outside the voxel bounds, in meters.
}

VoxelMarkPulseOptions = {
  speed?: number = 2, // Pulses per second.
  intensity?: number = 0.18, // Pulse intensity as a multiplier amount (0..1; at 1 the mark fades out fully at each dip).
}

VoxelQueryHit = {
  x: number,
  y: number,
  z: number,
  material: string,
  state: number,
}

VoxelQueryOptions = {
  tag: string,
  radius: number, // Search radius in world meters from origin. Cells beyond this distance are excluded.
  center?: Vec3,
  place?: string,
}

VoxelRaycastHit = {
  position: Vec3,
  normal: Vec3,
  distance: number,
  voxel: Vec3,
  adjacentVoxel: Vec3 | null,
  materialId: string,
  state: number,
}

VoxelRaycastOptions = {
  distance?: number, // Maximum distance to cast (default: 64)
  includeLiquids?: boolean,
  place?: string,
}

VoxelStructureSource = string | SerializedVoxelTemplate | Record<string, unknown> | (() => unknown)

WaterMaterialSpec = {
  kind: "water",
  underwater?: UnderwaterSpec,
  color?: Color,
  opacity?: number,
  waveIntensity?: number,
  waveFrequency?: number, // Unitless spatial scale; default 7.3728 for this water material. Higher values make shorter waves; lower values make longer waves. Each wave stays at full strength up to half the sheet's smaller X/Z span, fades from half to one span, and is absent beyond that span.
  waveHeightScale?: number, // Wave height multiplier; 0 makes a flat sheet.
  flowDirection?: [number, number], // Flow direction in world X/Z on a level sheet. It is normalized. On a face steeper than 60° (a fall, a standing capsule's side) the water runs down the face under gravity whatever this says.
  flowSpeed?: number, // Flow speed control; 0.1 moves foam about 1.2 metres per second.
  roughness?: number, // Surface roughness, 0 to 1.
  normalScale?: number, // Ripple detail scale; larger values make smaller ripples.
  detailNormalStrength?: number, // Ripple normal strength; 0 removes small ripples.
  foamColor?: Color,
  foamStrength?: number, // Overall foam strength; 0 removes foam on a level sheet. A fall (a face steeper than 60°) is aerated by its flow whatever this says: flowSpeed 0 is a still glass sheet.
  foamScale?: number, // Foam pattern scale; larger values make smaller patches.
  contactFoamWidth?: number, // Contact band width in metres.
  shorelineFoamStrength?: number,
  shorelineFoamSoftness?: number,
  crestFoamCoverage?: number, // Fraction of wave crests that can foam, 0 to 1.
  crestFoamStrength?: number,
  causticsEnabled?: boolean,
  causticStrength?: number,
  causticScale?: number,
  depthColorDistance?: number, // Distance in metres over which water takes its deep color.
  refractionStrength?: number, // Strength of the surface view distortion; 0 disables it.
  swellAmplitude?: number, // Height of long sea swells in metres; 0 disables them.
  swellDirection?: [number, number], // Long swell direction in world X/Z. It is normalized.
  surfWidth?: number, // Width of the breaking surf zone in metres.
  wakeSeconds?: number, // How long, in seconds, the wake a body leaves on this water stays in the picture: the drawn rings and foam fade, and are gone this long after the last body nearby stops moving. Unset: the wake this water draws by default.
}

WorldBoundsDef = {
  bottom?: number | false,
}
```

## builtin/physics

Pass ctx first. raycast defaults to 200 meters and ignores the caller. physicsOnly: true selects colliders only. overlapPoint and overlapSegment return intersecting collider volumes. traverseCheck returns traversable, reason, and detail; its default step height is 0.3 meters. getInputRay uses the sampled pointer ray, or the camera's forward ray when no pointer ray is available. createWorld(opts) takes no ctx. It gives a physics world of your own on this machine, apart from the place, that moves only when you call step(dt). save() gives a snapshot of its whole state as bytes, and restore(bytes) rewinds the world to that snapshot. On one engine build, the same adds, writes and steps give the same bytes on every machine, so the world is deterministic: a rollback game restores the save of a late input's frame and steps again to the present frame. On a phone, a step of 50 moving bodies costs about 1.5 ms, so keep a rollback world to the bodies that the match needs.

```ts
raycast(ctx, origin: Vec3, direction: Vec3, opts?: number | { distance?, radius?, ignoreEntities?, ignoreSelf?, tags?, anyTags?, excludeTags?, bodies?: "static" | "dynamic" | "all", through?, physicsOnly?, multiple?, verdict?, shape? }): RaycastHit | RaycastHit[] | RaycastProbeResult | null
overlapPoint(ctx, point: Vec3, opts?: OverlapOptions): OverlapResult
overlapSegment(ctx, a: Vec3, b: Vec3, opts?: OverlapOptions & { radius? }): OverlapResult
traverseCheck(ctx, from: Vec3, to: Vec3, opts?: TraverseCheckOptions): TraverseCheckResult
jumpCheck(ctx, from: Vec3, to: Vec3, { speed, jumpSpeed, place?, body?, includeDynamicBodies?, ignoreEntities? }): JumpCheckResult
getInputRay(ctx, input?: InputState): { origin, direction, source } | null
createWorld(opts?: { gravity?: Vec3 }): Promise<PhysicsWorld>
PhysicsWorld.add({ body?: "dynamic" | "static" | "kinematic", collider: "box" | "sphere" | "capsule", size?: Vec3, radius?, height?, position?: Vec3, rotation?: Quat | { yaw, pitch, roll } | yaw, velocity?: Vec3, angularVelocity?: Vec3, mass?, friction?, restitution?, gravityScale?, linearDamping?, angularDamping?, lockedAxes?: ("x" | "y" | "z" | "rotX" | "rotY" | "rotZ")[] }): PhysicsBody
PhysicsWorld.step(dt?: number): void
PhysicsWorld.save(bodies?: PhysicsBody[]): Uint8Array; PhysicsWorld.save(into: Uint8Array): number; PhysicsWorld.restore(bytes: Uint8Array, bodies?: PhysicsBody[]): void
PhysicsWorld.remove(body: PhysicsBody): void
raycast(world: PhysicsWorld, origin, direction, opts?: number | { distance?, radius?, shape?, bodies?, ignoreEntities?: PhysicsBody[], multiple?, verdict? })
overlapPoint(world: PhysicsWorld, point, { ignoreEntities? })
overlapSegment(world: PhysicsWorld, a, b, { radius?, ignoreEntities? })
traverseCheck(world: PhysicsWorld, from, to, { body?: PhysicsBody, includeDynamicBodies?, ignoreEntities? })
jumpCheck(world: PhysicsWorld, from, to, { speed, jumpSpeed, body?, includeDynamicBodies?, ignoreEntities? })
getInputRay(world: PhysicsWorld, input?)
PhysicsBody.position: Vec3; PhysicsBody.rotation: Quat; PhysicsBody.velocity: Vec3; PhysicsBody.angularVelocity: Vec3
PhysicsBody.passThrough: PhysicsBody[]
```

## builtin/tween

Keyframes use dot paths into target fields. A value may be a scalar, waypoints, a relative string such as +=5, or per-segment objects with value, duration, and easing. duration and delay use seconds.

```ts
animate(ctx, target: string, keyframes: Record<string, AnimationKeyframeValue>, opts?: { duration?: number, easing?: string, delay?: number, direction?: "normal" | "reverse" | "alternate", loop?: boolean | number }): void
```

## builtin/spline

splineLength returns meters, or 0 for a non-spline id. at is 0 to 1 by default; space: distance uses meters. Assign object.spline = { id, at } to place an object on a spline.

```ts
splineLength(ctx, id: string): number
sampleSpline(ctx, id: string, at: number, opts?: { space?: "normalized" | "distance", tangentAxis?: "x" | "z" }): { position, tangent, normal, lateral, rotation, distance, progress } | null
projectToSpline(ctx, id: string, point: Vec3 | [x, y, z] | objectId, opts?): SplineSample | null
```

## builtin/math

shortestArc returns degrees in (-180, 180]. stepAngle takes dt and smoothing in seconds; smoothing defaults to 0.06, and 0 turns at once.

```ts
clamp(value: number, min: number, max: number): number
clamp01(value: number): number
lerp(a: number, b: number, t: number): number
lerp(a: OklchString, b: OklchString, t: number): OklchString
smoothstep(edge0: number, edge1: number, x: number): number
inverseLerp(a: number, b: number, value: number): number
remap(inMin: number, inMax: number, outMin: number, outMax: number, value: number): number
shortestArc(fromDeg: number, toDeg: number): number;
stepAngle(currentDeg: number, targetDeg: number, dt: Seconds, opts?: { smoothing?: Seconds; maxDegPerSec?: number }): number;
degToRad(deg: number): number
radToDeg(rad: number): number
```

## builtin/vec3

Vectors accept { x, y, z } or [x, y, z]. Rotations use degrees; a number means yaw. Euler order is yaw, pitch, roll about +Y, +X, +Z. Yaw 0 faces -Z. rotationFromDirection defaults to the -z axis.

```ts
add(a: Vec3Like, b: Vec3Like): Vec3
sub(a: Vec3Like, b: Vec3Like): Vec3
scale(v: Vec3Like, s: number): Vec3
dot(a: Vec3Like, b: Vec3Like): number
length(v: Vec3Like): number
normalize(v: Vec3Like): Vec3
distance(a: Vec3Like, b: Vec3Like): number
cross(a: Vec3Like, b: Vec3Like): Vec3
directionFromYawPitch(yaw: Degrees, pitch?: Degrees): Vec3;
rotate(rotation: Degrees | { yaw?, pitch?, roll? } | Quat, v: Vec3Like): Vec3;
rotationFromDirection(direction: Vec3Like, axis?: "x" | "y" | "z" | "-x" | "-y" | "-z"): Quat;
rotationFromEuler(euler: Degrees | { yaw?: Degrees, pitch?: Degrees, roll?: Degrees }): Quat;
eulerFromRotation(q: Quat): { yaw: Degrees, pitch: Degrees, roll: Degrees };
```

## builtin/easing

```ts
linear(t), easeOutBounce(t), easeInQuad(t), easeOutQuad(t), easeInOutQuad(t), easeInCubic(t), easeOutCubic(t), easeInOutCubic(t), easeInQuart(t), easeOutQuart(t), easeInOutQuart(t), easeInQuint(t), easeOutQuint(t), easeInOutQuint(t), easeInSine(t), easeOutSine(t), easeInOutSine(t), easeInExpo(t), easeOutExpo(t), easeInOutExpo(t), easeInCirc(t), easeOutCirc(t), easeInOutCirc(t)
Each takes t: number in [0, 1] and returns number.
```

## builtin/nav

findPath returns feet positions. ok: false means a cut-off path that ends at the reachable spot nearest the goal. partial: true means the search is still reading the ground: ask again on a later tick. An empty list with no partial means no path was found. Defaults use the caller's body size, step height, and slope limit; maxDrop is 3 meters and bodies is all. Call from a behavior with the place's physics available.

```ts
findPath(ctx, from: Vec3, to: Vec3, opts?: { radius?, height?, step?, slope?, maxDrop?, bodies?: 'all' | 'static', ignore?: string[], budget? }): { points: Vec3[], ok: boolean, partial?: true }
```

## builtin/path

Distances and spacing use meters. spacing defaults to 2. closed adds the return segment; do not repeat the first point. distance returns Infinity and nearest returns null beyond within. at wraps for a closed path and clamps for an open path.

```ts
createPath(points: ([x, z] | [x, y, z] | { x, y?, z })[], opts?: { closed?: boolean, smooth?: boolean, spacing?: number }): PathHandle
PathHandle.points: readonly [x, z][]
PathHandle.closed: boolean; PathHandle.length: number
PathHandle.distance(x, z, within?: number): number
PathHandle.nearest(x, z, within?: number): { x, y, z, distance, arcLength, t, segmentIndex, tx, tz } | null
PathHandle.at(arcLength: number): { x, y, z, tx, tz }
```

## builtin/ballistics

solveShot returns launch velocity and flight time, or null for an unreachable target. speed is meters per second; g is the magnitude of acceleration. elevation returns the low angle in radians.

```ts
solveShot(from: Vec3, to: Vec3, speed: number, g: number, lead?: { x, z } | Vec3 | null): { vel: Vec3, time: number } | null
elevation(speed: number, g: number, distance: number, rise: number): number | null
```

## builtin/room-routing

Use only in a routing script that exports pickRoom(ctx). firstOpenRoom selects the requested open room, an available room, or a new room. mostFullWithSpace returns null when none has space. roomFor gives a stable room name for a key.

```ts
export async function pickRoom(ctx: { player, rooms, requestedRoomId, game, rejectedRooms }): Promise<string | { room, persistence } | null>
firstOpenRoom(ctx): string;
mostFullWithSpace(ctx): string | null;
nextRoomName(rooms, exclude?: string[]): string;
roomFor(key: string): string;
```

## builtin/terrain

shore changes heights near the supplied water level. Defaults: apron 6, berm 0.3, grade 0.06, rejoin 24, shelf 2.2, shelfReach 6, drop 20, scale 1. Heights and distances use meters.

```ts
shore(height: number, level: number, opts?: { apron?: number, berm?: number, grade?: number, rejoin?: number, shelf?: number, shelfReach?: number, drop?: number, scale?: number }): number
```

## builtin/noise

```ts
simplex2(opts: { x, z, frequency?, amplitude?, seed? }): number
simplex3(opts: { x, y, z, frequency?, amplitude?, seed? }): number
fbm2(opts: { x, z, frequency?, amplitude?, octaves?, gain?, lacunarity?, seed? }): number
ridged(opts: { x, z, frequency?, amplitude?, octaves?, gain?, lacunarity?, ridgeGain?, seed? }): number
billowed2(opts: { x, z, frequency?, amplitude?, octaves?, gain?, lacunarity?, seed? }): number
gradient2(opts: { x, z, frequency?, seed?, delta? }): { x, z, magnitude }
domainWarp2(opts: { x, z, warpAmp?, warpFrequency?, frequency?, amplitude?, octaves?, gain?, lacunarity?, seed? }): number
voronoi2(opts: { x, z, frequency?, seed?, metric? }): { f1, f2, cell }
white2(opts: { x, z, seed? }): number
makeSeededRng(seed: number | string): { next(), double(), int32(), uint32(), range(min, max) }
```

## builtin/voxels

```ts
part(): VoxelPart
VoxelPart.set({ x, y, z, material }): VoxelPart
VoxelPart.fill({ from, to, material }): VoxelPart
VoxelPart.hollowBox({ from, to, material }): VoxelPart
VoxelPart.sphere({ center, radius, material, filled? }): VoxelPart
VoxelPart.cylinder({ base, radius, height, axis?: "x" | "y" | "z", material, filled? }): VoxelPart
VoxelPart.cone({ base, radius, height, axis?, material, filled? }): VoxelPart
VoxelPart.pyramid({ base, size, height, material, filled? }): VoxelPart
VoxelPart.torus({ center, majorRadius, minorRadius, axis?, material, filled? }): VoxelPart
VoxelPart.line({ from, to, material, thickness? }): VoxelPart
VoxelPart.add(source: VoxelPart | serialized, { at? }): VoxelPart
VoxelPart.bounds(): [[x, y, z], [x, y, z]] | null
VoxelPart.serialize(): { version: 1, bounds, palette: string[], voxels: [x, y, z, paletteIndex][] }
material(id: string): Brush
checker(a: string, b: string): Brush
random(ids: string[], weights?: number[]): Brush
noise(ids: string[], opts?: { scale?: number, seed?: number | string, weights?: number[] }): Brush
```

## builtin/vibe

Export pattern(ctx) from the audio script. ctx.params holds the audio parameters; set tempo with ctx.setBpm(n), ctx.setCps(n), or ctx.setSwing(amount). The default bus is Music. gain ranges from 0 to 2; 0 is silent and paused: true stops the transport. Sample names are listed at /cdn/vibe-samples/manifest.json.

```ts
audio: { kind: "vibe", script, params, gain, bus, paused }
<entity>.audio.params.<name> = v
ctx.getVibeAudio(id): { playing, bpm, bar, barPos, beat, beatPos, cycle, cyclePos, voices: [{ sample, channel, gain, kind }], triggers: [{ sample, when, ageSec }] } | null
export function pattern(ctx): Pattern | null
export function on(name, fire, payload)
note(pattern), s(pattern), stack(...patterns), seq(...patterns), silence(), mini`…`
.s(bank) .gain(g) .pan(p) .lpf(hz) .hpf(hz) .fast(n) .slow(n) .every(n, fn) .swing(a) .humanize(a) .rate(r) .prob(p) .room(0..1) .reverbBus("plate" | "hall") .delaytime(s) .delayfeedback(f) .delayxfeed(x) .delaylpf(hz) .drive(d) .crush(bits) .grain(true) .attack .decay .sustain .release .channel(name)
.scale(factor) vs .when(cond)
arrange([cycles, pattern], …)
scale(key, degrees), progression(romans, key), arp(chords, "up" | "down" | "updown" | "random"), chord(name, octave = 3)
clamp01(x), lerp(a, b, t), smoothstep(e0, e1, x), above(threshold, x, fade = 0.05), below(threshold, x, fade = 0.05), between(lo, hi, x, fade = 0.05), mapRange(x, inMin, inMax, outMin, outMax)
banks: .s() takes a name exactly as the manifest spells it (/cdn/vibe-samples/manifest.json): pitched vsco_{piano,piano_alt,harp,glock,xylo,marimba_loud,cellos,cellos_{spicc,sus_vib,trem},violins_{pizz,spicc,sus_vib,trem},violin_{pizz,spicc,trem,vib},violas_{pizz,spicc,sus_vib,trem},contrabass_{pizz,spicc,sus_nv,sus_vib,trem},flute,flute_{stac,sus_nv,sus_vib},piccolo_{stac,sus},oboe,oboe_{sus,vib},clarinet,clarinet_stac,bassoon_{stac,sus,vib},horn_{mute,stac,sus},trumpet_{stac,sus,sus_vib,harmonmute,strmute},trombone_{stac,sus,vib},tuba_{stac,sus}} (each has a pitch range: transpose or switch, never shift past an octave), synths sawtooth square sine triangle, one-shots bd_* sn_* hat_* ride_* drum_* elec_* perc_* tabla_* glitch_* bass_* guit_* ambi_* loop_* vinyl_* vsco_{organ,timpani} (the manifest lists each); the short words bd sn hh cp kick snare hat clap ride tom piano pad bass bell pluck resolve; an instrument word alone (violins, harp) is a silent voice and a vibe.sample.unknown DM
```

## builtin/fx

Export effect(ctx) from the effect script. Return fx(...populations). Spawn rate is particles per second. lifetime, delay, and window use seconds; size uses meters; rotation uses radians. alpha is 0 to 1. World space is the default. An omitted lifetime does not expire. The effect ends when its owner is removed, or call ctx.destroy(id). A sprite with align: "ground" lies flat on the face attr("normal") names, so a ripple ring or a stamp lies along the slope or wall it hit, with no axis. parent(name) is a when() child's live read of its spawning parent each tick: "p", "v", "age", "life", "size", "rand", "localP", "normal" or the parent's own attribute; a dies child reads its parent as it died.

```ts
emit("fx", { position, script, params, seed, tags, attachTo }): id
getObject(id).fx.params.<k> = v
ctx.pulseFx(id, name, { at, data })
ctx.getFxState(id): per-population { alive, rate, lifetime, expectedAlive }
export function effect(ctx): fx(...pops) | fx({ follow: "player" | "camera" }, ...pops)
pop(name, def)
spawn: { rate, on, burst: { count: [min, max], every: [min, max] } }
spawn: when(other.dies, p) | when(other.dies, { count: N, probability })
spawn: when(other.lives, { rate, count })
spawn: { when: { event: "pulse", name }, count: [1, 1] }
count: N
wrap: [hx, hy, hz]
delay: s, window: [start, end]
space: "local"
floor: "die" | "stick" | "bounce", bounce: 0..1 | range()
collide: "die" | "stick" | "bounce"
lifetime: s | [min, max] | range(min, max)
init: { v, <attr>: field }, inherit: { p: parent.p, v: parent.v.mul(0.5), … }
accel: vec3 field
pos: field, vel: field
color: vec3 (HDR ok) | "oklch(L C H)", alpha: 0..1, size: meters, rotation: radians, aspect: width ÷ height, frame: index, erode: 0..1, uvOffset: vec
attrs: { name: field }
inheritVelocity: 0..1
maxParticles: N
render: sink | sink[]
disc({ r, jitter, lift }), sphere({ radius, lift }), box({ halfExtents, lift }), arc({ radius, angle, lift }), line({ length, axis, lift }), point({ lift }), path(points | points[] | 'M… Q… …' | entity(id), { lift, plane: 'xz' | 'xy', size, viewBox })
range(min, max), curve([t, v], …), noise(input), curl(freq), cone(deg), sphereDir(), time(), floorHeight(), attr(name), count(pop), entity(id), wind(), field({ halfExtents, resolution, data | sample })
attr names: p v age life size rand localP normal + init / inherit / attrs keys + seg along channel (path) + pulse.data.<key>; normal is world up until a floor: or collide: contact, then the face it met, and a when() child starts with its parent's
.add .sub .mul .div .neg .min .max .mix .cross .clamp01 .saturate .normalize .length .to(g) .sin .cos .atan2 .fract .floor .step(edge) .smoothstep(e0, e1) .abs .mod .pow .sqrt .dot .yaw()
flicker(hz, amount = 0.15), firelight(slowHz = 1.2, fastHz = 2), spin(maxRps = 1), envelope(...keys), gravity(), up(speed = 1), buoyancy(k), drag(k), blast(speed), radial(speed), attract(strength), vortex(strength, axis = [0, 1, 0]), hdr(r, g, b), vec3(x, y, z), force(f)
orbit({ radius, rps = 1, phase = 0, around, axis = [0, 1, 0] })
seek(target, speed)
along({ points, t, around })
parent(name)
sprite({ texture | textures: sheet(url), blend: "add" | "alpha" | "multiply" | "subtract" | "distort", align: "full" | "yaw" | "velocity" | "axis" | "segment" | "ground", axis, stretch: 0, soft: meters, lit: true, repeat: [u, v], filter: "pixel" | "linear", glow: 0.1, depthTest: false, sortingLayer: 75, sortingOrder: 2 })
mesh({ shape: "box" | "cylinder" | "sphere" | "card", dims: [x, y, z], align: "velocity", script, blend, soft, material, params })
ribbon({ length, lifetime, fade, emitting, width, color, texture, textureLength, minDistance, segments, maxDistance, facing: "camera" | "ground" | [x, y, z], surfaceOffset, blend, soft, material, params, sortingLayer, sortingOrder })
light({ color, intensity, radius, perParticle })
rgb(r, g, b): vec3
```

## builtin/tsl

Shader time is seconds: (ctx.now() / 1000) % 3600. uv() reads the first UV set; uv(1) through uv(3) select later sets. A primitive's UV coordinates normally span 0 to 1. A requested attribute must exist on the geometry. audioLevel and audioSpectrum(x) read the sound this player hears (music and world sounds), each 0 to 1, in a material or a look; x runs from 20 Hz at 0 to 20 kHz at 1. objectWorldMatrix(id), objectPosition(id), objectScale(id) and objectDirection(id) read the thing with that id where this frame renders it: the interpolated pose on screen, not its last tick. A thing not here reads 0. The atomics act on an int or uint instancedArray element inside a compute body. atomicAdd, atomicSub, atomicMax, atomicMin, atomicAnd, atomicOr and atomicXor return the element's previous value.

```ts
inputs: uv(), uv(1), uv(2), uv(3), positionLocal, positionMorphed, positionWorld, positionView, normalLocal, normalWorld, cameraPosition, screenUV, screenSize, time, vertexColor(), attribute(name, type), instanceIndex, vertexIndex, frontFacing, sceneDepth, sceneDepthAt(uv), depthFade(metres), viewportSharedTexture(uv = screenUV)
material inputs: materialColor (vec3), materialOpacity (float), materialEmissive (vec3)
audio: audioLevel (float), audioSpectrum(x) (float)
billboarding({ position, horizontal, vertical })
math: float, vec2, vec3, vec4, color, int, mix, smoothstep, step, clamp, min, max, abs, floor, ceil, fract, sign, mod, negate, pow, sqrt, exp, log, sin, cos, tan, atan, atan2, length, distance, dot, cross, normalize, reflect, refract, oneMinus, saturate, remap, remapClamp
noise: mx_noise_float, mx_fractal_noise_float, mx_worley_noise_float, mx_noise_vec3, hash, rand, oscSine, oscTriangle, oscSquare, oscSawtooth
object reads: objectWorldMatrix(id), objectPosition(id), objectScale(id), objectDirection(id)
structure: Fn(([a, b]) => …), select(cond, a, b), If, Loop, .toVar(), .assign(), texture, textureSize(t, level?), textureLoad(t, ivec2), textureLevel(t, uv, mip), texture3D(t, uvw, level?), convertToTexture, PI, PI2, EPSILON
wgslFn(`fn name(a: f32, p: vec3<f32>) -> vec4<f32> { … }`, includes?), name([a, p])
compute: instancedArray(count | typedArray, type = "float"); buffer.element(i); Fn(() => { … })().compute(count, workgroupSize = 64); m.computeNode = pass; deltaTime
textures: textureStore(t, coord, value), texture3D(t, uvw); minFilter = LinearMipmapLinearFilter
workgroup: workgroupArray(type, count), .element(i); workgroupBarrier(); invocationLocalIndex, workgroupId, localId
buffer.setName("height"); texture.name = "fog"; ctx.self.material.buffers[name]
atomics: atomicAdd(buffer.element(i), value), atomicSub, atomicMax, atomicMin, atomicAnd, atomicOr, atomicXor; atomicStore(buffer.element(i), value); atomicLoad(buffer.element(i))
depthFade(m)
```

## builtin/three

Export material(ctx) from the material script. It returns a material. ctx.param(name, default) is a shader node for a declared parameter; scale it with .mul(), never JS *. Material opacity is 0 to 1. Set transparent when the material uses alpha. A PointsNodeMaterial draws round, unlit points: one a copy on a `points` row, one a vertex on any other shape. Its positionNode places each point (from instanceIndex on a points row), sizeNode is its width in CSS pixels (size when unset), which a perspective eye scales by nearness as three does (sizeAttenuation), and AdditiveBlending sums their light. A crowd of dots a pixel or two wide is a points row, never copies of a tiny mesh. A `line` row wears a LineBasicNodeMaterial or Line2NodeMaterial: linewidth is its width in CSS pixels at every distance.

```ts
material: { kind: "scripted", script, params }
new MeshStandardNodeMaterial() | MeshPhysicalNodeMaterial | MeshSSSNodeMaterial | MeshBasicNodeMaterial | MeshPhongNodeMaterial | MeshLambertNodeMaterial | MeshToonNodeMaterial | MeshMatcapNodeMaterial
new LineBasicNodeMaterial({ color, linewidth: 3 }) | Line2NodeMaterial
m.vertexNode = vec4
new SpriteNodeMaterial()
new PointsNodeMaterial({ size })
m.positionNode = vec3
m.sizeNode = float
m.sizeAttenuation = true
m.colorNode, m.opacityNode
m.blending
FrontSide, BackSide, DoubleSide; NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending; AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation; ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstColorFactor, OneMinusDstColorFactor, DstAlphaFactor, OneMinusDstAlphaFactor, SrcAlphaSaturateFactor; Plane; RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping; NearestFilter, LinearFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearMipmapNearestFilter, LinearMipmapLinearFilter; NoColorSpace, SRGBColorSpace; RGBAFormat, RGFormat, RedFormat, RGBAIntegerFormat, RGIntegerFormat, RedIntegerFormat; UnsignedByteType, HalfFloatType, FloatType, UnsignedIntType; Color, Vector2, Vector3, Vector4
new StorageTexture(width, height) | new Storage3DTexture(width, height, depth) | new DataTexture(data, width, height, format = RGBAFormat, type = UnsignedByteType) | new Data3DTexture(data, width, height, depth)
m.depthNode = float
m.attributeNode = float
m.dataNode = vec4
ctx.params, ctx.param(name, default), ctx.constants
ctx.param(name, list), ctx.params.name: { element(i), length }
ctx.param(name, ctx.texture(cdn)): texture
ctx.texture(cdn): texture; t.colorSpace = SRGBColorSpace | NoColorSpace
ctx.texture([cdn, …]): texture; t.sample(vec3(uv(), layer))
ctx.field(name).sampleWorld(): float
ctx.terrain.heightAt(xz, orElse?): float
ctx.terrain.pressAt(xz): vec2
ctx.terrain.ground: { color, normal, roughness, metalness, emissive }
ctx.tile: { id, uv, uvRect }
ctx.sprite: { texture, uv }
ctx.view(offset): vec4; ctx.view.depth(offset): float; ctx.portal: { state: 0 waking | 1 open | 2 closed, open, uv, eye, frame, ripples, impulses, edge, edgeDir }
ctx.fx: { uvAlong, uvAcross, viewDir, normal, color, alpha, size, seed, params: { <name> }, scene(offset): vec4, texture(uv?): vec4 }
ctx.device: { class: "desktop" | "mobile" | "tablet" | "unknown", coarse, maxTextures, quality: "low" | "medium" | "high" | "ultra" }, ctx.quality: "low" | "medium" | "high" | "ultra"
```

## builtin/lighting

```ts
sunDirection: vec3; sunRadiance: vec3; ambientRadiance: vec3
wet: float; rain: float
windDirection: vec2; windSpeed: float; windTravel: vec2
fogColor(toward): vec3
sunVisibility(P): float
lightsAt(P, { shadow }?): vec3
lightCount(P): int; lightRadiance(P, i): vec3; lightPosition(P, i): vec3
```

## builtin/water

```ts
waterRippleSlope(xz, t, tile, flow, flowSpeed, gust)
waterFoam(xz, t, flowVelocity, amount, scale = 1, softness = 0.08)
waterFoamField(xz, t, flowVelocity, scale = 1)
waterFoamFieldLod(xz, t, flowVelocity, scale, footprint)
waterFoamCoverage(amount, field, softness = 0.08)
waterTransmittance(deepTint, tintDistance, depth)
waterMedium(scene, transmission, scatter)
waterUnderwaterDistortion(uv, t, distance, visibility, strength)
waterRayBoxDistance(origin, direction, lower, upper, sceneDistance)
waterCaustics(floorXZ, t)
waterCausticsAt(floorPos, surfaceY, sunDirection, t, tile, flow, flowSpeed, gust, steepness, baseSlope, dispersion)
waterCausticsRefracted(…same)
waterFresnel(nDotV, f0)
```

## builtin/env

```ts
envAt(ctx, point: Vec3 | [x, y, z]): { wind: EnvFlow, rain: number, light: number, charge: number, water: { depth: number, flow: EnvFlow }, cloud: number }
```

## builtin/postfx

A look export returns the final color. Start from ctx.scene. Use node operations such as .mul() on ctx.param values. Color adjustments are neutral when omitted. vignette defaults to roundness 2 and feather 0.45. dof focusDistance and focusRange are meters; bokehScale is pixels and defaults to 1. blur amount is 0 to 1. Put frame resamplers before color adjustments. bloom returns the existing color; configure bloom with the look's bloomStrength, bloomRadius, and bloomThreshold parameters. Antialiasing is each player's own setting, not part of a look: jaggies in Settings, where "no (slow)" turns antialiasing on, so a look carries no edge pass of its own.

```ts
grade(color, { exposure, saturation, contrast, brightness, lift, gamma, gain, temperature, tint, haze, hazeColor }): color
vignette(color, intensity, { color, roundness, feather }): color
grain(color, intensity): color; film(color, intensity): color; tint(color, "oklch(L C H)", amount): color; scanlines(color, intensity, count): color; dotScreen(color, angle, scale): color
chromaticAberration(color, strength): color; dof(color, viewZ, focusDistance, focusRange, bokehScale): color; pixelate(scene, size): color; blur(scene, amount): color
ctx.scene: vec3; ctx.depth: texture; ctx.viewZ: float; ctx.viewZAt(uv): float; ctx.normal(uv, { shading?, liquid? }): vec3; ctx.worldPosition(uv): vec3; ctx.skyVisibility(P, N?): float; ctx.previousUv(P): vec2; ctx.velocity: vec2; ctx.target(name, options): target; ctx.pass(target, (uv) => vec3 | vec4): texture; ctx.cube: texture; ctx.cover: texture
ctx.data: texture
bloom(color): color
```
