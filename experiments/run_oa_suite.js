// ==============================================================================
// REGRESSÃO DE OA: CASOS DE TESTE DO SCAz.js (Moraes et al., SBLP 2024)
// ==============================================================================
// Roda a análise sobre os casos de OA (testes de Barbosa et al. traduzidos com JSweet)
// e compara com o "conflito esperado" definido nos testes Jest do SCAz.js.
// Uso: node experiments/run_oa_suite.js [caminho do SCAz.js] [filtro]
const fs = require('fs');
const path = require('path');
const { runAnalysis, rootDir } = require('./lib/analysis');

const defaultScazDir = path.resolve(rootDir, '..', 'SCAz.js');

// Executa os casos e devolve um registro por caso:
// { suite, name, status: 'ok' | 'wrong' | 'error' | 'noexpected', expected, found, detail }
function collect({ scazDir = defaultScazDir, filter } = {}) {
    const casesDir = path.join(scazDir, 'src/analyses/overriding_assignment/test_cases');
    const testFile = path.join(scazDir, 'tests/analyses/overriding_assignment/index.test.js');
    if (!fs.existsSync(casesDir) || !fs.existsSync(testFile)) {
        throw new Error(`SCAz.js não encontrado em ${scazDir}`);
    }

    // Esperado: linhas ativas (não comentadas) do tipo { testCase: 'x', conflict: true }
    const expected = {};
    for (const line of fs.readFileSync(testFile, 'utf-8').split('\n')) {
        const m = line.match(/^\s*\{ testCase: '(\w+)', conflict: (true|false) \}/);
        if (m) expected[m[1]] = { conflict: m[2] === 'true', divergent: /divergent/.test(line) };
    }

    const records = [];
    for (const name of fs.readdirSync(casesDir).sort()) {
        if (filter && !name.toLowerCase().includes(filter.toLowerCase())) continue;
        const dir = path.join(casesDir, name);
        const r = runAnalysis({ file: path.join(dir, 'index.js'), branchMapFile: path.join(dir, 'line_to_branch_map.json') });
        const exp = expected[name];
        const record = { suite: 'OA', name, expected: exp ? exp.conflict : undefined, found: r.oa > 0, detail: `OA=${r.oa} DF=${r.df} CF=${r.cf}` };
        if (exp && exp.divergent) record.detail += ' (marcado "divergent" no SCAz.js)';
        record.status = r.failed ? 'error' : !exp ? 'noexpected' : (r.oa > 0) === exp.conflict ? 'ok' : 'wrong';
        records.push(record);
    }
    return records;
}

function report(records) {
    console.log('================================================================================');
    console.log('🔬 REGRESSÃO DE OA — CASOS DO SCAz.js');
    console.log('================================================================================');
    const icon = { ok: '✔', wrong: '✖', error: '✖ ERRO', noexpected: '• sem esperado' };
    for (const r of records) {
        const exp = r.expected === undefined ? '' : ` esperado=${r.expected ? 'conflito' : 'sem conflito'}`;
        console.log(`${icon[r.status]} ${r.name}  ${r.detail}${exp}`);
    }
    const summary = summarize(records);
    console.log('--------------------------------------------------------------------------------');
    console.log(`Total: ${records.length} = corretos ${summary.ok} + divergentes ${summary.wrong} + erros de execução ${summary.error} + sem esperado ${summary.noexpected}`);
    console.log(`Divergentes: falsos negativos ${summary.falseNegatives}, falsos positivos ${summary.falsePositives}. Casos com esperado definido: ${records.filter(r => r.expected !== undefined).length}`);
    console.log('================================================================================');
}

function summarize(records) {
    const count = s => records.filter(r => r.status === s).length;
    const wrong = records.filter(r => r.status === 'wrong');
    return {
        ok: count('ok'), wrong: wrong.length, error: count('error'), noexpected: count('noexpected'),
        falseNegatives: wrong.filter(r => r.expected).length, falsePositives: wrong.filter(r => !r.expected).length
    };
}

module.exports = { collect, report, summarize, defaultScazDir };

if (require.main === module) {
    let records;
    try {
        records = collect({ scazDir: path.resolve(process.argv[2] || defaultScazDir), filter: process.argv[3] });
    } catch (e) {
        console.error(e.message);
        process.exit(2);
    }
    report(records);
    process.exit(summarize(records).wrong > 0 ? 1 : 0);
}
