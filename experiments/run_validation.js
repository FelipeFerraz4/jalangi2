// ==============================================================================
// VALIDAÇÃO COMPLETA: OA, DATA FLOW E CONFLUENCE FLOW EM UMA ÚNICA EXECUÇÃO
// ==============================================================================
// Roda, com a mesma análise, os três conjuntos de casos:
//   - OA: os 72 casos do SCAz.js (Moraes et al.), que são os testes de Barbosa et al. traduzidos;
//   - DF e CF: os 13 testes do conflict-static-analysis (Santos et al.), pelas samples traduzidas;
//   - toys: os programas sintéticos desta pasta (só confirma que executam; sem gabarito).
// Uso: node experiments/run_validation.js [caminho do SCAz.js]
const path = require('path');
const oa = require('./run_oa_suite');
const df = require('./run_df_suite');
const { runAnalysis } = require('./lib/analysis');

const scazDir = path.resolve(process.argv[2] || oa.defaultScazDir);

// A soma das colunas fecha com o total de casos
function fmt(label, s, total, extra) {
    const parts = [`corretos ${s.ok}`, `divergentes ${s.wrong}`, `erros ${s.error}`];
    if (s.noexpected) parts.push(`sem esperado ${s.noexpected}`);
    if (s.skipped) parts.push(`não executados ${s.skipped}`);
    return `${label.padEnd(26)} ${total} = ${parts.join(' + ')}${extra ? ' | ' + extra : ''}`;
}

console.log('================================================================================');
console.log('🔬 VALIDAÇÃO COMPLETA DA ANÁLISE (OA + DATA FLOW + CONFLUENCE FLOW)');
console.log('================================================================================\n');

// 1) OA
let oaRecords = [];
let oaNote = '';
try {
    oaRecords = oa.collect({ scazDir });
} catch (e) {
    oaNote = e.message;
}

// 2) DF e CF
const dfRecords = df.collect({ scazDir });

// Divergências e erros, para o leitor ver o que fugiu do esperado
const problems = oaRecords.concat(dfRecords).filter(r => r.status !== 'ok');
if (problems.length > 0) {
    console.log('Fora do esperado:');
    for (const r of problems) {
        const kind = { wrong: 'divergente', error: 'erro de execução', skipped: 'não executado', noexpected: 'sem esperado definido no SCAz.js' }[r.status];
        console.log(`  [${r.suite}] ${r.name}: ${kind}${r.note && r.status === 'wrong' ? ' — ' + r.note : ''}`);
    }
    console.log('');
}

console.log('--------------------------------------------------------------------------------');
console.log('RESUMO');
console.log('--------------------------------------------------------------------------------');
if (oaNote) {
    console.log(`OA (SCAz.js)               não executado — ${oaNote}`);
} else {
    const s = oa.summarize(oaRecords);
    console.log(fmt('OA (SCAz.js)', s, oaRecords.length));
}
const d = df.summarize(dfRecords);
console.log(fmt('DF + CF (conflict-static)', d, dfRecords.length, d.countDiffers ? `contagem difere em ${d.countDiffers}` : ''));

// 3) toys
const toysTotal = require('fs').readdirSync(path.join(__dirname, 'toys')).filter(f => /^(test_|example).*\.js$/.test(f) && !/_jalangi_/.test(f)).length;
console.log(`Toys                       ${toysTotal} programas (rode "node experiments/run_all_toys.js")`);
console.log('================================================================================');

process.exit(oaRecords.some(r => r.status === 'wrong') || d.error > 0 ? 1 : 0);
