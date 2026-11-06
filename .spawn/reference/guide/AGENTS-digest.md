# AGENTS.md digest (@lanmower/game-6)

Source: /workspace/game-6/AGENTS.md (119 lines, read in full). Served guide: served-guide.md (raw JSON), served-guide.guide.txt (extracted guide text). Line numbers below are local AGENTS.md lines.

## Identity and world

- L1: World is `@lanmower/game-6`, "a live multiplayer world on Spawn".
- L3: The tree IS the world; a push to main reaches every room open on main with no build and no deploy.
- L3: Open pages take a push with no reload; most pushes reach rooms in seconds, a large change or busy world can take a minute or more.
- L3: People may be standing in the world while you edit.
- L4: Play URL `https://www.spawn.co/@lanmower/game-6`.
- L6: Game is three.js in files; an object is a row with three.js geometry and material fields.
- L6: A behavior is a module with `update(ctx, dt)`; the HUD is HTML in `scripts/ui.js`.
- L6: `git push` to main lands the change; push `remote:` lines carry verdicts; a fault names file and line.
- L6: `https://www.spawn.co/@lanmower/game-6@dev` shows the latest push in any browser, no sign-in; its console prints `console.log` and faults.
- L6: A push never publishes.
- L6: To publish, POST `https://www.spawn.co/api/games/{appId}/publish` with the token and the appId given by the owner; the public page shows that version until the next publish.

## The tree

- L10: `world.config.yaml` is the root: engine, inputs, player and camera templates, default place.
- L11: `places/<place>/config.yaml` holds one place's atmosphere, terrain, physics, spawn.
- L12: `places/<place>/cells/x<cx>z<cz>.scene` holds placements by 128 m cell over the object's feet.
- L13: `cx = Math.round(x / 128)`, `cz = Math.round(z / 128)`; round half up, never floor.
- L13-14: Cell x0z0 holds −64 ≤ x < 64 (z alike); the text then says "64 files under `x1z0`, −64 under `x0z0`" (elliptical, see gaps).
- L15: Line 1 of a cell file is the header `# spawn-scene v2 yaml <cellKey>`.
- L15: One block per placement; the object is written as spawned, fields at the row's indent.
- L16: `objects.scene` holds placements with no plain world xz.
- L17: `templates/<name>.js` exports an object def; a row uses `template: "templates/<name>.js#<export>"` plus `overrides:`.
- L18: `scripts/**/*.js` are behavior modules: `onSpawn(ctx)`, `update(ctx, dt)`, `onCollide(ctx, other, contact)`, `onArrive` and others.
- L18: `scripts/lib/data/*.yml` is importable.
- L18: `sim.js` runs the world's own program, one copy per room.
- L19: `skills/<name>.md` is a skill for Savi; `commands/<name>.md` is a slash command; both are tree files like any other.
- L20: `design.md` is the game's one page: what it is, how a player wins and loses, the loop, and a dated line per creator decision; a decision stands until the creator changes it.
- L21: `source/**` holds a game made elsewhere, left as its own files; "Bring a game you already made" in `https://www.spawn.co/llms.txt` explains intake.
- L22: Art is a CDN name, never bytes in the tree, e.g. `model: "/cdn/model-knight.glb"`, `texture: "/cdn/moodboard-pixel/sprite-fox.png"`, `clip: "/cdn/sfx-bell.mp3"`.
- L23: A CDN name not yet cooked is generated on first fetch and is immutable after.
- L23-24: Own art (including `.mp4`) uploads by bytes: PUT `https://www.spawn.co/api/sdk/v1/<worldId>/assets/value.<sha256>.<ext>` with Bearer, Content-Type set, file as body; returns `{ url }`.
- L24: Reference uploaded art as `/cdn/value.<sha256>.<ext>`.
- L24: `.wav`, `.ogg`, `.flac` upload as-is and are named `value.<sha256>.mp3`.
- L24-25: Body cap about 4.5 MB (headers counted); over it the door answers 413.
- L25: Large upload by address: POST `.../assets/upload-target` with `{ name, sizeBytes }` for a storage PUT url; PUT bytes there; then PUT `.../assets/<name>` with `{ tempPath }`.
- L25: A push carrying asset bytes (by extension, anywhere in the tree) is refused typed `law.git.asset-kind`, like JS that does not parse.
- L26: `AGENTS.md`, `CLAUDE.md`, `README.md`, `.spawn/` are for the agent; the room never receives these exact paths.
- L26: Record what is learned about this world in AGENTS.md, not in agent memory.

