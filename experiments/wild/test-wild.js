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
const { summaryRows, errorCategory, chooseHybrid, classifyRun, classifyTestRun, parseTestLine, firstError, coverageNumbers, COLUMNS, resultRow, CONFLICT_COLUMNS, conflictRows } = require('./lib/results');

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
    assert.deepStrictEqual(['OA', 'DF', 'CF', 'DF_via_parametro'].map(c => row[COLUMNS.indexOf(c)]), [1, 1, 1, 1]);
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

test('resumo: uma linha por projeto, com contagens, medianas e TOTAL no fim', () => {
    const mk = (project, status, oa, df, cf, lcov, rexec, rcov, install = 'ok', categoria = '', origem = '') => {
        const row = new Array(COLUMNS.length).fill('');
        const set = (c, v) => { row[COLUMNS.indexOf(c)] = v; };
        set('projeto', project); set('execucao', status); set('OA', oa); set('DF', df); set('CF', cf);
        set('L_cobertura_pct', lcov); set('R_executadas', rexec); set('R_cobertura_pct', rcov); set('instalacao', install);
        set('categoria_erro', categoria); set('origem_erro', origem);
        return row;
    };
    const out = summaryRows([mk('a', 'ok', 0, 1, 0, 10, 1, 50), mk('a', 'ok', 0, 0, 0, 30, 0, 0, 'falhou'), mk('a', 'erro_execucao', 0, 0, 0, '', '', '', 'ok', 'api_navegador', 'ambiente'),
        mk('b', 'nao_instrumentavel', '', '', '', '', '', '', '', 'instrumentacao', 'ferramenta')]);
    assert.strictEqual(out.length, 3);
    assert.deepStrictEqual(out[0], ['a', 3, 0, 2, 1, 0, 0, 1, 1, 0, 0, 'api_navegador (1)', 1, 0, 1, 0, 1, 20, 25]);
    assert.deepStrictEqual(out[1].slice(8, 12), [0, 0, 1, 'instrumentacao (1)']);
    assert.strictEqual(out[1][0], 'b');
    assert.deepStrictEqual(out[2].slice(0, 4), ['TOTAL', 4, 1, 2]);
});

test('categoria do erro: separa ambiente, projeto e ferramenta (casos do piloto)', () => {
    const cat = (status, out) => { const c = errorCategory(status, out); return c.categoria + '/' + c.origem; };
    assert.strictEqual(cat('ok', 'Error: qualquer'), '/');
    assert.strictEqual(cat('nao_instrumentavel', 'Unexpected token (140:52)'), 'instrumentacao/ferramenta');
    assert.strictEqual(cat('timeout', ''), 'tempo_esgotado/ambiente');
    assert.strictEqual(cat('erro_execucao', "Error: Cannot find module '../build/Release/canvas'"), 'modulo_nativo/ambiente');
    assert.strictEqual(cat('erro_execucao', 'Error: Error loading shared library /work/node_modules/bson/build/Release/bson.node: Exec format error'), 'modulo_nativo/ambiente');
    assert.strictEqual(cat('erro_execucao', "Error: Cannot find module 'qs'\nRequire stack:"), 'dependencia_ausente/ambiente');
    assert.strictEqual(cat('erro_execucao', 'ReferenceError: window is not defined'), 'api_navegador/ambiente');
    assert.strictEqual(cat('erro_execucao', 'ReferenceError: self is not defined'), 'api_navegador/ambiente');
    assert.strictEqual(cat('erro_execucao', 'ReferenceError: Audio is not defined'), 'api_navegador/ambiente');
    assert.strictEqual(cat('erro_execucao', 'ReferenceError: _ is not defined'), 'global_ausente/ambiente');
    assert.strictEqual(cat('erro_execucao', 'ReferenceError: primordials is not defined'), 'node_incompativel/ambiente');
    assert.strictEqual(cat('erro_execucao', "Error: EROFS: read-only file system, mkdir '/work/coverage'"), 'somente_leitura/ambiente');
    assert.strictEqual(cat('erro_execucao', 'SyntaxError: Illegal continue statement: no surrounding iteration statement'), 'codigo_invalido/projeto');
    assert.strictEqual(cat('erro_execucao', "TypeError: Cannot read properties of undefined (reading 'set')\n    at Object.<anonymous> (/work/lib/types/document.js:36:33)"), 'erro_do_programa/projeto');
    // nodemon chamando util.error (removido do Node): o callFun do Jalangi2 só repassa a chamada do programa
    assert.strictEqual(cat('sem_relatorio', 'TypeError: Function.prototype.apply was called on undefined\n    at callFun (/app/src/js/runtime/analysis.js:193:51)\n    at invokeFun (/app/src/js/runtime/analysis.js:214:22)\n    at process.<anonymous> (/work/nodemon.js:932:92)'), 'erro_do_programa/projeto');
    assert.strictEqual(cat('erro_execucao', "TypeError: Cannot read properties of undefined (reading 'ajax')\n    at Object.G (/app/src/js/runtime/analysis.js:327:23)\n    at Object.<anonymous> (/work/backbone.js:2658:103)"), 'erro_do_programa/projeto');
    assert.strictEqual(cat('erro_execucao', "TypeError: x is undefined\n    at Object.endExecution (/app/experiments/analyses/analysis_dataflow.js:700:3)"), 'possivel_jalangi/ferramenta');
    assert.strictEqual(cat('sem_relatorio', 'nada reconhecível'), 'sem_relatorio/ferramenta');
});

