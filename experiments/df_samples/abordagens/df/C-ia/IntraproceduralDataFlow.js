// Sample.js – translation of IntraproceduralDataFlow (ES5)

function IntraproceduralDataFlow() {
    // constructor – no fields needed
}

// private int random() { return 10; }
IntraproceduralDataFlow.prototype.random = function () {
    return 10;
};

// private void blah(int z) { ... }
IntraproceduralDataFlow.prototype.blah = function (z) {
    var x = this.random();          // source
    var y = z * x;

    console.log(y);                 // System.out.println(y);

    x = 10;                         // sink assignment

    console.log(x);                 // System.out.println(x);
};

// public void foo() { ... }
IntraproceduralDataFlow.prototype.foo = function () {
    var x = this.random();          // source
    var y = x * 10;

    console.log(y);                 // System.out.println(y);

    this.blah(x);                   // sink call
};

// public static void main(String[] args) { new IntraproceduralDataFlow().foo(); }
IntraproceduralDataFlow.main = function (args) {
    new IntraproceduralDataFlow().foo();
};

// invoke main when the script is run
IntraproceduralDataFlow.main(process.argv.slice(2));
