(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],2:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],3:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _Authenticate = _interopRequireDefault(require("./modules/Authenticate.js"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

window.addEventListener("load", function () {
  parseURLParameters();
  new _Authenticate["default"]().loadClient();
  document.querySelector("#contestant_link").innerText = "".concat(window.location.host, "/contestant_join.ejs?hash=").concat(window.parameters.cont);
  document.querySelector("#host").addEventListener("click", function () {
    window.open("host_portal.ejs?hash=".concat(window.parameters.host), '_blank').focus();
  });
  document.querySelector("#contestant").addEventListener("click", function () {
    copyLink();
  });
  document.querySelector("#terminate").addEventListener("click", function () {
    var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function (event) {
      window.location = "host.ejs";
    });
    xhttp.open("POST", "game-manager-service");
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
      token: token,
      action: "terminate"
    }));
  });
});
/**
 * Extract value from the URL string, store in 'window.parameters'.
 */

function parseURLParameters() {
  window.parameters = {};
  var parameters = window.location.search.substr(1).split("&");

  var _iterator = _createForOfIteratorHelper(parameters),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _split$;

      var parameter = _step.value;
      var split = parameter.split(/=/);
      window.parameters[split[0]] = (_split$ = split[1]) !== null && _split$ !== void 0 ? _split$ : "";
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function copyLink() {
  var range = document.createRange();
  range.selectNode(document.getElementById("contestant_link"));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  window.range = range;
  document.execCommand("copy");
  document.querySelector("#message").classList.remove("flash");
  setTimeout(function () {
    return document.querySelector("#message").classList.add("flash");
  }, 0);
}

},{"./modules/Authenticate.js":5,"@babel/runtime/helpers/interopRequireDefault":3}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en
var Authenticate = /*#__PURE__*/function () {
  function Authenticate() {
    (0, _classCallCheck2["default"])(this, Authenticate);
    Object.assign(this, require("./googleFields.js"));
  }

  (0, _createClass2["default"])(Authenticate, [{
    key: "loadClient",
    value: function loadClient() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        gapi.load('client:auth2', function () {
          return _this.__initClient(resolve, reject);
        });
      });
    }
  }, {
    key: "__initClient",
    value: function __initClient(resolve, reject) {
      gapi.client.init({
        apiKey: this.developerKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scope
      }).then(function (result) {
        resolve();
      }, function (error) {
        console.log("ERROR INIT");
        console.log(error);
        reject(error);
      });
    }
  }, {
    key: "isAuthorized",
    value: function isAuthorized() {
      var user = gapi.auth2.getAuthInstance().currentUser.get();
      return user.hasGrantedScopes(this.scope);
    }
  }, {
    key: "signIn",
    value: function signIn() {
      gapi.auth2.getAuthInstance().signIn();
    }
  }, {
    key: "signOut",
    value: function signOut() {
      gapi.auth2.getAuthInstance().signOut();
    }
  }]);
  return Authenticate;
}();

