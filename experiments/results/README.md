# Resultados

| Arquivo | O que é |
|---|---|
| [`resultados.xlsx`](resultados.xlsx) | **Todos os resultados numa planilha**: funil, lote, conflitos, cruzamento com o Newminerjs, suítes (Amanda, Italo nas 4 traduções, toys) e a análise manual (aba *Conflitos sorteados*: um conflito sorteado de cada amostra). A aba *Leia-me* explica cada aba. |
| [`analise-manual/`](analise-manual/) | Os 29 casos com conflito do lote, uma pasta por caso, e as instruções da análise manual. |
| `dados/suites.json` | Resultados das suítes, usados pela planilha. |

## Regenerar

A planilha é gerada, não editada à mão (exceto as colunas amarelas da aba *Conflitos sorteados*, que são mantidas ao regenerar).

```bash
node experiments/results/coletar_suites.js     # roda as suítes (OA, DF/CF, traduções, toys) → dados/suites.json
node experiments/results/gerar_casos.js        # lote → analise-manual/ (pastas dos casos, casos.json, README)
python3 experiments/results/gerar_planilha.py  # tudo → resultados.xlsx  (requer: pip install openpyxl)
```

O lote usado no trabalho está publicado em `dados/lote/` (veja [`dados/README.md`](../../dados/README.md)); `make reproduzir-rapido` regenera as suítes e a planilha a partir dele, e `make casos` regenera as pastas dos casos (precisa dos clones dos projetos). O cruzamento com o Newminerjs (`tabela_mesma_funcao.csv`) vem de `experiments/wild/cross-newminerjs.js`.

**Google Sheets:** se preencher no Sheets, baixe depois como `.xlsx` por cima deste arquivo e rode o `gerar_planilha.py`: ele lê as respostas e regenera o resto.

A primeira rodada da análise manual (por amostra, com três revisores) foi deixada de lado; as respostas preenchidas estão em [`analise-manual/historico/`](analise-manual/historico/).
