# Execução em merges reais (`wild`)

Ferramentas para executar a análise (OA, DF e CF) nos merges reais da coleta `Newminerjs` (Priscila Almeida, merges até 2015).

## Onde ficam os dados

Tudo fica na pasta `dados/` do repositório (descrita em [`dados/README.md`](../../dados/README.md)); cada pasta pode ser trocada por variável de ambiente (`experiments/lib/caminhos.js`). O jeito recomendado de rodar cada fase é o `Makefile` da raiz (veja [`documentacao/REPRODUCAO.md`](../../documentacao/REPRODUCAO.md)); os comandos abaixo são o que ele chama.

| Pasta | O que tem | Fase | Versionado? |
|---|---|---|---|
| `dados/coleta/` | manifesto, conferência dos clones e mapas L/R (`maps.tar.gz`) | 0 e 1 | sim |
| `dados/lote/` | o lote usado no trabalho: CSVs e as amostras (`amostras.tar.gz`) | 3 | sim |
| `dados/repos/` (`REPOS`) | um clone por projeto, **fixo e persistente** (não é cache descartável) | 1 | não (2,4 GB) |
| `dados/execucoes/` (`EXECUCOES`) | execuções novas (JSON, saída, estado) e o cache do npm | 2 e 3 | não |
| `dados/fontes/` (`NEWMINERJS`) | o Newminerjs, baixado por `reproducao/fontes.sh Newminerjs` | 0 e 1 | não |

## Plano

| Fase | O que faz | Estado |
|---|---|---|
| 0 | Insumos: mapas por merge, manifesto, teste de instrumentabilidade, correções da análise | **concluída** |
| 1 | Clonagem em `repos/` e conferência de cada arquivo contra o `merge.js` do pacote | **concluída** |
| 2 | Execução isolada de um arquivo em contêiner | **concluída** (modos arquivo, testes e híbrido) |
| 3 | Execução em lote, retomável | **concluída** (976 amostras, modo híbrido) |
| 4 | Agregação (funil) e inspeção manual das detecções | agregação e cruzamento com o Newminerjs feitos; inspeção dos 29 casos pendente |

## Fase 0

```bash
# 1) mapa L/R de todos os merges da coleta (≈ 1 min)
node experiments/tools/line-map.js --versoes dados/fontes/Newminerjs/versoes --out-dir dados/execucoes/coleta/maps     # make coleta

# 2) manifesto: uma linha por arquivo analisável (≈ alguns minutos, instrumenta cada arquivo)
node experiments/wild/build-manifest.js --dataset dados/fontes/Newminerjs --maps dados/execucoes/coleta/maps --out dados/execucoes/coleta

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
node experiments/wild/clone-repos.js --dataset dados/fontes/Newminerjs --manifest dados/coleta/manifesto.csv \
    --repos dados/repos --out dados/execucoes [--project <nome>]... [--jobs 4] [--update]     # make repos
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
sh experiments/wild/pilot.sh [nome]     # reconstrói a imagem e roda o piloto de 15 projetos (404 amostras)
# qualquer outro recorte:
node experiments/wild/run-wild.js --run <nome> --manifest dados/coleta/manifesto.csv --maps dados/coleta/maps \
    --repos dados/repos --out dados/execucoes --project <projeto>... [--limit-merges N] [--timeout 60] [--force]
# só regravar os CSVs a partir de amostras/ (sem executar nada): acrescente --consolidate-only
```

**Como roda.** Por merge: `git archive` do commit (sem checkout) → `npm install --ignore-scripts` em contêiner **com rede** → cada arquivo alterado roda em outro contêiner **sem rede** (`--network none`), com a pasta do projeto **somente leitura**, usuário comum, `--cap-drop ALL`, `no-new-privileges`, 1 GB, 1 CPU, 256 processos e 60 s. O ponto de entrada é o próprio arquivo alterado, como na Amanda. O lançador (`lib/launcher.js`) instrumenta só esse arquivo, não grava nada em disco e, no timeout, ainda deixa a análise gravar o relatório parcial.

**Saída** em `execucoes/<nome>/`: `resultados.csv` (uma linha por amostra), `conflitos.csv` (uma linha por conflito, com as linhas de L, R e base) e `resumo_projetos.csv` (uma linha por projeto e um TOTAL: estados, falhas por origem, conflitos e cobertura mediana), todos com `;` e BOM para abrir no Excel. Por amostra, em `amostras/<id>/`: `meta.json`, `report.json` e `saida.txt`. É retomável: amostra com `meta.json` é pulada (`--force` refaz).

