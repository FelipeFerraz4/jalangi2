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
                    var MultipleConfluenceSample = /** @class */ (function () {
                        function MultipleConfluenceSample() {
                        }
                        MultipleConfluenceSample.prototype.multipleConfluencesToTheSameLine = function () {
                            var x = 0;
                            var y = 0;
                            var z = 0;
                            x = x + 1;
                            y = y + 1;
                            z = z + 1;
                            console.info(x);
                            console.info(y);
                            console.info(z);
                            console.info(x + y + z);
                        };
                        MultipleConfluenceSample.main = function (args) {
                            new MultipleConfluenceSample().multipleConfluencesToTheSameLine();
                        };
                        return MultipleConfluenceSample;
                    }());
                    samples.MultipleConfluenceSample = MultipleConfluenceSample;
                    MultipleConfluenceSample["__class"] = "br.unb.cic.analysis.samples.MultipleConfluenceSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.MultipleConfluenceSample.main(null);
