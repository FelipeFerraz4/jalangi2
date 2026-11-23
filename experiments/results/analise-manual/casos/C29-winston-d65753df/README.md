# C29: winston, `lib/winston/transports/file.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Projeto | [winstonjs__winston](https://github.com/winstonjs/winston) |
| Merge | [`d65753dfb8`](https://github.com/winstonjs/winston/commit/d65753dfb87360ca301c73375a45f6538ffd5278) (2014-09-15T16:33:18+00:00) |
| Base / Left / Right | [`65c423e6`](https://github.com/winstonjs/winston/blob/65c423e60f9139fb7df21e29c3346a1553e23023/lib/winston/transports/file.js) / [`f7d401ba`](https://github.com/winstonjs/winston/blob/f7d401ba5a1c319a3a363e1fc378c0b5a43ab651/lib/winston/transports/file.js) / [`e526bd25`](https://github.com/winstonjs/winston/blob/e526bd25ed9f59a06870b1934692df19983337e7/lib/winston/transports/file.js) |
| Linhas alteradas no merge | L 12, R 3; executadas L 3/3, R 3/3 |
| Como executou | suíte de testes do projeto: `vows --spec --isolate` |
| Detectado | OA 0, DF 0, CF 8 (8 registros em 8 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. CF transitivo: L 368 e R 75 confluem na base 387

Estado: `—` · registros: 1

```js
// L 368    var self = this;
// R 75     this.logstash    = options.logstash    || false;
// base 387 self._size += str.length;   // confluência
```

### 2. CF transitivo: L 368 e R 75 confluem na base 134

Estado: `—` · registros: 1

```js
// L 368    var self = this;
// R 75     this.logstash    = options.logstash    || false;
// base 134 this._size += output.length;   // confluência
```

### 3. CF transitivo: L 368 e R 121 confluem na base 387

Estado: `—` · registros: 1

```js
// L 368    var self = this;
// R 121    var output = common.log({
// base 387 self._size += str.length;   // confluência
```

### 4. CF transitivo: L 368 e R 121 confluem na base 134

Estado: `—` · registros: 1

```js
// L 368    var self = this;
// R 121    var output = common.log({
// base 134 this._size += output.length;   // confluência
```

### 5. CF transitivo: L 382 e R 75 confluem na base 387

Estado: `—` · registros: 1

```js
// L 382    var str = item[0],
// R 75     this.logstash    = options.logstash    || false;
// base 387 self._size += str.length;   // confluência
```

### 6. CF transitivo: L 382 e R 75 confluem na base 134

Estado: `—` · registros: 1

```js
// L 382    var str = item[0],
// R 75     this.logstash    = options.logstash    || false;
// base 134 this._size += output.length;   // confluência
```

### 7. CF transitivo: L 382 e R 121 confluem na base 387

Estado: `—` · registros: 1

```js
// L 382    var str = item[0],
// R 121    var output = common.log({
// base 387 self._size += str.length;   // confluência
```

### 8. CF transitivo: L 382 e R 121 confluem na base 134

Estado: `—` · registros: 1

```js
// L 382    var str = item[0],
// R 121    var output = common.log({
// base 134 this._size += output.length;   // confluência
```

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [winstonjs__winston](https://github.com/winstonjs/winston) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
