// Carregado em CADA processo Node da suíte de testes (NODE_OPTIONS=--require .../hook.js), modo `testes`.
// Instrumenta só o alvo (WILD_TARGET) e, se o processo carregou o alvo, grava o próprio relatório em
// WILD_REPORTS/<pid>-<tempo>.json ao sair. run-tests.js junta os relatórios depois (merge-reports.js).
// Processos que não carregam o alvo (npm, make chamando node, o runner) não gravam nada.
// O Jalangi2 não aceitar o alvo vira o arquivo WILD_REPORTS/ERRO_INSTRUMENTACAO.txt; o processo segue sem instrumentar.
const fs = require('fs');
const path = require('path');
const { setup } = require('./jalangi-setup');

const target = path.resolve(process.env.WILD_TARGET || '');
const reports = process.env.WILD_REPORTS;
let loaded = false;

if (process.env.WILD_TARGET && reports) {
    setup(target, {
        onLoaded: () => { loaded = true; },
        onError: msg => { try { fs.writeFileSync(path.join(reports, 'ERRO_INSTRUMENTACAO.txt'), msg + '\n'); } catch (e) { } }
    });
    let written = false;
    const write = () => {
        if (written || !loaded) return;
        written = true;
        process.env.ANALYSIS_REPORT = path.join(reports, `${process.pid}-${Date.now()}.json`);
        try { J$.endExecution(); } catch (e) { }
    };
    process.on('exit', write);
    // No timeout, run-tests.js manda SIGTERM ao grupo: grava o relatório parcial e sai. Só instala o tratador
    // se o programa não tiver o seu (instalar um muda o comportamento padrão de sair no SIGTERM).
    process.once('SIGTERM', () => { if (process.listenerCount('SIGTERM') === 0) { write(); process.exit(143); } });
}
