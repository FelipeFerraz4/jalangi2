var itens = [10, 20, 30];
var subtotal = 0;
var desconto = 0;

for (var i = 0; i < itens.length; i++) {
    subtotal += itens[i];
    desconto = i * 2;       // [Branch L]
}

var total = subtotal - desconto; // [Branch R]
