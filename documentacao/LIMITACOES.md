# Limitações e ameaças à validade

As correções propostas para as limitações da análise, com ganhos e riscos, estão em [`experiments/DECISOES_PENDENTES.md`](../experiments/DECISOES_PENDENTES.md).

## Limitações da ferramenta

### Alcance: o que ela não consegue analisar
- **Só vê o que executa.** É uma análise dinâmica: mudanças em caminhos que não executam passam despercebidas. No lote, só 159 das 976 amostras executaram linhas do Left **e** do Right.
- **Depende de testes.** Sem a suíte do projeto, só roda o carregamento do arquivo, que raramente passa pelas mudanças: 23 das 29 amostras com conflito vieram dos testes, e 419 amostras não tinham script de teste utilizável.
- **Só ES5.** O Jalangi2 não instrumenta sintaxe moderna (`import`/`export`, `class`, arrow functions): 83 amostras ficaram de fora.
- **Só Node.js.** Código de navegador, bibliotecas globais (jQuery) e módulos nativos fazem a execução falhar: 548 amostras (56%) por ambiente.
- **Um arquivo por vez.** Só o arquivo alterado é instrumentado; fluxos que passam por outros arquivos do projeto ou por dependências não são acompanhados, e interferências entre arquivos diferentes do mesmo merge não são detectadas.

### Precisão: o que ela analisa, mas reporta a mais
- **Atribuição de linhas** (a principal fonte de falsos positivos, item 2 do `DECISOES_PENDENTES.md`):
  - *herança pela chamada*: o que roda dentro de uma chamada feita numa linha alterada herda aquele lado, mesmo que a chamada só tenha sido movida ou ganhado um `;`;
  - *comando de várias linhas*: o comando inteiro herda o lado de qualquer linha alterada dentro dele;
  - *linha igual nos dois lados*: o mapa a conta como do Left, e a ferramenta vê um conflito do Right com ele mesmo.
- **Não distingue refatoração de mudança de comportamento** (`this` → `self`, código movido).
- **Fluxo não é interferência.** A ferramenta reporta conflitos *potenciais*; decidir se há interferência exige análise manual.
- **Sem dependência de controle.** Um `if` que lê um valor do outro lado não contamina o que é escrito dentro dele.
- **Transitividade aproximada.** Numa chamada, todos os parâmetros recebem a origem de todos os argumentos ("via parâmetro").
- **O CF ignora origens que entram por parâmetro**, e por isso não detecta a confluência interprocedural (item 1 do `DECISOES_PENDENTES.md`).
- **Contagem inflada.** Um mesmo par de mudanças gera muitos registros (uma amostra tem 102); a medida de comparação é a amostra.

### Custo
- Precisa instalar e executar o projeto; o lote de 976 amostras leva ~2h30 com 2 frentes, e a análise deixa a execução mais lenta (Moraes et al. medem, em média, 172%).

## Ameaças à validade

### Interna
- **Gabarito das suítes.** O esperado dos testes de DF/CF vem da análise estática em Java, e vários testes têm a asserção comentada; não é uma verdade independente.
- **Traduções.** Traduzir as samples de Java para JavaScript pode mudar a semântica; mitigado comparando três traduções (JSweet, JSweet + IA, só IA), que deram o mesmo resultado.
- **Mapas de linhas.** O mapa ignora diferenças de espaço e conta linhas iguais nos dois lados como do Left; foi validado contra o método da Amanda (`git blame -w -M`) em 447 amostras do Express (97% de concordância).
- **Análise manual.** Feita por uma pessoa, sem segunda revisão independente; um conflito sorteado por amostra.

### Externa
- **Amostra.** 38 projetos JavaScript com mais de 1.000 estrelas e merges até 2015 (coleta Newminerjs), com no máximo 50 amostras por projeto; os resultados podem não valer para código moderno ou para projetos de navegador.
- **Projetos executáveis.** Os resultados sobre conflitos vêm só das 159 amostras que executaram os dois lados, concentradas em bibliotecas Node com testes (request, commander, nodemon, winston...).

### De construção
- **Registros × amostras.** A contagem de registros repete a propagação de um mesmo fluxo; por isso os resultados são dados por amostra.
- **Interferência.** A definição usada (Horwitz et al.; Borba) depende da intenção de cada desenvolvedor, inferida do código, do diff e da mensagem do commit.

### Reprodutibilidade
- Refazer o lote instala as dependências com `npm install` sem lockfile; versões diferentes das de 2026 podem mudar resultados. Por isso o lote usado está publicado em `dados/lote/`, e `make comparar-lote` mostra o que mudou numa execução nova.
