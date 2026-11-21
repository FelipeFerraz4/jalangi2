// Lançador do Jalangi2 para merges reais (Fase 2). Diferenças em relação a src/js/commands/jalangi.js:
//   - instrumenta SÓ o arquivo alvo; node_modules e os demais arquivos do projeto rodam sem instrumentação
//     (rápido, e as dependências não geram ruído nem exigem ES5);
//   - não grava nada em disco (o jalangi.js escreve *_jalangi_.js ao lado de cada fonte), então a pasta do
//     projeto pode ficar montada somente para leitura;
//   - ao receber SIGTERM (timeout) encerra com código 124 pelo caminho normal, para a análise ainda gravar
//     o relatório parcial (o que foi executado até ali).
// Uso: node launcher.js <arquivo-alvo.js>     (variáveis BRANCH_MAP_FILE, BRANCH_MAP_ROOT, ANALYSIS_REPORT...)
const path = require('path');
const Module = require('module');
const { setup } = require('./jalangi-setup');

const target = path.resolve(process.argv[2] || '');
if (!process.argv[2]) { console.error('uso: launcher.js <arquivo-alvo.js>'); process.exit(2); }

setup(target, {
    onError: msg => {
        console.error('ERRO_INSTRUMENTACAO: ' + msg);
        process.exit(3);
    }
});

process.on('SIGTERM', () => process.exit(124));
process.on('exit', () => { J$.endExecution(); });
process.argv = [process.argv[0], target];

function start() { Module.Module.runMain(target, null, true); }
if (J$.analysis && J$.analysis.onReady) J$.analysis.onReady(start); else start();
