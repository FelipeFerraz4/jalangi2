function MultipleConfluenceSample() {
}

MultipleConfluenceSample.prototype.multipleConfluencesToTheSameLine = function () {
    var x = 0;
    var y = 0;
    var z = 0;

    x = x + 1; // source
    y = y + 1; // source
    z = z + 1; // sink

    console.log(x);
    console.log(y);
    console.log(z);
    console.log(x + y + z);
};

function main() {
    new MultipleConfluenceSample().multipleConfluencesToTheSameLine();
}

main();
