var discount = -5; // [Branch R]

function apply(price) {
    if (price > 50) {
        discount = -10; // [Branch L]
    }
    var final = price + discount;
    return final;
}

console.log("[example.js] Preco final:", apply(80));
