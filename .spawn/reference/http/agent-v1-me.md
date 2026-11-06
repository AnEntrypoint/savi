# GET /api/agent/v1/me

- Method: GET
- Path: /api/agent/v1/me
- URL: https://www.spawn.co/api/agent/v1/me
- Auth: required (Authorization: Bearer). Source: llms.txt says it is "the side-effect-free token check".
- Status with Bearer: 200 (6999 bytes)
- Status without auth: 401, body `{"error":"Missing authorization header","signup":"https://www.spawn.co/api/agent/v1/signup","docs":"https://www.spawn.co/llms.txt"}`
- Top-level keys (200): actorClass, avatarUrl, budget, characterModelUrl, doors, face, handle, linked, linkedTo, looks, name, note, profileUrl, readFirst, userId, username, worlds
- doors object: 60 entries, catalogued in CATALOG.md. readFirst keys: docs, why.
- Raw: raw/agent-v1-me.bearer.body, raw/agent-v1-me.noauth.body