Estados de `execucao`: `ok`, `erro_execucao`, `timeout`, `erro_instrumentacao`, `morto_memoria_ou_tempo`, `sem_relatorio`, `sem_mapa`, `sem_checkout`, `nao_instrumentavel`. Um `erro_execucao` ainda traz o relatório do que rodou até o erro.

Toda amostra que não terminou `ok` ganha `categoria_erro` e `origem_erro`, calculadas do `saida.txt` (`errorCategory` em `lib/results.js`):

| Origem | Categorias |
|---|---|
| `ambiente` | `dependencia_ausente`, `modulo_nativo` (binário não compilado por causa do `--ignore-scripts`), `api_navegador` (`window`, `self`, `Audio`...), `global_ausente` (espera um global de `<script>`, como `_`), `somente_leitura`, `node_incompativel`, `tempo_esgotado`, `memoria_ou_tempo`, `sem_mapa`, `sem_checkout` |
| `projeto` | `codigo_invalido` (sintaxe ou `package.json` inválidos no commit do merge), `erro_do_programa` (exceção lançada no código do projeto) |
| `ferramenta` | `instrumentacao` (o Jalangi2 não aceita a sintaxe), `possivel_jalangi` (a exceção nasce no código do Jalangi2 ou da análise), `sem_relatorio` |

Para atribuir uma exceção, vale o primeiro quadro da pilha fora de `src/js/runtime/analysis.js`: as funções dali (`G`, `M`, `callFun`...) só executam operações do próprio programa. Por isso "Function.prototype.apply was called on undefined" em `callFun` é o "x is not a function" do programa (no nodemon, `util.error`, removido do Node 12).

### Modo testes (`--mode testes`)

Para subir a cobertura, o ponto de entrada passa a ser a suíte de testes do projeto (`sh experiments/wild/pilot.sh piloto-testes testes`).

- **Comando** (`lib/test-command.js`): o `scripts.test` do `package.json`, quebrado nos `&&`, sem os passos de lint/estilo (`lint`, `standard`, `jshint`...) e de navegador (`karma`, `phantomjs`, `zuul`...), com o resto unido por `;` para um passo com teste falhando não impedir os seguintes. Sem nada utilizável, a amostra fica `sem_testes`.
- **Qualquer runner** (make, npm, mocha, nodeunit, tape, vows, scripts próprios): `lib/run-tests.js` roda o comando com `NODE_OPTIONS=--require lib/hook.js`, então **todo processo Node** que a suíte cria carrega o Jalangi2 e instrumenta só o alvo. Cada processo que carregou o alvo grava o próprio relatório, e no fim eles são unidos (`experiments/tools/merge-reports.js`). Conflitos entre processos diferentes não são vistos.
- **Saída silenciosa**: `ANALYSIS_QUIET=1` cala as mensagens da análise, porque suítes leem o stdout de processos filhos (TAP, asserções sobre a saída). O relatório JSON continua.
- **Timeout** (300 s por padrão): TERM ao grupo de processos inteiro, e cada processo grava o relatório parcial.
- **Contêiner**: ainda sem rede, usuário comum e sem capabilities, mas a pasta do projeto fica **gravável** (os testes escrevem nela; é uma cópia descartável), com 2 GB, 2 CPUs e 512 processos.
- **Estados**: testes falhando não são falha nossa. `ok` quando algum processo carregou o alvo (o código da suíte vai em `testes_codigo_saida` e o número de processos em `processos_com_alvo`); `alvo_nao_carregado` quando a suíte rodou sem passar pelo arquivo (categoria `testes_nao_carregam_alvo`, ou a falha de ambiente que a explica); `sem_testes`.

Primeiro teste (3 amostras do commander): a de `index.js` com 180 linhas de L foi de 19 para 98 linhas de L executadas, e de 1 para 7 conflitos. A falha de testes nessa amostra é do próprio projeto: a suíte falha igual sem o hook.

### Modo híbrido (`--mode hibrido`) e lote completo

