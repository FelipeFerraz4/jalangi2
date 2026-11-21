// Sample.js – translation of ConfluenceWithTransitivitySample.java to ES5 JavaScript (Node.js)

function ConfluenceWithTransitivitySample() {
    // empty constructor
}

ConfluenceWithTransitivitySample.prototype.foo = function () {
    var x = 1;
    var y = 2;
    var z = 3;

    x = 10; // left

    z = x + 1;

    y++; // right

    // this.addThese(z, y); // method is commented out in the original source
    console.log(z + y); // System.out.println adds a newline
};

/* ConfluenceWithTransitivitySample.prototype.addThese = function (a1, a2) {
    return a1 + a2;
}; */

function main(args) {
    new ConfluenceWithTransitivitySample().foo();
}

// invoke main to produce the output
main([]);
