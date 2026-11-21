// Modo `testes` (dentro do contêiner): roda a suíte de testes do projeto com o hook em cada processo Node e
// junta os relatórios dos processos que carregaram o alvo num só (merge-reports.js).
// Uso: node run-tests.js <arquivo-alvo> <timeout-s> <relatorio-final.json> <comando>
// Saída: código 124 se estourou o tempo; senão, o código do comando de testes. Uma linha "TESTES {json}" no fim
// diz quantos processos carregaram o alvo, o código dos testes e se houve erro de instrumentação.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { mergeReports } = require('../../tools/merge-reports');

const [target, timeoutArg, out, command] = process.argv.slice(2);
const timeoutSec = parseInt(timeoutArg, 10);
const reports = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-reports-'));
fs.chmodSync(reports, 0o777);
const hook = path.join(__dirname, 'hook.js');

const env = {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --require "${hook}"`.trim(),  // aspas: caminho com espaços
    WILD_TARGET: path.resolve(target), WILD_REPORTS: reports, ANALYSIS_QUIET: '1',
    PATH: `${path.resolve('node_modules/.bin')}:${process.env.PATH}`,
    CI: '1', NODE_ENV: 'test'
};
delete env.ANALYSIS_REPORT;
delete env.ANALYSIS_DETAIL;

// Grupo de processos próprio (detached), para o timeout alcançar os netos (make → node, npm → mocha...)
const child = spawn('sh', ['-c', command], { env, stdio: 'inherit', detached: true });
let timedOut = false;
const killGroup = signal => { try { process.kill(-child.pid, signal); } catch (e) { } };
const timer = setTimeout(() => {
    timedOut = true;
    killGroup('SIGTERM');
    setTimeout(() => killGroup('SIGKILL'), 10000).unref();
}, timeoutSec * 1000);
process.on('SIGTERM', () => { timedOut = true; killGroup('SIGTERM'); });

child.on('exit', code => {
    clearTimeout(timer);
    // Processos que ficaram para trás no grupo (servidores, watchers) também recebem TERM e um instante para gravar
    killGroup('SIGTERM');
    setTimeout(() => { killGroup('SIGKILL'); finish(code); }, 1500);
});

function finish(code) {
    const files = fs.readdirSync(reports).filter(f => f.endsWith('.json'));
    const parsed = [];
    for (const f of files) {
        try { parsed.push(JSON.parse(fs.readFileSync(path.join(reports, f), 'utf-8'))); } catch (e) { }
    }
    let instrumentError = '';
    try { instrumentError = fs.readFileSync(path.join(reports, 'ERRO_INSTRUMENTACAO.txt'), 'utf-8').trim(); } catch (e) { }
    if (parsed.length) fs.writeFileSync(out, JSON.stringify(mergeReports(parsed), null, 1) + '\n');
    if (instrumentError) console.error('ERRO_INSTRUMENTACAO: ' + instrumentError);
    const testExit = code === null ? 'sinal' : code;
    console.log('TESTES ' + JSON.stringify({ processos_com_alvo: parsed.length, relatorios_ilegiveis: files.length - parsed.length, codigo_testes: testExit, timeout: timedOut }));
    process.exit(timedOut ? 124 : instrumentError && !parsed.length ? 3 : (typeof code === 'number' ? code : 1));
}
