// Sample.js – translation of ConfluenceBaseSample from Java to ES5 JavaScript (Node.js)

function ConfluenceBaseSample() {
    this.text = null;
    this.words = null;
    this.spaces = null;
}

ConfluenceBaseSample.prototype.countFixes = function () {
    var confluenceBaseSample = new ConfluenceBaseSample();
    confluenceBaseSample.countDupWhitespace(); // LEFT
    confluenceBaseSample.countComments();
    confluenceBaseSample.countDupWords();      // RIGHT
    return confluenceBaseSample.spaces + confluenceBaseSample.words;
};

ConfluenceBaseSample.prototype.countDupWords = function () {
    this.words = new Number(2);
};

ConfluenceBaseSample.prototype.countComments = function () {
    // intentionally empty
};

ConfluenceBaseSample.prototype.countDupWhitespace = function () {
    this.spaces = new Number(1);
};

function main(args) {
    console.log(new ConfluenceBaseSample().countFixes());
}

// invoke main
main([]);
