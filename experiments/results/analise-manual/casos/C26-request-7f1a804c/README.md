# C26: request, `request.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Revisores | Priscila |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`7f1a804cbc`](https://github.com/request/request/commit/7f1a804cbcd52fbd7e9bdd9374e23d503cbaa250) (2014-08-14T16:25:51+00:00) |
| Base / Left / Right | [`cbe4e8a5`](https://github.com/request/request/blob/cbe4e8a5bcdeb7b00a602906f1f483125afb9ce0/request.js) / [`d15e9da1`](https://github.com/request/request/blob/d15e9da1beccbfd7082815f8c3be8912841e3ede/request.js) / [`c78df4bf`](https://github.com/request/request/blob/c78df4bf2616f96a68724d26bb2503e8001c2d46/request.js) |
| Linhas alteradas no merge | L 16, R 19; executadas L 13/13, R 17/17 |
| Como executou | suíte de testes do projeto: `node tests/run.js` |
| Detectado | OA 0, DF 3, CF 0 (3 registros em 3 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Request.prototype.onResponse |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada.

## Conflitos (por par de linhas)

### 1. DF transitivo: R 23 produz → L 1021 consome

Estado: `Request#67.uri`, `Request#25.uri`, `Request#109.uri`, `Request#87.uri`, `Request#153.uri`, `Request#129.uri`, `Request#195.uri`, `Request#173.uri`, `Request#239.uri`, `Request#217.uri`, `Request#65.uri` · registros: 1

```js
// R 23     , caseless = require('caseless')   // produz
// L 1021   debug('has body', self.uri.href)   // consome
```

Pilha de chamadas no momento: request.js:1001

### 2. DF transitivo: R 793 produz → L 1021 consome

Estado: `Request#67.uri`, `Request#25.uri`, `Request#109.uri`, `Request#87.uri`, `Request#153.uri`, `Request#129.uri`, `Request#195.uri`, `Request#173.uri`, `Request#239.uri`, `Request#217.uri`, `Request#65.uri` · registros: 1

```js
// R 793    response.caseless = caseless(response.headers)   // produz
// L 1021   debug('has body', self.uri.href)   // consome
```

Pilha de chamadas no momento: request.js:1001

### 3. DF transitivo: R 803 produz → L 1021 consome

Estado: `Request#67.uri`, `Request#25.uri`, `Request#109.uri`, `Request#87.uri`, `Request#153.uri`, `Request#129.uri`, `Request#195.uri`, `Request#173.uri`, `Request#239.uri`, `Request#217.uri`, `Request#65.uri` · registros: 1

```js
// R 803    var location = response.caseless.get('location')   // produz
// L 1021   debug('has body', self.uri.href)   // consome
```

Pilha de chamadas no momento: request.js:1001

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
