// Fase 2: executa a análise (OA, DF e CF) em amostras reais, cada uma em contêiner isolado.
//
// Por merge: extrai o commit (git archive, sem checkout), instala as dependências em um contêiner COM rede
// mas SEM scripts (npm --ignore-scripts) e depois roda cada arquivo alterado em um contêiner SEM rede,
// com a pasta do projeto somente leitura, usuário comum, sem capabilities e com limites de memória, CPU,
// processos e tempo. Grava, por amostra, meta.json + report.json + saida.txt e, no fim, resultados.csv
// conflitos.csv e resumo_projetos.csv (separador ';' e BOM: abrem direto no Excel em português).
//
// Uso:
//   node experiments/wild/run-wild.js --run <nome> --manifest <manifesto.csv> --maps <pasta dos mapas: contém por-merge/> --repos <pasta>
//        --out <pasta execucoes> [--project <nome>]... [--limit-merges N] [--timeout 60] [--install-timeout 300]
//        [--force] [--keep-work] [--image jalangi2-wild] [--consolidate-only] [--mode arquivo|testes]
// --mode arquivo (padrão): o ponto de entrada é o próprio arquivo alterado (só o código de topo executa).
// --mode testes: roda o scripts.test do projeto (sem lint nem testes de navegador) com o hook do Jalangi2 em cada
//   processo Node; a pasta do projeto fica gravável (os testes escrevem nela), 2 GB, 2 CPUs; timeout padrão 300 s.
//   Sem scripts.test utilizável, a amostra fica `sem_testes`.
// --consolidate-only: não executa nada, só regrava os CSVs a partir do que já está em amostras/.
// Retomável: amostra que já tem meta.json é pulada (use --force para refazer).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { readCsv, formatCsv } = require('./lib/csv');
const { testCommand } = require('./lib/test-command');
const { classifyRun, classifyTestRun, parseTestLine, firstError, errorCategory, COLUMNS, resultRow, CONFLICT_COLUMNS, conflictRows, SUMMARY_COLUMNS, summaryRows } = require('./lib/results');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i === -1 ? def : args[i + 1]; };
const optAll = name => args.flatMap((a, i) => a === name ? [args[i + 1]] : []);
const flag = name => args.includes(name);

const NAME = opt('--run');
const MANIFEST = opt('--manifest'), MAPS = opt('--maps'), REPOS = opt('--repos'), OUT = opt('--out');
if (!NAME || !MANIFEST || !MAPS || !REPOS || !OUT) {
    console.error('uso: run-wild.js --run <nome> --manifest <csv> --maps <pasta> --repos <pasta> --out <pasta> [--project <nome>]... [--limit-merges N] [--timeout 60] [--install-timeout 300] [--force] [--keep-work] [--image jalangi2-wild]');
    process.exit(2);
}
const IMAGE = opt('--image', 'jalangi2-wild');
const MODE = opt('--mode', 'arquivo');
if (!['arquivo', 'testes'].includes(MODE)) { console.error('--mode deve ser arquivo ou testes'); process.exit(2); }
const RUN_TIMEOUT = parseInt(opt('--timeout', MODE === 'testes' ? '300' : '60'), 10);
const INSTALL_TIMEOUT = parseInt(opt('--install-timeout', '300'), 10);
const RUN_DIR = path.join(OUT, NAME);
const WORK = path.join(RUN_DIR, 'work');
const NPM_CACHE = path.join(OUT, 'npm-cache');
const uid = process.getuid(), gid = process.getgid();

// Opções comuns de isolamento
const HARDEN = ['--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--user', `${uid}:${gid}`];

function docker(dockerArgs, timeoutSec, name) {
    const started = Date.now();
    const r = spawnSync('docker', dockerArgs, { encoding: 'utf-8', timeout: (timeoutSec + 20) * 1000, maxBuffer: 64 * 1024 * 1024 });
    const timedOut = r.error && r.error.code === 'ETIMEDOUT';
    if (timedOut && name) spawnSync('docker', ['rm', '-f', name]);
    return { exitCode: timedOut ? 124 : r.status, output: (r.stdout || '') + (r.stderr || ''), seconds: Math.round((Date.now() - started) / 100) / 10, timedOut };
}

// Extrai o commit do merge para uma pasta nova (git archive: sem hooks, sem checkout, sem tocar o clone)
function extract(project, commit, dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const archive = spawnSync('git', ['-C', path.join(REPOS, project), 'archive', commit], { maxBuffer: 1024 * 1024 * 1024 });
    if (archive.status !== 0) return false;
    return spawnSync('tar', ['-x', '-C', dir], { input: archive.stdout }).status === 0;
}

