# C25: request, `request.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Revisores | Felipe, Italo |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`92b2ac0356`](https://github.com/request/request/commit/92b2ac03562c3e29d14946894183b629ede8cf04) (2015-10-06T17:32:00+00:00) |
| Base / Left / Right | [`d0272115`](https://github.com/request/request/blob/d0272115cf72b3bc0f06371e5c813551de043f97/request.js) / [`90438fa7`](https://github.com/request/request/blob/90438fa7134eef1a62a129bade245e4c0a63b95f/request.js) / [`12b3bffe`](https://github.com/request/request/blob/12b3bffe49c0b732dc840fdafa69872b679e47aa/request.js) |
| Linhas alteradas no merge | L 3, R 19; executadas L 2/2, R 8/10 |
| Como executou | suíte de testes do projeto: `npm run test-ci` |
| Detectado | OA 0, DF 1, CF 6 (7 registros em 7 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: correspondência ambígua |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: L 1152 produz → R 1030 consome

Estado: `Request#209.uri`, `Request#57.uri`, `Request#153.uri`, `Request#147.uri` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)   // produz
// R 1030   debug('finish init function', self.uri.href)   // consome
```

### 2. CF transitivo: L 1152 e R 1034 confluem na base 1047

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1034   var self = this
// base 1047debug('end event', self.uri.href)   // confluência
```

Pilha de chamadas no momento: request.js:1009

### 3. CF transitivo: L 1152 e R 1034 confluem na base 1054

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1034   var self = this
// base 1054debug('has body', self.uri.href, buffer.length)   // confluência
```

Pilha de chamadas no momento: request.js:1009

### 4. CF transitivo: L 1152 e R 1034 confluem na base 1078

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1034   var self = this
// base 1078debug('emitting complete', self.uri.href)   // confluência
```

Pilha de chamadas no momento: request.js:1009

### 5. CF transitivo: L 1152 e R 1034 confluem na base 1075

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1034   var self = this
// base 1075debug('invalid JSON received', self.uri.href)   // confluência
```

Pilha de chamadas no momento: request.js:1009 → request.js:1073

### 6. CF transitivo: L 1152 e R 1036 confluem na base 1054

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1036   var buffer = bl()
// base 1054debug('has body', self.uri.href, buffer.length)   // confluência
```

Pilha de chamadas no momento: request.js:1009

### 7. CF transitivo: L 1152 e R 1036 confluem na base 1075

Estado: `—` · registros: 1

```js
// L 1152   var qs = self._qs.stringify(base)
// R 1036   var buffer = bl()
// base 1075debug('invalid JSON received', self.uri.href)   // confluência
```

Pilha de chamadas no momento: request.js:1009 → request.js:1073

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
