# Conferência da análise manual do Italo

Conferência, feita em 23/11/2026, dos 15 casos que o Italo preencheu na aba *Análise - Italo* da `resultados.xlsx`. Para cada caso foram checados os diffs dos dois lados, as linhas do conflito, o código do `merge.js` e o mapa de linhas. É material para discussão: o veredito final de cada caso fica na aba *Concordância*, depois do debate.

**Resultado:** concordância em 14 dos 15 vereditos. A divergência é o C04. Em 4 casos o veredito está certo, mas o motivo pelo qual a ferramenta apontou o conflito é outro (veja "Mecanismos").

| Caso | Italo | Conferência | Observação |
|---|---|---|---|
| C01 ace `keys.js` | Não | concorda | O L só tirou uma vírgula (linha 106). Mecanismo: `var ret = { ... }` vai da linha 43 à 108, e o comando inteiro herda a branch da linha 106 (comando de várias linhas). |
| C04 nodemon `watch.js` | **Sim (DF)** | **diverge: Não ou Dúvida** | Veja abaixo. |
| C05 request `main.js` | Não | concorda | No redirecionamento, a linha 455 chama `request(self, ...)`, e o novo `Request` copia todas as propriedades (linha 89), inclusive `originalCookieHeader`. Os DF vêm de `var self = this` (L 79) e do laço de cópia (L 89), que o L só reescreveu com `self`. |
| C07 request `index.js` | Não | concorda | Com o R, `pass` é sempre string; o relaxamento do L (`pass !== undefined && ...`) não muda nada nesse caminho. Redundância. |
| C10 commander `index.js` | Não | concorda | `this._name \|\| basename(...)` (L 446) dá o mesmo com `''` e com `undefined`: o único OA do lote é inofensivo. A dúvida sobre `usage` não se confirma (o nome é definido no `parse`, antes da ajuda). Única diferença combinada: o `name()`, que o L criou (linha 885), devolve `''` em vez de `undefined` antes do `parse`. Irrelevante, e não é apontada pela análise. |
| C11 commander `index.js` | Não | concorda | `if (i > 0) { lastOpt = ... }` tem a mesma semântica de `i > 0 && (...)`. |
| C13 ace `command_manager.js` | Não | concorda | Os **dois** lados trocaram `'string'` por `"string"` na linha 42, e o mapa atribui a linha ao L (regra "igual nos dois lados vale L"). |
| C16 request `main.js` | Não | concorda, **outra causa** | O mapa marca como R só as linhas 346 a 349. A linha 397 (`var self = this`, em `start()`) virou R pela pilha de chamadas: a linha 349 do R chama `self.end()` → `start()`. E na linha 349 o R só acrescentou `;` e mudou a indentação. |
| C17 commander `index.js` | Sim (DF) | concorda | O R cria `arguments()`, que chama `parseExpectedArgs`, e o L reescreveu `parseExpectedArgs` para aceitar argumentos variádicos. `program.arguments('<cmd> [env...]')` só gera variádicos com os dois lados. Composição benigna, mas real. |
| C19 commander `index.js` | Não | concorda, **outra causa** | Não é erro do mapa: as linhas 711 e 721 de `usage()` não estão no mapa como L. Viraram L pela pilha de chamadas, porque o código de ajuda que o L reescreveu chama `this.usage()` (pilha 834 → 817). O L só exibe a string que o R reformatou: preocupações independentes. |
| C22 eslint `eslint.js` | Não | concorda | O L muda o carregamento do parser e o R amplia o teste `/Function/`. Registros transitivos, por parâmetro. |
| C23 jsPDF `dist/jspdf.amd.min.js` | Não | concorda | `merge.js` é byte a byte igual a `right.js`. Além de ser arquivo gerado, as linhas "do L" (57, 58) estão iguais no L e no R e viraram L pela regra do mapa. |
| C25 request `request.js` | Não | concorda | O L só move o `var qs` para antes do `if` (mesma semântica). |
| C28 request `request.js` | Não | concorda | A linha do L redireciona para o mesmo `self.uri`; o protocolo, e com ele o `isHttps` da confluência, não muda. |
| C29 winston `transports/file.js` | Não | concorda | O R muda o tamanho das entradas (logstash) e o L muda quando ocorre o flush; o `_size` soma as duas coisas sem comportamento novo. |

## C04: por que a conferência diverge

O Italo escreveu que, no merge, "diretórios ignorados sem '/' passam a ser podados" e que "nenhum dos dois produz isso sozinho". O L sozinho já produz isso. Para um item ignorado como `node_modules`, sem barra no fim, o `find` recebe:

| Versão | Expressão gerada | Conteúdo da pasta é ignorado? |
|---|---|---|
| Base | `! -ipath "dir/node_modules"` | não (era o bug) |
| Só R | `! -ipath "dir/node_modules*"` e `! -ipath "dir/node_modules"` | sim, por exclusão |
| Só L | `-ipath "dir/node_modules" -prune` | sim: o `-prune` no próprio diretório impede o `find` de entrar |
| Merge | `-ipath "dir/node_modules*" -prune -or -ipath "dir/node_modules" -prune` | sim (praticamente o mesmo conjunto) |

Os dois lados corrigiram o mesmo bug de formas diferentes: é redundância, como no C07, e não interferência. A única diferença do merge é podar também caminhos com o mesmo prefixo (`node_modules_old`), e isso o R sozinho já fazia por exclusão. **A discutir.**

## Mecanismos de falso positivo que a conferência revelou

Registrados em [`../../DECISOES_PENDENTES.md`](../../DECISOES_PENDENTES.md#2-falsos-positivos-sistemáticos-pilha-de-chamadas-comandos-de-várias-linhas-e-linhas-iguais-nos-dois-lados) (item 2):

1. **A pilha de chamadas amplifica mudanças cosméticas** (C16, C19; é também o mecanismo do C17, que é real). Tudo o que executa dentro de uma chamada feita numa linha alterada herda a branch dessa linha, mesmo que a alteração seja só um `;`.
2. **Comando de várias linhas** (C01). O comando inteiro herda a branch de qualquer linha alterada dentro dele.
3. **"Linha igual nos dois lados vale L"** (C13, C23). Uma mudança idêntica nos dois lados vira linha do L e gera conflito com o R.
