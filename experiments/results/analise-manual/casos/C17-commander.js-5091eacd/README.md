# C17: commander.js, `index.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`5091eacd67`](https://github.com/tj/commander.js/commit/5091eacd67c57150ad8a3b178249ee818a587ddf) (2015-03-19T01:00:56+00:00) |
| Base / Left / Right | [`070dd26c`](https://github.com/tj/commander.js/blob/070dd26cdd975d6c8d4ac84adfda12fa98f7e663/index.js) / [`6134fe44`](https://github.com/tj/commander.js/blob/6134fe44992a301485b087cc7d74a2634311e99d/index.js) / [`fdc3c295`](https://github.com/tj/commander.js/blob/fdc3c2958b528c8bb937ef00ddbe24f6001b9c24/index.js) |
| Linhas alteradas no merge | L 208, R 14; executadas L 26/97, R 6/6 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 0, DF 9, CF 0 (9 registros em 9 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: R 184 produz → L 221 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 184    return this.parseExpectedArgs(desc.split(/ +/));   // produz
// L 221    argDetails.name = arg.slice(1, -1);   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 2. DF transitivo: R 184 produz → L 224 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 184    return this.parseExpectedArgs(desc.split(/ +/));   // produz
// L 224    argDetails.name = arg.slice(1, -1);   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 3. DF transitivo: R 184 produz → L 228 consome

Estado: `Object#63.name`, `Object#69.name` · registros: 1 · via parâmetro: 1

```js
// R 184    return this.parseExpectedArgs(desc.split(/ +/));   // produz
// L 228    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 4. DF transitivo: R 184 produz → L 232 consome

Estado: `Object#63.name`, `Object#69.name` · registros: 1 · via parâmetro: 1

```js
// R 184    return this.parseExpectedArgs(desc.split(/ +/));   // produz
// L 232    if (argDetails.name) {   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 5. DF direto: R 210 produz → L 233 consome

Estado: `self` · registros: 1

```js
// R 210    var self = this;   // produz
// L 233    self._args.push(argDetails);   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 6. DF direto: R 211 produz → L 221 consome

Estado: `arg` · registros: 1

```js
// R 211    args.forEach(function(arg) {   // produz
// L 221    argDetails.name = arg.slice(1, -1);   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 7. DF direto: R 211 produz → L 224 consome

Estado: `arg` · registros: 1

```js
// R 211    args.forEach(function(arg) {   // produz
// L 224    argDetails.name = arg.slice(1, -1);   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 8. DF transitivo: R 211 produz → L 228 consome

Estado: `Object#63.name`, `Object#69.name` · registros: 1 · via parâmetro: 1

```js
// R 211    args.forEach(function(arg) {   // produz
// L 228    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

### 9. DF transitivo: R 211 produz → L 232 consome

Estado: `Object#63.name`, `Object#69.name` · registros: 1 · via parâmetro: 1

```js
// R 211    args.forEach(function(arg) {   // produz
// L 232    if (argDetails.name) {   // consome
```

Pilha de chamadas no momento: index.js:184 → index.js:211

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
