# 🧪 Experimentos: Análise Dinâmica de OA, Data Flow e Confluence Flow (Jalangi2)

Este diretório contém a análise dinâmica de conflitos semânticos de **Overriding Assignment (OA)**, **Data Flow (DF)** e **Confluence Flow (CF)** implementada sobre o **Jalangi2**, os programas sintéticos (*toys*) usados para validá-la e os runners que executam tudo em lote. A ferramenta roda **uma única vez** por programa e reporta os três tipos de interferência juntos: OA, Data Flow (DF) e Confluence Flow (CF).

```bash
node experiments/run_validation.js     # OA (72 casos do SCAz.js) + DF/CF (13 testes) em uma execução
```

```
experiments/
├── analyses/
│   └── analysis_dataflow.js   # OA + Data Flow + Confluence Flow (motor estendido)
├── toys/                      # 29 programas sintéticos (o 29 tem um módulo em toys/29_lib/), numerados na ordem em que run_all_toys.js os executa
├── lib/analysis.js            # executa a análise sobre um arquivo (usado pelos runners); devolve o relatório JSON
├── lib/report.js              # formato, contagens e cobertura do relatório JSON (motor e merge-reports)
├── tools/line-map.js          # gerador do mapa L/R de um merge a partir de base/left/right/merge
├── tools/test-line-map.js     # autoteste do gerador (cenários sintéticos)
├── tools/merge-reports.js     # une os relatórios JSON de várias execuções do mesmo merge
├── tools/test-reports.js      # autoteste do relatório JSON e da união
├── run_validation.js          # tudo junto: OA do SCAz.js + DF/CF dos testes do conflict-static-analysis
├── run_all_toys.js            # runner: instrumenta cada toy e imprime o relatório consolidado
├── run_oa_suite.js            # regressão de OA com os casos de teste do SCAz.js (Moraes et al.)
├── run_df_cf_suite.js         # validação de DF e CF com os testes do conflict-static-analysis
└── df_samples/                # samples de DF traduzidas (JSweet, convertidas para ES5); veja o README da pasta
```

---

## ⚙️ Como a análise funciona

O script analisado é o código **integrado (merge)**. Para saber quem produziu cada linha, a análise recebe um **mapa de branches** (quais linhas foram alteradas por `L` e por `R`). Toda linha fora do mapa é considerada **Base**.

### Mapa de branches
A análise não conhece nenhum arquivo; o mapa é sempre injetado de fora. Ordem de precedência:

| Fonte | Uso |
|---|---|
| `BRANCH_MAP` | JSON inline: `BRANCH_MAP='{"L":[4],"R":[6,7]}'` |
| `BRANCH_MAP_FILE` | Caminho de um arquivo JSON (qualquer um dos dois formatos abaixo) |
| `J$.mergeAnalysis.setBranches(map)` | Configuração programática (reinicia o estado). `J$.analysis` não serve para isso: no modo encadeado, ele devolve o `ChainedAnalyses` |

Formatos aceitos para as linhas de um arquivo: `{"L":[4],"R":[6,7]}` ou o do SCAz.js, `{"4":"L","6":"R","7":"R"}`. Sem mapa, nenhuma linha pertence a `L` ou `R` e nada é detectado.

**Um arquivo só (mapa sem arquivo):** o mapa vale apenas para o script principal, o que foi passado ao Jalangi2. Os módulos que ele carrega com `require` também são instrumentados, mas ficam inteiros como Base.

**Vários arquivos (mapa por arquivo):** use `files`, com um mapa de linhas por arquivo:
```json
{ "root": "/caminho/do/projeto",
  "files": { "src/a.js": {"4": "L"}, "lib/b.js": {"L": [2], "R": [9]} } }
```
* Chave absoluta: casa com o caminho exato do arquivo.
* Chave relativa: é resolvida contra `root`, ou contra `BRANCH_MAP_ROOT`, que tem precedência. Sem raiz, casa com o fim do caminho do arquivo em execução, ignorando `node_modules` (a menos que a chave o mencione). Se várias chaves casam, vence a mais longa.
* Arquivos fora do mapa são Base.
* Nos conflitos, cada posição aparece como `arquivo:linha`, então a linha 4 de dois arquivos diferentes não se confunde.

O `tools/line-map.js` gera esse formato para cada merge do dataset (veja abaixo).

Uma operação pertence à branch da última linha mapeada que ela ocupa (uma atribuição que se estende por várias linhas conta todas elas).

### Relatório da análise
A análise imprime ao final os três números de conflitos e a cobertura das linhas de cada branch:
```
- Conflitos de Overriding Assignment (OA): n
- Conflitos de Data Flow (DF):             n
- Conflitos de Confluence Flow (CF):       n
- Linhas de L executadas:                  e/x (s sem código executável)
- Linhas de R executadas:                  e/x
```
DF e CF já incluem os diretos e os transitivos. Por dentro, cada conflito é marcado como direto ou transitivo (aparece no log de cada detecção), e os runners de teste pedem esse detalhe com `ANALYSIS_DETAIL=1` para comparar com a análise do Java que cada teste representa.

