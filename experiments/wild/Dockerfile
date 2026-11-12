# Imagem de execução da análise em merges reais (Fase 2). Contexto de build: a raiz do repositório.
#   docker build -f experiments/wild/Dockerfile -t jalangi2-wild .
# A mesma imagem faz a instalação das dependências do projeto (com rede, sem scripts) e a execução
# da análise (sem rede): quem decide é o runner, pelas opções de `docker run`.
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY src/ ./src/
COPY experiments/analyses ./experiments/analyses
COPY experiments/lib ./experiments/lib
COPY experiments/wild/lib/launcher.js ./experiments/wild/lib/launcher.js
USER node
