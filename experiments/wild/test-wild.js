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

let failed = 0;
for (const [name, fn] of tests) {
    try { fn(); console.log(`✔ ${name}`); } catch (e) { failed++; console.log(`✖ ${name}\n    ${e.message.split('\n').join('\n    ')}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} testes passaram`);
process.exit(failed ? 1 : 0);