### Cobertura das linhas de L e R
Como a análise é dinâmica, "0 conflitos" só diz alguma coisa sobre as linhas que executaram. Por isso o relatório diz quantas linhas mapeadas de cada branch executaram:
* **Executável:** a linha tem algum nó instrumentado. A lista vem da tabela de iids do Jalangi2 (`J$.smap`), que registra todo nó de cada arquivo.
* **Executada:** algum desses nós executou. É registrado em todos os callbacks, inclusive `literal`, `binary`, `unary`, `_return`, `_throw` e `forinObject`, que só servem à cobertura e não alteram nenhum valor.
* **Sem código executável:** linha mapeada com só `}`, comentário ou espaço. Não entra na conta, porque nunca poderia executar.
* Um arquivo do mapa que nunca carregou fica com `loaded: false`, e todas as linhas dele contam como não executadas.

### Relatório JSON
Com `ANALYSIS_REPORT=caminho.json`, a análise grava o relatório completo da execução (formato `merge-analysis-report/1`):
```json
{ "format": "merge-analysis-report/1",
  "runs": [{ "program": "/abs/main.js", "branchMap": "per-file" }],
  "counts": { "oa": 1, "df": {"direct": 1, "transitive": 0, "total": 1, "viaParam": 0}, "cf": {...} },
  "conflicts": {
    "oa": [{ "key", "target", "branch", "position": {"file", "line"}, "value",
             "previous": {"branch", "position", "value"}, "stack": [{"file", "line"}] }],
    "df": [{ "kind": "direct", "key", "from": {"branch", "position"}, "to": {"branch", "position"},
             "targets": ["taxa"], "viaParam": false, "stack": [...] }],
    "cf": [{ "kind", "key", "left": {...}, "right": {...}, "base": {...}, "stack": [...] }] },
  "coverage": {
    "summary": { "total": { "L": {"mapped", "withoutCode", "executed", "notExecuted", "rate"}, "R": {...} },
                 "files": [{ "file", "loaded", "L": {..., "notExecuted": [6]}, "R": {...} }] },
    "files": [{ "file", "loaded", "lines": {"L": [...], "R": [...]}, "executable": [...], "executed": [...] }] } }
```
* `stack` lista os pontos de chamada em andamento no momento da detecção, do mais externo ao mais interno. Mostra, por exemplo, de qual chamada veio uma leitura feita dentro de uma função.
* `value` é uma descrição do valor (`"2"`, `"[Object]"`, `"[function f]"`). O valor em si não é guardado.
* `viaParam: true` num DF avisa que ele só existe por origens que entraram numa função de forma transitiva (`counts.df.viaParam` conta quantos; já estão em `transitive`). As origens lidas em todos os argumentos de uma chamada vão para todos os parâmetros, então com mais de um argumento ele pode ser um falso positivo (toy 26). Serve para separar esses casos na inspeção manual. Numa união de execuções, só continua marcado se todas o viram assim.
* A lista `conflicts` traz exatamente o que as contagens contam: um par (DF) ou trio (CF) transitivo que também aparece como direto fica só como direto.
* Em `coverage.files`, as listas de linhas cobrem só as linhas mapeadas. É o que permite unir execuções.

**Várias execuções do mesmo merge** (um processo por arquivo de teste, por exemplo): `tools/merge-reports.js` une os relatórios. Cada conflito conta uma vez, pela mesma chave usada na execução. Um DF ou CF transitivo deixa de contar se outra execução o viu como direto. Uma linha conta como executada se executou em qualquer execução.
```bash
node experiments/tools/merge-reports.js uniao.json teste1.json teste2.json ...
node experiments/tools/test-reports.js    # autoteste do relatório e da união
```

### Como executar a análise
A análise precisa da memória sombra do Jalangi2, então deve ser encadeada com `ChainedAnalyses.js` e `SMemory.js`, nesta ordem (veja o exemplo em "Direto pelo Jalangi2"). Os runners já fazem isso.

### Eventos interceptados
| Callback | Papel |
|---|---|
| `write` / `putFieldPre` | Escrita em variável / propriedade de objeto ou índice de array |
| `read` / `getField` | Leitura de variável / propriedade de objeto ou índice de array |

### Identidade dos elementos de estado
Propriedades de objeto são **elementos de estado independentes**. A chave de cada alvo vem da memória sombra (`SMemory`):
* **Variável:** frame que a declara + nome. Duas variáveis `x` em funções diferentes, ou em chamadas recursivas diferentes, são alvos distintos.
* **Propriedade:** objeto dono + nome. Dois nomes que apontam para o mesmo objeto (aliasing) são o mesmo alvo.

Sem `SMemory` a análise recai em nome (variáveis) e `WeakMap` (objetos), mas então colide escopos.

