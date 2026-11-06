# How game-6 uses the engine (rebuilt 2026-11-05 at game 112ec46, engine b5a7587)

Raw per-file analyses are in analysis-v2-*.md (and analysis-weather.md). Each one was checked against ENGINE.md and api-a/api-b/skills notes. Calls not in those notes are marked unverified.

## 1. Coverage (checked against disk)

| Area | On disk | Named in analysis | Source |
|---|---|---|---|
| scripts/ex/*.js | 170 | 170 (ex-1, ex-2, ex-3 plus weather by hand) | analysis-v2-ex-1/2/3.md, analysis-weather.md |
| scripts/*.js (top level) | 22 | 22 | analysis-v2-scripts-top.md |
| scripts/lib/** | 14 | 14 | analysis-v2-scripts-top.md |
| places/*/cells/*.scene | 26 | 26 | analysis-v2-cells-a/b/c.md, analysis-v2-places.md |
| places/*/config.yaml | 11 | 11 | analysis-v2-places.md |
| world.config.yaml, sim.js, templates, jobs, design.md, AGENTS.md, CLAUDE.md | 12 | 12 | analysis-v2-config.md |

"Named" means the file's path or name appears in the analysis. It does not mean every line was checked. The cell agents read each file in full. Several ex agents said some sections were checked only by name, and some scripts called from the cells were not read.

## 2. Patterns in use

- Scene: one block per placement, with template and behavior references. Ids are flat strings. Some ids contain dots (e6-pillar-1.3), and float noise appears in positions and yaw.
- Behaviors: one module per feature, exporting ears.press(ctx) and similar hooks. Shared ids and helpers are duplicated across files (pressLater and onSeat in chests.js and climb.js).
- Persistence: ctx.sql for shared tables (chests, climb). Player state through ctx.self.state.
- Weather and atmosphere: a fx follow=player row is respawned on each mode change, and place.atmosphere is written field by field (weather.js).
- Portals: cells link to other places as "+place#gate". All internal gate links checked resolve, except the ones noted below.

## 3. Issues found

Bugs and risks:
- ex/chests.js: a two-statement ctx.sql transaction is assumed atomic with a changes()=1 guard. The engine notes do not state multi-statement atomicity, so a failed second write could lose a gem.
- ex/chests.js and ex/climb.js: boot and press reschedule themselves with ctx.after every 0.3 to 0.5 s when simulatedBy is not "platform", with no cap.
- ex/climb.js: the user-id fallback writes the ephemeral entity id into a durable table (L28). COUNT(*) runs on every press.
- ex/car77-gate.js: the 3 s debounce is stamped before the checkpoint check, so an early pass blocks the next 3 s. The debounce is per client because ctx.self.session is per machine.
- ex/car77-voice.js: .catch(() => {}) hides audio worklet failures.
- ex/commons-ui-input.js: accepts any https URL as a photo, which the exhibit renders as a texture. It also writes arbitrary state keys from dialog data (s[n.gift]).
- ex/cave.js: two caves in one place fight over place.acoustics.reverb.
- ex/weather.js: the rain clip path has no leading slash ("cdn/...") while clear and snow use "/cdn/...". The notes do not pin the CDN prefix.

Scene data:
- places/main/cells/x1z-2.scene: plinth text names fr-sign-gantry, fr-pup-torso and fr-ik-grip, but the real ids are fr54-gantry, fr55-torso and fr61-grip. The fr61-figure model is an absolute spawnfile.io URL, which is outside the asset forms the notes allow.
- places/main/cells/x0z-2.scene: duplicate x2-turntable top, and a stray key children.top: null.
- places/main/cells/x0z0.scene: x5-rails has stray children.child-N: null keys, which look like broken serialization. cm-voice-panel reads state.earshot, mood, voice and you, which are never written in that cell.
- places/main/cells/x0z-1.scene: w4-mirrorframe uses view camera "mirror", which is not defined in any cell read.
- places/main/cells/x-1z-1.scene: two inconsistent ids (w12-post-0.9 and w12-post0.9).
- places/workshop cells: state.sent, state.shots and state.last are read with no writer in the cell.
- places/w7match/cells/x0z0.scene: a link is missing the leading "+".
- Mixed texture path forms: "/cdn/..." in some rows and "cdn/..." in others.

