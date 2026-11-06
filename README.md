# SAVI / DIRECT MANUAL

This repository is the source of a brutalist static manual. Every committed file is displayed directly: exact text, full binary hex dumps, exact raw copies, a complete file inventory, a withheld ledger, and the full commit history.

Every push runs .github/workflows/publish.yml. Pushes to main rebuild the site, run its completeness check, and deploy it through GitHub Pages. The index carries the current commit SHA and history, so every main push changes the published manual.

Raw HTTP bodies under .spawn/reference/http/raw/ are not committed or displayed because the source corpus flags them as containing personal fields. WITHHELD.json records their paths, sizes, and SHA-256 hashes. Fetched research snapshots under sources/ are also withheld because one contains JWT-shaped credentials.

## Build locally

    npm run build
    npm run check

The generated site is in site/. No npm packages are required.

## Published URL

https://anentrypoint.github.io/savi/
