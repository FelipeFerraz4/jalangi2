var pedido = {              // [Base]
    subtotal: 100,          // [Base]
    taxa: 5                 // [Base]
};

pedido.taxa = 25;           // [Branch L]

var frete = 10;             // [Branch R]
var total = pedido.subtotal + pedido.taxa + frete; // [Branch R]