### Regras
* **OA (Algoritmo 1 de Amanda):** cada branch mantém as atribuições que fez (alvo, linha e valor). Se uma branch escreve em um elemento já atribuído pela outra **com valor diferente**, registra-se uma interferência. A atribuição da outra branch é removida em qualquer caso.
  * A comparação de valores (`!==`) vem do SCAz.js e não está descrita no artigo: atribuir o mesmo valor não é conflito.
  * Uma escrita da **Base** no elemento limpa o OA nas duas branches (`removeAssignmentFromAllBranches`).
  * **Leituras não alteram o OA**: só escritas entram no algoritmo.
* **Interprocedural (pilha de chamadas):** cada chamada empilha a branch da linha onde termina. Uma operação cuja própria linha é da Base é atribuída à branch da chamada mais recente que tenha uma. Vale para escritas (OA e DF) e leituras (DF e CF).
  * Se uma função termina por exceção, o `invokeFun` não é chamado. A análise acompanha a profundidade de funções (`functionEnter`/`functionExit`) e descarta as chamadas pendentes dessa função e a que a invocou.
* **Data Flow:** uma leitura por uma branch de um valor produzido pela **outra** registra um DF. Cada origem de um valor é **direta** (a própria escrita da branch produziu o valor) ou **transitiva** (o valor chegou passando por outros valores).
  * **Direto**, equivalente à ReachDefinition do `conflict-static-analysis`: uma escrita da **Base** no elemento encerra o fluxo (*kill*), e leituras pela Base nunca geram DF.
  * **Transitivo**, equivalente ao Tainted: cada leitura leva as origens do valor lido para o que for atribuído na mesma expressão (`y = x + 1` faz `y` herdar as origens de `x`, mesmo escrito pela Base). A Base só interrompe a contaminação se atribuir um valor que não vem de um valor contaminado. As origens passam por parâmetros e pelo `return`. Os índices de um array continuam sendo estados independentes (escrever em `arr[4]` não contamina `arr[3]`), como no OA.
  * Um conflito é o **par** (linha que produz, linha que consome), como o par source/sink do Java: vários elementos de estado entre as mesmas duas linhas contam uma vez. Um par que aparece como direto e como transitivo conta só como direto.
* **Confluence Flow:** um comando da **Base** que usa ao mesmo tempo um valor produzido por L e um produzido por R é um ponto de confluência. O conflito é o trio (linha de L, linha de R, comando da Base). É **direto** quando os dois valores vieram direto das escritas (Confluent) e **transitivo** quando algum passou por outro valor (ConfluentTainted).
  * Os comandos de L e de R não contam como ponto de confluência.
  * Valores que chegam a uma função por parâmetro não contam como confluência dentro dela, só no ponto da chamada, como no Java, em que cada corpo de método é analisado sozinho.
* **Passagem de parâmetros:** ao entrar numa função, cada parâmetro recebe valor da branch do ponto de chamada (`declare` com `isArgument`). Conta como produtor só para o DF; o OA considera apenas atribuições explícitas no código (Moraes et al., 2024), então a ligação do argumento nunca gera OA.
* **Atribuição de função:** `X.prototype.foo = function () {...}` conta só a primeira linha da atribuição. O corpo é analisado linha a linha quando executa; se contasse inteiro, a definição seria atribuída à branch de qualquer linha dele e uma chamada `m.foo()` acusaria DF sobre o próprio método.
* **Métodos de array in-place** (`push`, `pop`, `shift`, `unshift`, `splice`, `fill`, `copyWithin`, `reverse`, `sort`): cada posição afetada é uma escrita no array. Para a comparação de valores, `push` e `fill` usam o valor inserido; nos demais o valor é tratado como desconhecido (sempre diferente).

---

## 📋 Catálogo dos Cenários

Os resultados abaixo são a documentação do comportamento esperado; o runner apenas imprime o que foi detectado.

