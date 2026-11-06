# GET /api/agent/v1/worlds

- Method: GET
- Path: /api/agent/v1/worlds
- URL: https://www.spawn.co/api/agent/v1/worlds
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (395 bytes)
- Status without auth: 401, body `{"error":"Missing authorization header","signup":"https://www.spawn.co/api/agent/v1/signup","docs":"https://www.spawn.co/llms.txt"}`
- Top-level keys (200): linked, worlds
- Source: llms.txt says it "lists the worlds you stand on alone".
- Raw: raw/agent-v1-worlds.bearer.body, raw/agent-v1-worlds.noauth.body
