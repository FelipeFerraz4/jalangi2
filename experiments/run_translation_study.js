// ==============================================================================
// A ANÁLISE DÁ O MESMO RESULTADO COM CADA TRADUÇÃO? (estudo de tradução do Italo, tjtjdf)
// ==============================================================================
// O tjtjdf traduziu as classes `sample` do conflict-static-analysis de três formas:
//   A-jsweet     só JSweet
//   B-jsweet-ia  JSweet + correção por IA
//   C-ia         só IA
// em dois conjuntos: df (9 samples, as mesmas de df_samples/es5) e cf (6 samples de confluência).
// Este runner roda os mesmos casos em cada tradução, e também na tradução que a suíte usa hoje
// (df_samples/es5, a "atual"), e compara.
//
// As linhas mudam de uma tradução para outra (a C reordena métodos e muda comandos), então cada
// source/sink é localizado pelo método que o contém (`fn`) e por uma expressão regular do comando
// (`re`), sem contar comentários. Na tradução atual, o resultado tem de bater com as linhas fixas
// de run_df_cf_suite.js (conferido a cada execução).
//
// Casos:
//   - os 12 de run_df_cf_suite.js que usam as 9 samples (o Containment usa uma sample de OA e fica de fora);
//   - os 6 testes de confluência SVFA (pacote svfa/confluence), com asserções ativas no Java, que usam
//     as 6 samples do conjunto cf. DFPConfluenceAnalysisWithInterproceduralConfluenceTest está @Ignore no Java.
//
// Uso: node experiments/run_translation_study.js [--csv arquivo.csv] [filtro]
const fs = require('fs');
const path = require('path');
const { runAnalysis } = require('./lib/analysis');
const dfcf = require('./run_df_cf_suite');

const base = path.join(__dirname, 'df_samples');
const VERSIONS = ['atual', 'A-jsweet', 'B-jsweet-ia', 'C-ia'];
const fileFor = (set, version, sample) => version === 'atual'
    ? (set === 'df' ? path.join(base, 'es5', `${sample}.js`) : null)
    : path.join(base, 'abordagens', set, version, `${sample}.js`);

const METRICS = {
    ReachDefinition: { name: 'DF', value: r => r.df },
    Tainted: { name: 'DF', value: r => r.df + r.dfTransitive },
    Confluent: { name: 'CF', value: r => r.cf },
    ConfluentTainted: { name: 'CF', value: r => r.cf + r.cfTransitive },
    // SVFA (grafo de fluxo de valores, interprocedural e transitivo): CF direto + transitivo
    DFPConfluence: { name: 'CF', value: r => r.cf + r.cfTransitive },
};