| # | Arquivo | Mapa (`L` / `R`) | OA | DF |
|---|---|---|:-:|:-:|
| 1 | `01_example.js` | `[5]` / `[1]` | 1 | 0 |
| 2 | `02_test_dataflow_direct.js` | `[4]` / `[6,7]` | 0 | 1 |
| 3 | `03_test_dataflow_safe.js` | `[4,5,6]` / `[10,11,12]` | 0 | 0 |
| 4 | `04_test_dataflow_object.js` | `[6]` / `[8,9]` | 0 | 1 |
| 5 | `05_test_dataflow_interproc.js` | `[4]` / `[8]` | 0 | 1 |
| 6 | `06_test_oa_read_between.js` | `[3]` / `[6]` | 1 | 0 |
| 7 | `07_test_if_dataflow.js` | `[6]` / `[11]` | 0 | 1 |
| 8 | `08_test_if_oa.js` | `[5]` / `[8]` | 1 | 0 |
| 9 | `09_test_if_not_taken.js` | `[6]` / `[9]` | 0 | 0 |
| 10 | `10_test_loop_dataflow.js` | `[7]` / `[10]` | 0 | 1 |
| 11 | `11_test_loop_oa.js` | `[6]` / `[9,10]` | 1 | 0 |
| 12 | `12_test_loop_object.js` | `[4]` / `[5]` | 0 | 1 |
| 13 | `13_test_exception_stack.js` | `[8]` / `[14]` | 0 | 0 |
| 14 | `14_test_array_inplace_oa.js` | `[3]` / `[4]` | 1 | 0 |
| 15 | `15_test_array_inplace_safe.js` | `[3]` / `[4]` | 0 | 0 |
| 16 | `16_test_dataflow_param.js` | `[6]` / `[2]` | 0 | 1 |
| 17 | `17_test_dataflow_param_safe.js` | `[]` / `[2]` | 0 | 0 |
| 18 | `18_test_dataflow_param_reassign.js` | `[6]` / `[2]` | 0 | 2 |
| 19 | `19_test_taint_transitive.js` | `[2]` / `[4]` | 0 | 1 |
| 20 | `20_test_taint_function.js` | `[5]` / `[7]` | 0 | 1 |
| 21 | `21_test_taint_kill.js` | `[1]` / `[4]` | 0 | 0 |
| 22 | `22_test_confluence_direct.js` | `[3]` / `[4]` | 0 | CF 1 |
| 23 | `23_test_confluence_separate.js` | `[3]` / `[4]` | 0 | CF 0 |
| 24 | `24_test_confluence_transitive.js` | `[3]` / `[4]` | 0 | CF 1 |
| 25 | `25_test_confluence_and.js` | `[3]` / `[4]` | 0 | CF 1 |
| 26 | `26_test_taint_param_split.js` | `[6]` / `[2]` | 0 | 1 (transitivo) |
| 27 | `27_test_oa_two_targets.js` | `[3,5]` / `[4,6]` | 2 | 1 |
| 28 | `28_test_call_multiline.js` | `[6]` / `[8]` | 0 | 0 |
| 29 | `29_test_multifile.js` (+ `29_lib/contador.js`) | por arquivo: `[3]` / `[5]` no principal | 0 | 1 |
| 30 | `30_test_confluence_or.js` | `[3]` / `[4]` | 0 | CF 1 |
| 31 | `31_test_confluence_or_short.js` | `[3]` / `[4]` | 0 | CF 0 |
| 32 | `32_test_confluence_assign_and.js` | `[3]` / `[4]` | 0 | CF 1 |
| 33 | `33_test_confluence_while_and.js` | `[4]` / `[5]` | 0 | CF 1 |

### 1. `01_example.js` — Overriding Assignment original (Amanda Moraes, SBLP 2024)
* **Objetivo:** regressão do algoritmo de OA original.
* **Cenário:** `R` define `var discount = -5;` (linha 1) e `L` sobrescreve `discount = -10;` (linha 5) dentro de `apply(80)`.
* **Conflito:** a atribuição de `R` é perdida; o resultado de `apply` depende só de `L`.

### 2. `02_test_dataflow_direct.js` — Data Flow direto (caso positivo)
* **Objetivo:** uma branch consome diretamente um valor produzido pela outra.
* **Cenário:** a Base define `taxa = 0` e `preco = 100`. `L` altera `taxa = 15` (linha 4). `R` calcula `totalFinal = (preco + taxa) + frete` (linha 7), lendo a `taxa` de `L`.
* **Conflito:** `R` usa um estado produzido por `L` sem que os desenvolvedores soubessem.

### 3. `03_test_dataflow_safe.js` — Variáveis disjuntas e *kill* pela Base (caso negativo)
* **Objetivo:** garantir ausência de falsos positivos.
* **Cenário:**
  1. **Disjuntas:** `L` opera em `descontoL` e `R` em `taxaR`.
  2. **Kill pela Base:** `L` escreve `configStatus = "ativo_L"` (linha 6), mas a Base sobrescreve `configStatus = "padrao"` (linha 8) antes de `R` ler (linha 12).

### 4. `04_test_dataflow_object.js` — Propriedades de objeto (estado independente)
* **Objetivo:** validar `putFieldPre`/`getField`, tratando propriedades como estados independentes (Misra, 2001).
* **Cenário:** a Base define `pedido = { subtotal: 100, taxa: 5 }`. `L` altera `pedido.taxa = 25` (linha 6). `R` lê `pedido.subtotal` e `pedido.taxa` no total (linha 9).
* **Observação:** só `taxa` gera DF; `subtotal` não foi escrito por `L`.

### 5. `05_test_dataflow_interproc.js` — Data Flow interprocedural
* **Objetivo:** o fluxo atravessa fronteiras de função.
* **Cenário:** `L` altera o corpo de `setTaxa` (linha 4), que escreve a global `taxaServico`. `R` altera o corpo de `calcularTotal` (linha 8), que a lê.

