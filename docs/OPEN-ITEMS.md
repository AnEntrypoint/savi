# Open items

Status values: OPEN, INFERRED, UNVERIFIED, BEHAVIOUR, DIFFERENT-DATASET, HELD-OWNER. HELD-OWNER means awaiting an owner decision and is never a resolved status. Witness lines are command output or file paths. Tag `required-in-jayzee` marks the owner's parity directive; naming parity is not required, and feature support for everything spawn is learning is non-negotiable. Directive sources: `/workspace/jayzee/docs/PARITY.md`. EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/INVENTORY.md`.

## Register

### OPEN-001
Claim: the 62 in the ENDPOINTS.md header is the openapi spec path count, and the 63 is a sum of named-endpoint buckets (39 listed, 21 per-game, 3 partial), so the header and sections measure different things and do not contradict. The header already matches what `npm run endpoints` writes, and the regenerated file is byte-identical to the committed one. Only 42 of the 62 spec paths are named verbatim in the manual. The status stays OPEN because the status vocabulary has no resolved value, and the owner decides whether to add one.
Status: OPEN
Source paths: `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/scripts/openapi.json`, `/workspace/savi/scripts/endpoints.mjs`
Witness: command output `spec paths 62; ENDPOINTS.md header 62 paths, 93 named; buckets listed=39 per-game=21 partial=3 absent=30 (sum 93); spec paths named verbatim 42 of 62; npm run endpoints leaves git status clean`
Resolution: `09332d3` records the counting-error finding, with the header unchanged because it already matches `npm run endpoints`; `check-featureset` gained the explicit no-status failure. Status is unchanged.

### OPEN-002
Claim: 305 API type names in api-types.md and 308 in ASSET_SHAPES.md come from different fetches and scopes, not an error.
Status: DIFFERENT-DATASET
Source paths: `/workspace/savi/.spawn/reference/http/api-types.md`, `/workspace/savi/spawn-engine/ASSET_SHAPES.md`, `/workspace/savi/.spawn/reference/COVERAGE.md`
Witness: command output `api-types=305 asset-shapes=308`

### OPEN-003
Claim: 93 endpoints break down as 39 published spec, 21 per-game-or-id, 3 disabled, and 30 not-in-spec; jayzee must support the endpoint surface, not its naming.
Status: OPEN
Source paths: `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/scripts/openapi.json`
Witness: command output `openapi=62 listed=63 total=93 headings=4 39/21/3/30`
Tag: required-in-jayzee

### OPEN-004
Claim: FAULTS F1 GET /api/games/{appId} answers 200 with game:null, which is documented BEHAVIOUR and not a contradiction with ENDPOINTS.md listing that path; do not resolve by deleting either.
Status: BEHAVIOUR
Source paths: `/workspace/savi/spawn-engine/FAULTS.md`, `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/scripts/openapi.json`
Witness: command output `5:## F1. GET /api/games/{appId} answers 200 with game: null for every app id [verified]`
Tag: required-in-jayzee

### OPEN-005
Claim: savi FEED_SCOPE.md has 3421 projects and 66 engine versions by offset step 22, while spawn's three-sort limit=48 union has 2848 worlds and 1002 creators; DIFFERENT-DATASET, not a conflict.
Status: DIFFERENT-DATASET
Source paths: `/workspace/savi/spawn-engine/FEED_SCOPE.md`, `/workspace/spawn/maps/spawn-root-worlds-map.md`
Witness: command output `feed savi=3421/66 spawn=2848/1002`
Live re-run 2026-11-08: the plain feed walk (offset step 22, 3890 rows) gives 3567 distinct projects and 66 engine versions; the three-sort union (limit 48) gives 3567 worlds and 1164 creators. The recorded 3421/66 and 2848/1002 are earlier snapshots, so the feed has grown.
Tag: required-in-jayzee

