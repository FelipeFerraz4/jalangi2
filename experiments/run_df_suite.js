// ==============================================================================
// VALIDAÇÃO DE DATA FLOW E CONFLUENCE FLOW: TESTES DO conflict-static-analysis (Santos et al., 2023)
// ==============================================================================
// Os 13 testes de DF e CF do repositório spgroup/conflict-static-analysis (pacote br.unb.cic.analysis.df)
// usam Soot/JUnit e não podem ser traduzidos para JavaScript. O que roda aqui são as classes `sample`
// que eles analisam, traduzidas com JSweet (experiments/df_samples/). Cada teste fornece:
//   - as linhas de source (tratadas como Left) e de sink (tratadas como Right), em linhas do Java;
//   - o resultado esperado, em asserções que estão comentadas no Java (exceto no Containment).
// As linhas do Java são convertidas para as do JavaScript (campo `js`), e o mapa L/R é montado
// com elas. Como no OA (run_oa_suite.js), compara-se a presença de conflito com o esperado.
//
// A análise roda uma única vez por caso e reporta OA, DF e CF, cada um em direto e transitivo. Cada
// análise do Java corresponde a um recorte desses números:
//   ReachDefinition   -> Data Flow direto
//   Tainted           -> Data Flow direto + transitivo
//   Confluent         -> Confluence Flow direto
//   ConfluentTainted  -> Confluence Flow direto + transitivo
//   DFPInterProcedural (Containment) -> Data Flow direto + transitivo
// Os índices de um array continuam sendo estados independentes.
//
// Uso: node experiments/run_df_suite.js [filtro]   (filtra por nome do teste ou da sample)
const fs = require('fs');
const path = require('path');
const { runAnalysis, rootDir } = require('./lib/analysis');

const samplesDir = path.join(__dirname, 'df_samples', 'es5');
const defaultScazDir = path.resolve(rootDir, '..', 'SCAz.js');

const METRICS = {
    ReachDefinition: { name: 'DF', value: r => r.df },
    Tainted: { name: 'DF', value: r => r.df + r.dfTransitive },
    Confluent: { name: 'CF', value: r => r.cf },
    ConfluentTainted: { name: 'CF', value: r => r.cf + r.cfTransitive },
    DFPInterProcedural: { name: 'DF', value: r => r.df + r.dfTransitive }
};

// java: linha no Java; js: linha no JavaScript (ES5); code: trecho que a linha deve conter

