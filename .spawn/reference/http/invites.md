# GET /api/invites

- Method: GET
- Path: /api/invites
- URL: https://www.spawn.co/api/invites
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (14 bytes)
- Status without auth: 401, body `{"error":"Unauthorized"}`. Top-level keys: error.
- Top-level keys (200): invites
- Source: llms.txt says it "lists the build invites waiting on you".
- Raw: raw/invites.bearer.body, raw/invites.noauth.body