### OPEN-006
Claim: 2416 verified /cdn/ GLB refs across 399 worlds and 2355 unique sha256 values are a LOWER BOUND for the /cdn/ family only.
Status: OPEN
Source paths: `/workspace/spawn/maps/glb-urls-all.tsv`, `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `glb rows=2416 worlds=399 shas=2355 cdn=2416 ok=2416`
Tag: required-in-jayzee

### OPEN-007
Claim: spawnfile-family scan covered 16/16 shards and 2848 worlds with 0 refs, 0 worlds and 0 unique URLs, scoped to the scanned set and NOT a proof of universal absence.
Status: INFERRED
Source paths: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `spawnfile shards=16 worlds=2848 refs=0 worldsWithRefs=0 urls=0`
Tag: required-in-jayzee

### OPEN-008
Claim: "all GLBs served only from play.spawn.co/cdn/" is INFERRED, not witnessed.
Status: INFERRED
Observation (scoped to spawn's probe of 308 named `/cdn/` keys, not universal): with `.yaml` stripped, 304 of 308 return 302 to a `value-origin` path that is not under `/cdn/`; 302 of those 304 targets return 200 model/gltf-binary and 2 time out. Controls: `.yaml` kept 10 of 10 return 401; value-sha controls 20 of 20 return 200 directly under `/cdn/value.<sha>.glb`; 82 non-CDN rows return 200 and 1 returns 401. The claim stays INFERRED and is weakened for the named-key family only.
Observation (spawn-reported, bounded retry, scoped to the named keys): the 2 first-pass named-target timeouts now return 200 model/gltf-binary on HEAD and `glTF` body magic on a 4-byte range GET, and the 4 first-pass `/cdn/` timeouts retried 4 of 4, each returning 302 to a value-origin path that returns 200 model/gltf-binary on HEAD. Across all 308 named keys with `.yaml` stripped, every redirect target now returns 200 model/gltf-binary on HEAD, and a 4-byte range GET returns `glTF` magic with 206 for all 308 targets. The first pass had 2 range-GET TypeErrors that a sequential retry cleared, and that cause is not explained. Gone-410 probes: 41, none returned a body-level 410 (spawn-reported; probe 41 is a feed world absent from the root map, returning 200 found). This strengthens "named keys reach bytes at value-origin through a 302 from `/cdn/`" and does not confirm `/cdn/`-only, which stays INFERRED.
Source paths: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output "217:Model URL naming: the only witnessed rule is world.assets/<xx>/~2fcdn~2fvalue.<sha256>.glb.yaml in a file-map value, which maps to /cdn/value.<sha256>.glb. Inferred (not witnessed): that every GLB is served only under play.spawn.co/cdn/"
Tag: required-in-jayzee

### OPEN-009
Claim: spawnfile.io model bytes are UNCONFIRMED until a HEAD proof exists.
Status: UNVERIFIED
Source paths: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/jayzee/docs/PARITY.md`, `/workspace/savi/spawn-engine/ASSETS.md`
Witness: command output "222:Totals over the 2848 feed worlds: scanned 2848. Spawnfile-family refs: 0 (0 worlds, 0 unique URLs). The spawnfile.io family is not present in any feed world the scanner reached, and the complete key path is still ELIDED (no full example exists). So spawnfile.io bytes stays UNCONFIRMED."
Observation (scoped, reported by spawn in msg abbc6d6e, not re-run or verified by this session; witness gm run 2026-11-07-10-49-42-a2cf05 seq 53): one page, filtered on /spawnfile|bigspawn/, gave total 30, unique 29, glbLike [], hosts play.bigspawn.net, www.spawn.co, rqr3rdr46-playco.spawnfile.io, and blob: under that host. This is one page only and does not contradict the 0 spawnfile refs over 2848 worlds.
Tag: required-in-jayzee

