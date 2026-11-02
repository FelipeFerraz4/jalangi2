// ==============================================================================
// REGRESSÃO DE OA: CASOS DE TESTE DO SCAz.js (Moraes et al., SBLP 2024)
// ==============================================================================
// Roda a análise sobre os casos de OA (testes de Barbosa et al. traduzidos com JSweet)
// e compara com o "conflito esperado" definido nos testes Jest do SCAz.js.
// Uso: node experiments/run_oa_suite.js [caminho do SCAz.js] [filtro]
// A variável ANALYSIS troca a análise executada (padrão: experiments/analyses/analysis_dataflow.js).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const scazDir = path.resolve(process.argv[2] || path.join(rootDir, '..', 'SCAz.js'));
const filter = process.argv[3];
const casesDir = path.join(scazDir, 'src/analyses/overriding_assignment/test_cases');
const testFile = path.join(scazDir, 'tests/analyses/overriding_assignment/index.test.js');

if (!fs.existsSync(casesDir) || !fs.existsSync(testFile)) {
    console.error(`SCAz.js não encontrado em ${scazDir}`);
    process.exit(2);
}

// Esperado: linhas ativas (não comentadas) do tipo { testCase: 'x', conflict: true }
const expected = {};
for (const line of fs.readFileSync(testFile, 'utf-8').split('\n')) {
    const m = line.match(/^\s*\{ testCase: '(\w+)', conflict: (true|false) \}/);
    if (m) expected[m[1]] = { conflict: m[2] === 'true', divergent: /divergent/.test(line) };
}

const results = [];
for (const name of fs.readdirSync(casesDir).sort()) {
    if (filter && !name.toLowerCase().includes(filter.toLowerCase())) continue;
    const dir = path.join(casesDir, name);
    const args = [
        'src/js/commands/jalangi.js', '--inlineIID', '--inlineSource',
        '--analysis', 'src/js/sample_analyses/ChainedAnalyses.js',
        '--analysis', 'src/js/runtime/SMemory.js',
        '--analysis', process.env.ANALYSIS || 'experiments/analyses/analysis_dataflow.js',
        path.join(dir, 'index.js')
    ];
    const env = Object.assign({}, process.env, { BRANCH_MAP_FILE: path.join(dir, 'line_to_branch_map.json') });
    let output = '', failed = false;
    try {
        output = execFileSync('node', args, { cwd: rootDir, encoding: 'utf-8', env, timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
        failed = true;
        output = (e.stdout || '') + (e.stderr || '');
    }
    const oa = output.match(/Conflitos de Overriding Assignment \(OA\):\s*(\d+)/);
    const df = output.match(/Conflitos de Data Flow Inter-Branch:\s*(\d+)/);
    results.push({ name, failed: failed || !oa, oa: oa ? +oa[1] : 0, df: df ? +df[1] : 0, exp: expected[name] });
}

const withExp = results.filter(r => r.exp && !r.failed);
const wrong = withExp.filter(r => (r.oa > 0) !== r.exp.conflict);
const falseNeg = wrong.filter(r => r.exp.conflict);
const falsePos = wrong.filter(r => !r.exp.conflict);

console.log('================================================================================');
console.log('🔬 REGRESSÃO DE OA — CASOS DO SCAz.js');
console.log('================================================================================');
for (const r of results) {
    const status = r.failed ? '✖ ERRO' : !r.exp ? '• sem esperado' : ((r.oa > 0) === r.exp.conflict ? '✔' : '✖');
    const note = r.exp && r.exp.divergent ? ' (marcado "divergent" no SCAz.js)' : '';
    console.log(`${status} ${r.name}  OA=${r.oa} DF=${r.df}${r.exp ? ` esperado=${r.exp.conflict ? 'conflito' : 'sem conflito'}` : ''}${note}`);
}
console.log('--------------------------------------------------------------------------------');
console.log(`Total: ${results.length} | com esperado: ${results.filter(r => r.exp).length} | corretos: ${withExp.length - wrong.length}`);
console.log(`Falsos negativos: ${falseNeg.length} | Falsos positivos: ${falsePos.length} | Erros de execução: ${results.filter(r => r.failed).length}`);
console.log('================================================================================');
process.exit(wrong.length > 0 ? 1 : 0);
