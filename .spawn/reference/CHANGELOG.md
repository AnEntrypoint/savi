# Changelog

Dated log of the reference build and the repo pulls. Times are local to the machine.

## 2026-11-04

- Signed up as @@claude_haiku_55, linked to lanmower, editor on @lanmower/game-6. Token at /config/.spawn/token (mode 600).
- Cloned @lanmower/game-6 at f40ba8e (one commit, "born").
- Reference build (workflow spawn-full-reference, run wf_9d91c58f-f53): 208 indexed files. Tome: 69 section files from one section=all fetch. Skills: 23. Engine: api-reference.md and the 23 engine skill guides. CLI: 39 help files. HTTP: 18 files, GET-only.
- Corrections to the first build: the skill count is 23, not 21 (agent-interface.md). API types: 12 fetched at first, all 305 now in cli/types/ (run locally with spawn api). MorphTargetNamesResult came back empty in a parallel run and was re-fetched; it is string[].
- Pulls of the game clone: f40ba8e to 4ad8f8b (58 commits, guide refreshed); 4ad8f8b to 5ba1c2e (22 commits, Highlands terrace); 5ba1c2e to b405304 (50 commits, turntable and world assets). Now at b405304 on main.
- Engine clone (.spawn/engine): d9a3a63 to 804afb7. The only change is the sha256 in engine.yaml; semver stays 6.0.0.
- gm-new (/workspace/gm-new): at 0ef06a8, up to date with origin. Untracked work/rows/*.yml files there were left alone.
- Untracked in the engine clone: keys.py (present since the engine job) and probe.sh (not created by this build). Both were left alone.
- World name: AGENTS.md and world.config.yaml now say "The Savi Gallery" (@lanmower/the-savi-gallery). The git remote and /me still say game-6. See LESSONS.md.

## 2026-11-04, after the owner answer

- Owner confirmed the rename: the world is @lanmower/the-savi-gallery, "The Savi Gallery". The git URL the-savi-gallery.git and the game-6.git path both resolve (ls-remote HEAD a0dbbb4 for each).
- Re-fetched the Tome (section=all): tome/all-refetch-2026-11-04.md, it differs from tome/all.md by one trailing newline, so the served Tome is unchanged. Sections were not re-split.
- gm session replied on its friction items: fixed in gm-new 0cc8958, 2706397, b60a646 and 691fa75. Slash-command args truncation is host-side and unchanged. See LESSONS.md.
- Reference kept local. .spawn/reference/ and .spawn/agent-interface.md are listed in .git/info/exclude, so they stay out of git status. The tracked .gitignore was not changed, and nothing was committed.

## 2026-11-04, upstream pull

- Game clone: b405304 to 89c518f (66 commits, including scripts/lib/dialog.js and new world.assets/ entries). Status still clean; .spawn/ stays excluded.
- Engine clone: 804afb7 to fa39cd6. Again only engine.yaml, the sha256 line; semver 6.0.0.
- gm-new: already at b60a646 with gm's fixes; no change needed.

## 2026-11-04, upstream pull (second)

- Game clone: 89c518f to a18be87 (42 commits, including scripts/ex/minds-wisp.js, sys-wing.js and scripts/lib/data/car77.yml). Status clean.
- Engine clone: fa39cd6 to 141b4bf. Only engine.yaml changed again (sha256 line).
- gm-new: upstream is b60a646, nothing to pull. The working tree has uncommitted edits by another session (AGENTS.md, native/components/host, mcp/server.cpp, a deleted playwriter CMakeLists); left untouched.

## 2026-11-04, upstream pull (third)

- Game clone: a18be87 to 0698ecd (63 commits, including scripts/lib/data/veh-heli.yml, veh-plane.yml and veh-tank.yml). Status clean.
- Engine clone: 141b4bf to 05a6272 (7 commits). engine.yaml sha256 changed again, and skills/heightmap-terrain.md changed; the reference copy of that skill is now stale.
- gm-new: upstream 66e116f, nothing to pull. Uncommitted edits by another session are still in the working tree (AGENTS.md, DESIGN.md, native/components/host/worker.cpp, native/components/mcp/*). Left untouched.

## 2026-11-04, engine working notes

- Wrote .spawn/reference/engine-deep/: ENGINE.md (working guide, 7 sections), api-a.md and api-b.md (the 68-heading api-reference.md split in two), skills-a.md and skills-b.md (all 23 skill guides), world-usage.md (how this world uses the engine), pin-and-untracked.md. Excluded from git through .git/info/exclude.
- Limits: the engine clone has docs only (no kernel source), so internals are documented behaviour, not verified code. Many named types are not defined in the clone. Known conflicts are listed in ENGINE.md section 6.

## 2026-11-05, refetch
- Tome (section=all) re-fetched to tome/all.md (119,539 chars).
- All 23 skills re-fetched as JSON and written to skills/*.md (JSON key: content).
- Guide: guide/AGENTS-current.md copied from game clone 112ec46; served guide refreshed.
- Engine notes rebuilt from engine clone 899b3bf (pin kernel 562d7f610d8a). pin-and-untracked.md written by hand after its agent returned it as text. All 68 api-reference headings are still named in the notes.

## 2026-11-05, game content analysis (partial)
- Six analysis jobs ran. Their agents could not write files, so their text results were saved as raw-result-1..6.md under engine-deep. The saved names do not match the chunks, so file labels are not reliable.
- Coverage claimed by the jobs: 170 of 172 scripts/ex entries (w7 and ws are directories), 36 top-level scripts and lib files, 26 scene cells, 11 places, 20 config files. Not verified against the raw results.
- world-usage.md is unchanged. The assembled version is world-usage-DRAFT.md and is not trusted until the per-chunk results are re-checked.

## 2026-11-05, game content analysis (complete)
- Tagged re-run: each result saved as analysis-v2-<chunk>.md. Coverage checked against disk: scripts/ex 170 of 170 (weather.js by hand), top-level scripts 22 of 22, scripts/lib 14 of 14, scene cells 26 of 26, place configs 11 of 11, config and templates 12 of 12.
- The earlier partial run (raw-result-*.md and world-usage-DRAFT.md) is superseded. Both files are still there; do not use them.
- engine-deep/world-usage.md rebuilt from the verified analyses. Behavior files called from cells were checked by name and path only.
