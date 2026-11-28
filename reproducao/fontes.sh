#!/bin/sh
# Baixa os repositórios de terceiros listados em reproducao/fontes.txt, cada um no commit exato usado no
# trabalho, em $FONTES (padrão: dados/fontes). Rodar de novo só confere e volta ao commit.
#
#   sh reproducao/fontes.sh                 só o SCAz.js (o que a validação precisa)
#   sh reproducao/fontes.sh Newminerjs      um ou mais pelo nome
#   sh reproducao/fontes.sh --todas         todos
set -e
cd "$(dirname "$0")/.."
DADOS="${DADOS:-$PWD/dados}"
FONTES="${FONTES:-$DADOS/fontes}"
mkdir -p "$FONTES"

if [ $# -eq 0 ]; then set -- SCAz.js; fi
if [ "$1" = --todas ]; then set -- $(grep -v '^#' reproducao/fontes.txt | awk 'NF {print $1}'); fi

for nome in "$@"; do
    linha=$(grep -v '^#' reproducao/fontes.txt | awk -v n="$nome" '$1 == n')
    [ -n "$linha" ] || { echo "fonte desconhecida: $nome (veja reproducao/fontes.txt)" >&2; exit 2; }
    url=$(echo "$linha" | awk '{print $2}')
    commit=$(echo "$linha" | awk '{print $3}')
    destino="$FONTES/$nome"
    if [ ! -d "$destino/.git" ]; then
        git clone --quiet "$url" "$destino"
    fi
    git -C "$destino" cat-file -e "$commit^{commit}" 2>/dev/null || git -C "$destino" fetch --quiet origin
    git -C "$destino" -c advice.detachedHead=false checkout --quiet "$commit"
    [ "$(git -C "$destino" rev-parse HEAD)" = "$commit" ] || { echo "$nome: não consegui ir para $commit" >&2; exit 1; }
    echo "$nome @ $(echo "$commit" | cut -c1-7) -> $destino"
done
