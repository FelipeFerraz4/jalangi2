# C13: ace, `lib/ace/commands/command_manager.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Revisores | Felipe, Italo |
| Projeto | [ajaxorg__ace](https://github.com/ajaxorg/ace) |
| Merge | [`bb827051a6`](https://github.com/ajaxorg/ace/commit/bb827051a618433411c7bc19c5586aa34f340ac9) (2014-10-17T15:25:02+00:00) |
| Base / Left / Right | [`54e022fa`](https://github.com/ajaxorg/ace/blob/54e022fab25ae40f839e9df13ac5db75d79f98f7/lib/ace/commands/command_manager.js) / [`29023787`](https://github.com/ajaxorg/ace/blob/29023787e52e1d1b9490361448fa96352cdb7a49/lib/ace/commands/command_manager.js) / [`c9785870`](https://github.com/ajaxorg/ace/blob/c97858705db0652eb2e80be92e886730ce8556db/lib/ace/commands/command_manager.js) |
| Linhas alteradas no merge | L 2, R 12; executadas L 1/40, R 6/9 |
| Como executou | suíte de testes do projeto: `node lib/ace/test/all.js` |
| Detectado | OA 0, DF 5, CF 0 (5 registros em 5 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: R 24 produz → L 42 consome

Estado: `command` · registros: 1 · via parâmetro: 1

```js
// R 24     return e.command.exec(e.editor, e.args || {});   // produz
// L 42     if (typeof command === "string")   // consome
```

Pilha de chamadas no momento: command_manager.js:52 → command_manager.js:24 → command_manager.js:93 → command_manager.js:97

### 2. DF transitivo: R 52 produz → L 42 consome

Estado: `command` · registros: 1 · via parâmetro: 1

```js
// R 52     e.returnValue = this._emit("exec", e);   // produz
// L 42     if (typeof command === "string")   // consome
```

Pilha de chamadas no momento: command_manager.js:52 → command_manager.js:24 → command_manager.js:93 → command_manager.js:97

### 3. DF transitivo: R 79 produz → L 42 consome

Estado: `command` · registros: 1 · via parâmetro: 1

```js
// R 79     this.macro = [];   // produz
// L 42     if (typeof command === "string")   // consome
```

Pilha de chamadas no momento: command_manager.js:52 → command_manager.js:24 → command_manager.js:93 → command_manager.js:97

### 4. DF transitivo: R 93 produz → L 42 consome

Estado: `command` · registros: 1 · via parâmetro: 1

```js
// R 93     this.macro.forEach(function(x) {   // produz
// L 42     if (typeof command === "string")   // consome
```

Pilha de chamadas no momento: command_manager.js:52 → command_manager.js:24 → command_manager.js:93 → command_manager.js:97

### 5. DF direto: R 97 produz → L 42 consome

Estado: `command` · registros: 1

```js
// R 97     this.exec(x[0], editor, x[1]);   // produz
// L 42     if (typeof command === "string")   // consome
```

Pilha de chamadas no momento: command_manager.js:52 → command_manager.js:24 → command_manager.js:93 → command_manager.js:97

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [ajaxorg__ace](https://github.com/ajaxorg/ace) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
