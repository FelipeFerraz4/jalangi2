var pedido = {
    subtotal: 100,
    taxa: 5
};

pedido.taxa = 25;           // [Branch L]

var frete = 10;             // [Branch R]
var total = pedido.subtotal + pedido.taxa + frete; // [Branch R]
