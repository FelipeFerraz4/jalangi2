// ==============================================================================
// TESTE 3: DATA FLOW EM PROPRIEDADES DE OBJETOS (Estado Independente)
// ==============================================================================
// Cenário de Integração:
// - Base define um objeto com múltiplas propriedades: config = { taxa: 5, desconto: 0 }
// - Branch L altera uma propriedade específica: config.taxa = 25 (linha 22)
// - Branch R lê essa propriedade específica: config.taxa (linha 26)
// Demonstra o uso de putFieldPre e getField no Jalangi2.
// ==============================================================================

if (typeof J$ !== 'undefined' && J$.analysis && J$.analysis.setBranches) {
    J$.analysis.setBranches({
        "L": [25],      // Branch L alterou a linha 25 (pedido.taxa = 25)
        "R": [31, 32]   // Branch R alterou as linhas 31 e 32 (consome pedido.taxa)
    });
}

// --- [CÓDIGO BASE] ---
var pedido = {
    subtotal: 100,
    taxa: 5
};

// --- [ALTERAÇÃO DA BRANCH L] ---
pedido.taxa = 25; // Linha 22: L escreve na propriedade 'taxa' do objeto 'pedido'

// --- [CÓDIGO BASE / NÃO MODIFICADO] ---
console.log("Processando pedido...");

// --- [ALTERAÇÃO DA BRANCH R] ---
var frete = 10;
var total = pedido.subtotal + pedido.taxa + frete; // Linha 27: R lê 'pedido.taxa' modificada por L!

console.log("[test_dataflow_object] Total com taxa atualizada:", total);
