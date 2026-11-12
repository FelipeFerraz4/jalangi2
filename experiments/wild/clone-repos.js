// Fase 1: clona cada projeto do manifesto em <repos>/<projeto> e confere, para cada amostra, que o arquivo
// no commit do merge é idêntico ao merge.js do pacote da coleta. Escreve <out>/checkout.csv e checkout_resumo.json.
//
// Uso: node experiments/wild/clone-repos.js --dataset <Newminerjs> --manifest <manifesto.csv> --repos <pasta> --out <pasta>
//        [--project <nome>]... [--jobs 4] [--update]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { readCsv, formatCsv } = require('./lib/csv');
const { ensureClone, verifyFile, sha256 } = require('./lib/git-sync');

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1]; };
const optAll = name => args.flatMap((a, i) => a === name ? [args[i + 1]] : []);

// sha256 do merge.js de cada amostra do projeto, lido do zip da coleta
function expectedHashes(dataset, project) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-clone-'));
    try {
        execFileSync('unzip', ['-q', '-o', path.join(dataset, 'versoes', project + '.zip'), '-d', tmp, '*/merge.js'], { stdio: ['ignore', 'ignore', 'pipe'] });
        const out = {};
        for (const id of fs.readdirSync(tmp)) out[id] = sha256(fs.readFileSync(path.join(tmp, id, 'merge.js')));
        return out;
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

async function main() {
    const dataset = opt('--dataset'), manifestFile = opt('--manifest'), repos = opt('--repos'), outDir = opt('--out');
    if (!dataset || !manifestFile || !repos || !outDir) {
        console.error('uso: clone-repos.js --dataset <Newminerjs> --manifest <manifesto.csv> --repos <pasta> --out <pasta> [--project <nome>]... [--jobs N] [--update]');
        process.exit(2);
    }
    const jobs = parseInt(opt('--jobs') || '4', 10);
    const only = optAll('--project');
    const samples = readCsv(manifestFile).filter(s => !only.length || only.includes(s.project));

    const byProject = new Map();
    for (const s of samples) { if (!byProject.has(s.project)) byProject.set(s.project, []); byProject.get(s.project).push(s); }
    const projects = [...byProject.keys()];

    // 1) clonagem em paralelo (limitada)
    const cloneResult = {};
    let next = 0, done = 0;
    await Promise.all(Array.from({ length: Math.min(jobs, projects.length) }, async () => {
        while (next < projects.length) {
            const project = projects[next++];
            const url = byProject.get(project)[0].repo_url;
            const r = await ensureClone(url, path.join(repos, project), { update: args.includes('--update') });
            cloneResult[project] = r;
            console.error(`[${++done}/${projects.length}] ${project}: ${r.ok ? r.action : 'FALHOU (' + r.error + ')'}`);
        }
    }));

    // 2) conferência de cada amostra
    const rows = [['sample_id', 'project', 'merge_commit', 'file_path', 'status', 'detail']];
    const counts = {}, perProject = {};
    for (const project of projects) {
        const expected = expectedHashes(dataset, project);
        for (const s of byProject.get(project)) {
            let status, detail = '';
            if (!cloneResult[project].ok) { status = 'repositorio_indisponivel'; detail = cloneResult[project].error; }
            else if (!expected[s.sample_id]) { status = 'sem_merge_js_no_pacote'; }
            else {
                const v = verifyFile(path.join(repos, project), s.merge_commit, s.file_path, expected[s.sample_id]);
                status = v.status;
            }
            rows.push([s.sample_id, project, s.merge_commit, s.file_path, status, detail]);
            counts[status] = (counts[status] || 0) + 1;
            perProject[project] = perProject[project] || {};
            perProject[project][status] = (perProject[project][status] || 0) + 1;
        }
    }
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'checkout.csv'), formatCsv(rows));
    fs.writeFileSync(path.join(outDir, 'checkout_resumo.json'), JSON.stringify({ samples: samples.length, projects: projects.length, counts, perProject }, null, 1) + '\n');
    console.log(JSON.stringify({ samples: samples.length, projects: projects.length, counts }, null, 1));
}

main().catch(e => { console.error(e); process.exit(1); });
