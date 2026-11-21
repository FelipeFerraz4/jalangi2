// Carrega o Jalangi2 com a análise (ChainedAnalyses + SMemory + analysis_dataflow) e instala o gancho de
// require que instrumenta UM arquivo, o alvo. Os demais arquivos do projeto e o node_modules rodam sem
// instrumentação, e nada é gravado em disco (a pasta do projeto pode ser somente leitura).
// Usado por launcher.js (roda o arquivo alvo) e por hook.js (carregado em cada processo da suíte de testes).
const fs = require('fs');
const path = require('path');
const Module = require('module');

const root = path.resolve(__dirname, '..', '..', '..');

// onLoaded(): chamado quando o alvo é instrumentado. onError(msg): o Jalangi2 não aceitou a sintaxe do alvo.
function setup(target, { onLoaded = () => { }, onError } = {}) {
    global.J$ = global.J$ || {};
    global.acorn = require('acorn');
    global.esotope = require('esotope');
    require(path.join(root, 'src/js/headers')).headerSources.forEach(h => require(path.join(root, h)));
    J$.initParams = {};
    ['src/js/sample_analyses/ChainedAnalyses.js', 'src/js/runtime/SMemory.js', 'experiments/analyses/analysis_dataflow.js']
        .forEach(a => require(path.join(root, a)));

    const originalLoader = Module._extensions['.js'];
    Module._extensions['.js'] = function (module, filename) {
        if (path.resolve(filename) !== target) return originalLoader(module, filename);
        const code = fs.readFileSync(filename, 'utf8');
        let inst;
        try {
            inst = J$.instrumentCode({
                code, isEval: false, origCodeFileName: filename,
                instCodeFileName: filename.replace(/\.js$/, '_jalangi_.js'),
                inlineSourceMap: true, inlineSource: true
            });
        } catch (e) {
            onError(String(e && e.message || e).split('\n')[0]);
            return originalLoader(module, filename);
        }
        onLoaded();
        module._compile(inst.code, filename);
    };
}

module.exports = { setup };