const asyncTests = [];
const atest = (name, fn) => asyncTests.push([name, fn]);

// --- Modo testes ---
const { testCommand } = require('./lib/test-command');

test('comando de testes: tira lint e navegador, une o resto com ;', () => {
    const t = script => testCommand({ scripts: { test: script } });
    assert.deepStrictEqual(t('make test'), { command: 'make test', dropped: [] });
    assert.strictEqual(t('npm run-script lint && nodeunit test/test-async.js').command, 'nodeunit test/test-async.js');
    assert.strictEqual(t('npm run lint && node node_modules/.bin/taper tests/test-*.js && npm run test-browser').command, 'node node_modules/.bin/taper tests/test-*.js');
    assert.strictEqual(t('standard && node ./bin/test.js').command, 'node ./bin/test.js');
    assert.strictEqual(t('./node_modules/karma/bin/karma start && coffee test/model.coffee').command, 'coffee test/model.coffee');
    assert.strictEqual(t('node ./bin/cmd.js && tape test/*.js').command, 'node ./bin/cmd.js ; tape test/*.js');
    assert.strictEqual(t('phantomjs test/vendor/runner.js test/index.html').command, null);
    assert.strictEqual(t('echo "Error: no test specified" && exit 1').command, null);
    assert.strictEqual(testCommand({}).command, null);
    assert.strictEqual(testCommand(null).command, null);
    // mocha → _mocha (o bin/mocha 1.x perde a saída no Node atual); _mocha e "mocha-test" ficam como estão
    assert.strictEqual(t('set X=1 && mocha --async-only test/*.test.js').command, 'set X=1 ; _mocha --async-only test/*.test.js');
    assert.strictEqual(t('./node_modules/.bin/mocha -R spec').command, './node_modules/.bin/_mocha -R spec');
    assert.strictEqual(t('node_modules/mocha/bin/_mocha --timeout 20000').command, 'node_modules/mocha/bin/_mocha --timeout 20000');
    assert.strictEqual(t('npm run mocha-test').command, 'npm run mocha-test');
});

test('modo híbrido: testes quando carregaram o alvo, senão o arquivo', () => {
    assert.strictEqual(chooseHybrid('ok', 'ok', true), 'testes');
    assert.strictEqual(chooseHybrid('ok', 'timeout', true), 'testes');
    assert.strictEqual(chooseHybrid('ok', 'timeout', false), 'arquivo');
    assert.strictEqual(chooseHybrid('ok', 'sem_testes', false), 'arquivo');
    assert.strictEqual(chooseHybrid('erro_execucao', 'alvo_nao_carregado', false), 'arquivo');
});

test('categoria do erro: API removida do Node e serviço externo', () => {
    const cat = out => errorCategory('erro_execucao', out).categoria;
    assert.strictEqual(cat("TypeError: Cannot read properties of undefined (reading 'unshift')\n    require.paths.unshift(arg);"), 'node_incompativel');
    assert.strictEqual(cat('Error: connect ECONNREFUSED 127.0.0.1:27017'), 'servico_externo');
    assert.strictEqual(errorCategory('alvo_nao_carregado', 'MongoNetworkError: failed to connect to server').categoria, 'servico_externo');
});

