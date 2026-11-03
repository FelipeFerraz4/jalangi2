# 🧪 Experimentos: Análise Dinâmica de Data Flow & Overriding Assignment (Jalangi2)

Este diretório contém a análise dinâmica de conflitos semânticos de **Overriding Assignment (OA)** e **Data Flow (DF)** implementada sobre o **Jalangi2**, os programas sintéticos (*toys*) usados para validá-la e o runner que executa tudo em lote.

```
experiments/
├── analyses/
│   ├── analysis.js            # OA original (Amanda Moraes, SBLP 2024)
│   └── analysis_dataflow.js   # OA + Data Flow (motor estendido)
├── toys/                      # programas sintéticos (JS puro, só comentários // [Branch L] e // [Branch R])
├── run_all_toys.js            # runner: instrumenta cada toy e imprime o relatório consolidado
├── run_oa_suite.js            # regressão de OA com os casos de teste do SCAz.js (Moraes et al.)
├── run_df_suite.js            # validação de DF com os testes do conflict-static-analysis
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
| `J$.analysis.setBranches(map)` | Configuração programática (reinicia o estado) |

Formatos aceitos: `{"L":[4],"R":[6,7]}` ou o do SCAz.js, `{"4":"L","6":"R","7":"R"}`. Sem mapa, nenhuma linha pertence a `L` ou `R` e nada é detectado.

Uma operação pertence à branch da última linha mapeada que ela ocupa (uma atribuição que se estende por várias linhas conta todas elas).

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
* **Interprocedural (pilha de chamadas):** cada chamada empilha a branch da linha onde termina. Uma operação cuja própria linha é da Base é atribuída à branch da chamada mais recente que tenha uma. Vale para escritas (OA e DF) e leituras (DF).
  * Se uma função termina por exceção, o `invokeFun` não é chamado. A análise acompanha a profundidade de funções (`functionEnter`/`functionExit`) e descarta as chamadas pendentes dessa função e a que a invocou.
* **Modos de Data Flow** (variável `DATAFLOW_MODE`):
  * **padrão (`reach`):** fluxo direto, equivalente à ReachDefinition do `conflict-static-analysis`. Uma leitura só conta se o último escritor do elemento foi a outra branch.
  * **`tainted`:** fluxo transitivo, como o Tainted. Cada leitura leva as origens do valor lido para o que for atribuído na mesma expressão (`y = x + 1` faz `y` herdar as origens de `x`, mesmo escrito pela Base). A Base só interrompe a contaminação se atribuir um valor que não vem de um valor contaminado. As origens passam por parâmetros e pelo `return`. Um array é um único elemento de estado: escrever em `arr[4]` contamina a leitura de `arr[3]`.
  * Um conflito é o **par** (linha que produz, linha que consome), como o par source/sink do Java: vários elementos de estado entre as mesmas duas linhas contam uma vez.
* **Passagem de parâmetros:** ao entrar numa função, cada parâmetro recebe valor da branch do ponto de chamada (`declare` com `isArgument`). Conta como produtor só para o DF; o OA considera apenas atribuições explícitas no código (Moraes et al., 2024), então a ligação do argumento nunca gera OA.
* **Atribuição de função:** `X.prototype.foo = function () {...}` conta só a primeira linha da atribuição. O corpo é analisado linha a linha quando executa; se contasse inteiro, a definição seria atribuída à branch de qualquer linha dele e uma chamada `m.foo()` acusaria DF sobre o próprio método.
* **Métodos de array in-place** (`push`, `pop`, `shift`, `unshift`, `splice`, `fill`, `copyWithin`, `reverse`, `sort`): cada posição afetada é uma escrita no array. Para a comparação de valores, `push` e `fill` usam o valor inserido; nos demais o valor é tratado como desconhecido (sempre diferente).
* **Data Flow:** a tabela `lastWrite` guarda o último escritor de cada elemento. Uma leitura por uma branch de um elemento cujo último escritor é a **outra** branch registra um DF.
  * Uma escrita da Base sobrescreve `lastWrite` e encerra o fluxo (*kill*).
  * Leituras pela Base nunca geram DF.

---

## 📋 Catálogo dos Cenários

Os resultados abaixo são a documentação do comportamento esperado; o runner apenas imprime o que foi detectado.

| # | Arquivo | Mapa (`L` / `R`) | OA | DF |
|---|---|---|:-:|:-:|
| 1 | `example.js` | `[5]` / `[1]` | 1 | 0 |
| 2 | `test_dataflow_direct.js` | `[4]` / `[6,7]` | 0 | 1 |
| 3 | `test_dataflow_safe.js` | `[4,5,6]` / `[10,11,12]` | 0 | 0 |
| 4 | `test_dataflow_object.js` | `[6]` / `[8,9]` | 0 | 1 |
| 5 | `test_dataflow_interproc.js` | `[4]` / `[8]` | 0 | 1 |
| 6 | `test_oa_read_between.js` | `[3]` / `[6]` | 1 | 0 |
| 7 | `test_if_dataflow.js` | `[6]` / `[11]` | 0 | 1 |
| 8 | `test_if_oa.js` | `[5]` / `[8]` | 1 | 0 |
| 9 | `test_if_not_taken.js` | `[6]` / `[9]` | 0 | 0 |
| 10 | `test_loop_dataflow.js` | `[7]` / `[10]` | 0 | 1 |
| 11 | `test_loop_oa.js` | `[6]` / `[9,10]` | 1 | 0 |
| 12 | `test_loop_object.js` | `[4]` / `[5]` | 0 | 1 |
| 13 | `test_exception_stack.js` | `[8]` / `[14]` | 0 | 0 |
| 14 | `test_array_inplace_oa.js` | `[3]` / `[4]` | 1 | 0 |
| 15 | `test_array_inplace_safe.js` | `[3]` / `[4]` | 0 | 0 |
| 16 | `test_dataflow_param.js` | `[6]` / `[2]` | 0 | 1 |
| 17 | `test_dataflow_param_safe.js` | `[]` / `[2]` | 0 | 0 |
| 18 | `test_dataflow_param_reassign.js` | `[6]` / `[2]` | 0 | 2 |
| 19 | `test_taint_transitive.js` (modo tainted) | `[2]` / `[4]` | 0 | 1 |
| 20 | `test_taint_transitive.js` (modo padrão) | `[2]` / `[4]` | 0 | 0 |
| 21 | `test_taint_function.js` (modo tainted) | `[5]` / `[7]` | 0 | 1 |
| 22 | `test_taint_kill.js` (modo tainted) | `[1]` / `[4]` | 0 | 0 |

### 1. `example.js` — Overriding Assignment original (Amanda Moraes, SBLP 2024)
* **Objetivo:** regressão do algoritmo de OA original.
* **Cenário:** `R` define `var discount = -5;` (linha 1) e `L` sobrescreve `discount = -10;` (linha 5) dentro de `apply(80)`.
* **Conflito:** a atribuição de `R` é perdida; o resultado de `apply` depende só de `L`.

### 2. `test_dataflow_direct.js` — Data Flow direto (caso positivo)
* **Objetivo:** uma branch consome diretamente um valor produzido pela outra.
* **Cenário:** a Base define `taxa = 0` e `preco = 100`. `L` altera `taxa = 15` (linha 4). `R` calcula `totalFinal = (preco + taxa) + frete` (linha 7), lendo a `taxa` de `L`.
* **Conflito:** `R` usa um estado produzido por `L` sem que os desenvolvedores soubessem.

### 3. `test_dataflow_safe.js` — Variáveis disjuntas e *kill* pela Base (caso negativo)
* **Objetivo:** garantir ausência de falsos positivos.
* **Cenário:**
  1. **Disjuntas:** `L` opera em `descontoL` e `R` em `taxaR`.
  2. **Kill pela Base:** `L` escreve `configStatus = "ativo_L"` (linha 6), mas a Base sobrescreve `configStatus = "padrao"` (linha 8) antes de `R` ler (linha 12).

### 4. `test_dataflow_object.js` — Propriedades de objeto (estado independente)
* **Objetivo:** validar `putFieldPre`/`getField`, tratando propriedades como estados independentes (Misra, 2001).
* **Cenário:** a Base define `pedido = { subtotal: 100, taxa: 5 }`. `L` altera `pedido.taxa = 25` (linha 6). `R` lê `pedido.subtotal` e `pedido.taxa` no total (linha 9).
* **Observação:** só `taxa` gera DF; `subtotal` não foi escrito por `L`.

### 5. `test_dataflow_interproc.js` — Data Flow interprocedural
* **Objetivo:** o fluxo atravessa fronteiras de função.
* **Cenário:** `L` altera o corpo de `setTaxa` (linha 4), que escreve a global `taxaServico`. `R` altera o corpo de `calcularTotal` (linha 8), que a lê.

### 6. `test_oa_read_between.js` — Leitura entre as escritas não elimina o OA
* **Cenário:** `L` escreve `limite = 10` (linha 3), a Base lê `limite` (linha 4) e `R` sobrescreve `limite = 20` (linha 6).
* **Objetivo:** fixar a decisão do Algoritmo 1: só **escritas** alteram o OA. O "sem escrita no meio" da definição de Barbosa não considera leituras.
* **Observação:** DF = 0 porque a leitura é da Base.

### 7. `test_if_dataflow.js` — Data Flow com `if`
* **Cenário:** `L` escreve `taxa` dentro de um `if` (linha 6) e `R` lê `taxa` dentro de outro `if` (linha 11). Ambos os caminhos são executados.

### 8. `test_if_oa.js` — OA com `if`
* **Cenário:** `L` atribui `modo` dentro de um `if` (linha 5) e `R` sobrescreve `modo` depois dele (linha 8).

### 9. `test_if_not_taken.js` — Caminho não executado (limitação dinâmica)
* **Cenário:** igual ao 7, mas `premium = false`. A escrita de `L` (linha 6) nunca roda, então o DF com a leitura de `R` (linha 9) **não é detectado**.
* **Objetivo:** documentar o falso negativo típico da análise dinâmica: ela só vê o que a execução percorre. Uma análise estática sinalizaria este caso.

### 10. `test_loop_dataflow.js` — Data Flow com laço
* **Cenário:** `L` escreve `desconto` a cada iteração (linha 7) e `R` o lê depois do laço (linha 10).
* **Observação:** o DF é contado uma vez, apesar de as escritas se repetirem.

### 11. `test_loop_oa.js` — OA com laço
* **Cenário:** `L` atribui `ultimo` em cada iteração (linha 6). Depois do laço, `R` sobrescreve `ultimo` duas vezes (linhas 9 e 10).
* **Objetivo:** a primeira escrita de `R` registra o OA e remove a atribuição de `L` do conjunto. A segunda não deve registrar outro OA (Algoritmo 1, linha 7).

### 12. `test_loop_object.js` — Data Flow de propriedade em laço
* **Cenário:** `L` escreve `conta.juros` (linha 4) e `R` o lê em `conta.saldo = conta.saldo + conta.juros * 2` (linha 5), a cada iteração.
* **Observação:** `conta.saldo` só é escrita por `R`, então não gera OA nem DF.

### 13. `test_exception_stack.js` — Chamada que termina por exceção
* **Cenário:** `L` chama `falha()` (linha 8), que lança. O `catch` e a atribuição `estado = 1` são da Base, e `R` escreve `estado = 2` (linha 14).
* **Objetivo:** a chamada de `L` não pode continuar na pilha depois da exceção. Se continuasse, as escritas da Base seriam atribuídas a `L` e `R` as sobrescreveria (falso OA).

### 14. `test_array_inplace_oa.js` — OA com métodos de array in-place
* **Cenário:** `L` faz `fila.fill(0, 0, 2)` (posições 0 e 1) e `R` faz `fila.splice(1, 1, 7)` (posição 1).
* **Conflito:** as duas branches alteram a posição 1 do mesmo array.

### 15. `test_array_inplace_safe.js` — Métodos de array in-place em posições distintas
* **Cenário:** `L` faz `fila.push(4)` (posição 3) e `R` faz `fila.fill(9, 0, 2)` (posições 0 e 1).
* **Objetivo:** posições diferentes são elementos de estado independentes; não há conflito.

### 16. `test_dataflow_param.js` — Data Flow por parâmetro
* **Cenário:** `L` chama `dobrar(base + 1)` (linha 6) e `R` lê o parâmetro `n` dentro da função (linha 2).
* **Conflito:** o valor que `L` passou como argumento chega a uma instrução de `R`.

### 17. `test_dataflow_param_safe.js` — Parâmetro passado pela Base
* **Cenário:** igual ao 16, mas a chamada `dobrar(21)` é da Base.
* **Objetivo:** o argumento não é de nenhuma branch, então a leitura de `R` não consome valor de `L`.

### 18. `test_dataflow_param_reassign.js` — Parâmetro reatribuído
* **Cenário:** `L` chama `ajustar(5)` (linha 6). `R` faz `n = n + 1` (linha 2), e o `return n` (linha 3) é da Base.
* **DF = 2:** (1) `R` lê o `n` que veio de `L`; (2) o `return n`, executado a mando da chamada de `L`, lê o `n` que `R` reatribuiu.
* **OA = 0:** a ligação do argumento ao parâmetro não é uma atribuição explícita no código.

### 19 a 22. Propagação transitiva (modo tainted)
* **19:** `L` define `origem` (linha 2), a Base deriva `derivado = origem + 1` e `R` lê `derivado` (linha 4). O valor de `L` chega a `R` passando por uma escrita da Base.
* **20:** o mesmo arquivo no modo padrão. Como `R` lê um valor escrito pela Base, nada é detectado. A diferença entre 19 e 20 é a diferença entre Tainted e ReachDefinition.
* **21:** o valor de `L` passa por um parâmetro e por um `return` antes de `R` o ler.
* **22:** a Base reatribui `derivado = 0`, uma constante, antes de `R` ler. A contaminação é interrompida e não há conflito.

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
  experiments/toys/test_dataflow_direct.js
```

