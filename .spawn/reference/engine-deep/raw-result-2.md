I could not write `analysis-config.md`: the harness refused the write because subagents must return findings as text. The analysis is below. Checked against the engine notes in `.spawn/reference/engine-deep/`. No grep or find was used, and nothing was changed or committed.

Marks: DOC = stated in the notes; OBS = observed in game-6 only; NOT IN DOCS = in no note file; UNVERIFIED = depends on a file outside this read set.

## Config key coverage (world.config.yaml)

- DOC: `camera`, `player` (templates), `ui.render` (runtime form), `engine.behaviors`, `engine.networking` (`mode` unstated), `engine.ui.theme.font`, `inputs.actions.*` (`keys`, `mouse`, `touch.gesture`), `inputs.axes.*` (`keys`), `buyables.*` (`name`, `description`, `priceSpoins`, `minSpoins`, `once`, `onPurchase`), `touch.button` (`true` documented, `false` not).
- NOT IN DOCS: `name`, `description`, `lighting` (root), `defaultPlace` (config form), `nametag`, `chat`, `authoring`, `achievements`, `leaderboards.*` fields (`name`, `state`, `direction`), and the empty `commonsUi`, `w7ui`, `w7spin`.

## 1. /workspace/game-6/world.config.yaml

- Calls and hooks: none called. Script paths referenced: `scripts/arrival.js`, `scripts/lighting.js`, `scripts/ui.js`, `ui/nametag.js`, `scripts/chat.js`, `scripts/buyables/alpine-hat.js`, `scripts/buyables/commons-tip.js`.
- What it does: root config for the Savi Gallery. Sets the camera and player templates, the default place, multiplayer, UI font, inputs, one leaderboard, two buyables and one achievement.
- Issues:
  1. L1-3, L44, L46: prose comments (L46 cites "No. 94"). Violates INVARIANT 6.
  2. L27, L28, L36: empty `commonsUi`, `w7ui`, `w7spin` definitions. Legality not documented; no reference in this set.
  3. L5: `lighting` root key not documented. ENGINE 6.2 item 6 says `scripts/lighting.js` names a phantom `looks` skill.
  4. L45: `nametag: ui/nametag.js` sits outside `scripts/`, the convention AGENTS L18 names.
  5. L31: `touch: { button: false }`; the `false` meaning is not stated.

## 2. /workspace/game-6/sim.js

- Calls and hooks: `ctx.world.state` (DOC); `ctx.world.places.main?.objects?.["sys69"]` (`ctx.world.places` DOC, `.objects` inferred); `.state.shown` / `.state.msg` writes on another handle (DOC pattern); exports `scopes` and `cadence` (OBS only, ENGINE 2.2); `tick(ctx)` (only in the ENGINE 5.2 recipe, not in the api-b hook list).
- What it does: a 1 s referee. Seeds and reads `ctx.world.state.sysTally.bumps`, and writes the count into object `sys69` when it changes.
- Issues:
  1. L1-4: comment says it writes `ctx.place.state` (it does not), runs on `ctx.now()` (it never calls it), and that `world.state` survives a restart (the notes say only "shared within the room").
  2. L5: prose comment citing "No. 69".
  3. L6: `merge: "counter"` appears in no note file.
  4. L8: `tick` is not in the api-b Behavior Hooks list.
  5. L11: cross-place read `ctx.world.places.main?.objects`. The notes give `ctx.place.objects` for the current place only. The optional chain silently yields undefined if `main` is absent.
  6. L11: object id `sys69` unverified (row is in `places/main/cells`, not read).
  7. L9: `??=` seeding a counter-merge scope is not described.

## 3. /workspace/game-6/templates/camera.js

- Calls: none. Keys: `behavior`, `kind: "custom"`, `orientation: { source: "look" }`, `sensitivity: 3`, `state: { pitch, yaw }` (all DOC).
- Issues:
  1. L1: prose comment.
  2. L6: `sensitivity: 3` repeats the documented default.
  3. L7: template seeds `state.pitch` and `state.yaw`. The cameras gotcha says writes to these turn the look by offset; whether a template seed counts is unstated.

## 4. /workspace/game-6/templates/player.js

- Calls: none. Keys: `behavior` array, `feetPosition`, `physics: { body: "character" }`, `tags`, `platformState`, `state` (all DOC).
- Issues:
  1. L1, L7: prose comments (L7 cites "No. 70").
  2. L3: three behavior scripts outside this read set; hook order across them is unstated.
  3. L8-9: `sysSeals` is in `platformState` and also seeded in template `state`. Rejoin and reset behavior for the seed is unstated.

## 5. /workspace/game-6/jobs/sys-fetch.js

- Calls: `run(job, args)` (signature UNVERIFIED); `fetch` (DOC for job `run` only).
- What it does: fetches a JSON fact from `args.url` (default catfact.ninja) and returns up to 110 characters.
- Issues:
  1. L1: prose comment ("No. 67").
  2. L2: `run` signature and error contract not in any note.
  3. L3: `args.url` unvalidated; no timeout or size cap stated.
  4. L4: `r.json()` throws on non-JSON; the throw path inside a job is unstated.
  5. Callers are outside this set.

