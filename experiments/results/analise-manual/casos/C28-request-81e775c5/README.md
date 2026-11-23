# C28: request, `request.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Revisores | Italo, Priscila |
| Projeto | [request__request](https://github.com/request/request) |
| Merge | [`81e775c56c`](https://github.com/request/request/commit/81e775c56cb1abeadaab3390c71553a027729017) (2014-07-07T21:02:12+00:00) |
| Base / Left / Right | [`bfea018c`](https://github.com/request/request/blob/bfea018c3eaf83b18d49001797096f990b59b446/request.js) / [`8640de0b`](https://github.com/request/request/blob/8640de0bbcdbc8589ee8d62a2360c98e1deefc4a/request.js) / [`e86377c0`](https://github.com/request/request/blob/e86377c0c1e7695c3997f7802175ca37f5a5113b/request.js) |
| Linhas alteradas no merge | L 69, R 10; executadas L 39/44, R 6/6 |
| Como executou | suíte de testes do projeto: `node tests/run.js` |
| Detectado | OA 0, DF 0, CF 1 (1 registros em 1 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: correspondência ambígua |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. CF transitivo: L 817 e R 148 confluem na base 625

Estado: `—` · registros: 1

```js
// L 817    redirectTo = self.uri
// R 148    self.proxy = process.env.HTTP_PROXY || process.env.http_proxy || null;
// base 625 var isHttps = (proxy && proxy.protocol === 'https:') || this.uri.protocol === 'https:'   // confluência
```

Pilha de chamadas no momento: request.js:929 → request.js:519 → request.js:371

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [request__request](https://github.com/request/request) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
