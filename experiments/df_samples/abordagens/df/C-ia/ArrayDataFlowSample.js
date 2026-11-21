// Sample.js – translation of ArrayDataFlowSample.java to ES5 JavaScript (Node.js)

function ArrayDataFlowSample() {}

/**
 * Replicates the Java static method populate(int size)
 * @param {number} size
 * @returns {Array<number>}
 */
ArrayDataFlowSample.populate = function (size) {
    var res = new Array(size);
    for (var i = 0; i < size; i++) {
        res[i] = i + 1;
    }
    return res;
};

/**
 * Replicates the Java static void main(String[] args)
 * @param {Array<string>} args
 */
ArrayDataFlowSample.main = function (args) {
    // int[] arr = {0,0,0,0,0};
    var arr = [0, 0, 0, 0, 0];

    // arr = populate(arr.length);
    arr = ArrayDataFlowSample.populate(arr.length); // source 1

    // arr[4] = 10;
    arr[4] = 10; // source 2

    // int b = arr[4];
    var b = arr[4]; // sink 2 (value not used further)

    // for (int a : arr) System.out.println(a);
    for (var i = 0; i < arr.length; i++) {
        console.log(arr[i]); // sink 1 – println adds a newline
    }
};

// Invoke main with command‑line arguments (if any)
ArrayDataFlowSample.main(process.argv.slice(2));
