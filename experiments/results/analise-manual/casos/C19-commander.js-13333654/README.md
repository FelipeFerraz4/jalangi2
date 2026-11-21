# C19: commander.js, `index.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Revisores | Felipe, Italo |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`133336540f`](https://github.com/tj/commander.js/commit/133336540fd858c1163f1d3803fcf1d9300ceb64) (2014-08-12T15:39:09+00:00) |
| Base / Left / Right | [`963458a0`](https://github.com/tj/commander.js/blob/963458a078b727ba52ec9819e13a6d6cce0eab1f/index.js) / [`5a95ce18`](https://github.com/tj/commander.js/blob/5a95ce18bb4f1b7443bac83d3c329512cc442478/index.js) / [`d026976b`](https://github.com/tj/commander.js/blob/d026976b2d952fbc88916d70356f3f45268996ea/index.js) |
| Linhas alteradas no merge | L 72, R 3; executadas L 27/49, R 3/3 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 0, DF 2, CF 0 (2 registros em 2 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: possível renomeação ou movimentação |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada.

## Conflitos (por par de linhas)

### 1. DF direto: L 711 produz → R 719 consome

Estado: `args` · registros: 1

```js
// L 711    var args = this._args.map(function(arg){   // produz
// R 719    + (this._args.length ? ' ' + args.join(' ') : '');   // consome
```

Pilha de chamadas no momento: index.js:376 → index.js:490 → index.js:221 → index.js:889 → index.js:834 → index.js:817

### 2. DF direto: R 717 produz → L 721 consome

Estado: `usage` · registros: 1

```js
// R 717    var usage = '[options]'   // produz
// L 721    if (0 == arguments.length) return this._usage || usage;   // consome
```

Pilha de chamadas no momento: index.js:376 → index.js:490 → index.js:221 → index.js:889 → index.js:834 → index.js:817

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
