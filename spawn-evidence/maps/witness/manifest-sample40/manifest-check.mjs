import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const buf = readFileSync(process.argv[2]);
const n0 = buf.readUInt32BE(0);
const sheet = JSON.parse(buf.subarray(4, 4 + n0).toString('utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
let pos = 4 + n0, i = 0, ordered = 0, inSet = 0, bad = null;
const set = new Set(sheet.hashes);
while (pos < buf.length) { const n = buf.readUInt32BE(pos); if (pos + 4 + n > buf.length) { bad = 'overrun@' + pos; break; } const body = buf.subarray(pos + 4, pos + 4 + n); const s = sha(body); if (s === sheet.hashes[i]) ordered++; if (set.has(s)) inSet++; pos += 4 + n; i++; }
console.log(JSON.stringify({ bytes: buf.length, hashes: sheet.hashes.length, frames: i, chainEndsAtEOF: pos === buf.length && bad === null, ordered, inSet }));
