// Autoteste do relatório JSON da análise (cobertura e conflitos) e da união de relatórios.
// Uso: node experiments/tools/test-reports.js
const assert = require('assert');
const { runAnalysis } = require('../lib/analysis');
const { mergeReports } = require('./merge-reports');
const reportLib = require('../lib/report');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const run = (file, branchMap) => {
    const r = runAnalysis({ file: 'experiments/toys/' + file, branchMap });
    assert.ok(r.report, `sem relatório: ${r.error}`);
    return r.report;
};

// --- Relatório de uma execução ---

test('cobertura: linha de L num if não percorrido aparece como não executada', () => {
    const r = run('09_test_if_not_taken.js', { L: [6], R: [9] });
    const t = r.coverage.summary.total;
    assert.deepStrictEqual([t.L.executed, t.L.mapped, t.R.executed, t.R.mapped], [0, 1, 1, 1]);
    assert.deepStrictEqual(r.coverage.summary.files[0].L.notExecuted, [6]);
});

test('cobertura: linha só com "}" não conta como executável; arquivo nunca carregado fica loaded=false', () => {
    const r = run('09_test_if_not_taken.js', { files: {
        'experiments/toys/09_test_if_not_taken.js': { L: [5, 6, 7], R: [9] },
        'experiments/toys/nunca_carregado.js': { L: [1], R: [2] }
    } });
    const [toy, missing] = r.coverage.summary.files;
    assert.deepStrictEqual([toy.L.withoutCode, toy.L.executed, toy.L.notExecuted], [1, 1, [6]]);
    assert.strictEqual(missing.loaded, false);
    assert.deepStrictEqual([missing.L.notExecuted, missing.R.notExecuted], [[1], [2]]);
});

test('OA: um registro por alvo, com valores e posições das duas escritas', () => {
    const r = run('27_test_oa_two_targets.js', { L: [3, 5], R: [4, 6] });
    assert.strictEqual(r.counts.oa, 2);
    r.conflicts.oa.forEach(c => {
        assert.deepStrictEqual([c.branch, c.position.line, c.value], ['R', 4, '2']);
        assert.deepStrictEqual([c.previous.branch, c.previous.position.line, c.previous.value], ['L', 3, '1']);
    });
});

test('DF: alvos entre o mesmo par de linhas ficam num só registro', () => {
    const r = run('27_test_oa_two_targets.js', { L: [3, 5], R: [4, 6] });
    assert.strictEqual(r.conflicts.df.length, 1);
    const c = r.conflicts.df[0];
    assert.deepStrictEqual([c.kind, c.from.position.line, c.to.position.line, c.targets.length], ['direct', 5, 6, 2]);
});

test('DF interprocedural: a pilha de chamadas mostra de onde veio a leitura', () => {
    const r = run('05_test_dataflow_interproc.js', { L: [4], R: [8] });
    assert.deepStrictEqual(r.conflicts.df[0].stack.map(p => p.line), [12]);
});

test('mapa por arquivo: as posições trazem o arquivo', () => {
    const r = run('29_test_multifile.js', { files: { 'experiments/toys/29_test_multifile.js': { L: [3], R: [5] } } });
    const c = r.conflicts.df[0];
    assert.deepStrictEqual(c.from.position, { file: 'experiments/toys/29_test_multifile.js', line: 3 });
    assert.deepStrictEqual(c.to.position, { file: 'experiments/toys/29_test_multifile.js', line: 5 });
    assert.strictEqual(r.runs[0].branchMap, 'per-file');
});

test('CF: o trio traz as posições de L, R e do comando da Base', () => {
    const r = run('22_test_confluence_direct.js', { L: [3], R: [4] });
    const c = r.conflicts.cf[0];
    assert.deepStrictEqual([c.kind, c.left.line, c.right.line, c.base.line], ['direct', 3, 4, 5]);
});

// --- União de relatórios ---

