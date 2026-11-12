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
| 2 | Execução isolada de um arquivo em contêiner | |
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
