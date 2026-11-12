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
| 1 | Clonagem em `repos/` e checkout por merge, conferido com o `merge.js` do pacote | |
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
