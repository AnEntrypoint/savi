# Spawn agentic interface, as seen from @@claude_haiku_55

Full reference, with every Tome section, skill, engine doc, CLI help page and HTTP door: .spawn/reference/README.md (coverage and gaps: .spawn/reference/COVERAGE.md).

Scope: everything an agent account linked to lanmower can reach on Spawn, from this machine, as of 2026-11-04.
Not in this file: the token and the invite code. The token lives only at /config/.spawn/token (mode 600).

## Identity and world

- Agent: @@claude_haiku_55 (userId aa8f37ef-595f-4d48-962f-edb82203013e), linked to lanmower (3ac113cb-17b3-4337-8fb5-225a4a83578e).
- Display name: claude_haiku_55 (equals the handle until changed; PATCH /me {name} changes it).
- World: @lanmower/the-savi-gallery, "The Savi Gallery" (renamed from game-6; confirmed by lanmower). worldId 26f64424-cc19-43af-a9c3-666e4559bb05, appId d21d322b-4572-4710-a8d5-eaef4e6daa1f, engine 6.0.0, role editor.
- Git: https://git.spawn.co/@lanmower/the-savi-gallery.git (the game-6.git path also resolves). Local clone: /workspace/game-6, at b405304 (pulled 2026-11-04).
- Play: https://www.spawn.co/@lanmower/the-savi-gallery (published). Editing copy: https://www.spawn.co/@lanmower/the-savi-gallery@dev (latest push to main, no sign-in).
- Budget: paid by @lanmower. Bodies dial 60, daily cap 1000 bodies. Lanes: generation open, compute open, savi closed (Savi talks with people; agent pushes reach her only as rows the creator sees).

## Credentials

- Token: /config/.spawn/token (SPAWN_TOKEN_FILE unset, so the client and git read this path). Used as Bearer on every door and as the git password.
- Git host: the global git config has a credential helper for https://git.spawn.co that reads the token file, so plain git clone/push works with no prompt.
- Never print, commit or log the token.

## Client CLI (/config/.bun/bin/spawn, package @spawnco/client 0.2.0)

Not on PATH. Run it with its full path, or add /config/.bun/bin to PATH.

- spawn login --invite <sbk_…> [--username <name>] | --reconnect <sbk_…>: sign up, relink, or mint a new token.
- spawn client join <@user/world> [--as <name>] [--body <url|/cdn/ref>] [--outfit-json] [--ttl s] [--render cpu|gpu|none] [--width] [--height] [--room <name>] [--tester <n> [--latency ms]]: stand a body in a world.
- spawn client where | players | logs [--level] [--object] [--limit] | crossing | prefetch --world --manifest --hex | status | leave [--tester n].
- spawn client exec <file> | -e "<source>" [--realm game|browser] [--input json] [--out file] [--module] [--place id] [--persist | --read-only]: run async JS in the live room (game realm) or the body's page (browser realm).
- spawn client say "<words>" [--scope] [--reply line] and spawn client hear [--scope] [--wait s]: room and world chat.
- spawn client install-browser: one-time optional browser runtime.
- spawn events [--kind a,b] [--world] [--from] [--since] [--exec cmd] [--once]: live inbox as JSON lines.
- spawn api [<Type> [<kind>]]: a spec type's shape at the clone's engine version.
- spawn numbers [--world]: numbers on each game you make or build in.
- spawn mod <install|update|list|status>: world mods.
- spawn preview [dir] [--room] [--render none|cpu|gpu] [--base commit] [--ttl s]: run the working tree in a private room, no push, saves land there live.
- spawn bring <folder>: in a clone, lay a game made with another engine into it as data.

## HTTP doors (base https://www.spawn.co)

Auth: Authorization: Bearer $(cat /config/.spawn/token).

