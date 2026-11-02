var ultimo = 0;
var soma = 0;

for (var i = 1; i <= 3; i++) {
    soma = soma + i;
    ultimo = i;             // [Branch L]
}

ultimo = soma;              // [Branch R]
ultimo = ultimo + 1;        // [Branch R]
