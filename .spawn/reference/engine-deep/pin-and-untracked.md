# Engine pin and untracked files (refreshed by update-engine-pin.py)

Clone: /workspace/savi/.spawn/engine, HEAD eb0aad2 (3 commits in this shallow clone; the original 899b3bf pin is not present).

Pin (engine.yaml, the only tracked file whose content changes between releases):
- semver: 6.0.0
- sha256: b5d10e377d047b1f2d5d303009fe45757aad4abb66fa9ab2a32951676d93b630
- The commit subject names the kernel as b5d10e377d04, the first 12 hex characters of that sha256. The mapping is inferred from the prefix; the docs do not state it. Room-host logs and a spawn client fallback message in this session named runtime engines whose prefixes match commit subjects here, which supports the inference.

Recent commits (git log):
- eb0aad2 Record the deployed manual URL
- 12bfdb9 Include engine source files as ordinary files
- 53a7eeb Publish the Savi direct manual
Every commit has the same subject and differs only in the kernel hash. The net doc diff since 4134071 is pin bumps only; README.md holds the pin history and the four sections of API changes.

Untracked in the engine clone: keys.py and probe.sh. Neither is upstream.
- keys.py: Python 3. For each file argument it loads JSON and prints the sorted top-level keys, or the length and sorted item keys of a top-level array. Non-JSON prints "non-json body". No writes, no network.
- probe.sh: bash. Sends GET requests to https://www.spawn.co, once with the bearer token from /config/.spawn/token and once without. Saves bodies under .spawn/reference/http/raw and runs keys.py on each. GET-only per its header. Read, not run.
