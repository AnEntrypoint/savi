# Faults found while mapping the Spawn engine

Read-only probes only (GET/HEAD, docs doors, the client join log). Each fault gives the reproduction and the observed evidence. Tags: [verified] = reproduced live; [observed] = seen once in a log, cause not known.

## F1. GET /api/games/{appId} answers 200 with game: null for every app id [verified]

- Reproduced: GET https://www.spawn.co/api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f (the-savi-gallery, our own game, editor standing) -> 200 {"ok":true,"data":{"game":null}}, with and without a token.
- Same answer for game-10 (be1ff78b-d465-4688-aa20-b5ff8b5737df), for the feed app ids, and for the feed record ids.
- The route is not in the published spec (openapi.json has no GET on /api/games/{appId}). ENDPOINTS.md lists it as a per-game route with a single observed read.
- Expected: the game record, or 403/404. The same owner's folio answers 200 with the game, so the null is not a permissions answer.

## F2. The first two client joins stopped before the world: CPU eye needs an uninstalled browser [verified]

- Command: spawn client join @lanmower/game-10 --render cpu. Output: "This join did not happen; nothing changed. Your body's client stopped before it reached the world."
- Cause in default.log: "The CPU eye died before its page stood (launch: Executable doesn't exist at /config/.cache/spawnco-client/browser/playwright-1.64.1/browsers/chromium_headless_shell-1248/...)" followed by a Playwright "npx playwright install" notice.
- The bundled Playwright 1.64.1 was in the cache, but its browsers folder had no chromium_headless_shell-1248 (and no ffmpeg-1013).
- Local fix (no Spawn write): PLAYWRIGHT_BROWSERS_PATH=/config/.cache/spawnco-client/browser/playwright-1.64.1/browsers npx --no-install playwright install chromium-headless-shell (downloaded Chrome Headless Shell 156.0.8078.4 and ffmpeg-1013).
- The third join succeeded: spawn client where -> body at (0,0,0) on main; spawn client players listed the body as "claude_haiku_55".
- Fault: the client does not install its own browser on update, and the failure message at the top does not name the missing browser.

## F3. Asset ledger read answers "no head this copy heard carries it" [observed]

- default.log, during the boot: "[tree-lane] the world's asset ledger read read world.assets/8f/~2fcdn~2fneutral-default-avatar.glb.yaml as the file the ledger lives in; no head this copy heard carries it (asked while the view stood behind)".
- The same line for world.assets/3d/https~3a~2f~2fspawnfile.io~2fprod~2fcharacter-assets~2f...-savi-reduced-fitted.glb.yaml.
- Reading: the ledger row was requested while the local view was behind the head (the welcome named seq 1 at commit d6c3dcc331). The row may then be read again after catch-up; no later line for these two rows was found in default.log, so whether they settled is unknown.
- Not reproduced on demand. Needs a log window from a join that stays past the catch-up.

## F4. Our two playUrls disagree between two endpoints [verified]

- GET https://www.spawn.co/api/agent/v1/games (writable list): game-10 playUrl "/@claude_haiku_55/game-10"; the-savi-gallery playUrl "/@claude_haiku_55/the-savi-gallery".
- GET https://www.spawn.co/api/agent/v1/me and /worlds: playUrl "/@lanmower/game-10" and "/@lanmower/the-savi-gallery", with the address "@lanmower/<slug>".
- The world's real address is under lanmower (git URL and the join log use @lanmower). The games door uses the token owner's handle for the URL.

## F5. /api/client/manifest (no query) changed its target between two reads [verified]

- Early read: 302 to /v4/client/e8641edd3e95e30ff487e8423fb41dff/agent/manifest.json (matches engineVersion in docs).
- Later read with the same URL: 302 to /v4/client/b7a5a3451fe996f116985ac743c91eae/agent/manifest.json.
- The two manifests differ only in browser-client.mjs (SRI sha256 changed). So a new client build was published between reads and the no-query pointer moved to it. Not an error by itself; noted so that the manifest is always read with its hash.

## Not faults (expected, recorded so they are not re-reported)

- GET .../assets/value.<name> -> 405: the assets door is PUT-only (documented).
- GET /api/sdk/v1/{W}/agent/docs for other feed worlds -> 403 "No access to this game": the token is not an editor there (documented access rule).
- GET /api/games/{appId}/folio for a game we do not make -> 403 not_your_kit (documented).
