#!/bin/sh
# Refaz a coleta a partir do Newminerjs: mapas de linhas L/R de todos os merges e o manifesto (uma linha por
# arquivo alterado pelos dois lados, com a checagem de instrumentação). Grava em <EXECUCOES>/coleta, sem
# sobrescrever o que está publicado em dados/coleta; compare com: node reproducao/comparar.js coleta
set -e
cd "$(dirname "$0")/.."
caminho() { node -p "require('./experiments/lib/caminhos').$1"; }
N=$(caminho NEWMINERJS)
D="$(caminho EXECUCOES)/coleta"
[ -d "$N/versoes" ] || { echo "Newminerjs não encontrado em $N (rode: sh reproducao/fontes.sh Newminerjs)" >&2; exit 2; }
mkdir -p "$D"
node experiments/tools/line-map.js --versoes "$N/versoes" --out-dir "$D/maps"
node experiments/wild/build-manifest.js --dataset "$N" --maps "$D/maps" --out "$D"
echo "coleta refeita em $D"
