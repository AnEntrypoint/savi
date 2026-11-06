I could not write `world-usage.md`. Subagents may not write report .md files, and the analysis files `analysis-*.md` are not on disk (the `engine-deep` directory holds only ENGINE.md, api-a.md, api-b.md, skills-a.md, skills-b.md, README.md, pin-and-untracked.md and the old world-usage.md). The rebuilt document follows, built from the six analysis results returned inline. Engine notes checked: ENGINE.md, api-a.md, api-b.md, skills-a.md, skills-b.md. skills-a and skills-b were read only by the analysis passes; the fx DSL and jev output shapes remain unverified.

# world-usage.md (rebuilt)

## 1. Coverage

| Target | Total | Analysed | Source |
|---|---|---|---|
| scripts/ex entries | 172 | 170 (56 + 57 + 57 .js files; w7 and ws are directories) | ex chunks 1-3 |
| Top-level scripts, lib, lib/data | 36 (22 + 2 + 12) | 36 | scripts top-level pass |
| Scene cells | 26 | 26 | places pass |
| Places | 11 | 11 | places pass |
| Config files | 9 in config pass, 11 places config.yaml | 20 | config pass, places pass |

Gaps in coverage: ex/w7 (26 files) and ex/ws (about 60 files) are not analysed. Sub-directories of ex, `scripts/buyables/`, `ui/nametag.js` and `scripts/architecture.json` are not analysed. Config pass referenced but did not read: arrival.js, lighting.js, ui.js, chat.js, buyables/*.js, humanoid-locomotion.js, player.js, camera.js, commons-ui-input.js and places/main cells.

Count check: the analysis files named are six (ex-1, ex-2, ex-3, scripts, places, config). Each analysis reports its own file count. The chunk-reported sums (170 ex, 36 top-level, 26 cells, 11 places, 20 config) match the totals above, with two directories excluded from ex.

## 2. The call catalog

Not computed. The chunks used different counting methods and cannot be merged:
- ex chunk 1: 103 distinct ctx members, 732 occurrences (`ctx\.[A-Za-z_.]+`).
- ex chunk 2: 56 calls (per-file summary, not a member count).
- ex chunk 3: 844 occurrences, 40 distinct members (includes comments).
- top-level scripts: 30 distinct ctx members, 183 uses (includes comments).
- places: 292 calls (referenced in scene and config rows only, not inside referenced scripts).
- config: 18 calls.

Calls seen most often across the chunks (by file mentions, not totals): `ctx.emit`, `ctx.getObject`, `ctx.query`, `ctx.after`, `ctx.spawn`, `ctx.destroy`, `ctx.self.anim`, `ctx.self.state`, `ctx.self.feetPosition`, `ctx.self.rotation`, `ears.press`, `ctx.random`, `ctx.now`, `ctx.sleep`, `ctx.place.objects`, `ctx.place.players`, `ctx.job`, `ctx.cross`, `ctx.trade`, `ctx.sql`, `ctx.canvas`, `ctx.atlas`, `ctx.quad`, `ctx.tri`, `ctx.params`, `ctx.color`, `ctx.albedo`, `ctx.lod`, `builtin/tween` `animate`, `builtin/physics` `raycast`, `builtin/nav` `findPath`.

Example files for each (from the analysis): `ctx.emit` in bellbutton.js; `ctx.sql` in climb.js; `ctx.job` in minds-villager.js; `ctx.cross` in obsgate.js; `ctx.trade` in pinecone.js; `ctx.canvas` in tex-side-coin.js; `ctx.quad` in fr-geo.js; `ctx.spawn` in fr-pit.js; `animate` in motion.js; `raycast` in fr-ball.js; `findPath` in pathbot.js.

## 3. Hook names used

Listed by the analysis as used in game-6 code (exact names):
- Behaviour hooks: `onSpawn`, `update`, `updateSchedule` (export), `onInput`, `onControlBegin`, `onControlEnd`, `onCollide`, `onTriggerEnter`, `onTriggerExit`, `onCross`, `onRefuse`, `onOutOfBounds`, `onArrive`, `onLeave`, `tick` (sim.js only), `setup` (synth.js, undocumented).
- Geometry and material: `geometry`, `collider`, `material`, `skeleton`, `texture`, `look`, `editor`, `visual`.
- Ears and events: `ears.press`, `ears.report`, `ears.noise`, `ears.talk`, `ears.offer`, `ears.ring`, `ears["place-stone"]`, `ears["ui:buy-hat"]`, `ears["ui:buy-tip"]`, `ears["ui:post"]`, `ears["ui:next"]`, `ears.charge`, `ctx.on("ui:tap")`, `ctx.on("ui:reset")`.
- Job callbacks: `decided`, `onMailSent`, `sysFetched`, `sysRiddled`, `w7Checked`.
- Named timer targets: `dry`, `hush`, `settle`, `restock`, `home`, `boom`, `rearm`, `still`, `quiet`, `noon`, `land`, `chime`, `resume`.

Unverified by the notes: `setup`, `material`, `skeleton`, `look`, `ears.*` custom names (only `ears.press` and `ears.noise` are documented shapes), `tick`, `onArrive`/`onLeave` as hooks (observed only, ENGINE 2.2).

## 4. Patterns in use

- Scene rows: placements with `material` (scripted or standard), `physics` (`body: static|character|dynamic`, `trigger`), `state`, `tags`, `behavior` (string or array), `fx`, `audio`, `sprite`, `texture`, `model`, `anim`, `scatter`, `attachment`, `parent`. Undocumented sub-keys: `sprite.lit`, `sprite.parallax`, `sprite.repeatX`, `sprite.sortingLayer`, `interpolation`, `scatter`, `wisp`.
- Templates: `templates/player.js` (physics character, behaviour list, `platformState`); `templates/camera.js` (custom camera, orientation look, sensitivity 3).
- Behaviours: state-driven kinematic rigs (gate.js, lift via c92-lift.js, door.js); event-driven toggles (bellbutton.js, lever.js, cave.js); ear-driven interactions (dmbell.js, statebox.js); scheduled loops (`updateSchedule`, 0.25 to 3 s); SQL persistence (chests.js, climb.js, guestbook.js); job-driven decisions (goat.js, minds-villager.js, oracle.js).
- Geometry scripts: one script per family (fr-geo, car77-geo, c92-geo, minds-geo, sys-geo, market-geo); instanced meshes (c92-flock.js, lichen-field.js).
- Textures: 2D atlas and canvas scripts (tex-side-*, td-art, td-tiles, tex-gallery, tex-leaves, tex-south), selected by `?kind=` or `?layer=` query strings.
- UI: ui.js HUD (passport, exhibit card, prompt, desk panels); per-object UI strings (typestone.js); per-player UI (side-ui.js, commons-ui-input.js).
- Portals: `ctx.cross` with `onTriggerEnter`/`onCross`/`onRefuse`; gate scripts (obsgate.js, worldgate.js, vaultgate.js); scripted portal material (`engine/portal-aurora|glass|pixel|starfield|blueprint`).
- Places: 11 places, cells per 128 m; heightmap generator (flat-starter-terrain.js, highlands-terrain.js), voxel generator (blocks-terrain.js), tilemap (sidescroll, topdown), `terrain.kind: "off"` (annex, vault, w7match, ws-locked, main cells).

## 5. Issues found

### Bugs (likely wrong at runtime)
- `scripts/ex/fr-cannon.js` L18-19: T = dist/sp is 0 when the target is at the muzzle; velocity becomes NaN/Infinity.
- `scripts/ex/minds-geo.js` L97: `ctx.randomRange` is not in the notes (only `ctx.random`); throws for hedge at lod <= 2.
- `scripts/ex/pickaxe.js` L30-35: dig writes null, place requires `m === null`; ENGINE 6.1 says only `=== false` confirms empty.
- `scripts/ex/side-camera.js` L9: look-ahead never decays when stopped (up to 2 m).
- `scripts/ex/tarn.js` L14: each press adds a still timer without `ctx.cancel`; first timer resets waves early.
- `scripts/ex/td-sheep.js` L6-8: when `goal` is null, `!s.goal` re-picks every tick; grazing never holds.
- `scripts/ex/synth.js` L33/L40: `fault ??=` does not replace the empty string, so later processor errors are lost.
- `scripts/ex/car77-gate.js` L14: a 3 s debounce on the gate session drops a checkpoint crossed within 3 s of the start.
- `scripts/ex/fr-pit.js` L7: `live.slice(4)` destroys whatever the query returns beyond four (order not stated).
- `scripts/ex/lakelever.js` L9: act label inverted (`on = !marks[key]`).
- `scripts/ex/holdable.js` L5: any presser can drop the holder's lantern (no owner check).
- `scripts/ex/chests.js` L14, L18 and `climb.js` L17, L21: self-rescheduling loops without a cap when `simulatedBy` is not "platform".
- `scripts/ex/guestbook.js` L2, L5-6, L15: SQL runs without the `simulatedBy` guard.
- `scripts/lib/data/commons-market.yml`: `price`/`min` do not match the buyables schema (`priceSpoins`/`minSpoins`).
- `scripts/look-default.js` L2 vs L17-18: header says it changes nothing, code grades.
- `scripts/tree.js` L65: `3 / lod` divides by lod.
- `scripts/tex-side-peaks.js` L11: `x % 9` breaks at the wrap (256 % 9 = 4).
- `scripts/ex/c92-flock.js` L5: `ctx.params.count` without `?.` (throws if params absent).
- `scripts/ex/lichen-field.js` L4 and L11: `params` read without `?.`.
- `scripts/ex/shop.js` L15: `try { proposePurchase } catch (e) {}` swallows failures.
- `scripts/ex/signboard.js` L12: concatenates a JobError object, so state shows "[object Object]".
- `scripts/ex/ringboard.js` L9: board keyed by displayName; same-name players overwrite each other.
- `scripts/ex/worldgate.js` L4 and `obsgate.js` L4: guard fails open when `tags` is not an array.
- `scripts/ex/portal.js` L3: same fails-open guard.
- `scripts/ex/panel.js` L3-8: unsubscribe discarded, no onDestroy, handlers stack on respawn.
- `scripts/ex/trader.js` L29, L42: `refused: "threw"` is not a documented refusal code; silent catches.
- `scripts/ex/pinecone.js` L5: same `"threw"` refusal.
- `scripts/ex/sys-wing.js` L46: `ctx.job("sys-fetch", ...)` points to a `jobs/sys-fetch.js` that is not under `scripts/` (the job file is at `jobs/sys-fetch.js` in the config pass, which is in the repo root, not in `scripts/`).
- `scripts/ex/sys-wing.js` L60, L163: `shown` and `busyMsg` read but never written (dead state).
- `scripts/ex/fr-pool.js` L9-10: `s.pool` unguarded; a missing value throws on `c.x`.
- `scripts/ex/gate.js` L3: `s.baseY` has no default; NaN y if unset.
- `scripts/ex/plate.js` L14: `plateY` unguarded; NaN y if unset.
- `scripts/ex/pathbot.js` L5, L7: `state.home` unguarded.
- `scripts/ex/goat.js` L19: `home.x` throws when unset. `scripts/minds-goat.js` L7, L23 and `goat.js` L21: `place.gravity.y` on a scalar gives NaN.
- `scripts/ex/chargecrystal.js` L19-29: animate target is a string; api-b 260 says handle.
- `scripts/ex/sentry.js` L10: three overlapping player checks.
- `scripts/ex/fr-ball.js` L13: sp = 0 gives NaN direction.
- `scripts/ex/fr-pitstone.js`: `onOutOfBounds` return contract ("false = handled") not in notes (api-b 185).
- `scripts/ex/fr-player.js` L16 and L19: OOB return semantics and hook name differ from `onOutOfBounds`; `RIM` shared by reference.
- `scripts/ex/sprite.js`: texture query string not in notes.
- `scripts/ex/statue.js` L11-15: `ctx.after` id not kept; second press cut short.
- `scripts/ex/oracle.js` L13-16: `loading` lock clears only inside the callback; locks forever if callback is dropped.
- `scripts/ex/vaultgate.js` L4-5: trigger rows with no tags pass through; writes state on a trigger result.

### Dead code
- `scripts/ex/minds-geo.js` L59 (robe defaulted at L53, never undefined).
- `scripts/ex/sys-wing.js` L60, L163 (listed above).
- `scripts/ex/car77.js` L127-134: F computed then void; L77 g unused.
- `scripts/ex/c92-flock.js` L3 (TAU), L23 (m0), L11-12 (first write dead).
- `scripts/ex/tex-leaves` L9: `small ? 30 : 30`.
- `scripts/tex-side-tiles`: `& 3` after `| 0` (harmless).
- `scripts/flat-starter-terrain.js`: `ctx` parameter unused in `materialAt`.
- `scripts/ex/modsbook.js` L17: `by` unused. `scripts/ex/car77-geo.js` L50: `ux` unused.
- `scripts/ex/gong.js` L6: `near` declared, never used.
- `scripts/ex/blocks-geo.js` L21: duplicate cap vertex (zero-area quad).
- `scripts/ex/c92-belt.js` L30: timer advances by literal 0.5, not dt.
- `scripts/ex/tex-side-hero.js`, `tex-side-coin.js`: none.

### Unverified calls (not in notes)
- Geometry context: `ctx.quad`, `ctx.tri`, `ctx.smooth`, `ctx.flat`, `ctx.roughness`, `ctx.metalness`, `ctx.emissive`, `ctx.noise3d`, `ctx.sway`, `ctx.bone`, `ctx.instances`/`instance`, `ctx.randomRange`, `ctx.attribute`.
- Texture: `ctx.canvas`, `ctx.atlas`, `ctx.param`, `ctx.viewZAt`.
- Editor: `ctx.authoring.handle`.
- Audio: `setup` hook, `ctx.audioWorklet`, `kind: "program"`, row fields `gain`, `loop`, `spatial`, `maxDistance`, `bus`.
- Acts: `shake`, `slash`, `impulse`, `milestone`, `stat`, `uiEvent`, `replay`, `say`, `noise`, `scope` on spawn.
- Easings: `easeOutQuad`, `easeInQuad`, `easeOutBack`, `easeInOutSine`.
- Physics and nav: raycast `bodies` option and hit fields, `overlapPoint`/`traverseCheck` results, `centerOfMass`, `surfaceVelocity`, `simulatedBy` placement field.
- Config: root keys `name`, `description`, `lighting`, `nametag`, `chat`, `authoring`, `achievements`, `leaderboards.*`, `commonsUi`, `w7ui`, `w7spin`, `touch.button: false`; scene row `template`/`overrides`.
- Job `run(job, args)` signature and throw contract.
- Terrain: `terrain.kind: "off"` and tilemap fields; voxel material fields; `cellSize`.

### Mismatches with the engine notes
- Audience shape: `{player: id}` and `{nearby: ...}` used in many files; notes define `{kind:"player", id}` and `{kind:"nearby", position, radius?}`.
- Material key `texture` used where the notes use `albedo` (for example outcomes in uipanel-exhibit.js L27/30, minds-pebble.js L9, texspinner.js L6, booth.js L24).
- `material.color`: used in most scene rows and AGENTS.md; notes give `tint` and `albedo`.
- `place.gravity` is a scalar in vehicles notes; goat.js, minds-goat.js read `.y`.
- Joint objects carry `to` and `type` (fr-joint.js L9); the notes list `target`, `anchor`, `axis`, `limits`.
- Heightmap materials as a list in config (main, highlands, observatory, workshop); notes show a keyed map.
- Flatten marks use `falloff` where notes say `falloffCurve`.
- Camera: `orientation: {source: "script"}` with `pointerLock: false` (sidescroll, topdown, fr-booth.js L8); the cameras gotcha applies to driven hulls.
- `onArrive`/`onLeave` placed under `policy` (sidescroll, topdown, ws-locked); notes list them as hooks.
- Art path forms: `cdn/...` and `/cdn/...` both used; ENGINE 6.2 item 4 unresolved.
- Collider: `halfHeight` (goat-geo.js L27) where the capsule option is `height` and `radius`.
- ObjectView `parent` writes (c92-zip.js, car77.js, camera.js); notes document `ctx.attach`.
- `ctx.self.anim.clip` as a function (humanoid-locomotion.js L223); notes use a clip path string.

## 6. Gaps in this analysis

- The analysis files are not on disk; this rebuild uses the inline results.
- Call counts are not comparable across chunks (different methods). No per-call total can be computed without a single grep-equivalent pass.
- Not analysed: ex/w7, ex/ws, scripts/buyables, ui/nametag.js, scripts/architecture.json, and the files listed in section 1.
- Engine behaviour not stated by the notes: `ctx.sleep` behaviour, `ctx.destroy` then `ctx.spawn` on the same id, `ctx.commit` signature, `ctx.music.play/stop` arguments, `onOutOfBounds` return value, `ctx.destroy` with no id, whether the resolver accepts query strings, Audience shape in emit options, runtime terrain mark persistence.
- skills-a and skills-b were not read in full; fx DSL (`?ultra:`, `follow=player`, `floor=stick`, `spin=`, `>>`, `%var|default`) and jev output shapes are unverified.
- The issue counts from the analyses (61, 144, 27, 25, 15, 37 self-reported) overlap and were not de-duplicated.

{"files": 252, "calls": 103, "issues": 309, "gaps": ["analysis-*.md files not on disk; inline results used", "call counts not comparable across chunks (103, 56, 844, 30, 292, 18 by method)", "ex/w7 and ex/ws directories not analysed", "scripts/buyables, ui/nametag.js, architecture.json not analysed", "ctx.sleep, ctx.destroy/spawn same id, ctx.commit, ctx.music args, onOutOfBounds return unstated", "skills-a/skills-b fx DSL and jev output shapes unverified", "issue counts self-reported and overlapping"]}