test('modo testes: classificação e linha TESTES', () => {
    const info = parseTestLine('saída dos testes\nTESTES {"processos_com_alvo":2,"codigo_testes":1,"timeout":false}\n');
    assert.deepStrictEqual(info, { processos_com_alvo: 2, codigo_testes: 1, timeout: false });
    assert.strictEqual(parseTestLine('nada'), null);
    // testes falhando (código 1) com relatório: ok
    assert.strictEqual(classifyTestRun({ exitCode: 1, output: '', hasReport: true, info }), 'ok');
    assert.strictEqual(classifyTestRun({ exitCode: 0, output: '', hasReport: false, info: { ...info, processos_com_alvo: 0 } }), 'alvo_nao_carregado');
    assert.strictEqual(classifyTestRun({ exitCode: 124, output: '', hasReport: true, info: { ...info, timeout: true } }), 'timeout');
    assert.strictEqual(classifyTestRun({ exitCode: 3, output: 'ERRO_INSTRUMENTACAO: x', hasReport: false, info }), 'erro_instrumentacao');
    assert.strictEqual(classifyTestRun({ exitCode: 137, output: '', hasReport: false, info: null }), 'morto_memoria_ou_tempo');
    // alvo não carregado: só falha de ambiente explica; erro de teste qualquer não vira erro do programa
    const cat = out => errorCategory('alvo_nao_carregado', out).categoria;
    assert.strictEqual(cat("Error: Cannot find module 'should'"), 'dependencia_ausente');
    assert.strictEqual(cat('AssertionError: expected 1 to equal 2\n    at Context.<anonymous> (/work/test/a.js:3:9)'), 'testes_nao_carregam_alvo');
    assert.strictEqual(errorCategory('sem_testes', '').origem, 'projeto');
});

// Ponta a ponta, sem Docker: a suíte de um projeto de brinquedo carrega o alvo em dois processos
// (um direto, outro por um processo neto) e os relatórios saem unidos num só.
atest('modo testes: hook em cada processo e relatórios unidos (L num processo, R no outro)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-tests-'));
    try {
        fs.mkdirSync(path.join(dir, 'test'));
        fs.writeFileSync(path.join(dir, 'lib.js'), [
            'exports.a = function () {',
            '    var x = 1;',          // 2: L
            '    return x;',
            '};',
            'exports.b = function () {',
            '    var y = 2;',          // 6: R
            '    return y;',
            '};'].join('\n') + '\n');
        fs.writeFileSync(path.join(dir, 'test', 'a.js'), "require('../lib').a();\n");
        fs.writeFileSync(path.join(dir, 'test', 'b.js'),
            "var r = require('child_process').spawnSync(process.execPath, ['-e', \"require('./lib').b()\"], { stdio: 'inherit' });\nprocess.exit(r.status);\n");
        fs.writeFileSync(path.join(dir, 'test', 'outro.js'), "console.log('não carrega o alvo'); process.exit(1);\n");
        const map = path.join(dir, 'map.json');
        fs.writeFileSync(map, JSON.stringify({ files: { 'lib.js': { L: [2], R: [6] } } }));
        const out = path.join(dir, 'report.json');
        const r = require('child_process').spawnSync(process.execPath,
            [path.join(__dirname, 'lib', 'run-tests.js'), path.join(dir, 'lib.js'), '60', out, 'node test/a.js ; node test/outro.js ; node test/b.js'],
            { cwd: dir, encoding: 'utf-8', env: { ...process.env, BRANCH_MAP_FILE: map, BRANCH_MAP_ROOT: dir } });
        const info = parseTestLine(r.stdout);
        assert.ok(info, 'sem linha TESTES:\n' + r.stdout + r.stderr);
        assert.strictEqual(info.processos_com_alvo, 2);
        assert.strictEqual(info.timeout, false);
        assert.ok(!/ESCRITA|RELATÓRIO FINAL/.test(r.stdout), 'ANALYSIS_QUIET deveria calar a análise');
        const report = JSON.parse(fs.readFileSync(out, 'utf-8'));
        const cov = coverageNumbers(report);
        assert.strictEqual(cov.L.executed, 1);
        assert.strictEqual(cov.R.executed, 1);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});


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
