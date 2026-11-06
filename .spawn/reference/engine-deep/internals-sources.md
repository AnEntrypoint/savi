# Engine internals: where the source is, and what is verified

Checked 2026-11-05 against engine b5a7587 and client @spawnco/client 0.2.0.

## Local sources

- .spawn/engine (git clone): docs only. api-reference.md, skills/, README.md, engine.yaml. No kernel source is tracked.
- @spawnco/client 0.2.0 (/config/.bun/install/global/node_modules/@spawnco/client): a loader. Its README says "THE PACKAGE HOLDS NO CLIENT". The loader fetches the stack's client by content from <origin>/api/client/manifest.
- ~/.cache/spawnco-client/31a39ac2c2689403920f92bf1231e382/: cached client bundles, minified.
- /tmp/spawn-room-host-engine-cache-1000/: the room host caches the SRI-verified runtime worker for each engine it has booted. A durable copy of the newest one is at /workspace/savi/.spawn/kernel/ (28,968,772 bytes), so the kernel survives a cleared /tmp cache. The headless-room-host log names the exact entry file. See kernel-worker.md.

## What the client bundles show and do not show

- A literal search for onSpawn, onCollide, onTriggerEnter and ears matches nothing in the client bundles. Hook dispatch is not in the client.
- The client's own spec (README): the world's runtime worker is downloaded from the session door at boot and verified. That worker is the kernel. It is now known to be cached locally under /tmp (see above); the earlier "not in any local file" note was wrong.

## Verified

- The public API as the docs state it (api-reference.md, skills/).
- The client's play-script surface (README): join, where, players, run, leave, and the play.* calls.
- The world's own usage (world-usage.md).
- The hook catalog, aliases, force guard and 30 Hz step from the cached runtime worker (kernel-worker.md).

## Verified live (preview and joined rooms, 2026-11-05)

- Hook order: onSpawn -> onInput -> update on the spawn tick, then onTriggerEnter and onCollide on later ticks; ears.press on emit. dt = 1/30 s. (live-probe-results.md, kernel-worker.md)
- A placed dynamic row falls and settles; a runtime-spawned object does not fall even with physics: dynamic.
- ctx.destroy(id), ctx.destroy([ids]), ctx.sleep, no-op and write ctx.commit. force: true is the override that permits deleting a live player's body; plain destroy refuses with a specific message and removes every other object class tested.
- Inside ctx.commit(message, fn), ctx.spawn with behavior binds a tree script; plain ctx.spawn with behavior fails because the scripts key is dropped.
- Hook names, aliases and the built-in job list (including video:generate) from the worker's embedded catalog.

## Limits of the current knowledge

- video:generate was invoked, not just documented. The clip was refused with `fuel_empty` ("try again in about 8 hours"), so no clip exists yet. The `aspect` enum is `16x9 | 9x16 | 1x1 | 4x3 | 3x4 | 21x9` (not `16:9`), and `awaitJob` cannot be used inside an exec run_script; a behavior or sim.js hook must keep the result.

- The minified dispatch code was not decompiled; the catalog, alias table and guards were read from a durable local copy of the worker.
- The catalog says onInput fires only on the player or a controlled entity; a live probe saw it fire on a freshly placed ordinary object. The wording is narrower than observed behaviour.
- A local feetPosition write on a tree-derived object does not restart physics, so runtime repositioning cannot sample a fall.

## How to settle the rest

1. Use `spawn preview <clone> --room <name>` for a working-tree room. It needs no push. If it never prints `joined: session`, check the headless-room-host log for `step=worker`: the worker fetch may be failing for the engine the server picked. Retrying later works once the deploy lands.
2. `spawn client join` reads a published "live at platform" tree copy (specVersion 305 here), not the latest push. Pushed rows appear only in preview/dev rooms, unless the world is published.
3. For kernel questions, read the cached worker in /tmp/spawn-room-host-engine-cache-1000/ directly.
