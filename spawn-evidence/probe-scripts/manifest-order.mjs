import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const buf = readFileSync(process.argv[2]);
const n0 = buf.readUInt32BE(0);
const sheet = JSON.parse(buf.subarray(4, 4 + n0).toString('utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
let pos = 4 + n0, i = 0, match = 0, first = null;
while (pos < buf.length) { const n = buf.readUInt32BE(pos); const body = buf.subarray(pos + 4, pos + 4 + n); const s = sha(body); if (s === sheet.hashes[i]) match++; else if (first === null) first = i; pos += 4 + n; i++; }
console.log(JSON.stringify({ frames: i, orderedMatch: match, firstMismatchIndex: first, hashes: sheet.hashes.length }));
