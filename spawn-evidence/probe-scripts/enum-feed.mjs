import { writeFileSync } from 'node:fs';
const worlds = new Map();
const seenPages = {};
async function page(sort, extra, offset) {
  const q = new URLSearchParams({ sort, limit: '48', offset: String(offset), ...extra });
  const r = await fetch(`https://www.spawn.co/api/feed?${q}`);
  const j = await r.json();
  return j.games || [];
}
for (const sort of ['hot', 'top', 'recent']) {
  let off = 0;
  for (;;) {
    const rows = await page(sort, {}, off);
    for (const r of rows) {
      const w = r.games?.world_id;
      if (w && !worlds.has(w)) worlds.set(w, { world: w, adventure: r.games.adventure_name, name: r.games.name, creator: r.profiles?.username, app: r.app_id, sort });
    }
    if (rows.length === 0 || off > 2000) break;
    off += 48;
  }
  seenPages[sort] = off;
}
const out = [...worlds.values()];
writeFileSync('feed-worlds.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify({ unique: out.length, pagesTo: seenPages }));
