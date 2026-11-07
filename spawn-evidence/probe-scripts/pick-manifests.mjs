import { readFileSync, readdirSync } from 'node:fs';
const pairs = new Map();
for (const f of readdirSync('/tmp/spawn-probe').filter((x) => /^cdn-scan-\d+\.jsonl$/.test(x))) {
  for (const line of readFileSync('/tmp/spawn-probe/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const o = JSON.parse(line); if (o.uuid && /^[0-9a-f]{64}$/.test(o.manifest || '')) pairs.set(o.manifest, o.uuid); } catch (e) {}
  }
}
const all = [...pairs.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const step = Math.floor(all.length / 40);
const pick = [];
for (let i = 0; i < all.length && pick.length < 40; i += step) pick.push(all[i]);
console.log(JSON.stringify({ distinct: all.length, picked: pick.map(([m, u]) => ({ m, u })) }));
