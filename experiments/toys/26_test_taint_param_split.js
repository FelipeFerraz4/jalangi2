function segundo(p, q) {
    return q;               // [Branch R]
}
var a = 1;
var b = 2;
a = 10;                     // [Branch L]
var r = segundo(a, b);
