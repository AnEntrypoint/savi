
const out = {};
const id = ctx.spawn({ feetPosition: { x: 2, y: 2, z: 2 }, primitive: { kind: 'box', size: { x: 0.5, y: 0.5, z: 0.5 } }, lifetime: 60 });
out.spawnReturn = id;
out.foundAfterSpawn = !!ctx.getObject(id);
ctx.destroy(id);
out.foundAfterDestroy = !!ctx.getObject(id);
out.destroyArity = ctx.destroy.length;
return out;
