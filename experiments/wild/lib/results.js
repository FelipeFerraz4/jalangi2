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

const COLUMNS = ['sample_id', 'projeto', 'merge_commit', 'arquivo', 'linhas_L', 'linhas_R', 'instalacao', 'instalacao_s', 'execucao', 'codigo_saida',
    'execucao_s', 'erro', 'OA', 'DF', 'CF', 'DF_via_parametro', 'L_executadas', 'L_total', 'L_cobertura_pct', 'R_executadas', 'R_total', 'R_cobertura_pct', 'saida'];

// meta: { sample, install: {status, seconds}, run: {status, exitCode, seconds, error}, report, outputDir }
function resultRow(meta) {
    const s = meta.sample, r = meta.report, cov = coverageNumbers(r);
    const counts = r && r.counts;
    return [s.sample_id, s.project, s.merge_commit, s.file_path, s.left_lines, s.right_lines,
        meta.install ? meta.install.status : '', meta.install ? meta.install.seconds : '',
        meta.run.status, meta.run.exitCode === undefined ? '' : meta.run.exitCode, meta.run.seconds === undefined ? '' : meta.run.seconds, meta.run.error || '',
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

module.exports = { classifyRun, firstError, coverageNumbers, COLUMNS, resultRow, CONFLICT_COLUMNS, conflictRows };
