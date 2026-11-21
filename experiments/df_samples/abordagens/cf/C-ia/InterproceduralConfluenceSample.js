// Sample.js – translation of InterproceduralConfluenceSample (ES5)

function InterproceduralConfluenceSample() {
    this.counter = 0;
}

InterproceduralConfluenceSample.prototype.interproceduralSample = function () {
    var x = 0;
    var y = 0;

    x = x + 1; // source
    y = y + 2; // sink

    this.incrementCounter(x);
    this.incrementCounter(y);
};

InterproceduralConfluenceSample.prototype.incrementCounter = function (value) {
    this.counter += value;
};

function main() {
    new InterproceduralConfluenceSample().interproceduralSample();
}

main();