const cases = [
    {
        test: 'ReachDefinitionAnalysisOneConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow',
        expected: 1,
        source: [{ java: 6, js: 14, code: 'this.random()' }],
        sink: [{ java: 11, js: 17, code: 'this.blah(x)' }]
    },
    {
        test: 'ReachDefinitionAnalysisTransitiveSourceNoConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralIndirectSource',
        expected: 0,
        source: [{ java: 7, js: 15, code: 'x = this.random()' }],
        sink: [{ java: 12, js: 18, code: 'console.info(y)' }]
    },
    {
        test: 'ReachDefinitionAnalysisZeroConflictTest', analysis: 'ReachDefinition', sample: 'IntraproceduralDataFlow',
        expected: 0,
        source: [{ java: 19, js: 23, code: 'this.random()' }],
        sink: [{ java: 26, js: 27, code: 'console.info(x)' }]
    },
    {
        test: 'TaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'IntraproceduralIndirectSource',
        expected: 1,
        source: [{ java: 7, js: 15, code: 'x = this.random()' }],
        sink: [{ java: 12, js: 18, code: 'console.info(y)' }],
        note: 'Tainted é transitivo (x -> y -> sink); a análise só vê o fluxo direto, e y é escrito pela Base.'
    },
    {
        test: 'ArrayTaintedAnalysisOneConflictTest', analysis: 'Tainted', sample: 'ArrayDataFlowSample',
        expected: 2,
        source: [{ java: 14, js: 16, code: 'arr[4] = 10' }],
        sink: [{ java: 16, js: 17, code: 'arr[4]' }, { java: 19, js: 20, code: 'console.info(a)' }],
        note: 'Detecta o sink da linha 17 (leitura de arr[4]). O sink do for-each (linha 20) lê `a`, escrita pela Base: fluxo transitivo.'
    },
    {
        test: 'ArrayTaintedAnalysisOneConflictIndirectTest', analysis: 'Tainted', sample: 'ArrayIndirectDataFlowSample',
        expected: 2,
        source: [{ java: 8, js: 15, code: 'arr[4] = 10' }],
        sink: [{ java: 10, js: 16, code: 'arr[3]' }, { java: 12, js: 17, code: 'console.info(b)' }],
        note: 'Divergência intencional: o Tainted trata o array como um todo (arr[4] contamina arr[3]); a análise trata cada índice como estado independente, como no OA, para evitar falsos positivos.'
    },
    // --- Confluence Flow: o conflito está num comando da Base que usa o source e o sink ---
    {
        test: 'ConfluenceWithTransitivityTest', analysis: 'ConfluentTainted', sample: 'ConfluenceWithTransitivitySample',
        expected: 1,
        source: [{ java: 9, js: 17, code: 'x = 10' }],
        sink: [{ java: 13, js: 19, code: 'y++' }]
    },
    {
        test: 'SourceSinkConfluenceAnalysisMethodCallTest', analysis: 'Confluent', sample: 'SourceSinkMethodCallSample',
        expected: 1,
        source: [{ java: 8, js: 16, code: 'x = this.one()' }],
        sink: [{ java: 10, js: 17, code: 'y = this.two()' }]
    },
    {
        test: 'SourceSinkConfluenceAnalysisOneConflictTest', analysis: 'Confluent', sample: 'DoubleSourceSample',
        expected: 1,
        source: [{ java: 8, js: 16, code: 'x = x + 1' }],
        sink: [{ java: 12, js: 18, code: 'y = y - 1' }]
    },
    {
        test: 'SourceSinkConfluenceAnalysisVariableAttributionTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionSample',
        expected: 1,
        source: [{ java: 18, js: 27, code: 'x = 10' }],
        sink: [{ java: 20, js: 28, code: 'y = z + 2' }]
    },
    {
        test: 'SourceSinkVariableAttributionWithAutoIncrementConfluentTest', analysis: 'Confluent', sample: 'SourceSinkVariableAttributionWithAutoIncrement',
        expected: 0,
        source: [{ java: 9, js: 17, code: 'x = 10' }],
        sink: [{ java: 11, js: 19, code: 'y = z + 2' }]
    },
    {
        test: 'SourceSinkVariableAttributionWithAutoIncrementTaintedConfluentTest', analysis: 'ConfluentTainted', sample: 'SourceSinkVariableAttributionWithAutoIncrement',
        expected: 1,
        source: [{ java: 9, js: 17, code: 'x = 10' }],
        sink: [{ java: 11, js: 19, code: 'y = z + 2' }]
    },
    // Sample de OA (pacote ioa): não está entre as 9 do Italo, então usa a tradução da Amanda (SCAz.js).
    // A análise do Java (DFP/SVFA, sobre grafo de fluxo de valores) é aproximada por Data Flow.
    {
        test: 'ContainmentConflictTest', analysis: 'DFPInterProcedural', sample: 'ioa.ContainmentSample',
        expected: 1,
        external: 'src/analyses/overriding_assignment/test_cases/containmentSample/index.js',
        source: [{ java: 7, js: 37, code: 'new br.unb.cic.analysis.samples.ioa.Point()' }],
        sink: [{ java: 9, js: 39, code: 'x.y = 5' }],
        note: 'O Java usa a análise DFP/SVFA, que não implementamos; aqui conta-se o Data Flow (direto + transitivo).'
    }
];

