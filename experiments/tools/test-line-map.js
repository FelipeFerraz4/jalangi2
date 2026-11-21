// Autoteste do gerador de mapa L/R com cenários sintéticos. Uso: node experiments/tools/test-line-map.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildLineMap, status, mergeMaps } = require('./line-map');

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

test('mapa por merge junta os arquivos do mesmo merge, inclusive os que só têm L ou só R', () => {
    const sample = (project, mergeCommit, filePath, map, left, right) =>
        ({ project, mergeCommit, filePath, result: { map, left, right } });
    const merges = mergeMaps([
        sample('p', 'c1', 'src/a.js', { 3: 'L' }, 1, 0),        // só L
        sample('p', 'c1', 'src/b.js', { 7: 'R' }, 0, 1),        // só R
        sample('p', 'c1', 'src/c.js', {}, 0, 0),                // sem L nem R: fica de fora
        sample('p', 'c2', 'src/a.js', { 1: 'L' }, 1, 0),        // outro merge, só L
    ]);
    assert.strictEqual(merges.length, 2);
    const c1 = merges.find(m => m.mergeCommit === 'c1');
    assert.deepStrictEqual(c1.map, { files: { 'src/a.js': { 3: 'L' }, 'src/b.js': { 7: 'R' } } });
    assert.strictEqual(c1.status, 'ok');
    assert.strictEqual(merges.find(m => m.mergeCommit === 'c2').status, 'sem-R');
});

test('pacote sem nenhuma amostra é ignorado, e os outros pacotes continuam', () => {
    const { spawnSync } = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'linemap-zip-'));
    try {
        const sample = path.join(dir, 'amostra');
        fs.mkdirSync(path.join(sample, 'abc'), { recursive: true });
        const versions = { base: ['a', 'b'], left: ['a', 'L'], right: ['a', 'b', 'R'], merge: ['a', 'L', 'R'] };
        Object.entries(versions).forEach(([name, lines]) => fs.writeFileSync(path.join(sample, 'abc', `${name}.js`), lines.join('\n') + '\n'));
        fs.writeFileSync(path.join(sample, 'abc', 'metadados.json'),
            JSON.stringify({ project: 'p', 'merge commit': 'm1', 'file path': 'a.js' }));
        // Um pacote com uma amostra e outro só com um arquivo qualquer (projeto sem amostras)
        spawnSync('zip', ['-qr', path.join(dir, 'com.zip'), 'abc'], { cwd: sample });
        fs.writeFileSync(path.join(dir, 'LEIAME.txt'), 'sem amostras');
        spawnSync('zip', ['-q', path.join(dir, 'vazio.zip'), 'LEIAME.txt'], { cwd: dir });

        const out = path.join(dir, 'saida');
        const r = spawnSync('node', [path.join(__dirname, 'line-map.js'), '--zip', path.join(dir, 'vazio.zip'), path.join(dir, 'com.zip'), '--out-dir', out], { encoding: 'utf-8' });
        assert.strictEqual(r.status, 0, r.stderr);
        const csv = fs.readFileSync(path.join(out, 'mapa_linhas.csv'), 'utf-8').trim().split('\n');
        assert.strictEqual(csv.length, 2, 'cabeçalho + 1 amostra');
        assert.ok(csv[1].endsWith(',ok'), csv[1]);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

let failed = 0;
for (const [name, fn] of tests) {
    try { fn(); console.log(`✔ ${name}`); } catch (e) { failed++; console.log(`✖ ${name}\n    ${e.message.split('\n').join('\n    ')}`); }
}
console.log(`\n${tests.length - failed}/${tests.length} testes passaram`);
process.exit(failed ? 1 : 0);
