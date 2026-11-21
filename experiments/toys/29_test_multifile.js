var lib = require('./29_lib/contador');
var total = 0;
total = 10;                 // [Branch L]
lib.registrar(total);
var dobro = total * 2;      // [Branch R]