### 6. `06_test_oa_read_between.js` — Leitura entre as escritas não elimina o OA
* **Cenário:** `L` escreve `limite = 10` (linha 3), a Base lê `limite` (linha 4) e `R` sobrescreve `limite = 20` (linha 6).
* **Objetivo:** fixar a decisão do Algoritmo 1: só **escritas** alteram o OA. O "sem escrita no meio" da definição de Barbosa não considera leituras.
* **Observação:** DF = 0 porque a leitura é da Base.

### 7. `07_test_if_dataflow.js` — Data Flow com `if`
* **Cenário:** `L` escreve `taxa` dentro de um `if` (linha 6) e `R` lê `taxa` dentro de outro `if` (linha 11). Ambos os caminhos são executados.

### 8. `08_test_if_oa.js` — OA com `if`
* **Cenário:** `L` atribui `modo` dentro de um `if` (linha 5) e `R` sobrescreve `modo` depois dele (linha 8).

### 9. `09_test_if_not_taken.js` — Caminho não executado (limitação dinâmica)
* **Cenário:** igual ao 7, mas `premium = false`. A escrita de `L` (linha 6) nunca roda, então o DF com a leitura de `R` (linha 9) **não é detectado**.
* **Objetivo:** documentar o falso negativo típico da análise dinâmica: ela só vê o que a execução percorre. Uma análise estática sinalizaria este caso.

### 10. `10_test_loop_dataflow.js` — Data Flow com laço
* **Cenário:** `L` escreve `desconto` a cada iteração (linha 7) e `R` o lê depois do laço (linha 10).
* **Observação:** o DF é contado uma vez, apesar de as escritas se repetirem.

### 11. `11_test_loop_oa.js` — OA com laço
* **Cenário:** `L` atribui `ultimo` em cada iteração (linha 6). Depois do laço, `R` sobrescreve `ultimo` duas vezes (linhas 9 e 10).
* **Objetivo:** a primeira escrita de `R` registra o OA e remove a atribuição de `L` do conjunto. A segunda não deve registrar outro OA (Algoritmo 1, linha 7).

### 12. `12_test_loop_object.js` — Data Flow de propriedade em laço
* **Cenário:** `L` escreve `conta.juros` (linha 4) e `R` o lê em `conta.saldo = conta.saldo + conta.juros * 2` (linha 5), a cada iteração.
* **Observação:** `conta.saldo` só é escrita por `R`, então não gera OA nem DF.

### 13. `13_test_exception_stack.js` — Chamada que termina por exceção
* **Cenário:** `L` chama `falha()` (linha 8), que lança. O `catch` e a atribuição `estado = 1` são da Base, e `R` escreve `estado = 2` (linha 14).
* **Objetivo:** a chamada de `L` não pode continuar na pilha depois da exceção. Se continuasse, as escritas da Base seriam atribuídas a `L` e `R` as sobrescreveria (falso OA).

### 14. `14_test_array_inplace_oa.js` — OA com métodos de array in-place
* **Cenário:** `L` faz `fila.fill(0, 0, 2)` (posições 0 e 1) e `R` faz `fila.splice(1, 1, 7)` (posição 1).
* **Conflito:** as duas branches alteram a posição 1 do mesmo array.

### 15. `15_test_array_inplace_safe.js` — Métodos de array in-place em posições distintas
* **Cenário:** `L` faz `fila.push(4)` (posição 3) e `R` faz `fila.fill(9, 0, 2)` (posições 0 e 1).
* **Objetivo:** posições diferentes são elementos de estado independentes; não há conflito.

### 16. `16_test_dataflow_param.js` — Data Flow por parâmetro
* **Cenário:** `L` chama `dobrar(base + 1)` (linha 6) e `R` lê o parâmetro `n` dentro da função (linha 2).
* **Conflito:** o valor que `L` passou como argumento chega a uma instrução de `R`.

### 17. `17_test_dataflow_param_safe.js` — Parâmetro passado pela Base
* **Cenário:** igual ao 16, mas a chamada `dobrar(21)` é da Base.
* **Objetivo:** o argumento não é de nenhuma branch, então a leitura de `R` não consome valor de `L`.

### 18. `18_test_dataflow_param_reassign.js` — Parâmetro reatribuído
* **Cenário:** `L` chama `ajustar(5)` (linha 6). `R` faz `n = n + 1` (linha 2), e o `return n` (linha 3) é da Base.
* **DF = 2:** (1) `R` lê o `n` que veio de `L`; (2) o `return n`, executado a mando da chamada de `L`, lê o `n` que `R` reatribuiu.
* **OA = 0:** a ligação do argumento ao parâmetro não é uma atribuição explícita no código.

### 19 a 21. Data Flow transitivo
* **19:** `L` define `origem` (linha 2), a Base deriva `derivado = origem + 1` e `R` lê `derivado` (linha 4). O valor de `L` chega a `R` passando por uma escrita da Base. O valor não vem direto de uma escrita de `L` (a Base escreveu `derivado`), e mesmo assim o conflito é detectado.
* **20:** o valor de `L` passa por um parâmetro e por um `return` antes de `R` o ler.
* **21:** a Base reatribui `derivado = 0`, uma constante, antes de `R` ler. A contaminação é interrompida e não há conflito, nem direto nem transitivo.

