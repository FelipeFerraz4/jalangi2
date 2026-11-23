# C20: webtorrent, `lib/torrent.js`

| | |
|---|---|
| Grupo | **B** (conflito direto, funções diferentes ou sem correspondência) |
| Projeto | [webtorrent__webtorrent](https://github.com/webtorrent/webtorrent) |
| Merge | [`9400efe10f`](https://github.com/webtorrent/webtorrent/commit/9400efe10f02b36c6bb10862bacbbc88b932cddb) (2015-07-03T02:20:33+00:00) |
| Base / Left / Right | [`513e6fa1`](https://github.com/webtorrent/webtorrent/blob/513e6fa11de121d083da60ed3cb959dad2257b23/lib/torrent.js) / [`05932cd6`](https://github.com/webtorrent/webtorrent/blob/05932cd6f9bed3c908a9c318824bb66f5039bf84/lib/torrent.js) / [`9df26f6f`](https://github.com/webtorrent/webtorrent/blob/9df26f6fcd8e6fb32a81127cfd6bb84192604fa5/lib/torrent.js) |
| Linhas alteradas no merge | L 114, R 14; executadas L 36/63, R 3/6 |
| Como executou | suíte de testes do projeto: `node ./bin/test.js` |
| Detectado | OA 0, DF 10, CF 0 (10 registros em 10 pares de linhas) |
| Newminerjs (mesma função?) | Inconclusivo: possível renomeação ou movimentação |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).

## Conflitos (por par de linhas)

### 1. DF transitivo: L 148 produz → R 243 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 148    var self = this   // produz
// R 243    if (self.parsedTorrent.urlList) {   // consome
```

### 2. DF transitivo: L 148 produz → R 244 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 148    var self = this   // produz
// R 244    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))   // consome
```

### 3. DF transitivo: L 157 produz → R 243 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 157    self._onParsedTorrent(parsedTorrent)   // produz
// R 243    if (self.parsedTorrent.urlList) {   // consome
```

### 4. DF transitivo: L 157 produz → R 244 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 157    self._onParsedTorrent(parsedTorrent)   // produz
// R 244    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))   // consome
```

### 5. DF transitivo: L 162 produz → R 243 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 162    Torrent.prototype._onParsedTorrent = function (parsedTorrent) {   // produz
// R 243    if (self.parsedTorrent.urlList) {   // consome
```

### 6. DF transitivo: L 162 produz → R 244 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1 · via parâmetro: 1

```js
// L 162    Torrent.prototype._onParsedTorrent = function (parsedTorrent) {   // produz
// R 244    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))   // consome
```

### 7. DF transitivo: L 163 produz → R 243 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1

```js
// L 163    var self = this   // produz
// R 243    if (self.parsedTorrent.urlList) {   // consome
```

### 8. DF transitivo: L 163 produz → R 244 consome

Estado: `Torrent#27.parsedTorrent`, `Torrent#111.parsedTorrent`, `Torrent#179.parsedTorrent`, `Torrent#393.parsedTorrent`, `Torrent#465.parsedTorrent`, `Torrent#545.parsedTorrent`, `Torrent#613.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#761.parsedTorrent`, `Torrent#809.parsedTorrent`, `Torrent#853.parsedTorrent`, `Torrent#901.parsedTorrent` · registros: 1

```js
// L 163    var self = this   // produz
// R 244    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))   // consome
```

### 9. DF direto: L 165 produz → R 243 consome

Estado: `Torrent#545.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#853.parsedTorrent` · registros: 1

```js
// L 165    self.parsedTorrent = parsedTorrent   // produz
// R 243    if (self.parsedTorrent.urlList) {   // consome
```

### 10. DF direto: L 165 produz → R 244 consome

Estado: `Torrent#545.parsedTorrent`, `Torrent#661.parsedTorrent`, `Torrent#711.parsedTorrent`, `Torrent#853.parsedTorrent` · registros: 1

```js
// L 165    self.parsedTorrent = parsedTorrent   // produz
// R 244    self.parsedTorrent.urlList.forEach(self.addWebPeer.bind(self))   // consome
```

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.

---
Arquivos de código copiados de [webtorrent__webtorrent](https://github.com/webtorrent/webtorrent) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
