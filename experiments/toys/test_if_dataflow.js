var taxa = 0;
var preco = 100;
var premium = true;

if (premium) {
    taxa = 15;              // [Branch L]
}

var total = preco;
if (premium) {
    total = total + taxa;   // [Branch R]
}
