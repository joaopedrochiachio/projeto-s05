#!/usr/bin/env bash
# Monta o site do GitHub Pages: app Next (export estático) + vídeo interativo em /demo.
# uso: PAGES_BASE_PATH=/projeto-s05 bash scripts/montar-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."
: "${PAGES_BASE_PATH:=/projeto-s05}"
export PAGES_BASE_PATH
rm -rf out
npx next build
mkdir -p out/demo
cp -r video-demo/index.html video-demo/film.js video-demo/player.js video-demo/roteiro.json \
      video-demo/vo.json video-demo/NARRACAO.md video-demo/lib video-demo/app video-demo/audio out/demo/
touch out/.nojekyll
echo "site pronto em out/ ($(du -sh out | cut -f1))"
