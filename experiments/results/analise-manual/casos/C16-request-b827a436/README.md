# C16: request, `main.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`b827a43648`](https://github.com/request/request/commit/b827a436488dc37e3f685e1e1a022fb1cb0d0a98) (2012-06-04T01:28:15+00:00) |
| Base / Left / Right | [`9611f4c7`](https://github.com/request/request/blob/9611f4c7e795a929db126110338ccaf9153df2d0/main.js) / [`4c91de38`](https://github.com/request/request/blob/4c91de3826457f8eefd9912f70e6250674cd1af5/main.js) / [`6f9da893`](https://github.com/request/request/blob/6f9da89348b848479c23192c04b3c0ddd5a4c8bc/main.js) |
| Linhas alteradas no merge | L 37, R 4; executadas L 6/25, R 3/3 |
| Como executou | suíte de testes do projeto: `node tests/run.js` |
| Detectado | OA 0, DF 2, CF 0 (2 registros em 2 pares de linhas) |
| Newminerjs (mesma função?) | Não: sem função correspondente alterada nos dois lados |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF direto: R 397 produz → L 406 consome

Estado: `self` · registros: 1

```js
// R 397    var self = this   // produz
// L 406    if (self.src && self.src.stat && self.src.stat.size) {   // consome
```

Pilha de chamadas no momento: main.js:349 → main.js:799

### 2. DF direto: R 397 produz → L 409 consome

Estado: `self` · registros: 1

```js
// R 397    var self = this   // produz
// L 409    if (self._aws) {   // consome
```

Pilha de chamadas no momento: main.js:349 → main.js:799

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
