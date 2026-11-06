# The git host: what a GET can read

Host: https://git.spawn.co/@<owner>/<slug>.git (the git URL in /me and in every docs door, gitUrl). [verified]
Only discovery GETs were used (info/refs, HEAD, objects/info/packs). Fetching a tree needs the smart protocol's POST (git-upload-pack), which is not a GET door, so no tree was fetched. No POST was sent in this section.

## Authentication [verified]

- Anonymous GET of any path under @lanmower/game-10.git and @izkimar/escape-from-stranglethorn.git -> 401, with the body "authentication required: HTTPS basic auth with the SAME username and token as your git remote. The token is the password...".
- Basic auth with username claude_haiku_55 and the token as password -> 200 for our own world game-10 (info/refs).
- The same credentials for other projects -> 404 "not found" (escape-from-stranglethorn, shogun-s-fate, world-of-spawncraft-2). The host answers 404, not 403, for a world we do not stand on, so an outsider cannot tell a private world from a missing one. [verified]

## Discovery answers for game-10 [verified]

GET https://git.spawn.co/@lanmower/game-10.git/info/refs?service=git-upload-pack (basic auth) -> 200, pkt-line format:

- d6c3dcc331fb9a83b1c376140e7b8ade22fde3aa HEAD
- d6c3dcc331fb9a83b1c376140e7b8ade22fde3aa refs/heads/main
- 10a82f3eef3ee60e9fdb9ed438d0a24c9d13dc9b refs/notes/spawn
- capabilities: multi_ack_detailed, side-band-64k, thin-pack, ofs-delta, shallow, deepen-*, no-progress, include-tag, allow-tip-sha1-in-want, allow-reachable-sha1-in-want, filter, symref=HEAD:refs/heads/main

The HEAD commit d6c3dcc331 is the commit the join welcome named (seq 1), so the room and the git host agree on the head. [verified: join log line "commit d6c3dcc331, seq 1"]

refs/notes/spawn holds Spawn's own notes on commits (the clone config fetches refs/notes/* too). [documented: the clone command in /me]

## Dumb HTTP [verified]

- GET .../game-10.git/HEAD -> 404 "not found", even with auth.
- GET .../game-10.git/objects/info/packs -> 404.
So the static file layout is off. A tree read needs the smart protocol, which is a POST. Not used.

## What this means for "items other projects hold"

- The complete asset list for a world is in its git tree (world.assets/ and the tree files), and the tree is reachable only with a credential that stands on that world.
- Our token reaches game-10 and the-savi-gallery only. For the 22 feed projects, the tree is not reachable with it (404). [verified]
- Public pages and the feed are the only outside view (see PROJECT_ASSETS.md).
