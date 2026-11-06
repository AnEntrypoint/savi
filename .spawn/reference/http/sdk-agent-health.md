# GET /api/sdk/v1/{worldId}/agent/health

- Method: GET
- Path: /api/sdk/v1/{worldId}/agent/health
- URL: https://www.spawn.co/api/sdk/v1/26f64424-cc19-43af-a9c3-666e4559bb05/agent/health
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (966 bytes)
- Status without auth: 401, body `{"error":"Missing authorization header","signup":"https://www.spawn.co/api/agent/v1/signup","docs":"https://www.spawn.co/llms.txt"}`
- Top-level keys (200): note, readingsEverySeconds, rooms
- Source: llms.txt says it reports "each room's server: tick against budget, memory, start; answers when exec cannot".
- Raw: raw/sdk-agent-health.bearer.body, raw/sdk-agent-health.noauth.body