// Confere que a linha mapeada ainda contém o comando esperado (evita mapa desatualizado)
function checkLines(c, file) {
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    for (const m of c.source.concat(c.sink)) {
        if (!(lines[m.js - 1] || '').includes(m.code)) {
            throw new Error(`${path.basename(file)}:${m.js} não contém '${m.code}' (Java ${m.java})`);
        }
    }
}

// Executa os casos e devolve um registro por caso:
// { suite, name, status: 'ok' | 'wrong' | 'error' | 'skipped', expected, found, metric, detail, note, output }
function collect({ scazDir = defaultScazDir, filter } = {}) {
    const selected = filter
        ? cases.filter(c => c.test.toLowerCase().includes(filter.toLowerCase()) || c.sample.toLowerCase().includes(filter.toLowerCase()))
        : cases;

    return selected.map(c => {
        const record = { suite: 'DF/CF', name: c.test, sample: c.sample, analysis: c.analysis, expected: c.expected, note: c.note };
        const file = c.external ? path.join(scazDir, c.external) : path.join(samplesDir, `${c.sample}.js`);
        if (!fs.existsSync(file)) {
            return Object.assign(record, { status: 'skipped', detail: `tradução não encontrada: ${c.external ? 'clone do SCAz.js em ' + scazDir : file}` });
        }
        try {
            checkLines(c, file);
        } catch (e) {
            return Object.assign(record, { status: 'error', detail: e.message });
        }
        const r = runAnalysis({ file, branchMap: { L: c.source.map(m => m.js), R: c.sink.map(m => m.js) } });
        if (r.failed) return Object.assign(record, { status: 'error', detail: r.error, output: r.output });

        const metric = METRICS[c.analysis];
        record.metric = metric.name;
        record.found = metric.value(r);
        record.output = r.output;
        record.status = (record.found > 0) === (c.expected > 0) ? 'ok' : 'wrong';
        record.detail = '';
        return record;
    });
}

function report(records) {
    console.log('================================================================================');
    console.log('🔬 VALIDAÇÃO DE DATA FLOW E CONFLUENCE FLOW — TESTES DO conflict-static-analysis');
    console.log('================================================================================');
    for (const r of records) {
        if (r.status === 'skipped') {
            console.log(`• ${r.name}\n    ${r.sample} (${r.analysis}): não executado — ${r.detail}`);
        } else if (r.status === 'error') {
            console.log(`✖ ERRO ${r.name}\n    ${r.detail}`);
        } else {
            const countDiffers = r.status === 'ok' && r.found !== r.expected;
            console.log(`${r.status === 'ok' ? '✔' : '✖'} ${r.name}`);
            console.log(`    ${r.sample} (${r.analysis}) | esperado ${r.metric}=${r.expected} | detectado ${r.metric}=${r.found} ${countDiffers ? ' | presença bate, contagem difere' : ''}`);
            if (r.note && (r.status === 'wrong' || countDiffers)) console.log(`    ↳ ${r.note}`);
        }
        if (records.length === 1 && r.output) {
            console.log('--- LOG DA ANÁLISE ---');
            console.log(r.output.trim());
            console.log('----------------------');
        }
    }
    const s = summarize(records);
    console.log('--------------------------------------------------------------------------------');
    console.log(`Total: ${records.length} | executados: ${records.length - s.skipped} | presença correta: ${s.ok} | divergentes: ${s.wrong} | erros: ${s.error} | não executados: ${s.skipped}`);
    if (s.countDiffers > 0) console.log(`Em ${s.countDiffers} caso(s) a presença bate, mas a contagem difere do esperado.`);
    console.log('================================================================================');
}

function summarize(records) {
    const count = st => records.filter(r => r.status === st).length;
    return {
        ok: count('ok'), wrong: count('wrong'), error: count('error'), skipped: count('skipped'),
        countDiffers: records.filter(r => r.status === 'ok' && r.found !== r.expected).length
    };
}

module.exports = { collect, report, summarize };

if (require.main === module) {
    const records = collect({ scazDir: defaultScazDir, filter: process.argv[2] });
    report(records);
    process.exit(summarize(records).error > 0 ? 1 : 0);
}
