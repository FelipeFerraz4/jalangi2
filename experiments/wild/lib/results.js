// Classificação e tabulação do resultado de uma execução (Fase 2). Funções puras, testadas em test-wild.js.

// Estado da execução, a partir do código de saída, do texto produzido e da existência do relatório.
// Códigos: 124 = estourou o tempo (o lançador sai por SIGTERM), 3 = falha ao instrumentar o alvo,
// 137 = morto (memória ou docker kill).
function classifyRun({ exitCode, output, hasReport }) {
    if (exitCode === 124) return 'timeout';
    if (exitCode === 3 || /ERRO_INSTRUMENTACAO/.test(output)) return 'erro_instrumentacao';
    if (exitCode === 137) return 'morto_memoria_ou_tempo';
    if (!hasReport) return 'sem_relatorio';
    return exitCode === 0 ? 'ok' : 'erro_execucao';
}

// Modo testes: a linha "TESTES {json}" que run-tests.js imprime no fim (a última, se houver mais de uma)
function parseTestLine(output) {
    const lines = String(output).split('\n').filter(l => l.startsWith('TESTES {'));
    if (!lines.length) return null;
    try { return JSON.parse(lines[lines.length - 1].slice(7)); } catch (e) { return null; }
}

// Modo testes: testes falhando não são falha nossa. Vale se algum processo carregou o alvo e gravou relatório.
//   ok: a suíte terminou e há relatório (o código dos testes fica em testes_codigo_saida);
//   timeout: estourou o tempo (pode haver relatório parcial); alvo_nao_carregado: a suíte rodou e nenhum processo
//   carregou o arquivo alvo (os testes não o usam, ou caíram antes por falta de dependência).
function classifyTestRun({ exitCode, output, hasReport, info }) {
    if (exitCode === 124 || (info && info.timeout)) return 'timeout';
    if (exitCode === 3 || (!hasReport && /ERRO_INSTRUMENTACAO/.test(output))) return 'erro_instrumentacao';
    if (exitCode === 137 && !info) return 'morto_memoria_ou_tempo';
    if (!info) return 'sem_relatorio';
    return hasReport ? 'ok' : 'alvo_nao_carregado';
}

// Primeira linha que parece erro, para o analista ver por que a execução parou
function firstError(output) {
    const line = String(output).split('\n').find(l => /ERRO_INSTRUMENTACAO|\b\w*Error\b|Cannot find module|EROFS|ENOENT/.test(l));
    return line ? line.trim().slice(0, 200) : '';
}

function coverageNumbers(report) {
    const total = report && report.coverage && report.coverage.summary && report.coverage.summary.total;
    const part = b => {
        const t = total && total[b];
        if (!t) return { executed: '', total: '', rate: '' };
        const denominator = t.mapped - t.withoutCode;
        return { executed: t.executed, total: denominator, rate: denominator > 0 ? Math.round(t.executed / denominator * 1000) / 10 : '' };
    };
    return { L: part('L'), R: part('R') };
}

// Por que a amostra não rodou até o fim, para separar limitação do ambiente de erro do projeto e de falha da ferramenta.
// Devolve { categoria, origem } (vazios quando a execução foi ok). origem: ambiente | projeto | ferramenta.
//   ambiente:   dependencia_ausente, modulo_nativo, api_navegador, global_ausente, somente_leitura, node_incompativel,
//               tempo_esgotado, memoria_ou_tempo, sem_mapa, sem_checkout
//   projeto:    codigo_invalido (sintaxe ou package.json inválidos no commit), erro_do_programa (exceção lançada no código do projeto),
//               sem_testes (modo testes: sem scripts.test utilizável), testes_nao_carregam_alvo (a suíte rodou sem carregar o arquivo)
//   ferramenta: instrumentacao (o Jalangi2 não aceita a sintaxe), possivel_jalangi (a exceção nasce no código do Jalangi2/análise, fora dos repasses de operações do programa),
//               sem_relatorio (terminou sem gravar relatório e sem erro reconhecível)
const BROWSER_GLOBALS = /\b(window|self|document|navigator|location|localStorage|sessionStorage|XMLHttpRequest|Audio|AudioContext|HTMLElement|Element|Image|requestAnimationFrame)\b is not defined/;
const ORIGIN = {
    dependencia_ausente: 'ambiente', modulo_nativo: 'ambiente', api_navegador: 'ambiente', global_ausente: 'ambiente', somente_leitura: 'ambiente',
    node_incompativel: 'ambiente', tempo_esgotado: 'ambiente', memoria_ou_tempo: 'ambiente', sem_mapa: 'ambiente', sem_checkout: 'ambiente',
    codigo_invalido: 'projeto', erro_do_programa: 'projeto', sem_testes: 'projeto', testes_nao_carregam_alvo: 'projeto',
    instrumentacao: 'ferramenta', possivel_jalangi: 'ferramenta', sem_relatorio: 'ferramenta'
};

