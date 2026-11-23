# C09: commander.js, `lib/commander.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe, Priscila |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`6ccb63972e`](https://github.com/tj/commander.js/commit/6ccb63972e67d1a2aa52b8e42408dd28078770bc) (2011-12-04T19:41:40+00:00) |
| Base / Left / Right | [`41fdf892`](https://github.com/tj/commander.js/blob/41fdf8924a3527872b1013dcaca761f003950f96/lib/commander.js) / [`ba74d56e`](https://github.com/tj/commander.js/blob/ba74d56e27e07a5b10b8c545e60b35c75b875820/lib/commander.js) / [`4788f703`](https://github.com/tj/commander.js/blob/4788f703fea0d04535df3b3ca66e60ab82777590/lib/commander.js) |
| Linhas alteradas no merge | L 40, R 41; executadas L 14/19, R 17/23 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 0, DF 84, CF 0 (84 registros em 84 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Command.prototype.action > callback de this.parent.on (argumento 2)
Command.prototype.parse
Command.prototype.parseArgs
Command.prototype.parseOptions
callback de exports.on (argumento 2) |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: R 204 produz → L 76 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 76     return arg == this.short   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:466 → commander.js:426

### 2. DF transitivo: R 204 produz → L 77 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 77     || arg == this.long;   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:466 → commander.js:426

### 3. DF direto: R 204 produz → L 205 consome

Estado: `unknown` · registros: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 205    var parsed = self.parseOptions(unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 4. DF transitivo: R 204 produz → L 213 consome

Estado: `parsed` · registros: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 213    if (parsed.unknown.length > 0) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 5. DF transitivo: R 204 produz → L 310 consome

Estado: `val` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 310    if (null != val && fn) val = fn(val);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 6. DF transitivo: R 204 produz → L 313 consome

Estado: `Command#93.setup_mode`, `Command#141.exec_mode`, `Command#141.target` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 313    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 7. DF transitivo: R 204 produz → L 315 consome

Estado: `val` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 315    if (null == val) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 8. DF transitivo: R 204 produz → L 320 consome

Estado: `val` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 320    self[name] = val;   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 9. DF transitivo: R 204 produz → L 322 consome

Estado: `val` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 322    } else if (null !== val) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 10. DF transitivo: R 204 produz → L 324 consome

Estado: `val` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 324    self[name] = val;   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:484

### 11. DF transitivo: R 204 produz → L 426 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 426    if (this.options[i].is(arg)) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:466

### 12. DF transitivo: R 204 produz → L 443 consome

Estado: `argv` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 443    , len = argv.length   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 13. DF transitivo: R 204 produz → L 451 consome

Estado: `len`, `i` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 451    for (var i = 0; i < len; ++i) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 14. DF transitivo: R 204 produz → L 452 consome

Estado: `argv` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 452    arg = argv[i];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 15. DF transitivo: R 204 produz → L 455 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 455    if ('--' == arg) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 16. DF transitivo: R 204 produz → L 466 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 466    option = this.optionFor(arg);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 17. DF transitivo: R 204 produz → L 469 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 469    if (option) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 18. DF transitivo: R 204 produz → L 471 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 471    if (option.required) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 19. DF transitivo: R 204 produz → L 472 consome

Estado: `argv` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 472    arg = argv[++i];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 20. DF transitivo: R 204 produz → L 473 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 473    if (null == arg) return this.optionMissingArgument(option);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 21. DF transitivo: R 204 produz → L 475 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 475    this.emit(option.name(), arg);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 22. DF transitivo: R 204 produz → L 477 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 477    } else if (option.optional) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 23. DF transitivo: R 204 produz → L 478 consome

Estado: `argv` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 478    arg = argv[i+1];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 24. DF transitivo: R 204 produz → L 479 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 479    if (null == arg || '-' == arg[0]) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 25. DF transitivo: R 204 produz → L 484 consome

Estado: `option`, `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 484    this.emit(option.name(), arg);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 26. DF transitivo: R 204 produz → L 493 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 493    if (arg.length > 1 && '-' == arg[0]) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 27. DF transitivo: R 204 produz → L 494 consome

Estado: `arg` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 494    unknownOptions.push(arg);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 28. DF transitivo: R 204 produz → L 499 consome

Estado: `argv` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 499    if (argv[i+1] && '-' != argv[i+1][0]) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205

### 29. DF transitivo: R 204 produz → L 536 consome

Estado: `flag` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 536    if (flag) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:473

### 30. DF transitivo: R 204 produz → L 539 consome

Estado: `option` · registros: 1 · via parâmetro: 1

```js
// R 204    unknown = unknown || [];   // produz
// L 539    console.error("  error: option `%s' argument missing", option.flags);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:205 → commander.js:473

### 31. DF direto: L 205 produz → R 208 consome

Estado: `parsed` · registros: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 32. DF transitivo: L 205 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 33. DF transitivo: L 205 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 34. DF transitivo: L 205 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 35. DF transitivo: L 205 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 36. DF transitivo: L 205 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 205    var parsed = self.parseOptions(unknown);   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 37. DF transitivo: L 347 produz → R 204 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 204    unknown = unknown || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 38. DF transitivo: L 347 produz → R 208 consome

Estado: `parsed` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 39. DF transitivo: L 347 produz → R 404 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 404    outputHelpIfNecessary(this, unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349

### 40. DF transitivo: L 347 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 41. DF transitivo: L 347 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 42. DF transitivo: L 347 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 43. DF transitivo: L 347 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 44. DF transitivo: L 347 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 347    var parsed = this.parseOptions(this.normalize(argv.slice(2)));   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 45. DF transitivo: L 348 produz → R 204 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 204    unknown = unknown || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 46. DF transitivo: L 348 produz → R 208 consome

Estado: `parsed` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 47. DF transitivo: L 348 produz → R 404 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 404    outputHelpIfNecessary(this, unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349

### 48. DF transitivo: L 348 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 49. DF transitivo: L 348 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 50. DF transitivo: L 348 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 51. DF transitivo: L 348 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 52. DF transitivo: L 348 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 348    this.args = parsed.args;   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 53. DF transitivo: L 349 produz → R 204 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 204    unknown = unknown || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 54. DF transitivo: L 349 produz → R 208 consome

Estado: `parsed` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 55. DF direto: L 349 produz → R 404 consome

Estado: `unknown` · registros: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 404    outputHelpIfNecessary(this, unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349

### 56. DF transitivo: L 349 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 57. DF transitivo: L 349 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 58. DF transitivo: L 349 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 59. DF transitivo: L 349 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 60. DF transitivo: L 349 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 349    return this.parseArgs(this.args, parsed.unknown);   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 61. DF transitivo: L 362 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 362    var ret = []   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 62. DF transitivo: L 365 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 365    for (var i = 0, len = args.length; i < len; ++i) {   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 63. DF transitivo: L 366 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 366    arg = args[i];   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 64. DF transitivo: L 372 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 372    ret.push(arg);   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 65. DF transitivo: L 391 produz → R 204 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 204    unknown = unknown || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 66. DF transitivo: L 391 produz → R 208 consome

Estado: `parsed` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 67. DF transitivo: L 391 produz → R 404 consome

Estado: `unknown` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 404    outputHelpIfNecessary(this, unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349

### 68. DF transitivo: L 391 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 69. DF transitivo: L 391 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:404

### 70. DF transitivo: L 391 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 71. DF transitivo: L 391 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 72. DF transitivo: L 391 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 391    Command.prototype.parseArgs = function(args, unknown){   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 73. DF direto: L 399 produz → R 204 consome

Estado: `unknown` · registros: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 204    unknown = unknown || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 74. DF transitivo: L 399 produz → R 208 consome

Estado: `parsed` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 208    outputHelpIfNecessary(self, parsed.unknown);   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399

### 75. DF transitivo: L 399 produz → R 979 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 979    options = options || [];   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 76. DF transitivo: L 399 produz → R 980 consome

Estado: `options` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 980    for (var i = 0; i < options.length; i++) {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 77. DF transitivo: L 399 produz → R 981 consome

Estado: `options`, `Array#835.0` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 78. DF transitivo: L 399 produz → R 982 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 982    cmd.emit('--help');   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 79. DF transitivo: L 399 produz → R 983 consome

Estado: `cmd` · registros: 1 · via parâmetro: 1

```js
// L 399    this.emit(args.shift(), args, unknown);   // produz
// R 983    process.stdout.write(cmd.helpInformation());   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 80. DF transitivo: L 448 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 448    var unknownOptions = [];   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 81. DF transitivo: L 451 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 451    for (var i = 0; i < len; ++i) {   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 82. DF transitivo: L 452 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 452    arg = argv[i];   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 83. DF transitivo: L 472 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 472    arg = argv[++i];   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

### 84. DF direto: L 494 produz → R 981 consome

Estado: `Array#835.0` · registros: 1

```js
// L 494    unknownOptions.push(arg);   // produz
// R 981    if (options[i] == '--help' || options[i] == '-h') {   // consome
```

Pilha de chamadas no momento: commander.js:349 → commander.js:399 → commander.js:208

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
