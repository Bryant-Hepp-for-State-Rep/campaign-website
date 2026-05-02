#!/usr/bin/env bash
# Build script for Cloudflare Pages.
#
# Pipeline:
#   1. Install npm deps (Eleventy + js-yaml + gray-matter + markdown-it).
#   2. Run Eleventy: reads src/ templates and content/ data, produces _site/.
#   3. Rename _site/ → dist/ for the CF Pages output convention.
#
# Cloudflare Pages config:
#   Build command:        bash build.sh
#   Build output dir:     dist
#   Root directory:       /
#
# Excluded from the public deploy:
#   - design-drafts/archive/  (the deselected layout explorations) —
#     not in the Eleventy passthrough, so it never reaches dist/.
#   - docs/                   (gitignored, never in the repo CF clones).

set -euo pipefail
cd "$(dirname "$0")"

rm -rf _site dist

# Install deps if missing. CF Pages caches node_modules between builds.
if [ ! -d node_modules ]; then
  npm install
fi

npx @11ty/eleventy

mv _site dist

echo "Built dist/ — $(find dist -type f | wc -l | tr -d ' ') files"