const P = (java, fn, re, nth = 0) => ({ java, fn, re, nth });
// Saída de um valor v: console.log/info(v), ou process.stdout.write(v + "" | String(v) | v.toString()) quando a
// tradução reproduz o System.out.print sem quebra de linha
const OUT = v => new RegExp(`console\\.\\w+\\(\\s*${v}\\s*\\)|process\\.stdout\\.write\\(\\s*(String\\(\\s*${v}\\s*\\)|${v}\\s*\\+\\s*(""|'')|${v}\\.toString\\(\\))`);
const cases = [
    { set: 'df', test: 'ReachDefinitionAnalysisOneConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow', expected: 1,
        source: [P(6, 'foo', /\bx\s*=\s*this\.random\(\)/)], sink: [P(11, 'foo', /this\.blah\(x\)/)] },
    { set: 'df', test: 'ReachDefinitionAnalysisTransitiveSourceNoConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralIndirectSource', expected: 0,
        source: [P(7, 'm', /\bx\s*=\s*this\.random\(\)/)], sink: [P(12, 'm', OUT('y'))] },
    { set: 'df', test: 'ReachDefinitionAnalysisZeroConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow', expected: 0,
        source: [P(19, 'blah', /\bx\s*=\s*this\.random\(\)/)], sink: [P(26, 'blah', OUT('x'))] },
    { set: 'df', test: 'TaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'IntraproceduralIndirectSource', expected: 1,
        source: [P(7, 'm', /\bx\s*=\s*this\.random\(\)/)], sink: [P(12, 'm', OUT('y'))] },
    { set: 'df', test: 'ArrayTaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'ArrayDataFlowSample', expected: 2,
        source: [P(14, 'main', /arr\[4\]\s*=\s*10/)], sink: [P(16, 'main', /=\s*arr\[4\]/), P(19, 'main', new RegExp(OUT('a').source + '|' + OUT('arr\\[\\w+\\]').source))] },
    { set: 'df', test: 'ArrayTaintedAnalysisOneConflictIndirectTest', analysis: 'Tainted', sample: 'ArrayIndirectDataFlowSample', expected: 2,
        source: [P(8, 'main', /arr\[4\]\s*=\s*10/)], sink: [P(10, 'main', /=\s*arr\[3\]/), P(12, 'main', OUT('b'))],
        note: 'divergência intencional: cada índice do array é um estado independente' },
    { set: 'df', test: 'ConfluenceWithTransitivityTest', analysis: 'ConfluentTainted', sample: 'ConfluenceWithTransitivitySample', expected: 1,
        source: [P(9, 'foo', /\bx\s*=\s*10\b/)], sink: [P(13, 'foo', /\by\s*\+\+|\by\s*\+=\s*1\b|\by\s*=\s*y\s*\+\s*1\b/)] },
    { set: 'df', test: 'SourceSinkConfluenceAnalysisMethodCallTest', analysis: 'Confluent', sample: 'SourceSinkMethodCallSample', expected: 1,
        source: [P(8, 'foo', /\bx\s*=\s*this\.one\(\)/)], sink: [P(10, 'foo', /\by\s*=\s*this\.two\(\)/)] },
    { set: 'df', test: 'SourceSinkConfluenceAnalysisOneConflictTest', analysis: 'Confluent', sample: 'DoubleSourceSample', expected: 1,
        source: [P(8, 'main', /\bx\s*=\s*x\s*\+\s*1|\bx\s*\+=\s*1/)], sink: [P(12, 'main', /\by\s*=\s*y\s*-\s*1|\by\s*-=\s*1/)] },
    { set: 'df', test: 'SourceSinkConfluenceAnalysisVariableAttributionTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionSample', expected: 1,
        source: [P(18, 'foo', /\bx\s*=\s*10\b/)], sink: [P(20, 'foo', /\by\s*=\s*z\s*\+\s*2/)] },
    { set: 'df', test: 'SourceSinkVariableAttributionWithAutoIncrementConfluentTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionWithAutoIncrement', expected: 0,
        source: [P(9, 'foo', /\bx\s*=\s*10\b/)], sink: [P(11, 'foo', /\by\s*=\s*z\s*\+\s*2/)] },
    { set: 'df', test: 'SourceSinkVariableAttributionWithAutoIncrementTaintedConfluentTest', analysis: 'ConfluentTainted', sample: 'SourceSinkVariableAttributionWithAutoIncrement', expected: 1,
        source: [P(9, 'foo', /\bx\s*=\s*10\b/)], sink: [P(11, 'foo', /\by\s*=\s*z\s*\+\s*2/)] },
    // --- confluência SVFA (svfa/confluence), conjunto cf ---
    { set: 'cf', test: 'DFPConfluenceAnalysisTest', analysis: 'DFPConfluence', sample: 'DoubleSourceSample', expected: 2,
        source: [P(8, 'main', /\bx\s*=\s*x\s*\+\s*1|\bx\s*\+=\s*1/)], sink: [P(12, 'main', /\by\s*=\s*y\s*-\s*1|\by\s*-=\s*1/)] },
    { set: 'cf', test: 'DFPConfluenceWithTransitivityAnalysisTest', analysis: 'DFPConfluence', sample: 'ConfluenceWithTransitivitySample', expected: 2,
        source: [P(9, 'foo', /\bx\s*=\s*10\b/)], sink: [P(13, 'foo', /\by\s*\+\+|\by\s*\+=\s*1\b|\by\s*=\s*y\s*\+\s*1\b/)] },
    { set: 'cf', test: 'DFPConfluenceAnalysisBaseTest', analysis: 'DFPConfluence', sample: 'ConfluenceBaseSample', expected: 2,
        source: [P(9, 'countFixes', /\.countDupWhitespace\(\)/)], sink: [P(11, 'countFixes', /\.countDupWords\(\)/)],
        note: 'interprocedural: as escritas (this.spaces, this.words) estão nos métodos chamados, em linhas da Base' },
    { set: 'cf', test: 'DFPConfluenceAnalysisBaseTest2', analysis: 'DFPConfluence', sample: 'ConfluenceBaseSample2', expected: 1,
        source: [P(6, 'm', /\bx\s*=\s*1\b/)], sink: [P(8, 'm', /\by\s*=\s*1\b/)] },
    { set: 'cf', test: 'DFPConfluenceAnalysisWithMultipleConfluences', analysis: 'DFPConfluence', sample: 'MultipleConfluenceSample', expected: 2,
        source: [P(9, 'multipleConfluencesToTheSameLine', /\bx\s*=\s*x\s*\+\s*1|\bx\s*\+=\s*1|\bx\s*\+\+/), P(11, 'multipleConfluencesToTheSameLine', /\by\s*=\s*y\s*\+\s*1|\by\s*\+=\s*1|\by\s*\+\+/)],
        sink: [P(13, 'multipleConfluencesToTheSameLine', /\bz\s*=\s*z\s*\+\s*1|\bz\s*\+=\s*1|\bz\s*\+\+/)] },
    { set: 'cf', test: 'DFPConfluenceAnalysisWithInterproceduralConfluenceTest', analysis: 'DFPConfluence', sample: 'InterproceduralConfluenceSample', expected: 1,
        source: [P(10, 'interproceduralSample', /\bx\s*=\s*x\s*\+\s*1|\bx\s*\+=\s*1|\bx\s*\+\+/)], sink: [P(12, 'interproceduralSample', /\by\s*=\s*y\s*\+\s*2|\by\s*\+=\s*2/)],
        note: '@Ignore no Java desde 2021, sem motivo registrado; aqui o CF ignora origens vindas por parâmetro (veja DECISOES_PENDENTES.md)' },
];

