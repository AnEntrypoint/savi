# Spawn projects in the public feed

Source: GET https://www.spawn.co/api/feed (anonymous, 200). [verified]
Fields per record used here: games.name, games.world_id, games.engine_version, app_id, profiles.username, play_count, like_count. [verified]
The feed carries art URLs and counts only; it does not list a project's GLB or texture files. [verified]

Engine: all 22 projects report engine_version 6.0.0. [verified]

| Project | Owner | world_id | app_id | Engine | Plays | Likes |
|---|---|---|---|---|---|---|
| Escape from Stranglethorn | izkimar | 7451705a-1142-4451-a8e4-d0ac42730131 | c52c8aab-4429-4dc4-83df-951cf88227f1 | 6.0.0 | 88222 | 575 |
| Shogun’s Fate | poisoncode | b132844d-c800-4116-b49c-0f93637543c2 | 342ed7a8-491d-41de-8ae1-6c1a62275640 | 6.0.0 | 11700 | 51 |
| Shoguns Return | gaba | aebe2245-eec7-4fbe-97e8-fd57e0495d4d | 93f963b1-db50-4c18-8fe4-635f8ae51349 | 6.0.0 | 9404 | 34 |
| AstroImpero Blitz | maguer | 60c01514-b06d-4f8a-9af4-17b3798de457 | 54cee91d-d6f9-40c8-a18e-16a70585c571 | 6.0.0 | 247 | 8 |
| Fabling Park | smallzero | 71a9b6bd-91d1-4e7a-910a-aa8b40e3a74f | 6459d8a3-55e9-4173-839f-015c2f3c7004 | 6.0.0 | 6460 | 180 |
| Diablo Survivors | izkimar | 56c81c80-49d6-4e51-b76a-2172e0e2f78b | 601198d1-ec6f-40e8-ac30-890a76fd6c40 | 6.0.0 | 4862 | 167 |
| Watercraft | mrmclean | d8fe9e9c-c555-4811-ba5b-e92b848f4705 | 2011941b-51d7-4178-9e5e-44cbb43e28cb | 6.0.0 | 372 | 8 |
| Flickshot | yuidev | ccacf25b-e024-40c7-88ef-32bc567f9da4 | 35edbbb3-0ca7-4cc6-989b-a0fa821585c9 | 6.0.0 | 1610 | 67 |
| Aether Legends | yisus | 02eeb05c-ad06-4e3a-964f-167954b4e4bf | bbebc885-7e1a-4fb3-9cfe-abd030e89eb3 | 6.0.0 | 761 | 66 |
| Win7 Simulator | bigyahu | 27f44471-e1a6-45b9-afd1-7bbfe2aeff1c | 5ada71bd-bfa2-4a5f-ac86-0f84fe38ba9f | 6.0.0 | 391 | 17 |
| 棱镜光路 | yu_richard | c4bd9007-dfe4-46fc-83ab-12910e17a51f | cc1b2173-0250-4bc6-bf03-1e86ad64d1ae | 6.0.0 | 1 | 1 |
| MOG | robot | fc6167dd-e4df-419a-9f84-eef05df7e893 | 0a2f384b-76ef-46bb-8340-5cd15e80a41c | 6.0.0 | 12141 | 124 |
| Spawn Turismo | kevin | 85fd21fd-9664-4e20-ab5c-d981b1606ce3 | 85b6c83e-cd62-47d5-a8ef-fa5bbe53baba | 6.0.0 | 3136 | 62 |
| Call of Paint | maine | 0925a45c-523d-4983-8a77-0418d6b00d1b | b1debd07-a9f2-4a9b-aa25-658b7c8dcb4b | 6.0.0 | 4932 | 70 |
| Blood's Gambit | chubozuma | 4a90acdd-79a0-45b8-bbc0-3f36b4fd6d44 | 6bc8a50e-97fa-46de-919c-5897ff2a7e55 | 6.0.0 | 1039 | 36 |
| Dope Hustle | ind1c4 | 776fb443-4129-4d1a-b4a4-c73cef5675aa | 56788bde-6f58-4578-9a55-87799eecbd46 | 6.0.0 | 14 | 6 |
| Sniper Arcade | fracture | 1f70eb16-3f04-4d84-a26a-f58b100ba1a5 | 8394c207-78f8-49ff-ae37-c42ef8fe2797 | 6.0.0 | 954 | 39 |
| Spawn Heights | smallzero | 06ea853f-7986-47d9-8882-8b2f910c1669 | 91e798c4-a74f-4791-b136-960362b0d47a | 6.0.0 | 182 | 14 |
| DOJO CITY | ninjacatlive | d94e8566-dfdb-4c00-b3ea-711384c17688 | 2f3ead7a-e15c-49dc-9636-1d57c63d4ce6 | 6.0.0 | 125 | 22 |
| Dust 2 DM | tiger | 7d0f59d3-0310-47a8-a857-473cb59df403 | 10997fa1-3d68-4252-826f-7d35f5ba3394 | 6.0.0 | 56543 | 1364 |
| UNDERGROUND WARFARE | retro | 94a98732-3adb-4392-bc22-a43ad31f4569 | a2364b34-da96-4e7b-986f-60359f4be25d | 6.0.0 | 5914 | 269 |
| World of Spawncraft | devcat | a06859af-1b8f-4890-9144-a0b4c71cfb37 | 81e520d9-6e29-45d3-a907-43961bf40843 | 6.0.0 | 668 | 31 |

## Our own projects (from GET /api/agent/v1/me and /api/agent/v1/games) [verified]

- game-10: world 82462294-897e-4906-8405-1513baea875d, app be1ff78b-d465-4688-aa20-b5ff8b5737df, git https://git.spawn.co/@lanmower/game-10.git
- the-savi-gallery: world 26f64424-cc19-43af-a9c3-666e4559bb05, app d21d322b-4572-4710-a8d5-eaef4e6daa1f, git https://git.spawn.co/@lanmower/the-savi-gallery.git

GET /api/agent/v1/games answers both with playUrl "/@claude_haiku_55/<slug>"; /api/agent/v1/me answers "/@lanmower/<slug>". See FAULTS.md, F4.

## Items held by our own game (GET /api/games/{appId}/folio, editor standing) [verified]

the-savi-gallery folio parts: weights, card:story, community, direction, hero, journey, look, moments, posts, slices, story, themes, card:first_review, weigh:<id>, update:<id>. Art parts carry URLs of the form https://spawnfile.io/dev/launch-kit/<appId>/<name>-<16 hex>.png (for example look-band-ac2230aa8c21042c.png).

## Items other projects hold

- folio for a feed app we do not make (Escape from Stranglethorn, app c52c8aab-4429-4dc4-83df-951cf88227f1): 403 {"code":"not_your_kit"}. [verified]
- GET /api/sdk/v1/{world_id}/agent/docs for the six feed projects tested: 403 {"error":"No access to this game"}. Anonymous: 401. [verified]
- GET /api/sdk/v1/{world_id}/agent/manifest and /agent/health for the same worlds: 404 and 403. [verified]

So the asset list of another project is not reachable through any GET door we hold. Other projects' public pages can be read through the feed only.
