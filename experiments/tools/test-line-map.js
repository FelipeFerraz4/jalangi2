// Autoteste do gerador de mapa L/R com cenários sintéticos. Uso: node experiments/tools/test-line-map.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildLineMap, status } = require('./line-map');

function scenario(base, left, right, merge) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'linemap-test-'));
    const files = {};
    Object.entries({ base, left, right, merge }).forEach(([name, lines]) => {
        files[name] = path.join(dir, `${name}.js`);
        fs.writeFileSync(files[name], lines.join('\n') + '\n');
    });
    try { return buildLineMap(files); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('cada contribuição marca só as linhas que alterou', () => {
    const r = scenario(
        ['a', 'b', 'c', 'd', 'e'],
        ['a', 'B', 'c', 'd', 'x', 'e'],        // altera b, acrescenta x
        ['a', 'b', 'c', 'd', 'E'],             // altera e
        ['a', 'B', 'c', 'd', 'x', 'E']);       // juntou tudo
    assert.deepStrictEqual(r.map, { 2: 'L', 5: 'L', 6: 'R' });
    assert.strictEqual(status(r), 'ok');
});

test('linhas da base ficam sem rótulo', () => {
    const r = scenario(['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'C'], ['a', 'b', 'C']);
    assert.deepStrictEqual(r.map, { 3: 'R' });
    assert.strictEqual(status(r), 'sem-L');
});

test('linha editada ao resolver o merge não é de nenhuma contribuição', () => {
    const r = scenario(['a', 'b', 'c'], ['a', 'L', 'c'], ['a', 'R', 'c'], ['a', 'RESOLVIDO', 'c']);
    assert.deepStrictEqual(r.map, {});
    assert.strictEqual(status(r), 'sem-L-e-R');
});

test('mesma alteração nas duas vale L (como o blame) e não conta como linha de R', () => {
    const r = scenario(['a', 'b'], ['a', 'X'], ['a', 'X'], ['a', 'X']);
    assert.deepStrictEqual(r.map, { 2: 'L' });
    assert.strictEqual(r.both, 1);
    assert.strictEqual(r.right, 0);
    assert.strictEqual(status(r), 'sem-R');
});

test('mudança só de espaços em branco é ignorada', () => {
    const r = scenario(['a', 'b', 'c'], ['a', '  b  ', 'c'], ['a', 'b', 'c2'], ['a', '  b  ', 'c2']);
    assert.deepStrictEqual(r.map, { 3: 'R' });
});

test('remoção não gera linhas, e as linhas seguintes mantêm a numeração do merge', () => {
    const r = scenario(['a', 'b', 'c', 'd'], ['a', 'c', 'd'], ['a', 'b', 'c', 'D'], ['a', 'c', 'D']);
    assert.deepStrictEqual(r.map, { 3: 'R' });
});

test('acréscimo no início desloca as linhas', () => {
    const r = scenario(['a', 'b'], ['n', 'a', 'b'], ['a', 'b', 'z'], ['n', 'a', 'b', 'z']);
    assert.deepStrictEqual(r.map, { 1: 'L', 4: 'R' });
});

let failed = 0;
for (const [name, fn] of tests) {
    try { fn(); console.log(`✔ ${name}`); } catch (e) { failed++; console.log(`✖ ${name}\n    ${e.message.split('\n').join('\n    ')}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} testes passaram`);
process.exit(failed ? 1 : 0);
