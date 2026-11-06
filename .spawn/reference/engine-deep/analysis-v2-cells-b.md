CHUNK=cells-b

Scope: 9 files read in full. Header cellKeys match file names for all 9. Every `behavior`/`script` path under scripts/ex and scripts/ex/w7 exists (checked with `[ -f ]`). Engine notes read: ENGINE.md section 4, api-a.md, api-b.md.

/workspace/game-6/places/main/cells/x1z-1.scene: 140 placements. Header x1z-1.
- Behaviors: c92-belt, c92-boat, c92-orb, cm-font, cm-hermit, cm-marmot, cm-mic, cm-photo, cm-upload, e11-gong, e5-keeper, e6-gate, e6-trigger, minds-124-well, minds-124-v1..v6, minds-125-bell, minds-125-goat, minds-126-guard, minds-126-pebbles, minds-127-camera, minds-128-wisp, minds-129-marmot, e12-cart, c92-obs-gate, c92-lift-btn (no, that is x1z0). Scripted-geo and texture refs all resolve.
- Issues:
  - L7, L43: `physics.surfaceVelocity` is not a listed physics key (unverified).
  - L25: boat `state.home.y` is -0.3 while feetPosition.y is 0 (suspicious).
  - L85: spline `poleHeight` is not in the spline notes (unverified).
  - L123, L155, L203, L262, L307, L658, L781, L819, L874, L903, L957: ui `at="..."` attribute is not in the notes (unverified).
  - L146: ui `data-modal` is not in the notes (unverified).
  - L188, L247, L299: sound paths use the leading-slash form `/cdn/...` while cells elsewhere use `cdn/...` (engine notes flag this as unresolved).
  - L599 and L605: `e6-pillar-1.3` and `e6-pillar1.3` are near-duplicate ids with a dot, at x 86.7 and 89.3 (suspicious naming).
  - L819: minds-126-panel ui shows the literal text `state.heard` because the braces are missing; it should be `{{ state.heard }}` (bug).
  - L940: fx DSL script is unverified.
  - L894-L925: wisp sub-fields are unverified.
- Cross-place link: c92-obs-gate L63 links to `+observatory#obs-return`. That target exists (observatory x0z0 L41).

/workspace/game-6/places/main/cells/x1z-2.scene: 106 placements. Header x1z-2.
- Behaviors: sys68, sys69, sys70, sys74, sys75, sys76, w7-143-switch, w7-144-glide/snap, w7-147-rod, w7-148-comet, w7-149-brazier, w7-150-dial, w7-152-orb, w7-154-bell, w7-155-dial, w7-163-sign, w7-171-canvas, w7-181-marmot, w7-182 limbs, w7-186-tank, w7-188-heli, w7-189-bike, and others. All resolve.
- Issues:
  - L10, L55, L115/L135, L219, L331, L340, L380: fx DSL strings are unverified.
  - L51: sys68-plinth `ctx.job("llm:generate", ..., "sysRiddled")`. The callback export `sysRiddled` must exist in scripts/ex/sys-wing.js; not verified here.
  - L163/L473: w7-163 `ctx.job("text:check", ..., "w7Checked")`. The callback `w7Checked` must exist in scripts/ex/w7/sign.js; not verified here.
  - L82: `simulatedBy: platform` is a top-level field not in the ObjectSpec notes (unverified).
  - L233: `interpolation: null` on w7-144-snap is unverified.
  - L438: ui `facing="player"` is unverified.
  - L514: ui `emissive` attribute on face back is unverified.
  - L550, L556: texture `/cdn/value.<hash>.png` is a CDN asset reference, not a tree file; not checkable here.
  - L556: sprite `billboard` and `size` are unverified.
  - L568 vs L579: the state.code for w7-181 says 3 tail bones, but the object sets bones `[tail1, tail2, tail3, head]` and `gravity: 0.4` (drift).
  - L730: pad lamp children have float noise (-8.6e-16, 5.8e-16); cosmetic.
  - L427: w7-154 emits to place `annex`, target `w7-annex-lantern` (cross-place, not in chunk).
  - L527: w7-165-door links `+w7match` (cross-place, not in chunk).
  - L246, L269, L260: `@lanmower/deepfall` is an external world link (cross-world, not a place).
  - L473: openLink to a discord URL is state text only (external).
  - L264 and L267: `sys69` `state.head: merge "counter"` depends on sim.js scopes, which is not in this chunk.

