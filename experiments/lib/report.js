// ==============================================================================
// RELATÓRIO JSON DA ANÁLISE: CONTAGENS E COBERTURA
// ==============================================================================
// Usado pelo motor (analyses/analysis_dataflow.js), ao gravar o relatório de uma execução, e por
// tools/merge-reports.js, ao unir os relatórios de várias execuções do mesmo merge. As duas pontas
// recalculam contagens e resumos daqui, então os números sempre seguem as mesmas regras.

var FORMAT = 'merge-analysis-report/1';
var BRANCHES = ['L', 'R'];

function sortedNumbers(list) {
    return list.slice().sort(function (a, b) { return a - b; });
}

function union(a, b) {
    var seen = {};
    (a || []).concat(b || []).forEach(function (x) { seen[x] = true; });
    return sortedNumbers(Object.keys(seen).map(Number));
}

// Cobertura de uma branch num arquivo, a partir das listas de linhas:
//   mapped:     linhas que o mapa atribui à branch
//   executable: linhas do arquivo com algum nó instrumentado (null se o arquivo nunca carregou)
//   executed:   linhas que executaram
function branchCoverage(mapped, executable, executed) {
    var exe = executable ? toSet(executable) : null;
    var run = toSet(executed || []);
    var withoutCode = exe ? mapped.filter(function (l) { return !exe[l]; }) : [];
    var notExecuted = mapped.filter(function (l) { return !run[l] && (!exe || exe[l]); });
    return {
        mapped: mapped.length,
        withoutCode: withoutCode.length,
        executed: mapped.filter(function (l) { return run[l]; }).length,
        notExecuted: notExecuted
    };
}

function toSet(list) {
    var set = {};
    list.forEach(function (x) { set[x] = true; });
    return set;
}

// files: [{ file, loaded, lines: { L: [...], R: [...] }, executable: [...]|null, executed: [...] }]
// Devolve o resumo por arquivo e o total por branch. A taxa é executadas / (mapeadas - sem código).
function summarizeCoverage(files) {
    var total = {};
    BRANCHES.forEach(function (b) { total[b] = { mapped: 0, withoutCode: 0, executed: 0, notExecuted: 0 }; });
    var perFile = files.map(function (f) {
        var out = { file: f.file, loaded: f.loaded };
        BRANCHES.forEach(function (b) {
            var c = branchCoverage(f.lines[b] || [], f.executable, f.executed);
            out[b] = c;
            total[b].mapped += c.mapped;
            total[b].withoutCode += c.withoutCode;
            total[b].executed += c.executed;
            total[b].notExecuted += c.notExecuted.length;
        });
        return out;
    });
    BRANCHES.forEach(function (b) {
        var t = total[b], denominator = t.mapped - t.withoutCode;
        t.rate = denominator > 0 ? Math.round((t.executed / denominator) * 1000) / 1000 : null;
    });
    return { total: total, files: perFile };
}

// conflicts: { oa: [...], df: [...], cf: [...] }, cada registro com kind 'direct' | 'transitive' (DF e CF)
function countConflicts(conflicts) {
    var count = function (list, kind) {
        return list.filter(function (c) { return c.kind === kind; }).length;
    };
    var df = { direct: count(conflicts.df, 'direct'), transitive: count(conflicts.df, 'transitive') };
    var cf = { direct: count(conflicts.cf, 'direct'), transitive: count(conflicts.cf, 'transitive') };
    df.total = df.direct + df.transitive;
    cf.total = cf.direct + cf.transitive;
    return { oa: conflicts.oa.length, df: df, cf: cf };
}

// Um conflito transitivo só conta se o mesmo par (DF) ou trio (CF) não aparece também como direto
function dropShadowedTransitive(list) {
    var direct = {};
    list.forEach(function (c) { if (c.kind === 'direct') direct[c.key] = true; });
    return list.filter(function (c) { return c.kind === 'direct' || !direct[c.key]; });
}

function buildReport(parts) {
    var conflicts = {
        oa: parts.conflicts.oa,
        df: dropShadowedTransitive(parts.conflicts.df),
        cf: dropShadowedTransitive(parts.conflicts.cf)
    };
    return {
        format: FORMAT,
        runs: parts.runs,
        counts: countConflicts(conflicts),
        conflicts: conflicts,
        coverage: {
            summary: summarizeCoverage(parts.coverageFiles),
            files: parts.coverageFiles
        }
    };
}

module.exports = { FORMAT: FORMAT, BRANCHES: BRANCHES, union: union, summarizeCoverage: summarizeCoverage, countConflicts: countConflicts, buildReport: buildReport };
