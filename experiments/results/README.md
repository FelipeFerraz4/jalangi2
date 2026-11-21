# Resultados

| Arquivo | O que é |
|---|---|
| [`resultados.xlsx`](resultados.xlsx) | **Todos os resultados numa planilha**: funil, lote, conflitos, cruzamento com o Newminerjs, suítes (Amanda, Italo nas 4 traduções, toys) e a análise manual (uma aba por revisor, mais a concordância). A aba *Leia-me* explica cada aba. |
| [`analise-manual/`](analise-manual/) | Os 29 casos com conflito do lote, uma pasta por caso, e as instruções da análise manual. |
| `dados/suites.json` | Resultados das suítes, usados pela planilha. |

## Regenerar

A planilha é gerada, não editada à mão (exceto as colunas amarelas das abas *Análise - \<nome\>* e as de veredito da *Concordância*, que são mantidas ao regenerar).

```bash
node experiments/results/coletar_suites.js     # roda as suítes (OA, DF/CF, traduções, toys) → dados/suites.json
node experiments/results/gerar_casos.js        # lote → analise-manual/ (pastas dos casos, casos.json, README)
python3 experiments/results/gerar_planilha.py  # tudo → resultados.xlsx  (requer: pip install openpyxl)
```

O lote fica fora do repositório, em `~/Documentos/wild/execucoes/lote/` (veja `experiments/wild/README.md`). O cruzamento com o Newminerjs (`tabela_mesma_funcao.csv`) vem de `experiments/wild/cross-newminerjs.js`.

**Google Sheets:** para preencher a análise em equipe, suba o `resultados.xlsx` no Google Drive e abra com o Sheets (os números e as listas de opções se mantêm). Para trazer as respostas de volta, baixe como `.xlsx` por cima deste arquivo e rode o `gerar_planilha.py`: ele lê as respostas e regenera o resto.