function errorCategory(status, output) {
    const pick = categoria => ({ categoria, origem: ORIGIN[categoria] });
    if (status === 'ok') return { categoria: '', origem: '' };
    if (status === 'nao_instrumentavel' || status === 'erro_instrumentacao') return pick('instrumentacao');
    if (status === 'timeout') return pick('tempo_esgotado');
    if (status === 'morto_memoria_ou_tempo') return pick('memoria_ou_tempo');
    if (status === 'sem_mapa' || status === 'sem_checkout' || status === 'sem_testes') return pick(status);
    const text = String(output || '');
    // Modo testes, alvo não carregado: a saída é a da suíte inteira. Só uma falha de ambiente reconhecível explica;
    // fora isso, os testes simplesmente não passam pelo arquivo (erros de teste não contam como erro do programa).
    if (status === 'alvo_nao_carregado') {
        const env = errorCategory('erro_execucao', text.split('\n').filter(l => !/^\s+at /.test(l)).join('\n'));
        return env.origem === 'ambiente' ? env : pick('testes_nao_carregam_alvo');
    }
    if (/build\/Release\/|\.node\b.*(Exec format error|invalid ELF)|Could not locate the bindings file|was compiled against a different Node\.js version/.test(text)) return pick('modulo_nativo');
    if (/Cannot find module/.test(text)) return pick('dependencia_ausente');
    if (/primordials is not defined/.test(text)) return pick('node_incompativel');
    if (BROWSER_GLOBALS.test(text)) return pick('api_navegador');
    if (/ReferenceError: [\w$]+ is not defined/.test(text)) return pick('global_ausente');
    if (/EROFS|EACCES/.test(text)) return pick('somente_leitura');
    if (/SyntaxError|Error parsing .*package\.json/.test(text)) return pick('codigo_invalido');
    // Exceção em tempo de execução: quem está no topo da pilha decide. Código do projeto fica em /work, o do Jalangi2 em /app.
    // Os quadros de src/js/runtime/analysis.js (G, P, M, F, callFun, invokeFun...) são o Jalangi2 executando uma operação
    // DO PROGRAMA (ler propriedade, chamar função) e são pulados: "Cannot read properties of undefined" em G é o programa
    // lendo campo de undefined, e "Function.prototype.apply was called on undefined" em callFun é o "x is not a function".
    const lines = text.split('\n');
    const errAt = lines.findIndex(l => /^\w*Error\b|^\s*\w*Error: /.test(l));
    if (errAt !== -1) {
        const frame = lines.slice(errAt + 1).find(l => /^\s+at /.test(l) && !/\/app\/src\/js\/runtime\/analysis\.js:/.test(l)) || '';
        if (/\/app\/(src|experiments)\//.test(frame)) return pick('possivel_jalangi');
        return pick('erro_do_programa');
    }
    return pick('sem_relatorio');
}

const COLUMNS = ['sample_id', 'projeto', 'merge_commit', 'arquivo', 'linhas_L', 'linhas_R', 'instalacao', 'instalacao_s', 'execucao', 'codigo_saida',
    'execucao_s', 'erro', 'categoria_erro', 'origem_erro', 'modo', 'comando_testes', 'testes_codigo_saida', 'processos_com_alvo', 'OA', 'DF', 'CF', 'DF_via_parametro', 'L_executadas', 'L_total', 'L_cobertura_pct', 'R_executadas', 'R_total', 'R_cobertura_pct', 'saida'];

// meta: { sample, install: {status, seconds}, run: {status, exitCode, seconds, error}, report, outputDir, category: {categoria, origem} }
function resultRow(meta) {
    const cat = meta.category || { categoria: '', origem: '' };
    const s = meta.sample, r = meta.report, cov = coverageNumbers(r);
    const counts = r && r.counts;
    return [s.sample_id, s.project, s.merge_commit, s.file_path, s.left_lines, s.right_lines,
        meta.install ? meta.install.status : '', meta.install ? meta.install.seconds : '',
        meta.run.status, meta.run.exitCode === undefined ? '' : meta.run.exitCode, meta.run.seconds === undefined ? '' : meta.run.seconds, meta.run.error || '',
        cat.categoria, cat.origem,
        meta.run.mode || 'arquivo', meta.run.testCommand || '', meta.run.testExit === undefined ? '' : meta.run.testExit,
        meta.run.processes === undefined ? '' : meta.run.processes,
        counts ? counts.oa : '', counts ? counts.df.total : '', counts ? counts.cf.total : '', counts ? counts.df.viaParam : '',
        cov.L.executed, cov.L.total, cov.L.rate, cov.R.executed, cov.R.total, cov.R.rate, meta.outputDir || ''];
}

const CONFLICT_COLUMNS = ['sample_id', 'projeto', 'arquivo', 'tipo', 'natureza', 'via_parametro', 'L_linha', 'R_linha', 'linha_base', 'alvo', 'chave'];

// Uma linha por conflito do relatório, para inspeção manual
function conflictRows(sample, report) {
    if (!report || !report.conflicts) return [];
    const base = [sample.sample_id, sample.project, sample.file_path];
    const rows = [];
    for (const c of report.conflicts.oa) {
        const l = c.previous.branch === 'L' ? c.previous : c, r = c.previous.branch === 'L' ? c : c.previous;
        rows.push([...base, 'OA', '', '', l.position.line, r.position.line, '', c.target, c.key]);
    }
    for (const c of report.conflicts.df) {
        const l = c.from.branch === 'L' ? c.from : c.to, r = c.from.branch === 'L' ? c.to : c.from;
        rows.push([...base, 'DF', c.kind === 'direct' ? 'direto' : 'transitivo', c.viaParam ? 'sim' : '', l.position.line, r.position.line, '', (c.targets || []).join(' '), c.key]);
    }
    for (const c of report.conflicts.cf) {
        rows.push([...base, 'CF', c.kind === 'direct' ? 'direto' : 'transitivo', '', c.left.line, c.right.line, c.base.line, '', c.key]);
    }
    return rows;
}

const SUMMARY_COLUMNS = ['projeto', 'amostras', 'nao_instrumentavel', 'ok', 'erro_execucao', 'timeout', 'outras_falhas', 'instalacao_falhou',
    'falha_ambiente', 'falha_projeto', 'falha_ferramenta', 'categoria_mais_comum',
    'amostras_com_conflito', 'OA', 'DF', 'CF', 'amostras_com_R_executado', 'cobertura_mediana_L_pct', 'cobertura_mediana_R_pct'];

function median(values) {
    if (!values.length) return '';
    const v = values.slice().sort((a, b) => a - b), m = v.length >> 1;
    return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2 * 10) / 10;
}

