# Execução em merges reais (`wild`)

Ferramentas para executar a análise (OA, DF e CF) nos merges reais da coleta `Newminerjs` (Priscila Almeida, merges até 2015).

## Onde ficam os dados

Os dados e os clones ficam **fora do repositório e fora do vault**, em `~/Documentos/wild/`:

| Pasta | O que tem | Fase |
|---|---|---|
| `dados/` | mapas L/R e manifesto | 0 |
| `repos/` | um clone por projeto, **fixo e persistente** (não é cache descartável) | 1 |
| `execucoes/` | resultado de cada execução (JSON, saída, estado) | 2 e 3 |

## Plano

| Fase | O que faz | Estado |
|---|---|---|
| 0 | Insumos: mapas por merge, manifesto, teste de instrumentabilidade, correções da análise | **concluída** |
| 1 | Clonagem em `repos/` e conferência de cada arquivo contra o `merge.js` do pacote | **concluída** |
| 2 | Execução isolada de um arquivo em contêiner | **piloto feito** (3 projetos) |
| 3 | Execução em lote, retomável | |
| 4 | Agregação (funil) e inspeção manual das detecções | |

## Fase 0

```bash
# 1) mapa L/R de todos os merges da coleta (≈ 1 min)
node experiments/tools/line-map.js --versoes <Newminerjs>/versoes --out-dir ~/Documentos/wild/dados/maps

# 2) manifesto: uma linha por arquivo analisável (≈ alguns minutos, instrumenta cada arquivo)
node experiments/wild/build-manifest.js --dataset <Newminerjs> --maps ~/Documentos/wild/dados/maps --out ~/Documentos/wild/dados

node experiments/wild/test-wild.js      # autoteste
```

`manifesto.csv` traz, por arquivo: identificador da amostra, projeto, URL, SHAs (merge, ancestral e pais), data do merge, caminho, linhas de L e de R, o arquivo de mapa do merge e se o Jalangi2 consegue instrumentar o arquivo.

### Resultado na coleta Newminerjs

| | |
|---|---:|
| Arquivos analisáveis (com linhas de L e de R) | 976, em 845 merges e 38 projetos |
| Instrumentáveis | **893 (91,5%)**, em 791 merges e 37 projetos |
| Não instrumentáveis | 83: 29 módulos ES (`import`/`export`) e 54 com sintaxe mais nova |

As perdas se concentram: `highlight.js` (36) e `rollup` (30) respondem por 66 das 83.

### Instrumentável

`check-instrumentable.js` instrumenta o `merge.js` e **compila** a saída, sem executá-la. Pega a sintaxe que o Jalangi2 não suporta e que produz código instrumentado inválido (arrow functions, por exemplo). Ele **não** pega o que só falha ao executar (como `const` e `let`, pela zona morta temporal), então o número é um limite superior: um arquivo aprovado ainda pode falhar na execução.

## Fase 1

```bash
node experiments/wild/clone-repos.js --dataset <Newminerjs> --manifest ~/Documentos/wild/dados/manifesto.csv \
    --repos ~/Documentos/wild/repos --out ~/Documentos/wild/dados [--project <nome>]... [--jobs 4] [--update]
```

- Clona cada projeto **sem checkout** (`git clone --no-checkout`) em `repos/<projeto>`. Se o clone já existe, não baixa de novo (`--update` faz `fetch`). Nunca pede senha: repositório apagado ou privado vira falha registrada, sem travar o lote, e não deixa pasta pela metade.
- Para cada amostra, lê o arquivo no commit do merge direto do objeto git (`git cat-file`) e compara o SHA-256 com o `merge.js` do pacote. Não há `git checkout` nem execução de código do projeto.
- Saída em `dados/`: `checkout.csv` (um estado por amostra) e `checkout_resumo.json`. Estados: `ok`, `commit_ausente`, `arquivo_ausente`, `conteudo_diferente`, `repositorio_indisponivel`, `sem_merge_js_no_pacote`.
- A árvore de trabalho por merge (`git worktree`) fica para a Fase 2, quando for preciso instalar dependências, para não ocupar disco com 845 checkouts sem uso.

### Resultado

| | |
|---|---:|
| Projetos clonados | 38 de 38 (2,4 GB em `repos/`) |
| Arquivos conferidos | 976 |
| Idênticos ao `merge.js` do pacote (`ok`) | **976 (100%)** |

## Fase 2: execução isolada (piloto)

```bash
sh experiments/wild/pilot.sh [nome]     # reconstrói a imagem e roda o piloto: fetch, commander e async (74 amostras, ~6 min)
# qualquer outro recorte:
node experiments/wild/run-wild.js --run <nome> --manifest ~/Documentos/wild/dados/manifesto.csv --maps ~/Documentos/wild/dados/maps \
    --repos ~/Documentos/wild/repos --out ~/Documentos/wild/execucoes --project <projeto>... [--limit-merges N] [--timeout 60] [--force]
```

**Como roda.** Por merge: `git archive` do commit (sem checkout) → `npm install --ignore-scripts` em contêiner **com rede** → cada arquivo alterado roda em outro contêiner **sem rede** (`--network none`), com a pasta do projeto **somente leitura**, usuário comum, `--cap-drop ALL`, `no-new-privileges`, 1 GB, 1 CPU, 256 processos e 60 s. O ponto de entrada é o próprio arquivo alterado, como na Amanda. O lançador (`lib/launcher.js`) instrumenta só esse arquivo, não grava nada em disco e, no timeout, ainda deixa a análise gravar o relatório parcial.

**Saída** em `execucoes/<nome>/`: `resultados.csv` (uma linha por amostra) e `conflitos.csv` (uma linha por conflito, com as linhas de L, R e base), ambos com `;` e BOM para abrir no Excel. Por amostra, em `amostras/<id>/`: `meta.json`, `report.json` e `saida.txt`. É retomável: amostra com `meta.json` é pulada (`--force` refaz).

Estados de `execucao`: `ok`, `erro_execucao`, `timeout`, `erro_instrumentacao`, `morto_memoria_ou_tempo`, `sem_relatorio`, `sem_mapa`, `sem_checkout`, `nao_instrumentavel`. Um `erro_execucao` ainda traz o relatório do que rodou até o erro.

### Resultado do piloto

| Projeto | Amostras | Execução | OA / DF / CF |
|---|---:|---|---|
| tj/commander.js | 24 | 24 ok | 0 / 1 / 0 |
| caolan/async | 43 | 43 ok (instalação falhou em 13 merges, e rodou assim mesmo) | 0 / 0 / 0 |
| JakeChampion/fetch | 7 | 7 erro: código de navegador (`self`, `window`) | 0 / 0 / 0 |

- **Cobertura é o gargalo.** Rodar só o arquivo alterado executa pouco: a mediana de linhas de R executadas é 0%, e a de L, 5%. Uma biblioteca carregada sozinha só executa o código de topo, as funções ficam sem chamada. Poucos conflitos aparecem por isso, não porque faltem conflitos. Para subir a cobertura é preciso um ponto de entrada que exercite o código (os testes do projeto, a Fase 5 prevista).
- **Código de navegador** falha logo no início (`self`/`window`/DOM). Precisa de shim ou fica de fora.
- **Instalação:** média 4,5 s por merge, máximo 24 s. 13 merges do `async` falharam (`enoent`), sem efeito aqui porque o arquivo roda sem dependências.
- Nenhuma execução passou de 8 s, e nenhum contêiner ficou para trás.
