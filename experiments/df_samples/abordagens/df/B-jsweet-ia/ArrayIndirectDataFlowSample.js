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
                    var ArrayIndirectDataFlowSample = /** @class */ (function () {
                        function ArrayIndirectDataFlowSample() {
                        }
                        ArrayIndirectDataFlowSample.main = function (args) {
                            var arr = [0, 0, 0, 0, 0];
                            arr[4] = 10;
                            var b = arr[3];
                            console.info(b);
                        };
                        return ArrayIndirectDataFlowSample;
                    }());
                    samples.ArrayIndirectDataFlowSample = ArrayIndirectDataFlowSample;
                    ArrayIndirectDataFlowSample["__class"] = "br.unb.cic.analysis.samples.ArrayIndirectDataFlowSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.ArrayIndirectDataFlowSample.main(null);
