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
