# Savi Manual

A static manual built from this repository. Every committed file is shown as exact text, or as a hex dump when binary, with a raw copy and a commit history.

Every push to main runs .github/workflows/publish.yml, which rebuilds the site, checks it, and deploys it to GitHub Pages.

Some files are not published and are left out of the build.

## Build locally

    npm run build
    npm run endpoints
    npm run check

The generated site is in site/. No npm packages are required.

## Published URL

https://anentrypoint.github.io/savi/
