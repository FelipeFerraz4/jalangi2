var o = {};
var p = {};
o.x = 1; p.x = 1;           // [Branch L]
o.x = 2; p.x = 2;           // [Branch R]
o.y = 1; p.y = 1;           // [Branch L]
var s = o.y + p.y;          // [Branch R]