### OPEN-010
Claim: the full spawnfile key path is ELIDED; FAULTS F3 shows world.assets/3d/https~3a~2f~2fspawnfile.io~2f…glb.yaml with no complete example.
Status: OPEN
Source paths: `/workspace/savi/spawn-engine/FAULTS.md`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output "24:- The same line for world.assets/3d/https~3a~2f~2fspawnfile.io~2fprod~2fcharacter-assets~2f...-savi-reduced-fitted.glb.yaml."
Observation (spawn-reported, bounded probe of the FAULTS F3 path prefix only, no leaf): HEAD `https://spawnfile.io/` returns 200 text/html with length 0; HEAD `/prod/` returns 404 text/plain; HEAD `/prod/character-assets/` returns 404 text/plain; GET `/prod/character-assets/` returns 404 text/plain with body `Not Found`. A later GET of `https://spawnfile.io/prod/character-assets` with no trailing slash returns 404 text/plain with a 10-byte body `Not Found`. No model bytes and no model content type were reached, the `<unix-ms>-savi-reduced-fitted.glb` leaf was not guessed, and no credential or auth header was used. The spawnfile.io bytes stay UNCONFIRMED and the key path stays ELIDED.
Tag: required-in-jayzee

### OPEN-011
Claim: MISSING-HEAD CORRECTION is 256; the older 259 list over-counts by 3 head-present missing-manifest worlds, and the 259 list is kept as recorded, not overwritten.
Status: BEHAVIOUR
Source paths: `/workspace/spawn/maps/head404-confirmed-worlds.txt`, `/workspace/spawn/maps/head-present-manifest404-worlds.txt`, `/workspace/spawn/maps/open-missing-head-worlds.txt`, `/workspace/spawn/maps/spawn-root-worlds-map.md`
Witness: command output `head404=256 old259=259 head-present-manifest404=3 subset=256/256 extra=3 head-present-match=3/3 ids=5db79de6dae84ceca2ddb9b9a0e216d9,fd80e9d941624c2fbc48fc89193a7417,ffb0a8fbdca948a5933be7bd62fb44b5`
Live re-run 2026-11-08 over the 3567 current feed worlds: head.json is 404 for 555 worlds. All 256 recorded head-404 worlds still return 404 (256 of 256). The three head-present worlds recorded as manifest 404 now return head 200 with no manifest field, so the manifest 404 is not reproduced. The other 299 head-404 worlds were added to the feed after the 2848-world scan.
Tag: required-in-jayzee

### OPEN-012
Claim: head status 0 x1 for world 9f7b1a067caa46e2b2c1c7dceb48bc2b is transient with re-check HEAD 200. The three head-present worlds return head 200 with `"manifest":null` and `"seq":0` (witnessed 2026-11-07), so the earlier manifest 404 x3 is not reproduced; the head names no manifest to fetch for them.
Status: BEHAVIOUR
Source paths: `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/spawn/maps/head-present-manifest404-worlds.txt`
Witness: command output "223:Stage failures: head 404 x256 (all head_not_found), head status 0 x1 (world 9f7b1a067caa46e2b2c1c7dceb48bc2b, not in the 259 list, HEAD 200 on re-check), manifest 404 x3 (head present, see below)."
Live re-run 2026-11-08: world 9f7b1a067caa46e2b2c1c7dceb48bc2b returns head 200 and manifest 200 (manifest 177f7a05728fcaddd3884ba21a12b156a7a87dd11067b53270f4edb135a18063), and no world in the 3567 sweep returned head status 0. The first-pass status 0 was transient.
Tag: required-in-jayzee

### OPEN-013
Claim: 2 non-CDN refs were open at the first pass in unverified-noncdn-refs.tsv: one ttf 401 credentialed, which remains open, and one mp4 connection timeout, which is CONFIRMED for one object by the full-body fetch in Detail. Only the ttf 401 remains open. Reconciled counts are 83 first-seen status-0 refs, 81 resolved HEAD 200 on retry, 2 open and 83 TSV data rows; the earlier 84 counted the header line and 82 was an arithmetic error.
Status: OPEN
Detail: the mp4 retry, one GET with `curl -sS -m 60`, returned 200 video/mp4 with 2350318 of 46469835 bytes before the 60 s limit and first bytes `ftyp isom`; the earlier connect timeout did not recur. A later full-body fetch of this one object (spawn-reported, record section 8, CONFIRMED for this single fetch only) read all 12 chunks at plan sizes, totalling 46469835 bytes, with sha256 matching the claimed sha in the Witness line below and first bytes `ftyp isom`. That confirmation does not extend to other objects, and the earlier 2350318-byte partial is superseded. The ttf 401 is a credentialed-looking refusal and is not bypassed, and it is not resolved.
Source paths: `/workspace/spawn/maps/unverified-noncdn-refs.tsv`, `/workspace/spawn/maps/spawn-root-worlds-map.md`
Witness: command output `noncdn first0=83 retry200=81 open=2 tsvDataRows=83 linesIncludingHeader=84 ttf401=d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed mp4timeout=537d6321e14ca1fec788632ca4dcce598c8c901bdf123681d0119caab7815a2c`
Tag: required-in-jayzee

