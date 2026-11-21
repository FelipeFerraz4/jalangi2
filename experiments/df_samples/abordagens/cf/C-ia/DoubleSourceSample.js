// Sample.js – translation of DoubleSourceSample.java to ES5 JavaScript (Node.js)

function DoubleSourceSample() {}

/**
 * Simulates the Java main method.
 * @param {Array.<string>} args - Command‑line arguments (equivalent to Java's String[] args)
 */
DoubleSourceSample.main = function (args) {
    var x = 10;
    var y = 20;

    // left
    x = x + 1;

    // System.out.println(args);
    // In Java this prints the array's default toString (e.g., [Ljava.lang.String;@hashcode).
    // Using console.log reproduces the “print object + newline” behaviour.
    console.log(args);

    // right
    y = y - 1;

    // System.out.println(x + y);
    console.log(x + y);
};

// Invoke the main method with the Node.js command‑line arguments (excluding “node” and script name)
DoubleSourceSample.main(process.argv.slice(2));
