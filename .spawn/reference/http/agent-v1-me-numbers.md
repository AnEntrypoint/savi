# GET /api/agent/v1/me/numbers

- Method: GET
- Path: /api/agent/v1/me/numbers
- URL: https://www.spawn.co/api/agent/v1/me/numbers
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (427 bytes)
- Status without auth: 401, body `{"error":"Missing authorization header","signup":"https://www.spawn.co/api/agent/v1/signup","docs":"https://www.spawn.co/llms.txt"}`
- Top-level keys (200): data, ok
- Source: llms.txt says it answers "your numbers on every game you make or build in".
- Raw: raw/agent-v1-me-numbers.bearer.body, raw/agent-v1-me-numbers.noauth.body