O piloto em modo testes mostrou que os testes sobem muito a cobertura onde o projeto tem suíte em Node (request: de 4 para 30 amostras com L e R executados; commander: de 6 para 19; nodemon: de 5 para 15), mas 121 das 404 amostras não têm testes utilizáveis e 125 rodaram a suíte sem carregar o arquivo. Nesses casos, só carregar o arquivo ainda executa alguma coisa. O modo híbrido junta os dois:

- por merge, primeiro o **modo arquivo** em todas as amostras (pasta intacta, somente leitura), depois a **suíte de testes**;
- fica o relatório dos testes quando eles carregaram o alvo (`ok`, ou `timeout` com relatório parcial), senão o do arquivo (`chooseHybrid`);
- os dois relatórios ficam na pasta da amostra (`report_arquivo.json`, `report_testes.json`, `saida_*.txt`), e o `resultados.csv` traz `modo` (o escolhido), `estado_arquivo` e `estado_testes`.

Estimativa a partir dos dois pilotos: 121 amostras com L e R executados, contra 50 só com o arquivo e 95 só com os testes.

**Lote completo** (976 amostras, 38 projetos), em frentes paralelas que repartem os projetos pelo número de amostras:

```bash
node experiments/wild/run-batch.js --run lote --jobs 2      # híbrido, testes com 180 s por amostra; retomável
```

Logs em `execucoes/<run>.frente-<k>.log`; no fim, os CSVs de `execucoes/<run>/` juntam todas as frentes. Ctrl+C encerra as frentes e os contêineres; rodar de novo retoma.

### Inspeção dos conflitos do piloto em modo testes

Os 386 conflitos do piloto em modo testes vieram de 23 amostras, e 5 delas tinham 314. Lendo os diffs dessas 5:

- **Bug do Jalangi2 no `for...in` (corrigido; respondia por 50 dos 386 conflitos, e por todos os 40 de uma amostra do winston em que nenhuma linha de L executava).** A escrita da variável do laço (`for (var i in obj)`) recebia a posição do laço inteiro, corpo incluído, e herdava a branch de uma linha do corpo. Toda leitura de `i` no corpo por uma linha da outra branch virava DF falso. Corrigido em `src/js/instrument/esnstrument.js` (`wrapForIn`: a posição é a do lado esquerdo), com teste de regressão em `test-wild.js`.
- **Mudanças que preservam o valor.** Refatorações como `this` → `var self = this` (request `main.js`) ou `optional('https')` → `require('https')` (request `request.js`) fazem a linha pertencer à branch, mas não mudam o valor. Pela definição, toda leitura desse valor pela outra branch é DF ou CF; na prática não são interferência. A análise não distingue esse caso.
- **Interação plausível.** commander `lib/commander.js`: as duas branches implementaram o tratamento de opções desconhecidas, e o `unknown` que a L passa a repassar é lido pelo `unknown = unknown || []` da R. winston `common.js` (`d5e6297f`): a L muda o que entra em `meta` (erros deixam de ser clonados, `decycle`) e a R muda como `meta` é impresso (`prettyPrint` como função).
- **Contagem inflada.** Um mesmo par de alterações gera dezenas de registros, um por par de linhas e por caminho transitivo, repetidos ao longo da suíte. Para comparar amostras, vale mais "a amostra tem conflito" e o número de linhas L e R distintas do que o total de registros.

### Resultado do lote completo

976 amostras (845 merges, 38 projetos), modo híbrido, 2 frentes, cerca de 2 h 20 min (`run-batch.js --run lote --jobs 2`).

| Execução | Amostras |
|---|---:|
| `ok` | 323 (145 pelo relatório dos testes, 178 pelo do arquivo) |
| `erro_execucao` | 551 |
| `nao_instrumentavel` | 83 |
| `timeout` | 12 |
| `sem_relatorio` | 7 |

Falhas por origem: **ambiente 548** (código de navegador 232, global ausente 180, dependência ausente 71, módulo nativo 51, tempo esgotado 12, outras 2), **ferramenta 84** (83 não instrumentáveis pelo parser ES5, 1 possível erro do Jalangi2) e **projeto 21**. Os testes do projeto: 419 amostras sem `scripts.test` utilizável, 276 com suíte que não carrega o alvo, 145 que carregam.

- **412** amostras executaram linhas de pelo menos um lado; **159** executaram linhas de L e de R.
- **29 amostras com conflito**, em 28 merges e 10 projetos (request 9, commander 6; ace, eslint, jsPDF, vimium, nodemon e winston 2 cada; nprogress e webtorrent 1). Os testes respondem por 23 delas.

