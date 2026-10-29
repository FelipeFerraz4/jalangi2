var taxaServico = 0;        // [Base]

function setTaxa(novaTaxa) {
    taxaServico = novaTaxa; // [Branch L]
}

function calcularTotal(precoBase) {
    return precoBase + taxaServico; // [Branch R]
}

setTaxa(20);
var totalFinal = calcularTotal(100);

console.log("[test_dataflow_interproc] Total retornado pela funcao:", totalFinal);
