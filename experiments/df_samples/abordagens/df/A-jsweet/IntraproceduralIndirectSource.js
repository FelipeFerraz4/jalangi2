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
                    var IntraproceduralIndirectSource = /** @class */ (function () {
                        function IntraproceduralIndirectSource() {
                        }
                        IntraproceduralIndirectSource.prototype.m = function () {
                            var x = 1000;
                            x = this.random();
                            console.info(x);
                            var y = x + 1;
                            console.info(y);
                        };
                        /*private*/ IntraproceduralIndirectSource.prototype.random = function () {
                            return 0;
                        };
                        IntraproceduralIndirectSource.prototype.a = function () {
                            var mock = new br.unb.cic.analysis.samples.MockClass();
                            mock.setA(1);
                            var y = mock.getA() + 1;
                            console.info(y);
                        };
                        IntraproceduralIndirectSource.main = function (args) {
                            var o = new IntraproceduralIndirectSource();
                            o.m();
                            o.a();
                        };
                        return IntraproceduralIndirectSource;
                    }());
                    samples.IntraproceduralIndirectSource = IntraproceduralIndirectSource;
                    IntraproceduralIndirectSource["__class"] = "br.unb.cic.analysis.samples.IntraproceduralIndirectSource";
                    var MockClass = /** @class */ (function () {
                        function MockClass() {
                            if (this.a === undefined) {
                                this.a = 0;
                            }
                        }
                        MockClass.prototype.setA = function (a) {
                            this.a = a;
                        };
                        MockClass.prototype.getA = function () {
                            return this.a;
                        };
                        return MockClass;
                    }());
                    samples.MockClass = MockClass;
                    MockClass["__class"] = "br.unb.cic.analysis.samples.MockClass";
                })(samples = analysis.samples || (analysis.samples = {}));
            })(analysis = cic.analysis || (cic.analysis = {}));
        })(cic = unb.cic || (unb.cic = {}));
    })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.IntraproceduralIndirectSource.main(null);