| Tipo | Registros | Amostras | Projetos |
|---|---:|---:|---:|
| DF | 316 (176 via parâmetro) | 27 | 10 |
| CF | 67 | 6 | 2 |
| OA | 1 | 1 | 1 |

4 amostras têm DF e CF. Os registros são inflados (um laço repete o mesmo par de linhas; o request sozinho tem 58 de CF), então a medida de comparação é o número de amostras.

**Correção do shebang (21/11/2026).** O Jalangi2 apagava a linha `#!` antes de instrumentar, e todas as posições desses arquivos subiam uma linha. As 21 amostras afetadas (`nodemon.js`, `bin/cmd.js`) foram reexecutadas com a correção (os resultados antigos estão em `execucoes/lote-antes-correcao-shebang/`): o CF de uma amostra do nodemon sumiu (apontava para uma linha em branco) e outra amostra do nodemon passou a ter 10 DF. Os números acima já são os corrigidos; o total continua 29 amostras com conflito.

### Cruzamento com a análise estática do Newminerjs

O Newminerjs traz `analise_left_right.xlsx`, uma análise estática (sem executar nada) que diz, por cenário, se Left e Right alteraram **a mesma função** (comparação de tokens, Acorn). Os IDs são os mesmos do manifesto: as 976 amostras do lote estão entre os 1.283 cenários da planilha (os outros 307 não têm linhas de L e de R no merge).

```bash
node experiments/wild/cross-newminerjs.js <analise_left_right.xlsx> dados/lote          # ; com BOM (Excel)
node experiments/wild/cross-newminerjs.js <analise_left_right.xlsx> dados/lote --sep ,  # Google Sheets
```

Grava `cruzamento_newminerjs.csv` (uma linha por amostra, com OA/DF/CF ao lado da classificação estática, das funções em comum e do link do merge) e `tabela_mesma_funcao.csv`:

| Mesma função? | Amostras | Executaram L e R | Com conflito | Taxa |
|---|---:|---:|---:|---:|
| Sim | 363 | 67 | 15 | 22,4% |
| Não | 301 | 51 | 7 | 13,7% |
| Inconclusivo | 312 | 41 | 7 | 17,1% |
| **Total** | 976 | 159 | 29 | 18,2% |

- Alterar a mesma função aumenta a chance de conflito, mas não decide: 78% dos casos "Sim" que executaram os dois lados não têm conflito.
- **7 dos 29 conflitos são entre funções diferentes** (por exemplo commander `index.js`, 9 DF; winston `transports/file.js`, 8 CF), e outros 7 são inconclusivos estaticamente. Um filtro estático por "mesma função" perderia ao menos um quarto das detecções: é a interferência interprocedural, por chamadas e estado compartilhado, que a análise dinâmica vê.
- Para a inspeção manual: os 15 "Sim + conflito" são os candidatos mais fortes a interferência real; os 7 "Não + conflito" são interferência indireta real ou falso positivo, e são os que mais precisam ser conferidos.

### Primeiro piloto (modo arquivo, 3 projetos)

| Projeto | Amostras | Execução | OA / DF / CF |
|---|---:|---|---|
| tj/commander.js | 24 | 24 ok | 0 / 1 / 0 |
| caolan/async | 43 | 43 ok (instalação falhou em 13 merges, e rodou assim mesmo) | 0 / 0 / 0 |
| JakeChampion/fetch | 7 | 7 erro: código de navegador (`self`, `window`) | 0 / 0 / 0 |

- **Cobertura é o gargalo.** Rodar só o arquivo alterado executa pouco: a mediana de linhas de R executadas é 0%, e a de L, 5%. Uma biblioteca carregada sozinha só executa o código de topo, as funções ficam sem chamada. Poucos conflitos aparecem por isso, não porque faltem conflitos. Para subir a cobertura é preciso um ponto de entrada que exercite o código (os testes do projeto, a Fase 5 prevista).
- **Código de navegador** falha logo no início (`self`/`window`/DOM). Precisa de shim ou fica de fora.
- **Instalação:** média 4,5 s por merge, máximo 24 s. 13 merges do `async` falharam (`enoent`), sem efeito aqui porque o arquivo roda sem dependências.
- Nenhuma execução passou de 8 s, e nenhum contêiner ficou para trás.
