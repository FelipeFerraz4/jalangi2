var preco = 100;            // [Base]
var configStatus = "init";  // [Base]

var descontoL = 15;         // [Branch L]
var precoComDesconto = preco - descontoL; // [Branch L]
configStatus = "ativo_L";   // [Branch L]

configStatus = "padrao_BASE"; // [Base - Kill]

var taxaR = 5;              // [Branch R]
var precoComTaxa = preco + taxaR; // [Branch R]
var logStatus = configStatus; // [Branch R]
