function _typeof(o) {"@babel/helpers - typeof";return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {return typeof o;} : function (o) {return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;}, _typeof(o);}function _classCallCheck(a, n) {if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");}function _defineProperties(e, r) {for (var t = 0; t < r.length; t++) {var o = r[t];o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);}}function _createClass(e, r, t) {return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;}function _toPropertyKey(t) {var i = _toPrimitive(t, "string");return "symbol" == _typeof(i) ? i : i + "";}function _toPrimitive(t, e) {if ("object" != _typeof(t) || !t) return t;var r;if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) {var i = r.call(t, e || "default");if ("object" != _typeof(i)) return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return ("string" === e ? String : Number)(t);}
var br;
(function (br) {
  var unb;
  (function (unb) {
    var cic;
    (function (cic) {
      var analysis;
      (function (analysis) {
        var samples;
        (function (samples) {var
          IntraproceduralIndirectSource = function () {"use strict";function IntraproceduralIndirectSource() {_classCallCheck(this, IntraproceduralIndirectSource);}return _createClass(IntraproceduralIndirectSource, [{ key: "m", value:
              function m() {
                var x = 1000;
                x = this.random();
                console.info(x);
                var y = x + 1;
                console.info(y);
              } }, { key: "random", value:
              function random() {
                return 0;
              } }, { key: "a", value:
              function a() {
                var mock = new br.unb.cic.analysis.samples.MockClass();
                mock.setA(1);
                var y = mock.getA() + 1;
                console.info(y);
              } }], [{ key: "main", value:
              function main(args) {
                var o = new IntraproceduralIndirectSource();
                o.m();
                o.a();
              } }]);}();

          samples.IntraproceduralIndirectSource = IntraproceduralIndirectSource;
          IntraproceduralIndirectSource["__class"] = "br.unb.cic.analysis.samples.IntraproceduralIndirectSource";var
          MockClass = function () {"use strict";
            function MockClass() {_classCallCheck(this, MockClass);
              if (this.a === undefined) {
                this.a = 0;
              }
            }return _createClass(MockClass, [{ key: "setA", value:
              function setA(a) {
                this.a = a;
              } }, { key: "getA", value:
              function getA() {
                return this.a;
              } }]);}();

          samples.MockClass = MockClass;
          MockClass["__class"] = "br.unb.cic.analysis.samples.MockClass";
        })(samples = analysis.samples || (analysis.samples = {}));
      })(analysis = cic.analysis || (cic.analysis = {}));
    })(cic = unb.cic || (unb.cic = {}));
  })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.IntraproceduralIndirectSource.main(null);