## 6. /workspace/game-6/jobs/ws-data-dice.js

- Calls: `run(job, args)` (synchronous; UNVERIFIED signature). Uses `Date.now`, `Math`.
- What it does: seeded LCG estimate of pi with `n` darts (clamped to 1000-2,000,000). Returns `{ pi, n, hit, ms }`.
- Issues:
  1. L1-2: prose comment ("No. 204").
  2. L3-11: up to 2,000,000 synchronous iterations; no CPU or time budget is documented for custom jobs.
  3. L4: `Number(args?.n) || 200000` makes `n: 0` silently become 200000. Bug.
  4. L12: `ms` is wall-clock, so output differs across replays, against the header's replay promise. Minor.
  5. The LCG and pi estimate are correct.

## 7. /workspace/game-6/design.md

- Calls: none. Game description, not engine statements.
- Issues:
  1. L9: place list omits `ws-locked`, which ENGINE world-usage lists.
  2. L18: passport total 166 duplicated here and in `ui.js` (ENGINE 6.2 item 13 says it will drift).
  3. L22: "489 KB against a 450 KB budget"; the budget is in no note.
  4. L12-13: `main#ws-gate <-> workshop#ws-return` matches the portal link shape only loosely (no leading `+`).

## 8. /workspace/game-6/CLAUDE.md

- Calls: none. Single line `@AGENTS.md`.
- Issues: none.

## 9. /workspace/game-6/AGENTS.md

- Calls referenced (L52-56): `ctx.spawn`, `ctx.destroy`, `ctx.getObject`, `ctx.query`, `ctx.attach`, `ctx.cross`, `ctx.emit`, `ctx.on`, `ctx.now`, `ctx.after` (all DOC). Exports named: `onSpawn`, `update`, `onCollide`, `onArrive`.
- Issues:
  1. L43: `wedge` primitive is not in the ENGINE 4.3 PrimitiveSpec kind list.
  2. L33-41, L43, L47: `material: { color }` and "MeshStandardMaterial's" fields. The notes define `StandardMaterialSpec` with `albedo`, `tint` (OKLCH) and `pbr`, and no `color`.
  3. L22-23: `model: "/cdn/..."` with a leading slash and a `texture` key. Notes use `cdn/...` and `albedo`; resolver handling of the slash is unstated.
  4. L17, L44, L47: scene-row and template `template:` / `overrides:` keys are in neither the 4.6 row fields nor the 4.7 template section.
  5. L43: "three.js geometry names" and `capsule.halfHeight`; no note gives this mapping.
  6. L106: `exec` is described as read-only. The notes do not say the door enforces that, and this job's rules list `exec` as a write door.
  7. L18: `onArrive` is listed as a hook; the api-b hook list lacks it and the notes observe it only in game-6.
  8. L12-16: 128 m cell size is stated as a rule; ENGINE 1 marks it observed only.

## Gaps

- Job `run` signature, throw contract, CPU budget, and callers of `sys-fetch` and `ws-data-dice`.
- `scopes` merge options, `tick` as a hook, `onArrive`/`onLeave` as hooks, cross-place `ctx.world.places.<p>.objects`, persistence of `ctx.world.state`.
- Template `state` seeding for camera pitch/yaw and `platformState` keys.
- Root config keys not in docs (listed above); leaderboard fields; `touch.button: false`.
- Scene-row `template`/`overrides`; material `color`/`texture` keys; box and capsule field names; `wedge`.
- Leading-slash `/cdn/` resolution; `exec` read-only enforcement; platform sections of AGENTS.md.
- Files outside this read set: `scripts/arrival.js`, `scripts/lighting.js`, `scripts/ui.js`, `scripts/chat.js`, `scripts/buyables/alpine-hat.js`, `scripts/buyables/commons-tip.js`, `ui/nametag.js`, `scripts/humanoid-locomotion.js`, `scripts/player.js`, `scripts/ex/commons-ui-input.js`, `scripts/camera.js`, `places/main` cells.

{"files": 9, "calls": 18, "issues": 37, "gaps": ["Job run(job,args) signature, throw contract, CPU budget, callers of sys-fetch and ws-data-dice", "scopes merge counter options; tick hook not in api-b list; onArrive/onLeave observed only", "ctx.world.places.<p>.objects cross-place reads and ctx.world.state persistence unstated", "Template state seeding for camera pitch/yaw and platformState keys unstated", "Root config keys not in docs: name, description, lighting, nametag, chat, authoring, achievements, leaderboard fields, commonsUi, w7ui, w7spin, touch.button false", "Scene-row template/overrides keys; material color/texture vs StandardMaterialSpec; box/capsule fields; wedge primitive", "Leading-slash /cdn/ resolution; exec read-only enforcement; AGENTS platform sections not in notes", "Files referenced but not in read set: scripts/arrival.js, lighting.js, ui.js, chat.js, buyables/*.js, ui/nametag.js, humanoid-locomotion.js, player.js, commons-ui-input.js, camera.js, places/main cells"]}