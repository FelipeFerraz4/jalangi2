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
                    var ArrayDataFlowSample = /** @class */ (function () {
                        function ArrayDataFlowSample() {
                        }
                        ArrayDataFlowSample.main = function (args) {
                            var arr = [0, 0, 0, 0, 0];
                            arr = ArrayDataFlowSample.populate(arr.length);
                            arr[4] = 10;
                            var b = arr[4];
                            for (var index = 0; index < arr.length; index++) {
                                var a = arr[index];
                                console.info(a);
                            }
                        };
                        /*private*/ ArrayDataFlowSample.populate = function (size) {
                            var res = (function (s) { var a = []; while (s-- > 0)
                                a.push(0); return a; })(size);
                            for (var i = 0; i < size; i++) {
                                res[i] = i + 1;
                            }
                            return res;
                        };
                        return ArrayDataFlowSample;
                    }());
                    samples.ArrayDataFlowSample = ArrayDataFlowSample;
                    ArrayDataFlowSample["__class"] = "br.unb.cic.analysis.samples.ArrayDataFlowSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.ArrayDataFlowSample.main(null);
