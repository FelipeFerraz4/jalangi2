"""Gera experiments/results/resultados.xlsx, que concentra todos os resultados do trabalho.

Abas: Leia-me, Funil, Resultado consolidado, Projetos, Amostras, Conflitos, Mesma função, Casos (29),
Conflitos sorteados, Amanda (OA), DF-CF (13), Traduções (Italo), Toys.

Se o arquivo já existir, o que foi preenchido na aba "Conflitos sorteados" é lido e mantido (casado pelo
número do caso), então a planilha pode ser regenerada depois de a análise manual começar.

Entradas:
  ~/Documentos/wild/execucoes/lote/{resultados,conflitos,resumo_projetos,tabela_mesma_funcao}.csv  (lote)
  experiments/results/analise-manual/casos.json   (gerar_casos.js)
  experiments/results/dados/suites.json           (coletar_suites.js)
  ../Newminerjs/dataset/resumo.json               (funil da coleta)

Uso: python3 experiments/results/gerar_planilha.py [--lote DIR] [--newminerjs DIR] [--branch master]
Requer openpyxl (pip install openpyxl).
"""
import argparse
import csv
import json
import os
import random
import re
import statistics
from collections import Counter, defaultdict

from openpyxl import Workbook, load_workbook
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
GITHUB = 'https://github.com/FelipeFerraz4/jalangi2/tree/{branch}/experiments/results/analise-manual/'
GENERATED = re.compile(r'(^|/)(dist|build|out|vendor)/|\.min\.js$|(^|/)bundle')

HEAD = PatternFill('solid', fgColor='1F3A5F')
SUB = PatternFill('solid', fgColor='DCE6F1')
FILL_IN = PatternFill('solid', fgColor='FFF7D6')
GROUP = {'A': PatternFill('solid', fgColor='D9EAD3'), 'B': PatternFill('solid', fgColor='DDEBF7'), 'C': PatternFill('solid', fgColor='FCE4D6')}
THIN = Border(bottom=Side(style='thin', color='BFBFBF'))
WRAP = Alignment(wrap_text=True, vertical='top')

# Colunas a preencher em cada aba de revisor: (cabeçalho, largura, opções da lista ou None)
FILL_COLUMNS = [
    ('Interferência real?', 14, ['Sim', 'Não', 'Dúvida']),
    ('Tipo confirmado', 14, ['OA', 'DF', 'CF', 'Mais de um', 'Nenhum']),
    ('Se não ou dúvida: motivo', 30, ['Mudança que preserva o valor', 'Refatoração ou renomeação', 'Arquivo gerado ou minificado',
                                      'Fluxo transitivo espúrio', 'Via parâmetro (união dos argumentos)', 'Linha atribuída à branch errada',
                                      'Código de teste ou de exemplo', 'Outro (explicar)']),
    ('Teste ou trecho que exercita o conflito', 30, None),
    ('Evidência (trecho de código e justificativa)', 60, None),
    ('Confiança', 11, ['Alta', 'Média', 'Baixa']),
    ('Tempo gasto (min)', 10, None),
    ('Observações', 40, None),
]
SAMPLE_SHEET = 'Conflitos sorteados'
SAMPLE_SEED = 20261123  # 1 conflito sorteado por amostra; semente fixa para o sorteio ser reproduzível
# Colunas que o revisor preenche. O "como a ferramenta chegou ao conflito" não está aqui: sai dos dados (coluna automática)
SAMPLE_FILL = [
    FILL_COLUMNS[0],
    ('Por que não é interferência (se Não ou Dúvida)', 30, ['Mudança que preserva o valor', 'Refatoração ou renomeação', 'Mudanças independentes',
                                                           'Mudanças redundantes (corrigem o mesmo problema)', 'O valor não chega de fato ao outro lado',
                                                           'Arquivo gerado ou minificado', 'Outro (explicar)']),
    FILL_COLUMNS[4], FILL_COLUMNS[5], FILL_COLUMNS[6], FILL_COLUMNS[7],
]


