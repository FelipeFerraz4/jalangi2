# Fontes e licenças

De onde vem cada material usado no trabalho, o que está neste repositório e em que condição.

## Este repositório

É um fork do **Jalangi2** (Samsung, licença Apache-2.0, `LICENSE.txt`; o README original está em [`README.jalangi2.md`](../README.jalangi2.md)). O que o trabalho acrescentou (`experiments/`, `reproducao/`, `dados/`, `documentacao/`, `Makefile`) segue a mesma licença, exceto o material de terceiros listado abaixo.

## Material de terceiros

| Material | Origem | Commit | Neste repositório? | Condição |
|---|---|---|---|---|
| 72 casos de OA (código JS traduzido e mapas L/R) | [amandascm/SCAz.js](https://github.com/amandascm/SCAz.js) (Moraes, Borba e Da Silva, SBLP 2024) | `6b738d2` | **não**: baixado por `reproducao/fontes.sh` | sem licença definida |
| Testes e samples de DF e CF (gabarito) | [spgroup/conflict-static-analysis](https://github.com/spgroup/conflict-static-analysis) (Santos et al., 2023) | `8ab71e3` | **não** os testes; as 9 samples traduzidas estão em `experiments/df_samples/` | sem licença definida; as traduções são derivadas e estão aqui só para a validação |
| Traduções A, B e C das samples | [zecacorreia/tjtjdf](https://github.com/zecacorreia/tjtjdf) (Italo Correia) | `e3191bc` | sim, cópia em `experiments/df_samples/abordagens/` | derivadas das samples acima |
| Coleta de merges (amostras, versões dos arquivos) | [PriscilaDevGirl/Newminerjs](https://github.com/PriscilaDevGirl/Newminerjs) (Priscila Almeida) | `3f46054` | só derivados: manifesto, mapas de linhas e o resumo do funil, em `dados/coleta/` | condições em `DIREITOS_E_LICENCAS.md` do repositório |
| Análise estática "mesma função?" (`analise_left_right.xlsx`) | Newminerjs (Priscila Almeida) | não publicado | só o cruzamento, em `dados/lote/` | arquivo de trabalho, não público |
| Código dos 38 projetos analisados | os repositórios de cada projeto no GitHub (URLs em `dados/coleta/manifesto.csv`) | o commit de cada merge | não; os casos da análise manual (`experiments/results/analise-manual/casos/`) trazem as 4 versões do arquivo de cada um dos 29 casos | a licença de cada projeto; cópias só para pesquisa |

Os commits estão também em `reproducao/fontes.txt`, que é de onde o `reproducao/fontes.sh` os lê.

## Referências

- S. Horwitz, J. Prins e T. Reps. *Integrating Noninterfering Versions of Programs*. ACM TOPLAS 11(3), 1989.
- M. Barbosa, P. Borba, R. Bonifácio e G. Santos. *Semantic conflict detection with overriding assignment analysis*. SBES 2022.
- G. Santos, P. Borba, R. Bonifácio e M. Barbosa. *Detecting Semantic Conflicts using Static Analysis*. arXiv:2310.04269, 2023.
- A. Moraes, P. Borba e L. Da Silva. *Semantic conflict detection via dynamic analysis*. SBLP 2024.
- K. Sen, S. Kalasapur, T. Brutch e S. Gibbs. *Jalangi: A Selective Record-Replay and Dynamic Analysis Framework for JavaScript*. ESEC/FSE 2013.
