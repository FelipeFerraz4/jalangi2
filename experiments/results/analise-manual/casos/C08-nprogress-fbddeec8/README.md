# C08: nprogress, `nprogress.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Projeto | [rstacruz__nprogress](https://github.com/rstacruz/nprogress) |
| Merge | [`fbddeec8c3`](https://github.com/rstacruz/nprogress/commit/fbddeec8c37f138da649cdb5a19a0c1a9d3c87cd) (2014-03-26T12:04:51+00:00) |
| Base / Left / Right | [`a2e97888`](https://github.com/rstacruz/nprogress/blob/a2e978889e89fe150e54a1652a473832515d0470/nprogress.js) / [`596cc5ed`](https://github.com/rstacruz/nprogress/blob/596cc5ede695dbf6b7c5e9f35ad56b1b47e40d2c/nprogress.js) / [`538b3398`](https://github.com/rstacruz/nprogress/blob/538b33984892456c69a7917c1ffd2da91de30728/nprogress.js) |
| Linhas alteradas no merge | L 36, R 183; executadas L 3/16, R 21/92 |
| Como executou | carregando só o arquivo (`node merge.js`) |
| Detectado | OA 0, DF 1, CF 0 (1 registros em 1 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: callback de function(factory) { if (typeof module === 'function') { module.exports = factory(this.jQuery || require('jquery')); } else if (typeof define === 'function' && define.amd) { define(['jquery'], function($) { return factory($); }); } else { th (argumento 1) |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: R 15 produz → L 186 consome

Estado: `NProgress` · registros: 1

```js
// R 15     var NProgress = {};   // produz
// L 186    NProgress.promise = function($promise) {   // consome
```

Pilha de chamadas no momento: nprogress.js:4 → nprogress.js:11 → nprogress.js:183

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [rstacruz__nprogress](https://github.com/rstacruz/nprogress) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
