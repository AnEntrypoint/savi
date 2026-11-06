# Asset type shapes in the engine API

Source: GET https://www.spawn.co/api/agent/v1/api?type=<Type> (the door behind `spawn api <Type>`). [verified: each type below was fetched live, 200]
The type list (GET https://www.spawn.co/api/agent/v1/api, no type) names 308 types. [verified]

Asset-related types found in that list: AssetMetadata, AssetPartEntry, AssetSocketEntry, AssetSprite2DEntry, Sprite2DMetaSpec, SpriteUvRect, StandardMaterialSpec, ScriptedMaterialSpec, MaterialSpec, MaterialOverridesSpec, ModelPartStateSpec, TextureScript, WaterMaterialSpec, VoxelMaterialDef, VoxelMaterialBlockBehaviorDef, CompiledVoxelBlockMaterialBehavior, SoundEndEvent, BoneInfo, BoneInfoResult, BoneNamesResult.

## AssetMetadata (per carried model or asset, computed by the engine) [verified]

    AssetMetadata = {
      boundsVersion?: number
      triangles?: number
      skinned?: boolean
      clips?: string[]
      gait?: Record<string, number>
      gaitVersion?: number
      bounds?: { min: [x,y,z]; max: [x,y,z]; size: [x,y,z]; center: [x,y,z] }
      sockets?: Record<string, AssetSocketEntry>
      parts?: Record<string, AssetPartEntry>
      partsVersion?: number
      sprite2d?: AssetSprite2DEntry
      duration?: number
      kind?: string
      name?: string
      uploadedAt?: string
      bytes?: number
    }

This is the metadata the client's AssetService reads beside a GLB. The fields `bytes` and `uploadedAt` tie a file to its carried name; `triangles` and `bounds` come from the model itself. The type says what the engine keeps; it does not say where the record is stored, and no GET door was found that returns one. [documented: the type; not verified against a live record]

## Parts and sockets [verified]

    AssetPartEntry = { center: [x,y,z]; size: [x,y,z]; groundOffsetY?: number; tris: number; confidence: number; version: number }
    AssetSocketEntry = { position: [x,y,z]; groundOffsetY: number; bone?: string; boneOffset?: [x,y,z]; confidence: number; version: number }

A socket names a point on a model (snake_case name, for example lamp_top in the uploaded-models skill). `bone` ties it to a rig bone when there is one. [documented: uploaded-models skill, attachment: { socket }]

## 2D sprites [verified]

    AssetSprite2DEntry = { version: number; meta: null | Sprite2DMetaSpec }
    Sprite2DMetaSpec = { outline?: [x,y][]; world_height?: number; target_size?: number; style?: "pixel" | "non-pixel"; kind?: "sprite" | "texture"; anchor_uv?: [x,y]; view?: string; content_box?: [x,y,z,w] }
    SpriteUvRect (the atlas rectangle; read with the sprite API)

## Material texture fields [verified]

StandardMaterialSpec holds the texture references as CDN names (strings), next to the scalar material values:

- texture?: string | null (the diffuse map)
- normalMap?, roughnessMap?, metalnessMap?, alphaMap?, emissiveMap?: string (CDN names)
- pbr?: boolean | "fal1"
- repeat?: [x,y], textureScale?: number, wrap?: "repeat" | "clamp", filter?: "pixel" | "linear"
- roughness?, metalness?, normalScale?, alphaTest?, opacity?, transparent?, emissive?, emissiveIntensity?, unlit?, side?, blending?

ScriptedMaterialSpec: kind: "scripted", script: ScriptRef, params?, plus the same scalar fields. A scripted material builds its texture in code. [verified]

MaterialSpec is the union: a standard spec (no kind), { kind: "water" } (WaterMaterialSpec), or { kind: "scripted" }. [verified]
MaterialOverridesSpec = DrawMaterialOverrides (an alias; the expanded DrawMaterialOverrides type was not read in this pass). [verified]

## Texture scripts [verified]

    TextureScript = { texture(ctx: TextureScriptContext): void; meta?: TextureScriptMetaExport }

A procedural texture is a script with a texture(ctx) function, not a file. The geometry skill names it by the same CDN paths as an uploaded texture (ctx.albedo("cdn/texture-<subject>.png")). [documented: geometry skill]

## Model part state [verified]

    ModelPartStateSpec = (Omit<StandardMaterialSpec, "time"|"timeAt"|"paused"|"speed"> | ScriptedMaterialSpec) & { visible?: boolean }

A part of a GLB (by mesh node or material name) takes a material plus a visibility flag, without a cook. [documented: uploaded-models skill, model.parts.<name>]

## Voxel materials [verified]

VoxelMaterialDef = { color?, texture?: string (a CDN name), pbr?, roughness?, metalness?, opacity?, transparent?, emissive?, emissiveIntensity?, liquidKind?, solid?, cutout?, collision?: "solid" | "none", tags?, blockBehavior?: VoxelMaterialBlockBehaviorDef, tones?, pattern?, growth? }. A voxel material names its texture as a CDN name, like a model material does. [verified]

## Consequences for the map

- A GLB reference in a tree is a CDN name (cdn/<file>.glb). Textures in materials are CDN names too. Both resolve through world.assets/ (see ASSETS.md). [documented + verified in ASSETS.md]
- The metadata that AssetService computes on load (AssetMetadata) is per asset. No GET door returns it for a project's asset. [verified: no endpoint found; see MANIFESTS.md]
