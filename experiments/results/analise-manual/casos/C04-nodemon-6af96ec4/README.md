# C04: nodemon, `lib/monitor/watch.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Italo |
| Projeto | [remy__nodemon](https://github.com/remy/nodemon) |
| Merge | [`6af96ec4c4`](https://github.com/remy/nodemon/commit/6af96ec4c400578ab98f498eadbfe28d1cc0f6de) (2014-12-05T09:26:02+00:00) |
| Base / Left / Right | [`01e6a5f7`](https://github.com/remy/nodemon/blob/01e6a5f78ea5e1f577cc3372be1282c160a9cc10/lib/monitor/watch.js) / [`f9e056b6`](https://github.com/remy/nodemon/blob/f9e056b6502801a707c3c2fa5d794550b42781c9/lib/monitor/watch.js) / [`e35a85ae`](https://github.com/remy/nodemon/blob/e35a85ae153b0b88303d83a0ef25e5a6d51ba335/lib/monitor/watch.js) |
| Linhas alteradas no merge | L 17, R 1; executadas L 6/11, R 1/1 |
| Como executou | suíte de testes do projeto: `node_modules/mocha/bin/_mocha --timeout 30000 --ui bdd test/**/*.test.js` |
| Detectado | OA 0, DF 4, CF 0 (4 registros em 4 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: ignoredFileTypesForFind > callback de config.options.ignore.forEach (argumento 1) |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: L 37 produz → R 187 consome

Estado: `dir` · registros: 1 · via parâmetro: 1

```js
// L 37     cmds.push('find -L "' + dir + '" ' + ignoredFileTypesForFind(dir) + ' \\( -type f -print \\) | wc');   // produz
// R 187    var pathIsDir = (fs.existsSync(dir + path) && fs.statSync(dir + path).isDirectory()) || (path.charAt(path.length - 1) == '/');   // consome
```

Pilha de chamadas no momento: watch.js:249 → watch.js:141 → watch.js:36 → watch.js:37 → watch.js:186

### 2. DF direto: L 184 produz → R 187 consome

Estado: `dir` · registros: 1

```js
// L 184    dir += '/';   // produz
// R 187    var pathIsDir = (fs.existsSync(dir + path) && fs.statSync(dir + path).isDirectory()) || (path.charAt(path.length - 1) == '/');   // consome
```

Pilha de chamadas no momento: watch.js:249 → watch.js:141 → watch.js:36 → watch.js:37 → watch.js:186

### 3. DF direto: L 186 produz → R 187 consome

Estado: `path` · registros: 1

```js
// L 186    config.options.ignore.forEach(function (path) {   // produz
// R 187    var pathIsDir = (fs.existsSync(dir + path) && fs.statSync(dir + path).isDirectory()) || (path.charAt(path.length - 1) == '/');   // consome
```

Pilha de chamadas no momento: watch.js:249 → watch.js:141 → watch.js:36 → watch.js:37 → watch.js:186

### 4. DF direto: R 187 produz → L 188 consome

Estado: `pathIsDir` · registros: 1

```js
// R 187    var pathIsDir = (fs.existsSync(dir + path) && fs.statSync(dir + path).isDirectory()) || (path.charAt(path.length - 1) == '/');   // produz
// L 188    if (pathIsDir) {   // consome
```

Pilha de chamadas no momento: watch.js:249 → watch.js:141 → watch.js:36 → watch.js:37 → watch.js:186

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [remy__nodemon](https://github.com/remy/nodemon) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