### OPEN-014
Claim: owner-reported 84 first-seen status 0 and 82 resolved on retry are UNVERIFIED; the surviving TSV has 83 zero-status rows and 81 retry-200 rows.
Status: UNVERIFIED
Source paths: `/workspace/spawn/maps/unverified-noncdn-refs.tsv`, `/workspace/spawn/maps/spawn-root-worlds-map.md`
Witness: command output `noncdn owner=84/82 lines=84 rows=83 first0=83 retry200=81 open=2 ttf401=d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed mp4timeout=537d6321e14ca1fec788632ca4dcce598c8c901bdf123681d0119caab7815a2c`

### OPEN-015
Claim: world.assets/<xx>/ bucket rule is UNDETERMINED after 74 tested pairs and no hypothesis is promoted.
Status: UNVERIFIED
Source paths: `/workspace/jayzee/docs/PARITY.md`, `/workspace/savi/spawn-engine/ASSETS.md`, `/workspace/savi/spawn-engine/FAULTS.md`, `/workspace/spawn/maps/spawn-root-worlds-map.md`
Witness: command output `bucket-rule owner=74-tested-pairs status=UNDETERMINED hypothesis=none-promoted`
Tag: required-in-jayzee

### OPEN-016
Claim: name encoder, resolve redirect/gone bodies, manifest frames after the sheet, and ledger bucket rule remain OPEN/UNVERIFIED; only token buckets exist at LagCompensator.js lines 6-7 with capacity 10 and refill 20 per second.
Status: UNVERIFIED
Source paths: `/workspace/jayzee/docs/PARITY.md`, `/workspace/spoint/src/netcode/LagCompensator.js`, `/workspace/savi/spawn-engine/ASSETS.md`, `/workspace/savi/spawn-engine/FAULTS.md`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/GAPS.md`
Witness: command output `lag constants REWIND_BUCKET_CAPACITY=10 REWIND_REFILL_PER_SEC=20`
Scoped note (spawn body witnesses, UNVERIFIED beyond scope): manifest frames after the sheet are witnessed for 3 manifests only, chain exact to EOF, with every frame body in the sheet and the ordered frame-to-hash mapping matching for those 3 (69/69, 80/80, 274/274). A further sample of 40 manifests (about 1.7% of 2580 distinct, evenly spaced) matched the same way, 43 of 43 in total. This is a sample, not a corpus rule. The rest of the 2580 manifests and the other 396 worlds are UNCHECKED. Denominators are not interchangeable: 2580 is distinct manifests in the cdn-scan jsonl, and 399 is worlds with /cdn/ GLB refs, of which 396 are outside the 3 manifest worlds examined. Resolve redirects (308/307) and the 400 body are witnessed; gone 410 was not reached in 22 probes, and 8 further probes gave 200 or 400 only, so it stays OPEN. Witness copies at /workspace/spawn/maps/witness/. Status unchanged.
Tag: required-in-jayzee

### OPEN-017
Claim: with reorder>0, 1011/2000 jayzee transport-sim payloads arrived before minimum latency, so the min-latency gate runs with reorder OFF; this is witnessed behaviour, not a claim about real transports.
Status: BEHAVIOUR
Source paths: `/workspace/spoint/src/transport/NetworkSimTransport.js`, `/workspace/spoint/client/core/RenderControls.js`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `transport-sim owner=1011/2000 reorder>0 min-latency-gate=reorder-off`
Tag: required-in-jayzee

### OPEN-018
Claim: site/manifest.json was generated at 501c76e while HEAD is 6c39a16, and engine-deep README.md wrongly says savi is not a git repo although it is main to AnEntrypoint/savi.
Status: OPEN
Source paths: `/workspace/savi/site/manifest.json`, `/workspace/savi/.spawn/reference/engine-deep/README.md`
Witness: command output `site commit=501c76e HEAD=6c39a16 branch=main origin=AnEntrypoint/savi`
Resolution: `c398faf` corrects the engine-deep README to say savi is a git repository on main with origin AnEntrypoint/savi, and `npm run build` regenerated `site/` at that commit. `npm run check` at c398faf gave `{"ok":true,"sources":626,"text":620,"binary":6,"pages":628,"linksChecked":2513,"failures":[],"failureCount":0,"commit":"c398faf7f44fc3513f509f243f607c520f6bfbe4"}`, exit 0. Status is unchanged.

### OPEN-019
Claim: CHARTEST-est-s1-3 is a confirmed REAL gap at PlanetFrame.js installGroundSource line 348, where a placement-only prototype-linked install changes the shared base frame's groundSource.
Status: BEHAVIOUR
Source paths: `/workspace/spoint/src/terrain/PlanetFrame.js`, `/workspace/jayzee/docs/PARITY.md`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/prd-matrix.json`, `/tmp/spoint-parity/parity-crossmap.json`
Witness: command output `real-gaps CHARTEST=REAL WADLER=REAL nonPrdREAL=5 bundleFreshnessRefs=2 deltaUpdateRefs=2 port3002Refs=3 trimeshLogged=true`
Tag: required-in-jayzee

