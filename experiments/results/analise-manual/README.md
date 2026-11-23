# Análise manual dos conflitos do lote

As 29 amostras em que a análise dinâmica detectou conflito no lote completo (976 amostras de merges reais, coleta Newminerjs). Cada pasta tem tudo o que é preciso para julgar o caso sem rodar nada.

## Como fazer

A análise é **por conflito**: um conflito foi sorteado de cada caso (29 no total, semente fixa), e cada um é julgado como interferência real ou falso positivo.

1. Abra a planilha [`../resultados.xlsx`](../resultados.xlsx), aba **Conflitos sorteados**: uma linha por caso, com o conflito sorteado (o número # é o do README do caso), as duas linhas, o código e de onde veio a branch de cada linha.
2. Abra a pasta do caso. `merge_anotado.js` é o `merge.js` com `[L]`, `[R]` e o papel de cada linha nos conflitos (`◀ #n`); o `README.md` lista os conflitos; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou; `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões.
3. Se uma linha do conflito não foi alterada por aquele lado ("herdou"), julgue a mudança verdadeira, isto é, a linha indicada. Compare base + só L, base + só R e o merge: o merge tem um comportamento que nenhum dos dois produz sozinho, ou quebra o que um dos lados queria?
4. Preencha as colunas amarelas da linha do caso.

**Grupos.** A: conflito direto e Left e Right alteraram a mesma função (candidatos mais fortes). B: conflito direto em funções diferentes ou sem correspondência estática (interferência indireta: o que distingue a análise dinâmica). C: só conflitos transitivos, ou arquivo gerado/minificado (suspeitos de falso positivo).

| Caso | Grupo | Projeto | Arquivo | Executado por | OA/DF/CF | Conflitos | Mesma função? |
|---|:-:|---|---|---|---|--:|---|
| [C01](casos/C01-ace-12ef5f9f) | A | ace | `lib/ace/lib/keys.js` | testes | 0/2/0 | 2 | Sim |
| [C02](casos/C02-vimium-0370d60b) | A | vimium | `commands.js` | arquivo | 0/3/0 | 3 | Sim |
| [C03](casos/C03-vimium-83be3670) | A | vimium | `linkHints.js` | arquivo | 0/2/0 | 2 | Sim |
| [C04](casos/C04-nodemon-6af96ec4) | A | nodemon | `lib/monitor/watch.js` | testes | 0/4/0 | 4 | Sim |
| [C05](casos/C05-request-5daa0b28) | A | request | `main.js` | testes | 0/18/6 | 24 | Sim |
| [C06](casos/C06-request-a353f4ee) | A | request | `main.js` | testes | 0/3/0 | 3 | Sim |
| [C07](casos/C07-request-b11988e3) | A | request | `index.js` | testes | 0/1/0 | 1 | Sim |
| [C08](casos/C08-nprogress-fbddeec8) | A | nprogress | `nprogress.js` | arquivo | 0/1/0 | 1 | Sim |
| [C09](casos/C09-commander.js-6ccb6397) | A | commander.js | `lib/commander.js` | testes | 0/84/0 | 84 | Sim |
| [C10](casos/C10-commander.js-7eaeaf3c) | A | commander.js | `index.js` | testes | 1/6/0 | 7 | Sim |
| [C11](casos/C11-commander.js-3242851d) | A | commander.js | `index.js` | testes | 0/1/0 | 1 | Sim |
| [C12](casos/C12-winston-d5e6297f) | A | winston | `lib/winston/common.js` | testes | 0/101/1 | 102 | Sim |
| [C13](casos/C13-ace-bb827051) | B | ace | `lib/ace/commands/command_manager.js` | testes | 0/5/0 | 5 | Não |
| [C14](casos/C14-nodemon-38c881f0) | B | nodemon | `nodemon.js` | arquivo | 0/10/0 | 10 | Inconclusivo |
| [C15](casos/C15-request-9863b272) | B | request | `request.js` | testes | 0/10/45 | 55 | Inconclusivo |
| [C16](casos/C16-request-b827a436) | B | request | `main.js` | testes | 0/2/0 | 2 | Não |
| [C17](casos/C17-commander.js-5091eacd) | B | commander.js | `index.js` | testes | 0/9/0 | 9 | Não |
| [C18](casos/C18-commander.js-12adc90f) | B | commander.js | `lib/commander.js` | testes | 0/4/0 | 4 | Não |
| [C19](casos/C19-commander.js-13333654) | B | commander.js | `index.js` | testes | 0/2/0 | 2 | Inconclusivo |
| [C20](casos/C20-webtorrent-9400efe1) | B | webtorrent | `lib/torrent.js` | testes | 0/10/0 | 10 | Inconclusivo |
| [C21](casos/C21-eslint-90239c00) | C | eslint | `lib/eslint.js` | testes | 0/3/0 | 3 | Não |
| [C22](casos/C22-eslint-9398227a) | C | eslint | `lib/eslint.js` | testes | 0/2/0 | 2 | Não |
| [C23](casos/C23-jsPDF-aa096114) | C | jsPDF | `dist/jspdf.amd.min.js` | arquivo | 0/14/0 | 14 | Sim |
| [C24](casos/C24-jsPDF-aa096114) | C | jsPDF | `dist/jspdf.min.js` | arquivo | 0/14/0 | 14 | Sim |
| [C25](casos/C25-request-92b2ac03) | C | request | `request.js` | testes | 0/1/6 | 7 | Inconclusivo |
| [C26](casos/C26-request-7f1a804c) | C | request | `request.js` | testes | 0/3/0 | 3 | Sim |
| [C27](casos/C27-request-7831b3b9) | C | request | `request.js` | testes | 0/1/0 | 1 | Inconclusivo |
| [C28](casos/C28-request-81e775c5) | C | request | `request.js` | testes | 0/0/1 | 1 | Inconclusivo |
| [C29](casos/C29-winston-d65753df) | C | winston | `lib/winston/transports/file.js` | testes | 0/0/8 | 8 | Não |

Histórico: uma primeira rodada por amostra, com três revisores, foi deixada de lado; as respostas preenchidas nela (Italo, 15 casos) estão em [`historico/`](historico/) e a conferência em [`CONFERENCIA_ITALO.md`](CONFERENCIA_ITALO.md).

Gerado por `experiments/results/gerar_casos.js` a partir do lote. Os arquivos de código pertencem aos autores de cada projeto e seguem a licença dele; estão aqui só para a pesquisa.
