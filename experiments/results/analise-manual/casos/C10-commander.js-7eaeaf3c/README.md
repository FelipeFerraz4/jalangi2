# C10: commander.js, `index.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Italo |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`7eaeaf3c85`](https://github.com/tj/commander.js/commit/7eaeaf3c853f40432c977aa5e506ef31aec1fb10) (2015-06-22T02:39:58+00:00) |
| Base / Left / Right | [`46f6628c`](https://github.com/tj/commander.js/blob/46f6628ced19c74a06c5557f548bc430d792fbdd/index.js) / [`f68ab32a`](https://github.com/tj/commander.js/blob/f68ab32a2fb6567bd9718286f4877cc2c0743d96/index.js) / [`3261f3e2`](https://github.com/tj/commander.js/blob/3261f3e20f30474f94dab7adadb4a91e03891283/index.js) |
| Linhas alteradas no merge | L 338, R 1; executadas L 98/180, R 1/1 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 1, DF 6, CF 0 (7 registros em 7 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Command |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 18 produz → R 89 consome

Estado: `name` · registros: 1

```js
// L 18     exports = module.exports = new Command();   // produz
// R 89     this._name = name || '';   // consome
```

Pilha de chamadas no momento: index.js:18

### 2. DF direto: R 89 produz → L 167 consome

Estado: `Command#61._name`, `Command#85._name`, `Command#105._name`, `Command#119._name`, `Command#137._name` · registros: 1

```js
// R 89     this._name = name || '';   // produz
// L 167    this._execs[cmd._name] = true;   // consome
```

### 3. DF direto: R 89 produz → L 304 consome

Estado: `Command#39._name`, `Command#109._name`, `Command#251._name` · registros: 1

```js
// R 89     this._name = name || '';   // produz
// L 304    var name = parent === this ? '*' : this._name;   // consome
```

### 4. DF transitivo: R 89 produz → L 305 consome

Estado: `name` · registros: 1

```js
// R 89     this._name = name || '';   // produz
// L 305    parent.on(name, listener);   // consome
```

### 5. DF direto: R 89 produz → L 446 consome

Estado: `Command#17._name` · registros: 1

```js
// R 89     this._name = name || '';   // produz
// L 446    this._name = this._name || basename(argv[1], '.js');   // consome
```

### 6. DF transitivo: R 89 produz → L 462 consome

Estado: `Object#67.list`, `Object#67.install`, `Object#67.publish`, `Object#67.search` · registros: 1

```js
// R 89     this._name = name || '';   // produz
// L 462    if (this._execs[name] && typeof this._execs[name] != "function") {   // consome
```

### 7. OA: L 446 sobrescreve → R 89 foi sobrescrita

Estado: `Command#17._name` · registros: 1

```js
// L 446    this._name = this._name || basename(argv[1], '.js');   // sobrescreve
// R 89     this._name = name || '';   // foi sobrescrita
```

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
