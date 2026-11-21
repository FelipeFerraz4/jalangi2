// Sample.js – translation of IntraproceduralIndirectSource.java to ES5 JavaScript

// MockClass definition
function MockClass() {
    this.a = 0;
}
MockClass.prototype.setA = function (a) {
    this.a = a;
};
MockClass.prototype.getA = function () {
    return this.a;
};

// IntraproceduralIndirectSource definition
function IntraproceduralIndirectSource() {}

IntraproceduralIndirectSource.prototype.random = function () {
    return 0;
};

IntraproceduralIndirectSource.prototype.m = function () {
    var x = 1000;
    x = this.random();               // source (left)
    console.log(x);                  // println -> adds newline
    var y = x + 1;
    process.stdout.write(y.toString()); // print -> no newline
};

IntraproceduralIndirectSource.prototype.a = function () {
    var mock = new MockClass();
    mock.setA(1);                    // source
    var y = mock.getA() + 1;
    console.log(y);                  // sink (println)
};

// main function – entry point
function main() {
    var o = new IntraproceduralIndirectSource();
    o.m();
    o.a();
}

// Execute main when the script is run
main();
