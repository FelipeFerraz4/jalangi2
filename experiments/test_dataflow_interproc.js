// ==============================================================================
// TESTE 4: DATA FLOW INTERPROCEDURAL (Chamadas de Função Cruzadas)
// ==============================================================================
// Cenário de Integração:
// - Base define funções utilitárias e estado compartilhado.
// - Branch L altera uma função produtora que altera o estado: setTaxa(v) (linha 24)
// - Branch R altera uma função consumidora que calcula o total: calcularTotal(p) (linha 30)
// Demonstra que a análise dinâmica detecta fluxos de dados mesmo através de
// fronteiras de métodos e funções (interprocedural).
// ==============================================================================

if (typeof J$ !== 'undefined' && J$.analysis && J$.analysis.setBranches) {
    J$.analysis.setBranches({
        "L": [24],      // Branch L alterou a atribuição dentro de setTaxa (linha 24)
        "R": [29]       // Branch R alterou o cálculo dentro de calcularTotal (linha 29)
    });
}

// --- [CÓDIGO BASE] ---
var taxaServico = 0;

function setTaxa(novaTaxa) {
    // --- [ALTERAÇÃO DA BRANCH L] ---
    taxaServico = novaTaxa; // Linha 24: L atualiza a taxa
}

function calcularTotal(precoBase) {
    // --- [ALTERAÇÃO DA BRANCH R] ---
    return precoBase + taxaServico; // Linha 30: R lê a taxa atualizada por L
}

// Execução do fluxo de integração
setTaxa(20);
var totalFinal = calcularTotal(100);

console.log("[test_dataflow_interproc] Total retornado pela função:", totalFinal);
