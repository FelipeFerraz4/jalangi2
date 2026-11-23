# C03: vimium, `linkHints.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe, Priscila |
| Projeto | [philc__vimium](https://github.com/philc/vimium) |
| Merge | [`83be3670b2`](https://github.com/philc/vimium/commit/83be3670b293fa78a8c74d092be9f6c4cdb6d66b) (2010-12-31T03:18:01+00:00) |
| Base / Left / Right | [`a1a09659`](https://github.com/philc/vimium/blob/a1a096592f47fc7f219e2c9ccd394c169063324d/linkHints.js) / [`489ff3f8`](https://github.com/philc/vimium/blob/489ff3f8f0f7b44817a09472b5b1e2fad46d7632/linkHints.js) / [`1fd0a389`](https://github.com/philc/vimium/blob/1fd0a389ffe7460ac1c658227f0627c050153632/linkHints.js) |
| Linhas alteradas no merge | L 264, R 2; executadas L 33/204, R 2/21 |
| Como executou | carregando só o arquivo (`node merge.js`) |
| Detectado | OA 0, DF 2, CF 0 (2 registros em 2 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: buildLinkHints |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: R 33 produz → L 36 consome

Estado: `clickableElements` · registros: 1

```js
// R 33     var clickableElements = ["a", "textarea", "button", "select", "input[not(@type='hidden')]",   // produz
// L 36     for (var i in clickableElements)   // consome
```

Pilha de chamadas no momento: linkHints.js:32

### 2. DF direto: R 33 produz → L 37 consome

Estado: `clickableElements` · registros: 1

```js
// R 33     var clickableElements = ["a", "textarea", "button", "select", "input[not(@type='hidden')]",   // produz
// L 37     xpath.push("//" + clickableElements[i], "//xhtml:" + clickableElements[i]);   // consome
```

Pilha de chamadas no momento: linkHints.js:32

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [philc__vimium](https://github.com/philc/vimium) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
