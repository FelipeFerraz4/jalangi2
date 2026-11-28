#!/bin/sh
# Descompacta os dados publicados no repositório para as pastas que os scripts usam:
#   dados/coleta/maps.tar.gz    -> dados/coleta/maps/      (mapas de linhas L/R de cada merge)
#   dados/lote/amostras.tar.gz  -> dados/lote/amostras/    (meta.json, report.json e saídas de cada amostra do lote)
# As pastas descompactadas não são versionadas. Rodar de novo não faz nada se já estiverem lá.
set -e
cd "$(dirname "$0")/.."
DADOS="${DADOS:-$PWD/dados}"

descompactar() {
    arquivo="$1"; pasta="$2"
    if [ -d "$pasta" ]; then echo "já existe: $pasta"; return; fi
    tar -C "$(dirname "$pasta")" -xzf "$arquivo"
    echo "descompactado: $pasta"
}
descompactar "$DADOS/coleta/maps.tar.gz" "$DADOS/coleta/maps"
descompactar "$DADOS/lote/amostras.tar.gz" "$DADOS/lote/amostras"
