# C11: commander.js, `index.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`3242851db8`](https://github.com/tj/commander.js/commit/3242851db882cf844991e2deca0d303b45295fe0) (2014-07-28T23:26:47+00:00) |
| Base / Left / Right | [`fa2ce5cc`](https://github.com/tj/commander.js/blob/fa2ce5cce27e85f736b0c41d9b7dafe209cdb4d7/index.js) / [`4e839c2f`](https://github.com/tj/commander.js/blob/4e839c2fc58f7356c3e63894226f7d9b72abafc0/index.js) / [`fa3aa3fc`](https://github.com/tj/commander.js/blob/fa3aa3fc008df846e19ea90746b10c176abff254/index.js) |
| Linhas alteradas no merge | L 46, R 5; executadas L 22/31, R 3/3 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 0, DF 1, CF 0 (1 registros em 1 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Command.prototype.normalize |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 447 produz → R 454 consome

Estado: `lastOpt` · registros: 1

```js
// L 447    lastOpt = this.optionFor(args[i-1]);   // produz
// R 454    } else if (lastOpt && lastOpt.required) {   // consome
```

Pilha de chamadas no momento: index.js:373

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
