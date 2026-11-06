# @lanmower/the-savi-gallery — a live multiplayer world on Spawn

This tree IS the world. A push to main reaches every room open on main with no build and no deploy, and every open page takes it with no reload. Most pushes reach the rooms in seconds; a large change or a large or busy world can take a minute or more. People may be standing in it while you edit. Play it:
https://www.spawn.co/@lanmower/the-savi-gallery

The game is three.js in files: an object is a row with three.js's geometry and material fields, a behavior is a module with `update(ctx, dt)`, the HUD is HTML in `scripts/ui.js`. `git push` to main lands it, and the push's `remote:` lines carry the verdicts; a fault names the file and the line. `https://www.spawn.co/@lanmower/the-savi-gallery@dev` is that push in any browser, with no sign-in, and its console prints the game's `console.log` and faults. A push never publishes. To publish, POST https://www.spawn.co/api/games/{appId}/publish with your token and the appId from me; the public page then shows that version until the next publish.

## The tree

- `world.config.yaml` — the root: engine, inputs, the player and camera templates, the default place.
- `places/<place>/config.yaml` — one place's atmosphere, terrain, physics, spawn.
- `places/<place>/cells/x<cx>z<cz>.scene` — placements, by 128 m cell over the object's feet:
  `cx = Math.round(x / 128)`, `cz = Math.round(z / 128)` — round, never floor, half up: `x0z0` holds
  −64 ≤ x < 64 (z alike); 64 files under `x1z0`, −64 under `x0z0`. Line 1
  is the header `# spawn-scene v2 yaml <cellKey>`; then one block per placement — the object as it was
  spawned, its fields at the row's indent. `objects.scene` holds placements with no plain world xz.
- `templates/<name>.js` — a module you write when several things share one definition. Export the object def; a row uses `template: "templates/<name>.js#<export>"` + `overrides:`.
- `scripts/**/*.js` — behavior modules (`export function onSpawn(ctx)`, `update(ctx, dt)`, `onCollide(ctx, other, contact)`, `onArrive` …). `scripts/lib/data/*.yml` is importable. `sim.js` runs the world's own program, one copy per room.
- `skills/<name>.md` — a skill for Savi; `commands/<name>.md` — a slash command. Tree files like any other.
- `design.md` — the game's one page: what it is, how a player wins and loses, the loop, and a dated line per decision the creator made with Savi or you. A decision stands until the creator changes it.
- `source/**` — a game a person made somewhere else, as its own files, left as they are. "Bring a game you already made" in https://www.spawn.co/llms.txt says how it comes in and what is built from it.
- Art is a CDN NAME, never bytes in this tree: `model: "/cdn/model-knight.glb"`, `texture: "/cdn/moodboard-pixel/sprite-fox.png"`,
  `clip: "/cdn/sfx-bell.mp3"` — a name the CDN has not cooked is generated on first fetch and is immutable after. Your own art, a `.mp4` video too, goes
  up by its bytes: `PUT https://www.spawn.co/api/sdk/v1/<worldId>/assets/value.<sha256 of the file>.<ext>` + Bearer, Content-Type its type, the file as the
  body → `{ url }`; the tree references it as `/cdn/value.<sha256>.<ext>` (a `.wav`, `.ogg` or `.flac` goes up as it is and is named `value.<sha256>.mp3`). That PUT carries a body only up to the API's request cap (about 4.5 MB, headers counted); over it the door answers 413 and the bytes go by address: `POST https://www.spawn.co/api/sdk/v1/<worldId>/assets/upload-target` with `{ name, sizeBytes }` for a storage PUT url, PUT the bytes there, then `PUT https://www.spawn.co/api/sdk/v1/<worldId>/assets/<name>` with `{ tempPath }`. A push carrying asset bytes, by its extension, wherever it sits, is refused typed (law.git.asset-kind), like JS that does not parse.
- `AGENTS.md`, `CLAUDE.md`, `README.md`, `.spawn/` — for you. The room never receives these exact paths. Write what you learn about THIS world into AGENTS.md, not into your own memory.

## One placement, whole

`places/main/cells/x0z0.scene` — the row IS the object: one cube standing at (4, 0, 6): round(4/128) = round(6/128) = 0. An
object's fields (primitive, material, physics, feetPosition, …) sit flat beside its frame (id, tags, state, behavior, parent, children).

```yaml
# spawn-scene v2 yaml x0z0
"cube-1":
  "feetPosition": { "x": 4, "y": 0, "z": 6 }
  "material": { "color": "oklch(0.72 0.19 30)" }
  "physics": "static"
  "primitive": { "kind": "box", "width": 2, "height": 2, "depth": 2 }
  "tags": ["cube"]
```

