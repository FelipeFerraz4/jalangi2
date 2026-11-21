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
                    var IntraproceduralDataFlow = /** @class */ (function () {
                        function IntraproceduralDataFlow() {
                        }
                        IntraproceduralDataFlow.prototype.foo = function () {
                            var x = this.random();
                            var y = x * 10;
                            console.info(y);
                            this.blah(x);
                        };
                        /*private*/ IntraproceduralDataFlow.prototype.random = function () {
                            return 10;
                        };
                        /*private*/ IntraproceduralDataFlow.prototype.blah = function (z) {
                            var x = this.random();
                            var y = z * x;
                            console.info(y);
                            x = 10;
                            console.info(x);
                        };
                        IntraproceduralDataFlow.main = function (args) {
                            new IntraproceduralDataFlow().foo();
                        };
                        return IntraproceduralDataFlow;
                    }());
                    samples.IntraproceduralDataFlow = IntraproceduralDataFlow;
                    IntraproceduralDataFlow["__class"] = "br.unb.cic.analysis.samples.IntraproceduralDataFlow";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.IntraproceduralDataFlow.main(null);
