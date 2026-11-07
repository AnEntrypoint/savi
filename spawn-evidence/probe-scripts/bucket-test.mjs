import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const roots = ['/tmp/spawn-probe', '/workspace/spawn/maps/witness'];
const files = [];
const walk = (d, depth) => { if (depth > 4) return; for (const f of readdirSync(d)) { const p = join(d, f); let st; try { st = statSync(p); } catch (e) { continue; } if (st.isDirectory()) walk(p, depth + 1); else if (st.size < 3000000) files.push(p); } };
for (const r of roots) walk(r, 0);
const re = /world\.assets\/([0-9a-f]{2})\/~2fcdn~2fvalue\.([0-9a-f]{64})\.([a-z0-9]{1,6})\.yaml/g;
const pairs = new Map();
for (const p of files) { let t; try { t = readFileSync(p, 'latin1'); } catch (e) { continue; } let m; while ((m = re.exec(t)) !== null) { const k = m[1] + ' ' + m[2] + ' ' + m[3]; if (!pairs.has(k)) pairs.set(k, p); } }
const rows = [...pairs.keys()].map((k) => { const [xx, sha, ext] = k.split(' '); return { xx, sha, ext }; });
const hyp = {
  sha256_of_sha_hex_prefix: (r) => r.sha.slice(0, 2),
  sha256_of_name: (r) => createHash('sha256').update('/cdn/value.' + r.sha + '.' + r.ext).digest('hex').slice(0, 2),
  sha256_of_keyname: (r) => createHash('sha256').update('world.assets/' + r.xx + '/~2fcdn~2fvalue.' + r.sha + '.' + r.ext + '.yaml').digest('hex').slice(0, 2),
  sha256_of_sha_bytes: (r) => createHash('sha256').update(Buffer.from(r.sha, 'hex')).digest('hex').slice(0, 2),
  sha256_of_sha_string: (r) => createHash('sha256').update(r.sha).digest('hex').slice(0, 2),
  md5_of_name: (r) => createHash('md5').update('/cdn/value.' + r.sha + '.' + r.ext).digest('hex').slice(0, 2),
  sha1_of_name: (r) => createHash('sha1').update('/cdn/value.' + r.sha + '.' + r.ext).digest('hex').slice(0, 2),
  sha256_of_ext: (r) => createHash('sha256').update(r.ext).digest('hex').slice(0, 2),
};
const scores = Object.fromEntries(Object.entries(hyp).map(([n, f]) => [n, rows.filter((r) => f(r) === r.xx).length]));
const bucketDist = {}; for (const r of rows) bucketDist[r.xx] = (bucketDist[r.xx] || 0) + 1;
console.log(JSON.stringify({ files: files.length, distinctPairs: rows.length, distinctBuckets: Object.keys(bucketDist).length, scores, sampleRows: rows.slice(0, 5) }));
