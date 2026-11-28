# Como reproduzir

Todas as análises rodam numa imagem Docker (`jalangi2-lab`, definida no `Dockerfile` da raiz) e são disparadas pelo `Makefile`. Não é preciso instalar Node, Python nem dependências.

## Requisitos

| | Validação e caminho rápido | Refazer do zero |
|---|---|---|
| Programas | Docker e `make` | Docker e `make` |
| Rede | para construir a imagem e baixar o SCAz.js | também para baixar o Newminerjs, clonar 38 projetos e instalar as dependências deles |
| Disco | ~1 GB (imagem) | mais ~3,5 GB (clones, cache do npm, Newminerjs) |
| Tempo | ~10 min | várias horas (o lote leva ~2h30 com 2 frentes) |

Testado em Linux (Debian 13, Docker 29). O `make lote` usa o Docker do host (monta `/var/run/docker.sock`); em outro sistema, ajuste `SOCK=<caminho do socket>`.

## Três níveis

### 1. Validação (~5 min): a análise está correta?

```bash
make imagem       # uma vez
make validacao
```

Roda, na ordem:

| Comando | O que valida | Resultado esperado |
|---|---|---|
| `experiments/run_validation.js` | 72 casos de OA do SCAz.js (Moraes et al.) e 13 testes de DF/CF do conflict-static-analysis (Santos et al.) | OA: 68 corretos, 3 erros de execução (programas traduzidos que quebram), 1 sem esperado. DF/CF: 12 corretos, 1 divergência intencional |
| `experiments/run_all_toys.js` | 33 programas pequenos, um por regra da análise | 33/33 executados |
| `experiments/run_translation_study.js` | Os mesmos casos nas traduções A (JSweet), B (JSweet + IA) e C (só IA) | Mesmo resultado nas três: DF/CF 11/12, confluência SVFA 5/6 |
| `experiments/wild/test-wild.js` | Autotestes da execução em lote | 27/27 |

O SCAz.js é baixado no commit usado (`reproducao/fontes.sh`) para `dados/fontes/`.

### 2. Caminho rápido (~5 min): os números do trabalho a partir do lote publicado

```bash
make reproduzir-rapido
```

Descompacta os dados publicados (`dados/`), roda as suítes (`experiments/results/dados/suites.json`) e gera a planilha `experiments/results/resultados.xlsx` com o funil, o lote, os conflitos, o cruzamento com o Newminerjs, as suítes e a aba da análise manual. O que estiver preenchido na aba *Conflitos sorteados* é mantido.

### 3. Do zero: refazer coleta, clones e lote

```bash
make fontes-coleta    # baixa o Newminerjs no commit usado (~100 MB)
make coleta           # mapas L/R e manifesto em dados/execucoes/coleta; compara com dados/coleta
make repos            # clona os 38 projetos em dados/repos e confere cada arquivo (2,4 GB)
make lote             # as 976 amostras em dados/execucoes/lote; compara com dados/lote
make casos            # pastas dos 29 casos (experiments/results/analise-manual/casos)
```

- **O lote é retomável:** rodar `make lote` de novo pula as amostras prontas. `Ctrl+C` encerra as frentes e os contêineres.
- **Teste rápido do lote:** `make lote LOTE=teste PROJETOS="rstacruz__nprogress"` roda só um projeto (3 amostras, ~1 min).
- **Outras opções:** `JOBS=<n>` (frentes paralelas, padrão 2) e `LOTE=<nome>` (pasta em `dados/execucoes/`).
- **Comparar:** `make comparar-lote` e `make comparar-coleta` mostram, amostra por amostra, o que mudou em relação ao publicado.

**Diferenças esperadas ao refazer o lote.** Os projetos são de 2010 a 2015 e as dependências são instaladas com `npm install` sem lockfile, então versões diferentes das usadas em 2026 podem mudar alguns resultados; suítes que estouram o tempo (180 s) também variam com a máquina. O `comparar-lote` mostra quais amostras mudaram e em quê.

**Isolamento.** Cada amostra roda num contêiner próprio (imagem `jalangi2-wild`, de `experiments/wild/Dockerfile`): instalação das dependências com rede e sem scripts (`--ignore-scripts`); execução sem rede, sem privilégios, com o projeto somente leitura e limites de memória e processos.

## Outros alvos

| Alvo | O que faz |
|---|---|
| `make dados` | Só descompacta `dados/coleta/maps.tar.gz` e `dados/lote/amostras.tar.gz` |
| `make fontes` | Só baixa o SCAz.js |
| `make suites` | Só regenera `experiments/results/dados/suites.json` |
| `make planilha` | Só regenera a planilha |
| `make teste` | Só os autotestes do lote |
| `make cruzamento ANALISE_LR=<arquivo>` | Refaz o cruzamento com a análise estática do Newminerjs. O `analise_left_right.xlsx` **não está publicado** no repositório do Newminerjs; o resultado já está em `dados/lote/` |
| `make limpar` | Apaga as pastas descompactadas (não toca nos dados publicados) |

## Pastas e variáveis

| Variável | Padrão | Para quê |
|---|---|---|
| `DADOS` | `dados/` | raiz de todos os dados |
| `REPOS` | `dados/repos` | clones dos projetos (por exemplo, para reaproveitar clones de outro lugar) |
| `EXECUCOES` | `dados/execucoes` | saída das execuções novas |
| `FONTES` | `dados/fontes` | repositórios de terceiros |
| `SCAZ`, `NEWMINERJS` | `dados/fontes/...` | clones do SCAz.js e do Newminerjs |

Pastas fora do repositório são montadas no contêiner no mesmo caminho. Exemplo, reaproveitando clones já feitos:

```bash
make lote REPOS=/caminho/para/repos
```

## Sem Docker

Com Node 20 e Python 3 com `openpyxl` instalados, os comandos dentro do `Makefile` podem ser rodados direto (por exemplo, `node experiments/run_validation.js`). Só o lote exige Docker, porque executa o código dos projetos isolado.
