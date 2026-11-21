/* Generated from Java with JSweet 3.1.0 - http://www.jsweet.org */
var br;
(function (br) {
    var unb;
    (function (unb) {
        var cic;
        (function (cic) {
            var analysis;
            (function (analysis) {
                var samples;
                (function (samples) {
                    var InterproceduralConfluenceSample = /** @class */ (function () {
                        function InterproceduralConfluenceSample() {
                            this.counter = 0;
                        }
                        InterproceduralConfluenceSample.prototype.interproceduralSample = function () {
                            var x = 0;
                            var y = 0;
                            x = x + 1;
                            y = y + 2;
                            this.incrementCounter(x);
                            this.incrementCounter(y);
                        };
                        InterproceduralConfluenceSample.prototype.incrementCounter = function (value) {
                            this.counter += value;
                        };
                        InterproceduralConfluenceSample.main = function (args) {
                            new InterproceduralConfluenceSample().interproceduralSample();
                        };
                        return InterproceduralConfluenceSample;
                    }());
                    samples.InterproceduralConfluenceSample = InterproceduralConfluenceSample;
                    InterproceduralConfluenceSample["__class"] = "br.unb.cic.analysis.samples.InterproceduralConfluenceSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.InterproceduralConfluenceSample.main(null);
