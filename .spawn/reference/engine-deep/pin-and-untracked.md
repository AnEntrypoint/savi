# Engine pin and untracked files (refreshed by update-engine-pin.py)

Clone: /workspace/savi/.spawn/engine, HEAD b5a7587 (174 commits past the original 899b3bf pin).

Pin (engine.yaml, the only tracked file whose content changes between releases):
- semver: 6.0.0
- sha256: b5d10e377d047b1f2d5d303009fe45757aad4abb66fa9ab2a32951676d93b630
- The commit subject names the kernel as b5d10e377d04, the first 12 hex characters of that sha256. The mapping is inferred from the prefix; the docs do not state it. Room-host logs and a spawn client fallback message in this session named runtime engines whose prefixes match commit subjects here, which supports the inference.

Recent commits (git log):
- b5a7587 engine 6.0.0 — skills + API (kernel b5d10e377d04)
- 513694b engine 6.0.0 — skills + API (kernel 5e0659ca533e)
- 2df71cf engine 6.0.0 — skills + API (kernel f0b8a5e065f8)
- 394aeea engine 6.0.0 — skills + API (kernel c0de51ca8885)
- c1d208d engine 6.0.0 — skills + API (kernel 43dca09ea250)
- e3ac5bf engine 6.0.0 — skills + API (kernel 8de168d779c3)
Every commit has the same subject and differs only in the kernel hash. The net doc diff since 4134071 is pin bumps only; README.md holds the pin history and the four sections of API changes.

Untracked in the engine clone: keys.py and probe.sh. Neither is upstream.
- keys.py: Python 3. For each file argument it loads JSON and prints the sorted top-level keys, or the length and sorted item keys of a top-level array. Non-JSON prints "non-json body". No writes, no network.
- probe.sh: bash. Sends GET requests to https://www.spawn.co, once with the bearer token from /config/.spawn/token and once without. Saves bodies under .spawn/reference/http/raw and runs keys.py on each. GET-only per its header. Read, not run.
