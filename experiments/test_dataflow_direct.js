// ==============================================================================
// TESTE 1: DETECÇÃO DIRETA DE CONFLITO DE DATA FLOW (Caso Positivo)
// ==============================================================================
// Cenário de Merge Concorrente:
// - Branch L modificou a taxa de serviço (linha 10: taxa = 15).
// - Branch R introduziu um novo cálculo que lê a taxa (linha 15: preco + taxa).
// - Conflito Semântico: Branch R consome um valor produzido por Branch L sem
//   que os desenvolvedores tivessem conhecimento mútuo da alteração.
// ==============================================================================

// Configuração programática do mapeamento de branches (caso não venha de arquivo externo)
if (typeof J$ !== 'undefined' && J$.analysis && J$.analysis.setBranches) {
    J$.analysis.setBranches({
        "L": [23],      // Branch L alterou a linha 23 (Produtor: taxa = 15)
        "R": [29, 30]   // Branch R alterou as linhas 29 e 30 (Consumidor: lê taxa)
    });
}

var taxa = 0;       // Base: Linha 8
var preco = 100;    // Base: Linha 9

// --- [ALTERAÇÃO DA BRANCH L] ---
taxa = 15;          // Linha 12 (será ajustada conforme número exato de linha)

// --- [CÓDIGO BASE / NÃO MODIFICADO] ---
console.log("Taxa definida. Prosseguindo...");

// --- [ALTERAÇÃO DA BRANCH R] ---
var frete = 10;     // Linha 18: R inicializou nova variável
var totalFinal = (preco + taxa) + frete; // Linha 19: R leu 'taxa' produzida por L!

console.log("[test_dataflow_direct] Total calculado:", totalFinal);
