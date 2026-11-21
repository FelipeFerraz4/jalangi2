// Sample.js – translation of SourceSinkMethodCallSample.java to ES5 JavaScript (Node.js)

function SourceSinkMethodCallSample() {
    // constructor – no fields needed
}

// public void foo()
SourceSinkMethodCallSample.prototype.foo = function () {
    var x = 10;
    var y = 20;

    // x = one(); // right
    x = this.one();

    // y = two(); // left
    y = this.two();

    // System.out.println(x+y);
    console.log(x + y); // adds a newline, matching println
};

// private int one()
SourceSinkMethodCallSample.prototype.one = function () {
    return 1;
};

// private int two()
SourceSinkMethodCallSample.prototype.two = function () {
    return 2;
};

// public static void main(String[] args)
function main(args) {
    new SourceSinkMethodCallSample().foo();
}

// invoke main (no command‑line arguments needed)
main([]);
