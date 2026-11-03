// Execução da análise (OA, Data Flow e Confluence Flow) sobre um arquivo, usada pelos runners.
const { execFileSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

// Lê um contador do relatório final da análise
function count(output, label) {
    const m = output.match(new RegExp(label + ':\\s*(\\d+)'));
    return m ? Number(m[1]) : null;
}

// branchMap: objeto {L:[...],R:[...]} ou {"linha":"L"}; branchMapFile: caminho de um JSON com um deles
function runAnalysis({ file, branchMap, branchMapFile, timeout = 60000 }) {
    const env = Object.assign({}, process.env);
    delete env.BRANCH_MAP;
    delete env.BRANCH_MAP_FILE;
    if (branchMap) env.BRANCH_MAP = JSON.stringify(branchMap);
    if (branchMapFile) env.BRANCH_MAP_FILE = branchMapFile;

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

    const oa = count(output, 'Conflitos de Overriding Assignment \\(OA\\)');
    if (oa === null) {
        failed = true;
        error = error || 'sem relatório da análise';
    }
    return {
        failed, error, output,
        oa: oa || 0,
        df: count(output, 'Conflitos de Data Flow Inter-Branch') || 0,
        dfTransitive: count(output, 'Conflitos de Data Flow Transitivo') || 0,
        cf: count(output, 'Conflitos de Confluence Flow') || 0,
        cfTransitive: count(output, 'Conflitos de Confluence Flow Transitivo') || 0
    };
}

module.exports = { runAnalysis, rootDir };