### OPEN-020
Claim: other confirmed real gaps are WADLER-relocation-probegroundy, GAP-bundle-freshness with 2 package.json refs to absent `scripts/bundle-freshness-witness.mjs`, GAP-fire-kernel-witness, MSG.DELTA_UPDATE declared but never sent or handled, AppRuntime trimesh failure logged with collider dropped, and port 3002 shared by three world defs.
Status: OPEN
Source paths: `/workspace/spoint/src/sdk/Relocation.js`, `/workspace/spoint/package.json`, `/workspace/spoint/src/shared/fire/fireKernel.js`, `/workspace/spoint/src/protocol/MessageTypes.js`, `/workspace/spoint/src/apps/AppRuntime.js`, `/workspace/spoint/apps/world/tps-game.js`, `/workspace/spoint/apps/world/tutorial.js`, `/workspace/spoint/apps/world/tutorial-rpg.js`, `/workspace/jayzee/docs/PARITY.md`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/prd-matrix.json`, `/tmp/spoint-parity/GAPS.md`, `/tmp/spoint-parity/FAMILIES.md`
Witness: command output `real-gaps CHARTEST=REAL WADLER=REAL nonPrdREAL=5 bundleFreshnessRefs=2 deltaUpdateRefs=2 port3002Refs=3 trimeshLogged=true`
Tag: required-in-jayzee

### OPEN-021
Claim: spoint PRD matrix has 15 open rows classified STALE 11, DOC-ONLY 2, REAL 2; .gm/prd.yml has 103 rows (fixed 34, refuted 28, retired 26, open 15), no row numbered 2-4, 76 tracked verdict paths, and no untracked verdict paths.
Status: OPEN
Source paths: `/workspace/spoint/.gm/prd.yml`, `/workspace/jayzee/docs/PARITY.md`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/prd-matrix.json`, `/tmp/spoint-parity/INVENTORY.md`, `/tmp/spoint-parity/parity-crossmap.json`
Witness: command output `prd rows=103 fixed=34 refuted=28 retired=26 open=15 numbered2-4=0 trackedVerdictPaths=76 untrackedVerdictPaths=0 matrix STALE=11 DOC-ONLY=2 REAL=2 nonPrdREAL=5`
Tag: required-in-jayzee