// ---- localização das linhas ----
const stripComment = line => line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '');
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function methodStart(lines, fn) {
    const f = escape(fn);
    const defs = [new RegExp(`\\.${f}\\s*=\\s*function\\b`), new RegExp(`\\bfunction\\s+${f}\\s*\\(`), new RegExp(`\\b${f}\\s*:\\s*function\\b`),
        new RegExp(`^\\s*(static\\s+)?${f}\\s*\\([^)]*\\)\\s*\\{`)];
    return lines.findIndex(l => defs.some(d => d.test(stripComment(l))));
}
// Início de qualquer método nomeado: marca o fim do método anterior
const ANY_METHOD = /\.\w+\s*=\s*function\b|\bfunction\s+\w+\s*\(|\b\w+\s*:\s*function\b/;
function locate(lines, p) {
    const start = methodStart(lines, p.fn);
    if (start === -1) throw new Error(`método ${p.fn} não encontrado (Java ${p.java})`);
    let seen = 0;
    for (let i = start; i < lines.length; i++) {
        if (i > start && ANY_METHOD.test(stripComment(lines[i]))) break;
        if (p.re.test(stripComment(lines[i])) && seen++ === p.nth) return i + 1;
    }
    throw new Error(`comando ${p.re} não encontrado em ${p.fn} (Java ${p.java})`);
}

// Na tradução atual, a localização tem de dar as linhas fixas da suíte DF/CF
function checkAgainstSuite(c, L, R) {
    const fixed = (dfcf.cases || []).find(x => x.test === c.test);
    if (!fixed) return null;
    const want = { L: fixed.source.map(m => m.js), R: fixed.sink.map(m => m.js) };
    return JSON.stringify(want) === JSON.stringify({ L, R }) ? null : `localização ${JSON.stringify({ L, R })} difere da suíte ${JSON.stringify(want)}`;
}

function runCase(c, version) {
    const file = fileFor(c.set, version, c.sample);
    if (!file) return { status: 'n/a' };
    if (!fs.existsSync(file)) return { status: 'ausente', detail: file };
    let L, R;
    try {
        const lines = fs.readFileSync(file, 'utf-8').split('\n');
        L = c.source.map(p => locate(lines, p));
        R = c.sink.map(p => locate(lines, p));
    } catch (e) { return { status: 'erro', detail: e.message }; }
    if (version === 'atual') {
        const mismatch = checkAgainstSuite(c, L, R);
        if (mismatch) return { status: 'erro', detail: mismatch, L, R };
    }
    const r = runAnalysis({ file, branchMap: { L, R } });
    if (r.failed) return { status: 'erro', detail: r.error, L, R };
    const found = METRICS[c.analysis].value(r);
    return { status: (found > 0) === (c.expected > 0) ? 'ok' : 'diverge', found, L, R };
}

function main() {
    const args = process.argv.slice(2);
    const csvAt = args.indexOf('--csv');
    const csvFile = csvAt === -1 ? null : args.splice(csvAt, 2)[1];
    const filter = (args[0] || '').toLowerCase();
    const selected = cases.filter(c => !filter || c.test.toLowerCase().includes(filter) || c.sample.toLowerCase().includes(filter));

    const rows = [];
    for (const c of selected) {
        const res = Object.fromEntries(VERSIONS.map(v => [v, runCase(c, v)]));
        rows.push({ c, res });
        const cell = r => r.status === 'ok' ? `✔ ${r.found}` : r.status === 'diverge' ? `✖ ${r.found}` : r.status === 'n/a' ? '—' : `ERRO`;
        console.log(`${c.set.toUpperCase()} ${c.test} (${c.analysis}, esperado ${METRICS[c.analysis].name}=${c.expected})`);
        console.log('    ' + VERSIONS.map(v => `${v}: ${cell(res[v])}`).join(' | '));
        for (const v of VERSIONS) if (res[v].status === 'erro' || res[v].status === 'ausente') console.log(`    ↳ ${v}: ${res[v].detail}`);
        if (c.note && VERSIONS.some(v => res[v].status === 'diverge')) console.log(`    ↳ ${c.note}`);
    }

    console.log('--------------------------------------------------------------------------------');
    for (const set of ['df', 'cf']) {
        const rs = rows.filter(r => r.c.set === set);
        if (!rs.length) continue;
        console.log(`${set.toUpperCase()} (${rs.length} casos): ` + VERSIONS.map(v => {
            const st = rs.map(r => r.res[v]).filter(x => x.status !== 'n/a');
            if (!st.length) return `${v} —`;
            const ok = st.filter(x => x.status === 'ok').length, exact = rs.filter(r => r.res[v].status === 'ok' && r.res[v].found === r.c.expected).length;
            const err = st.filter(x => x.status === 'erro' || x.status === 'ausente').length;
            return `${v} ${ok}/${st.length}` + (exact !== ok ? ` (${exact} com a contagem exata)` : '') + (err ? `, ${err} erro(s)` : '');
        }).join(' | '));
    }
    const differ = rows.filter(r => new Set(VERSIONS.filter(v => r.res[v].status !== 'n/a').map(v => `${r.res[v].status}:${r.res[v].found}`)).size > 1);
    console.log(differ.length ? `Casos em que as traduções dão resultados diferentes: ${differ.map(r => r.c.test).join(', ')}` : 'Todas as traduções dão o mesmo resultado em todos os casos.');

    if (csvFile) {
        const head = ['conjunto', 'teste', 'analise', 'sample', 'esperado', ...VERSIONS.flatMap(v => [`${v}_estado`, `${v}_detectado`, `${v}_L`, `${v}_R`])];
        const q = s => /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
        const body = rows.map(({ c, res }) => [c.set, c.test, c.analysis, c.sample, c.expected,
            ...VERSIONS.flatMap(v => [res[v].status, res[v].found === undefined ? '' : res[v].found, (res[v].L || []).join(' '), (res[v].R || []).join(' ')])]);
        fs.writeFileSync(csvFile, [head, ...body].map(r => r.map(q).join(',')).join('\n') + '\n');
        console.log(`→ ${csvFile}`);
    }
    process.exit(rows.some(r => VERSIONS.some(v => r.res[v].status === 'erro' || r.res[v].status === 'ausente')) ? 1 : 0);
}

module.exports = { cases, locate, methodStart };
if (require.main === module) main();
