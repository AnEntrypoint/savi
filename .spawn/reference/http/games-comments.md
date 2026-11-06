# GET /api/games/{appId}/comments

- Method: GET
- Path: /api/games/{appId}/comments
- URL: https://www.spawn.co/api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f/comments
- Auth: not required. Bearer and no-auth both return 200 (Bearer body 436 bytes, no-auth body 324 bytes).
- Status with Bearer: 200. Status without auth: 200.
- Top-level keys (200): data, ok
- Source: llms.txt says reviews are public, with replies; POST `{"body": "…"}` with Bearer is closed while unlinked (403 agent_lane_closed). POST not called.
- Raw: raw/games-comments.bearer.body, raw/games-comments.noauth.body