---

## ✅ Regressão de OA com os casos do SCAz.js

Os 72 casos de OA da Amanda (testes de Barbosa et al. traduzidos com JSweet) ficam no repositório [amandascm/SCAz.js](https://github.com/amandascm/SCAz.js), que não tem licença e por isso não é copiado para cá. O runner lê o clone local (padrão: `../SCAz.js`, ao lado deste repositório):

```bash
node experiments/run_oa_suite.js                    # usa ../SCAz.js
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

## ✅ Validação de DF com as samples do conflict-static-analysis

Os testes de DF do [`spgroup/conflict-static-analysis`](https://github.com/spgroup/conflict-static-analysis) (Santos et al., 2023) usam Soot e não são traduzíveis. O que roda são as classes `sample` que eles analisam, traduzidas com JSweet por Italo Correia (`tjtjdf`) e convertidas para ES5 em `df_samples/`. Cada teste fornece source (L), sink (R) e o esperado.

```bash
node experiments/run_df_suite.js
```

Resultado atual: ReachDefinition, 3 de 3, e Tainted, 3 de 3, com a contagem exata de conflitos em todos os 6 testes executados. Os testes de Tainted rodam no modo `DATAFLOW_MODE=tainted`. Os 6 testes Confluent e o Containment não são executados. Detalhes e a tabela em [df_samples/README.md](df_samples/README.md).

---

## ⚠️ Limitações conhecidas

* **Exceção lançada por função nativa** (por exemplo `JSON.parse`) e capturada na mesma função: não há `functionExit` instrumentado, então a chamada fica na pilha até a função sair.
* **Exceção em *getter*/*setter*** invocado implicitamente: a chamada pendente que a análise descarta pode não ser a do acesso.
* **Receptor (`this`) e `arguments`** não são tratados como valores passados na chamada; só os parâmetros nomeados.
* **Métodos de array que só leem** (`slice`, `join`, `indexOf`, `map`...) não geram leituras para o DF. Só as escritas dos métodos in-place são tratadas.
* `sort` executa o comparador uma vez a mais, em uma cópia, para descobrir quais posições mudam.
* **Confluence Flow e Control Dependence** ainda não foram implementados.
* **Modo tainted é aproximado:** a contaminação segue as leituras da expressão corrente (limpa em `endExpression` e `conditional`). Uma atribuição em cadeia (`a = b = c`) só leva as origens para o primeiro alvo, e todos os parâmetros de uma chamada recebem a união das origens dos argumentos.
* **Sem dependência de controle:** um `if` cuja condição leu um valor contaminado não contamina o que é atribuído dentro dele.
* A detecção depende de o script exercitar as linhas relevantes (análise dinâmica).
