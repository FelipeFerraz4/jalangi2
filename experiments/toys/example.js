var discount = -5;

function apply(price) {
    if (price > 50) {
        discount = -10;
    }
    var final = price + discount;
    return final;
}

console.log(apply(80));
