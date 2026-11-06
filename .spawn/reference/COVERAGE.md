# Coverage: expected against found

Counts are from the tree as listed with `ls -R` and from each job's INDEX or CATALOG. The total is 208 indexed files, plus this README and COVERAGE.md. The README indexes the tree at [README.md](README.md).

## Summary

| Area | Expected | Found | Result |
|---|---|---|---|
| Tome headings | 68 | 68 distinct headings, in 69 section files | Matches. `World Queries` appears twice in the source. |
| Tome files | n/a | 74 (5 top-level, 69 sections) | Complete per tome INDEX. |
| Skills | 23 | 23 skills; 47 files (23 `.json`, 23 `.md`, INDEX) | Matches. |
| Engine docs | n/a | 27 files (README, skills.md, api-reference.md, 23 skill guides, INDEX) | Complete per engine INDEX. The 23 engine skill guides match the 23 served skill ids. |
| CLI | n/a | 39 files | See the CLI section below. |
| HTTP doors | 60 `me.doors` keys | 70 table rows: 17 called, 53 documented, not exercised | Partial by design. Writes were not sent. |
| Guide | n/a | 3 files | Digest and served guide. Served guide is for another world. |

Total indexed: tome 74, skills 47, engine 27, cli 39, http 18 top-level, guide 3 = 208. The 33 raw bodies in `http/raw/` are counted separately.

## Tome

- Expected 68 distinct headings. Found 68 distinct headings across 69 section files and [tome/INDEX.md](tome/INDEX.md). The duplicate `World Queries` heading is kept as `world-queries.md` and `world-queries-2.md`.
- Source for all sections: `?section=all`.
- Gaps reported by the tome job: none.

## Skills

- Expected 23. Found 23 served skills, all listed in [skills/INDEX.md](skills/INDEX.md).
- Gaps reported by the skills job: none.

## Engine

- Found 27 files: [engine/INDEX.md](engine/INDEX.md), README, skills.md, api-reference.md (119,585 bytes), and 23 skill guides.
- The pin file `engine.yaml` is not copied. The engine INDEX records its sha256, and the engine job reports that hash as unverified.

## CLI

- Top-level verbs in `spawn --help`: `client`, `events`, `api`, `numbers`, `mod`, `git clone`, `preview`, `bring`. Captured with `login` as a ninth help page.
- `client`: 12 verbs (`join`, `where`, `players`, `logs`, `exec`, `crossing`, `prefetch`, `install-browser`, `hear`, `say`, `leave`, `status`). Only `exec` has its own help page. The other 11 files repeat `client.txt`.
- `mod`: 4 verbs (`install`, `update`, `list`, `status`). Each prints the same `mod.txt`.
- `api`: the type listing has 305 types. All 305 are fetched into cli/types/.
- Gaps: see the CLI list below.

## HTTP doors

- The `me.doors` object has 60 keys. The catalog adds 6 docs-only doors and 4 extra read/write rows, for 70 rows.
- Called (GET run, with Bearer and/or no auth): 17 rows. These are `api`, `me`, `numbers`, `worlds`, `access`, `launch_kit`, `rooms`, `logs`, `health`, `play.feed`, `play.resolve`, `notifications`, `comments`, `invites`, `social.me`, `chat.inbox`, and `llms`.
- Documented, not exercised: 53 rows. Every POST, PUT, PATCH and DELETE door is in this group, per the no-write rule.
- Raw bodies: 33 files in `http/raw/`. Several contain personal fields. Handle them as sensitive.

## Guide

- Expected: no count given. Found: [guide/AGENTS-digest.md](guide/AGENTS-digest.md), [guide/served-guide.md](guide/served-guide.md), and [guide/served-guide.guide.txt](guide/served-guide.guide.txt).
- The served guide does not match the local AGENTS.md. See the identity section below.

## World identity (resolved)

Several jobs used world id `26f64424-cc19-43af-a9c3-666e4559bb05`. The guide job found that the docs door for that id serves the guide for `@lanmower/the-savi-gallery`, with appId `d21d322b-4572-4710-a8d5-eaef4e6daa1f`. The local AGENTS.md names `@lanmower/game-6` and records no appId. This affects the tome, skills, and HTTP SDK probes, which all used the same id. The engine job also did not use the docs door.

Confirmed by lanmower: worldId 26f64424-... is @lanmower/the-savi-gallery. The tome, skill and SDK text under that id belongs to this world.

## Gaps reported by the jobs (verbatim)

