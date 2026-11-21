// Sample.js – translation of ConfluenceWithTransitivitySample.java (ES5)

function ConfluenceWithTransitivitySample() {
    // constructor (no fields to initialize)
}

// public void foo()
ConfluenceWithTransitivitySample.prototype.foo = function () {
    var x = 1;
    var y = 2;
    var z = 3;

    x = 10; // left

    z = x + 1;

    y++; // right

    // addThese(z, y);
    console.log(z + y); // System.out.println adds a newline
};

/*
 // private int addThese(int a1, int a2) { return a1 + a2; }
ConfluenceWithTransitivitySample.prototype.addThese = function (a1, a2) {
    return a1 + a2;
};
*/

function main(args) {
    new ConfluenceWithTransitivitySample().foo();
}

// call main to produce the output
main([]);
