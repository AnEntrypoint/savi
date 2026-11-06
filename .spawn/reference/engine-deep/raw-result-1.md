The per-place analysis is below. I did not write `analysis-places.md`, because the system rules for this subagent forbid writing report files, so this message is the deliverable. The output file would need to be written by the parent or by a process that is allowed to write reports.

Scope: 37 files read (26 scene cells, 11 `config.yaml`). Every `scripts/` and `templates/` reference was checked against the tree, and all 245 distinct paths exist. Hook and `ctx` calls inside the referenced scripts were not analysed, so the engine-call column lists only what the scene and config rows themselves use.

## Templates and behaviors (tree-wide)
- `templates/player.js` exists. `templates/camera.js` exists but no cell references it.
- Script and template paths (245 distinct) all resolve. Paths with `?query` suffixes (for example `scripts/ex/td-art.js?kind=fence`, `scripts/tex-gallery.js?kind=rings&hue=30`, `scripts/ex/tex-side-peaks.js?layer=near`) resolve after stripping the query. The engine notes do not say whether the resolver accepts query strings.
- Engine presets used: `engine/portal-aurora`, `engine/portal-glass`, `engine/portal-pixel`, `engine/portal-starfield` (all listed in ENGINE.md 5.5 item 4, verified). `engine/blueprint` is not in the notes, so it is unverified.
- `cdn/...` and `/cdn/...` asset names (42 distinct) cannot be checked against the tree. `/cdn/value.<sha>` entries are uploaded-asset references and are unverified.

## annex (`places/annex`)
- Config `config.yaml`: mode 3d, `terrain.kind: "off"` (line 4), clouds, fog, sky realistic/hosek, look `scripts/look-default.js` (exists), spawn (0, 0.2, 0), yaw 180, bottom -30.
- Cell `cells/x0z0.scene`: 18 placements. Scripts: `scripts/ex/lichen-field.js`, `scripts/ex/portal.js`, `scripts/ex/w7/echo-lantern.js` (all exist). Engine: `engine/portal-aurora`. Assets: granite cobblestone and flagstone.
- Issues: `terrain.kind: "off"` not in notes (unverified).

## blocks (`places/blocks`)
- Config: mode 3d, voxel terrain (line 16), seed 84, `cellSize: 1` (line 18), `verticalRange` (line 19), generator `scripts/blocks-terrain.js` (exists). Materials are a keyed map (lines 22-29) using `color`, `tones`, `growth`, `pattern`, `emissive`, `emissiveIntensity`, `countsAsTerrainSurface`, `liquidKind`, `collision`, `surfaceInset`, `waveIntensity`, `solid`, `transparent`, `opacity`, `roughness`. The notes name only seed, verticalRange, generator, materials, marks, lodRanges and meshing.style for voxel, so the material fields are unverified.
- Cell `cells/x0z0.scene`: 17 placements. Scripts: `scripts/ex/blocks-geo.js` (6 uses), `scripts/ex/pickaxe.js`, `scripts/ex/torches.js`, `scripts/ex/worldgate.js` (all exist). Engine: `engine/portal-pixel`. Assets: granite flagstone.

## highlands (`places/highlands`)
- Config: mode 3d, heightmap seed 7, generator `scripts/highlands-terrain.js` (exists), six materials as a list (lines 22-27). Notes show the keyed-map form `t.materials.sand = {...}`, so the list form is a shape mismatch. Look `scripts/look-highlands.js` (exists). Clouds field `color` is unverified.
- Marks: `sea` (line 29) and `river` (line 30) use fields the notes do not state for those kinds (`floorMaterial`, `width`, `depth`, `bedMaterial`, `points`). `terrace` (line 31) and `tarn-bowl` (line 40) are `flatten` marks that use `falloff` (number). The notes name `flatten.falloffCurve` ("smooth"|"cliff"|"linear"), so this is a mismatch. `path-*` (lines 33-39) use `edgeMaterial` and `grade`, which are unstated.
- Decorations: `bindings` (grass → grass, flower, pebble) and layers match ENGINE 4.5. Items use `scripts/grass.js`, `scripts/flower.js`, `scripts/pebble.js`, `scripts/grass-look.js` (all exist).
- Cell `cells/x0z0.scene`: 54 placements. Scripts: `scripts/ex/bush.js` (8), `gradeswitch.js`, `grove.js`, `lakelever.js`, `survey.js`, `tarn.js`, `weather.js`, `worldgate.js`, `scripts/tree.js` (9), `scripts/look-default.js`, `scripts/look-highlands.js` (all exist). Engine: `engine/portal-aurora`. Assets: granite flagstone (20 uses).

