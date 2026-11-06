
const out = {};
const ids = [];
const a = ctx.spawn({ feetPosition: { x: 4, y: 3, z: 4 }, primitive: { kind: 'box', width: 0.3, height: 0.3, depth: 0.3 }, lifetime: 30 });
out.spawnId = a;
out.spawnedVisible = !!ctx.getObject(a);
out.spawnedKeys = Object.keys(ctx.getObject(a) || {}).slice(0, 40);
out.spawnedMethods = ['destroy','sleep'].map((n) => typeof ctx[n]);
await ctx.sleep(0.5);
out.afterSleepVisible = !!ctx.getObject(a);
ctx.destroy(a);
out.afterDestroyVisible = !!ctx.getObject(a);
const b = ctx.spawn({ feetPosition: { x: 5, y: 3, z: 5 }, primitive: { kind: 'sphere', radius: 0.2 }, lifetime: 30 });
ctx.destroy([b]);
out.arrayDestroyVisible = !!ctx.getObject(b);
return out;