/workspace/game-6/places/main/cells/x1z0.scene: 11 placements. Header x1z0.
- Behaviors: c92-lift-btn, c92-lift-car, c92-zip (scripts/ex/c92-lift.js, scripts/ex/c92-zip.js), all exist.
- Issues: none significant. L13 `castShadow: false` is a listed key. L63 spline `stairs` is a listed kind. L81 `wireSag` is verified.

/workspace/game-6/places/main/cells/x2z-2.scene: 4 placements. Header x2z-2.
- Behavior: w7-187-plane (scripts/ex/w7/veh-plane.js), exists.
- Issues:
  - L16: `interpolation.teleportThreshold` (unverified).
  - L18: `physics.centerOfMass` (unverified).
  - L24: cone `openEnded` and material `side: double` (unverified).

/workspace/game-6/places/main/cells/x2z-3.scene: 17 placements. Header x2z-3.
- Contents: edges 1 to 7 (14 placements), w7-190-entry, w7-190-tyre2, w7-190-tyre3.
- Issues: none significant. Cell-index rule round(x/128) matches for all placements in this file.

/workspace/game-6/places/main/cells/x2z-4.scene: 4 placements. Header x2z-4.
- Contents: edges 8 and 9 (left and right). No issues.

/workspace/game-6/places/main/cells/x3z-3.scene: 10 placements. Header x3z-3.
- Behaviors: w7-190-k0 to k3 (scripts/ex/w7/race-kart.js), w7-190-race (scripts/ex/w7/race-manager.js). Both exist.
- Issues:
  - race-manager state (`phase`, `line1`, `line2`) is read in the ui, but race-manager.js is not in this chunk, so writes are unverified.
  - k0 (the player kart) has no `driver` child, unlike k1 to k3 (probably intentional; the player sits in it).
  - Float noise in feetPosition values (cosmetic).

/workspace/game-6/places/observatory/cells/x0z0.scene: 7 placements. Header x0z0.
- Behaviors: c92-toon-plinth (state text names scripts/ex/look-toon.js, which exists), obs-clock and obs-telescope (scripts/ex/c92-obs.js), obs-dome (c92-geo.js), obs-return (obsgate.js). All exist.
- Cross-place link: obs-return L46 links `+main#c92-obs-gate`. Target exists (main x1z-1 L54).
- `engine/portal-aurora` is a documented preset (portals notes).

/workspace/game-6/places/sidescroll/cells/x0z0.scene: 9 placements. Header x0z0.
- Behaviors: side-crab (scripts/ex/side-crab.js), side-flag (scripts/ex/side-flag.js), side-gate (scripts/ex/worldgate.js). Textures tex-side-coin, tex-side-crab, tex-side-flag, tex-side-peaks all exist. The `?layer=near` query suffix on side-peaks-near L50 is stripped before the file check.
- Issues:
  - L6 and L50: sprite sub-fields `lit`, `parallax`, `repeatX`, `sortingLayer`, `size`, `texture` are unverified.
  - L41 and L44: side-gate links `+main#plaza-side`. Target is not in this chunk; unverified.
  - L55: text claims the place is `mode: 2d-side`; the place config is not in this chunk.
  - side-crab state (from 21.5, to 27.5) matches its feetPosition (x 21.5). OK.

Unverified or non-tree references (not counted in unresolved): 2 `/cdn/value.*` texture refs (x1z-2 L550, L556); engine presets `engine/portal-aurora` and `engine/portal-glass` (documented, verified); external world `@lanmower/deepfall` (x1z-2 L246, L260, L269); discord openLink (x1z-2 L473, state text); cross-place targets `+main#plaza-side`, `+w7match`, `annex:w7-annex-lantern` (not in chunk).

State keys read but not written inside this chunk: minds-126-panel `state.heard`, w7-190-race `phase`, sys68 `head`/`msg` (sys-wing.js not read). Cross-file writes were not checked.

{"files": 9, "placements": 308, "unresolved": 0, "unverified_fields": 34}