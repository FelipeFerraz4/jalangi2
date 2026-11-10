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
          ArrayDataFlowSample = function () {"use strict";function ArrayDataFlowSample() {_classCallCheck(this, ArrayDataFlowSample);}return _createClass(ArrayDataFlowSample, null, [{ key: "main", value:
              function main(args) {
                var arr = [0, 0, 0, 0, 0];
                arr = ArrayDataFlowSample.populate(arr.length);
                arr[4] = 10;
                var b = arr[4];
                for (var index = 0; index < arr.length; index++) {
                  var a = arr[index];
                  console.info(a);
                }
              } }, { key: "populate", value:
              function populate(size) {
                var res = function (s) {var a = [];while (s-- > 0)
                  a.push(0);return a;}(size);
                for (var i = 0; i < size; i++) {
                  res[i] = i + 1;
                }
                return res;
              } }]);}();

          samples.ArrayDataFlowSample = ArrayDataFlowSample;
          ArrayDataFlowSample["__class"] = "br.unb.cic.analysis.samples.ArrayDataFlowSample";
        })(samples = analysis.samples || (analysis.samples = {}));
      })(analysis = cic.analysis || (cic.analysis = {}));
    })(cic = unb.cic || (unb.cic = {}));
  })(unb = br.unb || (br.unb = {}));
})(br || (br = {}));
br.unb.cic.analysis.samples.ArrayDataFlowSample.main(null);
