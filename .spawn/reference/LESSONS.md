# Lessons from the first Spawn build, and gm friction

## Spawn

- Login writes the token to ~/.spawn/token; with HOME=/config that is /config/.spawn/token. It is shown once and never printed. Login also installs a global git credential helper for git.spawn.co, so a plain git clone works with no prompt. Check it with: git config --global --get-regexp credential.
- Do not hand-build the clone line from /me inside a JS template literal. Its nested quotes broke the body (empty password, then "Authentication failed"). Once the helper is set, use the plain clone.
- The docs door with section=all returns the whole Tome (about 120 KB). Fetch it once and split it locally. Fetching 68 headings one at a time is slower and gives no more.
- World identity: the docs door for worldId 26f64424-cc19-43af-a9c3-666e4559bb05 served a guide headed @lanmower/the-savi-gallery, while its top-level metadata, /me and the git path say game-6, with the same appId d21d322b-4572-4710-a8d5-eaef4e6daa1f. Later AGENTS.md and world.config.yaml both say "The Savi Gallery". Before using a name, read the H1 of AGENTS.md and the name: field of world.config.yaml.
- spawn api prints the 305 type names as comma-separated text with "(N kinds)" annotations and a footer. Strip the annotations and stop at the "305 types:" line. It reads the local engine clone, so it needs no network.
- spawn login --help exits 2 with "unknown word --help". Use the top-level usage instead. spawn client <verb> --help prints the same client page for every verb except exec, so the 11 client verb files are copies of client.txt.
- Any parallel write can leave an empty file. The first parallel pass left MorphTargetNamesResult.txt empty; the same command re-run returned string[]. After a parallel write, check every output for size, and re-run the empty ones.
- Only GET was used. POST, PUT, PATCH and DELETE doors are documented from source text and are not verified. Do not call them to check them. publish, chat, crew/ask and login-link change state or send messages.
- Personal data: the raw bodies of /me, notifications, invites and social/me contain personal fields. They are in .spawn/reference/http/raw/. Keep them out of anything shared.
- The engine pin has two parts: the semver in engine.yaml, and the sha256 beside it. The sha changed in engine commit 804afb7 while the semver stayed 6.0.0. Compare the sha, not only the semver.
- A clone of the game repo that has been pulled shows the new name in its own files before /me does. Pull, then read the H1 and world.config.yaml.

## gm (this session)

- run_code moves a body to the background after 120 s, and the call returns at once with a task id. A background loop that is still running when the run ends is cut off. The first xargs pass over 305 types stopped at 111 files this way. Keep long loops short, or count the outputs afterwards. gm-new (0cc8958) now reports a stopped background body as lost output, with the count of completed verb calls. gm could not reproduce the move to background at 120 s, so treat that cause as open.
- After finish, every call on that run is refused with "run ... has ended; call next_context to open a new run". The refusal does name next_context; an earlier note here said it did not, and that was wrong. Check the run id before assuming a call landed.
- gm.grep skipped untracked files by default, so a leak check on .spawn/ returned 0 matches for untracked files. gm-new (2706397, DESIGN.md b60a646) now searches untracked files that git does not ignore, and puts the skipped count on the first line. The running host must restart to serve it. The Node reference src/search.mjs still has the tracked-only default.
- A run_code body that has a backtick in the wrong place fails to load. Load errors now give the line and column (gm-new 691fa75). A ${...} inside a template literal fails at run time ("PIPESTATUS is not defined"), not at load. Build shell commands with string concatenation to keep the cause clear.
- Workflow results can say a job finished with no gaps while the output is short or wrong. The first build said the skill count was 21 and the workflow reported no gaps; the real count is 23. Verify counts from the files.
- gm status (reply from gm session 3b2469): items 2, 3 and 4 are changed on origin/main (0cc8958, 2706397, b60a646, 691fa75). The slash-command args truncation (item 1, "roll" for the full args) is in the host, not gm-new, and is unchanged. Refusal text (item 5) was already correct.