function install(dir, tag) {
    if (!fs.existsSync(path.join(dir, 'package.json'))) return { status: 'sem_package_json', seconds: 0 };
    fs.mkdirSync(NPM_CACHE, { recursive: true });
    const name = `wild-install-${tag}`;
    const r = docker(['run', '--rm', '--name', name, ...HARDEN, '--pids-limit', '256', '--memory', '2g', '--memory-swap', '2g', '--cpus', '2',
        '-v', `${dir}:/work`, '-v', `${NPM_CACHE}:/npm-cache`, '-w', '/work', '-e', 'HOME=/tmp', '-e', 'npm_config_cache=/npm-cache', '--tmpfs', '/tmp',
        IMAGE, 'timeout', '-s', 'KILL', String(INSTALL_TIMEOUT), 'npm', 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--legacy-peer-deps', '--loglevel=error'], INSTALL_TIMEOUT, name);
    const status = r.timedOut || r.exitCode === 137 ? 'timeout' : r.exitCode === 0 ? 'ok' : 'falhou';
    return { status, seconds: r.seconds, detail: status === 'ok' ? '' : r.output.split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 300) };
}

function runSample(sample, dir, outDir) {
    // O mapa precisa existir como arquivo: com -v, o Docker cria uma pasta (do root) no lugar de um arquivo ausente
    const mapFile = path.resolve(MAPS, 'por-merge', sample.map_file);
    if (!sample.map_file || !fs.statSync(mapFile, { throwIfNoEntry: false })?.isFile()) {
        return { report: null, run: { status: 'sem_mapa', error: 'mapa do merge não encontrado: ' + sample.map_file } };
    }
    fs.mkdirSync(outDir, { recursive: true });
    fs.chmodSync(outDir, 0o777);
    const name = `wild-run-${sample.sample_id.slice(0, 12)}`;
    const common = ['run', '--rm', '--name', name, ...HARDEN, '--network', 'none', '--read-only',
        '-v', `${mapFile}:/maps/map.json:ro`, '-v', `${outDir}:/out`,
        '-e', 'BRANCH_MAP_FILE=/maps/map.json', '-e', 'BRANCH_MAP_ROOT=/work', '-w', '/work'];
    let r, extra = {};
    if (MODE === 'testes') {
        let pkg = null;
        try { pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')); } catch (e) { }
        const tc = testCommand(pkg);
        extra = { mode: 'testes', testCommand: tc.command || '', droppedSteps: tc.dropped };
        if (!tc.command) return { report: null, run: { status: 'sem_testes', error: pkg ? 'sem scripts.test utilizável' : 'package.json ausente ou inválido', ...extra } };
        r = docker([...common, '--memory', '2g', '--memory-swap', '2g', '--cpus', '2', '--pids-limit', '512', '--tmpfs', '/tmp:exec',
            '-v', `${dir}:/work`, '-e', 'HOME=/tmp', IMAGE,
            'node', '/app/experiments/wild/lib/run-tests.js', '/work/' + sample.file_path, String(RUN_TIMEOUT), '/out/report.json', tc.command], RUN_TIMEOUT + 15, name);
    } else {
        extra = { mode: 'arquivo' };
        r = docker([...common, '--memory', '1g', '--memory-swap', '1g', '--cpus', '1', '--pids-limit', '256', '--tmpfs', '/tmp',
            '-v', `${dir}:/work:ro`, '-e', 'ANALYSIS_REPORT=/out/report.json', '-e', 'ANALYSIS_DETAIL=1',
            IMAGE, 'timeout', '-s', 'TERM', String(RUN_TIMEOUT), 'node', '/app/experiments/wild/lib/launcher.js', '/work/' + sample.file_path], RUN_TIMEOUT, name);
    }
    let report = null;
    try { report = JSON.parse(fs.readFileSync(path.join(outDir, 'report.json'), 'utf-8')); } catch (e) { }
    fs.writeFileSync(path.join(outDir, 'saida.txt'), r.output.length > 400000 ? r.output.slice(0, 200000) + '\n[...truncado...]\n' + r.output.slice(-200000) : r.output);
    let status;
    if (MODE === 'testes') {
        const info = parseTestLine(r.output);
        extra.testExit = info ? info.codigo_testes : '';
        extra.processes = info ? info.processos_com_alvo : '';
        status = classifyTestRun({ exitCode: r.exitCode, output: r.output, hasReport: !!report, info });
    } else {
        status = classifyRun({ exitCode: r.exitCode, output: r.output, hasReport: !!report });
    }
    return { report, run: { status, exitCode: r.exitCode, seconds: r.seconds, error: status === 'ok' ? '' : firstError(r.output), ...extra } };
}

function main() {
    const only = optAll('--project');
    const limitMerges = parseInt(opt('--limit-merges', '0'), 10);
    const samples = readCsv(MANIFEST).filter(s => !only.length || only.includes(s.project));
    const byMerge = new Map();
    for (const s of samples) {
        const key = s.project + '#' + s.merge_commit;
        if (!byMerge.has(key)) byMerge.set(key, []);
        byMerge.get(key).push(s);
    }
    let merges = [...byMerge.values()];
    if (limitMerges) merges = merges.slice(0, limitMerges);
    fs.mkdirSync(path.join(RUN_DIR, 'amostras'), { recursive: true });
    if (flag('--consolidate-only')) return consolidate(samples);

    let done = 0;
    for (const group of merges) {
        const { project, merge_commit } = group[0];
        const tag = merge_commit.slice(0, 12);
        const pending = group.filter(s => flag('--force') || !fs.existsSync(path.join(RUN_DIR, 'amostras', s.sample_id, 'meta.json')));
        const runnable = pending.filter(s => s.instrumentable === 'true');
        for (const s of pending.filter(s => s.instrumentable !== 'true')) {
            writeMeta(s, { sample: s, install: null, run: { status: 'nao_instrumentavel', error: s.instrument_error } });
        }
        if (runnable.length) {
            const dir = path.join(WORK, tag);
            let inst = { status: 'sem_checkout', seconds: 0 };
            if (extract(project, merge_commit, dir)) inst = install(dir, tag);
            for (const s of runnable) {
                let result = { report: null, run: { status: 'sem_checkout', error: 'git archive falhou' } };
                if (inst.status !== 'sem_checkout') result = runSample(s, dir, path.join(RUN_DIR, 'amostras', s.sample_id));
                writeMeta(s, { sample: s, install: inst, installDetail: inst.detail, run: result.run, report: result.report });
                const c = result.report ? result.report.counts : null;
                console.error(`[${++done}] ${project} ${tag} ${s.file_path}: ${result.run.status}${c ? ` OA ${c.oa} DF ${c.df.total} CF ${c.cf.total}` : ''}`);
            }
            if (!flag('--keep-work')) fs.rmSync(dir, { recursive: true, force: true });
        }
    }
    consolidate(samples);
}

function writeMeta(sample, meta) {
    const dir = path.join(RUN_DIR, 'amostras', sample.sample_id);
    fs.mkdirSync(dir, { recursive: true });
    meta.outputDir = path.relative(RUN_DIR, dir);
    const { report, ...rest } = meta;
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(rest, null, 1) + '\n');
}

// Junta o que existe em amostras/ (de todas as execuções desta pasta, não só a atual) nos CSVs.
// A categoria do erro é recalculada aqui, a partir do saida.txt, para valer também para amostras já executadas.
function consolidate(samples) {
    const rows = [COLUMNS], conflicts = [CONFLICT_COLUMNS], counts = {};
    for (const s of samples) {
        const dir = path.join(RUN_DIR, 'amostras', s.sample_id);
        let meta;
        try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf-8')); } catch (e) { continue; }
        let report = null;
        try { report = JSON.parse(fs.readFileSync(path.join(dir, 'report.json'), 'utf-8')); } catch (e) { }
        meta.report = report;
        let output = meta.run.error || '';
        try { output = fs.readFileSync(path.join(dir, 'saida.txt'), 'utf-8'); } catch (e) { }
        meta.category = errorCategory(meta.run.status, output);
        rows.push(resultRow(meta));
        conflicts.push(...conflictRows(s, report));
        counts[meta.run.status] = (counts[meta.run.status] || 0) + 1;
    }
    const BOM = '﻿';
    fs.writeFileSync(path.join(RUN_DIR, 'resultados.csv'), BOM + formatCsv(rows, ';'));
    fs.writeFileSync(path.join(RUN_DIR, 'conflitos.csv'), BOM + formatCsv(conflicts, ';'));
    fs.writeFileSync(path.join(RUN_DIR, 'resumo_projetos.csv'), BOM + formatCsv([SUMMARY_COLUMNS, ...summaryRows(rows.slice(1))], ';'));
    fs.writeFileSync(path.join(RUN_DIR, 'resumo.json'), JSON.stringify({ amostras: rows.length - 1, conflitos: conflicts.length - 1, execucao: counts }, null, 1) + '\n');
    console.log(JSON.stringify({ amostras: rows.length - 1, conflitos: conflicts.length - 1, execucao: counts }, null, 1));
    console.log('→ ' + path.join(RUN_DIR, 'resultados.csv'));
}

main();
