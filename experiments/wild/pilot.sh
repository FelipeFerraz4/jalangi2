#!/bin/sh
# Piloto da Fase 2: 3 projetos pequenos/médios (74 amostras), para decidir timeouts e política antes do lote.
# Reexecutável: reconstrói a imagem, roda e regrava resultados.csv / conflitos.csv.
#   sh experiments/wild/pilot.sh [nome-da-execucao]      (padrão: piloto)
set -e
cd "$(dirname "$0")/../.."
W="${WILD_HOME:-$HOME/Documentos/wild}"
RUN="${1:-piloto}"
docker build -q -f experiments/wild/Dockerfile -t jalangi2-wild .
node experiments/wild/run-wild.js --run "$RUN" --manifest "$W/dados/manifesto.csv" --maps "$W/dados/maps" \
    --repos "$W/repos" --out "$W/execucoes" \
    --project JakeChampion__fetch --project tj__commander.js --project caolan__async
