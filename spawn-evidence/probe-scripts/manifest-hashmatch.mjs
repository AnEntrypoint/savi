import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const buf = readFileSync(process.argv[2]);
const sheetLen = buf.readUInt32BE(0);
const sheet = JSON.parse(buf.subarray(4, 4 + sheetLen).toString('utf8'));
const set = new Set(sheet.hashes);
const sha = (b) => createHash('sha256').update(b).digest('hex');
let pos = 4 + sheetLen, frames = 0, bodyHits = 0, frameHits = 0, sample = null;
while (pos < buf.length) {
  const n = buf.readUInt32BE(pos);
  const body = buf.subarray(pos + 4, pos + 4 + n);
  const whole = buf.subarray(pos, pos + 4 + n);
  if (set.has(sha(body))) bodyHits++;
  if (set.has(sha(whole))) frameHits++;
  if (!sample) sample = { bodySha: sha(body), wholeSha: sha(whole), inSheet: set.has(sha(body)) || set.has(sha(whole)) };
  frames++;
  pos += 4 + n;
}
console.log(JSON.stringify({ sheetHashes: sheet.hashes.length, frames, bodyHits, frameHits, sample, sheetFirst: sheet.hashes[0] }));
