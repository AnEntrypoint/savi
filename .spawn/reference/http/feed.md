# GET /api/feed

- Method: GET
- Path: /api/feed (documented with `?sort=hot|top|recent&q=`; no query sent in this probe)
- URL: https://www.spawn.co/api/feed
- Auth: not required. Bearer and no-auth both return 200 with identical bodies (33397 bytes).
- Status with Bearer: 200. Status without auth: 200.
- Top-level keys (200): games, ok
- Source: llms.txt says "lists public games without a credential".
- Raw: raw/feed.bearer.body, raw/feed.noauth.body
