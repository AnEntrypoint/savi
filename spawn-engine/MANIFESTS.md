# Manifests in the Spawn engine

Tags: [verified] = read live (GET/HEAD) or seen in the client log this session. [documented] = from openapi.json, llms.txt, or a docs/skill door.

## 1. Engine client manifest (the same for every world on one engine) [verified]

- GET https://www.spawn.co/api/client/manifest -> 302 Location https://www.spawn.co/v4/client/<engine>/agent/manifest.json
- GET https://www.spawn.co/api/client/manifest?world=<worldId> -> 302 to the same host/path shape, with a different <engine> hash (see the table below).
- Shape (200, application/json, 397 bytes):

      {
        "version": 1,
        "cli": "spawn.mjs",
        "files": {
          "spawn.mjs": "sha256-<base64>",
          "session-lib.mjs": "sha256-<base64>",
          "main.mjs": "sha256-<base64>",
          "browser-client.mjs": "sha256-<base64>"
        },
        "bun": { "floor": "1.4.0" }
      }

- Two builds were read, one after the other, and differ in one file only: browser-client.mjs. [verified by diff]
- e8641edd3e95e30ff487e8423fb41dff is the engineVersion in every docs door answer (docs.engineVersion). [verified]
- Anonymous and authenticated reads of the manifest path both answer 200 (no auth needed). [verified]

Redirect target observed over the session:

| When | GET /api/client/manifest | Target hash |
|---|---|---|
| early in session, no query | 302 | e8641edd3e95e30ff487e8423fb41dff |
| later, no query | 302 | b7a5a3451fe996f116985ac743c91eae |
| ?world=<any of 24 worlds> | 302 | b7a5a3451fe996f116985ac743c91eae |

So the no-query pointer moved between two reads, and the world query currently returns the newer hash for all 24 worlds (the 22 feed projects and our two). [verified]

## 2. World room manifest (per world, per boot) [verified in log, not readable by GET]

- The join log names it by hash: "manifest f3481c28177c..." in the welcome (commit d6c3dcc331, seq 1) and in "resident pre-boot armed". [verified]
- It carries code scans: "the manifest carries 16 module scan(s): 16 installed from the manifest". [verified]
- Candidate GET paths for it all answer 404 {"error":"not_found"} for game-10: /api/sdk/v1/{W}/agent/manifest, /api/sdk/v1/{W}/manifest, /api/games/{appId}/manifest. [verified]
- /api/client/manifest?world={W} is the engine manifest, not the world manifest. [verified]
- No GET door was found that returns the world manifest body. [verified by the 404s above; a door outside the spec cannot be ruled out]

## 3. Docs door (per world, the closest thing to a world description) [verified]

- GET https://www.spawn.co/api/sdk/v1/{W}/agent/docs -> 200 for our two worlds. Keys: appId, engineVersion, era, playUrl, gitUrl, codeUrl, specVersion, guide, tomeApi, sections (68 headings), skills (23 ids).
- GET https://www.spawn.co/api/sdk/v1/{W}/agent/docs?section=<heading> reads one section. [documented: openapi and llms.txt]
- GET https://www.spawn.co/api/sdk/v1/{W}/agent/skills/<id> -> 200 for all 23 ids (the spawn-engine skill is 1135 chars). [verified]
- Skill ids: spawn-engine, 2d-mode, buyables, cameras, fx, game-ui, geometry, heightmap-terrain, interactive-objects, jev, leaf-sprays, mobile-controls, physics, platform-systems, player-settings, pointer-raycasting, portals, projectiles, rooms-and-matchmaking, trees, uploaded-models, vehicles, voxel-terrain. [verified]

## 4. Git tree (the world's files, including world.assets/) [documented + verified in log]

- git clone https://git.spawn.co/@lanmower/<slug>.git holds the world tree. The asset ledger lives in world.assets/ (see ASSETS.md). [verified in the log for the tree path; clone not run, since it is not a GET door]

## Cross-project query results [verified]

| Query | Our 2 worlds | Other feed projects (6 tested) |
|---|---|---|
| GET /api/client/manifest?world=W | 302 to b7a5a3... | 302 to b7a5a3... (all 22 feed worlds checked) |
| GET /api/sdk/v1/W/agent/docs | 200 | 403 {"error":"No access to this game"} |
| GET /api/sdk/v1/W/agent/manifest | 404 | 404 |
| GET /api/sdk/v1/W/agent/health | 200 | 403 |
| GET /api/agent/v1/worlds | lists both | (not applicable: only ours) |

Conclusion: the engine manifest is queryable for every project by world id (the redirect is the same for all), but the per-world manifest and docs are only readable for worlds we stand on. Other projects' file lists are not reachable with our token. See PROJECTS.md and FAULTS.md.

## Update: the redirect moved again, and it ignores the world's engine [verified]

Client manifest pointer, read later in the session (GET /api/client/manifest, with or without ?world=):

| Read | Target hash | Differs from the earlier build in |
|---|---|---|
| early, no query | e8641edd3e95e30ff487e8423fb41dff | (baseline) |
| middle, no query and ?world= | b7a5a3451fe996f116985ac743c91eae | browser-client.mjs |
| latest, no query and ?world= | e66271e15431f09c7eaa8f46eafcd5d8 | main.mjs and browser-client.mjs |

The latest build's files: spawn.mjs, session-lib.mjs, main.mjs, browser-client.mjs, each sha256-SRI, bun floor 1.4.0. [verified]

Engine independence: the ?world= redirect was checked on one world per engine version (16 picks: 6.0.0, 5.2.40, 5.2.39, 5.1.5, 5.2.34, 5.2.38, 5.2.21, 5.2.3, 5.2.32, 0.1.0, 5.2.6, 5.2.11, 5.2.13, 5.0.0, 5.1.8, 5.2.33). All 16 answered the same latest hash, e66271e15431f09c7eaa8f46eafcd5d8. So the redirect is one current pointer, not one manifest per engine. [verified]

Correction to section 1 above: "the same for every world on one engine" held only for the 6.0.0 worlds I had, and the feed has 66 engine versions (FEED_SCOPE.md). The redirect does not tell us an engine's own build; that would need the world's docs door, which answers 403 for worlds we do not stand on. [verified]
