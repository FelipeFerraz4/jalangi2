// ==============================================================================
// RUNNER CONSOLIDADO DE TESTES TOY - DATA FLOW & OVERRIDING ASSIGNMENT
// ==============================================================================
const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const tests = [
    {
        name: "1. Exemplo Original da Amanda (example.js)",
        file: "experiments/example.js",
        expectedOA: 1,
        expectedDF: 0,
        description: "Valida regressão de Overriding Assignment original"
    },
    {
        name: "2. Data Flow Direto (test_dataflow_direct.js)",
        file: "experiments/test_dataflow_direct.js",
        expectedOA: 0,
        expectedDF: 1,
        description: "Branch L escreve em taxa, Branch R lê taxa no cálculo"
    },
    {
        name: "3. Execução Segura e Kill da Base (test_dataflow_safe.js)",
        file: "experiments/test_dataflow_safe.js",
        expectedOA: 0,
        expectedDF: 0,
        description: "Variáveis disjuntas e Base sobrescreve antes do consumo"
    },
    {
        name: "4. Data Flow em Propriedade de Objeto (test_dataflow_object.js)",
        file: "experiments/test_dataflow_object.js",
        expectedOA: 0,
        expectedDF: 1,
        description: "Interceptação via putFieldPre e getField (pedido.taxa)"
    },
    {
        name: "5. Data Flow Interprocedural (test_dataflow_interproc.js)",
        file: "experiments/test_dataflow_interproc.js",
        expectedOA: 0,
        expectedDF: 1,
        description: "Fluxo através de funções: setTaxa() -> calcularTotal()"
    }
];

console.log("================================================================================");
console.log("🚀 INICIANDO BATERIA DE TESTES SINTÉTICOS DE DATA FLOW NO JALANGI2");
console.log("================================================================================\n");

let passedCount = 0;
const results = [];

for (const t of tests) {
    const cmd = `node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis experiments/analysis_dataflow.js ${t.file}`;
    let output = "";
    let passed = false;
    let oaFound = 0;
    let dfFound = 0;

    try {
        output = execSync(cmd, { cwd: rootDir, encoding: 'utf-8' });
        
        const oaMatch = output.match(/Conflitos de Overriding Assignment \(OA\):\s*(\d+)/);
        const dfMatch = output.match(/Conflitos de Data Flow Inter-Branch:\s*(\d+)/);

        if (oaMatch) oaFound = parseInt(oaMatch[1], 10);
        if (dfMatch) dfFound = parseInt(dfMatch[1], 10);

        if (oaFound === t.expectedOA && dfFound === t.expectedDF) {
            passed = true;
            passedCount++;
        }
    } catch (e) {
        output = e.stdout || e.message;
    }

    results.push({
        name: t.name,
        passed,
        expected: `OA: ${t.expectedOA}, DF: ${t.expectedDF}`,
        obtained: `OA: ${oaFound}, DF: ${dfFound}`,
        description: t.description
    });
}

console.log("--------------------------------------------------------------------------------");
console.log("📋 TABELA RESUMO DOS RESULTADOS");
console.log("--------------------------------------------------------------------------------");
results.forEach(r => {
    const icon = r.passed ? "✅ PASSOU" : "❌ FALHOU";
    console.log(`${icon} | ${r.name}`);
    console.log(`         Esperado: [${r.expected}] | Obtido: [${r.obtained}]`);
    console.log(`         Nota: ${r.description}\n`);
});

console.log("================================================================================");
console.log(`🏁 RESULTADO GERAL: ${passedCount}/${tests.length} TESTES PASSARAM COM SUCESSO!`);
console.log("================================================================================\n");

if (passedCount !== tests.length) {
    process.exit(1);
}
