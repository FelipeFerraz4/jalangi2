# 🧪 Suíte de Testes Sintéticos (Toys) - Data Flow & Overriding Assignment

Este diretório contém os casos de teste sintéticos (*toy programs*) utilizados para validar o algoritmo de detecção dinâmica de conflitos semânticos de **Data Flow (DF)** e **Overriding Assignment (OA)** implementado sobre o **Jalangi2**.

Cada arquivo `.js` contém **apenas código puro JavaScript** e anotações sucintas nas linhas modificadas por cada branch (`// [Branch L]`, `// [Branch R]`, `// [Base]`). Toda a documentação e detalhamento de cada cenário estão consolidados abaixo.

---

## 📋 Catálogo dos Cenários de Teste

### 1. `example.js` — Overriding Assignment Original (Amanda Moraes, SBLP 2024)
* **Objetivo:** Garantir regressão completa e compatibilidade com o algoritmo original de Overriding Assignment.
* **Cenário:**
  * Linha 1 (`Branch R`): define `var discount = -5;`
  * Linha 5 (`Branch L`): sobrescreve `discount = -10;` dentro do método `apply(80)`.
* **Resultado Esperado:** 
  * Overriding Assignment (OA): **1**
  * Data Flow (DF): **0**

---

### 2. `test_dataflow_direct.js` — Data Flow Direto (Caso Positivo)
* **Objetivo:** Detectar quando uma branch consome diretamente um valor produzido pela outra.
* **Cenário de Concorrência:**
  * `Base`: define `taxa = 0` e `preco = 100`.
  * Linha 4 (`Branch L`): modifica o valor da taxa de serviço (`taxa = 15`).
  * Linha 9 (`Branch R`): introduz novo cálculo lendo a taxa alterada (`totalFinal = (preco + taxa) + frete`).
* **Conflito Semântico:** Branch R calcula o valor final utilizando um estado produzido por Branch L sem que os desenvolvedores estivessem cientes.
* **Resultado Esperado:**
  * Overriding Assignment (OA): **0**
  * Data Flow (DF): **1**

---

### 3. `test_dataflow_safe.js` — Execução Segura e Kill da Base (Caso Negativo)
* **Objetivo:** Validar ausência de falsos positivos quando não há dependência cruzada ou quando a Base anula a alteração.
* **Princípios Validados:**
  1. **Variáveis Disjuntas:** Branch L opera em `descontoL` e Branch R opera em `taxaR`.
  2. **Operação de Kill pela Base:** Branch L escreve em `configStatus = "ativo_L"` (linha 6), mas a Base sobrescreve `configStatus = "padrao_BASE"` (linha 8) antes do consumo por R (linha 12).
* **Resultado Esperado:**
  * Overriding Assignment (OA): **0**
  * Data Flow (DF): **0**

---

### 4. `test_dataflow_object.js` — Propriedades de Objeto (Estado Independente)
* **Objetivo:** Validar a interceptação em memória via `putFieldPre` (escrita) e `getField` (leitura), tratando propriedades como estados independentes (teoria de Misra, 2001).
* **Cenário de Concorrência:**
  * `Base`: define `pedido = { subtotal: 100, taxa: 5 }`.
  * Linha 6 (`Branch L`): altera especificamente `pedido.taxa = 25`.
  * Linha 11 (`Branch R`): consome `pedido.taxa` ao totalizar a conta.
* **Resultado Esperado:**
  * Overriding Assignment (OA): **0**
  * Data Flow (DF): **1**

---

### 5. `test_dataflow_interproc.js` — Data Flow Interprocedural
* **Objetivo:** Validar que o fluxo de dados é rastreado através de fronteiras de chamadas de funções.
* **Cenário de Concorrência:**
  * Linha 4 (`Branch L`): altera a função produtora `setTaxa(v)` que altera a variável global `taxaServico`.
  * Linha 8 (`Branch R`): altera a função consumidora `calcularTotal(p)` que consome `taxaServico`.
* **Resultado Esperado:**
  * Overriding Assignment (OA): **0**
  * Data Flow (DF): **1**

---

## 🚀 Como Executar

### Execução Automatizada de Todos os Testes
Para rodar a suíte completa de uma só vez com relatório consolidado:
```bash
node experiments/run_all_toys.js
```

Ou via Docker:
```bash
docker compose up
```

### Execução de um Teste Específico
Você pode passar o número ou nome do teste diretamente para o runner:
```bash
node experiments/run_all_toys.js direct
# ou
node experiments/run_all_toys.js 2
```

Ou invocar diretamente o Jalangi2 passando a variável de ambiente `BRANCH_MAP`:
```bash
BRANCH_MAP='{"L":[4],"R":[8,9]}' node src/js/commands/jalangi.js \
  --inlineIID --inlineSource \
  --analysis experiments/analyses/analysis_dataflow.js \
  experiments/toys/test_dataflow_direct.js
```
