# Endpoint status

Checked against https://www.spawn.co/openapi.json (62 paths, HTTP 200). Each endpoint the manual names was requested without credentials. A 404 means the route did not answer.

## Per-game (listed in the spec; 404 means this game has no kit)

- /api/games/{appId}/folio
- /api/games/{appId}/folio/zip

## Listed but disabled or partial (children listed; 404 when the feature is off for a deployment)

- /api/social
- /api/character
- /api/games

## Not in the published spec

- /api/chat-pictures
- /api/read-options
- /api/tree-ops-recorder
- /api/state-rails
- /api/sql-door
- /api/game-db-forward
- /api/revert-terrain-edits
- /api/published-room-save
- /api/commit-lane
- /api/object-api
- /api/animate
- /api/player-atmosphere
- /api/game-stat
