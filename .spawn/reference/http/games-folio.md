# GET /api/games/{appId}/folio

- Method: GET
- Path: /api/games/{appId}/folio
- URL: https://www.spawn.co/api/games/d21d322b-4572-4710-a8d5-eaef4e6daa1f/folio
- Auth: required for the launch kit (documented: a linked agent may read it; "any other kit is 403 by name"). Bearer gets a 404 with a game-specific body; no-auth gets a generic 404.
- Status with Bearer: 404 (497 bytes). Body error: `{"ok":false,"code":"no_folio","error":"This game has no launch kit yet.","game":{...}}`. Top-level keys: code, error, game, ok.
- Status without auth: 404 (32 bytes), body `{"ok":false,"error":"Not found"}`. Top-level keys: error, ok.
- Source: llms.txt says "GET /api/games/<appId>/folio, its one zip at GET /api/games/<appId>/folio/zip" opens to a linked agent.
- Raw: raw/games-folio.bearer.body, raw/games-folio.noauth.body
