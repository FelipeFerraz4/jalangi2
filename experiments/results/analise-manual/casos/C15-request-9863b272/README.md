# C15: request, `request.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Revisores | Felipe, Priscila |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`9863b27238`](https://github.com/request/request/commit/9863b27238fef25ff86a37f39ff3a0666755d1d1) (2014-10-16T16:02:50+00:00) |
| Base / Left / Right | [`105e74bd`](https://github.com/request/request/blob/105e74bd5cff49a03b672bb5f247ff3c810ded65/request.js) / [`3622e712`](https://github.com/request/request/blob/3622e7122075d6463c08d74c60144f2ca502c72c/request.js) / [`4deda9dd`](https://github.com/request/request/blob/4deda9dd127054ba523b7e6ab5289198957f781d/request.js) |
| Linhas alteradas no merge | L 41, R 8; executadas L 15/29, R 8/8 |
| Como executou | suíte de testes do projeto: `node node_modules/.bin/taper tests/test-*.js` |
| Detectado | OA 0, DF 10, CF 45 (55 registros em 55 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: possível renomeação ou movimentação |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: R 3 produz → L 968 consome

Estado: `Request#39.httpModule`, `Request#109.httpModule`, `Request#119.httpModule`, `Request#165.httpModule`, `Request#215.httpModule`, `Request#265.httpModule`, `Request#313.httpModule`, `Request#359.httpModule`, `Request#159.httpModule`, `Request#207.httpModule`, `Request#267.httpModule`, `Request#133.httpModule`, `Request#157.httpModule`, `Request#249.httpModule`, `Request#337.httpModule`, `Request#427.httpModule`, `Request#517.httpModule`, `Request#605.httpModule`, `Request#695.httpModule`, `Request#115.httpModule`, `Request#315.httpModule`, `Request#95.httpModule`, `Request#91.httpModule`, `Request#197.httpModule`, `Request#193.httpModule`, `Request#243.httpModule`, `Request#297.httpModule`, `Request#353.httpModule`, `Request#405.httpModule`, `Request#459.httpModule`, `Request#177.httpModule`, `Request#231.httpModule`, `Request#273.httpModule`, `Request#301.httpModule`, `Request#369.httpModule`, `Request#411.httpModule`, `Request#481.httpModule`, `Request#533.httpModule`, `Request#569.httpModule`, `Request#645.httpModule`, `Request#693.httpModule`, `Request#775.httpModule`, `Request#827.httpModule`, `Request#153.httpModule`, `Request#83.httpModule`, `Request#143.httpModule`, `Request#173.httpModule`, `Request#201.httpModule`, `Request#259.httpModule`, `Request#289.httpModule`, `Request#317.httpModule`, `Request#237.httpModule`, `Request#341.httpModule`, `Request#425.httpModule`, `Request#477.httpModule`, `Request#529.httpModule`, `Request#581.httpModule`, `Request#665.httpModule`, `Request#749.httpModule`, `Request#865.httpModule`, `Request#917.httpModule`, `Request#1001.httpModule`, `Request#351.httpModule`, `Request#461.httpModule`, `Request#513.httpModule`, `Request#567.httpModule`, `Request#659.httpModule`, `Request#755.httpModule`, `Request#123.httpModule`, `Request#163.httpModule`, `Request#217.httpModule`, `Request#269.httpModule`, `Request#327.httpModule`, `Request#379.httpModule`, `Request#455.httpModule`, `Request#483.httpModule`, `Request#577.httpModule`, `Request#627.httpModule`, `Request#167.httpModule`, `Request#221.httpModule` · registros: 1

```js
// R 3      var http = require('http')   // produz
// L 968    self.req = self.httpModule.request(reqOptions)   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 2. DF transitivo: R 3 produz → L 992 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#313.req`, `Request#359.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#517.req`, `Request#605.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#95.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#231.req`, `Request#273.req`, `Request#301.req`, `Request#369.req`, `Request#411.req`, `Request#481.req`, `Request#533.req`, `Request#569.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#83.req`, `Request#143.req`, `Request#173.req`, `Request#201.req`, `Request#259.req`, `Request#289.req`, `Request#317.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 3      var http = require('http')   // produz
// L 992    self.req.on('response', self.onRequestResponse.bind(self))   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 3. DF transitivo: R 3 produz → L 993 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#313.req`, `Request#359.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#517.req`, `Request#605.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#95.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#231.req`, `Request#273.req`, `Request#301.req`, `Request#369.req`, `Request#411.req`, `Request#481.req`, `Request#533.req`, `Request#569.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#83.req`, `Request#143.req`, `Request#173.req`, `Request#201.req`, `Request#259.req`, `Request#289.req`, `Request#317.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 3      var http = require('http')   // produz
// L 993    self.req.on('error', self.onRequestError.bind(self))   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 4. DF transitivo: R 3 produz → L 1003 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#273.req`, `Request#301.req`, `Request#411.req`, `Request#369.req`, `Request#481.req`, `Request#569.req`, `Request#533.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#143.req`, `Request#83.req`, `Request#231.req`, `Request#317.req`, `Request#173.req`, `Request#259.req`, `Request#289.req`, `Request#201.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 3      var http = require('http')   // produz
// L 1003   self.req.connection.removeListener('error', connectionErrorHandler)   // consome
```

Pilha de chamadas no momento: request.js:1306

### 5. DF transitivo: R 3 produz → L 1014 consome

Estado: `Request#39.req`, `Request#95.req` · registros: 1

```js
// R 3      var http = require('http')   // produz
// L 1014   if (self.req && self.req._reusedSocket && error.code === 'ECONNRESET'   // consome
```

### 6. DF transitivo: R 4 produz → L 968 consome

Estado: `Request#39.httpModule`, `Request#109.httpModule`, `Request#119.httpModule`, `Request#165.httpModule`, `Request#215.httpModule`, `Request#265.httpModule`, `Request#313.httpModule`, `Request#359.httpModule`, `Request#159.httpModule`, `Request#207.httpModule`, `Request#267.httpModule`, `Request#133.httpModule`, `Request#157.httpModule`, `Request#249.httpModule`, `Request#337.httpModule`, `Request#427.httpModule`, `Request#517.httpModule`, `Request#605.httpModule`, `Request#695.httpModule`, `Request#115.httpModule`, `Request#315.httpModule`, `Request#95.httpModule`, `Request#91.httpModule`, `Request#197.httpModule`, `Request#193.httpModule`, `Request#243.httpModule`, `Request#297.httpModule`, `Request#353.httpModule`, `Request#405.httpModule`, `Request#459.httpModule`, `Request#177.httpModule`, `Request#231.httpModule`, `Request#273.httpModule`, `Request#301.httpModule`, `Request#369.httpModule`, `Request#411.httpModule`, `Request#481.httpModule`, `Request#533.httpModule`, `Request#569.httpModule`, `Request#645.httpModule`, `Request#693.httpModule`, `Request#775.httpModule`, `Request#827.httpModule`, `Request#153.httpModule`, `Request#83.httpModule`, `Request#143.httpModule`, `Request#173.httpModule`, `Request#201.httpModule`, `Request#259.httpModule`, `Request#289.httpModule`, `Request#317.httpModule`, `Request#237.httpModule`, `Request#341.httpModule`, `Request#425.httpModule`, `Request#477.httpModule`, `Request#529.httpModule`, `Request#581.httpModule`, `Request#665.httpModule`, `Request#749.httpModule`, `Request#865.httpModule`, `Request#917.httpModule`, `Request#1001.httpModule`, `Request#351.httpModule`, `Request#461.httpModule`, `Request#513.httpModule`, `Request#567.httpModule`, `Request#659.httpModule`, `Request#755.httpModule`, `Request#123.httpModule`, `Request#163.httpModule`, `Request#217.httpModule`, `Request#269.httpModule`, `Request#327.httpModule`, `Request#379.httpModule`, `Request#455.httpModule`, `Request#483.httpModule`, `Request#577.httpModule`, `Request#627.httpModule`, `Request#167.httpModule`, `Request#221.httpModule` · registros: 1

```js
// R 4      , https = require('https')   // produz
// L 968    self.req = self.httpModule.request(reqOptions)   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 7. DF transitivo: R 4 produz → L 992 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#313.req`, `Request#359.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#517.req`, `Request#605.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#95.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#231.req`, `Request#273.req`, `Request#301.req`, `Request#369.req`, `Request#411.req`, `Request#481.req`, `Request#533.req`, `Request#569.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#83.req`, `Request#143.req`, `Request#173.req`, `Request#201.req`, `Request#259.req`, `Request#289.req`, `Request#317.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 4      , https = require('https')   // produz
// L 992    self.req.on('response', self.onRequestResponse.bind(self))   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 8. DF transitivo: R 4 produz → L 993 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#313.req`, `Request#359.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#517.req`, `Request#605.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#95.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#231.req`, `Request#273.req`, `Request#301.req`, `Request#369.req`, `Request#411.req`, `Request#481.req`, `Request#533.req`, `Request#569.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#83.req`, `Request#143.req`, `Request#173.req`, `Request#201.req`, `Request#259.req`, `Request#289.req`, `Request#317.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 4      , https = require('https')   // produz
// L 993    self.req.on('error', self.onRequestError.bind(self))   // consome
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 9. DF transitivo: R 4 produz → L 1003 consome

Estado: `Request#39.req`, `Request#109.req`, `Request#119.req`, `Request#165.req`, `Request#215.req`, `Request#265.req`, `Request#159.req`, `Request#207.req`, `Request#267.req`, `Request#133.req`, `Request#157.req`, `Request#249.req`, `Request#337.req`, `Request#427.req`, `Request#695.req`, `Request#115.req`, `Request#315.req`, `Request#91.req`, `Request#197.req`, `Request#193.req`, `Request#243.req`, `Request#297.req`, `Request#353.req`, `Request#405.req`, `Request#459.req`, `Request#177.req`, `Request#273.req`, `Request#301.req`, `Request#411.req`, `Request#369.req`, `Request#481.req`, `Request#569.req`, `Request#533.req`, `Request#645.req`, `Request#693.req`, `Request#775.req`, `Request#827.req`, `Request#153.req`, `Request#143.req`, `Request#83.req`, `Request#231.req`, `Request#317.req`, `Request#173.req`, `Request#259.req`, `Request#289.req`, `Request#201.req`, `Request#237.req`, `Request#341.req`, `Request#425.req`, `Request#477.req`, `Request#529.req`, `Request#581.req`, `Request#665.req`, `Request#749.req`, `Request#865.req`, `Request#917.req`, `Request#1001.req`, `Request#351.req`, `Request#461.req`, `Request#513.req`, `Request#567.req`, `Request#659.req`, `Request#755.req`, `Request#123.req`, `Request#163.req`, `Request#217.req`, `Request#269.req`, `Request#327.req`, `Request#379.req`, `Request#455.req`, `Request#483.req`, `Request#577.req`, `Request#627.req`, `Request#167.req`, `Request#221.req` · registros: 1

```js
// R 4      , https = require('https')   // produz
// L 1003   self.req.connection.removeListener('error', connectionErrorHandler)   // consome
```

Pilha de chamadas no momento: request.js:1306

### 10. DF transitivo: R 4 produz → L 1014 consome

Estado: `Request#39.req`, `Request#95.req` · registros: 1

```js
// R 4      , https = require('https')   // produz
// L 1014   if (self.req && self.req._reusedSocket && error.code === 'ECONNRESET'   // consome
```

### 11. CF transitivo: L 968 e R 3 confluem na base 994

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 3      var http = require('http')
// base 994 self.req.on('drain', function() {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 12. CF transitivo: L 968 e R 3 confluem na base 997

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 3      var http = require('http')
// base 997 self.req.on('socket', function(socket) {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 13. CF transitivo: L 968 e R 3 confluem na base 1006

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 3      var http = require('http')
// base 1006self.emit('request', self.req)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 14. CF transitivo: L 968 e R 3 confluem na base 1749

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 3      var http = require('http')
// base 1749self.req.end()   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663

### 15. CF transitivo: L 968 e R 3 confluem na base 1739

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 3      var http = require('http')
// base 1739return self.req.write.apply(self.req, arguments)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:653

### 16. CF transitivo: L 968 e R 4 confluem na base 994

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 4      , https = require('https')
// base 994 self.req.on('drain', function() {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 17. CF transitivo: L 968 e R 4 confluem na base 997

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 4      , https = require('https')
// base 997 self.req.on('socket', function(socket) {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 18. CF transitivo: L 968 e R 4 confluem na base 1006

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 4      , https = require('https')
// base 1006self.emit('request', self.req)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 19. CF transitivo: L 968 e R 4 confluem na base 1749

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 4      , https = require('https')
// base 1749self.req.end()   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663

### 20. CF transitivo: L 968 e R 4 confluem na base 1739

Estado: `—` · registros: 1

```js
// L 968    self.req = self.httpModule.request(reqOptions)
// R 4      , https = require('https')
// base 1739return self.req.write.apply(self.req, arguments)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:653

### 21. CF transitivo: L 1029 e R 3 confluem na base 1057

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 1057if (self.httpModule === https &&   // confluência
```

### 22. CF transitivo: L 1029 e R 3 confluem na base 570

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 570 self.httpModule = httpModules[protocol] || defaultModules[protocol]   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 23. CF transitivo: L 1029 e R 3 confluem na base 572

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 572 if (!self.httpModule) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 24. CF transitivo: L 1029 e R 3 confluem na base 590

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 590 self.agentClass = self.httpModule.Agent   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 25. CF transitivo: L 1029 e R 3 confluem na base 833

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 833 var Agent = self.agentClass   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 26. CF transitivo: L 1029 e R 3 confluem na base 864

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 864 if (Agent !== self.httpModule.Agent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 27. CF transitivo: L 1029 e R 3 confluem na base 868

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 868 if (!self.httpModule.globalAgent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 28. CF transitivo: L 1029 e R 3 confluem na base 994

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 994 self.req.on('drain', function() {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 29. CF transitivo: L 1029 e R 3 confluem na base 997

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 997 self.req.on('socket', function(socket) {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 30. CF transitivo: L 1029 e R 3 confluem na base 1006

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 1006self.emit('request', self.req)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 31. CF transitivo: L 1029 e R 3 confluem na base 1749

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 1749self.req.end()   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663

### 32. CF transitivo: L 1029 e R 3 confluem na base 935

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 935 if (!self.pool[poolKey]) {   // confluência
```

Pilha de chamadas no momento: request.js:1216 → request.js:826

### 33. CF transitivo: L 1029 e R 3 confluem na base 939

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 939 return self.pool[poolKey]   // confluência
```

Pilha de chamadas no momento: request.js:1216 → request.js:826

### 34. CF transitivo: L 1029 e R 3 confluem na base 926

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 926 if (self.pool === globalPool && !poolKey && Object.keys(options).length === 0 && self.httpModule.globalAgent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 35. CF transitivo: L 1029 e R 3 confluem na base 928

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 928 return self.httpModule.globalAgent   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 36. CF transitivo: L 1029 e R 3 confluem na base 791

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 791 switch (self.agentClass) {   // confluência
```

Pilha de chamadas no momento: request.js:1216

### 37. CF transitivo: L 1029 e R 3 confluem na base 811

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 3      var http = require('http')
// base 811 switch (self.agentClass) {   // confluência
```

Pilha de chamadas no momento: request.js:1216

### 38. CF direto: L 1029 e R 4 confluem na base 1057

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 1057if (self.httpModule === https &&   // confluência
```

### 39. CF transitivo: L 1029 e R 4 confluem na base 936

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 936 self.pool[poolKey] = new Agent(options)   // confluência
```

Pilha de chamadas no momento: request.js:1216 → request.js:805

### 40. CF transitivo: L 1029 e R 4 confluem na base 939

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 939 return self.pool[poolKey]   // confluência
```

Pilha de chamadas no momento: request.js:1216 → request.js:805

### 41. CF transitivo: L 1029 e R 4 confluem na base 570

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 570 self.httpModule = httpModules[protocol] || defaultModules[protocol]   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 42. CF transitivo: L 1029 e R 4 confluem na base 572

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 572 if (!self.httpModule) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 43. CF transitivo: L 1029 e R 4 confluem na base 590

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 590 self.agentClass = self.httpModule.Agent   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769

### 44. CF transitivo: L 1029 e R 4 confluem na base 833

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 833 var Agent = self.agentClass   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 45. CF transitivo: L 1029 e R 4 confluem na base 864

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 864 if (Agent !== self.httpModule.Agent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 46. CF transitivo: L 1029 e R 4 confluem na base 868

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 868 if (!self.httpModule.globalAgent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 47. CF transitivo: L 1029 e R 4 confluem na base 935

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 935 if (!self.pool[poolKey]) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 48. CF transitivo: L 1029 e R 4 confluem na base 994

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 994 self.req.on('drain', function() {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 49. CF transitivo: L 1029 e R 4 confluem na base 997

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 997 self.req.on('socket', function(socket) {   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 50. CF transitivo: L 1029 e R 4 confluem na base 1006

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 1006self.emit('request', self.req)   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663 → request.js:1747

### 51. CF transitivo: L 1029 e R 4 confluem na base 1749

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 1749self.req.end()   // confluência
```

Pilha de chamadas no momento: request.js:677 → request.js:663

### 52. CF transitivo: L 1029 e R 4 confluem na base 926

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 926 if (self.pool === globalPool && !poolKey && Object.keys(options).length === 0 && self.httpModule.globalAgent) {   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 53. CF transitivo: L 1029 e R 4 confluem na base 928

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 928 return self.httpModule.globalAgent   // confluência
```

Pilha de chamadas no momento: request.js:1246 → request.js:769 → request.js:597

### 54. CF transitivo: L 1029 e R 4 confluem na base 791

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 791 switch (self.agentClass) {   // confluência
```

Pilha de chamadas no momento: request.js:1216

### 55. CF transitivo: L 1029 e R 4 confluem na base 811

Estado: `—` · registros: 1

```js
// L 1029   var self = this
// R 4      , https = require('https')
// base 811 switch (self.agentClass) {   // confluência
```

Pilha de chamadas no momento: request.js:1216

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
