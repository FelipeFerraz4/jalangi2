# C07: request, `index.js`

| | |
|---|---|
| Grupo | **A** (conflito direto, mesma função) |
| Revisores | Felipe, Italo |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`b11988e33f`](https://github.com/request/request/commit/b11988e33fb96f25628eb55f89a2a11303860875) (2013-04-24T15:24:34+00:00) |
| Base / Left / Right | [`9bc28bf9`](https://github.com/request/request/blob/9bc28bf912fb0afdd14b36b0ccbafb185a32546a/index.js) / [`5a120e87`](https://github.com/request/request/blob/5a120e875c48af045dde0c19aec1e12b435dbca3/index.js) / [`9a35cd22`](https://github.com/request/request/blob/9a35cd2248d9492b099c7ee46d68ca017b6a701c/index.js) |
| Linhas alteradas no merge | L 39, R 1; executadas L 24/26, R 1/1 |
| Como executou | suíte de testes do projeto: `node tests/run.js` |
| Detectado | OA 0, DF 1, CF 0 (1 registros em 1 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função da base alterada nos dois lados: Request.prototype.init |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada.

## Conflitos (por par de linhas)

### 1. DF direto: R 313 produz → L 1015 consome

Estado: `user`, `pass` · registros: 1

```js
// R 313    self.auth(authPieces[0], authPieces.slice(1).join(':'), true)   // produz
// L 1015   if (typeof user !== 'string' || (pass !== undefined && typeof pass !== 'string')) {   // consome
```

Pilha de chamadas no momento: index.js:824 → index.js:873 → index.js:148 → index.js:1227 → index.js:124 → index.js:313

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
