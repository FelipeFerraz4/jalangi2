// Execução da análise (OA, Data Flow e Confluence Flow) sobre um arquivo, usada pelos runners.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

// Lê um contador do relatório final da análise
function count(output, label) {
    const m = output.match(new RegExp(label + ':\\s*(\\d+)'));
    return m ? Number(m[1]) : null;
}

// O relatório mostra só OA, DF e CF. O recorte direto/transitivo vem de uma linha extra, pedida pelo runner
function detail(output) {
    const m = output.match(/^DETALHE (\{.*\})$/m);
    return m ? JSON.parse(m[1]) : { dfDireto: 0, dfTransitivo: 0, cfDireto: 0, cfTransitivo: 0 };
}

// branchMap: objeto {L:[...],R:[...]}, {"linha":"L"} ou {files:{...}}; branchMapFile: caminho de um JSON com um deles.
// O relatório JSON da execução (conflitos com posições e pilha, e cobertura) volta em `report`.
function runAnalysis({ file, branchMap, branchMapFile, timeout = 60000 }) {
    const env = Object.assign({}, process.env);
    delete env.BRANCH_MAP;
    delete env.BRANCH_MAP_FILE;
    env.ANALYSIS_DETAIL = '1';
    if (branchMap) env.BRANCH_MAP = JSON.stringify(branchMap);
    if (branchMapFile) env.BRANCH_MAP_FILE = branchMapFile;
    const reportDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-report-'));
    env.ANALYSIS_REPORT = path.join(reportDir, 'report.json');

    let output = '', failed = false, error = null;
    try {
        output = execFileSync('node', [
            'src/js/commands/jalangi.js', '--inlineIID', '--inlineSource',
            '--analysis', 'src/js/sample_analyses/ChainedAnalyses.js',
            '--analysis', 'src/js/runtime/SMemory.js',
            '--analysis', 'experiments/analyses/analysis_dataflow.js',
            file
        ], { cwd: rootDir, encoding: 'utf-8', env, timeout, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
        failed = true;
        error = e.message.split('\n')[0];
        output = (e.stdout || '') + (e.stderr || '');
    }

    let report = null;
    try { report = JSON.parse(fs.readFileSync(env.ANALYSIS_REPORT, 'utf-8')); } catch (e) { }
    fs.rmSync(reportDir, { recursive: true, force: true });

    const oa = count(output, 'Conflitos de Overriding Assignment \\(OA\\)');
    const d = detail(output);
    if (oa === null) {
        failed = true;
        error = error || 'sem relatório da análise';
    }
    return {
        failed, error, output, report,
        oa: oa || 0,
        // Totais, como a análise reporta
        dfTotal: count(output, 'Conflitos de Data Flow \\(DF\\)') || 0,
        cfTotal: count(output, 'Conflitos de Confluence Flow \\(CF\\)') || 0,
        // Recorte usado para comparar com as análises do Java
        df: d.dfDireto, dfTransitive: d.dfTransitivo,
        cf: d.cfDireto, cfTransitive: d.cfTransitivo
    };
}

module.exports = { runAnalysis, rootDir };
