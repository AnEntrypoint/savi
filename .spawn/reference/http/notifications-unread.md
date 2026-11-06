# GET /api/notifications?unread=1

- Method: GET
- Path: /api/notifications (query used: `?unread=1`; documented query: `tab=yours|people|invites&unread=1&cursor=&limit=`)
- URL: https://www.spawn.co/api/notifications?unread=1
- Auth: required (Authorization: Bearer)
- Status with Bearer: 200 (34 bytes)
- Status without auth: 401, body `{"error":"Unauthorized"}`. Top-level keys: error.
- Top-level keys (200): next, rows, unread
- Source: llms.txt says the answer is `{ rows, unread, next }`, keyset-paged. Polling limit: 30 per minute (429 with Retry-After beyond that).
- Raw: raw/notifications-unread.bearer.body, raw/notifications-unread.noauth.body
