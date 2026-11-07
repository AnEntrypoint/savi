import { readFileSync, readdirSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const EPHEMERAL_PROVENANCE_ROOT = '/tmp/spawn-probe';
const root = EPHEMERAL_PROVENANCE_ROOT;
const outDir = root + '/v3';
const resPath = outDir + '/results.jsonl';
const RAW_TARGET = '0016de866e01dbc82afb3448900e69185a5d9e73531379f0f29afdfa5cd9a132';
const DEC_TARGET = '13abafd82723caeb078177b84ab6e1f7e8d03057bd32d8b9442655cae55f9314';
const EXPECTED = 2580;
mkdirSync(outDir, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const isGzip = (b) => b.length >= 3 && b[0] === 0x1f && b[1] === 0x8b && b[2] === 0x08;

function census(buf) {
  const n0 = buf.readUInt32BE(0);
  const sheetText = buf.subarray(4, 4 + n0).toString('utf8');
  const hashes = JSON.parse(sheetText).hashes;
  const c = {
    bytes: buf.length, sheetHashes: hashes.length, frames: 0, gzipFrames: 0, gzipDecodedMatch: 0,
    gzipFail: 0, rawMatch: 0, rawFail: 0, eof: false, hitRaw: sheetText.includes(RAW_TARGET), hitDec: sheetText.includes(DEC_TARGET),
  };
  let pos = 4 + n0, i = 0, trunc = false;
  while (pos < buf.length) {
    if (pos + 4 > buf.length) { trunc = true; break; }
    const n = buf.readUInt32BE(pos);
    if (pos + 4 + n > buf.length) { trunc = true; break; }
    const body = buf.subarray(pos + 4, pos + 4 + n);
    const expected = hashes[i];
    c.frames++;
    if (isGzip(body)) {
      c.gzipFrames++;
      let ok = false;
      try { ok = sha(gunzipSync(body)) === expected; } catch { ok = false; }
      if (ok) c.gzipDecodedMatch++; else c.gzipFail++;
    } else if (sha(body) === expected) c.rawMatch++;
    else c.rawFail++;
    pos += 4 + n;
    i++;
  }
  c.eof = !trunc && pos === buf.length;
  c.framesEqualHashes = c.frames === hashes.length;
  return c;
}

const selfBuf = readFileSync(root + '/wide-all/d048.bin');
const self = census(selfBuf);
const selfOk = self.gzipFrames === 1 && self.gzipDecodedMatch === 1 && self.rawMatch === 2 && self.rawFail === 0 && self.gzipFail === 0 && self.eof && self.framesEqualHashes;
console.log('SELFTEST ' + (selfOk ? 'PASS' : 'FAIL') + ' ' + JSON.stringify(self));
if (!selfOk) process.exit(1);

const manifests = new Map();
for (const f of readdirSync(root).filter((x) => /^cdn-scan-\d+\.jsonl$/.test(x))) {
  for (const line of readFileSync(root + '/' + f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (/^[0-9a-f]{64}$/.test(o.manifest || '')) manifests.set(o.manifest, o.uuid);
  }
}
const wideText = readFileSync(root + '/wide-all/results.jsonl', 'utf8');
const missing = [...manifests.keys()].filter((m) => !wideText.includes(m));
console.log('SET manifests=' + manifests.size + ' missingFromWideAll=' + missing.length);
if (manifests.size !== EXPECTED || missing.length) process.exit(1);

const done = new Set();
if (existsSync(resPath)) {
  for (const l of readFileSync(resPath, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try { done.add(JSON.parse(l).m); } catch {}
  }
}
const todo = [...manifests.keys()].sort().filter((m) => !done.has(m));
console.log('RESUME done=' + done.size + ' todo=' + todo.length);

async function fetchManifest(m) {
  const url = 'https://play.spawn.co/world-store/manifests/' + m;
  let last = { status: 'error', error: 'none' };
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.status !== 200) { last = { status: res.status, attempt: a }; continue; }
      return { status: 200, attempt: a, buf: Buffer.from(await res.arrayBuffer()) };
    } catch (e) {
      last = { status: 'error', attempt: a, error: String(e.cause?.code || e.name).slice(0, 40) };
    }
  }
  return last;
}

let next = 0, completed = 0;
const started = Date.now();
async function worker() {
  while (next < todo.length) {
    const m = todo[next++];
    const f = await fetchManifest(m);
    let row;
    if (f.status === 200) {
      try { row = { m, status: 200, attempt: f.attempt, ...census(f.buf) }; }
      catch (e) { row = { m, status: 200, attempt: f.attempt, censusError: String(e.message).slice(0, 80) }; }
    } else row = { m, ...f };
    appendFileSync(resPath, JSON.stringify(row) + '\n');
    completed++;
    if (completed % 20 === 0 || completed === todo.length) {
      console.log('progress completed=' + completed + '/' + todo.length + ' elapsedS=' + Math.round((Date.now() - started) / 1000) + ' at ' + new Date().toISOString());
    }
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

const rows = readFileSync(resPath, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
const uniq = new Map();
for (const r of rows) uniq.set(r.m, r);
const all = [...uniq.values()];
const sum = (k) => all.reduce((s, r) => s + (r[k] || 0), 0);
const count = (fn) => all.filter(fn).length;
const summary = {
  manifests: all.length,
  status200: count((r) => r.status === 200 && !r.censusError),
  nonOk: all.filter((r) => r.status !== 200 || r.censusError).map((r) => ({ m: r.m, status: r.status, censusError: r.censusError })),
  frames: sum('frames'),
  gzipFrames: sum('gzipFrames'),
  gzipDecodedMatch: sum('gzipDecodedMatch'),
  gzipFail: sum('gzipFail'),
  rawMatch: sum('rawMatch'),
  rawFail: sum('rawFail'),
  manifestsEof: count((r) => r.eof),
  manifestsFramesEqualHashes: count((r) => r.framesEqualHashes),
  manifestsWithGzip: count((r) => r.gzipFrames > 0),
  hitRawManifests: all.filter((r) => r.hitRaw).map((r) => r.m),
  hitDecManifests: all.filter((r) => r.hitDec).map((r) => r.m),
};
console.log('SUMMARY ' + JSON.stringify(summary));
console.log('DONE scan completed rows=' + all.length + ' expected=' + EXPECTED);
