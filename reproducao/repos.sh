#!/bin/sh
# Clona os 38 projetos do manifesto em REPOS (padrão dados/repos, 2,4 GB) e confere, para cada amostra, que o
# arquivo no commit do merge é idêntico ao do pacote do Newminerjs. Retomável: clones existentes não são
# baixados de novo. A conferência fica em <EXECUCOES>/checkout.csv (compare com dados/coleta/checkout.csv).
set -e
cd "$(dirname "$0")/.."
caminho() { node -p "require('./experiments/lib/caminhos').$1"; }
N=$(caminho NEWMINERJS)
[ -d "$N/versoes" ] || { echo "Newminerjs não encontrado em $N (rode: sh reproducao/fontes.sh Newminerjs)" >&2; exit 2; }
mkdir -p "$(caminho EXECUCOES)"
node experiments/wild/clone-repos.js --dataset "$N" --manifest "$(caminho MANIFESTO)" --repos "$(caminho REPOS)" --out "$(caminho EXECUCOES)" "$@"