## main (`places/main`)
- Config: mode 3d, heightmap seed 1, generator `scripts/flat-starter-terrain.js`, materials list (lines 108-120, same list-vs-map issue), decorations (flower, grass, pebble) with `scripts/flower.js`, `scripts/grass.js`, `scripts/pebble.js`, `scripts/grass-look.js` (all exist). Marks: `c92-pond` (lake, uses `at`, `depth`, `level`, `radius`, matches the lake fields), `fr-pit` (hole, points), `fr-clear` (clear-scatter, rectangle shape with width and depth), `fr-pool` (lake). Atmosphere: sky, fog, clouds, stars, moon, look `scripts/look-default.js`. Spawn (0, terrain 0, 0). Bottom -20.
- Cells (13 files, 1,524 rows across the 26-file set, with 124 placements in `x0z0` and 261 in `x0z-1`):
  - `x0z0`: `scripts/ex/earshot.js`, `editorpillar.js`, `haptic.js`, `mailbox.js`, `modsbook.js`, `obsgate.js` (exist). Audio `/cdn/moodboard-lowpoly-cozy/sfx-campfire-crackle-loop.mp3` uses the `/cdn/` form (mixed with `cdn/`, see issues).
  - `x0z-1` (261): `scripts/ex/*` (about 60 modules including `motion.js` (9), `coin.js` (5), `shop.js` (2), `market-geo.js`, `bell.js`, `dancer.js`, `chests.js`), `scripts/chat.js`, `scripts/db.js`, `scripts/routing.js` only inside a `ui:` string (doc text), `scripts/tex-gallery.js` and `scripts/tex-south.js` with `?kind=` queries (exist). Behaviors include `[scripts/ex/coin.js, scripts/ex/motion.js]` (array form). Engine: `engine/portal-aurora` (3). `simulatedBy: platform` at lines 96, 108, 330 (not in notes; unverified). Physics `centerOfMass` at line 1558 (unverified). `/cdn/neutral-default-avatar.glb` (4).
  - `x0z-2` (152): `scripts/ex/plaza-stone.js` (36), `sys-geo.js` (14), `sys-wing.js` (6), `fr-geo.js` (3), `worldgate.js` (4), `trader.js`, `turntable.js`, `organ.js`, `cinema.js`, `worldorb.js`. Engine: `engine/portal-aurora`, `portal-glass`, `portal-pixel`, `portal-starfield`.
  - `x0z-3` (45): `scripts/ex/car77-gate.js` (2), `car77-geo.js` (22), `car77.js`, `car77-recall.js`, `car77-voice.js`, `plaza-stone.js` (2). `physics` `centerOfMass` at lines 9, 20, 32, 44, 56 (unverified).
  - `x1z0` (11): `scripts/ex/c92-flock.js`, `c92-flock-mat.js`, `c92-geo.js` (4), `c92-lift.js` (2), `c92-zip.js`.
  - `x-1z-1` (28): `scripts/ex/aurora.js`, `goat-geo.js`, `goat.js`, `statebox.js` (2), `summitbell.js`.
  - `x1z-1` (140): `scripts/ex/c92-belt.js`, `c92-boat.js`, `c92-geo.js` (4), `c92-orb.js`, `c92-orb-mat.js`, `gong.js`, `hermit.js`, `minds-*` (about 20 uses), `uilane-geo.js` (5), `uipanel-exhibit.js` (3). `physics: {body: static, friction: 1, surfaceVelocity: [1.2,0,0]}` at line 7 (`surfaceVelocity` unstated; the cell's own state text says it works on static bodies). Engine: `engine/portal-aurora`. Audio `/cdn/moodboard-painterly-fantasy/*.mp3` (5).
  - `x-1z-2` (67): `scripts/ex/fr-*` (fr-booth, fr-booth-cam, fr-geo (17), fr-gravity, fr-ik, fr-joint (8), fr-marmot, fr-pause, fr-pit, fr-pool, fr-rain), `motion.js` (5), `plaza-stone.js` (6). Assets: `texture-weathered-larch-wood.png`.
  - `x1z-2` (106): `scripts/ex/w7/*` (bolt-rod, comet, dial, fx-clock, haze, hop (2), hop-marmot, kick-post, limb (6), lod-orb, ping-bell, range-beacon, sign, veh-bike, veh-heli, veh-tank (3), veh-bike-geo), `sys-geo.js` (15), `sys-wing.js` (7), `crystal.js`, `marmot-geo.js`, `plaza-stone.js` (5), `worldgate.js` (2). Engine: `portal-aurora`, `portal-glass`. `simulatedBy: platform` at line 82 (unverified). `/cdn/value.<sha>.png` (2, uploaded).
  - `x2z-2` (4): `scripts/ex/w7/veh-plane.js`, `veh-plane-geo.js`. `physics` `centerOfMass` at line 18 (unverified).
  - `x2z-3` (17), `x2z-4` (4): listed in the file set; no scripts beyond the tree-wide check.
  - `x3z-3` (10): `scripts/ex/w7/race-kart.js` (4), `race-manager.js`. `physics` `centerOfMass` at lines 20-56 (unverified).

## observatory (`places/observatory`)
- Config: mode 3d; heightmap seed 1; generator `scripts/flat-starter-terrain.js`; materials list (lines 8-10, list-vs-map issue); `atmosphere.cycle: {periodMs: 120000, epoch: 0}` (matches the notes); `moon.size` unstated; `look: {script: scripts/ex/look-toon.js, params: {bands: 4}}` (exists; `params` shape for look is not in the notes).
- Cell `cells/x0z0.scene`: 7 placements. Scripts: `scripts/ex/c92-geo.js` (2), `c92-obs.js` (2), `obsgate.js`, `look-toon.js` (exist). Engine: `engine/portal-aurora`. Assets: granite flagstone.

## sidescroll (`places/sidescroll`)
- Config: `name: 2D Side` (line 2) is not in the notes' PlaceDef list. Mode 2d-side. Terrain `kind: tilemap` (line 9) with `tileSize`, `tileset`, `tilesetColumns`, `generator`, `solidTiles`; none of these are in the notes (the 2d-mode skill is not in the notes). `policy.onArrive` and `policy.onLeave` (lines 18-19) use `scripts/ex/side-arrive.js` (exists). The notes document onArrive and onLeave as hooks, not as policy keys, so this is a mismatch. Camera (lines 20-27): `kind: custom`, `behavior: [scripts/ex/side-camera.js]`, `orientation: {source: script}` (line 23), `pointerLock: false` (line 26). The notes warn against `{source: "script"}` with `pointerLock: false` on a driven hull (ENGINE 6.1, cameras skill). Whether that warning applies here is unverified. `ui.render: scripts/ex/side-ui.js` (line 29, exists).
- Cell `cells/x0z0.scene`: 9 placements. `side-coin-1`..`3` (sprite texture `scripts/ex/tex-side-coin.js`), `side-crab` (`behavior: scripts/ex/side-crab.js`, `state: {duration, from, to}`), `side-flag` (`scripts/ex/side-flag.js`), `side-gate` (`behavior: scripts/ex/worldgate.js`, `material: {kind: scripted, script: engine/portal-glass, view: {link, sound, spill}}`, `physics: {body: static, trigger: true}`, `state.link`, `tags: [portal]`, which match ENGINE 5.5), `side-peaks-near` (`texture: scripts/ex/tex-side-peaks.js?layer=near`), `side-sign` (vector SVG), `side-sign-post`. `sprite` sub-keys (`lit`, `parallax`, `repeatX`, `sortingLayer`) are not in the notes (unverified).
- `x1z0` (1): `side-peaks-far` (`texture: scripts/ex/tex-side-peaks.js?layer=far`). `x5z0` (1): `side-sky` (`scripts/ex/tex-side-sky.js`). Both exist.

## topdown (`places/topdown`)
- Config: mode 2d-top. Terrain `kind: tilemap`, `tileset: scripts/ex/td-tiles.js`, `generator: scripts/ex/td-ground.js`, `solidTiles: [3]`, `width: 36`, `height: 26` (unverified, same tilemap concern as sidescroll). Camera (lines 12-19): `behavior: [scripts/ex/td-camera.js]`, `orientation: {source: script}` (line 15), `pointerLock: false` (line 18), same concern as sidescroll. `policy.onArrive` and `onLeave` (lines 21-22, `scripts/ex/td-policy.js`, exists; same policy-key concern). Spawn (0, 0, 6).
- Cell `cells/x0z0.scene`: 25 placements. Scripts: `scripts/ex/td-art.js?kind=cottage|crystal|fence (11)|sheep|tree (5)` (exists after stripping the query), `td-crystal.js` (4), `td-sheep.js`, `td-tally.js`, `plaza-stone.js` (2), `worldgate.js`. Engine: `engine/portal-starfield`.

## vault (`places/vault`)
- Config: mode 3d, `instance: solo` and `persistence: ephemeral` (both match the notes' enumerations). `terrain.kind: "off"` (line 6, unverified). Atmosphere uses look `scripts/look-default.js` (exists). Spawn (0, 0.2, -3), yaw 180.
- Cell `cells/x0z0.scene`: 15 placements. Scripts: `scripts/ex/vaultcounter.js`, `scripts/ex/vaultgate.js` (exist). Engine: `engine/portal-aurora`. Assets: granite cobblestone (4) and flagstone (3).

## w7match (`places/w7match`)
- Config: mode 3d, `instance: party`, `persistence: session` (both match the notes). `terrain.kind: "off"` (line 7, unverified). Spawn (0, 0.2, 6).
- Cell `cells/x0z0.scene`: 8 placements. Scripts: `scripts/ex/w7/party-board.js`, `scripts/ex/w7/ring-bell.js`, `scripts/ex/worldgate.js` (exist). Engine: `engine/portal-glass`. Assets: granite flagstone.

## workshop (`places/workshop`)
- Config: mode 3d; heightmap seed 7; generator `scripts/flat-starter-terrain.js`; materials list (lines 8-10, list-vs-map issue). Look `scripts/look-default.js` (exists). Spawn (0, terrain 0.2, 8).
- Cell `cells/x0z0.scene`: 196 placements. Scripts: `scripts/ex/ws/in-spatial-geo.js` (24), `in-bodies-geo.js` (17), `in-bodies-lab.js` (5), `in-shapes-geo.js` (7), `ws-files-geo.js` (8), `ws-hands-geo.js` (7), `ws-eye-geo.js` (5), `ws-land-geo.js` (2), `in-acts-geo.js`, `in-player-geo.js`, `in-data-geo.js`, `in-places-geo.js`, `in-spatial-press.js` (2), `in-shapes-button.js` (2), `ws-engine-geo.js`, `ws-memory-geo.js`, `ws-press-geo.js`, `ws-wisps-geo.js`, plus `scripts/lib/data/race.yml` and the `scripts/lib/data/` directory (exist). `templates/player.js` appears only inside a `vector:` doc string. Assets: granite flagstone (17) and `/cdn/value.<sha>.jpeg` (9, uploaded).
- `x0z-1` (201): `scripts/ex/ws/in-acts-geo.js` (10), `in-data-geo.js` (11), `in-data-tier-mat.js` (3), `in-places-admits.js`/`in-places-gate.js`/`in-places-stamp.js`/`in-places-stone.js`, `in-player-geo.js` (8), `in-shapes-geo.js` (9), `in-shapes-pivot.js` (3), `ws-engine-geo.js` (19), `ws-engine-stone.js` (6), `ws-memory-geo.js` (16), `ws-memory-stamp.js` (4), `ws-press-geo.js` (10), `ws-wisps-*`, `scripts/player.js`, `scripts/ui.js`, `scripts/chat.js` (all exist). Engine: `engine/blueprint` at line 1324 (material script, not in notes, unverified) and `engine/portal-aurora`. Assets: granite flagstone (16) and `/cdn/value.*.jpeg|glb` uploads.

## ws-locked (`places/ws-locked`)
- Config: mode 3d, `terrain.kind: "off"` (line 5, unverified). `policy.admits: scripts/ex/ws/in-places-admits.js` (line 7, exists, matches ENGINE 5.5 item 5). `policy.onArrive` and `onLeave` (lines 8-9) use the same script (see the policy-key concern). Spawn (0, 0.3, 2), bottom -12.
- Cell `cells/x0z0.scene`: 3 placements. `scripts/ex/ws/in-places-gate.js` (exists, behavior), `engine/portal-aurora`, granite flagstone (3).

## Issues (summary, numbered)
1. `simulatedBy` (placement field) not in ENGINE 4.1/4.2 (main x0z-1:96, 108, 330; x1z-2:82).
2. `physics.centerOfMass` not in ENGINE 4.2 (main x0z-1:1558; x0z-3:9, 20, 32, 44, 56; x2z-2:18; x3z-3:20 and others).
3. `physics.surfaceVelocity` not in ENGINE 4.2 (main x1z-1:7).
4. `terrain.kind: "off"` not in notes (annex, vault, w7match, ws-locked).
5. `terrain.kind: tilemap` plus its fields not in notes (sidescroll:8-14, topdown:3-11).
6. `onArrive`/`onLeave` placed under `policy`, not documented as keys (sidescroll:18-19, topdown:21-22, ws-locked:8-9).
7. `orientation: {source: script}` with `pointerLock: false` on a camera (sidescroll:23, 26; topdown:15, 18). ENGINE 6.1 warns on this for a driven hull. Needs the cameras skill to decide.
8. Heightmap materials as a list (main:108-120, highlands:22-27, observatory:8-10, workshop:8-10) versus the keyed map in ENGINE 4.5.
9. Flatten marks use `falloff` (highlands:31, 40) where the notes list `falloffCurve`.
10. Voxel material fields (blocks:22-29) and `cellSize` (blocks:18) not in notes.
11. Sidescroll `name` (line 2) not in PlaceDef notes.
12. Art-path form is mixed: `cdn/` in most rows, `/cdn/` in main x0z0 audio, main x0z-1, main x0z-2, main x1z-1, workshop (ENGINE 6.2 item 4, unresolved).
13. `engine/blueprint` material (workshop x0z-1:1324) is not in the notes.
14. Query-string script refs (`?kind=`, `?layer=`) and whether the resolver accepts them (13 refs).
15. `material.color` is used across nearly every cell row, but the notes only give `tint` (ENGINE 4.4 and 6.2 item 5).

## Gaps
- Hook and `ctx` calls inside the 245 referenced scripts were not analysed.
- CDN assets and `/cdn/value.<sha>` uploads cannot be checked from the tree.
- `sprite`, `wisp`, `audio`, `fx`, `interpolation`, `scatter` sub-keys are not in the notes.
- Tilemap, 2d-mode, look `params`, `moon.size`, `clouds.color` and `path`/`river`/`flatten` mark fields are not in the notes.
- `policy.onArrive`/`onLeave` key semantics are not stated.

{"files": 37, "calls": 292, "issues": 15, "gaps": ["hook and ctx calls inside referenced scripts not analysed", "cdn assets and uploaded value refs cannot be verified from tree", "placement sub-keys sprite, wisp, audio, fx, interpolation, scatter not in notes", "tilemap and 2d-mode terrain fields not in notes", "policy onArrive/onLeave key semantics not stated", "voxel material fields and cellSize not in notes", "look params shape not stated", "path, river and flatten mark fields partly not stated", "physics centerOfMass and surfaceVelocity not in notes", "simulatedBy placement field not in notes", "query-string resolver behaviour not stated", "engine/blueprint material script not in notes"]}