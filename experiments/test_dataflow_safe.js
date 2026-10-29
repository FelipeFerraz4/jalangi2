// ==============================================================================
// TESTE 2: EXECUÇÃO SEGURA SEM CONFLITOS DE DATA FLOW (Caso Negativo)
// ==============================================================================
// Demonstra dois princípios fundamentais da análise dinâmica:
// 1. Variáveis Independentes: Branch L e Branch R operam em variáveis distintas
//    sem contaminação cruzada.
// 2. Operação de "Kill" pela Base: Branch L modifica uma variável, mas a Base
//    sobrescreve seu valor antes que a Branch R a leia, anulando o fluxo concorrente.
// ==============================================================================

if (typeof J$ !== 'undefined' && J$.analysis && J$.analysis.setBranches) {
    J$.analysis.setBranches({
        "L": [22, 23, 24],  // Branch L mexe em descontoL e configStatus
        "R": [31, 32, 33]   // Branch R mexe em taxaR e consome configStatus pós-kill
    });
}

var preco = 100;            // Base (linha 17)
var configStatus = "init";  // Base (linha 18)

// --- [ALTERAÇÃO DA BRANCH L] ---
var descontoL = 15;         // Linha 21: Variável isolada de L
var precoComDesconto = preco - descontoL; // Linha 22: L lê sua própria variável
configStatus = "ativo_L";   // Linha 23: L escreve em configStatus

// --- [OPERAÇÃO DE KILL PELA BASE] ---
// A Base reseta/sobrescreve a variável, matando a definição de L
configStatus = "padrao_BASE"; // Linha 27 (Base)

// --- [ALTERAÇÃO DA BRANCH R] ---
var taxaR = 5;              // Linha 30: Variável isolada de R
var precoComTaxa = preco + taxaR; // Linha 31: R lê sua própria variável
var logStatus = configStatus;     // Linha 32: R lê configStatus que foi resetado pela Base!

console.log("[test_dataflow_safe] Preço L:", precoComDesconto);
console.log("[test_dataflow_safe] Preço R:", precoComTaxa);
console.log("[test_dataflow_safe] Status Base após Kill:", logStatus);
