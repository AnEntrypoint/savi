# Engine 6.0.0 reference index

Source: https://git.spawn.co/engine/6.0.0.git (shallow clone at /workspace/savi/.spawn/engine, pin semver 6.0.0, engine.yaml sha256 31a39ac2c2689403920f92bf1231e382cae87c7c3f0055769e5fb0797a60f419).
Sizes are bytes as reported by ls -la on the copied files. Headings are every markdown heading in each file, in order; `#` is level 1, `##` level 2, `###` level 3.

Copied from the clone (not symlinked): api-reference.md, README.md, skills.md (repo root), and skills/*.md (23 guide files). Not copied: keys.py (615 B code file at repo root, not a doc) and engine.yaml (pin, read directly).

| File | Bytes | Headings |
|---|---|---|
| README.md | 554 | `# Spawn engine 6.0.0 — the vocabulary` |
| skills.md | 1559 | `# Skills` |
| api-reference.md | 119585 | see section below |
| 2d-mode.md | 7292 | `# 2D Mode` |
| buyables.md | 3445 | `# Buyables`; `### Signatures (generated: do not edit)` |
| cameras.md | 9259 | `# Cameras` |
| fx.md | 7127 | `# FX (Field-Based Effects)` |
| game-ui.md | 9974 | `# Game UI` |
| geometry.md | 2927 | `# Geometry` |
| heightmap-terrain.md | 9913 | `# Heightmap Terrain`; `### Signatures (generated: do not edit)` |
| interactive-objects.md | 4897 | `# Interactive Objects` |
| jev.md | 2578 | `# Jev Decides` |
| leaf-sprays.md | 1905 | `# Leaf Sprays` |
| mobile-controls.md | 10182 | `# Mobile Controls` |
| physics.md | 1074 | `# Physics` |
| platform-systems.md | 8336 | `# Platform Systems` |
| player-settings.md | 2946 | `# Player Settings` |
| pointer-raycasting.md | 5791 | `# Pointer Raycasting` |
| portals.md | 7101 | `# Portals` |
| projectiles.md | 8602 | `# Projectiles` |
| rooms-and-matchmaking.md | 10845 | `# Rooms and Matchmaking` |
| spawn-engine.md | 1265 | `# Use the Spawn engine` |
| trees.md | 6399 | `# Trees` |
| uploaded-models.md | 6501 | `# Uploaded Models`; `### Signatures (generated: do not edit)` |
| vehicles.md | 7520 | `# Vehicles`; `## Gotchas` |
| voxel-terrain.md | 9291 | `# Voxel Terrain` |

## api-reference.md headings (119585 bytes)

- `# Spawn game API` (H1)
- `## Identity`, `## State`, `## Properties`, `## Movement`, `## Terrain`, `## Splines`, `## Camera`, `## Selection`, `## Player`, `## Timing`, `## Jobs`, `## Database`, `## Clock`
- `## The Changed Cursor (Sim.Js)`, `## Random`, `## Logging`, `## Events`, `## Spec Patches & Scripts`
- `## World Queries` (first occurrence, under Spec Patches)
- `## Places`, `## Object Access`, `## Lifecycle`, `## Spec Mutation (God Mode)`, `## Control`, `## Trade`, `## Joints`, `## Ragdoll`, `## Hierarchy`, `## DM Hooks`, `## Juice`, `## Animation Mixer`, `## Self`
- `## The Local Player (On A Camera Rig Alone)`, `## The Spine (The Same Members Every Behavior Ctx Carries)`
- `## State (The Compat Spellings Of Ctx.Self.State)`, `## Properties (The Compat Spellings Of Ctx.Self.Feetposition / .Rotation)`
- `## World Queries` (second occurrence, duplicate heading name)
- `## Behavior Hooks`
- `## ObjectPropertiesSpec (full)`, `## PrimitiveSpec (full)`, `## AtmosphereDef (full)`, `## TerrainDef heightmap (full)`, `## Inputs (full)`, `## ObjectSpec (full)`, `## Parenting (full)`, `## UI rules (full)`, `## Named types (full)`
- `## builtin/physics`, `## builtin/tween`, `## builtin/spline`, `## builtin/math`, `## builtin/vec3`, `## builtin/easing`, `## builtin/nav`, `## builtin/path`, `## builtin/ballistics`, `## builtin/room-routing`, `## builtin/terrain`, `## builtin/noise`, `## builtin/voxels`, `## builtin/vibe`, `## builtin/fx`, `## builtin/tsl`, `## builtin/three`, `## builtin/lighting`, `## builtin/water`, `## builtin/env`, `## builtin/postfx`
