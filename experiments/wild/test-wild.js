// Autoteste das ferramentas de execução em merges reais. Uso: node experiments/wild/test-wild.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseCsv, formatCsv } = require('./lib/csv');
const { checkFile } = require('./check-instrumentable');

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function withFile(code, fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-test-'));
    const file = path.join(dir, 'alvo.js');
    fs.writeFileSync(file, code);
    try { return fn(file); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('csv: BOM, aspas, vírgula e quebra de linha dentro do campo', () => {
    const rows = parseCsv('﻿a,b\n1,"x,y"\n"2","linha\nnova ""q"""\n');
    assert.deepStrictEqual(rows, [['a', 'b'], ['1', 'x,y'], ['2', 'linha\nnova "q"']]);
});

test('csv: escrever e ler de volta dá o mesmo resultado', () => {
    const rows = [['a', 'b'], ['x,y', 'q"r'], ['linha\nnova', '']];
    assert.deepStrictEqual(parseCsv(formatCsv(rows)), rows);
});

test('instrumentação: ES5 passa', () => {
    withFile('var x = 1;\nfunction f(a) { return a + x; }\nf(2);\n', file => assert.strictEqual(checkFile(file).ok, true));
});

test('instrumentação: arrow function falha (a saída instrumentada não compila), com o motivo', () => {
    withFile('var f = (a) => a + 1;\n', file => {
        const r = checkFile(file);
        assert.strictEqual(r.ok, false);
        assert.ok(r.error && r.error.length > 0);
    });
});

test('instrumentação: const/let passam na compilação (o erro só aparece ao executar: limite do teste)', () => {
    withFile('const a = 1;\nlet b = 2;\n', file => assert.strictEqual(checkFile(file).ok, true));
});

test('instrumentação: arquivo inexistente é reportado, sem lançar exceção', () => {
    const r = checkFile('/nao/existe.js');
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.startsWith('leitura'));
});

// --- Fase 1: git-sync, com repositórios locais temporários (sem rede) ---
const { ensureClone, verifyFile, sha256, git } = require('./lib/git-sync');

function withGitRepo(fn) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-git-'));
    const src = path.join(dir, 'origem');
    fs.mkdirSync(src);
    const run = a => { const r = git(['-C', src, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a]); if (r.status !== 0) throw new Error(r.stderr.toString()); return r.stdout.toString().trim(); };
    run(['init', '-q']);
    fs.writeFileSync(path.join(src, 'a.js'), 'var x = 1;\n');
    run(['add', '.']); run(['commit', '-q', '-m', 'um']);
    const commit = run(['rev-parse', 'HEAD']);
    return Promise.resolve(fn({ dir, src, commit })).finally(() => fs.rmSync(dir, { recursive: true, force: true }));
}

// --- Fase 2: classificação e tabulação ---
const { classifyRun, firstError, coverageNumbers, COLUMNS, resultRow, CONFLICT_COLUMNS, conflictRows } = require('./lib/results');

test('execução: classificação pelo código de saída e pelo relatório', () => {
    assert.strictEqual(classifyRun({ exitCode: 0, output: '', hasReport: true }), 'ok');
    assert.strictEqual(classifyRun({ exitCode: 1, output: 'ReferenceError: x', hasReport: true }), 'erro_execucao');
    assert.strictEqual(classifyRun({ exitCode: 124, output: '', hasReport: true }), 'timeout');
    assert.strictEqual(classifyRun({ exitCode: 3, output: 'ERRO_INSTRUMENTACAO: x', hasReport: false }), 'erro_instrumentacao');
    assert.strictEqual(classifyRun({ exitCode: 137, output: '', hasReport: false }), 'morto_memoria_ou_tempo');
    assert.strictEqual(classifyRun({ exitCode: 0, output: '', hasReport: false }), 'sem_relatorio');
});

test('execução: primeira linha de erro e cobertura sem linhas sem código', () => {
    assert.strictEqual(firstError('ok\nReferenceError: self is not defined\n  at x'), 'ReferenceError: self is not defined');
    assert.strictEqual(firstError('tudo certo'), '');
    const cov = coverageNumbers({ coverage: { summary: { total: { L: { mapped: 12, withoutCode: 2, executed: 5 }, R: { mapped: 0, withoutCode: 0, executed: 0 } } } } });
    assert.deepStrictEqual(cov.L, { executed: 5, total: 10, rate: 50 });
    assert.strictEqual(cov.R.rate, '');
});

