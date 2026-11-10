var estado = 0;

function falha() {
    throw new Error("falha");
}

try {
    falha();                // [Branch L]
} catch (e) {
    estado = -1;
}

estado = 1;
estado = 2;                 // [Branch R]