## One placement, whole

- L30: Example file `places/main/cells/x0z0.scene`; one cube at (4, 0, 6), round(4/128) = round(6/128) = 0.
- L31: An object's fields (primitive, material, physics, feetPosition, ...) sit flat beside its frame (id, tags, state, behavior, parent, children).
- L33-41: Example row format: header `# spawn-scene v2 yaml x0z0`, key `"cube-1"`, fields `feetPosition`, `material`, `physics`, `primitive`, `tags`.
- L43: `physics` omitted = walk-through.
- L43: `"physics": "static"` = solid and still.
- L43: `{ body: "dynamic", mass: 2 }` = falls and pushes.
- L43: Pushing the file makes the cube stand in every open room.
- L43: `primitive` takes three.js geometry names and constructor params, e.g. `{ kind: "box", width, height, depth }`, `{ kind: "cylinder", radiusTop, radiusBottom, height }`; also sphere, cone, ring, circle, torus, polyhedra.
- L43: Capsule length is `halfHeight`.
- L43: tube, lathe, extrude and Spawn shapes (wedge, arch, wall, ...) are in the reference's primitive section.
- L43: `material` takes MeshStandardMaterial fields: color, roughness, metalness, emissive, emissiveIntensity, opacity, transparent, the maps.
- L44: For several identical objects, write the def once in `templates/cube.js`; rows use `"template": "templates/cube.js#cube"` with differences under `"overrides":`.
- L47: Example export `export const cube = {...}` in `templates/cube.js`.

## API

- L52: `ctx` is the first argument of every hook (`onSpawn(ctx)`, `update(ctx, dt)`, `onCollide(ctx, other, contact)`); there are no ambient globals.
- L53: `ctx` scopes: `ctx.world`, `ctx.place`, `ctx.self`, `ctx.session`.
- L53: Reads compose like a prototype chain; writes land in the handle's own layer; `delete` clears.
- L54: Verb `ctx.spawn(spec)` and `ctx.spawn(id, spec)`.
- L54: Verb `ctx.destroy(id)`.
- L54: Verbs `ctx.getObject(id)` and `ctx.query(sel)`.
- L55: A dot assignment is the write, e.g. `ctx.self.state.hp = 3`.
- L55: Verb `ctx.attach(a, b)`.
- L56: Verb `ctx.cross(entity, link)`.
- L56: Verb `ctx.emit(topic, payload)`, with `ctx.on` as the listener.
- L56: `ctx.now()` is the only clock.
- L57: `ctx.after(seconds, "export", payload)` is the one-shot timer.
- L57-58: Durable per-player data: `player.state.*`.
- L58: Shared data: `ctx.world.state.*`.
- L58: Room-life-only data: `ctx.session.*`.
- L58-60: Public API reference and engine-use guide live in the engine repo pinned by `.spawn/engine.yaml`.
- L60: Engine clone command: `git clone --depth 1 ... https://git.spawn.co/engine/6.0.0.git .spawn/engine` (gitignored; token via `SPAWN_TOKEN` or `SPAWN_TOKEN_FILE`/`~/.spawn/token`).

## The page

