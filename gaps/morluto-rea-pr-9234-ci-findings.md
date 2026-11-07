# morluto/rea PR 9234: CI failure, local reproduction, open items

Read-only survey of morluto/rea (public) for PR 9234, `fix(javascript): keep case-folded loader suffixes unknown`. Local checkout at `99db80a13` (main, clean tree throughout). Each claim is marked **verified** (read from a log, a command result, or code, with the source cited) or **unverified** (not run, or not established).

**Status: the CI failure's cause is confirmed in the cited observations and the fix passes CI on `32df15f`; the rea test output and root-cause interpretation remain open for independent review.**

**Validation caveat: facts audit NOT RUN (retry fork hung through a bounded wait and was stopped without a result); links/file-list/push-claim audit PASS (0 public URLs, 0 markdown links, 10 local path references checked; generated NodeNext `tests/support/cli/cliFixture.js` import specifier is not a committed-source failure; PR diff 4/4, head delta 3/3, commit/run/job refs resolved, 0 positive upstream push/ready/re-run claims, 0 Co-Authored-By lines). The words verified, confirmed, resolved and passed below record cited observations, not an independently audited pass.**

## Summary

The CI failure on PR 9234 at head `86dfb903` had one cause: the `.cts` grammar change in commit `1874f8729`. Both failing cases come from that change, and `32df15f` fixes them.

- **Cause 1, `ReferenceSourceImportEntries` ("resolves declared package mains..."):** confirmed. Reproduced at `86dfb903`, with the same `expected ... to deep equally contain { from_path: 'main.cts' }` message as CI. It passes at `32df15f`.
- **Cause 2, cli-boundary ("preserves owned CommonJS factories..."):** confirmed. The rebuilt `86dfb903` runtime fails with the same `parse_failures` error for `main.cts` as CI. The rebuilt `32df15f` runtime passes all 3 tests.
- **Fix commits:** `1874f8729` (keep the module grammar for `.cts` sources) and `32df15f` (keep case-insensitive TypeScript and declaration checks).
- **Not a build problem:** the CI shard used the runtime artifact from the same run, with a matching digest.

Resolved:

- `setupEnvironment.test.ts`: the failures were environmental (Node v24.22.0). On Node v24.22.1 the file passes 14/14 (section 4).

Open: independent review of the rea test output and root-cause interpretation; the separate facts audit did not run. The CI run for `32df15f` (run 42343646562, workflow CI) completed success, with `Source tests`, all 8 test shards and `CI required` passing (section 8).

Details and evidence are in sections 1 to 8 below.

## 1. PR state

- PR 9234: head `32df15f1a2621a3fbb513c98833159981684d1fc`, OPEN, not a draft. **Verified** (`gh pr view 9234`). Merge state was BLOCKED while checks were pending, and CLEAN at a later watch event. **Verified** (watch output).
- The diff touches 4 files. **Verified** (`gh pr diff 9234`):
  - `src/application/javascript/JavaScriptModuleRelationships.ts`
  - `src/domain/javascript/javascriptModuleResolutionMode.ts`
  - `src/domain/javascript/javascriptSourceParser.ts`
  - `src/domain/javascript/javascriptSourceParserContext.test.ts`
- The base blobs of those four files match `main` at `99db80a13`, so the diff applies cleanly to current main. **Verified** (`git rev-parse main:<path>`).
- PR 9230 (`fix(desktop): skip directory symlinks during executable lookup`, head `4d0ef65b638bf9b02225c5cb5e214360728874ec`) is a **draft**, BLOCKED. Two readiness checks (Validate author declaration, Conventional PR title) were **cancelled**, not passed. **Verified** (`gh pr view 9230`). Not marked ready, and the cancelled checks have not been re-run.

## 2. The CI failure (head `86dfb90365d248dbb286117c9e675b50a8897011`, run 42340853942)

The `CI required` job reported `CI lanes did not pass: test, test-shard, test-source`. **Verified** (`gh run view --log-failed`). Two jobs failed on the root cause:

- **Source tests** (job 128308633744): `src/application/ReferenceSourceImportEntries.test.ts`, "resolves declared package mains and index fallback from source-owned fields". `AssertionError: expected [ …(7) ] to deep equally contain { from_path: 'main.cts', …(4) }`. Summary: 1 failed, 1322 passed (1323). **Verified** (log).
- **Test shard (8/8)** (job 128308845027): `tests/boundary/cli/referenceSourceRuntimeAuthority.test.ts`, "preserves owned CommonJS factories through erased TypeScript syntax". `AssertionError: expected [ { path: 'main.cts', …(2) } ] to deeply equal []`. Summary: 1 failed, 217 passed, 6 skipped. **Verified** (log).

The two failures are about `main.cts` entries. Section 6 gives the diff between the two heads and the local reproduction.

## 3. Local reproduction