`physics` omitted = walk-through; `"static"` = solid and still; `{ body: "dynamic", mass: 2 }` = falls and pushes. Push the file and the cube stands in every open room. `primitive` takes three.js's geometry names and constructor parameters (`{ kind: "box", width, height, depth }`, `{ kind: "cylinder", radiusTop, radiusBottom, height }`, sphere, cone, ring, circle, torus, the polyhedra); capsule's length is `halfHeight`; tube, lathe and extrude, and Spawn's own shapes (wedge, arch, wall, …), are in the reference's primitive section. `material` takes MeshStandardMaterial's (color, roughness, metalness, emissive, emissiveIntensity, opacity, transparent, the maps).
For several cubes, write the definition once in `templates/cube.js`. Each row uses `"template": "templates/cube.js#cube"`, with differences under `"overrides":`.

```js
export const cube = { primitive: { kind: "box", width: 2, height: 2, depth: 2 }, material: { color: "oklch(0.72 0.19 30)" }, physics: "static", tags: ["cube"] };
```

## The API, in one screen

`ctx` is the first argument of every hook — `onSpawn(ctx)`, `update(ctx, dt)`, `onCollide(ctx, other, contact)` — and there
are no ambient globals. `ctx` carries the scopes (`ctx.world`, `ctx.place`, `ctx.self`, `ctx.session`) — reads compose like a
prototype chain, writes land in the handle's own layer, `delete` clears — and the eight verbs: `ctx.spawn(spec)` / `ctx.spawn(id, spec)`,
`ctx.destroy(id)`, `ctx.getObject(id)` / `ctx.query(sel)`, a dot assignment is the write (`ctx.self.state.hp = 3`), `ctx.attach(a, b)`,
`ctx.cross(entity, link)`, `ctx.emit(topic, payload)` (+ `ctx.on`). `ctx.now()` is the only clock; `ctx.after(seconds, "export", payload)`
is the one-shot timer. Durable per-player data is
`player.state.*`; shared is `ctx.world.state.*`; room-life-only is `ctx.session.*`. The public API
reference and engine-use guide live in the engine repo pinned by `.spawn/engine.yaml`:
`git clone --depth 1 -c credential.helper= -c credential.helper='!f() { echo username=<you>; echo password=${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}; }; f' https://git.spawn.co/engine/6.0.0.git .spawn/engine` (gitignored).

## The page

`https://www.spawn.co/@lanmower/the-savi-gallery@dev` is the world at the latest push to main, as a web page. Each page is a player in a room.
The page marks `<html>` with the class `spawn-world-shown` once the world is drawn, and with the attribute `data-spawn-stood` once it lets go of its own hold (the world standing, a boot fault, or a press on the page): `page.waitForSelector('html.spawn-world-shown')` waits for the world and not for a timer.
The game's `console.log` and every fault in its scripts, with the script's path, line and column, print in that page's console.
A screenshot of the page is the frame a player sees, the game's HTML UI and the rail included.
The page draws with WebGPU. A headless Chromium with no GPU drew it in software, slowly and at a low resolution, with `--enable-unsafe-webgpu --enable-features=Vulkan,WebGPU --use-angle=vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader --enable-unsafe-swiftshader`.
The page holds the game in a frame at another origin, `iframe[data-spawn-kernel-frame]`, and that frame holds the game's HTML UI (`scripts/ui.js`) in a sandboxed frame at a throwaway origin of its own, `iframe[data-tome-realm="game"]`.
Neither frame has a fixed `name`, the page's first `iframe` is not the HUD, and the HUD's words are in the inner frame only: a text read or a locator on the top document, or on the outer frame, finds none of them. In Playwright `page.frameLocator('iframe[data-spawn-kernel-frame]').frameLocator('iframe[data-tome-realm="game"]')` is the HUD, `hud.getByRole('button', { name: 'Play again' }).click()` presses its button, a `page.mouse.click` at a HUD button's bounding box lands on it as a person's click does, and a key press reaches the game's actions once a click in the page has given the game the focus.
In a headed browser a 3D place holds the mouse for the camera's look (pointer lock: on by default in a 3D place, off with the camera's `pointerLock: false`, and off by default in a 2D place). While it holds, the cursor is hidden and a click goes to the world, never to the HUD; Escape from a person's keyboard frees it, and a key an automation sends does not. A `data-modal` element in the HUD frees the mouse while that element stands, so a card's button takes a click, and the lock returns when the card goes. A headless browser never holds the mouse, and every click lands where it is aimed.
A browser a program drives says so (`navigator.webdriver`), and Spawn counts that page apart from a person's; one that cannot say so ends its user agent with ` SpawnProbe/<name>`.

## Who writes here

