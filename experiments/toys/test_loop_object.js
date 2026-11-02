var conta = { saldo: 100, juros: 0 };

for (var m = 0; m < 3; m++) {
    conta.juros = m + 1;                          // [Branch L]
    conta.saldo = conta.saldo + conta.juros * 2;  // [Branch R]
}
