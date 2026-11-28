# Dados

Os dados que o trabalho usou e produziu. O que está **publicado** (versionado) permite regenerar a planilha e as pastas dos casos sem rodar o lote; o resto é baixado ou gerado pelos alvos do `Makefile` e não é versionado.

Cada pasta pode ser trocada por uma variável de ambiente (lida por `experiments/lib/caminhos.js` e pelo `Makefile`).

| Pasta | Variável | Versionado? | O que tem |
|---|---|---|---|
| `coleta/` | | **sim** | Insumos do lote, a partir da coleta Newminerjs (veja abaixo). |
| `lote/` | | **sim** | O resultado do lote usado no trabalho (veja abaixo). |
| `repos/` | `REPOS` | não (2,4 GB) | Um clone de cada um dos 38 projetos, feito por `make repos`. |
| `execucoes/` | `EXECUCOES` | não | Execuções novas: `make lote` grava em `execucoes/lote/` (ou `execucoes/<LOTE>/`), `make coleta` em `execucoes/coleta/`, e o cache do npm fica em `execucoes/npm-cache/`. |
| `fontes/` | `FONTES` | não | Repositórios de terceiros nos commits usados (`reproducao/fontes.txt`), baixados por `reproducao/fontes.sh`. |

A raiz inteira pode ser trocada com `DADOS=<pasta>`.

## `coleta/`

| Arquivo | O que é |
|---|---|
| `manifesto.csv` | Uma linha por arquivo alterado pelos dois lados de um merge (976 amostras): identificador, projeto, URL, SHAs (merge, ancestral, Left, Right), caminho, linhas de L e de R, se o Jalangi2 consegue instrumentar e, se não, o erro. Gerado por `experiments/wild/build-manifest.js`. |
| `manifesto_resumo.json` | Contagens do manifesto. |
| `checkout.csv`, `checkout_resumo.json` | Conferência dos clones: para cada amostra, se o arquivo no commit do merge é idêntico ao do pacote do Newminerjs (976 de 976). Gerado por `experiments/wild/clone-repos.js`. |
| `newminerjs_resumo.json` | Cópia do `dataset/resumo.json` do Newminerjs (commit em `reproducao/fontes.txt`): os números do funil da coleta, usados na aba *Funil* da planilha. |
| `maps.tar.gz` | Mapas de linhas L/R: para cada merge, quais linhas do arquivo integrado vieram do Left e quais do Right (`maps/por-merge/<projeto>__<merge>.json`). Gerados por `experiments/tools/line-map.js`. `make dados` descompacta em `coleta/maps/`. |

## `lote/`

O lote do trabalho: 976 amostras, modo híbrido (arquivo e testes do projeto), executado em novembro de 2026, já com a correção do shebang (veja `experiments/wild/README.md`).

| Arquivo | O que é |
|---|---|
| `resultados.csv` | Uma linha por amostra: instalação, execução, erro e sua categoria, modo, OA/DF/CF, linhas de L e R executadas. Separador `;`, com BOM (abre no Excel). |
| `conflitos.csv` | Um registro por conflito (384): tipo, natureza (direto ou transitivo), linhas de L, R e base, estado envolvido. |
| `resumo_projetos.csv`, `resumo.json` | Totais por projeto e do lote. |
| `cruzamento_newminerjs.csv`, `tabela_mesma_funcao.csv` | Cruzamento com a análise estática do Newminerjs ("Left e Right alteraram a mesma função?"), feito por `experiments/wild/cross-newminerjs.js`. |
| `amostras.tar.gz` | Por amostra: `meta.json` (estado da execução), `report.json` (relatório da análise: conflitos com pilha de chamadas, cobertura) e as saídas (`saida*.txt`), dos modos arquivo e testes. `make dados` descompacta em `lote/amostras/`. |

Para comparar um lote refeito com este: `make comparar-lote` (ou `node reproducao/comparar.js lote dados/execucoes/<nome>`).

## Origem e licença

A coleta de merges é o **Newminerjs** (Priscila Almeida, 2026), que traz suas próprias condições de uso (`DIREITOS_E_LICENCAS.md` no repositório dela). Os arquivos de código dos projetos não estão aqui; os mapas e o manifesto trazem só números de linha, SHAs e caminhos. Veja `documentacao/FONTES_E_LICENCAS.md`.