### OPEN-022
Claim: the 13 unchecked savi/spawn gap-report claims remain open and the 47 checked claims are explicitly NOT independently verified.
Status: UNVERIFIED
Source paths: `/workspace/spoint/.gm/witness-out/spawn-feature-gap.md`, `/workspace/jayzee/docs/PARITY.md`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/parity-crossmap.json`
Witness: command output `gap unchecked=13 checked=47 total=60 implemented=47`
Detail: Terrain mark vocabulary and world-def wiring; named terrain field paint with PLAYER and CREATOR layers; decoration item layers and graphics-tier reach; rigged-model ragdoll activation; vibe pattern core and transport; PostFX look DSL and render-graph operators; private preview room and separate publish; browser readiness, fault and chat contract; declarative world tree and state scopes; shared spec parse boundary for all ctx.define* factories; surface the tick drop counter; SES availability preflight with distinct reason codes; fail-loud asset loading gate for model errors.
Tag: required-in-jayzee

### OPEN-023
Claim: Of the five open items in COVERAGE.md, three are answered: the docs-door contradiction (owner confirmed worldId 26f64424-cc19-43af-a9c3-666e4559bb05 is @lanmower/the-savi-gallery), the tome INDEX Gaps: 0 scope (section=all fetch, 69 section files), and the API-type update (305 type files match the 305-name index). Two stay open. Shallow CLI reference: owner decides whether the shared help text is the reference for client and mod verbs, or whether per-verb help is re-fetched from a live spawn run. Engine clone omission: owner decides which api-reference.md is canonical and which engine.yaml sha256 is recorded, because the reference copy is stale against the clone and the recorded hash matches neither the file nor its own sha256 field.
Status: OPEN
Source paths: `/workspace/savi/.spawn/reference/COVERAGE.md`
Witness: `coverage gaps=26 open-items=5 owner-improvements=5`; cli/types 305 type files equal the 305 names in cli/types/_names.txt, with 308 .txt total (plus _list.txt and _missing.txt, which are undocumented); cli/client-*.txt 11 of 12 byte-identical to client.txt (client-exec.txt distinct), cli/mod-*.txt 4 of 4 identical to mod.txt; reference/engine/api-reference.md 119,585 bytes against .spawn/engine/api-reference.md 120,797 bytes; engine INDEX records sha256 31a39ac2…, the engine.yaml sha256 field reads b5d10e37…, and sha256sum gives 08ce22c2….
Resolution: items 1, 2 and 4 answered against `4231625`; items 3 and 5 restated above

### OPEN-024
Claim: five netcode owner improvements await an owner decision: document 24 undocumented src/netcode modules, size the lag ring from window or clamp to 255 ticks, document WIRE_UNITS_PER_METER, put wire layouts in docs/code, and document gm maxInflight: 8.
Status: HELD-OWNER
Source paths: `/workspace/savi/gaps/netcode-optimization-gaps.md`, `/workspace/spoint/src/netcode/LagCompensator.js`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/INVENTORY.md`
Witness: command output `coverage gaps=26 open-items=5 owner-improvements=5`

### OPEN-025
Claim: spoint-side HELD-OWNER decisions remain with the owner, never resolved: GAP-bundle-freshness fix choice, 11 STALE PRD rows, spoint PRD items 2-4, four lost verdict files, and Wave C model browser.
Status: HELD-OWNER
Source paths: `/workspace/spoint/.gm/prd.yml`, `/workspace/jayzee/docs/PARITY.md`, `/workspace/spoint/package.json`
EPHEMERAL WITNESS POINTER (provenance, not a source): `/tmp/spoint-parity/GAPS.md`, `/tmp/spoint-parity/prd-matrix.json`, `/tmp/spoint-parity/INVENTORY.md`, `/tmp/spoint-parity/FAMILIES.md`, `/tmp/spoint-parity/parity-crossmap.json`
Witness: command output `held-owner spoint=5 jayzee=2 external=3 total=10 source-paths present=19/19`