- L64: The `@dev` page is the world at the latest push to main; each page is a player in a room.
- L65: `<html>` gets class `spawn-world-shown` once the world is drawn.
- L65: `<html>` gets attribute `data-spawn-stood` once it releases its own hold (world standing, boot fault, or a press on the page).
- L65: Wait with `page.waitForSelector('html.spawn-world-shown')`, not a timer.
- L66: `console.log` and every script fault (path, line, column) print in the page console.
- L67: A screenshot is the frame a player sees, including HUD and rail.
- L68: The page draws with WebGPU.
- L68: Headless Chromium with no GPU needs `--enable-unsafe-webgpu --enable-features=Vulkan,WebGPU --use-angle=vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader --enable-unsafe-swiftshader`; it is slow and low-res.
- L69: Game frame is `iframe[data-spawn-kernel-frame]` (another origin).
- L69: HUD (`scripts/ui.js`) is in the sandboxed inner frame `iframe[data-tome-realm="game"]`.
- L70: Neither frame has a fixed `name`; the page's first iframe is not the HUD; HUD text is only in the inner frame.
- L70: Playwright HUD locator: `page.frameLocator('iframe[data-spawn-kernel-frame]').frameLocator('iframe[data-tome-realm="game"]')`.
- L70: Press a HUD button: `hud.getByRole('button', { name: 'Play again' }).click()`.
- L70: `page.mouse.click` at a HUD button's bounding box lands as a person's click.
- L70: Key presses reach game actions only after a click in the page has given the game focus.
- L71: Headed 3D place holds the mouse for camera look (pointer lock on by default in 3D; off with camera `pointerLock: false`; off by default in 2D).
- L71: While locked, cursor is hidden and clicks go to the world, not the HUD.
- L71: Escape from a person's keyboard frees the lock; an automation key does not.
- L71: A `data-modal` element in the HUD frees the mouse while it stands; the lock returns when it goes.
- L71: Headless browsers never hold the mouse.
- L72: A program-driven browser says so via `navigator.webdriver`; Spawn counts it apart from a person's page.
- L72: A browser that cannot say so ends its user agent with ` SpawnProbe/<name>`.

## Who writes here

- L76: Savi, `exec --persist` and other clones commit to main; git refuses a push behind their commit (`fetch first`).
- L77: Spawn commits this guide to main; a push behind it lands under Spawn's merge commit; `git pull` fast-forwards.
- L77: The server never force-pushes.
- L78: The first line of each commit message lands in the creator's chat and changes list under the agent's name; Savi reads it, never the body or `design.md`.
- L78: First line is one plain sentence about what changed for the player or a creator rule; never a file, function or diagnosis.
- L78: The how goes in the commit body.
- L79: `git log --notes=spawn` carries the world's reading of each commit (fetched by the clone line).
- L80: A push prints `remote:` lines naming rooms, players, ops and verdicts.
- L80: The `verdicts →` page is read with `printf 'user = "<you>:%s"\n' ... | curl -K - <url>`.
- L81: Agents never wake Savi; there is no door into her chat.

## The packaged client

- L86: `@spawnco/client` installs with `bun add -g @spawnco/client`.
- L87: `spawn client join @lanmower/game-6 --ttl 600` stands a body in a room as the agent's name.
- L87: `spawn client leave` leaves the room.
- L87: `spawn client exec <file>` or `spawn client exec -e '<code>'` runs an async JS body in the room's real engine with `api`, `ctx` and world imports.
- L88: Exec changes stay in that room unless `--persist` saves them into the world's files.
- L89: `--realm browser` runs in the body's page; join with `--render cpu` or `--render gpu`.
- L90: `client.capture({ method: "preview_object", params: { object, children } })` draws one object's draft from its fields.
- L91: `spawn client --help` and `spawn client exec --help` list every verb and flag.
- L92: `spawn preview`, run inside the clone, stands a body in a private room at main's version, carries working-tree diffs vs `origin/main`, prints the room's page, lands every save; no push; Ctrl-C ends it; rooms and history never see preview files.

## The doors (token and clone)

