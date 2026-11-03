// ==============================================================================
// VALIDAÇÃO DE DATA FLOW: TESTES DO conflict-static-analysis (Santos et al., 2023)
// ==============================================================================
// Os 13 testes de DF do repositório spgroup/conflict-static-analysis (pacote br.unb.cic.analysis.df)
// usam Soot/JUnit e não podem ser traduzidos para JavaScript. O que roda aqui são as classes `sample`
// que eles analisam, traduzidas com JSweet (experiments/df_samples/). Cada teste fornece:
//   - as linhas de source (tratadas como Left) e de sink (tratadas como Right), em linhas do Java;
//   - o resultado esperado, em asserções que estão comentadas no Java (exceto no Containment).
// As linhas do Java são convertidas para as do JavaScript (campo `js`), e o mapa L/R é montado
// com elas. Como no OA (run_oa_suite.js), compara-se a presença de conflito com o esperado.
//
// Os testes de ReachDefinition rodam no modo padrão (fluxo direto); os de Tainted, com DATAFLOW_MODE=tainted
// (propagação transitiva, e array tratado como um único elemento de estado).
//
// Uso: node experiments/run_df_suite.js [filtro]   (filtra por nome do teste ou da sample)
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const samplesDir = path.join(__dirname, 'df_samples', 'es5');
const filter = process.argv[2];

const NOT_CONFLUENCE = 'Confluence Flow ainda não está implementado na análise';

// java: linha no Java; js: linha no JavaScript (ES5); code: trecho que a linha deve conter
const cases = [
    {
        test: 'ReachDefinitionAnalysisOneConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow',
        expected: 1,
        source: [{ java: 6, js: 14, code: 'this.random()' }],
        sink: [{ java: 11, js: 17, code: 'this.blah(x)' }]
    },
    {
        test: 'ReachDefinitionAnalysisTransitiveSourceNoConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralIndirectSource',
        expected: 0,
        source: [{ java: 7, js: 15, code: 'x = this.random()' }],
        sink: [{ java: 12, js: 18, code: 'console.info(y)' }]
    },
    {
        test: 'ReachDefinitionAnalysisZeroConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow',
        expected: 0,
        source: [{ java: 19, js: 23, code: 'this.random()' }],
        sink: [{ java: 26, js: 27, code: 'console.info(x)' }]
    },
    {
        test: 'TaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'IntraproceduralIndirectSource',
        expected: 1,
        source: [{ java: 7, js: 15, code: 'x = this.random()' }],
        sink: [{ java: 12, js: 18, code: 'console.info(y)' }],
        note: 'Tainted é transitivo (x -> y -> sink); a análise só vê o fluxo direto, e y é escrito pela Base.'
    },
    {
        test: 'ArrayTaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'ArrayDataFlowSample',
        expected: 2,
        source: [{ java: 14, js: 16, code: 'arr[4] = 10' }],
        sink: [{ java: 16, js: 17, code: 'arr[4]' }, { java: 19, js: 20, code: 'console.info(a)' }],
        note: 'Detecta o sink da linha 17 (leitura de arr[4]). O sink do for-each (linha 20) lê `a`, escrita pela Base: fluxo transitivo.'
    },
    {
        test: 'ArrayTaintedAnalysisOneConflictIndirectTest', analysis: 'Tainted', sample: 'ArrayIndirectDataFlowSample',
        expected: 2,
        source: [{ java: 8, js: 15, code: 'arr[4] = 10' }],
        sink: [{ java: 10, js: 16, code: 'arr[3]' }, { java: 12, js: 17, code: 'console.info(b)' }],
        note: 'Tainted trata o array como um todo (arr[4] contamina arr[3]); a análise trata cada índice como estado independente.'
    },
    // --- Fora do escopo da análise atual ---
    { test: 'ConfluenceWithTransitivityTest', analysis: 'ConfluentTainted', sample: 'ConfluenceWithTransitivitySample', expected: 1, skip: NOT_CONFLUENCE },
    { test: 'SourceSinkConfluenceAnalysisMethodCallTest', analysis: 'Confluent', sample: 'SourceSinkMethodCallSample', expected: 1, skip: NOT_CONFLUENCE },
    { test: 'SourceSinkConfluenceAnalysisOneConflictTest', analysis: 'Confluent', sample: 'DoubleSourceSample', expected: 1, skip: NOT_CONFLUENCE },
    { test: 'SourceSinkConfluenceAnalysisVariableAttributionTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionSample', expected: 1, skip: NOT_CONFLUENCE },
    { test: 'SourceSinkVariableAttributionWithAutoIncrementConfluentTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionWithAutoIncrement', expected: 0, skip: NOT_CONFLUENCE },
    { test: 'SourceSinkVariableAttributionWithAutoIncrementTaintedConfluentTest', analysis: 'ConfluentTainted', sample: 'SourceSinkVariableAttributionWithAutoIncrement', expected: 1, skip: NOT_CONFLUENCE },
    { test: 'ContainmentConflictTest', analysis: 'DFPInterProcedural', sample: 'ioa.ContainmentSample', expected: 1, skip: 'sample de OA (pacote ioa), fora das 9 samples de DF traduzidas' }
];

