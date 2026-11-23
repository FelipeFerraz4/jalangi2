# C05: request, `main.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`5daa0b28b0`](https://github.com/request/request/commit/5daa0b28b06cf109614f19e76b0e0b9b25ee3baf) (2012-02-17T23:03:09+00:00) |
| Base / Left / Right | [`07bbf331`](https://github.com/request/request/blob/07bbf331e2a0d40d261487f6222e8cafee0e50e3/main.js) / [`49a0f604`](https://github.com/request/request/blob/49a0f604779c91dd1759a02cbb195ccbd8d73f5d/main.js) / [`05e1c782`](https://github.com/request/request/blob/05e1c782510dc52de528527153481ff3cb23a3c6/main.js) |
| Linhas alteradas no merge | L 86, R 13; executadas L 57/63, R 7/9 |
| Como executou | suíte de testes do projeto: `bash tests/run.sh` |
| Detectado | OA 0, DF 18, CF 6 (24 registros em 24 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Request.prototype.request
Request.prototype.request > callback de cookies.map (argumento 1) |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 79 produz → R 140 consome

Estado: `self` · registros: 1

```js
// L 79     var self = this   // produz
// R 140    if (self._redirectsFollowed === 0) {   // consome
```

Pilha de chamadas no momento: main.js:618

### 2. DF direto: L 79 produz → R 141 consome

Estado: `self` · registros: 1

```js
// L 79     var self = this   // produz
// R 141    self.originalCookieHeader = self.headers.cookie;   // consome
```

Pilha de chamadas no momento: main.js:618

### 3. CF transitivo: L 79 e R 141 confluem na base 70

Estado: `—` · registros: 1

```js
// L 79     var self = this
// R 141    self.originalCookieHeader = self.headers.cookie;
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 4. DF transitivo: L 79 produz → R 154 consome

Estado: `cookies` · registros: 1

```js
// L 79     var self = this   // produz
// R 154    if (cookies && cookies.length) {   // consome
```

Pilha de chamadas no momento: main.js:618

### 5. CF transitivo: L 79 e R 155 confluem na base 70

Estado: `—` · registros: 1

```js
// L 79     var self = this
// R 155    var cookieString = cookies.map(function (c) {
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 6. DF transitivo: L 79 produz → R 156 consome

Estado: `c` · registros: 1 · via parâmetro: 1

```js
// L 79     var self = this   // produz
// R 156    return c.name + "=" + c.value   // consome
```

Pilha de chamadas no momento: main.js:618 → main.js:155

### 7. DF direto: L 79 produz → R 159 consome

Estado: `self` · registros: 1

```js
// L 79     var self = this   // produz
// R 159    if (self.originalCookieHeader) {   // consome
```

Pilha de chamadas no momento: main.js:618

### 8. DF direto: L 79 produz → R 161 consome

Estado: `self` · registros: 1

```js
// L 79     var self = this   // produz
// R 161    self.headers.cookie = self.originalCookieHeader + '; ' + cookieString   // consome
```

Pilha de chamadas no momento: main.js:618

### 9. CF transitivo: L 79 e R 161 confluem na base 70

Estado: `—` · registros: 1

```js
// L 79     var self = this
// R 161    self.headers.cookie = self.originalCookieHeader + '; ' + cookieString
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 10. DF transitivo: L 89 produz → R 140 consome

Estado: `Request#217._redirectsFollowed`, `Request#255._redirectsFollowed`, `Request#491._redirectsFollowed` · registros: 1

```js
// L 89     self[i] = options[i]   // produz
// R 140    if (self._redirectsFollowed === 0) {   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 11. DF transitivo: L 89 produz → R 141 consome

Estado: `Request#29.headers`, `Object#37.cookie`, `Request#63.headers`, `Object#69.cookie`, `Request#85.headers`, `Object#91.cookie`, `Request#109.headers`, `Object#115.cookie`, `Request#133.headers`, `Object#139.cookie`, `Request#157.headers`, `Object#163.cookie`, `Request#57.headers`, `Object#63.cookie`, `Request#201.headers` · registros: 1

```js
// L 89     self[i] = options[i]   // produz
// R 141    self.originalCookieHeader = self.headers.cookie;   // consome
```

Pilha de chamadas no momento: main.js:618

### 12. CF transitivo: L 89 e R 141 confluem na base 70

Estado: `—` · registros: 1

```js
// L 89     self[i] = options[i]
// R 141    self.originalCookieHeader = self.headers.cookie;
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 13. DF transitivo: L 89 produz → R 154 consome

Estado: `cookies` · registros: 1

```js
// L 89     self[i] = options[i]   // produz
// R 154    if (cookies && cookies.length) {   // consome
```

Pilha de chamadas no momento: main.js:618

### 14. CF transitivo: L 89 e R 155 confluem na base 70

Estado: `—` · registros: 1

```js
// L 89     self[i] = options[i]
// R 155    var cookieString = cookies.map(function (c) {
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 15. DF transitivo: L 89 produz → R 156 consome

Estado: `c` · registros: 1 · via parâmetro: 1

```js
// L 89     self[i] = options[i]   // produz
// R 156    return c.name + "=" + c.value   // consome
```

Pilha de chamadas no momento: main.js:618 → main.js:155

### 16. DF direto: L 89 produz → R 159 consome

Estado: `Request#217.originalCookieHeader` · registros: 1

```js
// L 89     self[i] = options[i]   // produz
// R 159    if (self.originalCookieHeader) {   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 17. DF direto: L 89 produz → R 161 consome

Estado: `Request#217.originalCookieHeader` · registros: 1

```js
// L 89     self[i] = options[i]   // produz
// R 161    self.headers.cookie = self.originalCookieHeader + '; ' + cookieString   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 18. CF transitivo: L 89 e R 161 confluem na base 70

Estado: `—` · registros: 1

```js
// L 89     self[i] = options[i]
// R 161    self.headers.cookie = self.originalCookieHeader + '; ' + cookieString
// base 70  for (var i in obj) o[i] = obj[i]   // confluência
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:127

### 19. DF direto: R 141 produz → L 89 consome

Estado: `Request#29.originalCookieHeader`, `Request#237.originalCookieHeader` · registros: 1

```js
// R 141    self.originalCookieHeader = self.headers.cookie;   // produz
// L 89     self[i] = options[i]   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 20. DF transitivo: L 398 produz → R 140 consome

Estado: `Request#217._redirectsFollowed`, `Request#255._redirectsFollowed`, `Request#491._redirectsFollowed` · registros: 1

```js
// L 398    var self = this   // produz
// R 140    if (self._redirectsFollowed === 0) {   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 21. DF transitivo: L 398 produz → R 154 consome

Estado: `cookies` · registros: 1

```js
// L 398    var self = this   // produz
// R 154    if (cookies && cookies.length) {   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 22. DF transitivo: L 398 produz → R 156 consome

Estado: `c` · registros: 1 · via parâmetro: 1

```js
// L 398    var self = this   // produz
// R 156    return c.name + "=" + c.value   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618 → main.js:155

### 23. DF transitivo: L 398 produz → R 159 consome

Estado: `Request#217.originalCookieHeader` · registros: 1 · via parâmetro: 1

```js
// L 398    var self = this   // produz
// R 159    if (self.originalCookieHeader) {   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

### 24. DF transitivo: L 398 produz → R 161 consome

Estado: `Request#217.headers`, `Request#217.originalCookieHeader`, `cookieString` · registros: 1

```js
// L 398    var self = this   // produz
// R 161    self.headers.cookie = self.originalCookieHeader + '; ' + cookieString   // consome
```

Pilha de chamadas no momento: main.js:455 → main.js:618

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
