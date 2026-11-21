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
                    var SourceSinkVariableAttributionWithAutoIncrement = /** @class */ (function () {
                        function SourceSinkVariableAttributionWithAutoIncrement() {
                        }
                        SourceSinkVariableAttributionWithAutoIncrement.prototype.foo = function () {
                            var x = 0;
                            var y = 0;
                            var z = 10;
                            x = 10;
                            x++;
                            y = z + 2;
                            this.addThese(x, y);
                        };
                        /*private*/ SourceSinkVariableAttributionWithAutoIncrement.prototype.addThese = function (a0, a1) {
                            return a0 + a1;
                        };
                        SourceSinkVariableAttributionWithAutoIncrement.main = function (args) {
                            new SourceSinkVariableAttributionWithAutoIncrement().foo();
                        };
                        return SourceSinkVariableAttributionWithAutoIncrement;
                    }());
                    samples.SourceSinkVariableAttributionWithAutoIncrement = SourceSinkVariableAttributionWithAutoIncrement;
                    SourceSinkVariableAttributionWithAutoIncrement["__class"] = "br.unb.cic.analysis.samples.SourceSinkVariableAttributionWithAutoIncrement";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.SourceSinkVariableAttributionWithAutoIncrement.main(null);
