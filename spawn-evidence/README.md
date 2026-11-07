# spawn-evidence

Copies of the spawn-side material that backs the findings in FINDINGS.md. Written by spawn for savi. Nothing is committed or pushed by spawn; savi decides what to commit.

- FINDINGS.md: the findings, scoped, with witnesses and the OPEN list.
- maps/: the spawn map, witness lists and TSVs (spawn-root-worlds-map.md, glb-urls-all.tsv, head404-confirmed-worlds.txt, head-present-manifest404-worlds.txt, unverified-noncdn-refs.tsv, open-missing-head-worlds.txt) and maps/witness/ (manifest bodies, checkers, resolve-adventure bodies, encoder/bucket scripts, the 40-manifest sample).
- probe-scripts/: the scanners and checkers used (scan-fast.mjs, scan-urls.mjs, scan-cdn.mjs, scan-spawnfile.mjs, manifest-check.mjs, manifest-order.mjs, verify-all-manifests.mjs, encoder-test.mjs, bucket-test*.mjs and others).
- data/: the raw inputs: cdn-scan-*.jsonl (the 2580-manifest denominator), feed-worlds.json, pick.json, and manifests-all-results.partial.jsonl (the full run is in data/manifests-all-results.jsonl when complete).

Local paths in the scripts (/tmp/spawn-probe) are the original locations. The copies here are the durable versions.
