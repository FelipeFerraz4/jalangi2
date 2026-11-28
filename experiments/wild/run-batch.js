// Lote completo da Fase 2: todas as amostras do manifesto, no modo híbrido, em N frentes paralelas.
// Os projetos são repartidos entre as frentes pelo número de amostras (o maior vai para a frente mais leve);
// cada frente é um run-wild.js com a sua lista de --project, todas gravando na mesma execução. No fim, uma
// consolidação junta tudo nos CSVs. Retomável como o run-wild.js: rodar de novo pula as amostras prontas.
//
// Uso: node experiments/wild/run-batch.js [--run lote] [--jobs 2] [--mode hibrido] [--timeout 180] [--project P]...
//   Pastas (experiments/lib/caminhos.js): manifesto e mapas em dados/coleta, clones em REPOS (dados/repos) e
//   saída em EXECUCOES (dados/execucoes). Logs: <EXECUCOES>/<run>.frente-<k>.log
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { readCsv } = require('./lib/csv');
const { acquireLock } = require('./lib/lock');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; };
const optAll = name => args.flatMap((a, i) => a === name ? [args[i + 1]] : []);

const C = require('../lib/caminhos');
const RUN = opt('--run', 'lote');
const JOBS = parseInt(opt('--jobs', '2'), 10);
const MODE = opt('--mode', 'hibrido');
const TIMEOUT = opt('--timeout', MODE === 'arquivo' ? '30' : '180');
const root = path.resolve(__dirname, '..', '..');
const manifest = C.MANIFESTO;
const common = ['experiments/wild/run-wild.js', '--run', RUN, '--manifest', manifest, '--maps', C.MAPAS,
    '--repos', C.REPOS, '--out', C.EXECUCOES, '--mode', MODE, '--timeout', TIMEOUT];

// Repartição gulosa: projetos do maior para o menor, cada um para a frente com menos amostras
function shards(samples, jobs, only) {
    const count = new Map();
    for (const s of samples) if (!only.length || only.includes(s.project)) count.set(s.project, (count.get(s.project) || 0) + 1);
    const out = Array.from({ length: jobs }, () => ({ projects: [], samples: 0 }));
    for (const [project, n] of [...count.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) {
        const lightest = out.reduce((a, b) => (b.samples < a.samples ? b : a));
        lightest.projects.push(project);
        lightest.samples += n;
    }
    return out.filter(s => s.projects.length);
}

function main() {
    fs.mkdirSync(C.EXECUCOES, { recursive: true });
    const owner = acquireLock(path.join(C.EXECUCOES, `${RUN}.lote.lock`));
    if (owner) {
        console.error(`já existe um lote "${RUN}" rodando (PID ${owner}); nada foi iniciado.`);
        process.exit(3);
    }
    const samples = readCsv(manifest);
    const only = optAll('--project');
    const plan = shards(samples, JOBS, only);
    const build = spawnSync('docker', ['build', '-q', '-f', 'experiments/wild/Dockerfile', '-t', 'jalangi2-wild', '.'], { cwd: root, stdio: 'inherit' });
    if (build.status !== 0) process.exit(build.status || 1);
    fs.mkdirSync(C.EXECUCOES, { recursive: true });

    let running = plan.length;
    const failed = [], children = [];
    plan.forEach((shard, k) => {
        const log = path.join(C.EXECUCOES, `${RUN}.frente-${k + 1}.log`);
        console.log(`frente ${k + 1}: ${shard.samples} amostras, ${shard.projects.length} projetos → ${log}`);
        const fd = fs.openSync(log, 'a');
        const child = spawn(process.execPath, [...common, ...shard.projects.flatMap(p => ['--project', p])], { cwd: root, stdio: ['ignore', fd, fd] });
        children.push(child);
        child.on('exit', code => {
            fs.closeSync(fd);
            console.log(`frente ${k + 1} terminou (código ${code})`);
            if (code !== 0) failed.push(k + 1);
            if (--running === 0) finish(failed, only);
        });
    });
    // Ctrl+C / TERM: encerra as frentes e os contêineres delas; o que já terminou fica salvo e a próxima execução retoma
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => {
        children.forEach(c => { try { c.kill('SIGTERM'); } catch (e) { } });
        const names = spawnSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf-8' }).stdout.split('\n').filter(n => /^wild-(run|install)-/.test(n));
        if (names.length) spawnSync('docker', ['rm', '-f', ...names]);
        console.log('interrompido: retome rodando o mesmo comando');
        process.exit(130);
    });
}

function finish(failed, only) {
    const projects = only.flatMap(p => ['--project', p]);
    const r = spawnSync(process.execPath, [...common, ...projects, '--consolidate-only'], { cwd: root, stdio: 'inherit' });
    if (failed.length) console.log(`frentes com erro: ${failed.join(', ')} (veja os logs; rodar de novo retoma)`);
    process.exit(failed.length || r.status ? 1 : 0);
}

module.exports = { shards };
if (require.main === module) main();
