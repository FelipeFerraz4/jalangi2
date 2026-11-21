// Sample.js – translation of SourceSinkVariableAttributionWithAutoIncrement.java to ES5 JavaScript

function SourceSinkVariableAttributionWithAutoIncrement() {
    // constructor (no initialization needed)
}

// Method foo: replicates the Java foo() logic
SourceSinkVariableAttributionWithAutoIncrement.prototype.foo = function () {
    var x = 0;
    var y = 0;
    var z = 10;

    x = 10;      // left
    x++;         // base (post‑increment)
    y = z + 2;   // right

    // Call addThese, ignore the returned value just like the Java version
    this.addThese(x, y);
};

// Private-like method addThese (Java's private is not enforceable in JS)
SourceSinkVariableAttributionWithAutoIncrement.prototype.addThese = function (a0, a1) {
    return a0 + a1;
};

// Simulated Java static main method
function main(args) {
    new SourceSinkVariableAttributionWithAutoIncrement().foo();
}

// Invoke main with an empty argument list (as Java does)
main([]);