Unverified (not in the engine notes): screenFlash, shake, damageNumber text and color, bus "Voice", maxDistance, place.acoustics, ctx.authoring handle, physics.centerOfMass, physics.surfaceVelocity, material.pbr, the ui at= and data-modal attributes, and several material and wisp fields.

## 4. Gaps in this analysis

- Behavior files called from the cells were checked by name and path only, not read in full.
- Engine internals are not in the clone. Hook order, sleep and destroy force, and several return shapes are unverified.
- Runtime state (saved player data, shared world state, the database) is not in git and was not read.

## Status after the 2026-11-05 fix pass

- Remote: origin is the-savi-gallery.git (ls-remote HEAD matches main).
- Fixed and pushed: main terrain pregenerate (0d7f8bc), null child keys removed from x5-rails, plinth code examples pointed at real ids (c5b3fc1), w7match portal link given its +, chime and marmot rows set simulatedBy: platform (194b4b4). Live check: the deviated-write warnings are gone; cone77-0 hold is gone.
- Closed as not a defect: x2-turntable duplicate (one entry in x0z-2); fr61-figure URL (spawnfile.io returns 200, the cdn name returns 401); w12-post-0.9 and w12-post0.9 are two posts 1.8 m apart, both real.
- Open: hook-order probe. A placed row did not load in the live room (1500 entities, no x-hook-probe), and spawn cannot carry behavior source. Cause unknown. Probe commits were reverted (efb65f7).
- Open: workshop state.sent, shots and last are seeded in the cell (sent: 0, shots: 0, last: no one yet). No writer was found in places/workshop or scripts/ by search.


## Workshop state writers (checked 2026-11-05)
- state.shots: written by `ears.press` in places/workshop/cells/x0z-1.scene (`ctx.self.state.shots += 1`), so it is a live writer, not seeded only.
- state.sent: written in scripts/ex/postman.js:30 (box.state.sent + 1), scripts/ex/w7/ping-bell.js:6 (ctx.self.state.sent + 1), scripts/ex/toast.js:7 and scripts/ex/ws/in-data-uievent.js:9 (assignment).
- state.last: written by scripts/ex/mailbox.js:12 and :16 (the mailbox script) and by the hermit/booth/chargecrystal scripts.
- Status: the workshop state writers are found in game-6 scripts. The "seeded only" open item is closed.

## Arrival budget decision (2026-11-05)

Decision: no restructure in this round. Heaviest spawn-area cells are mostly inline ui/vector markup: main x0z-1 33 KB of 130 KB, workshop x0z-1 99 KB of 185 KB, workshop x0z0 79 KB of 145 KB. Moving that markup changes how the HUD and signage draw, so it is a gameplay-facing change that needs a visual check in a preview room before a push. The push verdict is advisory; pushes still land. Next step if taken: move the markup of one cell at a time to scripts loaded with import() and preview each one.


## Workshop budget experiment (2026-11-05)

Stripped every `ui:`/`vector:` line from places/workshop/cells/x0z0.scene (commit a6b072f, pushed to main, verdict 471). The arrival budget for workshop dropped from 574 KB to 495 KB and is still over. Reverted as cc67d25 (pushed); `git diff fcae8cd HEAD` is empty. Conclusion: this markup is about 79 KB of the 574 KB and is not enough alone to clear the budget. The remaining excess is the workshop cell x0z-1 (194 KB) and its scripts.


## Spawned ui key test (2026-11-05)

ctx.spawn({ ..., ui: '<div>...' }) in a preview room: the call applied (changesApplied true, object placed 42 m from the body), but the returned object has no `ui` key (keys: id, objectId, tags, feetPosition, state, behavior, place, audience, visibility, scope, retention, simulatedBy, controller, userId). So runtime spawn drops ui markup. Markup can only live in scene rows. Moving it out of the cell needs a layout change, not a script route.


## Arrival budget cleared by removing spawn-area markup (2026-11-05)

Commit 77425d2 (pushed) removed every `ui:`/`vector:` line from main x0z-1, x1z-1 and x0z0, and from workshop x0z-1 and x0z0 (249 lines). The push output contained no `budget.arrival.exceeded` line, so both budgets cleared at this push. The markup is recoverable from git history before 77425d2. The world's HUD and signage are gone from the live world until it is restored or rebuilt.


