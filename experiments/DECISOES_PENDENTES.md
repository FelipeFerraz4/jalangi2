# Decisões pendentes

Limitações da análise que já têm causa conhecida e opções de correção, mas cuja correção muda o comportamento da análise e precisa ser decidida antes de ser feita. Cada item diz o que acontece, por quê, o que se ganha e o que se arrisca ao mudar, e como medir o efeito.

| # | Item | Registrado em | Estado |
|---|---|---|---|
| 1 | [Confluência interprocedural através de estado que sobrevive à chamada](#1-confluência-interprocedural-através-de-estado-que-sobrevive-à-chamada) | 21/11/2026 | **aguardando decisão** |
| 2 | [Falsos positivos sistemáticos: pilha de chamadas, comandos de várias linhas e linhas iguais nos dois lados](#2-falsos-positivos-sistemáticos-pilha-de-chamadas-comandos-de-várias-linhas-e-linhas-iguais-nos-dois-lados) | 23/11/2026 | **aguardando decisão** |

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

O teste está marcado com **`@Ignore` no Java**, mas **não está comprovado que o Java não detecta esse caso**. O histórico do `conflict-static-analysis` (commit `8ab71e3`) mostra:

- **Criado como caso que passava:** o teste e a sample entraram em `d83e014` (07/07/2020, Rafael Mota), num commit chamado *"Fix confluence analysis to work with interprocedural cases"*, com `@Test` ativo.
- **Desligado sem motivo registrado:** foi para `@Ignore` em `e772283` (16/02/2021, Rodrigo Bonifacio, *"mark some test cases as @ignore"*). Esse commit é a migração para uma nova versão do svfa-scala (`Node` → `LambdaNode`): no mesmo commit, outros testes de confluência tiveram o número esperado trocado de 1 para 2 e as asserções de texto comentadas. Não há motivo registrado para o `@Ignore` deste teste: ele pode ter deixado de passar com a nova versão, ou só não ter sido ajustado.
- **O algoritmo atual não exclui o caso em princípio:** `DFPConfluenceAnalysis` roda duas análises de fluxo de valores (source → Base e sink → Base) e cruza os caminhos que terminam no mesmo comando (`intersectPathsByLastNode`), com análise interprocedural ligada no teste. Os dois caminhos (`x` → `value` → `counter += value` e `y` → `value` → `counter += value`) existem no programa, então não há uma regra que descarte o caso, como a nossa regra do `viaParam`.

**Não foi possível rodar o teste:** a dependência `br.unb.cic:svfa-scala_2.12:0.5.11` só está no GitHub Packages (`maven.pkg.github.com/spgroup/svfa-scala`), que exige um token do GitHub com `read:packages`. Ela não está no cache local do Maven (só o registro de uma tentativa com erro 401, de 12/10/2026). Com o token, basta tirar o `@Ignore` numa cópia e rodar `mvn test -Dtest=DFPConfluenceAnalysisWithInterproceduralConfluenceTest`.

Até lá, a afirmação correta é: **o teste está desligado no Java desde 2021, sem motivo registrado; não sabemos se a versão atual o detecta.**

### Opções

| Opção | O que muda | Ganho | Risco |
|---|---|---|---|
| **A. Manter** (situação atual) | nada | sem dupla contagem; mesma regra de "cada corpo isolado" do Java intraprocedural | não detecta confluências que passam por estado guardado entre chamadas |
| **B. A marca `viaParam` vale só dentro da chamada** | ao gravar num alvo que sobrevive à chamada (campo de objeto, variável de closure ou global), a origem perde o `viaParam` | detecta o caso acima; é a interferência interprocedural que a análise dinâmica consegue ver e a estática não | mais CF em código real, possivelmente com dupla contagem; deixa de ser comparável um-para-um com o Java nesse ponto |
| **C. Como B, mas atrás de uma opção** (`ANALYSIS_CF_INTERPROC=1`), desligada por padrão | o mesmo que B, só quando pedido | permite medir antes de decidir; o padrão continua igual ao Java | mais um caminho de código para manter |

### Como medir antes de decidir

Com a opção C implementada:

1. **Suítes:** `node experiments/run_validation.js` e `node experiments/run_translation_study.js`. O esperado é o caso acima passar de 0 para 1 e nenhum outro mudar.
2. **Toys:** comparar as detecções de `node experiments/run_all_toys.js` com e sem a opção.
3. **Lote:** reconsolidar o lote completo (`execucoes/lote`) com a opção ligada, olhando o número de amostras com CF (hoje 7) e, nos registros novos, se são duplicatas de confluências já reportadas na chamada ou casos novos.

### Decisão

*A ser tomada.* Para a apresentação e o texto, o caso entra como **limitação conhecida da análise**, com a observação de que o teste correspondente está desligado (`@Ignore`) no `conflict-static-analysis` desde 2021, sem motivo registrado. Não se deve afirmar que é uma limitação também do Java antes de rodar o teste (veja "Situação de referência").

---

## 2. Falsos positivos sistemáticos: pilha de chamadas, comandos de várias linhas e linhas iguais nos dois lados

### Origem

A conferência da análise manual do Italo (`results/analise-manual/CONFERENCIA_ITALO.md`) e os primeiros casos da análise manual por conflito (aba *Conflitos sorteados*) mostraram que, em parte dos falsos positivos, o problema não é só "a mudança preserva o valor": são três regras da análise e do mapa que atribuem a uma branch código que ela não mudou de verdade.

### Os três mecanismos

| # | Mecanismo | Onde está | Casos | O que acontece |
|---|---|---|---|---|
| a | **Pilha de chamadas** | `effectiveBranch` / `stackBranch` em `analysis_dataflow.js` (regra interprocedural de Moraes et al.) | C03, C16, C19 (e C17, que é real) | Uma operação numa linha da base, executada dentro de uma chamada feita numa linha alterada, herda a branch dessa linha. Se a linha da chamada mudou só na forma (no C16, um `;` em `self.end()`; no C03, a chamada foi movida para dentro de um objeto, sem mudar), toda a função chamada vira "do R" ou "do L". |
| b | **Comando de várias linhas** | `getBranch` varre todas as linhas do intervalo da operação, e a última linha mapeada vence | C01 | `var ret = { ... }` vai da linha 43 à 108; uma vírgula removida na linha 106 faz a escrita de `ret` ser "do L". |
| c | **Linha igual nos dois lados vale L** | `experiments/tools/line-map.js:104` (convenção do SCAz.js) | C13, C23 | Uma linha que os dois lados introduziram igual é marcada como L e entra em conflito com linhas do R. |

### Por que a regra da pilha existe (e não pode simplesmente sair)

A mudança de um lado, muitas vezes, é **acrescentar uma chamada**, e o efeito dela acontece dentro da função chamada, em código da base. É o caso de `ConfluenceBaseSample`, um dos testes de confluência do `conflict-static-analysis` que rodamos: o L acrescenta `s.countDupWhitespace()` e o R acrescenta `s.countDupWords()`; as escritas (`this.spaces = new Integer(1)`, `this.words = new Integer(2)`) estão em métodos da base, e o `return s.spaces + s.words` é a confluência que o teste espera. Sem a regra da pilha, essas escritas seriam da base e o conflito não apareceria. A regra segue o algoritmo interprocedural do artigo da Amanda.

**Alternativa descartada: atribuir só pela origem dos dados** (tirar o `|| stackBranch()` e deixar só a origem dos valores, que a análise já propaga pelos parâmetros). Ela resolve o C03 e o C18, e mantém o C17 (onde o valor do R entra por argumento), mas quebra o `ConfluenceBaseSample`: as chamadas não passam valores e as escritas são constantes, então só a pilha liga as escritas ao L e ao R.

**Onde a regra erra:** ela supõe que "a linha da chamada foi alterada, então a chamada é uma contribuição daquele lado". A premissa falha quando a chamada já existia e a linha só mudou de forma (C03: movida; C16: `;`). Quando a chamada é de fato nova, a herança é legítima, mesmo que o conflito resultante seja inofensivo. No C18, o R acrescentou `this.version(...)`, e o que roda dentro dela (registrar a opção de versão) é efeito do R; o DF até o L é verdadeiro pela lógica da Amanda, só não muda o comportamento.

### Opções

| Mecanismo | Opção | Ganho | Risco |
|---|---|---|---|
| a | **Herdar pela pilha só quando a chamada for nova ou tiver mudado**: comparar a linha da chamada com a da base (ou a de onde ela foi movida) sem espaços, pontuação final e o que está à esquerda da chamada; se a função chamada e os argumentos são os mesmos, não herdar | remove a herança por chamadas só movidas, reindentadas ou com pontuação (C03, C16, C19), e mantém a de chamadas acrescentadas (`ConfluenceBaseSample`, C17, C18) | precisa do texto da base (e da posição de origem, para código movido) junto do mapa; hoje o mapa só tem a branch de cada linha |
| a | Limitar a herança pela pilha à chamada direta (profundidade 1) | menos atribuição em cadeia | perde interferência real em chamadas profundas (o C17 usa profundidade 2) e não resolve o C03 nem o C16, que são de profundidade 1 |
| a | ~~Atribuir só pela origem dos dados~~ | | descartada: quebra o `ConfluenceBaseSample` (veja acima) |
| b | Atribuir a operação pela linha onde ela começa (ou pela do nó que escreve), e não por qualquer linha do intervalo | um literal grande deixa de herdar a branch de uma linha interna | perde o caso em que a linha alterada é de fato o valor escrito (por exemplo, um argumento numa chamada de várias linhas; veja o toy 28) |
| c | Marcar linhas iguais nos dois lados como de nenhuma branch (ou "ambas", sem conflito entre elas) | remove conflitos entre mudanças idênticas | sai da convenção do SCAz.js (os 72 casos de OA usam o mapa da Amanda, então não são afetados, mas o lote precisa ser reconsolidado) |

### Como medir antes de decidir

Para cada um dos 384 registros do lote (`conflitos.csv`), classificar se depende de cada mecanismo:
- (a) a linha de alguma das branches foi atribuída pela pilha, e não pelo mapa (o relatório guarda a pilha de cada conflito); e, desses, se a chamada que deu a herança é nova ou só mudou de forma;
- (b) a linha da operação não é a linha mapeada (comando de várias linhas);
- (c) a linha está entre as "iguais nos dois lados" do mapa.

Depois, contar quantas das 29 amostras deixam de ter conflito sem os registros de cada mecanismo, e comparar com a análise manual por conflito (aba *Conflitos sorteados*: as colunas "Existe um conflito do tipo que a ferramenta mencionou?" e "Interferência é real?" são o gabarito). Se os mecanismos explicam a maior parte dos falsos positivos, a correção melhora a precisão sem perder os casos reais (C17 e os que a análise manual confirmar). Qualquer correção tem de manter os 72 casos de OA, os 13 testes de DF/CF (inclusive o `ConfluenceBaseSample`, nas traduções do Italo) e os 33 toys.

### Decisão

*A ser tomada*, depois da análise manual por conflito (29 conflitos sorteados) e da medição acima.

