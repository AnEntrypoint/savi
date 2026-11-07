import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename, dirname } from 'node:path';
const roots = ['/tmp/spawn-probe', '/workspace/spawn/maps/witness'];
const files = [];
const walk = (d, depth) => { if (depth > 4) return; for (const f of readdirSync(d)) { const p = join(d, f); let st; try { st = statSync(p); } catch (e) { continue; } if (st.isDirectory()) walk(p, depth + 1); else if (st.size < 3000000) files.push(p); } };
for (const r of roots) walk(r, 0);
const re = /world\.assets\/([0-9a-f]{2})\/~2fcdn~2fvalue\.([0-9a-f]{64})\.([a-z0-9]{1,6})\.yaml/g;
const rows = new Map();
for (const p of files) { let t; try { t = readFileSync(p, 'latin1'); } catch (e) { continue; } let m; while ((m = re.exec(t)) !== null) { const k = m[1] + ' ' + m[2] + ' ' + m[3]; if (!rows.has(k)) rows.set(k, { path: p, base: basename(p), dir: basename(dirname(p)) }); } }
const out = [...rows.entries()].map(([k, v]) => { const [xx, sha, ext] = k.split(' '); const baseHex = v.base.replace(/\.[a-z]+$/, ''); const valueHash = /^[0-9a-f]{64}$/.test(baseHex) ? baseHex : null; const dirUuid = (v.dir.match(/[0-9a-f]{32}/) || [null])[0] || null; return { xx, sha, ext, base: v.base, dir: v.dir, valueHashPrefixOK: valueHash ? valueHash.slice(0, 2) === xx : null, dirUuidPrefixOK: dirUuid ? dirUuid.slice(0, 2) === xx : null }; });
const withValue = out.filter((o) => o.valueHashPrefixOK !== null);
const withUuid = out.filter((o) => o.dirUuidPrefixOK !== null);
const bases = {}; for (const o of out) bases[o.dir] = (bases[o.dir] || 0) + 1;
console.log(JSON.stringify({ keys: out.length, valueHashKnown: withValue.length, valueHashPrefixMatch: withValue.filter((o) => o.valueHashPrefixOK).length, dirUuidKnown: withUuid.length, dirUuidPrefixMatch: withUuid.filter((o) => o.dirUuidPrefixOK).length, dirs: Object.entries(bases).slice(0, 8) }));
