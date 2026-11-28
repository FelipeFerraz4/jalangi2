# ==============================================================================
# Ambiente para reproduzir todas as análises do trabalho (use pelo Makefile: make ajuda)
# ==============================================================================
# Uma imagem para tudo, menos a execução de cada amostra do lote, que roda na imagem isolada de
# experiments/wild/Dockerfile (sem rede, sem privilégios). O código e os dados NÃO são copiados: o
# Makefile monta o repositório no mesmo caminho do host, para que o lote (que cria contêineres pelo
# Docker do host) passe caminhos válidos dos dois lados.
#
#   node 20 + npm ci      Jalangi2 e as análises
#   python3 + openpyxl    planilha de resultados (experiments/results/gerar_planilha.py)
#   git, unzip            mapas de linhas (git diff), clones dos projetos, leitura de .xlsx
#   docker-cli            o lote cria um contêiner por amostra
#   bash, make            scripts de teste dos projetos e o próprio Makefile
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

RUN apk add --no-cache python3 py3-openpyxl git unzip bash make docker-cli

# Dependências do Jalangi2 ficam fora da pasta montada, em /opt/jalangi2, e são achadas pelo NODE_PATH
WORKDIR /opt/jalangi2
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
ENV NODE_PATH=/opt/jalangi2/node_modules

# O git reclama de repositórios de outro dono (a pasta montada é do usuário do host)
RUN git config --system --add safe.directory '*'

WORKDIR /trabalho
CMD ["make", "ajuda"]
