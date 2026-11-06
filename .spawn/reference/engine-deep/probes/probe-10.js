const pre = '26f64424-cc19-43af-a9c3-666e4559bb05|';
const ids = ctx.query({}).map((x) => x.id);
return { cmEditorLabel: ids.includes(pre + 'cm-editor-label'), x5rails: ids.includes(pre + 'x5-rails'), x0z0Sample: ids.filter((i) => /^(cm-|x5-|x4-)/.test(i.replace(pre, ''))).slice(0, 12).map((i) => i.replace(pre, '')), hookProbe: ids.filter((i) => i.includes('hook')).map((i) => i.replace(pre, '')) };
