# C27: request, `request.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`7831b3b99b`](https://github.com/request/request/commit/7831b3b99b926790df657f6cb17da79d444452ea) (2014-10-01T16:16:07+00:00) |
| Base / Left / Right | [`95569d55`](https://github.com/request/request/blob/95569d5509e9c25db678198cbc0183c86cd0c2d3/request.js) / [`4ed9789f`](https://github.com/request/request/blob/4ed9789f296f438c2d4d013da60c61a9e20cf273/request.js) / [`cc0c6a98`](https://github.com/request/request/blob/cc0c6a9804ee03eb1530c752a59c0d3a53527f6b/request.js) |
| Linhas alteradas no merge | L 18, R 4; executadas L 17/17, R 3/3 |
| Como executou | suíte de testes do projeto: `node tests/run.js` |
| Detectado | OA 0, DF 1, CF 0 (1 registros em 1 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: correspondência ambígua |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: R 587 produz → L 612 consome

Estado: `Object#85.error_connecting`, `Object#91.error_connecting`, `Object#107.error_connecting`, `Object#95.error_connecting`, `Object#99.error_connecting`, `Object#103.error_connecting` · registros: 1 · via parâmetro: 1

```js
// R 587    for (var r in lookup_table){   // produz
// L 612    if(typeof lookup_table[r].error_connecting === 'undefined')   // consome
```

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