module.exports = Authenticate;

},{"./googleFields.js":6,"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],6:[function(require,module,exports){
"use strict";

module.exports = {
  // The Browser API key obtained from the Google API Console.
  developerKey: 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0',
  // The Client ID obtained from the Google API Console. Replace with your own Client ID.
  clientId: "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com",
  // Replace with your own project number from console.developers.google.com.
  appId: "158823134681",
  // Array of API discovery doc URLs for APIs used by the quickstart
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  // Scope to use to access user's Drive items.
  scope: "https://www.googleapis.com/auth/drive.file"
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0LmpzIiwic3JjL2NsaWVudC9sYXVuY2hfY29uc29sZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ1BBOzs7Ozs7OztBQUVBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFJO0FBQ2hDLEVBQUEsa0JBQWtCO0FBQ2xCLE1BQUksd0JBQUosR0FBbUIsVUFBbkI7QUFFQSxFQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixFQUEyQyxTQUEzQyxhQUEwRCxNQUFNLENBQUMsUUFBUCxDQUFnQixJQUExRSx1Q0FBMkcsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBN0g7QUFFQSxFQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLEVBQWdDLGdCQUFoQyxDQUFpRCxPQUFqRCxFQUEwRCxZQUFJO0FB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eUNBRkY7QUFJYjtBQUNBLEVBQUEsUUFBUSxFQUFHLDBFQUxFO0FBT2I7QUFDQSxFQUFBLEtBQUssRUFBRyxjQVJLO0FBVWI7QUFDQSxFQUFBLGFBQWEsRUFBRyxDQUFDLDREQUFELENBWEg7QUFhYjtBQUNBLEVBQUEsS0FBSyxFQUFFO0FBZE0sQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjaztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiaW1wb3J0IEF1dGhlbnRpY2F0ZSBmcm9tICcuL21vZHVsZXMvQXV0aGVudGljYXRlLmpzJztcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKT0+e1xyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcbiAgICBuZXcgQXV0aGVudGljYXRlKCkubG9hZENsaWVudCgpO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVzdGFudF9saW5rXCIpLmlubmVyVGV4dCA9IGAke3dpbmRvdy5sb2NhdGlvbi5ob3N0fS9jb250ZXN0YW50X2pvaW4uZWpzP2hhc2g9JHt3aW5kb3cucGFyYW1ldGVycy5jb250fWA7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNob3N0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgIHdpbmRvdy5vcGVuKGBob3N0X3BvcnRhbC5lanM/aGFzaD0ke3dpbmRvdy5wYXJhbWV0ZXJzLmhvc3R9YCwgJ19ibGFuaycpLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlc3RhbnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgY29weUxpbmsoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVybWluYXRlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdG9rZW4gPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpLmdldEF1dGhSZXNwb25zZSgpLmlkX3Rva2VuO1xyXG5cclxuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gICAgICAgICAgICB4aHR0cC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGBob3N0LmVqc2A7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgeGh0dHAub3BlbihcIlBPU1RcIiwgXCJnYW1lLW1hbmFnZXItc2VydmljZVwiKTtcclxuICAgICAgICAgICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICAgICAgICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgdG9rZW46IHRva2VuLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uIDogXCJ0ZXJtaW5hdGVcIlxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG4vKipcclxuICogRXh0cmFjdCB2YWx1ZSBmcm9tIHRoZSBVUkwgc3RyaW5nLCBzdG9yZSBpbiAnd2luZG93LnBhcmFtZXRlcnMnLlxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VVUkxQYXJhbWV0ZXJzKCkge1xyXG4gICAgd2luZG93LnBhcmFtZXRlcnMgPSB7fTtcclxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5zcGxpdChcIiZcIik7XHJcbiAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBwYXJhbWV0ZXIuc3BsaXQoLz0vKTtcclxuICAgICAgICB3aW5kb3cucGFyYW1ldGVyc1tzcGxpdFswXV0gPSBzcGxpdFsxXSA/PyBcIlwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb3B5TGluaygpIHtcclxuICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVzdGFudF9saW5rXCIpKTtcclxuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZShyYW5nZSk7XHJcbiAgICB3aW5kb3cucmFuZ2UgPSByYW5nZTtcclxuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiZmxhc2hcIik7XHJcbiAgICBzZXRUaW1lb3V0KCgpPT5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VcIikuY2xhc3NMaXN0LmFkZChcImZsYXNoXCIpLCAwKTtcclxufSIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQXV0aGVudGljYXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKSA9PiB0aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIElOSVRcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F1dGhvcml6ZWQoKXtcclxuICAgICAgICB2YXIgdXNlciA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuaGFzR3JhbnRlZFNjb3Blcyh0aGlzLnNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25JbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25PdXQoKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25PdXQoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRlOyIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8vIFRoZSBCcm93c2VyIEFQSSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLlxyXG4gICAgZGV2ZWxvcGVyS2V5IDogJ0FJemFTeUFCY2RMbVQ2SEhfN0dvODJxX0lCR0kzam02VUw0dzRRMCcsXHJcblxyXG4gICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICBjbGllbnRJZCA6IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXHJcblxyXG4gICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICBhcHBJZCA6IFwiMTU4ODIzMTM0NjgxXCIsXHJcblxyXG4gICAgLy8gQXJyYXkgb2YgQVBJIGRpc2NvdmVyeSBkb2MgVVJMcyBmb3IgQVBJcyB1c2VkIGJ5IHRoZSBxdWlja3N0YXJ0XHJcbiAgICBkaXNjb3ZlcnlEb2NzIDogW1wiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvZHJpdmUvdjMvcmVzdFwiXSxcclxuXHJcbiAgICAvLyBTY29wZSB0byB1c2UgdG8gYWNjZXNzIHVzZXIncyBEcml2ZSBpdGVtcy5cclxuICAgIHNjb3BlOiBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZVwiXHJcbn0iXX0=
