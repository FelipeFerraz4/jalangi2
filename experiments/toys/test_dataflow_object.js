var pedido = {              // [Base]
    subtotal: 100,          // [Base]
    taxa: 5                 // [Base]
};

pedido.taxa = 25;           // [Branch L]

console.log("Processando pedido...");

var frete = 10;             // [Branch R]
var total = pedido.subtotal + pedido.taxa + frete; // [Branch R]

console.log("[test_dataflow_object] Total com taxa atualizada:", total);
