// ==============================================================================
// RUNNER CONSOLIDADO DE EXECUÇÃO DOS TOYS NO JALANGI2
// ==============================================================================
const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const tests = [
    {
        name: "1. Exemplo Original da Amanda (example.js)",
        file: "experiments/toys/example.js",
        branchMap: { "L": [5], "R": [1] },
        description: "Cenário original de Overriding Assignment (Amanda Moraes, SBLP 2024)"
    },
    {
        name: "2. Data Flow Direto (test_dataflow_direct.js)",
        file: "experiments/toys/test_dataflow_direct.js",
        branchMap: { "L": [4], "R": [6, 7] },
        description: "Branch L escreve em taxa, Branch R lê taxa no cálculo"
    },
    {
        name: "3. Execução Segura e Kill da Base (test_dataflow_safe.js)",
        file: "experiments/toys/test_dataflow_safe.js",
        branchMap: { "L": [4, 5, 6], "R": [10, 11, 12] },
        description: "Variáveis disjuntas e Base sobrescreve antes do consumo"
    },
    {
        name: "4. Data Flow em Propriedade de Objeto (test_dataflow_object.js)",
        file: "experiments/toys/test_dataflow_object.js",
        branchMap: { "L": [6], "R": [8, 9] },
        description: "Interceptação via putFieldPre e getField (pedido.taxa)"
    },
    {
        name: "5. Data Flow Interprocedural (test_dataflow_interproc.js)",
        file: "experiments/toys/test_dataflow_interproc.js",
        branchMap: { "L": [4], "R": [8] },
        description: "Fluxo através de funções: setTaxa() -> calcularTotal()"
    },
    {
        name: "6. OA com Leitura Entre as Escritas (test_oa_read_between.js)",
        file: "experiments/toys/test_oa_read_between.js",
        branchMap: { "L": [3], "R": [6] },
        description: "Leitura pela Base entre as escritas de L e R não elimina o OA"
    },
    {
        name: "7. Data Flow dentro de if (test_if_dataflow.js)",
        file: "experiments/toys/test_if_dataflow.js",
        branchMap: { "L": [6], "R": [11] },
        description: "Branch L escreve taxa num if, Branch R lê taxa em outro if"
    },
    {
        name: "8. OA com if (test_if_oa.js)",
        file: "experiments/toys/test_if_oa.js",
        branchMap: { "L": [5], "R": [8] },
        description: "Branch L atribui dentro do if e Branch R sobrescreve depois dele"
    },
    {
        name: "9. if não executado (test_if_not_taken.js)",
        file: "experiments/toys/test_if_not_taken.js",
        branchMap: { "L": [6], "R": [9] },
        description: "Escrita de L está num caminho não percorrido: limitação da análise dinâmica"
    },
    {
        name: "10. Data Flow em laço (test_loop_dataflow.js)",
        file: "experiments/toys/test_loop_dataflow.js",
        branchMap: { "L": [7], "R": [10] },
        description: "Branch L escreve desconto a cada iteração, Branch R lê depois do laço"
    },
    {
        name: "11. OA em laço (test_loop_oa.js)",
        file: "experiments/toys/test_loop_oa.js",
        branchMap: { "L": [6], "R": [9, 10] },
        description: "Branch L atribui no laço; Branch R sobrescreve duas vezes depois"
    },
    {
        name: "12. Data Flow de propriedade em laço (test_loop_object.js)",
        file: "experiments/toys/test_loop_object.js",
        branchMap: { "L": [4], "R": [5] },
        description: "L escreve conta.juros e R o lê a cada iteração"
    },
    {
        name: "13. Pilha de chamadas com exceção (test_exception_stack.js)",
        file: "experiments/toys/test_exception_stack.js",
        branchMap: { "L": [8], "R": [14] },
        description: "Chamada de L termina por exceção; o código seguinte da Base não pode ser atribuído a L"
    },
    {
        name: "14. OA com métodos de array in-place (test_array_inplace_oa.js)",
        file: "experiments/toys/test_array_inplace_oa.js",
        branchMap: { "L": [3], "R": [4] },
        description: "fill de L e splice de R alteram a mesma posição do array"
    },
    {
        name: "15. Métodos de array in-place em posições distintas (test_array_inplace_safe.js)",
        file: "experiments/toys/test_array_inplace_safe.js",
        branchMap: { "L": [3], "R": [4] },
        description: "push de L (posição 3) e fill de R (posições 0 e 1) não se sobrepõem"
    }
];

// Suporte a filtro opcional: node run_all_toys.js [numero ou termo]
const filterArg = process.argv[2];
const selectedTests = filterArg
    ? tests.filter((t, idx) => (idx + 1).toString() === filterArg || t.file.toLowerCase().includes(filterArg.toLowerCase()) || t.name.toLowerCase().includes(filterArg.toLowerCase()))
    : tests;

console.log("================================================================================");
console.log("🔬 EXECUTANDO ANÁLISE DINÂMICA DE MERGE (JALANGI2)");
if (filterArg) {
    console.log(`🔍 FILTRO ATIVO: '${filterArg}' (${selectedTests.length} programa(s) selecionado(s))`);
}
console.log("================================================================================\n");

const results = [];
let executionErrors = 0;

for (const t of selectedTests) {
    const cmd = `node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/runtime/SMemory.js --analysis experiments/analyses/analysis_dataflow.js ${t.file}`;
    let output = "";
    let oaFound = 0;
    let dfFound = 0;
    let success = true;

    try {
        const env = Object.assign({}, process.env, {
            BRANCH_MAP: JSON.stringify(t.branchMap)
        });
        output = execSync(cmd, { cwd: rootDir, encoding: 'utf-8', env: env });
        
        const oaMatch = output.match(/Conflitos de Overriding Assignment \(OA\):\s*(\d+)/);
        const dfMatch = output.match(/Conflitos de Data Flow Inter-Branch:\s*(\d+)/);

        if (oaMatch) oaFound = parseInt(oaMatch[1], 10);
        if (dfMatch) dfFound = parseInt(dfMatch[1], 10);
    } catch (e) {
        success = false;
        executionErrors++;
        output = e.stdout || e.message;
    }

    results.push({
        name: t.name,
        file: t.file,
        success,
        oaFound,
        dfFound,
        description: t.description,
        output: output
    });
}

console.log("--------------------------------------------------------------------------------");
console.log("📋 RELATÓRIO CONSOLIDADO DAS DETECÇÕES");
console.log("--------------------------------------------------------------------------------");
results.forEach(r => {
    const statusIcon = r.success ? "✔" : "✖ ERRO DE EXECUÇÃO";
    console.log(`${statusIcon} ${r.name}`);
    console.log(`   • Conflitos Detectados: Overriding Assignment (OA): ${r.oaFound} | Data Flow (DF): ${r.dfFound}`);
    console.log(`   • Descrição: ${r.description}\n`);

    if (selectedTests.length === 1) {
        console.log("--- LOG COMPLETO DE INSTRUMENTAÇÃO DO JALANGI2 ---");
        console.log(r.output.trim());
        console.log("--------------------------------------------------\n");
    }
});

console.log("================================================================================");
console.log(`🏁 FINALIZADO: ${results.length - executionErrors}/${results.length} programas instrumentados e analisados com sucesso!`);
console.log("================================================================================\n");

if (executionErrors > 0) {
    process.exit(1);
}
