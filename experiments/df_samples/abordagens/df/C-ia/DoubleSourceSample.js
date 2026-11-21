// Sample.js – translation of DoubleSourceSample.java (ES5)

function DoubleSourceSample() {}

/**
 * Simulates the Java main method.
 * @param {Array.<string>} args - command‑line arguments (equivalent to Java's String[] args)
 */
DoubleSourceSample.main = function (args) {
    // int x = 10;
    var x = 10;
    // int y = 20;
    var y = 20;

    // x = x + 1;   // left
    x = x + 1;

    // System.out.println(args);
    // In Java this prints the array object's default toString (e.g., [Ljava.lang.String;@hash).
    // Here we simply output the array contents, which is the closest analogue in Node.
    console.log(args);

    // y = y - 1;   // right
    y = y - 1;

    // System.out.println(x + y);
    console.log(x + y);
};

// Invoke main with the arguments passed to the Node process (excluding "node" and script name)
DoubleSourceSample.main(process.argv.slice(2));
