import { appendFileSync } from 'node:fs';
const B = 'https://play.spawn.co';
const OUT = process.env.OUT || 'scan-cdn.jsonl';
const CONC = Number(process.env.CONC || 16);
const REF_RE = /~2fcdn~2fvalue\.([0-9a-f]{64})\.([a-z0-9]{1,6})\.yaml|cdn\/value\.([0-9a-f]{64})\.([a-z0-9]{1,6})/g;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(30000) });
      const buf = opts.method === 'HEAD' ? null : Buffer.from(await r.arrayBuffer());
      return { status: r.status, type: r.headers.get('content-type'), len: Number(r.headers.get('content-length') || (buf ? buf.length : 0)), buf };
    } catch (e) {
      if (i === tries - 1) return { status: 0, err: String(e.cause?.code || e.message) };
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
  const head = await get(`${B}/world-store/git/${w}/head.json`);
  if (!head.buf) return { world: w, stage: 'head', status: head.status };
  const ht = head.buf.toString('utf8');
  let manifest;
  try { manifest = JSON.parse(ht.slice(ht.indexOf('{'))).manifest; } catch { return { world: w, stage: 'head-parse' }; }
  const man = await get(`${B}/world-store/manifests/${manifest}`);
  if (!man.buf) return { world: w, stage: 'manifest', status: man.status };
  const m = man.buf.toString('latin1').match(/\{"v":1,"hashes":\[[^\]]*\]\}/);
  if (!m) return { world: w, stage: 'manifest-parse' };
  const hashes = JSON.parse(m[0]).hashes;
  const refs = new Map();
  await pool(hashes, CONC, async (h) => {
    const v = await get(`${B}/world-store/values/${h}`);
    if (!v.buf) return;
    for (const r of v.buf.toString('utf8').matchAll(REF_RE)) {
      const sha = r[1] || r[3]; const ext = r[2] || r[4];
      refs.set(`${sha}.${ext}`, { sha, ext, from: h });
    }
  });
  const cdn = await pool([...refs.values()], CONC, async (r) => {
    const url = `${B}/cdn/value.${r.sha}.${r.ext}`;
    const h = await get(url, { method: 'HEAD' });
    let magic = null;
    if (h.status === 200 && r.ext === 'glb') {
      const g = await get(url, { headers: { range: 'bytes=0-3' } });
      magic = g.buf ? g.buf.toString('latin1') : null;
    }
    return { ...r, status: h.status, type: h.type, len: h.len, magic };
  });
  return { world: w, manifest, values: hashes.length, refs: refs.size, cdn };
}
for (const u of process.argv.slice(2)) {
  const rec = await scanWorld(u);
  appendFileSync(OUT, JSON.stringify({ uuid: u, ...rec }) + '\n');
}
