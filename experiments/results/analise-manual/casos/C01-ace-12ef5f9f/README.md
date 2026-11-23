# C01: ace, `lib/ace/lib/keys.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe, Italo |
| Projeto | [ajaxorg__ace](https://github.com/ajaxorg/ace) |
| Merge | [`12ef5f9f6b`](https://github.com/ajaxorg/ace/commit/12ef5f9f6b9d5349252a7dd849ddc03ab0fd47a2) (2014-05-01T17:17:36+00:00) |
| Base / Left / Right | [`993df16b`](https://github.com/ajaxorg/ace/blob/993df16bdb4cf80dac13f0fe8f449bb7adb05a65/lib/ace/lib/keys.js) / [`deb4013a`](https://github.com/ajaxorg/ace/blob/deb4013a13e4553a7ce8eefa5defdc391739a53c/lib/ace/lib/keys.js) / [`0155c67b`](https://github.com/ajaxorg/ace/blob/0155c67b1ff866752f96c2e779313dd966fa41d1/lib/ace/lib/keys.js) |
| Linhas alteradas no merge | L 1, R 9; executadas L 1/1, R 6/6 |
| Como executou | suíte de testes do projeto: `node lib/ace/test/all.js` |
| Detectado | OA 0, DF 2, CF 0 (2 registros em 2 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: callback de define (argumento 1) > IIFE |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: L 43 produz → R 149 consome

Estado: `ret` · registros: 1

```js
// L 43     var ret = {   // produz
// R 149    ret.KEY_MODS[i] = mods.filter(function(x) {   // consome
```

Pilha de chamadas no momento: keys.js:34 → keys.js:42 → keys.js:146

### 2. DF direto: L 43 produz → R 150 consome

Estado: `ret` · registros: 1

```js
// L 43     var ret = {   // produz
// R 150    return i & ret.KEY_MODS[x];   // consome
```

Pilha de chamadas no momento: keys.js:34 → keys.js:42 → keys.js:146 → keys.js:149

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [ajaxorg__ace](https://github.com/ajaxorg/ace) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