test('resultados: a linha tem uma célula por coluna e os conflitos saem com L, R e base', () => {
    const sample = { sample_id: 'abc', project: 'p', merge_commit: 'm', file_path: 'a.js', left_lines: '1', right_lines: '2' };
    const report = {
        counts: { oa: 1, df: { total: 1, viaParam: 1 }, cf: { total: 1 } },
        coverage: { summary: { total: { L: { mapped: 1, withoutCode: 0, executed: 1 }, R: { mapped: 1, withoutCode: 0, executed: 0 } } } },
        conflicts: {
            oa: [{ key: 'x|a.js:3|a.js:1', target: 'x', branch: 'R', position: { line: 3 }, previous: { branch: 'L', position: { line: 1 } } }],
            df: [{ kind: 'transitive', key: 'k', from: { branch: 'R', position: { line: 7 } }, to: { branch: 'L', position: { line: 9 } }, targets: ['y'], viaParam: true }],
            cf: [{ kind: 'direct', key: 'c', left: { line: 4 }, right: { line: 5 }, base: { line: 6 } }]
        }
    };
    const row = resultRow({ sample, install: { status: 'ok', seconds: 2 }, run: { status: 'ok', exitCode: 0, seconds: 1, error: '' }, report, outputDir: 'amostras/abc' });
    assert.strictEqual(row.length, COLUMNS.length);
    assert.deepStrictEqual(row.slice(12, 16), [1, 1, 1, 1]);
    const rows = conflictRows(sample, report);
    assert.ok(rows.every(r => r.length === CONFLICT_COLUMNS.length));
    assert.deepStrictEqual(rows.map(r => r.slice(3, 9)), [
        ['OA', '', '', 1, 3, ''],
        ['DF', 'transitivo', 'sim', 9, 7, ''],
        ['CF', 'direto', '', 4, 5, 6]]);
});

test('resultados: amostra sem relatório gera linha com células vazias, sem lançar exceção', () => {
    const sample = { sample_id: 'abc', project: 'p', merge_commit: 'm', file_path: 'a.js', left_lines: '1', right_lines: '2' };
    const row = resultRow({ sample, install: null, run: { status: 'nao_instrumentavel', error: 'x' }, report: null });
    assert.strictEqual(row.length, COLUMNS.length);
    assert.deepStrictEqual(conflictRows(sample, null), []);
});

test('csv: separador ponto e vírgula só cita o campo que o contém', () => {
    assert.strictEqual(formatCsv([['a,b', 'c;d']], ';'), 'a,b;"c;d"\n');
    assert.deepStrictEqual(parseCsv(formatCsv([['a,b', 'c;d']], ';'), ';'), [['a,b', 'c;d']]);
});

const asyncTests = [];
const atest = (name, fn) => asyncTests.push([name, fn]);

atest('git-sync: clona sem checkout e confere o arquivo (ok)', () => withGitRepo(async ({ dir, src, commit }) => {
    const dest = path.join(dir, 'clone');
    const r = await ensureClone(src, dest);
    assert.deepStrictEqual([r.ok, r.action], [true, 'clone']);
    assert.ok(!fs.existsSync(path.join(dest, 'a.js')), 'não deve fazer checkout');
    assert.strictEqual(verifyFile(dest, commit, 'a.js', sha256(Buffer.from('var x = 1;\n'))).status, 'ok');
}));

atest('git-sync: clone já existente não baixa de novo', () => withGitRepo(async ({ dir, src }) => {
    const dest = path.join(dir, 'clone');
    await ensureClone(src, dest);
    assert.strictEqual((await ensureClone(src, dest)).action, 'existente');
    assert.strictEqual((await ensureClone(src, dest, { update: true })).action, 'fetch');
}));

atest('git-sync: conteúdo diferente, arquivo ausente e commit ausente são distinguidos', () => withGitRepo(async ({ dir, src, commit }) => {
    const dest = path.join(dir, 'clone');
    await ensureClone(src, dest);
    assert.strictEqual(verifyFile(dest, commit, 'a.js', sha256(Buffer.from('outro'))).status, 'conteudo_diferente');
    assert.strictEqual(verifyFile(dest, commit, 'nao-existe.js', 'x').status, 'arquivo_ausente');
    assert.strictEqual(verifyFile(dest, '0'.repeat(40), 'a.js', 'x').status, 'commit_ausente');
}));

atest('git-sync: repositório inexistente falha sem deixar pasta e sem pedir senha', () => withGitRepo(async ({ dir }) => {
    const dest = path.join(dir, 'clone');
    const r = await ensureClone(path.join(dir, 'nao-existe'), dest);
    assert.strictEqual(r.ok, false);
    assert.ok(!fs.existsSync(dest));
}));

(async () => {
    let failed = 0;
    for (const [name, fn] of [...tests, ...asyncTests]) {
        try { await fn(); console.log(`✔ ${name}`); } catch (e) { failed++; console.log(`✖ ${name}\n    ${e.message.split('\n').join('\n    ')}`); }
    }
    console.log(`\n${tests.length + asyncTests.length - failed}/${tests.length + asyncTests.length} testes passaram`);
    process.exit(failed ? 1 : 0);
})();
