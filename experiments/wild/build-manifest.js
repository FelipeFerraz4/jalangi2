// ==============================================================================
// MANIFESTO DE EXECUÇÃO EM MERGES REAIS
// ==============================================================================
// Junta, numa linha por arquivo a executar:
//   * o dataset de merges (project_cases.csv): URL, SHAs do merge, do ancestral e dos pais, data;
//   * o mapa L/R gerado por tools/line-map.js (mapa_linhas.csv e mapa_merges.csv);
//   * o teste de instrumentabilidade do Jalangi2 sobre o merge.js de cada amostra.
// Só entram as amostras analisáveis (com linhas de L e de R no mesmo arquivo).
//
// Uso:
//   node experiments/tools/line-map.js --versoes <dataset>/versoes --out-dir <maps>
//   node experiments/wild/build-manifest.js --dataset <dataset> --maps <maps> --out <saida>
// Saída: <saida>/manifesto.csv e <saida>/manifesto_resumo.json
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readCsv, formatCsv } = require('./lib/csv');
const { checkFile } = require('./check-instrumentable');

const COLUMNS = ['sample_id', 'project', 'repo_url', 'merge_commit', 'merge_date', 'ancestor_commit', 'left_commit',
    'right_commit', 'file_path', 'left_lines', 'right_lines', 'both_lines', 'map_file', 'instrumentable', 'instrument_error'];

function argument(name) {
    const i = process.argv.indexOf(name);
    return i === -1 ? undefined : process.argv[i + 1];
}

function main() {
    const dataset = argument('--dataset'), maps = argument('--maps'), out = argument('--out');
    if (!dataset || !maps || !out) {
        console.error('uso: build-manifest.js --dataset <pasta do dataset> --maps <saída do line-map> --out <pasta>');
        process.exit(2);
    }

    const cases = new Map();
    for (const c of readCsv(path.join(dataset, 'dataset', 'project_cases.csv'))) {
        cases.set([c.project, c['merge commit'], c['file path']].join('\0'), c);
    }
    const mergeMap = new Map();
    for (const m of readCsv(path.join(maps, 'mapa_merges.csv'))) mergeMap.set(m.project + '\0' + m.merge_commit, m.map_file);

    const samples = readCsv(path.join(maps, 'mapa_linhas.csv')).filter(s => s.status === 'ok');
    const byProject = new Map();
    for (const s of samples) {
        if (!byProject.has(s.project)) byProject.set(s.project, []);
        byProject.get(s.project).push(s);
    }

    const rows = [];
    const unmatched = [];
    for (const [project, list] of [...byProject.entries()].sort()) {
        // Os arquivos do ZIP são dados de terceiros: só são lidos e compilados, nunca executados
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wild-manifest-'));
        try {
            execFileSync('unzip', ['-q', '-o', path.join(dataset, 'versoes', project + '.zip'), '-d', tmp, '*/merge.js'], { stdio: ['ignore', 'ignore', 'pipe'] });
            for (const s of list) {
                const c = cases.get([s.project, s.merge_commit, s.file_path].join('\0'));
                if (!c) unmatched.push(s.sample_id);
                const check = checkFile(path.join(tmp, s.sample_id, 'merge.js'));
                rows.push([
                    s.sample_id, s.project, c ? c['repo url'] : '', s.merge_commit, c ? c['merge commit date'] : '',
                    c ? c['ancestor commit'] : '', c ? c['left parent commit'] : '', c ? c['right parent commit'] : '',
                    s.file_path, s.left_lines, s.right_lines, s.both_lines, mergeMap.get(project + '\0' + s.merge_commit) || '',
                    check.ok, check.ok ? '' : check.error
                ]);
            }
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
        console.error(`${project}: ${list.length} amostras`);
    }

    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'manifesto.csv'), formatCsv([COLUMNS, ...rows]));

    const instrumentable = rows.filter(r => r[13] === true || r[13] === 'true').length;
    const perProject = {};
    rows.forEach(r => {
        const p = perProject[r[1]] || (perProject[r[1]] = { samples: 0, instrumentable: 0 });
        p.samples++;
        if (r[13] === true) p.instrumentable++;
    });
    const summary = {
        samples: rows.length,
        merges: new Set(rows.map(r => r[1] + '\0' + r[3])).size,
        projects: Object.keys(perProject).length,
        instrumentable,
        notInstrumentable: rows.length - instrumentable,
        withoutDatasetRecord: unmatched.length,
        perProject
    };
    fs.writeFileSync(path.join(out, 'manifesto_resumo.json'), JSON.stringify(summary, null, 1) + '\n');
    console.log(`manifesto: ${summary.samples} amostras, ${summary.merges} merges, ${summary.projects} projetos | instrumentáveis: ${instrumentable} | sem registro no dataset: ${unmatched.length}`);
}

if (require.main === module) main();