Savi, `exec --persist` and other clones commit to main too: git refuses a push behind their commit (`fetch first`).
Spawn commits this guide to main too: a push behind that commit lands under Spawn's merge commit, and `git pull` fast-forwards. The server never force-pushes.
The first line of each commit message lands in the creator's chat and changes list under your name, and Savi reads it at her next step, never the body or `design.md`. It is one plain sentence
about what changed for the player or the rule the creator set, never a file, a function or a diagnosis; the how goes in the body.
`git log --notes=spawn` carries the world's own reading of each commit (the clone line below fetches it).
A push prints `remote:` lines that name the rooms, players, ops and verdicts. The `verdicts →` page reads with `printf 'user = "<you>:%s"\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}" | curl -K - <url>`.
Agents never wake Savi. There is no door into her chat.

## The packaged client

`@spawnco/client` (`bun add -g @spawnco/client`) stands a body in a room from a shell, wearing your name:
`spawn client join @lanmower/the-savi-gallery --ttl 600`, `spawn client leave`. `spawn client exec <file>` or `-e '<code>'` runs an async JS
body in that room's real engine with `api`, `ctx` and the world's imports; its changes stay in that room unless `--persist` saves
them into the world's files. `--realm browser` runs in the body's page (join with `--render cpu` or `--render gpu`), where
`client.capture({ method: "preview_object", params: { object, children } })` draws one object's draft by its fields alone.
`spawn client --help` and `spawn client exec --help` list every verb and flag.
`spawn preview`, run inside this clone, stands a body in a room of its own at the version main is at, carries the files of your working tree that differ from `origin/main` into that room, prints the room's page, and lands every save there as you make it, with no push; Ctrl-C ends it, and the world's rooms and history never see the preview's files.

## The doors — one token everywhere

Your token is the password on the git remote and the Bearer on every door. Every line here reads `$SPAWN_TOKEN`,
else the file `spawn login` keeps it in (`~/.spawn/token`); never commit it, never print it. Git with no helper
asks the person at the screen for a login. The clone, with its helper and the notes:
`git clone --config credential.helper= --config credential.helper='!f() { echo username=<you>; echo password=${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}; }; f' --config http.proactiveAuth=basic --config remote.origin.fetch='+refs/notes/*:refs/notes/*' https://git.spawn.co/@lanmower/the-savi-gallery.git`
An existing clone: `git config credential.helper ''` (drops a stored login), `git config --add credential.helper '!f() { echo username=<you>; echo password=${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}; }; f'`,
`git config http.proactiveAuth basic`, `git config --add remote.origin.fetch '+refs/notes/*:refs/notes/*'`, `git fetch`. `<worldId>` below is the id `me` and `worlds` answer for this world.

- who am I, my worlds with their git and play URLs: `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") https://www.spawn.co/api/agent/v1/me`
- this world's live rooms and player counts: `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") https://www.spawn.co/api/sdk/v1/<worldId>/agent/rooms`
- the room's script log (errors name your paths): `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") https://www.spawn.co/api/sdk/v1/<worldId>/agent/logs`
- run read-only JS in the live room: `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") -X POST https://www.spawn.co/api/sdk/v1/<worldId>/agent/exec -H "Content-Type: application/json" -d '{"script":"return api.query({tags:[\"enemy\"]}).length"}'` (409 `no_live_room` when nobody is in it — an open page or a client body is a player in a room; add `"place":"<name>"` to read one place, else it runs where most of the room's players stand and the answer's `place` says where)
- the reference and skills at this pin over HTTP: `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") https://www.spawn.co/api/sdk/v1/<worldId>/agent/docs` — The Tome API reference is read by section: the docs door with ?section=<heading> answers that one section in tomeApi with every heading in sections; with no section named it answers the opening and the headings. Every shape in it is exact, and a push in another shape is refused naming the row, the line and the field. That curl is the docs door; the whole reference is also `api-reference.md` at the root of the engine repo above.
- a browser signed in as you (the url works once, within 5 minutes): `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") -X POST https://www.spawn.co/api/agent/v1/login-link -H "Content-Type: application/json" -d '{"next":"/@lanmower/the-savi-gallery@dev"}'` answers `url`.
- your inbox (notes, plays, invites, a link's verdict): `curl -H @<(printf 'Authorization: Bearer %s\n' "${SPAWN_TOKEN:-$(cat "${SPAWN_TOKEN_FILE:-$HOME/.spawn/token}")}") "https://www.spawn.co/api/notifications?unread=1"`
- make a world: `git push -o create` to `https://git.spawn.co/@@<you>/<free-slug>.git`, or `POST https://www.spawn.co/api/agent/v1/games`.
- the human invites the next agent here: https://www.spawn.co/@lanmower/the-savi-gallery/code

## The rail is Spawn's

The right-middle block of the game screen (one reservation, vertically centered on the right edge; its size is
the engine's, published to ui.js as CSS variables — the game-ui skill names them) belongs to the platform — home,
creator, like, comments in play; Savi's face while creating. Game UI you write (raw HTML) keeps out of it; the
engine forwards the same keep-out rects.

