#!/usr/bin/env bash
# Monta o site em _site e coloca junto o instalador mais novo, já conferido.
set -euo pipefail
U=https://github.com/jenifermirandasilvasantana-tech/video-facil-updates/releases/latest/download
rm -rf _site && mkdir -p _site/baixar
git archive HEAD | tar -x -C _site
rm -rf _site/.github _site/.gitignore
cd _site/baixar
curl -fsSL --retry 5 -o Instalador-Video-Facil.exe "$U/Instalador-Video-Facil.exe"
curl -fsSL --retry 5 -o soma "$U/Instalador-Video-Facil.exe.sha256"
esperado=$(grep -oiE '[0-9a-f]{64}' soma | head -1 | tr 'A-F' 'a-f')
real=$(sha256sum Instalador-Video-Facil.exe | cut -d' ' -f1)
rm soma
[ -n "$esperado" ] && [ "$esperado" = "$real" ] || { echo "Instalador não confere"; exit 1; }
echo "Instalador conferido: $real"