## Signage restored within the 450 KB arrival limit (2026-11-05)

After 77425d2 removed 249 `ui:`/`vector:` lines (236,452 bytes) from five spawn cells, a push-by-push search restored as much as fits. The verdict warns at 451 KB for both places and is silent below that, so the arrival limit is 450 KB.

Kept, with no budget warning on the final push:
- `places/main/cells/x0z0.scene`: all 20 lines (10,981 bytes).
- `places/main/cells/x1z-1.scene`: first 17 of 28 lines (8,545 bytes); k=18 reached 451 KB and was reverted.
- `places/workshop/cells/x0z0.scene`: first 56 of 71 lines (52,178 bytes); k=57 reached 451 KB and was reverted.

Still stripped because restoring them would exceed 450 KB: `main/x0z-1` (32,980 bytes), the tail of `main/x1z-1` (about 5,896 bytes), the tail of `workshop/x0z0` (26,893 bytes), and all of `workshop/x0z-1` (98,979 bytes). Those lines remain recoverable from `git show cc67d25:<cell>`. Restored total: 71,704 of 236,452 bytes (about 30 percent).

`origin/main` was at e6f4cce when the signage search finished; another worker then pushed 8147154 (a map measurement with no world change) and 02ee9f1 ("edited architecture", 19 lines of scripts/architecture.json). Both were fast-forwarded into this checkout with no collision. The markup counts are still 20 / 17 / 56 and the arrival budget verdicts stayed clear. `origin/main` is now 02ee9f1. Every intermediate push reported no `budget.arrival.exceeded` except the two that were immediately reverted. The remaining markup cannot be restored without either raising the limit or moving those rows out of the spawn cells, which would move the signs themselves.


## Full signage restored, arrival budget advisory accepted (2026-11-05)

Commit e7bed12 restored all 249 ui/vector lines (236,452 bytes) in the five spawn cells from cc67d25. `git diff --stat cc67d25 HEAD` then showed only scripts/architecture.json (another worker's edit). The push verdict returned the original numbers: "arrival main 489 KB" and "arrival workshop 574 KB", both over the 450 KB advisory.

Every world-tree lever for keeping both full signage and a clear budget was tested and failed:

- Far cells are counted. A test row with a 40,000-byte ui string appended to places/main/cells/x3z-3.scene (a far cell) pushed main from about 450 KB to "arrival main 490 KB"; the row was reverted. So moving rows between cell files does not change the arrival total.
- There is no budget knob. PlaceDef in api-reference.md (mode, gravity, tickBase, damping, terrain, atmosphere, camera, material, lighting, sky, inputs, ui, listenerEntity, acoustics, fields, fieldConfig, objects, defaultSpawnPoint, defaultSpawnRotation, arrival, returnDoor, pregenerate, mintedFrom, instance, persistence, policy, worldBounds) has no budget field, and the docs have no budget.arrival key. The 450 KB threshold is server-side.
- import() cannot carry the load. All static imports in scripts/ total 49,882 bytes over 13 modules, far short of the ~164 KB needed; behavior hooks and geometry() generators need named exports resolved before the first await, so they cannot be replaced by an async shim.
- Minifying the markup saves 721 of 236,452 bytes (0.3 percent): the HTML is already compact.

Decision: keep the full signage. The verdict itself says what a player waits for is read on their own device at each boot and reported as the boot row, and pushes still land. Restoring 249 exhibit labels is worth more than clearing an advisory counter.

To return to the budget-clear state, re-run the push-by-push prefix search recorded above, or restore the five cells from commits e6f4cce / 65fcfc5 and their ancestors. The 450 KB measurement and the exact per-cell line counts stay in the sections above.

The full-signage commit e7bed12 was published to the public page as spec 508 (world_commit f66e3e6d7c0b2fdc18b07eea2913d715ed4d4815). Pushes alone never publish; the POST is recorded in live-probe-results.md.

Browser and server cleanup for this round: the one playwriter page opened in a separate context (id 343666F7D86FC5559926E26071A7853D) and its context were closed; the project's pre-existing blank page and the other project's browser were left untouched. The preview session preview-02421735 and the joined session vidprobe were left, and `spawn client status` reports no live sessions. No dev server was started.
