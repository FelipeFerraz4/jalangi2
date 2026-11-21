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
                    /**
                     * with the current analysis setup Soot,
                     * when optimizing the code, ends up erasing
                     * variable references that have a constant
                     * attributed to them, preventing the conflict
                     * detection by the analyzer if such attribution
                     * happens to be a line of interest(source or sink).
                     *
                     * @class
                     */
                    var SourceSinkVariableAttributionSample = /** @class */ (function () {
                        function SourceSinkVariableAttributionSample() {
                        }
                        SourceSinkVariableAttributionSample.prototype.foo = function () {
                            var x = 0;
                            var y = 0;
                            var z = 10;
                            x = 10;
                            y = z + 2;
                            this.addThese(x, y);
                        };
                        /*private*/ SourceSinkVariableAttributionSample.prototype.addThese = function (a0, a1) {
                            return a0 + a1;
                        };
                        SourceSinkVariableAttributionSample.main = function (args) {
                            new SourceSinkVariableAttributionSample().foo();
                        };
                        return SourceSinkVariableAttributionSample;
                    }());
                    samples.SourceSinkVariableAttributionSample = SourceSinkVariableAttributionSample;
                    SourceSinkVariableAttributionSample["__class"] = "br.unb.cic.analysis.samples.SourceSinkVariableAttributionSample";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.SourceSinkVariableAttributionSample.main(null);
