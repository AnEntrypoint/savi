import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const roots = ['/tmp/spawn-probe', '/workspace/spawn/maps/witness'];
const files = [];
const walk = (d, depth) => { if (depth > 4) return; for (const f of readdirSync(d)) { const p = join(d, f); let st; try { st = statSync(p); } catch (e) { continue; } if (st.isDirectory()) walk(p, depth + 1); else if (st.size < 3000000) files.push(p); } };
for (const r of roots) walk(r, 0);
const keyRe = /world\.assets\/[0-9a-f]{2}\/([^\s"',\]\}]+?\.yaml)/g;
const keys = new Set();
for (const p of files) { let t; try { t = readFileSync(p, 'latin1'); } catch (e) { continue; } let m; while ((m = keyRe.exec(t)) !== null) keys.add(m[1]); }
const escapes = {}; const bare = new Set(); const charSet = new Set();
for (const k of keys) { for (const e of k.match(/~[0-9a-fA-F]{2}/g) || []) escapes[e] = (escapes[e] || 0) + 1; for (const c of k) charSet.add(c); }
const decode = (s) => s.replace(/~2f/g, '/').replace(/~3a/g, ':');
const encode = (s) => s.replace(/~/g, '~7e').replace(/\//g, '~2f').replace(/:/g, '~3a');
let roundTrip = 0; const fails = [];
for (const k of keys) { const d = decode(k); if (encode(d) === k) roundTrip++; else if (fails.length < 5) fails.push(k.slice(0, 120)); }
const nonAlnum = [...charSet].filter((c) => !/[A-Za-z0-9._\/:~-]/.test(c));
console.log(JSON.stringify({ distinctKeys: keys.size, escapes, roundTripEncodeOfDecode: roundTrip, fails, nonAlnumCharsInKeys: nonAlnum, sample: [...keys].slice(0, 2).map((k) => decode(k)) }));