// Categoria mais frequente, com a contagem: "api_navegador (15)"
function mostCommon(values) {
    const counts = new Map();
    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    return best ? `${best[0]} (${best[1]})` : '';
}

// rows: linhas de resultRow (na ordem de COLUMNS). Uma linha por projeto e um TOTAL no fim.
function summaryRows(rows) {
    const idx = {};
    COLUMNS.forEach((c, i) => { idx[c] = i; });
    const groups = new Map();
    for (const r of rows) {
        const key = r[idx.projeto];
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
    }
    const summarize = (name, list) => {
        const status = r => r[idx.execucao];
        const num = (r, c) => Number(r[idx[c]] || 0);
        const withConflict = list.filter(r => num(r, 'OA') + num(r, 'DF') + num(r, 'CF') > 0).length;
        const cov = c => list.map(r => r[idx[c]]).filter(v => v !== '').map(Number);
        return [name, list.length,
            list.filter(r => status(r) === 'nao_instrumentavel').length,
            list.filter(r => status(r) === 'ok').length,
            list.filter(r => status(r) === 'erro_execucao').length,
            list.filter(r => status(r) === 'timeout').length,
            list.filter(r => !['nao_instrumentavel', 'ok', 'erro_execucao', 'timeout'].includes(status(r))).length,
            list.filter(r => r[idx.instalacao] === 'falhou' || r[idx.instalacao] === 'timeout').length,
            ...['ambiente', 'projeto', 'ferramenta'].map(o => list.filter(r => r[idx.origem_erro] === o).length),
            mostCommon(list.map(r => r[idx.categoria_erro]).filter(Boolean)),
            withConflict,
            list.reduce((n, r) => n + num(r, 'OA'), 0), list.reduce((n, r) => n + num(r, 'DF'), 0), list.reduce((n, r) => n + num(r, 'CF'), 0),
            list.filter(r => num(r, 'R_executadas') > 0).length,
            median(cov('L_cobertura_pct')), median(cov('R_cobertura_pct'))];
    };
    const out = [...groups.entries()].sort().map(([name, list]) => summarize(name, list));
    out.push(summarize('TOTAL', rows));
    return out;
}

module.exports = { SUMMARY_COLUMNS, summaryRows, errorCategory, classifyRun, classifyTestRun, parseTestLine, firstError, coverageNumbers, COLUMNS, resultRow, CONFLICT_COLUMNS, conflictRows };
