
const names = ['spawn','destroy','sleep','commit','query','getObject','cross','emit','on','now','after','sql','state','notifyDm','notifyDmOnce','attach','changed','cancel','awaitJob','job','random','view','warn','log','error','quality','files','getTerrainHeight','enterPlace','device'];
const out = {};
for (const n of names) {
  const f = ctx[n];
  out[n] = typeof f === 'function'
    ? { arity: f.length, src: Function.prototype.toString.call(f).slice(0, 400) }
    : { type: typeof f, keys: f && typeof f === 'object' ? Object.keys(f).slice(0, 30) : null };
}
return out;
