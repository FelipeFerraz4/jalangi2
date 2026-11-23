# C22: eslint, `lib/eslint.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Projeto | [eslint__eslint](https://github.com/eslint/eslint) |
| Merge | [`9398227ac4`](https://github.com/eslint/eslint/commit/9398227ac4be2e8892c3ae8fa023842e13486e61) (2015-02-07T21:09:15+00:00) |
| Base / Left / Right | [`b3e709b7`](https://github.com/eslint/eslint/blob/b3e709b70863da080563f067ed5c3400d6a5340a/lib/eslint.js) / [`c217187e`](https://github.com/eslint/eslint/blob/c217187e9745bc11f47764e2f25304338fac9998/lib/eslint.js) / [`accca0b7`](https://github.com/eslint/eslint/blob/accca0b7d21d96e33fe542b87bf79ac17d541f08/lib/eslint.js) |
| Linhas alteradas no merge | L 22, R 2; executadas L 5/13, R 2/2 |
| Como executou | suíte de testes do projeto: `node Makefile.js test` |
| Detectado | OA 0, DF 2, CF 0 (2 registros em 2 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: L 11 produz → R 846 consome

Estado: `parent` · registros: 1 · via parâmetro: 1

```js
// L 11     var estraverse = require("estraverse-fb"),   // produz
// R 846    while (parent && !parent.leadingComments && !/Function/.test(parent.type)) {   // consome
```

Pilha de chamadas no momento: eslint.js:666 → eslint.js:681

### 2. DF transitivo: L 558 produz → R 846 consome

Estado: `parent` · registros: 1 · via parâmetro: 1

```js
// L 558    config = prepareConfig(config || {});   // produz
// R 846    while (parent && !parent.leadingComments && !/Function/.test(parent.type)) {   // consome
```

Pilha de chamadas no momento: eslint.js:666 → eslint.js:681

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [eslint__eslint](https://github.com/eslint/eslint) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
