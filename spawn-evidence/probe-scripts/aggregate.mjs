import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const files = readdirSync('.').filter((f) => /^(feed-scan-|sample-scan|full-scan-).*\.jsonl$/.test(f));
const seen = new Map();
for (const f of files) for (const line of readFileSync(f, 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(line);
  if (!seen.has(r.uuid)) seen.set(r.uuid, r);
}
const recs = [...seen.values()];
const ok = recs.filter((r) => r.values != null);
const fail = recs.filter((r) => r.values == null);
const glbWorlds = ok.filter((r) => r.glb.length);
const magic = {};
for (const r of ok) for (const [k, v] of Object.entries(r.magic)) magic[k] = (magic[k] || 0) + v;
const failStages = {};
for (const r of fail) { const k = `${r.stage}:${r.status}`; failStages[k] = (failStages[k] || 0) + 1; }
const summary = { files: files.length, worlds: recs.length, ok: ok.length, fail: fail.length, failStages, glbWorlds: glbWorlds.length, glbHashes: glbWorlds.reduce((a, r) => a + r.glb.length, 0), values: ok.reduce((a, r) => a + r.values, 0), magic: Object.fromEntries(Object.entries(magic).sort((a, b) => b[1] - a[1]).slice(0, 25)) };
writeFileSync('aggregate.json', JSON.stringify({ summary, glb: glbWorlds.map((r) => ({ world: r.world, glb: r.glb })) }, null, 1));
console.log(JSON.stringify(summary, null, 1));
