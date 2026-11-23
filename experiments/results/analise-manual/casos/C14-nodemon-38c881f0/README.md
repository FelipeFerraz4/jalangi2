# C14: nodemon, `nodemon.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Revisores | Priscila |
| Projeto | [remy__nodemon](https://github.com/remy/nodemon) |
| Merge | [`38c881f03e`](https://github.com/remy/nodemon/commit/38c881f03ef4ba24b2f5aa7f7d2a8ce7d575299b) (2011-12-18T16:52:53+00:00) |
| Base / Left / Right | [`efed7b81`](https://github.com/remy/nodemon/blob/efed7b812a8026480f1a711f844d5cd8d9223222/nodemon.js) / [`990c8826`](https://github.com/remy/nodemon/blob/990c8826d4810d2c6e959f328f128d8e38c4ddc2/nodemon.js) / [`f600811e`](https://github.com/remy/nodemon/blob/f600811eebc4a9d29d23e16ecf41ef4873123ed1/nodemon.js) |
| Linhas alteradas no merge | L 14, R 45; executadas L 3/9, R 14/26 |
| Como executou | carregando só o arquivo (`node merge.js`) |
| Detectado | OA 0, DF 10, CF 0 (10 registros em 10 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: correspondência ambígua |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 3 produz → R 283 consome

Estado: `sys` · registros: 1

```js
// L 3      sys = require('util'),   // produz
// R 283    sys.log('\x1B[32m[nodemon] watching: ' + dir + '\x1B[0m');   // consome
```

Pilha de chamadas no momento: nodemon.js:282

### 2. DF transitivo: L 11 produz → R 183 consome

Estado: `conf` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 183    if (typeof conf === 'string') {   // consome
```

Pilha de chamadas no momento: nodemon.js:209

### 3. DF transitivo: L 11 produz → R 184 consome

Estado: `conf` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 184    label = conf;   // consome
```

Pilha de chamadas no momento: nodemon.js:209

### 4. DF transitivo: L 11 produz → R 186 consome

Estado: `conf` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 186    label = conf.label;   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 5. DF transitivo: L 11 produz → R 187 consome

Estado: `conf` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 187    multi = conf.multi;   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 6. DF transitivo: L 11 produz → R 191 consome

Estado: `nodeArgs`, `label` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 191    if ((i = nodeArgs.indexOf(label)) !== -1) {   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 7. DF transitivo: L 11 produz → R 193 consome

Estado: `nodeArgs`, `label` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 193    } else if ((i = nodeArgs.indexOf('-' + label.substr(0, 1))) !== -1) {   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 8. DF transitivo: L 11 produz → R 195 consome

Estado: `nodeArgs`, `label` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 195    } else if ((i = nodeArgs.indexOf('--' + label)) !== -1) {   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 9. DF transitivo: L 11 produz → R 198 consome

Estado: `multi`, `i` · registros: 1 · via parâmetro: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 198    } while (multi && i !== -1);   // consome
```

Pilha de chamadas no momento: nodemon.js:231

### 10. DF direto: L 11 produz → R 231 consome

Estado: `nodeArgs` · registros: 1

```js
// L 11     nodeArgs = process.argv.splice(2), // removes 'node' and this script   // produz
// R 231    controlArg(nodeArgs, { label: 'watch', multi: true }, function (arg, i) {   // consome
```

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [remy__nodemon](https://github.com/remy/nodemon) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
