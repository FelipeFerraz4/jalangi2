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
                    var ConfluenceWithTransitivitySample = /** @class */ (function () {
                        function ConfluenceWithTransitivitySample() {
                        }
                        ConfluenceWithTransitivitySample.prototype.foo = function () {
                            var x = 1;
                            var y = 2;
                            var z = 3;
                            x = 10;
                            z = x + 1;
                            y++;
                            console.info(z + y);
                        };
                        ConfluenceWithTransitivitySample.main = function (args) {
                            new ConfluenceWithTransitivitySample().foo();
                        };
                        return ConfluenceWithTransitivitySample;
                    }());
                    samples.ConfluenceWithTransitivitySample = ConfluenceWithTransitivitySample;
                    ConfluenceWithTransitivitySample["__class"] = "br.unb.cic.analysis.samples.ConfluenceWithTransitivitySample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.ConfluenceWithTransitivitySample.main(null);
