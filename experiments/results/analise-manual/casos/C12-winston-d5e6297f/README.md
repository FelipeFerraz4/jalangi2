# C12: winston, `lib/winston/common.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe |
| Projeto | [winstonjs__winston](https://github.com/winstonjs/winston) |
| Merge | [`d5e6297f73`](https://github.com/winstonjs/winston/commit/d5e6297f7373964236c8138e36cbb55a5e6038a9) (2014-12-30T18:56:09+00:00) |
| Base / Left / Right | [`9004938e`](https://github.com/winstonjs/winston/blob/9004938e842ea315aae6b32eca3c80a98ffa95ae/lib/winston/common.js) / [`8295982d`](https://github.com/winstonjs/winston/blob/8295982d0d7680a3378acfcb93d8c0a42273ddab/lib/winston/common.js) / [`39ea9901`](https://github.com/winstonjs/winston/blob/39ea990176e884ef00dd115eaede9a22d55d1f4f/lib/winston/common.js) |
| Linhas alteradas no merge | L 81, R 7; executadas L 32/44, R 3/5 |
| Como executou | suíte de testes do projeto: `vows --spec --isolate` |
| Detectado | OA 0, DF 101, CF 1 (102 registros em 102 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: exports.log |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: L 91 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 91     var copy = {};   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 2. DF transitivo: L 91 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 91     var copy = {};   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 3. DF transitivo: L 91 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 91     var copy = {};   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 4. DF transitivo: L 91 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 91     var copy = {};   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 5. DF transitivo: L 91 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 91     var copy = {};   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 6. DF transitivo: L 91 produz → R 283 consome

Estado: `Object#177.numbers` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 7. DF transitivo: L 91 produz → R 286 consome

Estado: `Object#177.numbers`, `l` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 286    for (var j = 0, l = obj[keys[i]].length; j < l; j++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 8. DF transitivo: L 91 produz → R 287 consome

Estado: `Object#177.numbers`, `msg` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 287    msg += exports.serialize(obj[keys[i]][j]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 9. DF transitivo: L 91 produz → R 288 consome

Estado: `l` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 288    if (j < l - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 10. DF transitivo: L 91 produz → R 289 consome

Estado: `msg` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 289    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 11. DF transitivo: L 91 produz → R 293 consome

Estado: `msg` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 293    msg += ']';   // consome
```

Pilha de chamadas no momento: common.js:214

### 12. DF transitivo: L 91 produz → R 307 consome

Estado: `msg` · registros: 1

```js
// L 91     var copy = {};   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

### 13. DF transitivo: L 92 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 14. DF transitivo: L 92 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 15. DF transitivo: L 92 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 16. DF transitivo: L 92 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 17. DF transitivo: L 92 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 18. DF transitivo: L 92 produz → R 274 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 274    if (obj instanceof Buffer) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 19. DF transitivo: L 92 produz → R 279 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 279    keys = Object.keys(obj),   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 20. DF transitivo: L 92 produz → R 280 consome

Estado: `keys` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 280    length = keys.length;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 21. DF transitivo: L 92 produz → R 282 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 282    for (var i = 0; i < length; i++) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 22. DF transitivo: L 92 produz → R 283 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#177.numbers`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 23. DF transitivo: L 92 produz → R 286 consome

Estado: `Object#177.numbers`, `l` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 286    for (var j = 0, l = obj[keys[i]].length; j < l; j++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 24. DF transitivo: L 92 produz → R 287 consome

Estado: `Object#177.numbers`, `msg` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 287    msg += exports.serialize(obj[keys[i]][j]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 25. DF transitivo: L 92 produz → R 288 consome

Estado: `l` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 288    if (j < l - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 26. DF transitivo: L 92 produz → R 289 consome

Estado: `msg` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 289    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 27. DF transitivo: L 92 produz → R 293 consome

Estado: `msg` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 293    msg += ']';   // consome
```

Pilha de chamadas no momento: common.js:214

### 28. DF transitivo: L 92 produz → R 295 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 295    else if (obj[keys[i]] instanceof Date) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 29. DF transitivo: L 92 produz → R 299 consome

Estado: `Object#129.a`, `msg`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 299    msg += exports.serialize(obj[keys[i]], keys[i]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 30. DF transitivo: L 92 produz → R 302 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 92     for (var i in obj) {   // produz
// R 302    if (i < length - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 31. DF transitivo: L 92 produz → R 303 consome

Estado: `msg` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 303    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 32. DF transitivo: L 92 produz → R 307 consome

Estado: `msg` · registros: 1

```js
// L 92     for (var i in obj) {   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

### 33. DF transitivo: L 94 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 34. DF transitivo: L 94 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 35. DF transitivo: L 94 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 36. DF transitivo: L 94 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 37. DF transitivo: L 94 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:287

### 38. DF direto: L 94 produz → R 283 consome

Estado: `Object#177.numbers` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 39. DF direto: L 94 produz → R 286 consome

Estado: `Object#177.numbers` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 286    for (var j = 0, l = obj[keys[i]].length; j < l; j++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 40. DF direto: L 94 produz → R 287 consome

Estado: `Object#177.numbers` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 287    msg += exports.serialize(obj[keys[i]][j]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 41. DF transitivo: L 94 produz → R 288 consome

Estado: `l` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 288    if (j < l - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 42. DF transitivo: L 94 produz → R 289 consome

Estado: `msg` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 289    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 43. DF transitivo: L 94 produz → R 293 consome

Estado: `msg` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 293    msg += ']';   // consome
```

Pilha de chamadas no momento: common.js:214

### 44. DF transitivo: L 94 produz → R 307 consome

Estado: `msg` · registros: 1

```js
// L 94     copy[i] = obj[i].slice(0);   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

### 45. DF transitivo: L 100 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 46. DF transitivo: L 100 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 47. DF transitivo: L 100 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 48. DF transitivo: L 100 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 49. DF transitivo: L 100 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 50. DF transitivo: L 100 produz → R 274 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 274    if (obj instanceof Buffer) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 51. DF transitivo: L 100 produz → R 279 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 279    keys = Object.keys(obj),   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 52. DF transitivo: L 100 produz → R 280 consome

Estado: `keys` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 280    length = keys.length;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 53. DF transitivo: L 100 produz → R 282 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 282    for (var i = 0; i < length; i++) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 54. DF direto: L 100 produz → R 283 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 55. DF direto: L 100 produz → R 295 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 295    else if (obj[keys[i]] instanceof Date) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 56. DF direto: L 100 produz → R 299 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 299    msg += exports.serialize(obj[keys[i]], keys[i]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 57. DF transitivo: L 100 produz → R 302 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 302    if (i < length - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 58. DF transitivo: L 100 produz → R 303 consome

Estado: `msg` · registros: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 303    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 59. DF transitivo: L 100 produz → R 307 consome

Estado: `msg` · registros: 1

```js
// L 100    copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

### 60. DF direto: L 130 produz → R 214 consome

Estado: `meta` · registros: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 214    output += ' ' + exports.serialize(meta);   // consome
```

### 61. CF transitivo: L 130 e R 214 confluem na base 219

Estado: `—` · registros: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)
// R 214    output += ' ' + exports.serialize(meta);
// base 219 return output;   // confluência
```

### 62. DF transitivo: L 130 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 63. DF transitivo: L 130 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 64. DF transitivo: L 130 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 65. DF transitivo: L 130 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214

### 66. DF transitivo: L 130 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 67. DF transitivo: L 130 produz → R 274 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 274    if (obj instanceof Buffer) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 68. DF transitivo: L 130 produz → R 279 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 279    keys = Object.keys(obj),   // consome
```

Pilha de chamadas no momento: common.js:214

### 69. DF transitivo: L 130 produz → R 280 consome

Estado: `keys` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 280    length = keys.length;   // consome
```

Pilha de chamadas no momento: common.js:214

### 70. DF transitivo: L 130 produz → R 282 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 282    for (var i = 0; i < length; i++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 71. DF transitivo: L 130 produz → R 283 consome

Estado: `obj`, `keys` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 72. DF transitivo: L 130 produz → R 284 consome

Estado: `keys` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 284    msg += keys[i] + '=[';   // consome
```

Pilha de chamadas no momento: common.js:214

### 73. DF transitivo: L 130 produz → R 286 consome

Estado: `obj`, `keys`, `l` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 286    for (var j = 0, l = obj[keys[i]].length; j < l; j++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 74. DF transitivo: L 130 produz → R 287 consome

Estado: `msg`, `obj`, `keys` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 287    msg += exports.serialize(obj[keys[i]][j]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 75. DF transitivo: L 130 produz → R 288 consome

Estado: `l` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 288    if (j < l - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 76. DF transitivo: L 130 produz → R 289 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 289    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 77. DF transitivo: L 130 produz → R 293 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 293    msg += ']';   // consome
```

Pilha de chamadas no momento: common.js:214

### 78. DF transitivo: L 130 produz → R 295 consome

Estado: `obj`, `keys` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 295    else if (obj[keys[i]] instanceof Date) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 79. DF transitivo: L 130 produz → R 299 consome

Estado: `obj`, `keys`, `msg` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 299    msg += exports.serialize(obj[keys[i]], keys[i]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 80. DF transitivo: L 130 produz → R 302 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 302    if (i < length - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 81. DF transitivo: L 130 produz → R 303 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 303    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 82. DF transitivo: L 130 produz → R 307 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 130    meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

### 83. DF transitivo: L 131 produz → R 260 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 260    if (obj === null) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 84. DF transitivo: L 131 produz → R 263 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 263    else if (obj === undefined) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 85. DF transitivo: L 131 produz → R 266 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 266    else if (obj === false) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 86. DF transitivo: L 131 produz → R 270 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 270    if (typeof obj !== 'object') {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 87. DF transitivo: L 131 produz → R 271 consome

Estado: `key`, `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 271    return key ? key + '=' + obj : obj;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 88. DF transitivo: L 131 produz → R 274 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 274    if (obj instanceof Buffer) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 89. DF transitivo: L 131 produz → R 279 consome

Estado: `obj` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 279    keys = Object.keys(obj),   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 90. DF transitivo: L 131 produz → R 280 consome

Estado: `keys` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 280    length = keys.length;   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 91. DF transitivo: L 131 produz → R 282 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 282    for (var i = 0; i < length; i++) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 92. DF transitivo: L 131 produz → R 283 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#177.numbers`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 283    if (Array.isArray(obj[keys[i]])) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 93. DF transitivo: L 131 produz → R 286 consome

Estado: `Object#177.numbers`, `l` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 286    for (var j = 0, l = obj[keys[i]].length; j < l; j++) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 94. DF transitivo: L 131 produz → R 287 consome

Estado: `Object#177.numbers`, `msg` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 287    msg += exports.serialize(obj[keys[i]][j]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 95. DF transitivo: L 131 produz → R 288 consome

Estado: `l` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 288    if (j < l - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 96. DF transitivo: L 131 produz → R 289 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 289    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 97. DF transitivo: L 131 produz → R 293 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 293    msg += ']';   // consome
```

Pilha de chamadas no momento: common.js:214

### 98. DF transitivo: L 131 produz → R 295 consome

Estado: `Object#129.a`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 295    else if (obj[keys[i]] instanceof Date) {   // consome
```

Pilha de chamadas no momento: common.js:214

### 99. DF transitivo: L 131 produz → R 299 consome

Estado: `Object#129.a`, `msg`, `Object#129.level`, `Object#129.msg`, `Object#129.foo`, `Object#153.a`, `Object#153.level`, `Object#153.msg`, `Object#153.foo`, `Object#133.number`, `Object#153.number`, `Object#173.number`, `Object#193.number`, `Object#213.number`, `Object#233.foo`, `Object#231.duration`, `Object#279.some`, `Object#279.duration`, `Object#327.duration`, `Object#371.duration`, `Object#443.number`, `Object#461.number`, `Object#479.number`, `Object#497.number`, `Object#515.number`, `Object#129.metadata`, `Object#159.metadata`, `obj`, `keys`, `Object#157.$ref`, `Object#245.metadata`, `Object#275.metadata`, `Object#273.$ref`, `Object#97.test`, `Object#161.metadata`, `Object#159.$ref` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 299    msg += exports.serialize(obj[keys[i]], keys[i]);   // consome
```

Pilha de chamadas no momento: common.js:214

### 100. DF transitivo: L 131 produz → R 302 consome

Estado: `length` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 302    if (i < length - 1) {   // consome
```

Pilha de chamadas no momento: common.js:214 → common.js:299

### 101. DF transitivo: L 131 produz → R 303 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 303    msg += ', ';   // consome
```

Pilha de chamadas no momento: common.js:214

### 102. DF transitivo: L 131 produz → R 307 consome

Estado: `msg` · registros: 1 · via parâmetro: 1

```js
// L 131    ? exports.clone(cycle.decycle(options.meta))   // produz
// R 307    return msg;   // consome
```

Pilha de chamadas no momento: common.js:214

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [winstonjs__winston](https://github.com/winstonjs/winston) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
