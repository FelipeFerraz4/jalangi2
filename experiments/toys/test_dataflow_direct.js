var taxa = 0;       // [Base]
var preco = 100;    // [Base]

taxa = 15;          // [Branch L]

console.log("Taxa definida. Prosseguindo...");

var frete = 10;     // [Branch R]
var totalFinal = (preco + taxa) + frete; // [Branch R]

console.log("[test_dataflow_direct] Total calculado:", totalFinal);