def how_detected(g):
    """Como a ferramenta chegou ao conflito, a partir dos dados (sem julgamento): de onde veio a branch de cada linha,
    se o fluxo é transitivo e se passou por parâmetro."""
    parts = []
    for side, line, orig in ((g['primeiro'], g['linha1'], g['origem1']), (g['segundo'], g['linha2'], g['origem2'])):
        if 'igual nos dois lados' in orig:
            parts.append(f'{side} {line}: linha igual nos dois lados')
        elif 'várias linhas' in orig:
            parts.append(f'{side} {line}: comando de várias linhas ou chamada não registrada')
        elif 'herdou' in orig:
            parts.append(f'{side} {line}: herdou pela pilha (chamada na linha {orig.split("linha")[-1].strip(" )")})')
        elif orig:
            parts.append(f'{side} {line}: {orig.strip("() ")}')
    if not parts:
        parts.append('as duas linhas foram alteradas pelos lados')
    if 'transitivo' in (g['natureza'] or ''):
        parts.append('fluxo transitivo')
    if g['via_parametro']:
        parts.append('via parâmetro')
    return '; '.join(parts)


def read_csv(path, sep=';'):
    with open(path, encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=sep))


def num(v):
    """Número de verdade (o CSV usa ponto decimal); texto fica como está."""
    if v is None or v == '':
        return None
    if isinstance(v, (int, float)):
        return v
    try:
        return int(v)
    except ValueError:
        try:
            return float(v)
        except ValueError:
            return v


def n(v):
    try:
        return int(v or 0)
    except ValueError:
        return 0


def header(ws, row, titles, widths=None):
    for i, t in enumerate(titles, 1):
        c = ws.cell(row=row, column=i, value=t)
        c.font = Font(bold=True, color='FFFFFF')
        c.fill = HEAD
        c.alignment = Alignment(wrap_text=True, vertical='center')
        if widths:
            ws.column_dimensions[get_column_letter(i)].width = widths[i - 1]
    ws.row_dimensions[row].height = 32


def table(ws, titles, rows, widths=None, start=1, numeric=True):
    header(ws, start, titles, widths)
    for r, row in enumerate(rows, start + 1):
        for c, v in enumerate(row, 1):
            ws.cell(row=r, column=c, value=num(v) if numeric else v)
    ws.freeze_panes = ws.cell(row=start + 1, column=1)
    if rows:
        ws.auto_filter.ref = f'A{start}:{get_column_letter(len(titles))}{start + len(rows)}'
    return start + len(rows)


def title(ws, text, row=1, size=14):
    ws.cell(row=row, column=1, value=text).font = Font(bold=True, size=size)


