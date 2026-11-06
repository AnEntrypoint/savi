
const keys = (o) => { try { return Object.keys(o).sort(); } catch (e) { return ['ERR ' + e.message]; } };
const out = {};
out.apiKeys = keys(typeof api !== 'undefined' ? api : {});
out.ctxKeys = typeof ctx !== 'undefined' ? keys(ctx) : 'no ctx';
out.ctxWorld = typeof ctx !== 'undefined' && ctx.world ? keys(ctx.world) : 'none';
out.ctxPlace = typeof ctx !== 'undefined' && ctx.place ? keys(ctx.place) : 'none';
out.ctxSelf = typeof ctx !== 'undefined' && ctx.self ? keys(ctx.self) : 'none';
out.ctxSession = typeof ctx !== 'undefined' && ctx.session ? keys(ctx.session) : 'none';
out.players = typeof api !== 'undefined' && api.getPlayers ? api.getPlayers().length : 'n/a';
out.placeId = typeof ctx !== 'undefined' && ctx.place ? (ctx.place.id ?? null) : null;
return out;
