import { readFileSync } from 'node:fs';
const buf = readFileSync(process.argv[2]);
const frames = [];
let pos = 0;
let ok = true;
while (pos < buf.length && frames.length < 100000) {
  const n = buf.readUInt32BE(pos);
  const body = buf.subarray(pos + 4, pos + 4 + n);
  let kind = 'unparsed';
  let keys = null;
  try { const p = JSON.parse(body.toString('utf8')); kind = 'json'; keys = Object.keys(p).slice(0, 6); } catch (e) { kind = 'nonjson:' + body.subarray(0, 12).toString('hex'); ok = false; }
  frames.push({ at: pos, len: n, kind, keys });
  if (n === 0 || pos + 4 + n > buf.length) { ok = false; break; }
  pos += 4 + n;
}
console.log(JSON.stringify({ bytes: buf.length, frames: frames.length, chainEnd: pos, exactEnd: pos === buf.length, allJson: ok, first: frames.slice(0, 4), last: frames.slice(-2) }));
