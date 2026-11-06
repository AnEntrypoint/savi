> Correction (FEED_SCOPE.md): this inventory covers only the 22 first-block projects. The feed holds 3421 projects; they are not inventoried here.

# Asset inventory of the public project pages

Method: GET https://www.spawn.co/@<owner>/<slug> for the 22 feed projects (slug = games.adventure_name; two of them, world-of-spawncraft-2 and game-8, differ from their feed names but their page titles match the feed names). All 22 answered 200. [verified]
Each HTML page was grepped for spawnfile.io, www.spawn.co/magic and kiln.spawn.co URLs. Counts are distinct URLs on the page, not the project's full file list: the public page only shows what it renders. [verified]

Limits: the public page does not list a project's full asset set, so these counts are a floor. The project's own tree (world.assets/) is the complete list and is not readable with our token (see MANIFESTS.md). [documented: the tree is not a GET door]

| Project | Owner | Slug | Distinct URLs | GLB | Character webp | Clip-preview webp | MP4 | PNG/JPG | Trophy URLs | Download links (dmg/exe) |
|---|---|---|---|---|---|---|---|---|---|---|
| Escape from Stranglethorn | izkimar | escape-from-stranglethorn | 32 | 1 | 15 | 9 | 1 | 2 | 0 | 2 |
| Shogun’s Fate | poisoncode | shogun-s-fate | 30 | 1 | 14 | 9 | 1 | 1 | 0 | 2 |
| Shoguns Return | gaba | shoguns-return | 22 | 1 | 16 | 1 | 0 | 0 | 0 | 2 |
| AstroImpero Blitz | maguer | astroimpero-blitz | 22 | 1 | 13 | 3 | 1 | 0 | 0 | 2 |
| Fabling Park | smallzero | fabling-park | 21 | 1 | 9 | 5 | 1 | 1 | 0 | 2 |
| Diablo Survivors | izkimar | diablo-survivors | 25 | 1 | 12 | 6 | 1 | 1 | 0 | 2 |
| Watercraft | mrmclean | watercraft | 23 | 0 | 11 | 6 | 1 | 1 | 0 | 2 |
| Flickshot | yuidev | flickshot | 36 | 1 | 20 | 9 | 1 | 1 | 0 | 2 |
| Aether Legends | yisus | aether-legends | 30 | 1 | 17 | 4 | 1 | 3 | 0 | 2 |
| Win7 Simulator | bigyahu | win7-simulator | 26 | 1 | 15 | 5 | 1 | 0 | 0 | 2 |
| 棱镜光路 | yu_richard | game-8 | 13 | 0 | 5 | 2 | 1 | 1 | 0 | 2 |
| MOG | robot | mog | 26 | 1 | 18 | 2 | 1 | 0 | 0 | 2 |
| Spawn Turismo | kevin | spawn-turismo | 24 | 1 | 15 | 2 | 1 | 1 | 0 | 2 |
| Call of Paint | maine | call-of-paint | 39 | 1 | 27 | 4 | 1 | 2 | 0 | 2 |
| Blood's Gambit | chubozuma | blood-s-gambit | 36 | 1 | 21 | 9 | 1 | 0 | 0 | 2 |
| Dope Hustle | ind1c4 | dope-hustle | 15 | 1 | 10 | 0 | 0 | 0 | 0 | 2 |
| Sniper Arcade | fracture | sniper-arcade | 32 | 1 | 20 | 2 | 1 | 4 | 0 | 2 |
| Spawn Heights | smallzero | spawn-heights | 21 | 1 | 12 | 2 | 1 | 1 | 0 | 2 |
| DOJO CITY | ninjacatlive | dojo-city | 33 | 1 | 18 | 9 | 1 | 0 | 0 | 2 |
| Dust 2 DM | tiger | dust-2-dm | 36 | 1 | 22 | 6 | 1 | 2 | 0 | 2 |
| UNDERGROUND WARFARE | retro | underground-warfare | 34 | 0 | 11 | 11 | 6 | 2 | 0 | 2 |
| World of Spawncraft | devcat | world-of-spawncraft-2 | 95 | 1 | 22 | 11 | 6 | 1 | 50 | 2 |

Totals across the 22 pages: 395 distinct URLs (after stripping the query string). [verified]

## Kinds of URL seen on the pages [verified]

- https://spawnfile.io/dev/spawn-clips/v1/<worldId>/seo-preview/publish-<uuid>/value.<sha256>.webp : content-addressed preview images per publish. 93 such URLs, every value name is 64 hex (sha256 length).
- https://spawnfile.io/dev/character-assets/<unix-ms>-<uuid>.glb : per-project character GLB, named by timestamp and uuid, not by hash.
- https://www.spawn.co/magic/character-character-<id>.glb : 302 to https://spawnfile.io/dev/magic-assets/v5/values/<sha256>.glb?_av=raw1 (the path hash is the bytes' sha256).
- https://spawnfile.io/dev/trophies/<hex>-... : trophy images (no extension), 50 on one page.
- Download binaries (.dmg, .exe) linked from every page: not downloaded.

## Content-address checks (GET then sha256sum) [verified]

| URL (shortened) | Bytes | Name hash | sha256 of bytes | Match |
|---|---|---|---|---|
| spawn-clips/.../value.479363d8...webp (escape-from-stranglethorn) | 79326 | 479363d8... | 479363d8... | yes |
| spawn-clips/.../value.8ec81f2c...webp (game-8) | 7524 | 8ec81f2c... | 8ec81f2c... | yes |
| same 479363d8... bytes at a second publish path (seo-thumbnail) | 79326 | 479363d8... | 479363d8... | yes (same bytes, two paths) |
| magic-assets/v5/values/8d51f3f2...glb | 1795520 | 8d51f3f2... | 8d51f3f2... | yes |
| magic-assets/v5/values/5d077919...glb | 3269264 | 5d077919... | 5d077919... | yes |

## Non content-addressed GLB [verified]

- spawnfile.io/dev/character-assets/1783811680095-b84e3982-e315-49fa-ac53-7507e2281eb9.glb : 645076 bytes, model/gltf-binary. ETag "7a8dbd79be076859d31c3176b3645ed2" equals md5sum of the bytes. The name does not hash the bytes (sha256 9260ed45...).
- So: carried-by-PUT assets and magic assets are sha256-named; character-assets are timestamp+uuid-named with md5 ETags.
