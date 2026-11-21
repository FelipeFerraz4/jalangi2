// ==============================================================================
// UNIÃO DOS RELATÓRIOS JSON DE VÁRIAS EXECUÇÕES DO MESMO MERGE
// ==============================================================================
// Um merge real é exercitado por várias execuções (um processo por arquivo de teste, por exemplo),
// e cada uma grava seu relatório com ANALYSIS_REPORT. Este script junta os relatórios num só:
//   * conflitos: cada um conta uma vez, pela mesma chave usada na execução (OA por alvo e linhas,
//     DF por par, CF por trio). Um DF ou CF transitivo deixa de contar se outra execução o viu
//     como direto. No DF, os elementos de estado das execuções são unidos.
//   * cobertura: uma linha conta como executada se executou em qualquer execução.
// Os relatórios devem usar o mesmo mapa de branches.
//
// Uso: node experiments/tools/merge-reports.js <saida.json> <relatorio.json>...
const fs = require('fs');
const reportLib = require('../lib/report');

function recordId(type, c) {
    return type === 'oa' ? c.key : c.kind + '#' + c.key;
}

function mergeReports(reports) {
    const conflicts = { oa: new Map(), df: new Map(), cf: new Map() };
    const files = new Map();
    const runs = [];

    for (const report of reports) {
        if (report.format !== reportLib.FORMAT) throw new Error(`formato de relatório desconhecido: ${report.format}`);
        runs.push(...report.runs);
        for (const type of ['oa', 'df', 'cf']) {
            for (const c of report.conflicts[type]) {
                const id = recordId(type, c);
                const seen = conflicts[type].get(id);
                if (!seen) {
                    conflicts[type].set(id, JSON.parse(JSON.stringify(c)));
                } else if (type === 'df') {
                    seen.targets = [...new Set(seen.targets.concat(c.targets))];
                    // Só fica marcado se todas as execuções o viram via parâmetro
                    seen.viaParam = !!(seen.viaParam && c.viaParam);
                }
            }
        }
        for (const f of report.coverage.files) {
            const seen = files.get(f.file);
            if (!seen) {
                files.set(f.file, JSON.parse(JSON.stringify(f)));
                continue;
            }
            seen.loaded = seen.loaded || f.loaded;
            seen.executable = (seen.executable || f.executable) ? reportLib.union(seen.executable, f.executable) : null;
            seen.executed = reportLib.union(seen.executed, f.executed);
        }
    }

    return reportLib.buildReport({
        runs,
        conflicts: { oa: [...conflicts.oa.values()], df: [...conflicts.df.values()], cf: [...conflicts.cf.values()] },
        coverageFiles: [...files.values()]
    });
}

module.exports = { mergeReports };

if (require.main === module) {
    const [, , out, ...inputs] = process.argv;
    if (!out || inputs.length === 0) {
        console.error('uso: node merge-reports.js <saida.json> <relatorio.json>...');
        process.exit(2);
    }
    const merged = mergeReports(inputs.map(f => JSON.parse(fs.readFileSync(f, 'utf-8'))));
    fs.writeFileSync(out, JSON.stringify(merged, null, 1) + '\n');
    const c = merged.counts, t = merged.coverage.summary.total;
    console.log(`${inputs.length} relatórios → OA ${c.oa} | DF ${c.df.total} (${c.df.direct} diretos, ${c.df.viaParam} via parâmetro) | CF ${c.cf.total} (${c.cf.direct} diretos)`);
    console.log(`linhas executadas: L ${t.L.executed}/${t.L.mapped - t.L.withoutCode} | R ${t.R.executed}/${t.R.mapped - t.R.withoutCode}`);
}
