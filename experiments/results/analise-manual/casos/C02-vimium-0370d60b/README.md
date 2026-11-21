# C02: vimium, `commands.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Priscila |
| Projeto | [philc__vimium](https://github.com/philc/vimium) |
| Merge | [`0370d60be8`](https://github.com/philc/vimium/commit/0370d60be82aead007f6b0804dd5b90e6fdb1b1c) (2010-09-24T06:38:53+00:00) |
| Base / Left / Right | [`12413ec1`](https://github.com/philc/vimium/blob/12413ec1de1fc2a0fdc46c6e0ef3141d2a7193cf/commands.js) / [`0d15a8fb`](https://github.com/philc/vimium/blob/0d15a8fbdf78ab1a12783406bf678339882323a5/commands.js) / [`64b550a4`](https://github.com/philc/vimium/blob/64b550a4a7fa4af1d9c0996d6f66715dc479ccb5/commands.js) |
| Linhas alteradas no merge | L 17, R 6; executadas L 9/38, R 2/54 |
| Como executou | carregando só o arquivo (`node merge.js`) |
| Detectado | OA 0, DF 3, CF 0 (3 registros em 3 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: clearKeyMappingsAndSetDefaults |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada.

## Conflitos (por par de linhas)

### 1. DF direto: R 180 produz → L 11 consome

Estado: `command`, `description` · registros: 1

```js
// R 180    addCommand('nextFrame',           "Cycle forward to the next frame on the page", true);   // produz
// L 11     availableCommands[command] = { description: description,   // consome
```

Pilha de chamadas no momento: commands.js:180

### 2. DF direto: R 180 produz → L 12 consome

Estado: `isBackgroundCommand` · registros: 1

```js
// R 180    addCommand('nextFrame',           "Cycle forward to the next frame on the page", true);   // produz
// L 12     isBackgroundCommand: isBackgroundCommand,   // consome
```

Pilha de chamadas no momento: commands.js:180

### 3. DF direto: R 180 produz → L 13 consome

Estado: `passCountToFunction` · registros: 1

```js
// R 180    addCommand('nextFrame',           "Cycle forward to the next frame on the page", true);   // produz
// L 13     passCountToFunction: passCountToFunction   // consome
```

Pilha de chamadas no momento: commands.js:180

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [philc__vimium](https://github.com/philc/vimium) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