const selected = filter
    ? cases.filter(c => c.test.toLowerCase().includes(filter.toLowerCase()) || c.sample.toLowerCase().includes(filter.toLowerCase()))
    : cases;

// Confere que a linha mapeada ainda contém o comando esperado (evita mapa desatualizado)
function checkLines(c, file) {
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    for (const m of c.source.concat(c.sink)) {
        if (!(lines[m.js - 1] || '').includes(m.code)) {
            throw new Error(`${path.basename(file)}:${m.js} não contém '${m.code}' (Java ${m.java})`);
        }
    }
}

const results = [];
for (const c of selected) {
    if (c.skip) {
        results.push({ c, skipped: true });
        continue;
    }
    const file = path.join(samplesDir, `${c.sample}.js`);
    const branchMap = { L: c.source.map(m => m.js), R: c.sink.map(m => m.js) };
    let output = '', error = null;
    try {
        checkLines(c, file);
        output = execFileSync('node', [
            'src/js/commands/jalangi.js', '--inlineIID', '--inlineSource',
            '--analysis', 'src/js/sample_analyses/ChainedAnalyses.js',
            '--analysis', 'src/js/runtime/SMemory.js',
            '--analysis', 'experiments/analyses/analysis_dataflow.js',
            file
        ], { cwd: rootDir, encoding: 'utf-8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'], env: Object.assign({}, process.env, { BRANCH_MAP: JSON.stringify(branchMap), DATAFLOW_MODE: c.analysis === 'Tainted' ? 'tainted' : 'reach' }) });
    } catch (e) {
        error = e.message.split('\n')[0];
        output = (e.stdout || '') + (e.stderr || '');
    }
    const df = output.match(/Conflitos de Data Flow Inter-Branch:\s*(\d+)/);
    const oa = output.match(/Conflitos de Overriding Assignment \(OA\):\s*(\d+)/);
    results.push({ c, error: error || (df ? null : 'sem relatório da análise'), df: df ? +df[1] : 0, oa: oa ? +oa[1] : 0, output });
}

console.log('================================================================================');
console.log('🔬 VALIDAÇÃO DE DATA FLOW — TESTES DO conflict-static-analysis');
console.log('================================================================================');
let ok = 0, wrong = 0, errors = 0, skipped = 0, countDiffers = 0;
for (const r of results) {
    const c = r.c;
    if (r.skipped) {
        skipped++;
        console.log(`• ${c.test}\n    ${c.sample} (${c.analysis}): não executado — ${c.skip}`);
        continue;
    }
    if (r.error) {
        errors++;
        console.log(`✖ ERRO ${c.test}\n    ${r.error}`);
        continue;
    }
    const match = (r.df > 0) === (c.expected > 0);
    match ? ok++ : wrong++;
    if (match && r.df !== c.expected) countDiffers++;
    console.log(`${match ? '✔' : '✖'} ${c.test}`);
    console.log(`    ${c.sample} (${c.analysis}) | esperado DF=${c.expected} | detectado DF=${r.df} (OA=${r.oa})${match && r.df !== c.expected ? ' | presença bate, contagem difere' : ''}`);
    if (c.note && (!match || r.df !== c.expected)) console.log(`    ↳ ${c.note}`);
    if (selected.length === 1) {
        console.log('--- LOG DA ANÁLISE ---');
        console.log(r.output.trim());
        console.log('----------------------');
    }
}
console.log('--------------------------------------------------------------------------------');
console.log(`Total: ${results.length} | executados: ${results.length - skipped} | presença correta: ${ok} | divergentes: ${wrong} | erros: ${errors} | não executados: ${skipped}`);
if (countDiffers > 0) console.log(`Em ${countDiffers} caso(s) a presença bate, mas a contagem difere do esperado.`);
console.log('================================================================================');
process.exit(errors > 0 ? 1 : 0);
