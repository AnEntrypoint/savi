CHUNK=places

Method: I read the 11 config.yaml files and the sidescroll, annex, blocks, highlands, observatory, topdown, vault, w7match, ws-locked, and main/x0z0 scenes in full. Workshop x0z0 and x0z-1 were read only in part (first 398 and 301 lines). The other main cells were covered by mechanical checks (script/asset existence, portal link targets, `{{state.*}}` template keys) rather than line-by-line reading. Engine names were checked against the reference notes with counts. Nothing was written and nothing outside the read set was changed.

Reference resolution:
- All 694 `scripts/...` references (behavior, script, generator, tileset, admits, onArrive, onLeave, render, look) resolve to files under /workspace/game-6/scripts (or the place dir). Config.yaml script refs are included in that count.
- The 351 `cdn/...` and `engine/portal-*` references cannot be checked on disk, so they are unverified. The 16 `/cdn/value.<hash>` refs are also unverified.
- Every `+place#id` gate link resolves to an existing place and object id. The one exception is `main#w7-165-door` (below).

Per file (path: hooks and calls, then role, then issues):
- places/annex/config.yaml: 3d, terrain off, look script, no hooks. Walled granite annex config. No issues.
- places/annex/cells/x0z0.scene: behavior portal.js; portal-aurora material; scripted lantern (echo-lantern.js); lichen-field.js; w7 link. Annex room and gate. Gate link `+main#s1-gate` resolves. Issues: none.
- places/blocks/config.yaml: voxel terrain (generator blocks-terrain.js), materials with pattern/growth. Config verified. No issues.
- places/blocks/cells/x0z0.scene: behavior pickaxe.js, torches.js, survey-type scripted geo; plaques; portal-pixel gate to `+main#plaza-blocks`. Pedestal API text cites `ctx.place.voxels`, which the notes confirm. Issues: none.
- places/highlands/config.yaml: heightmap terrain with generator highlands-terrain.js, marks (river, sea, flatten, path, tarn-bowl), decorations with scripted grass/flower/pebble. Issues: none.
- places/highlands/cells/x0z0.scene: behaviors survey.js, lakelever.js, tarn.js, weather.js, grove.js, gradeswitch.js, bush.js, tree.js scatter; `ctx.spawn("highlands-weather")` appears only inside a code-sample string. Gate uses portal-aurora to `+main#plaza-highlands`. Issues: none. Gap: `highlands-weather` not in the notes.
- places/main/config.yaml: heightmap terrain (flat-starter-terrain.js) with marks c92-pond, fr-pit, fr-clear, fr-pool. Issues: none.
- places/main/sim.js: referee tick using `ctx.changed` and `ctx.place.objects["e8-board"]`. `e8-board` exists in main. `ctx.changed` is in the notes. Issues: none.
- places/main/cells/x0z0.scene: read in full. Has cm-mail-box (`{{state.sent}}` and `{{state.last}}` are in its state) and cm-voice-panel. cm-voice-panel's template keys earshot/mood/voice are not in its inline state, but earshot.js mentions them, so they are likely script-written (unverified). Gate portal-aurora to `+main#...`. Issues: none confirmed.
- places/main/cells/x-1z-1, x-1z-2, x0z-1, x0z-2, x0z-3, x1z-1, x1z-2, x1z0, x2z-2, x2z-3, x2z-4, x3z-3: not read in full. Mechanical checks only.
  - x0z-1 L1200: `link: "+annex"` sits inside a code-sample string (documentation), not a real gate.
  - x1z-2 L266 and L269: `link: "@lanmower/deepfall"` targets another owner's place. It cannot be resolved locally. Issue: unresolvable external link, a different syntax from every other gate.
