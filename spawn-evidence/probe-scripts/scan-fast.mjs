import { appendFileSync } from 'node:fs';
const B = 'https://play.spawn.co/world-store';
const OUT = process.env.OUT || 'scan-fast.jsonl';
const CONC = Number(process.env.CONC || 12);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) return { status: r.status, buf: null };
      return { status: r.status, buf: Buffer.from(await r.arrayBuffer()) };
    } catch (e) {
      if (i === tries - 1) return { status: 0, buf: null, err: String(e.cause?.code || e.message) };
      await sleep(500 * (i + 1));
    }
  }
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}
export async function scanWorld(uuid) {
  const w = uuid.replace(/-/g, '');
  const head = await get(`${B}/git/${w}/head.json`);
  if (!head.buf) return { world: w, stage: 'head', status: head.status };
  let manifest;
  try { manifest = JSON.parse(head.buf.toString('utf8').slice(head.buf.toString('utf8').indexOf('{'))).manifest; }
  catch { return { world: w, stage: 'head-parse' }; }
  const man = await get(`${B}/manifests/${manifest}`);
  if (!man.buf) return { world: w, stage: 'manifest', status: man.status };
  const m = man.buf.toString('latin1').match(/\{"v":1,"hashes":\[[^\]]*\]\}/);
  if (!m) return { world: w, stage: 'manifest-parse' };
  const hashes = JSON.parse(m[0]).hashes;
  const magic = {};
  const glb = [];
  const res = await pool(hashes, CONC, async (h) => {
    const v = await get(`${B}/values/${h}`);
    if (!v.buf) return { h, status: v.status };
    const tag = v.buf.subarray(0, 4).toString('latin1').replace(/[^\x20-\x7e]/g, '.') || v.buf.subarray(0, 4).toString('hex');
    return { h, tag, size: v.buf.length };
  });
  for (const r of res) {
    if (!r.tag) continue;
    magic[r.tag] = (magic[r.tag] || 0) + 1;
    if (r.tag === 'glTF') glb.push(r.h);
  }
  return { world: w, manifest, values: hashes.length, magic, glb };
}
const uuids = process.argv.slice(2);
for (const u of uuids) {
  const rec = await scanWorld(u);
  appendFileSync(OUT, JSON.stringify({ uuid: u, ...rec }) + '\n');
}