Environment: Node `v24.22.0`. **Deviation:** rea's `package.json` engines require `^24.22.1` for Node 24, so this is below the required floor. Install: `npm ci --ignore-scripts --engine-strict=false` (added 738 packages, exit 0). **Verified.** One optional binary was missing: `@tsrs/linux-x64-gnu@0.18.0-ts7.1.0-dev.20260929`. It was added with `npm install --no-save`, so the lockfile is unchanged. **Verified.**

Results:

| Tree | Command | Result |
| --- | --- | --- |
| main `99db80a13` (before build) | `vitest run` on the two files | Entries file 14/14 pass. CLI boundary file 0/3: "REA's compiled runtime is missing". Environment gap, not a code failure. **Verified.** |
| main (after `npm run build:cached`) | same | 17/17 pass. **Verified.** |
| PR 9234 applied (head 32df15f) | same two files plus `src/domain/javascript/javascriptSourceParserContext.test.ts` | 44/44 pass. **Correction:** the cli-boundary file runs the compiled CLI, and this run did not rebuild, so it used main's build. The rebuilt result is in section 6. |
| main, full source group | `node scripts/ci/test-group.mjs source` | 1 file failed, 1322 passed. 2 tests failed, 24520 passed, 16 skipped. Both failures in `src/setupEnvironment.test.ts`. **Verified.** |
| PR 9234 applied, full source group | same | 1 file failed, 1322 passed. 2 tests failed, 24525 passed, 16 skipped. Same two failures; 5 new parser-context cases pass. **Verified.** |

The PR tree was reverted with `git apply -R`, and the checkout was confirmed clean at `99db80a13`. **Verified.**

So on head 32df15f, the two test files that failed in CI pass locally. The CI failure does not reproduce on the current head. **Open for independent review:** interpretation of the CI source-test output on `32df15f`; CI run 42343646562 passed (section 8).

## 4. The `setupEnvironment` failures (main and PR tree)

Both tests in `src/setupEnvironment.test.ts` expect `status: "planned"` and get `"needs_human"`. A probe outside the repo (`/tmp/probe`, not committed) calls the same setup entry points with the same inputs. **Verified.** Both return:

- `status: "needs_human"`
- `code: undefined`
- `remediation: "Install Node.js 22.x (>=22.23.4), 24.x (>=24.22.1), or 26.12.1+ and rerun setup."`

So the cause is the local Node version, not the code under test. The setup path returns `needs_human` for an unsupported Node before it builds the dry-run plan. **Verified** (probe output and the remediation text).

Environment: Node v24.22.0 is below the 24.22.1 the setup check requires. Rerun on Node v24.22.1 (official linux-x64 tarball, SHA256 verified against the official SHASUMS256.txt, unpacked in /tmp, prepended to PATH for one command, global Node unchanged): `npx vitest run src/setupEnvironment.test.ts` gives Test Files 1 passed, Tests 14 passed. **Verified.** The two failures on v24.22.0 come from the setup check's Node floor. No other cause was found.

## 5. Open items

1. Resolved: `src/setupEnvironment.test.ts` passes 14/14 on Node v24.22.1 (section 4).
2. The `cli-boundary` case is confirmed as the same `.cts` grammar change. See section 6.
3. Open for independent review: interpretation of the full source group’s CI output on `32df15f`; run 42343646562 passed (section 8).
4. Owner decision: marking PR 9230 ready for review and re-running its cancelled readiness checks. Not done. Upstream actions on `morluto/rea` have not been taken.

## 6. Head 86dfb903 vs 32df15f

Diff between the two heads, from `gh api repos/morluto/rea/compare/86dfb903...32df15f` (read-only). **Verified.**

Commits on top of `86dfb903`:

- `1874f8729` fix(javascript): keep the module grammar for .cts sources
- `32df15f1a` fix(javascript): keep case-insensitive TypeScript and declaration checks

Diff stat: 3 files changed, 16 insertions(+), 4 deletions(-).

| File | Change |
| --- | --- |
| `src/application/javascript/JavaScriptModuleRelationships.ts` | +4 -1 |
| `src/domain/javascript/javascriptModuleResolutionMode.ts` | +4 -1 |
| `src/domain/javascript/javascriptSourceParser.ts` | +8 -2 |

The change that matters for `.cts`: in `javascriptSourceParser.ts`, `runtimeSourceTypeForPath` used to return `"commonjs"` for any path that `isCommonJsSourcePath` matched, so `main.cts` was parsed with the CommonJS script grammar. The new code returns `"commonjs"` only for an exact `.cjs` suffix. `.cts` now keeps module grammar, which TypeScript `import x = require()` needs. The `.cts` loader mode still comes from the runtime context. **Verified** (diff).

Neither failing test file is in the diff: `src/application/ReferenceSourceImportEntries.test.ts` and `tests/boundary/cli/referenceSourceRuntimeAuthority.test.ts` are both unchanged between the two heads. **Verified** (the compare file list has only the three source files above).

