# GLB and texture assets in the Spawn engine (6.0.0)

Tags: [verified] = read live with a GET/HEAD, or seen in the live client log of this session (/config/.spawn/client-sessions/logs/default.log). [documented] = from the public spec (openapi.json), llms.txt, a docs door section, or a skill door. Nothing here was written to a world.

## Write path (upload) [documented]

- PUT https://www.spawn.co/api/sdk/v1/{worldId}/assets/value.<sha256>.<ext>, header Authorization: Bearer <sak_>, Content-Type = the file type (model/gltf-binary for .glb), body = the raw bytes.
- Answers 201 with { url } when new, 200 "exists" when the same bytes are already carried (write-once).
- The server hashes the body; a name that does not match is 422 content_mismatch. A Content-Type that disagrees with the extension is 415.
- Body limit 4.5 MB for the whole request; over it 413.
- Larger files (three steps): POST .../assets/upload-target {name, sizeBytes} -> {uploadUrl, tempPath}; PUT the bytes to uploadUrl with the signed Content-Type and Content-Length; PUT .../assets/value.<sha256>.<ext> with Content-Type application/json and {"tempPath": ...}.
- A .glb's textures must ride inside it or beside it; an external reference is 400 external_references.
- Needs editor standing on the world.
- Sounds keep their own type: value.<sha256>.mp3 for an mp3 name.

## Reference from the tree [documented]

- A tree names a carried file as /cdn/value.<sha256>.<ext> (llms.txt). Skills write it as cdn/<name>, for example cdn/fountain.glb and cdn/texture-marble-white-veined.png (uploaded-models skill).
- A GLB's materials are keyed by the GLB's own material names, else by node names (uploaded-models skill, model.materials).
- A picture's cooked mesh is named cdn/value.<sha>.png.glb (uploaded-models skill).
- Textures in scripts: ctx.texture(cdn) and ctx.albedo("cdn/texture-<subject>.png") (builtin/three section, geometry skill).

## Read path (GET)

- There is no GET door for a carried asset in a world. GET https://www.spawn.co/api/sdk/v1/{worldId}/assets/value.<64 zeros>.glb -> 405 (the path accepts PUT only). [verified]
- Carried bytes are served from the CDN, not from the api host. Example URLs in the live log are on spawnfile.io (below). [verified]

## Live client load path (game-10, join log 11:08-13:12 UTC, 2026-11-06) [verified]

1. Boot: "runtime worker downloaded and SRI-verified" for engine e8641edd3e95e30ff487e8423fb41dff, entry file under /tmp/spawn-room-host-engine-cache-1000/<sha256>/....
2. The room welcome names the world head by hash: "commit d6c3dcc331, seq 1, manifest f3481c28177c..." (catch-up spans (15, 8327]).
3. Pre-boot streaming: "21 file(s) + 0/0 cell(s) held ... in 746 ms; the rest streams".
4. The world's asset ledger is a tree file: world.assets/<2 hex>/<encoded name>.yaml. Encoding seen: "~2f" = "/", "~3a" = ":". Examples read by the client:
   - world.assets/8f/~2fcdn~2fneutral-default-avatar.glb.yaml
   - world.assets/3d/https~3a~2f~2fspawnfile.io~2fprod~2fcharacter-assets~2f<unix-ms>-savi-reduced-fitted.glb.yaml
5. Models load through AssetService: "2 model(s) loaded here in a 30 s window, 2 from their lodpacks: 8328472 bytes; fetch 4264 ms (longest 3784), parse 215 ms". The heaviest was https://spawnfile.io/prod/character-assets/<unix-ms>-savi-reduced-fitted.glb at 7968920 bytes, fetched in 3784 ms.
6. The "lodpacks" are smaller packed copies the client loads. The same name's full-size file is 64699780 bytes (HEAD below). That lodpack is smaller than the full file [verified by sizes]; the mapping from the full URL to its lodpack is [inferred from the names and the log, not read from an endpoint].
7. "resident pre-boot armed ... manifest f3481c28177c" and "the manifest carries 16 module scan(s)" show the room manifest carries code scans, not GLB bytes. [verified]

## URL forms seen [verified]

- https://spawnfile.io/prod/character-assets/<unix-ms>-<name>.glb : prod character GLBs, named by timestamp, not by sha256.
- https://spawnfile.io/dev/character-assets/<unix-ms>-<kind>-<appId>-<name>-<unix-ms>.webp : dev art (box art, og image), seen in the feed and folio.
- https://spawnfile.io/dev/launch-kit/<appId>/<name>-<16 hex>.png : launch-kit art, seen in the folio.
- https://kiln.spawn.co/storage/v1/object/public/avatars/<uuid>-<float>.jpg : profile avatars, seen in the feed.
- https://www.spawn.co/v4/client/<engine>/agent/manifest.json : engine client manifest (see MANIFESTS.md).

## Headers and integrity of a live GLB [verified]

HEAD https://spawnfile.io/prod/character-assets/<unix-ms>-savi-reduced-fitted.glb -> 200
- content-type: model/gltf-binary
- content-length: 64699780
- cache-control: public, max-age=31536000, immutable
- etag: "fc0e4883613ca008a898eba2f714d69e" (32 hex: an md5-shaped tag, not the sha256 of the name)
- last-modified: Wed, 14 Oct 2026 07:22:31 GMT
- server: cloudflare; x-spawn-version: 52734599-777e-4c2f-9b57-ea7f3178622a

The name is not a content hash for prod character GLBs, so a client cannot verify the bytes from the name. The engine runtime is checked by SRI (sha256, base64) from the client manifest. [verified]

## Textures

No texture manifest was found. A texture is a tree reference (cdn/texture-*.png or cdn/value.<sha>.png), and its ledger row lives in world.assets/ the same way as a GLB. [inferred: the ledger read logs show only .glb rows; no texture row was seen in the log]
