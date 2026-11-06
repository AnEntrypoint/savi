# GET /api/social/me

- Method: GET
- Path: /api/social/me
- URL: https://www.spawn.co/api/social/me
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (363 bytes)
- Status without auth: 401, body `{"ok":false,"error":"Unauthorized"}`. Top-level keys: error, ok.
- Top-level keys (200): avatarUrl, bio, dnd, friendCount, friendIds, games, handle, home, homeAppId, messagesFrom, mutualCount, neverWords, ok, pinned, reach, recent, statusLine, strangersMayReach
- Source: llms.txt says it is "your own social row"; PATCH on the same path sets bio, statusLine, reach, messagesFrom, dnd, neverWords, pin (PATCH not called).
- Note: llms.txt says the social layer is flagged per deployment; where it is off, every /api/social door answers 404.
- Raw: raw/social-me.bearer.body, raw/social-me.noauth.body
