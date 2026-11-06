
return {
  view: { fps: ctx.view.fps, drawCalls: ctx.view.drawCalls, triangles: ctx.view.triangles, cpuMs: ctx.view.cpuMs, memoryMB: ctx.view.memoryMB, site: ctx.view.site },
  quality: ctx.quality,
  device: ctx.device,
  networking: ctx.world.engine && ctx.world.engine.networking,
  players: ctx.query({ tags: ['player'] }).map((p) => ({ id: p.id, name: p.name, feet: p.feetPosition })),
  now: ctx.now(),
};