# Reprodução das análises do trabalho. Só precisa de Docker e make: tudo roda na imagem jalangi2-lab.
#   make ajuda        lista os alvos
# Detalhes em docs/REPRODUCAO.md. Pastas de dados: experiments/lib/caminhos.js (variáveis DADOS, REPOS, ...).

SHELL  := /bin/bash
IMAGEM ?= jalangi2-lab
DIR    := $(CURDIR)
SOCK   ?= /var/run/docker.sock
LOTE   ?= lote
JOBS   ?= 2

# O repositório é montado no mesmo caminho do host (o lote passa caminhos para contêineres irmãos).
# Pastas de dados fora do repositório, se configuradas, também são montadas no mesmo caminho.
MONTAR_EXTRA = $(foreach v,DADOS REPOS EXECUCOES FONTES SCAZ NEWMINERJS,$(if $($(v)),-v "$($(v))":"$($(v))" -e $(v)="$($(v))"))
RODAR = docker run --rm -t -v "$(DIR)":"$(DIR)" -w "$(DIR)" -u "$$(id -u):$$(id -g)" -e HOME=/tmp \
        $(MONTAR_EXTRA) $(IMAGEM)
# O lote cria um contêiner por amostra: precisa do Docker do host
RODAR_DOCKER = docker run --rm -t -v "$(DIR)":"$(DIR)" -w "$(DIR)" -u "$$(id -u):$$(id -g)" -e HOME=/tmp \
        -v $(SOCK):$(SOCK) --group-add "$$(stat -c %g $(SOCK))" $(MONTAR_EXTRA) $(IMAGEM)

.PHONY: ajuda imagem dados fontes validacao teste suites planilha reproduzir-rapido \
        fontes-coleta coleta comparar-coleta repos lote comparar-lote casos cruzamento limpar

ajuda:
	@echo "Reprodução (só precisa de Docker e make). Em ordem do mais rápido ao mais longo:"
	@echo ""
	@echo "  make imagem             constrói a imagem $(IMAGEM)                                 (~2 min, uma vez)"
	@echo "  make validacao          OA (72), DF/CF (13), traduções (18 x 3), toys (33), autotestes (~5 min)"
	@echo "  make reproduzir-rapido  suítes + planilha a partir do lote publicado em dados/lote  (~5 min)"
	@echo ""
	@echo "  Refazer do zero (rede, ~3 GB de disco, várias horas):"
	@echo "  make fontes-coleta      baixa o Newminerjs (coleta de merges, ~100 MB)"
	@echo "  make coleta             refaz mapas L/R e manifesto em dados/execucoes/coleta, compara com o publicado"
	@echo "  make repos              clona os 38 projetos nos commits da coleta (2,4 GB)"
	@echo "  make lote               roda as 976 amostras (~2h30) em dados/execucoes/$(LOTE)"
	@echo "  make comparar-lote      compara o lote refeito com o publicado"
	@echo "  make casos              gera as pastas dos 29 casos (precisa de make repos)"
	@echo ""
	@echo "  make cruzamento ANALISE_LR=<analise_left_right.xlsx>   cruzamento com a análise estática do Newminerjs"
	@echo "  make teste              só os autotestes da execução em lote"
	@echo "  make limpar             apaga o que foi descompactado e gerado (não apaga dados publicados)"

imagem:
	docker build -t $(IMAGEM) .

# Descompacta mapas e amostras publicados (dados/coleta/maps, dados/lote/amostras)
dados:
	$(RODAR) sh reproducao/preparar-dados.sh

# SCAz.js no commit usado (os 72 casos de OA)
fontes:
	$(RODAR) sh reproducao/fontes.sh

validacao: dados fontes
	$(RODAR) node experiments/run_validation.js
	$(RODAR) node experiments/run_all_toys.js
	$(RODAR) node experiments/run_translation_study.js
	$(RODAR) node experiments/wild/test-wild.js

teste:
	$(RODAR) node experiments/wild/test-wild.js

# Resultados das suítes para a planilha (experiments/results/dados/suites.json)
suites: fontes
	$(RODAR) node experiments/results/coletar_suites.js

# Planilha com todos os resultados; mantém o que foi preenchido na aba de análise manual
planilha: dados
	$(RODAR) python3 experiments/results/gerar_planilha.py

reproduzir-rapido: dados suites planilha
	@echo "Pronto: experiments/results/resultados.xlsx (a partir do lote publicado em dados/lote)"

fontes-coleta:
	$(RODAR) sh reproducao/fontes.sh Newminerjs

# Refaz a coleta (mapas L/R e manifesto) a partir do Newminerjs, sem sobrescrever o publicado
coleta: fontes-coleta
	$(RODAR) sh reproducao/coleta.sh
	-$(MAKE) --no-print-directory comparar-coleta

comparar-coleta:
	$(RODAR) node reproducao/comparar.js coleta

# Clona os projetos nos commits da coleta e confere cada arquivo com o pacote do Newminerjs
repos: dados fontes-coleta
	$(RODAR) sh reproducao/repos.sh

# O lote completo, retomável (rodar de novo pula as amostras prontas)
lote: dados
	$(RODAR_DOCKER) node experiments/wild/run-batch.js --run $(LOTE) --jobs $(JOBS)
	-$(MAKE) --no-print-directory comparar-lote

comparar-lote:
	$(RODAR) node reproducao/comparar.js lote "dados/execucoes/$(LOTE)"

# Pastas dos 29 casos (versões, diffs, merge anotado) a partir do lote publicado; precisa dos clones
casos: dados
	$(RODAR) node experiments/results/gerar_casos.js

cruzamento: dados
	@test -n "$(ANALISE_LR)" || { echo "informe ANALISE_LR=<caminho do analise_left_right.xlsx do Newminerjs>"; exit 2; }
	docker run --rm -t -v "$(DIR)":"$(DIR)" -w "$(DIR)" -u "$$(id -u):$$(id -g)" -e HOME=/tmp $(MONTAR_EXTRA) \
	  -v "$$(realpath "$(ANALISE_LR)")":/tmp/analise_left_right.xlsx:ro $(IMAGEM) \
	  node experiments/wild/cross-newminerjs.js /tmp/analise_left_right.xlsx dados/lote

limpar:
	rm -rf dados/coleta/maps dados/lote/amostras
