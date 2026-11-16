#!/bin/sh
# Piloto da Fase 2: 15 projetos (Node e navegador, pequenos e grandes), para decidir política e timeouts antes do lote.
# Reexecutável e retomável: amostras já feitas são puladas; apague execucoes/<nome> para refazer tudo.
#   sh experiments/wild/pilot.sh [nome-da-execucao] [arquivo|testes]      (padrão: piloto, arquivo)
#   modo testes: roda a suíte de testes de cada projeto (timeout 300 s por amostra); modo arquivo: só carrega o arquivo (30 s)
# Saídas em <WILD_HOME>/execucoes/<nome>/: resultados.csv (uma linha por amostra), conflitos.csv, resumo_projetos.csv
set -e
cd "$(dirname "$0")/../.."
W="${WILD_HOME:-$HOME/Documentos/wild}"
RUN="${1:-piloto}"
MODE="${2:-arquivo}"
if [ "$MODE" = testes ]; then TIMEOUT=300; else TIMEOUT=30; fi
docker build -q -f experiments/wild/Dockerfile -t jalangi2-wild .
PROJECTS=""
for p in JakeChampion__fetch tj__commander.js caolan__async remy__nodemon request__request winstonjs__winston webtorrent__webtorrent \
         eslint__eslint Automattic__mongoose badges__shields standard__standard rstacruz__nprogress jashkenas__backbone goldfire__howler.js sampotts__plyr; do
    PROJECTS="$PROJECTS --project $p"
done
# shellcheck disable=SC2086
node experiments/wild/run-wild.js --run "$RUN" --manifest "$W/dados/manifesto.csv" --maps "$W/dados/maps" \
    --repos "$W/repos" --out "$W/execucoes" --mode "$MODE" --timeout "$TIMEOUT" $PROJECTS
