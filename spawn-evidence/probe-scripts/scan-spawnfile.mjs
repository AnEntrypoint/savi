import { appendFileSync } from 'node:fs';
const B = 'https://play.spawn.co/world-store';
const OUT = process.env.OUT || 'spawnfile-scan.jsonl';
const CONC = Number(process.env.CONC || 16);
const KEY_RE = /world\.assets\/([0-9a-f]{2})\/(https~3a~2f~2f[A-Za-z0-9._~\-]+?)\.(glb|gltf|png|jpg|jpeg|webp|mp3|mp4|ttf|woff2|gif|avif)\.yaml/g;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const decodeName = (s) => s.replace(/~([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
async function get(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(30000) });
      const buf = opts.method === 'HEAD' ? null : Buffer.from(await r.arrayBuffer());
      return { status: r.status, type: r.headers.get('content-type'), buf };
    } catch (e) {
      if (i === tries - 1) return { status: 0, err: String(e.cause?.code || e.message), buf: null };
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
  if (head.status !== 200) return { world: w, stage: 'head', status: head.status };
  const ht = head.buf.toString('utf8');
  let manifest;
  try { manifest = JSON.parse(ht.slice(ht.indexOf('{'))).manifest; } catch { return { world: w, stage: 'head-parse' }; }
  const man = await get(`${B}/manifests/${manifest}`);
  if (man.status !== 200) return { world: w, stage: 'manifest', status: man.status };
  const m = man.buf.toString('latin1').match(/\{"v":1,"hashes":\[[^\]]*\]\}/);
  if (!m) return { world: w, stage: 'manifest-parse' };
  const hashes = JSON.parse(m[0]).hashes;
  const found = new Map();
  await pool(hashes, CONC, async (h) => {
    const v = await get(`${B}/values/${h}`);
    if (v.status !== 200) return;
    for (const r of v.buf.toString('utf8').matchAll(KEY_RE)) {
      const url = decodeName(r[2]) + '.' + r[3];
      found.set(url, { url, ext: r[3], key: r[0], from: h });
    }
  });
  const checked = await pool([...found.values()], CONC, async (f) => {
    const h = await get(f.url, { method: 'HEAD' });
    let magic = null;
    if (h.status === 200 && f.ext === 'glb') {
      const g = await get(f.url, { headers: { range: 'bytes=0-3' } });
      magic = g.buf ? g.buf.toString('latin1') : null;
    }
    return { ...f, status: h.status, type: h.type, magic };
  });
  return { world: w, manifest, values: hashes.length, refs: found.size, spawnfile: checked };
}
for (const u of process.argv.slice(2)) {
  const rec = await scanWorld(u);
  appendFileSync(OUT, JSON.stringify({ uuid: u, ...rec }) + '\n');
}
