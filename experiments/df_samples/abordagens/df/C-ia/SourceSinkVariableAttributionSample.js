// Sample.js – translation of SourceSinkVariableAttributionSample.java to ES5 JavaScript

function SourceSinkVariableAttributionSample() {
    // constructor – no fields needed
}

// instance method foo()
SourceSinkVariableAttributionSample.prototype.foo = function () {
    var x = 0;
    var y = 0;
    var z = 10;

    x = 10;          // left

    y = z + 2;       // right

    // Confluence line – result is ignored, as in the Java version
    this.addThese(x, y);
};

// private (simulated) method addThese(int a0, int a1)
SourceSinkVariableAttributionSample.prototype.addThese = function (a0, a1) {
    return a0 + a1;
};

// static main method
SourceSinkVariableAttributionSample.main = function (args) {
    new SourceSinkVariableAttributionSample().foo();
};

// invoke main when the script is run
SourceSinkVariableAttributionSample.main([]);