### 22 a 24. Confluence Flow
* **22:** `L` escreve `a`, `R` escreve `b`, e um comando da Base (`soma = a + b`) usa os dois. É o ponto de confluência direto.
* **23:** a Base usa `a` num comando e `b` em outro. Os valores nunca se encontram, então não há confluência.
* **24:** `x` e `y` derivam de `a` e `b` na Base e se encontram em `z = x + y`. Os valores não vêm direto das escritas (a Base escreveu `x` e `y`), e mesmo assim a confluência é detectada.

### 25 e 30 a 33. Confluência em `&&` e `||`
O Jalangi chama `conditional` para o operando da esquerda de `a && b` e de `a || b`, antes de o da direita ser lido, e de novo para o teste do `if` ou `while`. Encerrar a expressão no primeiro chamado fazia a análise perder `a` antes de `b` entrar, e o CF sumia, inclusive em `var c = a && b`. A análise agora mantém o `conditional` aberto até um evento sair do trecho de código da expressão (comparação por linha e coluna) ou até a segunda chamada para o mesmo trecho.
* **25:** `if (a && b)` com `a` de `L` e `b` de `R`: o `if` da Base usa os dois, e há CF.
* **30:** `if (a || b)` com `a` falso: `b` é lido e há CF.
* **31:** `if (a || b)` com `a` verdadeiro: o `||` faz curto-circuito e `b` nunca é lido, então não há CF. É a regra de uma análise dinâmica: só vale o que executa.
* **32:** `var c = a && b` na Base: há CF, e `c` herda as origens de `a` e `b`.
* **33:** `while (a && b && n < 2)`: um só conflito, apesar das voltas do laço.

O Jimple do Java separa essas expressões em desvios distintos, então a análise estática de referência não acusa `a && b`. Aqui a confluência é detectada, porque `&&` e `||` aparecem em quase todo arquivo real.

### 26 a 28. Limites conhecidos
Estes toys documentam o comportamento atual em pontos onde a análise se afasta do que se esperaria intuitivamente.
* **26:** todas as origens lidas nos argumentos de uma chamada vão para todos os parâmetros. Em `segundo(a, b)`, só `p` recebe o valor de `L`, mas `R` lê `q` e é reportado um DF transitivo (falso positivo). Não dá para separar os argumentos porque o Jalangi não informa onde cada um termina. O conflito sai com `viaParam: true` no relatório JSON, para ser descontado na inspeção.
* **27:** OA e DF deduplicam de jeitos diferentes. Duas escritas na mesma linha de `L` (`o.x`, `p.x`) sobrescritas na mesma linha de `R` contam **2 OA**, porque o OA conta por alvo. Duas leituras de alvos de `L` na mesma linha de `R` contam **1 DF**, porque o DF conta por par de linhas.
* **28:** a branch de uma chamada é a da linha onde ela termina. `guardar(` … `1` … `)` com só a linha do argumento em `L` é uma chamada da Base, então a escrita de `g` dentro da função não é de `L` e `R` não tem DF ao ler `g`.

### 29. Vários arquivos
O script principal carrega `29_lib/contador.js`, e o mapa marca as linhas 3 (`L`) e 5 (`R`) só do principal. O único conflito é o DF de `total`. Antes do mapa por arquivo, o mapa valia para qualquer arquivo carregado: as linhas 3 e 5 do módulo também viravam `L` e `R`. Isso gerava um DF e um CF espúrios em `estado.n`, e o DF verdadeiro ficava escondido atrás do falso, porque os dois tinham a mesma chave `L@3->R@5`.

---

## 🚀 Como executar

### Todos os toys, com relatório consolidado
```bash
node experiments/run_all_toys.js
```

Ou via Docker:
```bash
docker compose up
```

### Um toy específico (por número ou parte do nome)
```bash
node experiments/run_all_toys.js direct
node experiments/run_all_toys.js 2
```
Com um único toy, o log completo de instrumentação do Jalangi2 também é exibido.

### Direto pelo Jalangi2
```bash
BRANCH_MAP='{"L":[4],"R":[6,7]}' node src/js/commands/jalangi.js \
  --inlineIID --inlineSource \
  --analysis src/js/sample_analyses/ChainedAnalyses.js \
  --analysis src/js/runtime/SMemory.js \
  --analysis experiments/analyses/analysis_dataflow.js \
  experiments/toys/02_test_dataflow_direct.js
```

---

## ✅ Regressão de OA com os casos do SCAz.js

