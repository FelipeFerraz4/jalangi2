# ==============================================================================
# DOCKERFILE: AMBIENTE REPRODUZÍVEL PARA JALANGI2 + ANÁLISE DE DATA FLOW
# ==============================================================================
# Usa a imagem node:20-alpine (já disponível localmente no ambiente)
FROM node:20-alpine

# Instala ferramentas básicas caso precise rodar scripts auxiliares
RUN apk add --no-cache python3 make g++ git || true

WORKDIR /app

# Copia e instala dependências do Node.js
COPY package.json ./
RUN npm install --ignore-scripts || true

# Copia código-fonte e scripts de análise
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY experiments/ ./experiments/

# Padrão: Executa a bateria de testes toy de Data Flow
CMD ["node", "experiments/run_all_toys.js"]