- places/observatory/config.yaml: heightmap, atmosphere.cycle periodMs 120000, toon look script (scripts/ex/look-toon.js), params bands 4. Consistent with the header comment. Issues: none.
- places/observatory/cells/x0z0.scene: behaviors c92-obs.js and obsgate.js; c92-geo.js dome; obs-return portal-aurora to `+main#c92-obs-gate`; clock `{{state.hour}}` and `{{state.phase}}` both in state. Issues: none.
- places/sidescroll/config.yaml: tilemap, mode 2d-side, policy onArrive/onLeave side-arrive.js, camera custom with orthographic projection, UI render side-ui.js. Only config with a `name:` key. Issues: none.
- places/sidescroll/cells/x0z0.scene: 3 coins, side-crab.js, side-flag.js, side-gate portal-glass to `+main#plaza-side`, parallax peaks, sign. Sign text matches the 3 coins. Issues: none.
- places/sidescroll/cells/x1z0.scene and x5z0.scene: parallax sprite layers only. Issues: none.
- places/topdown/config.yaml: tilemap 36x26, mode 2d-top, td-camera.js, td-policy.js, solidTiles [3]. Issues: none.
- places/topdown/cells/x0z0.scene: sheep, crystals, tally, top-gate portal-starfield to `+main#plaza-top`. The tally shows "/ 4" and there are four crystals. Gap: portal-starfield is not in the notes. Issues: none.
- places/vault/config.yaml: instance solo, persistence ephemeral. Issues: none.
- places/vault/cells/x0z0.scene: vaultcounter.js with `{{ state.visits }}` and `{{ state.copy }}`, which are in its state; vaultgate.js; portal-aurora to `+main#cm-vault-gate`. Issues: none.
- places/w7match/config.yaml: instance party, persistence session. Issues: none.
- places/w7match/cells/x0z0.scene: party-board.js, ring-bell.js, echo-type ring gate portal-glass to `main#w7-165-door`. Issue: this link lacks the leading `+` used by every other gate. Target id exists in main, so it resolves only if the engine tolerates the missing prefix (unverified).
- places/workshop/config.yaml: heightmap, flat-starter-terrain.js. Issues: none.
- places/workshop/cells/x0z0.scene (partial, lines 1-398 read): in-shapes-proj-board `{{state.*}}` keys are present in its state (verified by re-parse). In-spatial-qboard and in-spatial-xread keys are present. Plinth ws-eye-plinth uses `{{ state.last }}`, which is not in its state and has no behavior, so nothing writes it. Issue. Its `{{ state.shots | default 0 }}` is safe.
- places/workshop/cells/x0z-1.scene (partial, lines 1-301 read): in-data-uiboard (key at L326) renders `{{ state.sent }}` but has no state block and no behavior, so the key is never written. Issue. ws-press-leverboard (key at L1235) renders `{{ state.shots }}` with no state block and no behavior. Issue. The rest of this file was checked mechanically.
- places/ws-locked/config.yaml: policy admits and onArrive/onLeave in-places-admits.js; terrain off; worldBounds bottom -12. Issues: none.
- places/ws-locked/cells/x0z0.scene: wsl-return portal to `+workshop#in-places-gate`, in-places-gate.js behavior; `{{state.arrived}}`, `{{state.here}}` are in wsl-sign's state. Issues: none.

Engine-name check: of the 63 distinct engine names used in scenes, 55 appear in the reference notes. Not found in the notes: `ctx.authoring.handle`, `ctx.canvas`, `ctx.quad`, `player.hidden`, `player.talking`, `player.wisps`, `player.mail`, `player.party.size`. Also unverified: `engine/portal-glass`, `engine/portal-pixel`, `engine/portal-starfield` (the notes mention only portal-aurora), `stopSound`, `highlands-weather`.

Gaps: main cells other than x0z0 (except sim.js) and most of workshop x0z0 and x0z-1 were not read in full. The 351 cdn/engine asset refs and 16 hashed value refs cannot be verified on disk. The `@lanmower/deepfall` link cannot be resolved locally. The notes do not cover the portal-glass, portal-pixel, portal-starfield, or stopSound names.

{"files": 37, "calls": 97, "issues": 5, "gaps": ["main cells x-1z-1..x3z-3 (12 files) not read in full; mechanical checks only", "workshop x0z0 and x0z-1 partially read (lines 1-398 of 1422, 1-301 of 1380)", "351 cdn/engine asset refs and 16 /cdn/value hashed refs not verifiable on disk", "link @lanmower/deepfall (main/x1z-2 L266, L269) targets another owner's place, unresolvable locally", "w7match ring-gate link main#w7-165-door lacks leading + (unverified engine tolerance)", "ws-eye-plinth uses state.last with no state or behavior writer", "in-data-uiboard (workshop/x0z-1 L326) and ws-press-leverboard (L1235) template keys never written", "engine/portal-glass, portal-pixel, portal-starfield, stopSound, highlands-weather, ctx.canvas, ctx.quad, ctx.authoring.handle, player.hidden/talking/wisps/mail/party.size not in engine notes"]}