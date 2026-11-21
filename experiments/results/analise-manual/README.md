# Análise manual dos conflitos do lote

As 29 amostras em que a análise dinâmica detectou conflito no lote completo (976 amostras de merges reais, coleta Newminerjs). Cada pasta tem tudo o que é preciso para julgar o caso sem rodar nada.

## Como fazer

1. Abra a planilha [`../resultados.xlsx`](../resultados.xlsx) (ou a cópia no Google Sheets), aba **Análise - \<seu nome\>**: lá estão os seus 15 casos.
2. Para cada caso, abra a pasta abaixo. O `README.md` mostra cada conflito com o código das linhas de L, R e base (linhas do `merge.js`, a versão executada). `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões do arquivo; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou.
3. Decida se a interferência é **real**: o comportamento do merge depende das duas mudanças juntas de um jeito que nenhuma delas produz sozinha? Ou é um falso positivo (por exemplo, uma refatoração que não muda o valor, um fluxo transitivo que não carrega a mudança, um arquivo gerado)?
4. Preencha as colunas amarelas da sua aba. Não precisa conversar antes: nos casos com dois revisores, a aba **Concordância** compara as respostas, e só os desacordos são discutidos.

**Grupos.** A: conflito direto e Left e Right alteraram a mesma função (candidatos mais fortes). B: conflito direto em funções diferentes ou sem correspondência estática (interferência indireta: o que distingue a análise dinâmica). C: só conflitos transitivos, ou arquivo gerado/minificado (suspeitos de falso positivo).

**Divisão.** 15 casos por pessoa: 16 casos têm dois revisores (6, 5 e 5 por dupla), para medir a concordância, e 13 têm um.

| Caso | Grupo | Revisores | Projeto | Arquivo | Executado por | OA/DF/CF | Pares | Mesma função? |
|---|:-:|---|---|---|---|---|--:|---|
| [C01](casos/C01-ace-12ef5f9f) | A | Felipe + Italo | ace | `lib/ace/lib/keys.js` | testes | 0/2/0 | 2 | Sim |
| [C02](casos/C02-vimium-0370d60b) | A | Priscila | vimium | `commands.js` | arquivo | 0/3/0 | 3 | Sim |
| [C03](casos/C03-vimium-83be3670) | A | Felipe + Priscila | vimium | `linkHints.js` | arquivo | 0/2/0 | 2 | Sim |
| [C04](casos/C04-nodemon-6af96ec4) | A | Italo | nodemon | `lib/monitor/watch.js` | testes | 0/4/0 | 4 | Sim |
| [C05](casos/C05-request-5daa0b28) | A | Italo + Priscila | request | `main.js` | testes | 0/18/6 | 24 | Sim |
| [C06](casos/C06-request-a353f4ee) | A | Felipe | request | `main.js` | testes | 0/3/0 | 3 | Sim |
| [C07](casos/C07-request-b11988e3) | A | Felipe + Italo | request | `index.js` | testes | 0/1/0 | 1 | Sim |
| [C08](casos/C08-nprogress-fbddeec8) | A | Priscila | nprogress | `nprogress.js` | arquivo | 0/1/0 | 1 | Sim |
| [C09](casos/C09-commander.js-6ccb6397) | A | Felipe + Priscila | commander.js | `lib/commander.js` | testes | 0/84/0 | 84 | Sim |
| [C10](casos/C10-commander.js-7eaeaf3c) | A | Italo | commander.js | `index.js` | testes | 1/6/0 | 7 | Sim |
| [C11](casos/C11-commander.js-3242851d) | A | Italo + Priscila | commander.js | `index.js` | testes | 0/1/0 | 1 | Sim |
| [C12](casos/C12-winston-d5e6297f) | A | Felipe | winston | `lib/winston/common.js` | testes | 0/101/1 | 102 | Sim |
| [C13](casos/C13-ace-bb827051) | B | Felipe + Italo | ace | `lib/ace/commands/command_manager.js` | testes | 0/5/0 | 5 | Não |
| [C14](casos/C14-nodemon-38c881f0) | B | Priscila | nodemon | `nodemon.js` | arquivo | 0/10/0 | 10 | Inconclusivo |
| [C15](casos/C15-request-9863b272) | B | Felipe + Priscila | request | `request.js` | testes | 0/10/45 | 55 | Inconclusivo |
| [C16](casos/C16-request-b827a436) | B | Italo | request | `main.js` | testes | 0/2/0 | 2 | Não |
| [C17](casos/C17-commander.js-5091eacd) | B | Italo + Priscila | commander.js | `index.js` | testes | 0/9/0 | 9 | Não |
| [C18](casos/C18-commander.js-12adc90f) | B | Felipe | commander.js | `lib/commander.js` | testes | 0/4/0 | 4 | Não |
| [C19](casos/C19-commander.js-13333654) | B | Felipe + Italo | commander.js | `index.js` | testes | 0/2/0 | 2 | Inconclusivo |
| [C20](casos/C20-webtorrent-9400efe1) | B | Priscila | webtorrent | `lib/torrent.js` | testes | 0/10/0 | 10 | Inconclusivo |
| [C21](casos/C21-eslint-90239c00) | C | Felipe + Priscila | eslint | `lib/eslint.js` | testes | 0/3/0 | 3 | Não |
| [C22](casos/C22-eslint-9398227a) | C | Italo | eslint | `lib/eslint.js` | testes | 0/2/0 | 2 | Não |
| [C23](casos/C23-jsPDF-aa096114) | C | Italo + Priscila | jsPDF | `dist/jspdf.amd.min.js` | arquivo | 0/14/0 | 14 | Sim |
| [C24](casos/C24-jsPDF-aa096114) | C | Felipe | jsPDF | `dist/jspdf.min.js` | arquivo | 0/14/0 | 14 | Sim |
| [C25](casos/C25-request-92b2ac03) | C | Felipe + Italo | request | `request.js` | testes | 0/1/6 | 7 | Inconclusivo |
| [C26](casos/C26-request-7f1a804c) | C | Priscila | request | `request.js` | testes | 0/3/0 | 3 | Sim |
| [C27](casos/C27-request-7831b3b9) | C | Felipe + Priscila | request | `request.js` | testes | 0/1/0 | 1 | Inconclusivo |
| [C28](casos/C28-request-81e775c5) | C | Italo + Priscila | request | `request.js` | testes | 0/0/1 | 1 | Inconclusivo |
| [C29](casos/C29-winston-d65753df) | C | Felipe + Italo | winston | `lib/winston/transports/file.js` | testes | 0/0/8 | 8 | Não |

| Revisor | Casos |
|---|---|
| Felipe | C01, C03, C06, C07, C09, C12, C13, C15, C18, C19, C21, C24, C25, C27, C29 |
| Italo | C01, C04, C05, C07, C10, C11, C13, C16, C17, C19, C22, C23, C25, C28, C29 |
| Priscila | C02, C03, C05, C08, C09, C11, C14, C15, C17, C20, C21, C23, C26, C27, C28 |

Gerado por `experiments/results/gerar_casos.js` a partir do lote. Os arquivos de código pertencem aos autores de cada projeto e seguem a licença dele; estão aqui só para a pesquisa.