const pos = line => ({ file: 'a.js', line });
const fakeReport = (df, executed) => reportLib.buildReport({
    runs: [{ program: 'a.js', branchMap: 'per-file' }],
    conflicts: { oa: [], df, cf: [] },
    coverageFiles: [{ file: 'a.js', loaded: true, lines: { L: [1, 2], R: [3] }, executable: [1, 2, 3], executed }]
});
const dfRecord = (kind, target) => ({
    kind, key: 'L@a.js:1->R@a.js:3', from: { branch: 'L', position: pos(1) }, to: { branch: 'R', position: pos(3) }, targets: [target], stack: []
});

test('união: cobertura soma as linhas executadas em qualquer execução', () => {
    const merged = mergeReports([fakeReport([], [1]), fakeReport([], [3])]);
    assert.deepStrictEqual(merged.coverage.files[0].executed, [1, 3]);
    const t = merged.coverage.summary.total;
    assert.deepStrictEqual([t.L.executed, t.R.executed], [1, 1]);
    assert.strictEqual(merged.runs.length, 2);
});

test('união: DF visto como transitivo numa execução e direto em outra conta só como direto', () => {
    const merged = mergeReports([fakeReport([dfRecord('transitive', 'x')], []), fakeReport([dfRecord('direct', 'y')], [])]);
    assert.deepStrictEqual(merged.counts.df, { direct: 1, transitive: 0, total: 1, viaParam: 0 });
});

test('união: o mesmo DF em duas execuções conta uma vez e junta os alvos', () => {
    const merged = mergeReports([fakeReport([dfRecord('direct', 'x')], []), fakeReport([dfRecord('direct', 'y')], [])]);
    assert.strictEqual(merged.counts.df.total, 1);
    assert.deepStrictEqual(merged.conflicts.df[0].targets, ['x', 'y']);
});

test('DF via parâmetro: o conflito transitivo que depende dos argumentos de uma chamada é marcado', () => {
    // segundo(a, b): só p recebe o valor de L, mas todas as origens lidas nos argumentos vão para todos os parâmetros
    const r = run('26_test_taint_param_split.js', { L: [6], R: [2] });
    assert.strictEqual(r.counts.df.total, 1);
    assert.strictEqual(r.conflicts.df[0].kind, 'transitive');
    assert.strictEqual(r.conflicts.df[0].viaParam, true);
    assert.strictEqual(r.counts.df.viaParam, 1);
});

test('DF via parâmetro: fluxo direto pelo argumento e fluxo transitivo fora de funções não são marcados', () => {
    const direct = run('16_test_dataflow_param.js', { L: [6], R: [2] });   // L passa o argumento, R lê o parâmetro
    assert.ok(direct.counts.df.total >= 1);
    assert.ok(direct.conflicts.df.every(c => !c.viaParam));
    const transitive = run('19_test_taint_transitive.js', { L: [2], R: [4] });
    assert.strictEqual(transitive.conflicts.df[0].kind, 'transitive');
    assert.ok(!transitive.conflicts.df[0].viaParam);
    assert.strictEqual(transitive.counts.df.viaParam, 0);
});

test('união: o conflito só fica marcado se todas as execuções o viram via parâmetro', () => {
    const marked = run('26_test_taint_param_split.js', { L: [6], R: [2] });
    const unmarked = JSON.parse(JSON.stringify(marked));
    unmarked.conflicts.df[0].viaParam = false;
    assert.strictEqual(mergeReports([marked, marked]).conflicts.df[0].viaParam, true);
    assert.strictEqual(mergeReports([marked, unmarked]).conflicts.df[0].viaParam, false);
    assert.strictEqual(mergeReports([unmarked, marked]).conflicts.df[0].viaParam, false);
    assert.strictEqual(mergeReports([marked, unmarked]).counts.df.viaParam, 0);
});

let failed = 0;
for (const [name, fn] of tests) {
    try { fn(); console.log(`✔ ${name}`); } catch (e) { failed++; console.log(`✖ ${name}\n    ${e.message.split('\n').join('\n    ')}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} testes passaram`);
process.exit(failed ? 1 : 0);
