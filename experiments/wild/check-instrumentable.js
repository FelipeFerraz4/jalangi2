// ==============================================================================
// VERIFICA SE O JALANGI2 CONSEGUE INSTRUMENTAR UM ARQUIVO (sem executá-lo)
// ==============================================================================
// O Jalangi2 só entende ES5.1. Com sintaxe mais nova a falha aparece de dois jeitos: o código
// instrumentado fica inválido e o Node não o compila (arrow functions, por exemplo), ou ele compila
// e quebra ao executar (const/let, pela zona morta temporal). Este teste cobre o primeiro: instrumenta
// e COMPILA a saída, sem executá-la. É um limite superior: um arquivo aprovado ainda pode falhar na
// execução. Os arquivos são dados de terceiros: só são lidos e compilados, nunca executados.
//
// Uso: node experiments/wild/check-instrumentable.js <arquivo.js>...   (uma linha JSON por arquivo)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..', '..');
let ready = false;

// Mesma preparação que src/js/commands/jalangi.js faz antes de instrumentar
function prepare() {
    if (ready) return;
    global.J$ = global.J$ || {};
    global.acorn = require('acorn');
    global.esotope = require('esotope');
    require(path.join(root, 'src/js/headers')).headerSources.forEach(h => require(path.join(root, h)));
    const instUtil = require(path.join(root, 'src/js/instrument/instUtil'));
    if (instUtil.setHeaders) instUtil.setHeaders();
    ready = true;
}

function checkFile(file) {
    prepare();
    let code;
    try {
        code = fs.readFileSync(file, 'utf-8');
    } catch (e) {
        return { file, ok: false, error: 'leitura: ' + e.message };
    }
    try {
        const instrumented = J$.instrumentCode({
            code, isEval: false, origCodeFileName: file, instCodeFileName: file.replace(/\.js$/, '_jalangi_.js'),
            inlineSourceMap: true, inlineSource: true
        });
        new vm.Script(instrumented.code, { filename: file });   // só compila
        return { file, ok: true };
    } catch (e) {
        return { file, ok: false, error: String(e && e.message || e).split('\n')[0].slice(0, 160) };
    }
}

module.exports = { checkFile };

if (require.main === module) {
    for (const file of process.argv.slice(2)) console.log(JSON.stringify(checkFile(file)));
}
