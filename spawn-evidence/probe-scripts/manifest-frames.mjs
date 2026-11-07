import { readFileSync } from 'node:fs';
const buf = readFileSync(process.argv[2]);
const text = buf.toString('latin1');
const start = text.indexOf('{"v":1');
let depth = 0, end = -1;
for (let i = start; i < text.length; i++) { const c = text[i]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } } }
const json = text.slice(start, end);
const parsed = JSON.parse(json);
const tail = buf.subarray(Buffer.byteLength(text.slice(0, end), 'latin1'));
console.log(JSON.stringify({ bytes: buf.length, jsonStart: start, jsonEnd: end, keys: Object.keys(parsed), hashes: parsed.hashes.length, tailBytes: tail.length, tailHead: tail.subarray(0, 48).toString('hex'), tailText: tail.subarray(0, 120).toString('latin1').replace(/[^\x20-\x7e]/g, '.') }));
