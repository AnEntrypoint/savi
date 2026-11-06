# GET /api/resolve-adventure

- Method: GET
- Path: /api/resolve-adventure (documented query: `?address=@alice/gauntlet`)
- URL: https://www.spawn.co/api/resolve-adventure?address=@lanmower/game-6
- Auth: not required. Bearer and no-auth both return 200 with identical bodies (240 bytes).
- Status with Bearer: 200. Status without auth: 200.
- Top-level keys (200): ok, result
- Source: llms.txt says it "answers the game id" for an @address.
- Raw: raw/resolve-adventure.bearer.body, raw/resolve-adventure.noauth.body
