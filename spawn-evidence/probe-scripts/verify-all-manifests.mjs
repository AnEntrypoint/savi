import { readFileSync, readdirSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const dir = '/tmp/spawn-probe';
const out = dir + '/wide-all';
mkdirSync(out, { recursive: true });
const resultsPath = out + '/results.jsonl';
const pairs = new Map();
for (const f of readdirSync(dir).filter((x) => /^cdn-scan-\d+\.jsonl$/.test(x))) {
  for (const line of readFileSync(dir + '/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const o = JSON.parse(line); if (o.uuid && /^[0-9a-f]{64}$/.test(o.manifest || '')) pairs.set(o.manifest, o.uuid); } catch (e) {}
  }
}
const done = new Set();
if (existsSync(resultsPath)) for (const line of readFileSync(resultsPath, 'utf8').split('\n')) { if (!line.trim()) continue; try { done.add(JSON.parse(line).m); } catch (e) {} }
const todo = [...pairs.keys()].sort().filter((m) => !done.has(m));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const check = (buf) => {
  const n0 = buf.readUInt32BE(0);
  const sheet = JSON.parse(buf.subarray(4, 4 + n0).toString('utf8'));
  const set = new Set(sheet.hashes);
  let pos = 4 + n0, i = 0, ordered = 0, inSet = 0, bad = null;
  while (pos < buf.length) {
    if (pos + 4 > buf.length) { bad = 'short-prefix'; break; }
    const n = buf.readUInt32BE(pos);
    if (pos + 4 + n > buf.length) { bad = 'overrun@' + pos; break; }
    const body = buf.subarray(pos + 4, pos + 4 + n);
    const s = sha(body);
    if (s === sheet.hashes[i]) ordered++;
    if (set.has(s)) inSet++;
    pos += 4 + n; i++;
  }
  return { bytes: buf.length, hashes: sheet.hashes.length, frames: i, chainEndsAtEOF: pos === buf.length && bad === null, bad, ordered, inSet, sheetVersion: sheet.v };
};
const one = async (m) => {
  const url = 'https://play.spawn.co/world-store/manifests/' + m;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.status !== 200) { return { m, url, status: res.status, attempt, note: 'non-200' }; }
      const buf = Buffer.from(await res.arrayBuffer());
      let c;
      try { c = check(buf); } catch (e) { return { m, url, status: 200, attempt, parseError: String(e.message).slice(0, 160), bytes: buf.length }; }
      return { m, url, status: 200, attempt, ...c };
    } catch (e) {
      if (attempt === 3) return { m, url, status: 'error', attempt, error: String(e.cause?.code || e.name || e.message).slice(0, 80) };
    }
  }
};
let next = 0, completed = 0;
const CONC = 12;
const worker = async () => { while (next < todo.length) { const m = todo[next++]; const r = await one(m); appendFileSync(resultsPath, JSON.stringify(r) + '\n'); completed++; } };
await Promise.all(Array.from({ length: CONC }, worker));
console.log(JSON.stringify({ total: pairs.size, alreadyDone: done.size, runNow: completed }));
