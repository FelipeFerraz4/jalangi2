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
                    var SourceSinkMethodCallSample = /** @class */ (function () {
                        function SourceSinkMethodCallSample() {
                        }
                        SourceSinkMethodCallSample.prototype.foo = function () {
                            var x = 10;
                            var y = 20;
                            x = this.one();
                            y = this.two();
                            console.info(x + y);
                        };
                        /*private*/ SourceSinkMethodCallSample.prototype.one = function () {
                            return 1;
                        };
                        /*private*/ SourceSinkMethodCallSample.prototype.two = function () {
                            return 2;
                        };
                        SourceSinkMethodCallSample.main = function (args) {
                            new SourceSinkMethodCallSample().foo();
                        };
                        return SourceSinkMethodCallSample;
                    }());
                    samples.SourceSinkMethodCallSample = SourceSinkMethodCallSample;
                    SourceSinkMethodCallSample["__class"] = "br.unb.cic.analysis.samples.SourceSinkMethodCallSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.SourceSinkMethodCallSample.main(null);