- /api/agent/v1/me (GET; PATCH {name} or {face}): identity, linked person, worlds with clone lines, doors.
- /api/agent/v1/token (POST, signup), /token/revoke, /signup, /link-request, /login-link (POST {next}: one-use browser URL, 5 min).
- /api/agent/v1/worlds, /games (POST: create a world, or git push -o create), /access, /pfp/{seed}, /api.
- /api/agent/v1/chat/room (POST {world, room, ref, text, replyTo}), /chat/inbox, /chat/dm (POST).
- /api/sdk/v1/{worldId}/agent/docs (GET; ?section=<heading> or ?section=all): the Tome API reference, read by section.
- /api/sdk/v1/{worldId}/agent/rooms (live rooms and player counts), /logs (script log), /exec (POST {script, place?}: read-only JS in a live room; 409 no_live_room if empty), /health, /db, /report, /skills/{skillId}.
- /api/sdk/v1/{worldId}/assets/{name} (PUT: asset bytes, up to ~4.5 MB; larger via /assets/upload-target then PUT with {tempPath}). Asset names are value.<sha256>.<ext>.
- /api/games/{appId}/publish (POST): publish the current main to the public page.
- /api/games/{appId}/crew/ask (POST): knock to be added to another person's world (approved from their bell).
- /api/games/{appId}/comments, /folio (launch kit), /folio/zip, DELETE /api/games/{appId}.
- /api/resolve-adventure?address=@lanmower/<world> (GET): resolve a world's appId.
- /api/notifications (GET ?unread=1), /notifications/read, /notifications/{id}/decide, /notifications/stream?kind=chat_mention (SSE).
- /api/invites, /api/invites/{id}/accept; /api/social/{me,relation,who,met,personas,places,hidden,report}.
- /api/player/heartbeat, /api/session/grant/agent (play grant), /api/character/* (generate, picture, convert, jobs/{id}, equip, equip-model, reset).
- /api/feed (GET), /llms.txt at the site root.

## Git workflow

- Clone: git clone https://git.spawn.co/@lanmower/game-6.git (the global helper supplies the token).
- Push to main: reaches @dev and every room open on main with no build, in seconds to a minute for big changes. Push output carries remote: lines with room, player, op and verdict results; faults name the file and the line.
- Commit messages: the first line goes to the creator's chat and changes list under your name. Make it one plain sentence about what changed for the player or the rule set, never a file, function or diagnosis. The body carries the how.
- A push is refused when it is behind origin (fetch first). Savi, exec --persist and other clones also commit to main; fetch, rebase, push.
- git log --notes=spawn carries the world's reading of each commit.
- Publishing is separate: a push never publishes. Publish = POST /api/games/{appId}/publish.

## The world's files (from AGENTS.md)

- world.config.yaml: name, description, camera, lighting, defaultPlace, engine.behaviors, networking mode, ui theme, inputs (actions and axes), player template, ui.render, nametag. Currently name and description are empty.
- places/<place>/config.yaml and places/<place>/cells/x<cx>z<cz>.scene: placements in 128 m cells (cx = round(x/128), cz = round(z/128)). Object ids and fields are documented in the Tome reference.
- templates/<name>.js: shared object definitions, used by rows as template: "templates/<name>.js#<export>" with overrides.
- scripts/**/*.js: behavior modules with onSpawn(ctx), update(ctx, dt), onCollide(ctx, other, contact), onArrive, and more. scripts/ui.js is the HUD (HTML). scripts/lib/data/*.yml is importable.
- sim.js: the world's own program, one copy per room.
- skills/<name>.md (skills for Savi) and commands/<name>.md (slash commands): tree files.
- design.md: the game's one page, with a dated line per decision. Absent in this world.
- source/**: a game made elsewhere, left as its own files.
- AGENTS.md, CLAUDE.md, README.md, .spawn/: for agents. The room never receives these exact paths. .spawn/engine/ is gitignored (the engine corpus, cloned with the pinned version).

## Engine API (Tome reference, read by section)

The docs door lists these sections; each one is readable with ?section=<heading>:

Spawn game API, Identity, State, Properties, Movement, Terrain, Splines, Camera, Selection, Player, Timing, Jobs, Database, Clock, The Changed Cursor (Sim.Js), Random, Logging, Events, Spec Patches & Scripts, World Queries, Places, Object Access, Lifecycle, Spec Mutation (God Mode), Control, Trade, Joints, Ragdoll, Hierarchy, DM Hooks, Juice, Animation Mixer, Self, The Local Player (On A Camera Rig Alone), The Spine, State (compat), Properties (compat), Behavior Hooks, ObjectPropertiesSpec (full), PrimitiveSpec (full), AtmosphereDef (full), TerrainDef heightmap (full), Inputs (full), ObjectSpec (full), Parenting (full), UI rules (full), Named types (full), builtin/physics, builtin/tween, builtin/spline, builtin/math, builtin/vec3, builtin/easing, builtin/nav, builtin/path, builtin/ballistics, builtin/room-routing, builtin/terrain, builtin/noise, builtin/voxels, builtin/vibe, builtin/fx, builtin/tsl, builtin/three, builtin/lighting, builtin/water, builtin/env, builtin/postfx.

Key API (ctx): ctx.world, ctx.place, ctx.self, ctx.session scopes; ctx.spawn(spec) / ctx.spawn(id, spec); ctx.destroy(id); ctx.getObject(id); ctx.query(sel); ctx.attach(a, b); ctx.cross(entity, link); ctx.emit(topic, payload) and ctx.on; ctx.now() (the only clock, ms); ctx.after(seconds, export, payload); ctx.random(); ctx.commit(message, fn) saves authored changes. Durable per-player: player.state.*. Shared in room: ctx.world.state.*. Room-life scratch: ctx.session.*.

Skills (the docs door's skills list, 23): spawn-engine, 2d-mode, buyables, cameras, fx, game-ui, geometry, heightmap-terrain, interactive-objects, jev (give a mind to a boss, npc, crowd or puzzle: jev:decide), leaf-sprays, mobile-controls, physics, platform-systems (saves, SQL boards, timers, LLM jobs, notify, player names), player-settings, pointer-raycasting, portals, projectiles, rooms-and-matchmaking, trees, uploaded-models, vehicles, voxel-terrain.

## Testing in a live page

- Page: https://www.spawn.co/@lanmower/the-savi-gallery@dev. The world is ready when html.spawn-world-shown exists; data-spawn-stood marks the hold release.
- Console shows the game's console.log and faults with script path, line and column.
- A body's own page: spawn client join with --render cpu or gpu prints the address. Drive it with Playwright: chromium.connectOverCDP(url), then page keyboard, mouse, screenshot. On a workshop box it is http://127.0.0.1:9222.
- HUD lives in nested frames: page.frameLocator('iframe[data-spawn-kernel-frame]').frameLocator('iframe[data-tome-realm="game"]').
- Software GPU flags for headless Chromium: --enable-unsafe-webgpu --enable-features=Vulkan,WebGPU --use-angle=vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader --enable-unsafe-swiftshader.
- The rail (right-middle block) belongs to the platform. Game UI must keep out of it.

## Chat

- Read: GET /api/agent/v1/chat/inbox, or the chat_mention events from spawn events --kind chat_mention or the notifications stream. Each event's actionData is the read door.
- Answer in a room: POST /api/agent/v1/chat/room {world, room, ref, text, replyTo: seq}. Direct: POST /api/agent/v1/chat/dm.
- Savi is not reachable from an agent; agent pushes reach her only as rows the creator sees.

## Not checked yet

- Write doors (POST, PUT, PATCH, DELETE): documented from source text only. None were sent.
- Launch kit (folio), the SSE notifications stream, pfp, and the social who/met/places/hidden doors: not exercised.
- The world name is settled: "The Savi Gallery" (@lanmower/the-savi-gallery).
- The engine pin sha256 changed in engine commit 804afb7. Not checked against a build.
- The API types are all fetched into .spawn/reference/cli/types/. The full Tome is in .spawn/reference/tome/.
- Current AGENTS.md copy: .spawn/reference/guide/AGENTS-current.md. Lessons: .spawn/reference/LESSONS.md.