def keep_manual(path):
    """Lê o que já foi preenchido nas abas de revisor: {revisor: {caso: {coluna: valor}}}."""
    kept = {}
    if not os.path.exists(path):
        return kept
    try:
        wb = load_workbook(path)
    except Exception:
        return kept
    if SAMPLE_SHEET in wb.sheetnames:
        ws = wb[SAMPLE_SHEET]
        heads = [c.value for c in ws[1]]
        if 'Caso' in heads:
            ci = heads.index('Caso')
            names = [h for h, _, _ in SAMPLE_FILL]
            for row in ws.iter_rows(min_row=2, values_only=True):
                if not row or not row[ci]:
                    continue
                vals = {h: row[heads.index(h)] for h in names if h in heads and row[heads.index(h)] not in (None, '')}
                if vals:
                    kept.setdefault('_sorteio', {})[row[ci]] = vals
    return kept


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lote', default=os.path.expanduser('~/Documentos/wild/execucoes/lote'))
    ap.add_argument('--newminerjs', default=os.path.join(os.path.dirname(REPO), 'Newminerjs'))
    ap.add_argument('--branch', default='master')
    ap.add_argument('--out', default=os.path.join(HERE, 'resultados.xlsx'))
    a = ap.parse_args()

    R = read_csv(os.path.join(a.lote, 'resultados.csv'))
    C = read_csv(os.path.join(a.lote, 'conflitos.csv'))
    P = read_csv(os.path.join(a.lote, 'resumo_projetos.csv'))
    T = read_csv(os.path.join(a.lote, 'tabela_mesma_funcao.csv'))
    casos = json.load(open(os.path.join(HERE, 'analise-manual', 'casos.json'), encoding='utf-8'))
    suites = json.load(open(os.path.join(HERE, 'dados', 'suites.json'), encoding='utf-8'))
    nm = json.load(open(os.path.join(a.newminerjs, 'dataset', 'resumo.json'), encoding='utf-8'))
    kept = keep_manual(a.out)
    gh = GITHUB.format(branch=a.branch)
    case_of = {c['sample_id']: c['id'] for c in casos}

    by_sample = defaultdict(list)
    for c in C:
        by_sample[c['sample_id']].append(c)
    conf = [r for r in R if n(r['OA']) + n(r['DF']) + n(r['CF']) > 0]
    both = [r for r in R if n(r['L_executadas']) and n(r['R_executadas'])]
    strong = [r for r in conf if any(c['natureza'] == 'direto' or c['tipo'] == 'OA' for c in by_sample[r['sample_id']]) and not GENERATED.search(r['arquivo'])]

    wb = Workbook()
    wb.remove(wb.active)

    # ---------------- Leia-me ----------------
    ws = wb.create_sheet('Leia-me')
    ws.column_dimensions['A'].width = 28
    ws.column_dimensions['B'].width = 110
    title(ws, 'Resultados: análise dinâmica de conflitos de merge (OA, DF, CF) com Jalangi2')
    lines = [
        ('Gerada por', 'experiments/results/gerar_planilha.py (não edite as abas de dados à mão: regenere). A aba "Conflitos sorteados" pode ser preenchida e é mantida ao regenerar.'),
        ('Suítes', f'commit {suites["commit"]}, coletadas em {suites["gerado_em"][:10]} (experiments/results/coletar_suites.js)'),
        ('', ''),
        ('Funil', 'Da coleta Newminerjs (merges até 2015) até as amostras com conflito.'),
        ('Resultado consolidado', 'Tipo de resultado da execução e conflitos por tipo.'),
        ('Projetos', 'Uma linha por projeto do lote, com o TOTAL.'),
        ('Amostras', 'Uma linha por amostra do lote (976): execução, erro, cobertura de L e R, OA/DF/CF.'),
        ('Conflitos', 'Um registro de conflito por linha (375), com a direção e o caso da análise manual.'),
        ('Mesma função', 'Cruzamento com a análise estática do Newminerjs ("Left e Right alteraram a mesma função?").'),
        ('Casos (29)', 'As 29 amostras com conflito, com grupo e link da pasta no GitHub.'),
        ('Conflitos sorteados', 'Um conflito sorteado de cada amostra (29), com as duas linhas, o código e de onde veio a branch, para avaliar conflito a conflito. Preencha só as colunas amarelas.'),
        ('Amanda (OA)', '72 casos de Overriding Assignment do SCAz.js (Moraes et al., SBLP 2024).'),
        ('DF-CF (13)', '13 testes de DF e CF do conflict-static-analysis (Santos et al., 2023), traduções do Italo.'),
        ('Traduções (Italo)', 'Os mesmos casos nas traduções A (JSweet), B (JSweet + IA) e C (só IA), mais 6 testes de confluência SVFA.'),
        ('Toys', '33 programas pequenos que exercitam cada regra da análise (sem gabarito).'),
        ('', ''),
        ('Como fazer a análise manual', '1. Abra a aba "Conflitos sorteados": uma linha por caso, com um conflito sorteado. 2. Abra a pasta do caso (coluna "Pasta no GitHub"): merge_anotado.js mostra [L], [R] e o papel de cada linha nos conflitos (◀ #n, o mesmo número da aba); diff_left/diff_right mostram o que cada lado mudou. 3. Se uma linha "herdou" a branch, julgue a linha indicada. Compare base + só L, base + só R e o merge: o merge tem um comportamento que nenhum dos dois produz sozinho, ou quebra o que um lado queria? 4. Preencha as colunas amarelas.'),
        ('Grupos', 'A: conflito direto e mesma função (candidatos mais fortes). B: conflito direto em funções diferentes (interferência indireta). C: só transitivo ou arquivo gerado (suspeitos de falso positivo).'),
        ('Leitura de DF/OA/CF', 'DF: a linha de um lado produz um valor que a linha do outro lado consome. OA: a escrita de um lado sobrescreve a do outro com valor diferente. CF: valores de L e de R se encontram num comando da base. Direto: o valor vai da escrita ao uso; transitivo: passa por outros valores; via parâmetro: entrou numa função por parâmetro.'),
    ]
    for i, (k, v) in enumerate(lines, 3):
        ws.cell(row=i, column=1, value=k).font = Font(bold=True)
        ws.cell(row=i, column=2, value=v).alignment = WRAP

    # ---------------- Funil ----------------
    ws = wb.create_sheet('Funil')
    title(ws, 'Funil: da coleta às amostras com conflito')
    executed_any = sum(1 for r in R if n(r['L_executadas']) + n(r['R_executadas']) > 0)
    collect = [
        ('Merges de dois pais nos 50 projetos', nm['all_two_parent_merges'], 'merges'),
        ('Merges até 31/12/2015', nm['merges_until_2015'], 'merges'),
        ('Pares arquivo × merge alterados pelos dois lados (MiningFramework)', nm['raw_file_merge_pairs'], 'pares'),
        ('Atendem aos critérios estruturais', nm['structurally_eligible'], 'pares'),
        ('Sem arquivos de teste (test/spec no caminho)', nm['structurally_eligible'] - nm['test_path_exclusions'], 'pares'),
        (f'Selecionados: até 50 por projeto ({nm["distinct_merges"]} merges, {nm["projects_with_samples"]} projetos)', nm['selected_samples'], 'amostras'),
    ]
    run = [
        ('Com linhas de L e de R no merge (o lote)', len(R)),
        ('Instrumentáveis (ES5)', sum(1 for r in R if r['execucao'] != 'nao_instrumentavel')),
        ('Executaram alguma linha alterada', executed_any),
        ('Executaram linhas de L', sum(1 for r in R if n(r['L_executadas']))),
        ('Executaram linhas de R', sum(1 for r in R if n(r['R_executadas']))),
        ('Executaram L e R', len(both)),
        ('Com conflito', len(conf)),
        ('Com conflito direto (ou OA), fora de arquivo gerado', len(strong)),
    ]
    ws.cell(row=3, column=1, value='Coleta (Newminerjs)').font = Font(bold=True, size=12)
    header(ws, 4, ['Etapa', 'Quantidade', 'Unidade', '% da etapa anterior'], [70, 14, 12, 18])
    prev = None
    for i, (k, v, u) in enumerate(collect, 5):
        ws.cell(row=i, column=1, value=k)
        ws.cell(row=i, column=2, value=v)
        ws.cell(row=i, column=3, value=u)
        if prev:
            c = ws.cell(row=i, column=4, value=v / prev)
            c.number_format = '0.0%'
        prev = v
    r0 = 5 + len(collect) + 1
    ws.cell(row=r0, column=1, value='Execução (lote)').font = Font(bold=True, size=12)
    header(ws, r0 + 1, ['Etapa', 'Amostras', '% da etapa anterior', '% das selecionadas'])
    prev = nm['selected_samples']
    for i, (k, v) in enumerate(run, r0 + 2):
        ws.cell(row=i, column=1, value=k)
        ws.cell(row=i, column=2, value=v)
        ws.cell(row=i, column=3, value=v / prev).number_format = '0.0%'
        ws.cell(row=i, column=4, value=v / nm['selected_samples']).number_format = '0.0%'
        if not k.startswith('Executaram linhas de'):
            prev = v
    note = r0 + 2 + len(run) + 1
    ws.cell(row=note, column=1, value=f'"Executaram linhas de L" e "de R" são subconjuntos de "Executaram alguma linha"; a % de "Executaram L e R" é sobre "Executaram alguma linha". {nm["selected_samples"] - len(R)} das {nm["selected_samples"]} selecionadas não têm, no merge, linhas vindas dos dois lados (a resolução ficou com um lado só, ou a mudança era só de espaços), então não há par para OA, DF ou CF.').alignment = WRAP
    ws.merge_cells(start_row=note, start_column=1, end_row=note, end_column=4)
    ws.row_dimensions[note].height = 60

    # ---------------- Resultado consolidado ----------------
    ws = wb.create_sheet('Resultado consolidado')
    title(ws, 'Resultado consolidado do lote')
    origin = Counter(r['origem_erro'] or ('sucesso' if r['execucao'] == 'ok' else '') for r in R)
    types = [('Sucesso', sum(1 for r in R if r['execucao'] == 'ok')), ('Falha de ambiente', origin['ambiente']),
             ('Limitação da ferramenta', origin['ferramenta']), ('Falha do projeto', origin['projeto'])]
    other = len(R) - sum(v for _, v in types)
    if other:
        types.append(('Timeout ou sem relatório, sem categoria', other))
    header(ws, 3, ['Tipo de resultado', 'Amostras', '%'], [44, 12, 10])
    for i, (k, v) in enumerate(types, 4):
        ws.cell(row=i, column=1, value=k)
        ws.cell(row=i, column=2, value=v)
        ws.cell(row=i, column=3, value=v / len(R)).number_format = '0.0%'
    i += 1
    ws.cell(row=i, column=1, value='Total').font = Font(bold=True)
    ws.cell(row=i, column=2, value=len(R)).font = Font(bold=True)

    i += 2
    header(ws, i, ['Categoria da falha', 'Amostras', 'Origem'])
    cats = Counter((r['categoria_erro'], r['origem_erro']) for r in R if r['categoria_erro'])
    for j, ((k, o), v) in enumerate(cats.most_common(), i + 1):
        ws.cell(row=j, column=1, value=k)
        ws.cell(row=j, column=2, value=v)
        ws.cell(row=j, column=3, value=o)
    i = j + 2
    header(ws, i, ['Tipo de conflito', 'Registros', 'Amostras', 'Projetos'])
    rows = []
    for t, label in [('DF', 'DF (Data Flow)'), ('CF', 'CF (Confluence Flow)'), ('OA', 'OA (Overriding Assignment)')]:
        s = [r for r in R if n(r[t])]
        rows.append((label, sum(n(r[t]) for r in R), len(s), len({r['projeto'] for r in s})))
    rows.append(('Total', len(C), len(conf), len({r['projeto'] for r in conf})))
    for j, row in enumerate(rows, i + 1):
        for k, v in enumerate(row, 1):
            ws.cell(row=j, column=k, value=v)
    ws.cell(row=j, column=1).font = Font(bold=True)
    i = j + 1
    ws.cell(row=i, column=1, value='As amostras por tipo somam mais que o total: há amostras com mais de um tipo.').font = Font(italic=True, color='666666')
    i += 2
    header(ws, i, ['Amostras com conflito, por como executaram', 'Amostras'])
    for j, (k, v) in enumerate(Counter('Suíte de testes' if r['modo'] == 'testes' else 'Só o arquivo' for r in conf).most_common(), i + 1):
        ws.cell(row=j, column=1, value=k)
        ws.cell(row=j, column=2, value=v)
    i = j + 2
    header(ws, i, ['Natureza dos registros', 'Registros'])
    for j, (k, v) in enumerate(Counter(c['natureza'] or '(OA)' for c in C).most_common(), i + 1):
        ws.cell(row=j, column=1, value=k)
        ws.cell(row=j, column=2, value=v)
    ws.cell(row=j + 1, column=1, value='via parâmetro')
    ws.cell(row=j + 1, column=2, value=sum(1 for c in C if c['via_parametro'] == 'sim'))

    # ---------------- Projetos / Amostras / Conflitos / Mesma função ----------------
    ws = wb.create_sheet('Projetos')
    cols = list(P[0].keys())
    table(ws, cols, [[p[c] for c in cols] for p in P], [26] + [11] * (len(cols) - 1))

    ws = wb.create_sheet('Amostras')
    cols = [c for c in R[0].keys() if c != 'saida'] + ['caso']
    widths = {'sample_id': 14, 'projeto': 24, 'merge_commit': 12, 'arquivo': 34, 'erro': 40, 'comando_testes': 30}
    table(ws, cols, [[r.get(c, '') if c != 'caso' else case_of.get(r['sample_id'], '') for c in cols] for r in R],
          [widths.get(c, 11) for c in cols])

    ws = wb.create_sheet('Conflitos')
    def direction(c):
        if c['tipo'] == 'DF':
            m = re.match(r'^(L|R)@.*:(\d+)->(L|R)@.*:(\d+)$', c['chave'])
            if m:
                return f'{m.group(1)}{m.group(2)} → {m.group(3)}{m.group(4)}'
        if c['tipo'] == 'OA':
            parts = c['chave'].split('|')
            over = parts[-2].split(':')[-1] if len(parts) >= 3 else ''
            return f'L{c["L_linha"]} sobrescreve R{c["R_linha"]}' if over == c['L_linha'] else f'R{c["R_linha"]} sobrescreve L{c["L_linha"]}'
        if c['tipo'] == 'CF':
            return f'L{c["L_linha"]} + R{c["R_linha"]} → base {c["linha_base"]}'
        return ''
    cols = ['caso', 'projeto', 'arquivo', 'tipo', 'natureza', 'via_parametro', 'direção', 'L_linha', 'R_linha', 'linha_base', 'alvo', 'chave', 'sample_id']
    table(ws, cols, [[case_of.get(c['sample_id'], ''), c['projeto'], c['arquivo'], c['tipo'], c['natureza'], c['via_parametro'], direction(c),
                      c['L_linha'], c['R_linha'], c['linha_base'], c['alvo'], c['chave'], c['sample_id']] for c in C],
          [7, 22, 30, 6, 11, 11, 24, 8, 8, 9, 30, 50, 14])

    ws = wb.create_sheet('Mesma função')
    title(ws, 'Left e Right alteraram a mesma função? (Newminerjs, estático) × conflito detectado (dinâmico)')
    cols = list(T[0].keys())
    end = table(ws, cols, [[t[c] for c in cols] for t in T], [18, 12, 18, 14, 18], start=3)
    ws.cell(row=end + 2, column=1, value='A taxa é sobre as amostras que executaram L e R. Conflitos entre funções diferentes ("Não") são a interferência interprocedural que a análise dinâmica vê e um filtro estático por "mesma função" perderia.').alignment = WRAP
    ws.merge_cells(start_row=end + 2, start_column=1, end_row=end + 2, end_column=5)
    ws.row_dimensions[end + 2].height = 45

    # ---------------- Casos (29) ----------------
    ws = wb.create_sheet('Casos (29)')
    cols = ['Caso', 'Grupo', 'Projeto', 'Arquivo', 'Pasta no GitHub', 'Merge', 'Executado por', 'OA', 'DF', 'CF', 'Registros',
            'Pares de linhas', 'Diretos', 'Transitivos', 'Via parâmetro', 'Mesma função? (Newminerjs)', 'Conflitos detectados (resumo)']
    header(ws, 1, cols, [7, 7, 22, 30, 18, 12, 12, 5, 5, 5, 9, 8, 8, 10, 10, 30, 60])
    for i, c in enumerate(casos, 2):
        vals = [c['id'], c['grupo'], c['projeto'], c['arquivo'], None, c['merge'][:10],
                'testes' if c['modo'] == 'testes' else 'arquivo', c['OA'], c['DF'], c['CF'], c['registros'], c['pares'], c['diretos'],
                c['transitivos'], c['via_parametro'], c['mesma_funcao_detalhe'], c['pares_resumo']]
        for k, v in enumerate(vals, 1):
            cell = ws.cell(row=i, column=k, value=v)
            cell.alignment = WRAP
        link = ws.cell(row=i, column=5, value=c['pasta'].split('/')[-1])
        link.hyperlink = gh + c['pasta']
        link.font = Font(color='0563C1', underline='single')
        ws.cell(row=i, column=6).hyperlink = c['url']
        ws.cell(row=i, column=2).fill = GROUP[c['grupo']]
    ws.freeze_panes = 'B2'
    ws.auto_filter.ref = f'A1:{get_column_letter(len(cols))}{len(casos) + 1}'

    # ---------------- Conflitos sorteados ----------------
    ws = wb.create_sheet(SAMPLE_SHEET)
    rng = random.Random(SAMPLE_SEED)
    ROLE = {'DF': ('produz', 'consome'), 'OA': ('sobrescreve', 'foi sobrescrita'), 'CF': ('valor de L', 'valor de R')}
    cols = ['Caso', 'Grupo', 'Projeto', 'Arquivo', 'Pasta no GitHub', 'Conflito (# no README)', 'Tipo', 'Natureza', 'Registros iguais',
            'Linha 1', 'Código da linha 1', 'De onde veio a branch (1)', 'Linha 2', 'Código da linha 2', 'De onde veio a branch (2)',
            'Base (CF)', 'Código da base', 'Estado', 'Pilha de chamadas', 'Como a ferramenta chegou ao conflito (automático)']
    fill_heads = [h for h, _, _ in SAMPLE_FILL]
    widths = [7, 7, 18, 26, 12, 10, 6, 11, 9, 16, 50, 34, 16, 50, 34, 10, 40, 24, 22, 40] + [w for _, w, _ in SAMPLE_FILL]
    header(ws, 1, cols + fill_heads, widths)
    for k in range(len(cols) + 1, len(cols) + len(fill_heads) + 1):
        ws.cell(row=1, column=k).fill = PatternFill('solid', fgColor='B7791F')
    for i, c in enumerate(casos, 2):
        records = [(g['n'], ch) for g in c['conflitos'] for ch in g['chaves']]
        n_pick, _ = rng.choice(sorted(records))
        g = next(x for x in c['conflitos'] if x['n'] == n_pick)
        r1, r2 = ROLE[g['tipo']]
        vals = [c['id'], c['grupo'], c['projeto'].split('__')[1], c['arquivo'], None, f"#{g['n']} de {len(c['conflitos'])}", g['tipo'], g['natureza'],
                g['registros'], f"{g['primeiro']} {g['linha1']} ({r1})", g['codigo1'], g['origem1'] or 'linha alterada por esse lado',
                f"{g['segundo']} {g['linha2']} ({r2})", g['codigo2'], g['origem2'] or 'linha alterada por esse lado',
                g['base'], g['codigo_base'], g['alvos'], g['pilha'], how_detected(g)]
        for k, v in enumerate(vals, 1):
            ws.cell(row=i, column=k, value=v).alignment = WRAP
        link = ws.cell(row=i, column=5, value='abrir pasta')
        link.hyperlink = gh + c['pasta']
        link.font = Font(color='0563C1', underline='single')
        ws.cell(row=i, column=2).fill = GROUP[c['grupo']]
        for k, h in enumerate(fill_heads, len(cols) + 1):
            cell = ws.cell(row=i, column=k, value=kept.get('_sorteio', {}).get(c['id'], {}).get(h))
            cell.fill = FILL_IN
            cell.alignment = WRAP
        ws.row_dimensions[i].height = 60
    last = len(casos) + 1
    for k, (h, _, options) in enumerate(SAMPLE_FILL, len(cols) + 1):
        if options:
            dv = DataValidation(type='list', formula1='"' + ','.join(options) + '"', allow_blank=True)
            ws.add_data_validation(dv)
            dv.add(f'{get_column_letter(k)}2:{get_column_letter(k)}{last}')
    ws.freeze_panes = 'B2'
    ws.auto_filter.ref = f'A1:{get_column_letter(len(cols) + len(fill_heads))}{last}'
    note = last + 2
    ws.cell(row=note, column=1, value=f'Um conflito sorteado por amostra (uniforme entre os registros da amostra, semente {SAMPLE_SEED}). O número # é o do README.md e do merge_anotado.js do caso. "De onde veio a branch": quando a linha não foi alterada por aquele lado, ela herdou a branch de uma chamada feita numa linha alterada (julgue a linha indicada) ou faz parte de um comando de várias linhas. A coluna "Como a ferramenta chegou ao conflito" é automática (sai dos dados). Pergunta para o revisor: este conflito é uma interferência real (o comportamento do merge depende das duas mudanças juntas)? Se não, por quê, olhando o código?').alignment = WRAP
    ws.merge_cells(start_row=note, start_column=1, end_row=note, end_column=12)
    ws.row_dimensions[note].height = 75

    # ---------------- Amanda (OA) ----------------
    ws = wb.create_sheet('Amanda (OA)')
    oa = suites['oa']
    cnt = Counter(r['estado'] for r in oa)
    title(ws, f'OA: 72 casos do SCAz.js (Amanda Moraes): {cnt["ok"]} corretos, {cnt["wrong"]} divergentes, {cnt["error"]} erros de execução, {cnt["noexpected"]} sem esperado')
    EST = {'ok': 'correto', 'wrong': 'divergente', 'error': 'erro de execução', 'noexpected': 'sem esperado'}
    table(ws, ['Caso', 'Esperado', 'Detectado', 'OA', 'DF', 'CF', 'Resultado', 'Observação'],
          [[r['caso'], r['esperado'], r['detectou'], r['OA'], r['DF'], r['CF'], EST.get(r['estado'], r['estado']), r['obs']] for r in oa],
          [44, 14, 14, 6, 6, 6, 18, 34], start=3)

    # ---------------- DF-CF (13) ----------------
    ws = wb.create_sheet('DF-CF (13)')
    d = suites['dfcf']
    cnt = Counter(r['estado'] for r in d)
    title(ws, f'DF e CF: 13 testes do conflict-static-analysis: {cnt["ok"]} corretos, {cnt["wrong"]} divergente(s)')
    EST2 = {'ok': 'correto', 'wrong': 'divergente', 'error': 'erro', 'skipped': 'não executado'}
    table(ws, ['Teste', 'Sample', 'Análise (Java)', 'Métrica', 'Esperado', 'Detectado', 'Resultado', 'Observação'],
          [[r['teste'], r['sample'], r['analise'], r['metrica'], r['esperado'], r['detectado'], EST2.get(r['estado'], r['estado']), r['obs']] for r in d],
          [52, 40, 18, 8, 9, 9, 12, 60], start=3)

    # ---------------- Traduções (Italo) ----------------
    ws = wb.create_sheet('Traduções (Italo)')
    tr = suites['traducoes']
    versions = [('atual', 'Atual (JSweet + Babel)'), ('A-jsweet', 'A: JSweet'), ('B-jsweet-ia', 'B: JSweet + IA'), ('C-ia', 'C: só IA')]
    title(ws, 'Os mesmos casos em cada tradução Java → JavaScript (estudo do tjtjdf)')
    cols = ['Conjunto', 'Teste', 'Análise', 'Métrica', 'Esperado'] + [f'{lab}: detectado' for _, lab in versions] + [f'{lab}: resultado' for _, lab in versions] + ['Observação']
    EST3 = {'ok': 'correto', 'diverge': 'divergente', 'erro': 'erro', 'n/a': '—', 'ausente': 'ausente'}
    rows = [[r['conjunto'].upper(), r['teste'], r['analise'], r['metrica'], r['esperado']] + [r[v]['detectado'] for v, _ in versions] +
            [EST3.get(r[v]['estado'], r[v]['estado']) for v, _ in versions] + [r['obs']] for r in tr]
    end = table(ws, cols, rows, [9, 52, 16, 8, 9] + [12] * 8 + [50], start=3)
    s = end + 2
    ws.cell(row=s, column=1, value='Resumo (presença correta)').font = Font(bold=True, size=12)
    header(ws, s + 1, ['Conjunto', 'Casos'] + [lab for _, lab in versions])
    for j, cj in enumerate(['df', 'cf'], s + 2):
        rs = [r for r in tr if r['conjunto'] == cj]
        ws.cell(row=j, column=1, value='DF/CF da suíte' if cj == 'df' else 'Confluência SVFA')
        ws.cell(row=j, column=2, value=len(rs))
        for k, (v, _) in enumerate(versions, 3):
            st = [r[v]['estado'] for r in rs if r[v]['estado'] != 'n/a']
            ws.cell(row=j, column=k, value=f'{st.count("ok")}/{len(st)}' if st else '—')
    ws.cell(row=s + 5, column=1, value='As quatro traduções dão o mesmo resultado, com a mesma contagem, em todos os casos. A tradução C revelou um bug da análise (propriedade de valor primitivo), já corrigido.').alignment = WRAP
    ws.merge_cells(start_row=s + 5, start_column=1, end_row=s + 5, end_column=8)

    # ---------------- Toys ----------------
    ws = wb.create_sheet('Toys')
    toys = suites['toys']
    title(ws, f'Toys: {sum(1 for t in toys if t["estado"] == "ok")}/{len(toys)} programas analisados (sem gabarito: cada um exercita uma regra)')
    table(ws, ['#', 'Toy', 'Arquivo', 'Linhas L', 'Linhas R', 'OA', 'DF', 'CF', 'L executadas', 'R executadas', 'Descrição'],
          [[t['n'], t['nome'], t['arquivo'], t['L'], t['R'], t['OA'], t['DF'], t['CF'], t['L_exec'], t['R_exec'], t['descricao']] for t in toys],
          [5, 38, 36, 10, 10, 5, 5, 5, 11, 11, 70], start=3, numeric=False)
    for row in ws.iter_rows(min_row=4, min_col=6, max_col=8):
        for c in row:
            c.value = num(c.value)

    wb.save(a.out)
    filled = sum(len(v) for v in kept.values())
    print(f'→ {os.path.relpath(a.out)} ({len(wb.sheetnames)} abas; respostas da análise manual mantidas: {filled})')


if __name__ == '__main__':
    main()
