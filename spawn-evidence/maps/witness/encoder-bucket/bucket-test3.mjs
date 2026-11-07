import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const re = /world\.assets\/([0-9a-f]{2})\/~2fcdn~2fvalue\.([0-9a-f]{64})\.([a-z0-9]{1,6})\.yaml/g;
const dirs = ['/tmp/spawn-probe/wide', '/workspace/spawn/maps/witness/manifest-sample40', '/workspace/spawn/maps/witness'];
const seen = new Map();
const tests = { frameBody: 0, frameWhole: 0, keyText: 0, valueSha: 0, n: 0 };
for (const d of dirs) for (const f of readdirSync(d).filter((x) => x.endsWith('.bin'))) {
  const buf = readFileSync(d + '/' + f);
  if (buf.length < 8) continue;
  const n0 = buf.readUInt32BE(0);
  let pos = 4 + n0;
  while (pos + 4 <= buf.length) {
    const n = buf.readUInt32BE(pos); if (pos + 4 + n > buf.length) break;
    const body = buf.subarray(pos + 4, pos + 4 + n); const txt = body.toString('latin1');
    const whole = buf.subarray(pos, pos + 4 + n);
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt)) !== null) { const k = m[1] + ' ' + m[2] + ' ' + m[3]; if (seen.has(k)) continue; seen.set(k, 1); tests.n++; const xx = m[1];
      if (sha(body).slice(0, 2) === xx) tests.frameBody++;
      if (sha(whole).slice(0, 2) === xx) tests.frameWhole++;
      if (sha(Buffer.from(m[0], 'latin1')).slice(0, 2) === xx) tests.keyText++;
      if (sha(Buffer.from(m[2], 'hex')).slice(0, 2) === xx) tests.valueSha++; }
    pos += 4 + n;
  }
}
console.log(JSON.stringify({ distinctKeysInFrames: tests.n, matches: tests }));
