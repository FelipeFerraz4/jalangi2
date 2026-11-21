// Roda as suítes de validação e grava os resultados em experiments/results/dados/suites.json, para a planilha:
//   oa           72 casos de OA do SCAz.js (Amanda)
//   dfcf         13 testes de DF/CF do conflict-static-analysis (traduções do Italo; Containment pela da Amanda)
//   traducoes    18 casos × 4 traduções (atual, A JSweet, B JSweet + IA, C IA), estudo do tjtjdf
//   toys         33 programas pequenos, sem gabarito
// Uso: node experiments/results/coletar_suites.js       (alguns minutos)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runAnalysis } = require('../lib/analysis');

const out = { gerado_em: new Date().toISOString(), commit: execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim() };

console.log('OA (SCAz.js)...');
out.oa = require('../run_oa_suite').collect().map(r => {
    const m = (r.detail || '').match(/OA=(\d+) DF=(\d+) CF=(\d+)/) || [];
    return { caso: r.name, esperado: r.expected === undefined ? '' : (r.expected ? 'conflito' : 'sem conflito'), detectou: r.found ? 'conflito' : 'sem conflito',
        OA: +m[1] || 0, DF: +m[2] || 0, CF: +m[3] || 0, estado: r.status, obs: /divergent/.test(r.detail || '') ? 'marcado "divergent" no SCAz.js' : '' };
});

console.log('DF/CF (conflict-static-analysis)...');
out.dfcf = require('../run_df_cf_suite').collect().map(r => ({ teste: r.name, sample: r.sample, analise: r.analysis, metrica: r.metric || '',
    esperado: r.expected, detectado: r.found === undefined ? '' : r.found, estado: r.status, obs: r.status === 'wrong' || (r.status === 'ok' && r.found !== r.expected) ? (r.note || '') : (r.detail || '') }));

console.log('Traduções A/B/C...');
const ts = require('../run_translation_study');
out.traducoes = ts.cases.map(c => {
    const row = { conjunto: c.set, teste: c.test, analise: c.analysis, metrica: ts.METRICS[c.analysis].name, sample: c.sample, esperado: c.expected, obs: c.note || '' };
    for (const v of ts.VERSIONS) {
        const r = ts.runCase(c, v);
        row[v] = { estado: r.status, detectado: r.found === undefined ? '' : r.found, L: (r.L || []).join(' '), R: (r.R || []).join(' ') };
    }
    return row;
});

console.log('Toys...');
out.toys = require('../run_all_toys').tests.map((t, i) => {
    const r = runAnalysis({ file: t.file, branchMap: t.branchMap });
    const tot = r.report && r.report.coverage.summary.total;
    return { n: i + 1, nome: t.name.replace(/^\d+\.\s*/, '').replace(/\s*\([^)]*\.js\)$/, ''), arquivo: path.basename(t.file), descricao: t.description,
        L: (t.branchMap.L || []).join(' '), R: (t.branchMap.R || []).join(' '), OA: r.oa, DF: r.dfTotal, CF: r.cfTotal,
        L_exec: tot ? `${tot.L.executed}/${tot.L.mapped - tot.L.withoutCode}` : '', R_exec: tot ? `${tot.R.executed}/${tot.R.mapped - tot.R.withoutCode}` : '', estado: r.failed ? 'erro' : 'ok' };
});

fs.mkdirSync(path.join(__dirname, 'dados'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dados', 'suites.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`→ experiments/results/dados/suites.json (OA ${out.oa.length}, DF/CF ${out.dfcf.length}, traduções ${out.traducoes.length}, toys ${out.toys.length})`);