### OPEN-026
Claim: jayzee-side HELD-OWNER decisions remain with the owner, never resolved: jayzee license/visibility and jayzee's 4 node:test suite deletions.
Status: HELD-OWNER
Source paths: `/workspace/jayzee/AGENTS.md`, `/workspace/jayzee/package.json`, `/workspace/jayzee/test/world.test.js`, `/workspace/jayzee/test/protocol.test.js`, `/workspace/jayzee/test/kernel.test.js`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `node:test current-suites=3 owner-deletions=4 files=kernel.test.js,oracle.js,protocol.test.js,world.test.js`

### OPEN-027
Claim: external HELD-OWNER decisions remain with the owner, never resolved: fx-19 push target, txiki.js shim-layer port, and Studio/text-job CDP Hunyuan session.
Status: HELD-OWNER
Detail: the gm row file under work/rows was removed by gm commit 03183ad ("close prd-mw698vaf1e27"); the durable closure pointer is `/workspace/gm/closes/prd-mw698vaf1e27.txt`, and `gm.prd_list status open` returned (none), per orchestrate's read-only check.
Source paths: `/workspace/gm/work/tooling-fix-units.json`, `/workspace/gm/closes/prd-mw698vaf1e27.txt`, `/workspace/thebird/ARCHITECTURE.md`, `/workspace/thebird/DESIGN.md`, `/workspace/hy3d/README.md`, `/workspace/hy4-relay/README.md`, `/workspace/spoint/scripts/lib/cdp-browser.mjs`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `held-owner spoint=5 jayzee=2 external=3 total=10 source-paths present=19/19`

### OPEN-028
Claim: owner directive requires 93 savi endpoints, 23 served skills, 68 Tome headings and 23 builtin modules; the local corpus reproduces only 21 builtin module names, so the owner's 23 is not reproducible locally and the delta stays open.
Status: UNVERIFIED
Source paths: `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/.spawn/reference/COVERAGE.md`, `/workspace/savi/.spawn/reference/engine-deep/api-b.md`, `/workspace/savi/.spawn/reference/engine/api-reference.md`, `/workspace/jayzee/docs/PARITY.md`
Witness: command output `reference-counts tome-headings=68 served-skills=23 builtin-module-names=21 owner-directive-builtin-modules=23`; `ls tome/sections | grep -c '^builtin-'` = 21 and `grep -c '| builtin/' engine-deep/api-b.md` = 21, the two sets match exactly; block-shape appears in 4 reference files but has no section or table row, so it is not a module and counting it gives 22; local count stays 21, owner 23 not reproducible locally.
Tag: required-in-jayzee

### OPEN-029
Claim: `value_not_found` is reproduced for two absent 64-hex hashes. Values and manifests both return 404 for the all-zero and all-f hashes, a scoped observation of two absent hashes and not a rule.
Status: OPEN
Source paths: `/workspace/savi/docs/FEATURESET.md`, `/workspace/spawn/maps/spawn-learning-record.md`
Witness: command output 2026-11-07: `GET https://play.spawn.co/world-store/values/<64 zeros>` and `<64 f>` each return 404 application/json 27 bytes `{"error":"value_not_found"}`; `GET .../manifests/<64 zeros>` and `<64 f>` each return 404 application/json 101 bytes `{"error":"value_not_found","hash":...}`. The present-hash 200 controls are spawn-reported in section 7 of its record and were not re-run here.
Tag: required-in-jayzee

