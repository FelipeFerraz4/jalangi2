# C24: jsPDF, `dist/jspdf.min.js`

| | |
|---|---|
| Grupo | **C** (só transitivo ou arquivo gerado: suspeito) |
| Revisores | Felipe |
| Projeto | [parallax__jsPDF](https://github.com/parallax/jsPDF) |
| Merge | [`aa096114eb`](https://github.com/parallax/jsPDF/commit/aa096114eb8b151b9a069bec2dfa8cc9e2b93110) (2012-12-30T00:00:43+00:00) |
| Base / Left / Right | [`9c0f72be`](https://github.com/parallax/jsPDF/blob/9c0f72be1b61e2cbd2f14b0b28d7ddbb6df4bbc9/dist/jspdf.min.js) / [`00bf48e4`](https://github.com/parallax/jsPDF/blob/00bf48e4c985485212e3474860084720c9275f9e/dist/jspdf.min.js) / [`c3974c93`](https://github.com/parallax/jsPDF/blob/c3974c93ded32cad93c226b8036a922b80b81f8b/dist/jspdf.min.js) |
| Linhas alteradas no merge | L 7, R 38; executadas L 7/36, R 13/182 |
| Como executou | carregando só o arquivo (`node merge.js`) |
| Detectado | OA 0, DF 14, CF 0 (14 registros em 14 pares de linhas) |
| Newminerjs (mesma função?) | Sim: função correspondente adicionada nos dois lados: IIFE > w
IIFE > w > m
IIFE > w > x
IIFE > w > I
IIFE > w > f
IIFE > w > H
IIFE > w > Q
IIFE > w > R
IIFE > w > N
IIFE > w > O
IIFE > w > G
IIFE > w > J
IIFE > w > p.internal.getFont
IIFE > w > p.internal.getFontSize
IIFE > w > p.internal.write
IIFE > w > p.internal.getCoordinateString
IIFE > w > p.internal.getVerticalCoordinateString
IIFE > w > p.addPage
IIFE > w > p.text
IIFE > w > p.line
IIFE > w > p.lines
IIFE > w > p.rect
IIFE > w > p.triangle
IIFE > w > p.ellipse
IIFE > w > p.circle
IIFE > w > p.setProperties
IIFE > w > p.addImage
IIFE > w > p.setFontSize
IIFE > w > p.setFont
IIFE > w > p.setF [continua nos diffs e no manifesto JSON] |

Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).

Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada.

## Conflitos (por par de linhas)

### 1. DF direto: R 54 produz → L 56 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 56     "Helvetica-Bold":s("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 2. DF direto: R 54 produz → L 57 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 57     Courier:s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-BoldOblique":s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Bold":s("{'widths'{k3q2q5ncx2   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 3. DF direto: R 54 produz → L 58 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 58     Helvetica:s("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 4. DF direto: R 54 produz → L 59 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 59     "Helvetica-BoldOblique":s("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 5. DF direto: R 54 produz → L 60 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 60     "Courier-Bold":s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Italic":s("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 6. DF direto: R 54 produz → L 61 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 61     "Times-Roman":s("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 7. DF direto: R 54 produz → L 62 consome

Estado: `s` · registros: 1

```js
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // produz
// L 62     "Helvetica-Oblique":s("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54

### 8. DF direto: L 56 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 56     "Helvetica-Bold":s("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:56

### 9. DF direto: L 57 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 57     Courier:s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-BoldOblique":s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Bold":s("{'widths'{k3q2q5ncx2   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:57

### 10. DF direto: L 58 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 58     Helvetica:s("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:58

### 11. DF direto: L 59 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 59     "Helvetica-BoldOblique":s("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:59

### 12. DF direto: L 60 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 60     "Courier-Bold":s("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Italic":s("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:60

### 13. DF direto: L 61 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 61     "Times-Roman":s("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:61

### 14. DF direto: L 62 produz → R 54 consome

Estado: `a` · registros: 1

```js
// L 62     "Helvetica-Oblique":s("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w   // produz
// R 54     (function(x){var s=function(a){for(var c={},d=0;16>d;d++)c["klmnopqrstuvwxyz"[d]]="0123456789abcdef"[d];for(var m={},g=1,e,j=m,h=[],n,w="",s="",t,v=a.length-1,d   // consome
```

Pilha de chamadas no momento: jspdf.min.js:54 → jspdf.min.js:62

## Para preencher

Na planilha `experiments/results/resultados.xlsx`, aba do seu nome, linha deste caso.

---
Arquivos de código copiados de [parallax__jsPDF](https://github.com/parallax/jsPDF) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.
