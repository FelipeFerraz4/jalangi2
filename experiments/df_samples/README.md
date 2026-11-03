# Samples de Data Flow traduzidas (Java → JavaScript)

As 9 classes `sample` do repositório [`spgroup/conflict-static-analysis`](https://github.com/spgroup/conflict-static-analysis) (commit `8ab71e3`, pacote `br.unb.cic.analysis.samples`) que os testes de DF analisam, traduzidas para JavaScript.

## Origem

* **Tradução:** feita por Italo Correia com o JSweet 3.1.0 (abordagem A do estudo do repositório `tjtjdf`, execução `A-20261102-162118`, tjtjdf commit `c201121`). Cada classe recebeu um `main` no pré-passo do estudo, no fim do arquivo, sem deslocar as linhas existentes.
* **Conversão para ES5:** o JSweet gerou ES6 (`class`, `const`, `let`), que o Jalangi2 não consegue instrumentar. `to-es5.js` converte com o Babel usando `retainLines`, o que mantém cada comando na mesma linha do arquivo original. Assim, o mapa de linhas Java → JS vale para o ES6 e para o ES5.
* **Licença:** o `conflict-static-analysis` não tem arquivo de licença, e estes arquivos são derivados das samples dele. Eles estão aqui para a validação da análise. Confirme a permissão antes de redistribuí-los publicamente.

| Arquivo | SHA-256 do JS original (ES6, 16 primeiros caracteres) |
|---|---|
| `ArrayDataFlowSample.js` | `c905bb19384ee325` |
| `ArrayIndirectDataFlowSample.js` | `f1e7b34b9a04edb2` |
| `ConfluenceWithTransitivitySample.js` | `32c0e67243010a46` |
| `DoubleSourceSample.js` | `8da633a97344a07a` |
| `IntraproceduralDataFlow.js` | `d5f427b6859a8b6c` |
| `IntraproceduralIndirectSource.js` | `c7032cfb161670c3` |
| `SourceSinkMethodCallSample.js` | `b3db317135976f8f` |
| `SourceSinkVariableAttributionSample.js` | `fdcd39c8aee8915b` |
| `SourceSinkVariableAttributionWithAutoIncrement.js` | `502555e24a8d91de` |

## Como reconverter

```bash
npm install --prefix /tmp/babel @babel/core @babel/preset-env
NODE_PATH=/tmp/babel/node_modules node experiments/df_samples/to-es5.js <original.js> experiments/df_samples/es5/<Nome>.js
```

## Como os testes viram casos

Os 13 testes de DF e CF (`src/test/java/br/unb/cic/analysis/df`) dependem de Soot e JUnit e não são traduzíveis. Cada um informa o que a Amanda anotava com `// Left` e `// Right` nas samples de OA:

| Informação do teste | Uso aqui |
|---|---|
| Linhas de **source** | Branch **L** (interpretação: o source é a contribuição Left; a confirmar) |
| Linhas de **sink** | Branch **R** |
| Resultado esperado | Gabarito. As asserções estão **comentadas** no Java, exceto em `ContainmentConflictTest` |

As linhas do Java são convertidas para as do JS à mão e conferidas pelo runner (`experiments/run_df_suite.js`), que exige que cada linha mapeada contenha o comando esperado.

```bash
node experiments/run_df_suite.js                        # os 13 testes
node experiments/run_df_suite.js IntraproceduralDataFlow  # filtra e mostra o log da análise
```

## Resultado atual

A análise roda **uma única vez** por teste e reporta OA, DF e CF. Para comparar com cada análise do Java, o runner usa o detalhe de cada conflito (direto, quando o valor vem direto da escrita, ou transitivo, quando passou por outros valores): ReachDefinition é o DF direto, Tainted é o DF completo, Confluent é o CF direto e ConfluentTainted é o CF completo.

| Teste | Análise | Esperado | Detectado | |
|---|---|:-:|:-:|---|
| ReachDefinitionAnalysisOneConflictTest | ReachDefinition | 1 | 1 | ✔ |
| ReachDefinitionAnalysisTransitiveSourceNoConflictTest | ReachDefinition | 0 | 0 | ✔ |
| ReachDefinitionAnalysisZeroConflictTest | ReachDefinition | 0 | 0 | ✔ |
| TaintedAnalysisOneConflictTest | Tainted | 1 | 1 | ✔ |
| ArrayTaintedAnalysisOneConflictTest | Tainted | 2 | 2 | ✔ |
| ArrayTaintedAnalysisOneConflictIndirectTest | Tainted | 2 | 0 | ✖ divergência intencional (índices independentes) |
| ConfluenceWithTransitivityTest | ConfluentTainted | 1 | 1 | ✔ |
| SourceSinkConfluenceAnalysisMethodCallTest | Confluent | 1 | 1 | ✔ |
| SourceSinkConfluenceAnalysisOneConflictTest | Confluent | 1 | 1 | ✔ |
| SourceSinkConfluenceAnalysisVariableAttributionTest | Confluent | 1 | 1 | ✔ |
| SourceSinkVariableAttributionWithAutoIncrementConfluentTest | Confluent | 0 | 0 | ✔ |
| SourceSinkVariableAttributionWithAutoIncrementTaintedConfluentTest | ConfluentTainted | 1 | 1 | ✔ |
| ContainmentConflictTest | DFPInterProcedural | ≥ 1 | 1 | ✔ (aproximação) |

* **12 de 13 corretos, com a contagem exata em todos eles.**
* **ReachDefinition (3 de 3):** é a análise a que o DF direto equivale (definição que alcança o uso).
* **Tainted (2 de 3):** o Tainted do Java é transitivo (se `x` contamina `y`, o uso de `y` conta), e o DF transitivo da análise faz o mesmo. Um exemplo claro está em `IntraproceduralIndirectSource`: o teste de ReachDefinition espera 0 e o de Tainted espera 1, e a mesma execução responde aos dois: o fluxo de `x` até o `y` do sink existe, mas só passando por outro valor, então só o recorte do Tainted o conta.
* **A divergência que sobra é intencional.** No `ArrayIndirectDataFlowSample`, o Tainted do Java trata o array como um único elemento, então `arr[4] = 10` contamina a leitura de `arr[3]`. Aqui cada índice é um estado independente, como no OA, porque tratar o array inteiro gera falsos positivos (`arr[4]` e `arr[3]` são posições distintas).
* **Confluent (6 de 6):** o par `SourceSinkVariableAttributionWithAutoIncrement` mostra a diferença entre os dois recortes: com `x++` na Base, o Confluent espera 0 (a Base redefine `x`) e o ConfluentTainted espera 1 (`x` continua contaminado pelo source).
* **Containment:** a sample é de OA (pacote `ioa`) e não está entre as 9 traduzidas pelo Italo. Roda com a tradução da Amanda, lida do clone `../SCAz.js` (não é copiada para cá). O Java usa a análise DFP/SVFA, que não implementamos; aqui conta-se o Data Flow (direto + transitivo), então o resultado só confirma que o valor criado por L chega a R.
* Com poucos casos e o gabarito vindo de asserções comentadas, o resultado mostra consistência com o `conflict-static-analysis`, não precisão em código real.