- L96: Token is the password on the git remote and the Bearer on every door.
- L96-97: Token source is `$SPAWN_TOKEN`, else the file `spawn login` writes (`~/.spawn/token`).
- L97: Never commit the token; never print it.
- L97: Git with no helper asks the person at the screen for a login.
- L98-99: Clone command with credential helper, `http.proactiveAuth=basic`, notes refspec `+refs/notes/*:refs/notes/*`, from `https://git.spawn.co/@lanmower/game-6.git`.
- L100: Existing clone: `git config credential.helper ''` drops a stored login.
- L100: Existing clone: `git config --add credential.helper '!f() { ... }; f'`.
- L101: Existing clone: `git config http.proactiveAuth basic`.
- L101: Existing clone: `git config --add remote.origin.fetch '+refs/notes/*:refs/notes/*'`, then `git fetch`.
- L101: `<worldId>` in the commands below is the id that `me` and `worlds` answer for this world.
- L103: `GET https://www.spawn.co/api/agent/v1/me` returns identity, worlds with git and play URLs.
- L104: `GET https://www.spawn.co/api/sdk/v1/<worldId>/agent/rooms` returns live rooms and player counts.
- L105: `GET https://www.spawn.co/api/sdk/v1/<worldId>/agent/logs` returns the room script log (errors name paths).
- L106: `POST https://www.spawn.co/api/sdk/v1/<worldId>/agent/exec` with `{"script": ...}` runs read-only JS in the live room.
- L106: Exec returns 409 `no_live_room` when nobody is in the room; optional `"place":"<name>"` selects a place.
- L107: `GET https://www.spawn.co/api/sdk/v1/<worldId>/agent/docs` is the docs door; `?section=<heading>` returns one section (tomeApi); no section returns opening and headings.
- L107: Pushes in the wrong shape are refused naming the row, line and field.
- L107: The whole reference is `api-reference.md` at the engine repo root.
- L108: `POST https://www.spawn.co/api/agent/v1/login-link` with `{"next":"/@lanmower/game-6@dev"}` returns `url`; the url works once within 5 minutes.
- L109: `GET https://www.spawn.co/api/notifications?unread=1` returns the inbox (notes, plays, invites, link verdicts).
- L110: Make a world: `git push -o create` to `https://git.spawn.co/@@<you>/<free-slug>.git`, or `POST https://www.spawn.co/api/agent/v1/games`.
- L111: Human invite page: `https://www.spawn.co/@lanmower/game-6/code`.

## The rail

- L115-116: The right-middle block of the game screen (one reservation, vertically centered on the right edge) belongs to the platform: home, creator, like, comments in play; Savi's face while creating.
- L116: Its size is the engine's, published to `ui.js` as CSS variables (the game-ui skill names them).
- L117-118: Game UI written as raw HTML keeps out of the rail; the engine forwards the same keep-out rects.

## Local vs served guide

Served guide fetched with GET from `https://www.spawn.co/api/sdk/v1/26f64424-cc19-43af-a9c3-666e4559bb05/agent/docs?section=guide` (HTTP 200, 17321 bytes). The served body is a JSON envelope; its `guide` field is the markdown compared here.

Diff: the only differences are the world slug. The served guide names `@lanmower/the-savi-gallery` (appId `d21d322b-4572-4710-a8d5-eaef4e6daa1f`, playUrl `https://www.spawn.co/@lanmower/the-savi-gallery`, gitUrl `https://git.spawn.co/@lanmower/the-savi-gallery.git`) where local AGENTS.md names `@lanmower/game-6`. Changed lines, local numbering:

- L1: title slug.
- L4: play URL.
- L6: `@dev` URL.
- L64: `@dev` page URL.
- L87: `spawn client join` slug.
- L99: clone URL.
- L108: login-link `next` path.
- L111: human invite URL.

All other lines match. The served JSON also carries `tomeApi: null` and a `sections` list (Spawn game API, ObjectSpec, PrimitiveSpec, Inputs, builtin/* and others); only `section=guide` was fetched, so those sections are not in this digest.

## Gaps

- The docs door keyed by worldId `26f64424-cc19-43af-a9c3-666e4559bb05` returned the guide for `@lanmower/the-savi-gallery`, not `game-6`. Either the worldId maps to the-savi-gallery on the server or the served guide is wrong for this world.
- AGENTS.md records no appId for game-6; the publish step (L6) needs the appId from the owner. The appId in the served guide belongs to the-savi-gallery and was not used.
- The served guide's Tome API sections (tomeApi is null here) were not fetched.
- L13-14 elliptical sentence "64 files under x1z0, −64 under x0z0" is ambiguous as written.
- The engine repo at `.spawn/engine` (gitignored) was not inspected; `api-reference.md` was not read.