Local reproduction of the `86dfb903` state: main plus the PR 9234 diff, minus the two-commit delta (`git apply -R` of the compare diff). Same three test files, under `npx vitest run`:

- `ReferenceSourceImportEntries.test.ts` > "resolves declared package mains and index fallback from source-owned fields": **FAIL**, `AssertionError: expected [ …(7) ] to deep equally contain { from_path: 'main.cts', …(4) }`. Same message as CI. **Verified.**
- `referenceSourceRuntimeAuthority.test.ts` > "preserves owned CommonJS factories through erased TypeScript syntax": **PASS** locally. The CI shard failed on it. **Not reproduced.**
- Summary: 1 failed, 43 passed (44).

On `32df15f` the same test passes (section 3). So the `ReferenceSourceImportEntries` failure is **confirmed**: it is reproduced at `86dfb903` and goes away at `32df15f`, and the `.cts` grammar change is the cause.

### cli-boundary: `preserves owned CommonJS factories through erased TypeScript syntax`

Earlier, the `86dfb903` pass was invalid: this test runs the compiled CLI (`tests/support/cli/cliFixture.js`), and the tree had not been rebuilt after the patch. The results below come from rebuilding with `npm run build:cached` before each run.

- CI shard 8/8 (job 128308845027) did not build. It downloaded the `rea-test-runtime` artifact from the same run (42340853942, "Build package" job), and the SHA256 digest matched (`790cc74d…b1ae800a`). The runtime was therefore not missing or stale. **Verified** (job log).
- The CI failure is a parse error: `parse_failures` for `main.cts`, reason "'import' and 'export' may appear only with 'sourceType: "module"' (1:0)". **Verified** (job log).
- Rebuilt `86dfb903` state: the test **FAILS** with the same `parse_failures` error, `expected [ { path: 'main.cts', …(2) } ] to deeply equal []`. Result: 1 failed, 2 passed. **Verified.** So this case is **confirmed**.
- Rebuilt `32df15f` state: all 3 tests **PASS**. **Verified.**

So both failing cases come from the `.cts` grammar change in commit `1874f8729`, and `32df15f` fixes them on the local rebuild. Neither test file is in the diff; the change affects them through the parser they call.

Remaining open items: independent review of the rea test output and root-cause interpretation; the separate facts audit did not run. The full source group in CI on `32df15f` passed (section 8). The `setupEnvironment` item is resolved in the cited local run on Node v24.22.1.

## 7. Full source group under Node v24.22.1

Both runs used the same binary: official Node v24.22.1 linux-x64, unpacked in `/tmp`, prepended to `PATH` for each command, with the global Node unchanged. Command: `node scripts/ci/test-group.mjs source`. Each run was started after its own runtime rebuild (`npm run build:cached`).

| Tree | Test Files | Tests | Exit |
| --- | --- | --- | --- |
| main `99db80a13` | 1323 passed (1323) | 24522 passed, 16 skipped (24538) | 0 |
| PR 9234 applied, head `32df15f` | 1323 passed (1323) | 24527 passed, 16 skipped (24543) | 0 |

**Verified.** The PR tree adds 5 parser-context cases (24543 vs 24538) and passes all of them. On Node v24.22.0, main had 2 failures in `src/setupEnvironment.test.ts`. On v24.22.1 those pass, so the full source group is clean on both trees.

Remaining open item: independent review of the rea test output and root-cause interpretation; the separate facts audit did not run (section 8).

## 8. CI on head 32df15f

Read-only, from `gh run view`. **Verified.**

| Run | Workflow | Event | Conclusion |
| --- | --- | --- | --- |
| 42343646562 | CI | pull_request | success |
| 42343646499 | PR title | pull_request | success |
| 42343643703 | (pull_request_target) | pull_request_target | success |
| 42343646532 | CodeQL production | pull_request | skipped |

Run 42343646562 jobs: `Classify changes` success, `Build package` success, `Source tests` success, `Test shard (1/8)` through `(8/8)` all success, `Portable tests` success, `CI required` success. `Source-built conformance fixtures` skipped.

PR 9234 is OPEN, not a draft, `mergeStateStatus` CLEAN at head `32df15f`.

The same head also passed the full source group locally under Node v24.22.1 (section 7).

The rea checkout was reverted to `99db80a13` and confirmed clean. The runtime was rebuilt for main afterwards.

The local tree was restored from HEAD and confirmed clean at `99db80a13`. Nothing was committed or pushed.

## Evidence commands

- `gh pr view 9234 --repo morluto/rea --json headRefOid,mergeStateStatus`
- `gh run view 42340853942 --repo morluto/rea --log-failed`
- `gh pr diff 9234 --repo morluto/rea`
- `node scripts/ci/test-group.mjs source` (in a checkout of `morluto/rea` at `99db80a13`, with and without the PR 9234 diff applied)