### OPEN-030
Claim: The drifted-head case for world `41cd4649…` stays OPEN. Its head.json names manifest `3fa9a434…`, which returns 200 today, so the earlier 404 `unknown_world_store_key` for that manifest is NOT reproduced. The key is reproduced here only for a misspelled resource name under the same valid world (`head.jsn`). The selecting condition for the drifted head is not characterised, because the saved bodies hold only error text and no URL.
Status: OPEN
Source paths: `/workspace/savi/docs/FEATURESET.md`, `/workspace/spawn/maps/spawn-learning-record.md`
Witness: command output 2026-11-07: `GET https://play.spawn.co/world-store/manifests/3fa9a4345a66f3a4ed34d6b4a0169750fa9ac4f5951ce29e5af9d008d3a5f75a` returns 200 application/octet-stream 513116 bytes; `GET .../git/41cd46499614484ca9261ce32e257e22/head.json` returns 200 1673 bytes naming that manifest; `GET .../git/41cd46499614484ca9261ce32e257e22/head.jsn` returns 404 application/json 35 bytes `{"error":"unknown_world_store_key"}`.
Detail: the reproduction of `unknown_world_store_key` is the misspelled resource name `head.jsn` under the same world (404 35 bytes), with `head.json` as the control (200 1673 bytes). The drifted-head condition, for `manifests/3fa9a434…`, is not reproduced; this matches FINDINGS.md line 30.
Tag: required-in-jayzee

## Required feature support

Tag: required-in-jayzee

Jayzee must support the spawn boot chain head.json -> manifests/<hash> -> values/<sha>; file-map key escapes ~2f and ~3a; /cdn/value.<sha>.<ext> content-addressed GLBs with sha256, glTF magic, and HEAD 200 model/gltf-binary; 16-shard HEAD/Range probing with retry and idempotent aggregation; tolerance of 256 missing heads and transient ECONNRESET; bounded-offset feed enumeration with per-sort duplicates; address -> worldId/appId/creator resolution; creator profiles with no direct GLB URLs because models resolve from world state; world-store JSON values for scene, placement, terrain and UI versus binary assets on /cdn/; local store names and derivedGeometry shards:16; LOD format 1.3.0; and 93 savi endpoints, 23 served skills, 68 Tome headings and 23 builtin modules. Naming parity is not required. OPEN-028 records the builtin-module count delta.

Source paths: `/workspace/savi/spawn-engine/FEED_SCOPE.md`, `/workspace/spawn/maps/spawn-root-worlds-map.md`, `/workspace/savi/spawn-engine/ASSETS.md`, `/workspace/savi/spawn-engine/FAULTS.md`, `/workspace/spawn/maps/glb-urls-all.tsv`, `/workspace/savi/ENDPOINTS.md`, `/workspace/savi/.spawn/reference/COVERAGE.md`, `/workspace/savi/.spawn/reference/engine-deep/api-b.md`, `/workspace/savi/.spawn/reference/engine/api-reference.md`


Spawn learnings, witnessed in `docs/FEATURESET.md` with exact commands. Figures marked UNVERIFIED there are not claims of fact here.

- Spawnfile-family scan: 16 of 16 shards, 2,848 worlds, 0 refs, scoped to that set and not proof of universal absence (OPEN-007).
- `/cdn/` GLB family: 2,416 verified refs across 399 worlds and 2,355 unique sha256, each HEAD 200 `model/gltf-binary` with glTF magic. 2,416 is a LOWER BOUND for that family only (OPEN-006).
- Missing heads: 256 is the correct head404 count. The earlier 259 list over-counts by 3 head-present missing-manifest worlds (OPEN-011, OPEN-012).
- Non-CDN refs: 83 first-seen status 0, 81 resolved HEAD 200 on retry, 2 open (OPEN-013, OPEN-014).
- Endpoints: 93 = 39 published + 21 per-game or per-id + 3 disabled + 30 not in spec. HTTP doors: 70 = 17 exercised + 53 documented (REPRODUCED in FEATURESET.md).
- API types: 305 type files in `.spawn/reference/cli/types/`, plus 3 `_` meta files (308 files total). The live "308 types" claim needs a Bearer token and is UNVERIFIED (OPEN-002).
- Tome: 68 distinct headings across 69 index rows, with `World Queries` appearing twice. 21 local builtin modules against the owner's 23 (OPEN-028, UNVERIFIED).
- Reference index total of 208 is not reproduced: the tome bucket measures 75 files (73 `.md`), so the total is 207 or 209 depending on the rule (UNVERIFIED).
- Jayzee PARITY rows 6-10, 32 and 33 at `17ce428` are documented with durable spoint paths and line numbers in `docs/FEATURESET.md`, section "Stream 11". Their closure status is not verified here.
