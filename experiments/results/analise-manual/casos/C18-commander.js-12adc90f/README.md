# C18: commander.js, `lib/commander.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Revisores | Felipe |
| Projeto | [tj__commander.js](https://github.com/tj/commander.js) |
| Merge | [`12adc90fa9`](https://github.com/tj/commander.js/commit/12adc90fa9b47d39fc57d11095bf08a26ebe20d5) (2012-07-03T18:17:15+00:00) |
| Base / Left / Right | [`df60805f`](https://github.com/tj/commander.js/blob/df60805f235f5d32989ff5f826ef5a40a1a718a2/lib/commander.js) / [`f4fd782a`](https://github.com/tj/commander.js/blob/f4fd782ade18bbe2ab759cd7febf41c06aba29aa/lib/commander.js) / [`31188715`](https://github.com/tj/commander.js/blob/31188715678e4436150e5196f34c608b82d63755/lib/commander.js) |
| Linhas alteradas no merge | L 1, R 7; executadas L 1/1, R 2/3 |
| Como executou | suíte de testes do projeto: `make test` |
| Detectado | OA 0, DF 4, CF 0 (4 registros em 4 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: R 287 produz → L 50 consome

Estado: `description` · registros: 1

```js
// R 287    , option = new Option(flags, description)   // produz
// L 50     this.description = description || '';   // consome
```

Pilha de chamadas no momento: commander.js:347 → commander.js:580 → commander.js:287

### 2. DF transitivo: R 347 produz → L 50 consome

Estado: `description` · registros: 1 · via parâmetro: 1

```js
// R 347    this.version(require('../package.json').version);   // produz
// L 50     this.description = description || '';   // consome
```

Pilha de chamadas no momento: commander.js:347 → commander.js:580 → commander.js:287

### 3. DF transitivo: R 579 produz → L 50 consome

Estado: `description` · registros: 1 · via parâmetro: 1

```js
// R 579    flags = flags || '-V, --version';   // produz
// L 50     this.description = description || '';   // consome
```

Pilha de chamadas no momento: commander.js:347 → commander.js:580 → commander.js:287

### 4. DF transitivo: R 580 produz → L 50 consome

Estado: `description` · registros: 1 · via parâmetro: 1

```js
// R 580    this.option(flags, 'output the version number');   // produz
// L 50     this.description = description || '';   // consome
```

Pilha de chamadas no momento: commander.js:347 → commander.js:580 → commander.js:287

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [tj__commander.js](https://github.com/tj/commander.js) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
