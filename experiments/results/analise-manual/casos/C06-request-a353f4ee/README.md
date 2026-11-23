# C06: request, `main.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`a353f4eeb3`](https://github.com/request/request/commit/a353f4eeb312ea378d34b624f5c4df33eefa152c) (2011-11-30T11:17:46+00:00) |
| Base / Left / Right | [`43cd887a`](https://github.com/request/request/blob/43cd887a2d276c78352ed78f3756866520bb8800/main.js) / [`16db85c0`](https://github.com/request/request/blob/16db85c07e6c2516269299640fdddca6db7bc051/main.js) / [`594bab01`](https://github.com/request/request/blob/594bab012791c9bca304cbc3ac3fb9478cadb113/main.js) |
| Linhas alteradas no merge | L 20, R 30; executadas L 5/10, R 23/23 |
| Como executou | suíte de testes do projeto: `bash tests/run.sh` |
| Detectado | OA 0, DF 3, CF 0 (3 registros em 3 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Request.prototype.request |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 327 produz → R 473 consome

Estado: `Request#143.req` · registros: 1

```js
// L 327    self.req = self.httpModule.request(self, function (response) {   // produz
// R 473    self.req.on('error', clientErrorHandler)   // consome
```

Pilha de chamadas no momento: main.js:503 → main.js:504 → main.js:538

### 2. DF direto: L 327 produz → R 539 consome

Estado: `Request#143.req` · registros: 1

```js
// L 327    self.req = self.httpModule.request(self, function (response) {   // produz
// R 539    if (!this.req) throw new Error("This request has been piped before http.request() was called.")   // consome
```

Pilha de chamadas no momento: main.js:503 → main.js:504

### 3. DF direto: L 327 produz → R 540 consome

Estado: `Request#143.req` · registros: 1

```js
// L 327    self.req = self.httpModule.request(self, function (response) {   // produz
// R 540    this.req.write.apply(this.req, arguments)   // consome
```

Pilha de chamadas no momento: main.js:503 → main.js:504

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