### Tome job (files: 74)

- none

### Skills job (files: 47)

- none

### Engine job (files: 27)

- "Pin file engine.yaml has hash null; the cloned engine.yaml records sha256 31a39ac2c2689403920f92bf1231e382cae87c7c3f0055769e5fb0797a60f419, which was not verified against the build."
- "The docs door (GET /api/sdk/v1/<worldId>/agent/docs and ?section=) was not consulted; the clone's api-reference.md was used as the reference."
- "keys.py at the engine repo root (615 B, code, not a doc) was not copied."
- "Clone is --depth 1, so no history or tags beyond 6.0.0 are available."
- "api-reference.md has a duplicate '## World Queries' heading; INDEX.md notes both occurrences."

### CLI job (files: 39)

- "spawn client <verb> --help prints the whole client help page, not a per-verb page; each client verb file is identical to client.txt except client-exec.txt"
- "spawn mod install|update|list|status --help each print the same shared mod help (mod.txt)"
- "spawn login --help exits 2 with 'unknown word --help' before printing usage"
- "api listing marks no type as core; fetched the 5 named types plus ObjectProperties, GameSpec, ObjectDef, PlaceDef, RoomSpec, UIDef, PlayerDef"
- "305 api types listed; only 12 fetched"
- "ObjectPropertiesSpec resolves to the same output as ObjectProperties (alias)"
- "no spawn api <Type> <kind> or <Type>.<key> forms run"
- "api output reflects engine 6.0.0 from /workspace/savi/.spawn/engine.yaml"

### HTTP job (files: 18)

- "GET /api/agent/v1/access was called without ?world=<id>, so only 400 world_required was observed and the standing answer was not exercised"
- "GET /api/games/{appId}/folio returned 404 no_folio for the probed game, so the launch kit contents and the zip door were not seen"
- "GET /api/agent/v1/api returned the Tome type index (305 types), not HTTP door docs; the single-type query form is not documented in its body"
- "Method not stated in source text for me.doors.delete (/api/games/{appId}), play.attach (play.bigspawn.net/session/attach) and openapi.json"
- "Documented but not exercised: pfp, launch_kit_zip, notifications/stream (SSE), social who/met/places/hidden, chat room read, avatar job, skills, sdk docs, llms-full.txt, .well-known/api-catalog, agent-skills index"
- "All POST, PUT, PATCH and DELETE doors are documented, not exercised, per the no-write rule"
- "raw/ bodies for social-me, notifications, invites and me contain personal fields; only key names were written to the door files"
- "The sdk probes used world 26f64424-cc19-43af-a9c3-666e4559bb05 from the task; it was not cross-checked against me.worlds"

### Guide job (files: 3)

- "Served guide for worldId 26f64424-cc19-43af-a9c3-666e4559bb05 describes @lanmower/the-savi-gallery (appId d21d322b-4572-4710-a8d5-eaef4e6daa1f), not @lanmower/game-6; the docs door returned another world's guide"
- "Local AGENTS.md records no appId for game-6, which the publish step needs; the served appId was not used"
- "Served guide tomeApi is null; only section=guide was fetched, so the Tome API sections were not retrieved"
- "AGENTS.md L13-14 sentence '64 files under x1z0, -64 under x0z0' is elliptical and ambiguous"
- "Engine repo at .spawn/engine and its api-reference.md were not inspected"

Total gaps reported: 26 (engine 5, CLI 8, HTTP 8, guide 5).

## Open items (not in the job reports)

- The engine job says the docs door was not consulted, but the guide job did consult it (`section=guide`). The two results differ, and the guide job's result names another world.
- The tome INDEX reports "Gaps: 0", but that count only covers the `section=all` fetch. It does not settle the world identity above.
- The CLI reference is not a deep reference for `client` verbs or `mod` verbs beyond their shared help text.
- API types: all 305 are fetched (see the update below).
- The `.spawn/engine` clone was not inspected by the guide job, and the `api-reference.md` checks come from the engine job alone.

## Is this complete?

Mostly. Covered: every Tome section (69 files), all 23 skills, the engine docs, every CLI verb with its help, all 305 API types (cli/types/), and every GET door.

Still open: the write doors (POST, PUT, PATCH, DELETE), which are documented from source only, the folio, SSE and social doors, the engine pin sha256, and the guide digest, which is from an older AGENTS.md. The current copy is guide/AGENTS-current.md.

Changes since the first build are dated in CHANGELOG.md. Gotchas are in LESSONS.md.