Os 72 casos de OA da Amanda (testes de Barbosa et al. traduzidos com JSweet) ficam no repositório [amandascm/SCAz.js](https://github.com/amandascm/SCAz.js), que não tem licença e por isso não é copiado para cá. O runner lê o clone local (padrão: `../SCAz.js`, ao lado deste repositório):

```bash
node experiments/run_oa_suite.js                    # usa dados/fontes/SCAz.js (make fontes) ou ../SCAz.js
node experiments/run_oa_suite.js /caminho/SCAz.js   # outro caminho
node experiments/run_oa_suite.js "" classField      # filtra por nome
```

Compara o OA detectado com o `conflict` esperado do `index.test.js` dela. Resultado atual: **68 de 68 casos executáveis corretos**, sem falsos negativos ou positivos. Os 3 erros de execução também ocorrem no SCAz.js: `arraysClassFieldNotConflictSample` quebra ao rodar sozinho (`arr` nulo), e `chainedMethodCallsConflictSample` e `innerClassRecursiveNotConflictSample` estão comentados como "ERRO" no teste dela.

O que cada recurso contribui (desligando um de cada vez):

| Recurso desligado | Corretos | Efeito |
|---|:-:|---|
| Nenhum | 68 / 68 | |
| Pilha de chamadas | 49 | 19 falsos negativos: a escrita está num método da Base chamado por L ou R |
| Identidade por frame | 64 | 4 falsos positivos: variáveis locais com o mesmo nome em escopos diferentes |
| Comparação de valores | 67 | 1 falso positivo: `classFieldWithParameterNotConflictSample` (mesmo valor) |

---

## ✅ Validação de DF e CF com as samples do conflict-static-analysis

Os testes de DF e CF do [`spgroup/conflict-static-analysis`](https://github.com/spgroup/conflict-static-analysis) (Santos et al., 2023) usam Soot e não são traduzíveis. O que roda são as classes `sample` que eles analisam, traduzidas com JSweet por Italo Correia (`tjtjdf`) e convertidas para ES5 em `df_samples/`. Cada teste fornece source (L), sink (R) e o esperado.

```bash
node experiments/run_df_cf_suite.js
```

A análise roda **uma única vez** por teste, e cada análise do Java corresponde a um recorte do que ela reporta:

| Análise do Java | Recorte comparado |
|---|---|
| ReachDefinition | Data Flow direto |
| Tainted | Data Flow direto + transitivo |
| Confluent | Confluence Flow direto |
| ConfluentTainted | Confluence Flow direto + transitivo |
| DFPInterProcedural (Containment) | Data Flow direto + transitivo (aproximação) |

Resultado atual: **12 de 13 corretos, com a contagem exata em todos eles**. O que diverge é `ArrayTaintedAnalysisOneConflictIndirectTest`, **por escolha**: o Tainted do Java trata o array como um único elemento (`arr[4]` contamina `arr[3]`), e aqui cada índice é um estado independente, o que evita falsos positivos. O `ContainmentConflictTest` usa uma sample de OA, que não está entre as 9 do Italo: roda com a tradução da Amanda, do clone `../SCAz.js`. Detalhes e a tabela em [df_samples/README.md](df_samples/README.md).

## ✅ Validação completa

```bash
node experiments/run_validation.js
```

Roda numa só execução os 72 casos de OA do SCAz.js e os 13 testes de DF e CF, e imprime um resumo. Os toys têm o próprio runner (`run_all_toys.js`) e não têm gabarito.

---

## 🗺️ Gerador do mapa L/R

A análise precisa saber quais linhas do arquivo integrado vieram da Left e quais da Right. Em casos reais esse mapa não existe pronto, e `tools/line-map.js` o gera **só com as quatro versões do arquivo** (base, left, right e merge), sem o histórico do Git:

1. as linhas que a Left acrescentou ou alterou em relação à base (`git diff base left`);
2. quais delas sobrevivem, iguais, no merge (`git diff left merge`);
3. o mesmo para a Right.

As linhas do merge que não vieram de nenhuma contribuição (código da base ou editado ao resolver o merge) ficam sem rótulo e valem como Base. A comparação ignora espaços em branco (`-w`). Se as duas fizeram a mesma alteração na mesma linha, ela vale como L e não conta como linha de R (não há divergência entre as contribuições). A saída é `{"linha":"L"|"R"}`, o formato do SCAz.js, aceito por `BRANCH_MAP_FILE`.

```bash
# um cenário
node experiments/tools/line-map.js base.js left.js right.js merge.js --out mapa.json
# os pacotes de versões do dataset de merges (um ZIP por projeto); grava mapas/<amostra>.json, mapa_linhas.csv,
# por-merge/<projeto>__<commit>.json e mapa_merges.csv
node experiments/tools/line-map.js --versoes /caminho/MinerreporJavascriptMerge/versoes --out-dir /caminho/saida
node experiments/tools/test-line-map.js   # autoteste
```

O `mapa_linhas.csv` traz, por amostra (um arquivo de um merge), as linhas de L e de R e o estado: `ok` (tem L e R, analisável), `sem-L`, `sem-R` ou `sem-L-e-R`. Só as amostras `ok` ganham arquivo em `mapas/`.

Para executar um merge inteiro, use `por-merge/`. Cada arquivo junta todos os arquivos do merge no formato por arquivo da análise (`{"files": {...}}`, com os caminhos relativos à raiz do repositório; passe a raiz em `BRANCH_MAP_ROOT`). Entram também os arquivos que só têm L ou só têm R, porque L num arquivo e R em outro podem interferir. O `mapa_merges.csv` dá o estado de cada merge, que é `ok` quando há linhas de L e de R em algum arquivo.

**Por merge**, no mesmo dataset: 3.505 merges, dos quais 2.987 estão `ok` (405 `sem-R` e 113 `sem-L`), de 33 projetos. 1.344 dos merges `ok` alteram mais de um arquivo (mediana 1, máximo 88). Em 14 deles, L e R nunca aparecem no mesmo arquivo: nenhuma amostra deles é `ok`, e só o mapa por merge os torna analisáveis.

**No dataset de merges minerados** (10.162 amostras, 34 projetos, 4m38s para gerar tudo):

| Estado | Amostras |
|---|---:|
| `ok` (tem linhas de L e de R) | 6.127 (60%) |
| `sem-R` (só a Left alterou, ou as duas fizeram a mesma alteração) | 3.287 |
| `sem-L` | 552 |
| `sem-L-e-R` (o merge só reaproveita a base) | 196 |

As 6.127 amostras analisáveis vêm de 2.973 merges e de 33 dos 34 projetos; 5.243 delas não são arquivos de teste (`test`/`spec` no caminho). Elas têm em mediana 8 linhas de L e 6 de R. O mapa é só o primeiro passo: para **executar** o arquivo ainda são necessários o projeto no commit do merge e as dependências instaladas, e o Jalangi2 só instrumenta ES5.1.

**Validação contra o método da Amanda** (`git blame -w -M` no merge, cruzado com `git log ancestor..pai`), nas 447 amostras do Express:

| Medida | Resultado |
|---|---|
| Os dois métodos concordam se a amostra é analisável (tem L e R) | 435 de 447 (97%) |
| Amostras analisáveis para o blame que o gerador perdeu | 0 |
| Analisáveis só para o gerador | 12 |
| Mapas idênticos, entre as 252 analisáveis nos dois | 113 (45%); similaridade média das linhas: L 0,87, R 0,94 |
| O mesmo, sem o `-M` no blame | mapas idênticos em 69%; similaridade R 0,99, L 0,93 |

A diferença vem de os métodos medirem coisas diferentes: o blame olha o **histórico de commits** e, com `-M`, atribui linhas copiadas dentro do arquivo ao commit original; o gerador olha a **mudança líquida** entre as versões. Por isso um mapa não é igual ao outro linha a linha, mas o gerador não perde nenhuma amostra analisável. Precisa do histórico clonado apenas para executar o arquivo, não para gerar o mapa.

---

## ⚠️ Limitações conhecidas

* **Exceção lançada por função nativa** (por exemplo `JSON.parse`) e capturada na mesma função: não há `functionExit` instrumentado, então a chamada fica na pilha até a função sair.
* **Exceção em *getter*/*setter*** invocado implicitamente: a chamada pendente que a análise descarta pode não ser a do acesso.
* **Receptor (`this`) e `arguments`** não são tratados como valores passados na chamada; só os parâmetros nomeados.
* **Métodos de array que só leem** (`slice`, `join`, `indexOf`, `map`...) não geram leituras para o DF. Só as escritas dos métodos in-place são tratadas.
* `sort` executa o comparador uma vez a mais, em uma cópia, para descobrir quais posições mudam.
* **Control Dependence** ainda não foi implementado.
* **O fluxo transitivo é aproximado:** a contaminação segue as leituras da expressão corrente (limpa em `endExpression` e `conditional`). Uma atribuição em cadeia (`a = b = c`) só leva as origens para o primeiro alvo, e todos os parâmetros de uma chamada recebem a união das origens dos argumentos.
* **Sem dependência de controle:** um `if` cuja condição leu um valor contaminado não contamina o que é atribuído dentro dele.
* A detecção depende de o script exercitar as linhas relevantes (análise dinâmica).
* **Confluência interprocedural através de estado guardado entre chamadas** (por exemplo `counter += value` em duas chamadas, uma com valor de L e outra com valor de R) não é detectada: o CF ignora origens que entraram por parâmetro, e o campo herda essa marca. O teste correspondente está `@Ignore` no Java desde 2021, sem motivo registrado; não se sabe se a versão atual detecta. A correção está em aberto, com opções e riscos, em [DECISOES_PENDENTES.md](DECISOES_PENDENTES.md#1-confluência-interprocedural-através-de-estado-que-sobrevive-à-chamada).

Decisões sobre limitações que ainda não foram tomadas ficam em [DECISOES_PENDENTES.md](DECISOES_PENDENTES.md).
