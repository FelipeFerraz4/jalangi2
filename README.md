# Detecção de conflitos semânticos com análise dinâmica

**Overriding Assignment, Data Flow e Confluence Flow em código JavaScript, com Jalangi2**

Trabalho da disciplina IN0977 – Merge and Code Review (CIn/UFPE), de Felipe Ferraz, Italo Correia e Priscila Timoteo.

Um merge pode ser aceito pelo Git sem nenhum conflito e mesmo assim quebrar o comportamento que um dos desenvolvedores implementou. Moraes et al. (SBLP 2024) mostraram que dá para detectar um tipo dessas interferências, o *overriding assignment* (OA), **executando** o programa integrado com o Jalangi2. Este trabalho:

1. **estende a análise dinâmica** para *data flow* (DF) e *confluence flow* (CF), os padrões que a análise estática de Santos et al. (2023) detecta;
2. **valida** a análise contra os gabaritos de referência (os casos de OA da Amanda e os testes de DF/CF do `conflict-static-analysis`), em três traduções diferentes dos testes Java;
3. **executa** a análise num lote de 976 amostras de merges reais (coleta Newminerjs, 38 projetos), em contêineres isolados;
4. **analisa manualmente** os conflitos encontrados, para saber se correspondem a interferências reais.

Este repositório é um fork do [Jalangi2](https://github.com/Samsung/jalangi2) (o README original está em [`README.jalangi2.md`](README.jalangi2.md)).

## Resultados

**Validação** (`make validacao`)

| Suíte | Origem | Resultado |
|---|---|---|
| OA, 72 casos | Moraes et al. (casos de Barbosa et al.) | 68 corretos; 3 programas traduzidos que quebram ao executar; 1 sem esperado |
| DF, 6 testes | Santos et al. | 5 corretos; 1 divergência intencional (índices de array independentes) |
| CF, 6 testes | Santos et al. | 6 corretos |
| Containment, 1 teste | Santos et al. | correto |
| Confluência SVFA, 6 testes | Santos et al. | 5 corretos; 1 divergente (teste com `@Ignore` no próprio Java) |
| Traduções A (JSweet), B (JSweet + IA), C (só IA) | estudo de Italo Correia | mesmo resultado nas três, em todos os casos |
| Toys, 33 programas | este trabalho | um por regra da análise, todos executados |

**Lote de merges reais** (dados em [`dados/lote/`](dados/lote/))

| Etapa | Amostras |
|---|---:|
| Coleta Newminerjs (merges até 2015, até 50 por projeto) | 1.283 |
| Com linhas do Left e do Right no merge (o lote) | 976 |
| Instrumentáveis (ES5) | 893 |
| Executaram linhas do Left e do Right | 159 |
| **Com conflito** (DF em 27, CF em 6, OA em 1) | **29** |

Das 976 amostras, 56% falharam por ambiente (código de navegador, bibliotecas globais, módulos nativos); dos 29 conflitos, 23 vieram da suíte de testes dos projetos. Em 7 dos 29, Left e Right alteraram funções diferentes, segundo a análise estática do Newminerjs: são interferências que passam por chamadas e estado compartilhado.

**Análise manual:** em andamento. Os resultados serão colocados na aba *Conflitos sorteados* da planilha [`experiments/results/resultados.xlsx`](experiments/results/resultados.xlsx), e o material de cada caso está em [`experiments/results/analise-manual/`](experiments/results/analise-manual/).

## Como reproduzir

Só precisa de **Docker** e **make**.

```bash
make imagem              # constrói o ambiente (uma vez)
make validacao           # ~5 min: suítes com gabarito, traduções, toys e autotestes
make reproduzir-rapido   # ~5 min: suítes e planilha a partir do lote publicado
make ajuda               # todos os alvos, inclusive refazer coleta, clones e lote do zero
```

Passo a passo, requisitos e o que esperar de cada alvo: [`documentacao/REPRODUCAO.md`](documentacao/REPRODUCAO.md).

## Estrutura

| Pasta | O que tem |
|---|---|
| [`experiments/analyses/`](experiments/analyses/) | A análise: OA, DF e CF (`analysis_dataflow.js`) |
| [`experiments/`](experiments/README.md) | Runners das suítes (`run_*.js`), toys, samples traduzidas (`df_samples/`), documentação da análise |
| [`experiments/wild/`](experiments/wild/README.md) | Execução em merges reais: coleta, clones, contêineres, lote, consolidação |
| [`experiments/results/`](experiments/results/README.md) | Planilha com todos os resultados, casos da análise manual e geradores |
| [`dados/`](dados/README.md) | Dados publicados (coleta e lote) e, fora do git, clones e execuções novas |
| [`reproducao/`](reproducao/) | Scripts usados pelo `Makefile`: fontes nos commits fixos, preparação dos dados, comparação |
| [`documentacao/`](documentacao/) | Reprodução, limitações, fontes e licenças, uso de IA |
| `src/` | O Jalangi2, com as correções feitas no trabalho (shebang, `for...in`) |

## Documentação

- [Como reproduzir](documentacao/REPRODUCAO.md)
- [Como a análise funciona](experiments/README.md): mapa de linhas L/R, regras de OA, DF e CF, relatório
- [Execução em merges reais](experiments/wild/README.md)
- [Limitações e ameaças à validade](documentacao/LIMITACOES.md)
- [Decisões pendentes](experiments/DECISOES_PENDENTES.md): limitações com correção proposta
- [Fontes e licenças](documentacao/FONTES_E_LICENCAS.md)
- [Uso de IA](documentacao/USO_DE_IA.md)

## Referências principais

- A. Moraes, P. Borba e L. Da Silva. *Semantic conflict detection via dynamic analysis*. SBLP 2024.
- M. Barbosa, P. Borba, R. Bonifácio e G. Santos. *Semantic conflict detection with overriding assignment analysis*. SBES 2022.
- G. Santos, P. Borba, R. Bonifácio e M. Barbosa. *Detecting Semantic Conflicts using Static Analysis*. arXiv:2310.04269, 2023.
- S. Horwitz, J. Prins e T. Reps. *Integrating Noninterfering Versions of Programs*. ACM TOPLAS, 1989.
