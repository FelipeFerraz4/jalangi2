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

Os 13 testes de DF (`src/test/java/br/unb/cic/analysis/df`) dependem de Soot e JUnit e não são traduzíveis. Cada um informa o que a Amanda anotava com `// Left` e `// Right` nas samples de OA:

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

| Teste | Análise | Esperado | Detectado | |
|---|---|:-:|:-:|---|
| ReachDefinitionAnalysisOneConflictTest | ReachDefinition | 1 | 1 | ✔ |
| ReachDefinitionAnalysisTransitiveSourceNoConflictTest | ReachDefinition | 0 | 0 | ✔ |
| ReachDefinitionAnalysisZeroConflictTest | ReachDefinition | 0 | 0 | ✔ |
| TaintedAnalysisOneConflictTest | Tainted | 1 | 1 | ✔ |
| ArrayTaintedAnalysisOneConflictTest | Tainted | 2 | 2 | ✔ |
| ArrayTaintedAnalysisOneConflictIndirectTest | Tainted | 2 | 0 | ✖ divergência intencional (índices independentes) |
| 6 testes Confluent* | Confluent | | | não executados: Confluence Flow não implementado |
| ContainmentConflictTest | DFPInterProcedural | | | não executado: sample de OA (`ioa`) |

* **ReachDefinition (3 de 3):** é a análise que a nossa equivale (definição que alcança o uso). Os três batem.
* **Tainted (2 de 3):** os testes rodam com `DATAFLOW_MODE=tainted`. A análise do Java é transitiva (se `x` contamina `y`, o uso de `y` conta), e o modo `tainted` faz o mesmo. Os dois testes que batem têm a contagem exata. No modo padrão (fluxo direto), `TaintedAnalysisOneConflictTest` detectaria 0.
* **A divergência que sobra é intencional.** No `ArrayIndirectDataFlowSample`, o Tainted do Java trata o array como um único elemento, então `arr[4] = 10` contamina a leitura de `arr[3]`. Aqui cada índice é um estado independente, como no OA, porque tratar o array inteiro gera falsos positivos (`arr[4]` e `arr[3]` são posições distintas). Se um dia quisermos igualar o Java nesse ponto, o caminho é uma opção separada, desligada por padrão.
* Os acertos dependem de a análise ser a mesma que o Java: com poucos casos e gabarito vindo de asserções comentadas, isto mostra consistência com o `conflict-static-analysis`, não precisão em código real.
