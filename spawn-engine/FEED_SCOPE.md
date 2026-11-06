# Feed scope: every project the public feed lists

Source: GET https://www.spawn.co/api/feed?offset=<n>. [verified]

## How the feed pages [verified]

- The feed answers 22 to 24 rows per call. The offset parameter is honoured in steps: offset=0, 22, 44, ... each answers the next block.
- page= and cursor= are ignored: page=2 returned the same 22 rows as page 1.
- limit=100 answers 44 rows (capped), so limit does not give the whole feed.
- The walk stepped offset by 22 until two empty pages in a row. Non-empty pages: 157 (last non-empty at offset 3432 with 14 rows). Empty from 3454.
- Distinct projects: 3421. Every record had a world_id and an app_id.

## Engine versions across the feed [verified]

- Distinct engine versions: 66.
- 6.0.0: 2853 projects. Earlier notes (PROJECTS.md, PROJECT_ASSETS.md) covered only the first 22 rows, which are all 6.0.0; that was a sample, not the feed.
- Most common after 6.0.0: 0.1.0 (107), 5.2.34 (40), 5.2.4 (28), 5.2.40 (26), 5.2.21 (25), 5.2.39 (21), 5.2.3 (14).

## The full list

data/feed-projects.json (in this directory): 3421 records with app_id, world_id, name, owner, engine, plays, likes. Source: the walk above. [verified]

## Our two worlds in the feed [verified]

- The Savi Gallery (app d21d322b-4572-4710-a8d5-eaef4e6daa1f, world 26f64424-cc19-43af-a9c3-666e4559bb05) is in the feed, on page offset 176: 19 plays, 3 likes. [verified]
- game-10 (app be1ff78b-d465-4688-aa20-b5ff8b5737df, world 82462294-897e-4906-8405-1513baea875d) is not in the feed. It is not published, so this is expected. [inferred: no publish has happened; the feed lists published worlds]
