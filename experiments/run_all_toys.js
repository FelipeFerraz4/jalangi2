// ==============================================================================
// RUNNER CONSOLIDADO DE EXECUÇÃO DOS TOYS NO JALANGI2
// ==============================================================================
// Cada toy roda uma única vez e a análise reporta OA, Data Flow e Confluence Flow.
// Data Flow e Confluence Flow saem em direto e transitivo.
const { runAnalysis } = require('./lib/analysis');

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
    },
    {
        name: "16. Data Flow por parâmetro (test_dataflow_param.js)",
        file: "experiments/toys/test_dataflow_param.js",
        branchMap: { "L": [6], "R": [2] },
        description: "L passa o argumento na chamada e R lê o parâmetro dentro da função"
    },
    {
        name: "17. Parâmetro passado pela Base (test_dataflow_param_safe.js)",
        file: "experiments/toys/test_dataflow_param_safe.js",
        branchMap: { "L": [], "R": [2] },
        description: "A chamada é da Base: R lê o parâmetro sem consumir valor de L"
    },
    {
        name: "18. Parâmetro reatribuído (test_dataflow_param_reassign.js)",
        file: "experiments/toys/test_dataflow_param_reassign.js",
        branchMap: { "L": [6], "R": [2] },
        description: "R lê e reatribui o parâmetro de L (DF), e o return, executado a mando de L, lê o valor de R (DF); sem OA"
    },
    {
        name: "19. Fluxo transitivo (test_taint_transitive.js)",
        file: "experiments/toys/test_taint_transitive.js",
        branchMap: { "L": [2], "R": [4] },
        description: "L define origem, a Base deriva derivado dela e R lê derivado: x -> y -> uso"
    },
    {
        name: "20. Transitivo por função (test_taint_function.js)",
        file: "experiments/toys/test_taint_function.js",
        branchMap: { "L": [5], "R": [7] },
        description: "O valor de L passa por parâmetro e retorno antes de R lê-lo"
    },
    {
        name: "21. Base interrompe a contaminação (test_taint_kill.js)",
        file: "experiments/toys/test_taint_kill.js",
        branchMap: { "L": [1], "R": [4] },
        description: "A Base reatribui derivado com uma constante antes de R ler: sem conflito"
    },
    {
        name: "22. Confluence Flow direto (test_confluence_direct.js)",
        file: "experiments/toys/test_confluence_direct.js",
        branchMap: { "L": [3], "R": [4] },
        description: "Um comando da Base usa o valor de L e o de R ao mesmo tempo"
    },
    {
        name: "23. Valores usados em comandos separados (test_confluence_separate.js)",
        file: "experiments/toys/test_confluence_separate.js",
        branchMap: { "L": [3], "R": [4] },
        description: "A Base usa o valor de L num comando e o de R em outro: não há confluência"
    },
    {
        name: "24. Confluence Flow transitivo (test_confluence_transitive.js)",
        file: "experiments/toys/test_confluence_transitive.js",
        branchMap: { "L": [3], "R": [4] },
        description: "Os valores de L e R passam por variáveis da Base antes de se encontrarem em z"
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

const results = selectedTests.map(t => Object.assign({ t }, runAnalysis({ file: t.file, branchMap: t.branchMap })));
const executionErrors = results.filter(r => r.failed).length;

const withTransitive = (direct, transitive) => direct + (transitive > 0 ? ` (+${transitive} transitivo)` : '');

console.log("--------------------------------------------------------------------------------");
console.log("📋 RELATÓRIO CONSOLIDADO DAS DETECÇÕES");
console.log("--------------------------------------------------------------------------------");
results.forEach(r => {
    const statusIcon = r.failed ? "✖ ERRO DE EXECUÇÃO" : "✔";
    console.log(`${statusIcon} ${r.t.name}`);
    console.log(`   • Conflitos Detectados: Overriding Assignment (OA): ${r.oa} | Data Flow (DF): ${withTransitive(r.df, r.dfTransitive)} | Confluence Flow (CF): ${withTransitive(r.cf, r.cfTransitive)}`);
    console.log(`   • Descrição: ${r.t.description}\n`);

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
