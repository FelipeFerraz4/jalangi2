// Sample.js – translation of ConfluenceBaseSample2.java to ES5 JavaScript (Node.js)

function ConfluenceBaseSample2() {
    // constructor – no initialization needed
}

// method m replicates the Java logic
ConfluenceBaseSample2.prototype.m = function () {
    var x = 1; // LEFT
    var base = 1;
    var y = 1; // RIGHT
    var z;
    if (x + y > 1) {
        z = 1;
    } else {
        z = 0;
    }
    // No output required
};

// main function analogous to Java's public static void main(String[] args)
function main(args) {
    new ConfluenceBaseSample2().m();
}

// invoke main with command‑line arguments (if any)
main(process.argv.slice(2));
