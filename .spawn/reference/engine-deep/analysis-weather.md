CHUNK=weather (read by hand, not by a chunk agent)

/workspace/game-6/scripts/ex/weather.js (33 lines)
- Calls: ears.press(ctx); ctx.self.state; ctx.place.objects[ROW]; ctx.destroy(ROW); ctx.spawn(ROW, {tags, feetPosition, audience:"all", fx:{script}, audio}); ctx.place.atmosphere (written field by field); ctx.self.worldFeetPosition; ctx.emit("playSound", {clip, position, volume}); ctx.emit("screenFlash", {color, duration, intensity}).
- Does: E cycles clear -> rain -> snow. Each mode respawns one fx row (follow=player) and rewrites the place's clouds, fog, wind and wet values.
- Issues:
  1. Rain audio clip is "cdn/sfx-heavy-rain-..." (no leading slash). Clear and snow use "/cdn/...". The notes do not pin the CDN prefix (gap), so this may or may not resolve.
  2. "screenFlash" is not in the ActPayloads notes (unverified).
  3. ctx.place.atmosphere is written per key; the notes do not say whether this is a live change to every client (unverified).
  4. The fx DSL block is verbatim engine grammar; the fx-grammar file is not in the clone, so its tokens (pop, follow, col, sprite, curl, grav) are unverified.
- JSON: {"files": 1, "calls": 9, "issues": 4, "gaps": ["fx grammar not in clone", "screenFlash payload unverified", "atmosphere write propagation unverified"]}
