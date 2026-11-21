# Decisões pendentes

Limitações da análise que já têm causa conhecida e opções de correção, mas cuja correção muda o comportamento da análise e precisa ser decidida antes de ser feita. Cada item diz o que acontece, por quê, o que se ganha e o que se arrisca ao mudar, e como medir o efeito.

| # | Item | Registrado em | Estado |
|---|---|---|---|
| 1 | [Confluência interprocedural através de estado que sobrevive à chamada](#1-confluência-interprocedural-através-de-estado-que-sobrevive-à-chamada) | 21/11/2026 | **aguardando decisão** |

---

## 1. Confluência interprocedural através de estado que sobrevive à chamada

### O caso

`InterproceduralConfluenceSample` do `conflict-static-analysis` (teste `DFPConfluenceAnalysisWithInterproceduralConfluenceTest`, pacote `svfa/confluence`):

```java
public void interproceduralSample() {
    int x = 0;
    int y = 0;
    x = x + 1;            // linha 10: source (L)
    y = y + 2;            // linha 12: sink (R)
    incrementCounter(x);  // Base
    incrementCounter(y);  // Base
}
public void incrementCounter(int value) {
    counter += value;     // Base
}
```

1. Na 1ª chamada, `value` é o `x` de L, e `counter` passa a guardar um valor que veio de L.
2. Na 2ª chamada, `value` é o `y` de R, e `counter += value` lê `counter` (de L) e `value` (de R).

No passo 2, um comando da Base usa, ao mesmo tempo, um valor de L e um de R. Pela definição, é uma confluência, e o teste espera 1.

**A análise encontra 0**, nas quatro traduções (atual, A, B e C; veja `run_translation_study.js`).

### Por quê

Em `experiments/analyses/analysis_dataflow.js`, a função `reportConfluence` descarta de propósito as origens marcadas como `viaParam`, ou seja, valores que entraram na função por parâmetro:

```js
var sources = pending.filter(function (o) { return o.branch === "L" && !o.viaParam; });
var sinks   = pending.filter(function (o) { return o.branch === "R" && !o.viaParam; });
```

A regra existe por dois motivos:

- **Evitar contagem dupla:** em `soma(a, b)`, com `a` de L e `b` de R, a confluência já é reportada no ponto da chamada. Sem a regra, ela seria contada de novo em `return p + q` dentro de `soma`.
- **Seguir o Java:** lá, cada corpo de método é analisado isoladamente.

O problema aqui é que, na 1ª chamada, o `counter` (um campo de objeto, que sobrevive à chamada) herda a marca `viaParam` do `value`. Na 2ª chamada, as duas origens estão marcadas e as duas são descartadas.

### Situação de referência

O teste está marcado com **`@Ignore` no Java**: o próprio SVFA do `conflict-static-analysis` não detecta esse caso. Por isso, hoje a análise **coincide com a ferramenta de referência**. Não é uma regressão.

### Opções

| Opção | O que muda | Ganho | Risco |
|---|---|---|---|
| **A. Manter** (situação atual) | nada | equivalência com o Java; sem dupla contagem | não detecta confluências que passam por estado guardado entre chamadas |
| **B. A marca `viaParam` vale só dentro da chamada** | ao gravar num alvo que sobrevive à chamada (campo de objeto, variável de closure ou global), a origem perde o `viaParam` | detecta o caso acima; é a interferência interprocedural que a análise dinâmica consegue ver e a estática não | mais CF em código real, possivelmente com dupla contagem; deixa de ser comparável um-para-um com o Java nesse ponto |
| **C. Como B, mas atrás de uma opção** (`ANALYSIS_CF_INTERPROC=1`), desligada por padrão | o mesmo que B, só quando pedido | permite medir antes de decidir; o padrão continua igual ao Java | mais um caminho de código para manter |

### Como medir antes de decidir

Com a opção C implementada:

1. **Suítes:** `node experiments/run_validation.js` e `node experiments/run_translation_study.js`. O esperado é o caso acima passar de 0 para 1 e nenhum outro mudar.
2. **Toys:** comparar as detecções de `node experiments/run_all_toys.js` com e sem a opção.
3. **Lote:** reconsolidar o lote completo (`execucoes/lote`) com a opção ligada, olhando o número de amostras com CF (hoje 7) e, nos registros novos, se são duplicatas de confluências já reportadas na chamada ou casos novos.

### Decisão

*A ser tomada.* Para a apresentação e o texto, o caso entra como **limitação conhecida, compartilhada com a ferramenta Java** (o teste é `@Ignore` lá).
