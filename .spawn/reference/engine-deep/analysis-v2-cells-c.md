CHUNK=cells-c
Method: all 8 files read in full. Placements = top-level keys. Script, template and behavior paths were checked for existence with a read-only shell test: 81 unique `scripts/` paths, all present. Three "missing" hits were prose inside scene strings, not references. Engine presets (`engine/portal-*`, `engine/blueprint`) and `cdn/` assets are outside the tree and were not file-checked.

**places/sidescroll/cells/x1z0.scene**: header matches. 1 placement (side-peaks-far, line 2). Refs: `scripts/ex/tex-side-peaks.js` (sprite texture, line 6), exists. Issues: feetPosition x=29 (line 3) falls in cell x0 under the round(x/128) rule, so this row may be misfiled if that rule applies to 2D places. Unverified fields: sprite.lit, sprite.parallax, sprite.repeatX, sprite.sortingLayer, sprite.size, sprite.texture.

**places/sidescroll/cells/x5z0.scene**: header matches. 1 placement (side-sky, line 2). Refs: `scripts/ex/tex-side-sky.js`, exists. Issues: feetPosition x=29 (line 3) is outside x5 (576..704 m), so it looks misfiled in x5z0. Same unverified sprite fields as above.

**places/topdown/cells/x0z0.scene**: header matches. 25 placements: 16 `object/x10c789a0dcae68d1/N` trees and fences, plus td-cottage, 4 td-crystal, td-sheep, td-sign, td-tally, top-gate. Refs: `scripts/ex/td-art.js` (query stripped), `td-crystal.js`, `td-sheep.js`, `td-tally.js`, `scripts/ex/worldgate.js`, `scripts/ex/plaza-stone.js` (line 181), all exist; `engine/portal-starfield` (line 184). Cross-place link: top-gate to `+main#plaza-top` (lines 184, 188), unresolved here. Issues: the `object/<hash>/<n>` id form is not in the notes. Unverified: collider2d.outline (lines 3–115), sprite.ySort and sprite.upright (lines 7, 162), fx.script (lines 124, 133, 142, 151), primitive.thickness on archway (line 181). td-tally state.found (line 176) is read; the writer was not audited.

**places/vault/cells/x0z0.scene**: header matches. 15 placements. Refs: `scripts/ex/vaultcounter.js`, `scripts/ex/vaultgate.js`, exist; `engine/portal-aurora` (line 29). Cross-place link: vault-gate to `+main#cm-vault-gate` (lines 29, 33), unresolved here. Issues: line 16 UI prose says `player.state.vaultVisits`, but the row's state key is `visits` (line 15). Unverified: material.repeat and material.wrap (lines 12, 20, 71), primitive.thickness (line 26).

**places/w7match/cells/x0z0.scene**: header matches. 8 placements. Refs: `scripts/ex/w7/party-board.js` (line 3), `scripts/ex/w7/ring-bell.js` (line 28), `scripts/ex/worldgate.js` (line 19), exist; `engine/portal-glass` (line 22). Cross-place link: ring-gate `main#w7-165-door` (lines 22, 25), unresolved here. Issues: this link has no `+` prefix, unlike every other link in the chunk. Line 10's `emissive` HTML attribute is unverified. Line 9 `state.copy` is set and never read.

**places/workshop/cells/x0z-1.scene**: header matches. 201 placements, all with feet inside z -64..-192. Refs: about 60 `scripts/ex/ws/*` paths, all exist. In-tree link: in-places-gate to `+ws-locked#wsl-return` (lines 386, 390), resolves. Issues:
- Line 1099 has `state.lit: "true"` (string), while line 1064 has `lit: true` (boolean) for the same lever/lantern pair.
- Line 1352: ws-wisps-obelisk is kinematic at feet y=-3.1, below the floor. Possibly intentional.
- Line 973: stale hard-coded "489 KB" text.
- Leading-slash `/cdn/value.<hash>` asset refs (not the `cdn/` form used elsewhere): lines 253, 355, 414, 539, 553, 701, 926–998, 948, 954, 1208, 1257, 1292, 1309. Notes say the resolver's handling of `/cdn/` is not stated.
- Line 1377: feetPosition.y `{terrain: 1.2}`, TerrainOffset object shape not in notes.
- Unverified: light.color, light.distance, light.intensity, wisp.*, primitive.torusKnot.p/q, extrude.shape/bevelEnabled, lathe.points/segments, tube.points, ring.innerRadius/outerRadius/thetaSegments, spline.beltSpeed (line 814), spline.poleHeight (line 828 is stringlight, which is in x0z0), layout.box (line 700), material.emissive/emissiveIntensity/unlit, scatter-filter subfields (x0z0), visibleRange.max.

**places/workshop/cells/x0z0.scene**: header matches. 196 placements. Refs: `scripts/ex/ws/*` all exist; `scripts/ex/obsgate.js` (ws-return, line 1381) exists; `engine/portal-aurora` (line 1385). Cross-place link: ws-return to `+main#ws-gate` (lines 1385, 1389), unresolved here.
Issues:
- 18 root rows have feet z below -64 (or above +64), so they fall outside cell z0 by the world's own footprint rule (in-spatial board at line 475: cell cx spans cx·128 ±64). Lines are row line / feet line: in-acts 2/4, in-data 302/303, in-places 309/310, in-player 316/317, in-shapes 323/324, ws-avenue 761/762, ws-engine 767/769, ws-lamp4l 1290/1292, ws-lamp4r 1297/1299, ws-lamp5l 1304/1306, ws-lamp5r 1311/1313, ws-lamp6l 1318/1320, ws-lamp6r 1325/1327, ws-lamp7l 1332/1334, ws-lamp7r 1339/1341, ws-memory 1366/1368, ws-press 1373/1375, ws-wisps 1413/1416.
- The grid board at line 475 says x0z0 holds "124 rows" and claims a workshop x1z0 file (11 rows) that does not exist. This file has 196 top-level placements.
- Unverified: light.* (lines 1235–1345), scatter.templates[].weight and scatter.variation/filter subfields (lines 407, 411), primitive.holes on the wall (line 384).

**places/ws-locked/cells/x0z0.scene**: header matches. 3 placements (wsl-floor, wsl-return, wsl-sign). Refs: `scripts/ex/ws/in-places-gate.js` (line 9), exists; `engine/portal-aurora` (line 13). In-tree link: wsl-return to `+workshop#in-places-gate` (lines 13, 17), resolves to x0z-1 line 381. Issues: line 23 text claims "terrain: off" and worldBounds.bottom -12; the place config was not read, so this is unverified. Unverified: primitive.thickness on archway (line 10), material.repeat (line 5).

Unresolved (4): cross-place links to places/main not read here: `+main#plaza-top`, `+main#cm-vault-gate`, `main#w7-165-door`, `+main#ws-gate`.
State keys: for every `{{ state.X }}` template in the chunk, the key has an initial value in its own row. Whether scripts ever write these keys was not audited, so "read but never written" is not determined here.
Unverified field count: 45 distinct dotted field paths not covered by ENGINE sections 4.1–4.5 (for example sprite.*, collider2d.outline, fx.script, light.*, material.repeat/wrap, primitive sub-fields, spline.beltSpeed/poleHeight, layout.box, wisp.*, scatter sub-fields, visibleRange.max).

{"files": 8, "placements": 450, "unresolved": 4, "unverified_fields": 45}