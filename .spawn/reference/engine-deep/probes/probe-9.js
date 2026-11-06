const o = ctx.getObject('26f64424-cc19-43af-a9c3-666e4559bb05|x-hook-probe');
const byTag = ctx.query({ tags: ['probe'] }).map((x) => x.id);
return { found: !!o, byTag, state: o ? o.state : null, total: ctx.query({}).length };
