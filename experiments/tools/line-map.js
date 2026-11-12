// ==============================================================================
// GERADOR DO MAPA DE LINHAS L/R DE UM CENÁRIO DE MERGE
// ==============================================================================
// A análise precisa saber quais linhas do arquivo integrado (merge) vieram da contribuição Left e
// quais vieram da Right. Este gerador descobre isso só com as quatro versões do arquivo
// (base, left, right e merge), sem o histórico do Git:
//   1. as linhas que a Left acrescentou ou alterou em relação à base (diff base -> left);
//   2. quais delas sobrevivem, iguais, no merge (diff left -> merge);
//   3. o mesmo para a Right.
// As linhas do merge que não vieram de nenhuma das duas (código da base ou editado ao resolver o
// merge) ficam sem rótulo e valem como Base, como no `git blame` da Amanda (SCAz.js).
// Se as duas contribuições fizeram a mesma alteração na mesma linha, ela vale como L: o `git blame`
// segue o primeiro pai (Left) quando a linha existe nos dois. Isso não é uma divergência entre as
// contribuições, então esses casos não contam como linhas de R.
//
// Comparação ignorando espaços em branco (`git diff -w`), como o `git blame -w` do SCAz.js.
// A saída usa o formato do SCAz.js: { "linha": "L" | "R" }, aceito por BRANCH_MAP_FILE.
//
// Uso (um cenário):
//   node experiments/tools/line-map.js <base.js> <left.js> <right.js> <merge.js> [--out mapa.json]
// Uso (pacotes do dataset, um ZIP por projeto). Grava mapas/<amostra>.json (um arquivo) e
// por-merge/<projeto>__<commit>.json (todos os arquivos do merge, no formato { files: {...} }):
//   node experiments/tools/line-map.js --zip <pacote.zip>... --out-dir <pasta>
//   node experiments/tools/line-map.js --versoes <pasta versoes/> --out-dir <pasta>
const { spawnSync, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function readLines(file) {
    const text = fs.readFileSync(file, 'utf-8');
    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    return lines;
}

// Hunks de `git diff --no-index -U0`: faixas removidas em A e acrescentadas em B (1-based)
function diffRanges(fileA, fileB) {
    const r = spawnSync('git', [
        '-c', 'core.quotepath=off', 'diff', '--no-index', '--no-color', '--unified=0',
        '--ignore-all-space', '--diff-algorithm=histogram', '--', fileA, fileB
    ], { encoding: 'utf-8', maxBuffer: 256 * 1024 * 1024 });
    if (r.error) throw r.error;
    if (r.status !== 0 && r.status !== 1) throw new Error(`git diff falhou (${r.status}): ${r.stderr}`);

    const removed = [], added = [];
    for (const line of r.stdout.split('\n')) {
        const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (!m) continue;
        const aStart = Number(m[1]), aLen = m[2] === undefined ? 1 : Number(m[2]);
        const bStart = Number(m[3]), bLen = m[4] === undefined ? 1 : Number(m[4]);
        if (aLen > 0) removed.push([aStart, aStart + aLen - 1]);
        if (bLen > 0) added.push([bStart, bStart + bLen - 1]);
    }
    return { removed, added };
}

function inRanges(ranges, n) {
    return ranges.some(([from, to]) => n >= from && n <= to);
}

// Para cada linha de B, a linha correspondente em A (1-based), ou 0 se foi acrescentada.
// As linhas que não aparecem em nenhum hunk são iguais e casam na ordem.
function alignment(fileA, fileB, countA, countB) {
    const { removed, added } = diffRanges(fileA, fileB);
    const keptA = [], keptB = [];
    for (let i = 1; i <= countA; i++) if (!inRanges(removed, i)) keptA.push(i);
    for (let j = 1; j <= countB; j++) if (!inRanges(added, j)) keptB.push(j);
    if (keptA.length !== keptB.length) {
        throw new Error(`alinhamento inconsistente entre ${path.basename(fileA)} e ${path.basename(fileB)}`);
    }
    const map = new Array(countB + 1).fill(0);
    keptB.forEach((j, k) => { map[j] = keptA[k]; });
    return map;
}

// Linhas do merge que a contribuição (left ou right) acrescentou ou alterou em relação à base
function linesFromBranch(baseFile, branchFile, mergeFile, counts) {
    const { added } = diffRanges(baseFile, branchFile);
    const mergeToBranch = alignment(branchFile, mergeFile, counts.branch, counts.merge);
    const result = new Set();
    for (let j = 1; j <= counts.merge; j++) {
        const i = mergeToBranch[j];
        if (i > 0 && inRanges(added, i)) result.add(j);
    }
    return result;
}

// files: { base, left, right, merge } (caminhos). Devolve { map, left, right, both, mergeLines }
function buildLineMap(files) {
    const nBase = readLines(files.base).length;
    const nLeft = readLines(files.left).length;
    const nRight = readLines(files.right).length;
    const nMerge = readLines(files.merge).length;
    void nBase;

    const fromLeft = linesFromBranch(files.base, files.left, files.merge, { branch: nLeft, merge: nMerge });
    const fromRight = linesFromBranch(files.base, files.right, files.merge, { branch: nRight, merge: nMerge });

    const map = {};
    let both = 0;
    for (let j = 1; j <= nMerge; j++) {
        const l = fromLeft.has(j), r = fromRight.has(j);
        if (l && r) { map[j] = 'L'; both++; }
        else if (l) map[j] = 'L';
        else if (r) map[j] = 'R';
    }
    // left inclui as linhas iguais nas duas; right só as que são exclusivas da Right
    return { map, left: fromLeft.size, right: fromRight.size - both, both, mergeLines: nMerge };
}

// Estado do cenário para a análise: precisa de linhas nas duas contribuições
function status(result) {
    if (result.left > 0 && result.right > 0) return 'ok';
    if (result.left === 0 && result.right === 0) return 'sem-L-e-R';
    return result.left === 0 ? 'sem-L' : 'sem-R';
}

module.exports = { buildLineMap, status, readLines, diffRanges, mergeMaps };

// ------------------------------------------------------------------------------
// Linha de comando
// ------------------------------------------------------------------------------
function main(argv) {
    const args = argv.slice(2);
    const opt = name => {
        const i = args.indexOf(name);
        return i === -1 ? undefined : args[i + 1];
    };
    const outDir = opt('--out-dir');

    if (args.includes('--zip') || args.includes('--versoes')) {
        if (!outDir) throw new Error('informe --out-dir <pasta>');
        let zips = [];
        if (args.includes('--versoes')) {
            const dir = opt('--versoes');
            zips = fs.readdirSync(dir).filter(f => f.endsWith('.zip')).sort().map(f => path.join(dir, f));
        } else {
            zips = args.filter((a, i) => args[i - 1] === '--zip' || (i > args.indexOf('--zip') && a.endsWith('.zip')));
        }
        return batch(zips, outDir);
    }

    const [base, left, right, merge] = args.filter(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--out');
    if (!merge) throw new Error('uso: line-map.js <base> <left> <right> <merge> [--out mapa.json]');
    const result = buildLineMap({ base, left, right, merge });
    const out = opt('--out');
    if (out) fs.writeFileSync(out, JSON.stringify(result.map, null, 1) + '\n');
    console.log(`linhas do merge: ${result.mergeLines} | L: ${result.left} | R: ${result.right} | iguais nas duas (valem L): ${result.both} | ${status(result)}`);
    if (!out) console.log(JSON.stringify(result.map));
}

// Mapa de um merge inteiro, no formato por arquivo da análise ({ files: { caminho: mapa } }).
// Entram todos os arquivos com alguma linha de L ou de R, inclusive os que só têm uma das duas:
// L num arquivo e R em outro também podem interferir quando o programa roda.
// O merge só é útil para a análise se tiver linhas das duas contribuições em algum arquivo.
function mergeMaps(samples) {
    const byMerge = new Map();
    for (const s of samples) {
        if (s.result.left === 0 && s.result.right === 0) continue;
        const key = s.project + '\u0000' + s.mergeCommit;
        if (!byMerge.has(key)) byMerge.set(key, { project: s.project, mergeCommit: s.mergeCommit, files: {}, left: 0, right: 0 });
        const m = byMerge.get(key);
        m.files[s.filePath] = s.result.map;
        m.left += s.result.left;
        m.right += s.result.right;
    }
    return [...byMerge.values()].map(m => ({
        project: m.project,
        mergeCommit: m.mergeCommit,
        status: status(m),
        map: { files: m.files }
    }));
}

function mergeFileName(m) {
    const safe = s => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');
    return `${safe(m.project)}__${safe(m.mergeCommit)}.json`;
}

function batch(zips, outDir) {
    fs.mkdirSync(path.join(outDir, 'mapas'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'por-merge'), { recursive: true });
    const samples = [];
    const rows = [['project', 'merge_commit', 'file_path', 'sample_id', 'merge_lines', 'left_lines', 'right_lines', 'both_lines', 'status']];
    for (const zip of zips) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'linemap-'));
        try {
            // Os arquivos do ZIP são dados de terceiros: só são lidos, nunca executados
            try {
                execFileSync('unzip', ['-q', '-o', zip, '-d', tmp, '*/base.js', '*/left.js', '*/right.js', '*/merge.js', '*/metadados.json'], { stdio: ['ignore', 'ignore', 'pipe'] });
            } catch (e) {
                // Código 11 do unzip: nenhum arquivo casou. É um pacote de projeto sem amostras; qualquer outro erro continua sendo erro
                if (e.status !== 11) throw e;
                console.error(`${path.basename(zip)}: sem amostras`);
                continue;
            }
            for (const id of fs.readdirSync(tmp)) {
                const dir = path.join(tmp, id);
                if (!fs.existsSync(path.join(dir, 'merge.js'))) continue;
                const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadados.json'), 'utf-8'));
                const result = buildLineMap({ base: path.join(dir, 'base.js'), left: path.join(dir, 'left.js'), right: path.join(dir, 'right.js'), merge: path.join(dir, 'merge.js') });
                const st = status(result);
                if (st === 'ok') fs.writeFileSync(path.join(outDir, 'mapas', `${id}.json`), JSON.stringify(result.map) + '\n');
                samples.push({ project: meta.project, mergeCommit: meta['merge commit'], filePath: meta['file path'], result });
                rows.push([meta.project, meta['merge commit'], meta['file path'], id, result.mergeLines, result.left, result.right, result.both, st]);
            }
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true });
        }
        console.error(`${path.basename(zip)}: ${rows.length - 1} amostras até aqui`);
    }
    const csv = rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c).join(',')).join('\n') + '\n';
    fs.writeFileSync(path.join(outDir, 'mapa_linhas.csv'), csv);
    const counts = {};
    rows.slice(1).forEach(r => { counts[r[8]] = (counts[r[8]] || 0) + 1; });
    console.log(`amostras: ${rows.length - 1}`, counts);

    const merges = mergeMaps(samples);
    const mergeRows = [['project', 'merge_commit', 'files', 'status', 'map_file']];
    for (const m of merges) {
        const name = m.status === 'ok' ? mergeFileName(m) : '';
        if (name) fs.writeFileSync(path.join(outDir, 'por-merge', name), JSON.stringify(m.map) + '\n');
        mergeRows.push([m.project, m.mergeCommit, Object.keys(m.map.files).length, m.status, name]);
    }
    const mergeCsv = mergeRows.map(r => r.map(c => /[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c).join(',')).join('\n') + '\n';
    fs.writeFileSync(path.join(outDir, 'mapa_merges.csv'), mergeCsv);
    const mergeCounts = {};
    merges.forEach(m => { mergeCounts[m.status] = (mergeCounts[m.status] || 0) + 1; });
    console.log(`merges: ${merges.length}`, mergeCounts);
}

if (require.main === module) {
    try {
        main(process.argv);
    } catch (e) {
        console.error(e.message);
        process.exit(2);
    }
}
