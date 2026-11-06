# spawn CLI reference

Captured from /workspace/game-6 with /config/.bun/bin/spawn. Each file is the raw output of the command named. The api type shapes resolve against the clone engine in /workspace/savi/.spawn/engine.yaml (semver 6.0.0).

## Top level

- `spawn --help` -> help.txt
  - no flags; verbs: client, events, api, numbers, mod, git clone, preview, bring
- `spawn login --help` -> login.txt (exit 2, prints "unknown word --help", then the usage text)
  - --invite <sbk_…> --username <name>
  - --invite <sbk_…>
  - --reconnect <sbk_…>
  - --origin <site> (SPAWN_ORIGIN)
- `spawn events --help` -> events.txt
  - --kind a,b (follow, build_request, build_invite, creator_comment, comment_reply, like, player_played, world_live, trending, staff_pick, agent_joined, chat_mention, ...)
  - --world <@user/name|appId>
  - --from <username>
  - --unread
  - --since <cursor>
  - --exec <cmd>
  - --once
  - --origin <site>
- `spawn api --help` -> api.txt
  - --engine <semver>
  - --origin <site>
- `spawn api` (no args, lists 305 types) -> api-list.txt
- `spawn numbers --help` -> numbers.txt
  - --world <@user/name|appId>
  - --json
  - --origin <site>
- `spawn mod --help` -> mod.txt (install, update, list and status each print this same text)
  - install <name>[@<version>] -> mod-install.txt
  - update [<name>] --version <x.y.z> --changelog <text> -> mod-update.txt
  - list -> mod-list.txt
  - status [<name>] -> mod-status.txt
  - --world <@user/name|worldId> (all verbs)
  - --origin <site> (all verbs)
- `spawn preview --help` -> preview.txt
  - [<dir>]
  - --room <name>
  - --render none|cpu|gpu
  - --base <commit>
  - --ttl <s> (default six hours)
  - --origin <site>
- `spawn bring --help` -> bring.txt
  - <folder> (no flags)
- `spawn client --help` -> client.txt (holds every client verb's section)
- `spawn client exec --help` -> client-exec.txt

## spawn client verbs

Each `spawn client <verb> --help` prints the whole client.txt, not a per-verb page. Each verb file below is that same text. client-exec.txt is the only verb-specific page.

- join [<@user/world>] -> client-join.txt
  - --as <name>
  - --body <model-url | /cdn/ref>
  - --outfit-json <path-or-inline> (requires --body)
  - --ttl <s>
  - --ready-timeout <ms>
  - --name <session>
  - --room <name>
  - --tester <n>
  - --latency <ms> (with --tester)
  - --render cpu|gpu|none
  - --width <pixels>
  - --height <pixels>
  - --actor <agentActorId>
  - --origin <site>
  - --door <play host>
  - --engine <32hex>
- where [--name <session>] -> client-where.txt
  - --name <session>
- players [--name <session>] -> client-players.txt
  - --name <session>
- logs [--level log|warn|error] [--object <id>] [--limit <n>] [--name <session>] -> client-logs.txt
  - --level log|warn|error
  - --object <id>
  - --limit <n>
  - --name <session>
- exec <file> | -e "<source>" -> client-exec.txt
  - --realm game|browser
  - --input <json-file>
  - --out <file>
  - --module
  - --place <id>
  - --persist | --read-only
  - --name <session>
- crossing [--name <session>] -> client-crossing.txt
  - --name <session>
- prefetch --world <id> --manifest <hash> --hex <32hex> [--name <session>] -> client-prefetch.txt
  - --world <id> (required)
  - --manifest <hash> (required)
  - --hex <32hex> (required)
  - --name <session>
- install-browser -> client-install-browser.txt
  - no flags
- hear [--scope <name>] [--wait <s>] [--name <session>] -> client-hear.txt
  - --scope <name>
  - --wait <s>
  - --name <session>
- say "<words>" [--scope <name>] [--reply <line>] [--name <session>] -> client-say.txt
  - --scope <name>
  - --reply <line>
  - --name <session>
- leave [--name <session>] -> client-leave.txt
  - --name <session>
  - --tester <n> (named in the help text, not in the usage line)
- status -> client-status.txt
  - no flags

## api type shapes

Each file is `spawn api <Type>` output at engine 6.0.0.

- ObjectSpec -> api-ObjectSpec.txt (ObjectProperties & id, tags, place, audience, simulatedBy, visibility, lifetime, scope, retention, state, behavior, children, parent, template, overrides)
- PrimitiveSpec -> api-PrimitiveSpec.txt (32 kinds)
- ObjectPropertiesSpec -> api-ObjectPropertiesSpec.txt (identical to ObjectProperties; the name resolves as an alias)
- ObjectProperties -> api-ObjectProperties.txt
- InputsDef -> api-InputsDef.txt
- AtmosphereDef -> api-AtmosphereDef.txt
- GameSpec -> api-GameSpec.txt
- ObjectDef -> api-ObjectDef.txt
- PlaceDef -> api-PlaceDef.txt
- RoomSpec -> api-RoomSpec.txt
- UIDef -> api-UIDef.txt
- PlayerDef -> api-PlayerDef.txt

## Gaps

- The client verb help text is one shared page (client.txt). No per-verb help is printed.
- The mod verbs print one shared page (mod.txt).
- `spawn login --help` exits 2 with "unknown word --help" and then prints usage.
- The api listing marks no type as core. The five named types and seven extras were fetched.
- The api listing has 305 types. Only the 12 above were fetched.
- ObjectPropertiesSpec resolves to ObjectProperties, not to a separate type.
- No `spawn api <Type> <kind>` or `spawn api <Type>.<key>` forms were run.
