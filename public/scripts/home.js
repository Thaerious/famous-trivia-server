(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],2:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],3:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],4:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./isNativeReflectConstruct.js":10,"./setPrototypeOf.js":12}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],7:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./setPrototypeOf.js":12}],8:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],9:[function(require,module,exports){
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],10:[function(require,module,exports){
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],11:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof")["default"];

var assertThisInitialized = require("./assertThisInitialized.js");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./assertThisInitialized.js":1,"@babel/runtime/helpers/typeof":13}],12:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],13:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],14:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf.js");

var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeFunction = require("./isNativeFunction.js");

var construct = require("./construct.js");

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _wrapNativeSuper(Class);
}

module.exports = _wrapNativeSuper;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./construct.js":4,"./getPrototypeOf.js":6,"./isNativeFunction.js":9,"./setPrototypeOf.js":12}],15:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":16}],16:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],17:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Picker = require("./modules/Picker.js");

var FilePicker = require("./modules/FilePicker.js");

var Model = require("./modules/Model.js");

var FileOps = require("./modules/FileOps.js");

var Parameters = require("./modules/Parameters.js");

require("./modules/FileList.js");

window.FileOps = FileOps;
var folderId = null;
var fileOps = new FileOps();
window.fileOps = fileOps;
window.addEventListener("load", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return fileOps.load();

        case 2:
          addMenuListeners();
          setupFileList();

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));

function onLoad(event) {
  var id = event.detail.id;
  window.location = "editor.html?action=load&fileId=".concat(id);
}

function onLaunch(_x) {
  return _onLaunch.apply(this, arguments);
}

function _onLaunch() {
  _onLaunch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(event) {
    var id, file, xhttp;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = event.detail.id;
            _context6.next = 3;
            return fileOps.get(id);

          case 3:
            file = _context6.sent;
            console.log(file.body);
            xhttp = new XMLHttpRequest();
            xhttp.addEventListener("load", function (event) {
              console.log(event);
              console.log(JSON.parse(xhttp.responseText));
            });
            xhttp.open("POST", "launch");
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(file.body);

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _onLaunch.apply(this, arguments);
}

function setupFileList() {
  var fileList = document.querySelector("file-list");
  fileList.addEventListener("delete-file", /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(id) {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              fileList.busy = true;
              _context2.next = 3;
              return fileOps["delete"](id);

            case 3:
              populateFileList();
              fileList.busy = false;

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
}

function addMenuListeners() {
  var busyBox = document.querySelector(".busy-box");
  document.querySelector("#create").addEventListener("click", /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(e) {
      var model, fp;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              busyBox.classList.remove("hidden");
              model = new Model().init("Game Name");
              _context3.next = 4;
              return fileOps.create();

            case 4:
              fp = _context3.sent;
              _context3.next = 7;
              return fileOps.setBody(fp, JSON.stringify(model.get(), null, 2));

            case 7:
              location.href = location.origin + "/editor.html?action=load&fileId=" + fp;

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
  document.querySelector("#load").addEventListener("click", /*#__PURE__*/function () {
    var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(e) {
      var fileList;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              populateFileList();
              fileList = document.querySelector("file-list");
              fileList.addEventListener("select-file", onLoad, {
                once: true
              });

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
  document.querySelector("#launch").addEventListener("click", /*#__PURE__*/function () {
    var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(e) {
      var fileList;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              populateFileList();
              fileList = document.querySelector("file-list");
              fileList.addEventListener("select-file", onLaunch, {
                once: true
              });

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }());
}

function populateFileList() {
  return _populateFileList.apply(this, arguments);
}

function _populateFileList() {
  _populateFileList = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
    var busyBox, fileList, list, _iterator, _step, item, i;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            busyBox = document.querySelector(".busy-box");
            fileList = document.querySelector("file-list");
            fileList.show();
            fileList.busy = true;
            fileList.clear();
            _context7.next = 7;
            return fileOps.list();

          case 7:
            list = _context7.sent;
            _iterator = _createForOfIteratorHelper(list);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                item = _step.value;
                i = item.name.indexOf(".");
                fileList.addItem(item.name.substr(0, i), item.id);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            fileList.busy = false;

          case 11:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _populateFileList.apply(this, arguments);
}

window.populateFileList = populateFileList;

},{"./modules/FileList.js":19,"./modules/FileOps.js":20,"./modules/FilePicker.js":21,"./modules/Model.js":22,"./modules/Parameters.js":23,"./modules/Picker.js":24,"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":15}],18:[function(require,module,exports){
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

},{"./googleFields.js":25,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],19:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var DeleteFileEvent = /*#__PURE__*/function (_CustomEvent) {
  (0, _inherits2["default"])(DeleteFileEvent, _CustomEvent);

  var _super = _createSuper(DeleteFileEvent);

  function DeleteFileEvent(id) {
    (0, _classCallCheck2["default"])(this, DeleteFileEvent);
    return _super.call(this, 'delete-file', {
      detail: {
        id: id
      }
    });
  }

  return DeleteFileEvent;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var SelectFileEvent = /*#__PURE__*/function (_CustomEvent2) {
  (0, _inherits2["default"])(SelectFileEvent, _CustomEvent2);

  var _super2 = _createSuper(SelectFileEvent);

  function SelectFileEvent(id) {
    (0, _classCallCheck2["default"])(this, SelectFileEvent);
    return _super2.call(this, 'select-file', {
      detail: {
        id: id
      }
    });
  }

  return SelectFileEvent;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var FileList = /*#__PURE__*/function (_HTMLElement) {
  (0, _inherits2["default"])(FileList, _HTMLElement);

  var _super3 = _createSuper(FileList);

  function FileList(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, FileList);
    _this = _super3.call(this, props);
    window.addEventListener("load", function (event) {
      return _this.load();
    });
    return _this;
  }

  (0, _createClass2["default"])(FileList, [{
    key: "load",
    value: function load() {
      var _this2 = this;

      this.querySelector(".close").addEventListener("click", function () {
        _this2.hide();
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      var _iterator = _createForOfIteratorHelper(this.querySelectorAll(".file-item")),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ele = _step.value;
          this.querySelector("#inner-list").removeChild(ele);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "addItem",
    value: function addItem(filename, id) {
      var _this3 = this;

      var meta = document.createElement("div");
      meta.classList.add("file-item");
      meta.setAttribute("data-id", id);
      this.querySelector("#inner-list").appendChild(meta);
      var ele = document.createElement("span");
      ele.classList.add("file-name");
      ele.innerText = filename;
      meta.appendChild(ele);
      ele.addEventListener("click", function () {
        return _this3.dispatchEvent(new SelectFileEvent(id));
      });
      ele = document.createElement("span");
      ele.classList.add("delete");
      ele.innerText = "Delete";
      meta.appendChild(ele);
      ele.addEventListener("click", function () {
        return _this3.dispatchEvent(new DeleteFileEvent(id));
      });
    }
  }, {
    key: "show",
    value: function show() {
      this.classList.remove("hidden");
    }
  }, {
    key: "hide",
    value: function hide() {
      this.classList.add("hidden");
    }
  }, {
    key: "busy",
    set: function set(value) {
      if (value) this.querySelector("#file-list-busy").classList.remove("hidden");else this.querySelector("#file-list-busy").classList.add("hidden");
    }
  }]);
  return FileList;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(HTMLElement));

window.customElements.define('file-list', FileList);
module.exports = FileList;

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11,"@babel/runtime/helpers/wrapNativeSuper":14}],20:[function(require,module,exports){
"use strict"; // see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var FileOps = /*#__PURE__*/function () {
  function FileOps() {
    (0, _classCallCheck2["default"])(this, FileOps);
  }

  (0, _createClass2["default"])(FileOps, [{
    key: "load",
    value: function () {
      var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.loadClient();

              case 2:
                _context.next = 4;
                return this.loadDrive();

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "loadClient",
    value: function loadClient() {
      return new Promise(function (resolve, reject) {
        gapi.load('client', function () {
          return resolve();
        });
      });
    }
  }, {
    key: "loadDrive",
    value: function loadDrive() {
      return new Promise(function (resolve, reject) {
        gapi.client.load('drive', 'v3', resolve());
      });
    }
  }, {
    key: "create",
    value: function () {
      var _create = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.create({
                    name: FileOps.filename,
                    parents: ['appDataFolder'],
                    fields: "id"
                  }).then(function (res) {
                    resolve(res.result.id);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function create() {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(fileId) {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files["delete"]({
                    fileId: fileId
                  }).then(function (res) {
                    resolve(res.result);
                  }, function (error) {
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function _delete(_x) {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "list",
    value: function () {
      var _list = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.list({
                    // q: `name contains '.json'`,
                    spaces: 'appDataFolder',
                    fields: 'files/name,files/id,files/modifiedTime'
                  }).then(function (res) {
                    resolve(res.result.files);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function list() {
        return _list.apply(this, arguments);
      }

      return list;
    }()
  }, {
    key: "get",
    value: function () {
      var _get = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(fileId) {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.get({
                    fileId: fileId,
                    alt: 'media'
                  }).then(function (res) {
                    resolve(res);
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function get(_x2) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "setBody",
    value: function () {
      var _setBody = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(fileId, body) {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.request({
                    path: "upload/drive/v3/files/" + fileId,
                    method: "PATCH",
                    params: {
                      uploadType: "media"
                    },
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: body
                  }).then(function (res) {
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function setBody(_x3, _x4) {
        return _setBody.apply(this, arguments);
      }

      return setBody;
    }()
  }, {
    key: "rename",
    value: function () {
      var _rename = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(fileId, filename) {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.update({
                    fileId: fileId,
                    name: filename
                  }).then(function (res) {
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function rename(_x5, _x6) {
        return _rename.apply(this, arguments);
      }

      return rename;
    }()
  }]);
  return FileOps;
}();

FileOps.filename = "Game Name.json";
module.exports = FileOps;

},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":15}],21:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Picker = require("./Picker.js");

var FilePicker = /*#__PURE__*/function (_Picker) {
  (0, _inherits2["default"])(FilePicker, _Picker);

  var _super = _createSuper(FilePicker);

  function FilePicker() {
    (0, _classCallCheck2["default"])(this, FilePicker);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(FilePicker, [{
    key: "createPicker",
    value: // Create and render a Picker object for searching images.
    function createPicker() {
      var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setParent('root').setMimeTypes("json");
      ;

      if (this.pickerApiLoaded && this.oauthToken) {
        var picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN).addView(view).setAppId(this.appId).setOAuthToken(this.oauthToken).setDeveloperKey(this.developerKey).setCallback(this.pickerCallback) // .addView(new google.picker.DocsUploadView())
        .build();
        picker.setVisible(true);
      }
    } // A simple callback implementation.
    // Override this method on use.

  }, {
    key: "pickerCallback",
    value: function pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        window.location = "editor.html?action=load&fileId=".concat(fileId);
      }
    }
  }]);
  return FilePicker;
}(Picker);

module.exports = FilePicker;

},{"./Picker.js":24,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Model = /*#__PURE__*/function () {
  function Model() {
    (0, _classCallCheck2["default"])(this, Model);
  }

  (0, _createClass2["default"])(Model, [{
    key: "init",
    value: function init() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Game Name";
      this.currentRound = 0;
      this.gameModel = {
        name: name,
        rounds: []
      };
      this.addCategoryRound();
      return this;
    }
  }, {
    key: "name",
    get: function get() {
      return this.gameModel.name;
    },
    set: function set(string) {
      this.gameModel.name = string;
    }
  }, {
    key: "set",
    value: function set(gameModel) {
      this.currentRound = 0;
      this.gameModel = gameModel;
      return this;
    }
  }, {
    key: "get",
    value: function get() {
      return this.gameModel;
    }
  }, {
    key: "getRound",
    value: function getRound(index) {
      var _index;

      index = (_index = index) !== null && _index !== void 0 ? _index : this.currentRound;
      return this.gameModel.rounds[index];
    }
  }, {
    key: "getColumn",
    value: function getColumn(index) {
      return this.getRound().column[index];
    }
  }, {
    key: "getCell",
    value: function getCell(row, column) {
      return this.getColumn(column).cell[row];
    }
  }, {
    key: "removeRound",
    value: function removeRound() {
      if (this.roundCount === 1) return;
      this.gameModel.rounds.splice(this.currentRound, 1);
      if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }
  }, {
    key: "addMultipleChoiceRound",
    value: function addMultipleChoiceRound() {
      var round = {
        type: Model.questionType.MULTIPLE_CHOICE,
        question: "",
        answers: []
      };

      for (var i = 0; i < 6; i++) {
        round.answers[i] = {
          text: "",
          isTrue: false
        };
      }

      this.gameModel.rounds.push(round);
      return round;
    }
  }, {
    key: "addCategoryRound",
    value: function addCategoryRound() {
      var round = {
        type: Model.questionType.CATEGORY,
        column: []
      };

      for (var i = 0; i < 6; i++) {
        round.column[i] = {
          category: "",
          cell: []
        };

        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j] = {
            value: (j + 1) * 100,
            type: "text",
            q: "",
            a: ""
          };
        }
      }

      this.gameModel.rounds.push(round);
      return round;
    }
  }, {
    key: "roundCount",
    get: function get() {
      return this.gameModel.rounds.length;
    }
  }, {
    key: "incrementRound",
    value: function incrementRound() {
      this.currentRound++;
      if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }
  }, {
    key: "decrementRound",
    value: function decrementRound() {
      this.currentRound--;
      if (this.currentRound < 0) this.currentRound = 0;
    }
  }, {
    key: "increaseValue",
    value: function increaseValue() {
      var round = this.getRound();

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j].value *= 2;
        }
      }
    }
  }, {
    key: "decreaseValue",
    value: function decreaseValue() {
      var round = this.getRound();

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j].value /= 2;
        }
      }
    }
  }]);
  return Model;
}();

Model.questionType = {
  CATEGORY: "choice",
  MULTIPLE_CHOICE: "multiple_choice"
};
var _default = Model;
exports["default"] = _default;

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var AbstractFiles = require("./Authenticate.js");

var Parameters = /*#__PURE__*/function (_AbstractFiles) {
  (0, _inherits2["default"])(Parameters, _AbstractFiles);

  var _super = _createSuper(Parameters);

  function Parameters() {
    var _this;

    (0, _classCallCheck2["default"])(this, Parameters);
    _this = _super.call(this);
    _this.param = {
      last_file: ""
    };
    return _this;
  }

  (0, _createClass2["default"])(Parameters, [{
    key: "create",
    value: function () {
      var _create = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dirToken) {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.create({
                    name: Parameters.filename,
                    parents: ['appDataFolder'],
                    fields: "id"
                  }).then(function (res) {
                    console.log(res);
                    _this2.fileId = res.result.id;
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function create(_x) {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "read",
    value: function () {
      var _read = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this3 = this;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.get({
                    fileId: _this3.fileId,
                    alt: 'media'
                  }).then(function (res) {
                    _this3.param = JSON.parse(res.body);
                    resolve(res);
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function read() {
        return _read.apply(this, arguments);
      }

      return read;
    }()
  }, {
    key: "write",
    value: function () {
      var _write = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        var _this4 = this;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.request({
                    path: "upload/drive/v3/files/" + _this4.fileId,
                    method: "PATCH",
                    params: {
                      uploadType: "media"
                    },
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify(_this4.param)
                  }).then(function (res) {
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function write() {
        return _write.apply(this, arguments);
      }

      return write;
    }()
  }, {
    key: "exists",
    value: function () {
      var _exists = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var _this5 = this;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.list({
                    q: "name = 'settings.json'",
                    spaces: 'appDataFolder'
                  }).then(function (res) {
                    if (res.result.files.length > 0) {
                      _this5.fileId = res.result.files[0].id;
                      resolve(true);
                    }

                    resolve(false);
                  }, function (error) {
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function exists() {
        return _exists.apply(this, arguments);
      }

      return exists;
    }()
  }]);
  return Parameters;
}(AbstractFiles);

Parameters.filename = "settings.json";
module.exports = Parameters;

},{"./Authenticate.js":18,"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11,"@babel/runtime/regenerator":15}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Picker = /*#__PURE__*/function () {
  function Picker() {
    (0, _classCallCheck2["default"])(this, Picker);
    // The Browser API key obtained from the Google API Console.
    this.developerKey = 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0'; // The Client ID obtained from the Google API Console. Replace with your own Client ID.

    this.clientId = "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"; // Replace with your own project number from console.developers.google.com.

    this.appId = "158823134681"; // Scope to use to access user's Drive items.

    this.scope = ['https://www.googleapis.com/auth/drive.file'];
    this.oauthToken = null;
  } // Use the Google API Loader script to load the google.picker script.


  (0, _createClass2["default"])(Picker, [{
    key: "loadPicker",
    value: function loadPicker() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_this.oauthToken === null) {
          console.log("authorize");
          gapi.load('picker', {
            'callback': function callback() {
              gapi.load('auth2', {
                'callback': function callback() {
                  return _this.onAuthApiLoad(resolve, reject);
                }
              });
            }
          });
        } else {
          resolve();
        }
      });
    }
  }, {
    key: "onAuthApiLoad",
    value: function onAuthApiLoad(resolve, reject) {
      var _this2 = this;

      var param = {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false
      };
      window.gapi.auth2.authorize(param, function (authResult) {
        return _this2.handleAuthResult(authResult, resolve, reject);
      });
    }
  }, {
    key: "handleAuthResult",
    value: function handleAuthResult(authResult, resolve, reject) {
      if (authResult && !authResult.error) {
        this.oauthToken = authResult.access_token;
        resolve();
      } else {
        reject(authResult);
      }
    } // Create and render a Picker object for searching images.

  }, {
    key: "dirPicker",
    value: function dirPicker() {
      console.log("createPicker");

      if (this.oauthToken) {
        var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true);
        var picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN).addView(view).setAppId(this.appId).setOAuthToken(this.oauthToken).setDeveloperKey(this.developerKey).setCallback(this.pickerCallback).build();
        picker.setVisible(true);
      }
    } // Create and render a Picker object for searching images.

  }, {
    key: "filePicker",
    value: function filePicker() {
      var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setParent('root').setMimeTypes("json");
      ;

      if (this.pickerApiLoaded && this.oauthToken) {
        var picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN).addView(view).setAppId(this.appId).setOAuthToken(this.oauthToken).setDeveloperKey(this.developerKey).setCallback(this.pickerCallback) // .addView(new google.picker.DocsUploadView())
        .build();
        picker.setVisible(true);
      }
    } // Override this method on use.

  }, {
    key: "pickerCallback",
    value: function pickerCallback(data) {}
  }]);
  return Picker;
}();

module.exports = Picker;

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],25:[function(require,module,exports){
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

},{}]},{},[17])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2Fzc2VydFRoaXNJbml0aWFsaXplZC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3IuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NvbnN0cnVjdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZ2V0UHJvdG90eXBlT2YuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbmhlcml0cy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2lzTmF0aXZlRnVuY3Rpb24uanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2V0UHJvdG90eXBlT2YuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy93cmFwTmF0aXZlU3VwZXIuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvcmVnZW5lcmF0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lLmpzIiwic3JjL2NsaWVudC9ob21lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0F1dGhlbnRpY2F0ZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlTGlzdC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVQaWNrZXIuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTW9kZWwuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvUGFyYW1ldGVycy5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9QaWNrZXIuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUNwR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFDYjtBQUNBLEVBQUEsWUFBWSxFQUFHLHlDQUZGO0FBSWI7QUFDQSxFQUFBLFFBQVEsRUFBRywwRUFMRTtBQU9iO0FBQ0EsRUFBQSxLQUFLLEVBQUcsY0FSSztBQVViO0FBQ0EsRUFBQSxhQUFhLEVBQUcsQ0FBQyw0REFBRCxDQVhIO0FBYWI7QUFDQSxFQUFBLEtBQUssRUFBRTtBQWRNLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7XG4gIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXNzZXJ0VGhpc0luaXRpYWxpemVkO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gcmVxdWlyZShcIi4vaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzXCIpO1xuXG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgaWYgKGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3Q7XG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IGZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICAgICAgdmFyIGEgPSBbbnVsbF07XG4gICAgICBhLnB1c2guYXBwbHkoYSwgYXJncyk7XG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSBGdW5jdGlvbi5iaW5kLmFwcGx5KFBhcmVudCwgYSk7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICAgIGlmIChDbGFzcykgc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBzZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2luaGVyaXRzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2lzTmF0aXZlRnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnRvU3RyaW5nLmNhbGwoZm4pLmluZGV4T2YoXCJbbmF0aXZlIGNvZGVdXCIpICE9PSAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVGdW5jdGlvbjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7XG5cbiAgdHJ5IHtcbiAgICBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBfdHlwZW9mID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIGFzc2VydFRoaXNJbml0aWFsaXplZCA9IHJlcXVpcmUoXCIuL2Fzc2VydFRoaXNJbml0aWFsaXplZC5qc1wiKTtcblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgcmV0dXJuIGFzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9nZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vc2V0UHJvdG90eXBlT2YuanNcIik7XG5cbnZhciBpc05hdGl2ZUZ1bmN0aW9uID0gcmVxdWlyZShcIi4vaXNOYXRpdmVGdW5jdGlvbi5qc1wiKTtcblxudmFyIGNvbnN0cnVjdCA9IHJlcXVpcmUoXCIuL2NvbnN0cnVjdC5qc1wiKTtcblxuZnVuY3Rpb24gX3dyYXBOYXRpdmVTdXBlcihDbGFzcykge1xuICB2YXIgX2NhY2hlID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiID8gbmV3IE1hcCgpIDogdW5kZWZpbmVkO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gX3dyYXBOYXRpdmVTdXBlciA9IGZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHtcbiAgICBpZiAoQ2xhc3MgPT09IG51bGwgfHwgIWlzTmF0aXZlRnVuY3Rpb24oQ2xhc3MpKSByZXR1cm4gQ2xhc3M7XG5cbiAgICBpZiAodHlwZW9mIENsYXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIF9jYWNoZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKF9jYWNoZS5oYXMoQ2xhc3MpKSByZXR1cm4gX2NhY2hlLmdldChDbGFzcyk7XG5cbiAgICAgIF9jYWNoZS5zZXQoQ2xhc3MsIFdyYXBwZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFdyYXBwZXIoKSB7XG4gICAgICByZXR1cm4gY29uc3RydWN0KENsYXNzLCBhcmd1bWVudHMsIGdldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yKTtcbiAgICB9XG5cbiAgICBXcmFwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogV3JhcHBlcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2V0UHJvdG90eXBlT2YoV3JhcHBlciwgQ2xhc3MpO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgcmV0dXJuIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF93cmFwTmF0aXZlU3VwZXI7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiBkZWZpbmUob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBJRSA4IGhhcyBhIGJyb2tlbiBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhhdCBvbmx5IHdvcmtzIG9uIERPTSBvYmplY3RzLlxuICAgIGRlZmluZSh7fSwgXCJcIik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlZmluZSA9IGZ1bmN0aW9uKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldID0gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKFxuICAgIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIHRvU3RyaW5nVGFnU3ltYm9sLFxuICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICApO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGRlZmluZShnZW5GdW4sIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHtcbiAgICBpZiAoUHJvbWlzZUltcGwgPT09IHZvaWQgMCkgUHJvbWlzZUltcGwgPSBQcm9taXNlO1xuXG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpLFxuICAgICAgUHJvbWlzZUltcGxcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIGRlZmluZShHcCwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yXCIpO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIiwiY29uc3QgUGlja2VyID0gcmVxdWlyZShcIi4vbW9kdWxlcy9QaWNrZXIuanNcIik7XHJcbmNvbnN0IEZpbGVQaWNrZXIgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0ZpbGVQaWNrZXIuanNcIik7XHJcbmNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kdWxlcy9Nb2RlbC5qc1wiKTtcclxuY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiKTtcclxuY29uc3QgUGFyYW1ldGVycyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUGFyYW1ldGVycy5qc1wiKTtcclxucmVxdWlyZShcIi4vbW9kdWxlcy9GaWxlTGlzdC5qc1wiKTtcclxuXHJcbndpbmRvdy5GaWxlT3BzID0gRmlsZU9wcztcclxuXHJcbmxldCBmb2xkZXJJZCA9IG51bGw7XHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxud2luZG93LmZpbGVPcHMgPSBmaWxlT3BzO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGFzeW5jICgpPT57XHJcbiAgICBhd2FpdCBmaWxlT3BzLmxvYWQoKTtcclxuICAgIGFkZE1lbnVMaXN0ZW5lcnMoKTtcclxuICAgIHNldHVwRmlsZUxpc3QoKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBvbkxvYWQoZXZlbnQpe1xyXG4gICAgbGV0IGlkID0gZXZlbnQuZGV0YWlsLmlkO1xyXG4gICAgd2luZG93LmxvY2F0aW9uID0gYGVkaXRvci5odG1sP2FjdGlvbj1sb2FkJmZpbGVJZD0ke2lkfWA7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG9uTGF1bmNoKGV2ZW50KXtcclxuICAgIGxldCBpZCA9IGV2ZW50LmRldGFpbC5pZDtcclxuXHJcbiAgICBsZXQgZmlsZSA9IGF3YWl0IGZpbGVPcHMuZ2V0KGlkKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhmaWxlLmJvZHkpO1xyXG5cclxuICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGh0dHAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KVxyXG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KSk7XHJcbiAgICB9KTtcclxuICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIFwibGF1bmNoXCIpO1xyXG4gICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICB4aHR0cC5zZW5kKGZpbGUuYm9keSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldHVwRmlsZUxpc3QoKXtcclxuICAgIGxldCBmaWxlTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmaWxlLWxpc3RcIik7XHJcblxyXG4gICAgZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lcihcImRlbGV0ZS1maWxlXCIsIGFzeW5jIChpZCkgPT4ge1xyXG4gICAgICAgIGZpbGVMaXN0LmJ1c3kgPSB0cnVlO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMuZGVsZXRlKGlkKTtcclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICAgICAgZmlsZUxpc3QuYnVzeSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZE1lbnVMaXN0ZW5lcnMoKXtcclxuICAgIGxldCBidXN5Qm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idXN5LWJveFwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY3JlYXRlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICAgIGJ1c3lCb3guY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBsZXQgbW9kZWwgPSBuZXcgTW9kZWwoKS5pbml0KFwiR2FtZSBOYW1lXCIpO1xyXG4gICAgICAgIGxldCBmcCA9IGF3YWl0IGZpbGVPcHMuY3JlYXRlKCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5zZXRCb2R5KGZwLCBKU09OLnN0cmluZ2lmeShtb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5vcmlnaW4gKyBcIi9lZGl0b3IuaHRtbD9hY3Rpb249bG9hZCZmaWxlSWQ9XCIgKyBmcDtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICAgICAgbGV0IGZpbGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImZpbGUtbGlzdFwiKTtcclxuICAgICAgICBmaWxlTGlzdC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0LWZpbGVcIiwgb25Mb2FkLCB7b25jZSA6IHRydWV9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbGF1bmNoXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZSkgPT4ge1xyXG4gICAgICAgIHBvcHVsYXRlRmlsZUxpc3QoKTtcclxuICAgICAgICBsZXQgZmlsZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZmlsZS1saXN0XCIpO1xyXG4gICAgICAgIGZpbGVMaXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3QtZmlsZVwiLCBvbkxhdW5jaCwge29uY2UgOiB0cnVlfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVGaWxlTGlzdCgpe1xyXG4gICAgbGV0IGJ1c3lCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ1c3ktYm94XCIpO1xyXG4gICAgbGV0IGZpbGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImZpbGUtbGlzdFwiKTtcclxuXHJcbiAgICBmaWxlTGlzdC5zaG93KCk7XHJcbiAgICBmaWxlTGlzdC5idXN5ID0gdHJ1ZTtcclxuICAgIGZpbGVMaXN0LmNsZWFyKCk7XHJcblxyXG4gICAgbGV0IGxpc3QgPSBhd2FpdCBmaWxlT3BzLmxpc3QoKTtcclxuICAgIGZvciAobGV0IGl0ZW0gb2YgbGlzdCl7XHJcbiAgICAgICAgbGV0IGkgPSBpdGVtLm5hbWUuaW5kZXhPZihcIi5cIik7XHJcbiAgICAgICAgZmlsZUxpc3QuYWRkSXRlbShpdGVtLm5hbWUuc3Vic3RyKDAsIGkpLCBpdGVtLmlkKTtcclxuICAgIH1cclxuICAgIGZpbGVMaXN0LmJ1c3kgPSBmYWxzZTtcclxufVxyXG5cclxud2luZG93LnBvcHVsYXRlRmlsZUxpc3QgPSBwb3B1bGF0ZUZpbGVMaXN0OyIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQXV0aGVudGljYXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKSA9PiB0aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIElOSVRcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F1dGhvcml6ZWQoKXtcclxuICAgICAgICB2YXIgdXNlciA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuaGFzR3JhbnRlZFNjb3Blcyh0aGlzLnNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25JbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25PdXQoKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25PdXQoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRlOyIsIlxyXG5jbGFzcyBEZWxldGVGaWxlRXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgICAgIHN1cGVyKCdkZWxldGUtZmlsZScsIHtkZXRhaWwgOiB7aWQgOiBpZH19KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU2VsZWN0RmlsZUV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoaWQpIHtcclxuICAgICAgICBzdXBlcignc2VsZWN0LWZpbGUnLCB7ZGV0YWlsIDoge2lkIDogaWR9fSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEZpbGVMaXN0IGV4dGVuZHMgSFRNTEVsZW1lbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgICAgIHN1cGVyKHByb3BzKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KT0+dGhpcy5sb2FkKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWQoKXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcIi5maWxlLWl0ZW1cIikpe1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjaW5uZXItbGlzdFwiKS5yZW1vdmVDaGlsZChlbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGRJdGVtKGZpbGVuYW1lLCBpZCl7XHJcbiAgICAgICAgbGV0IG1ldGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIG1ldGEuY2xhc3NMaXN0LmFkZChcImZpbGUtaXRlbVwiKTtcclxuICAgICAgICBtZXRhLnNldEF0dHJpYnV0ZShcImRhdGEtaWRcIiwgaWQpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNpbm5lci1saXN0XCIpLmFwcGVuZENoaWxkKG1ldGEpO1xyXG5cclxuICAgICAgICBsZXQgZWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJmaWxlLW5hbWVcIik7XHJcbiAgICAgICAgZWxlLmlubmVyVGV4dCA9IGZpbGVuYW1lO1xyXG4gICAgICAgIG1ldGEuYXBwZW5kQ2hpbGQoZWxlKTtcclxuXHJcbiAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBTZWxlY3RGaWxlRXZlbnQoaWQpKSk7XHJcblxyXG4gICAgICAgIGVsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiZGVsZXRlXCIpO1xyXG4gICAgICAgIGVsZS5pbm5lclRleHQgPSBcIkRlbGV0ZVwiO1xyXG4gICAgICAgIG1ldGEuYXBwZW5kQ2hpbGQoZWxlKTtcclxuXHJcbiAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBEZWxldGVGaWxlRXZlbnQoaWQpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpe1xyXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBidXN5KHZhbHVlKXtcclxuICAgICAgICBpZiAodmFsdWUpIHRoaXMucXVlcnlTZWxlY3RvcihcIiNmaWxlLWxpc3QtYnVzeVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2ZpbGUtbGlzdC1idXN5XCIpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2ZpbGUtbGlzdCcsIEZpbGVMaXN0KTtcclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlTGlzdDsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBGaWxlT3BzIHtcclxuXHJcbiAgICBhc3luYyBsb2FkKCl7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkRHJpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkubG9hZCgnY2xpZW50JywgKCkgPT4gcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRHJpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQubG9hZCgnZHJpdmUnLCAndjMnLCByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZSgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBGaWxlT3BzLmZpbGVuYW1lLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50czogWydhcHBEYXRhRm9sZGVyJ10sXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IFwiaWRcIlxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmlkKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGUoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmRlbGV0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQgOiBmaWxlSWRcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBsaXN0KCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5saXN0KHtcclxuICAgICAgICAgICAgICAgIC8vIHE6IGBuYW1lIGNvbnRhaW5zICcuanNvbidgLFxyXG4gICAgICAgICAgICAgICAgc3BhY2VzOiAnYXBwRGF0YUZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6ICdmaWxlcy9uYW1lLGZpbGVzL2lkLGZpbGVzL21vZGlmaWVkVGltZSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5maWxlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0KGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBhbHQ6ICdtZWRpYSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldEJvZHkoZmlsZUlkLCBib2R5KXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICAgICAgcGF0aCA6IFwidXBsb2FkL2RyaXZlL3YzL2ZpbGVzL1wiICsgZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kIDogXCJQQVRDSFwiLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFR5cGUgOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHkgOiBib2R5XHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbmFtZShmaWxlSWQsIGZpbGVuYW1lKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5GaWxlT3BzLmZpbGVuYW1lID0gXCJHYW1lIE5hbWUuanNvblwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BzOyIsImNvbnN0IFBpY2tlciA9IHJlcXVpcmUoXCIuL1BpY2tlci5qc1wiKTtcclxuXHJcbmNsYXNzIEZpbGVQaWNrZXIgZXh0ZW5kcyBQaWNrZXJ7XHJcbiAgICAvLyBDcmVhdGUgYW5kIHJlbmRlciBhIFBpY2tlciBvYmplY3QgZm9yIHNlYXJjaGluZyBpbWFnZXMuXHJcbiAgICBjcmVhdGVQaWNrZXIoKSB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVmlldyhnb29nbGUucGlja2VyLlZpZXdJZC5GT0xERVJTKVxyXG4gICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgLnNldFBhcmVudCgncm9vdCcpXHJcbiAgICAgICAgICAgIC5zZXRNaW1lVHlwZXMoXCJqc29uXCIpO1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyQXBpTG9hZGVkICYmIHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgcGlja2VyID0gbmV3IGdvb2dsZS5waWNrZXIuUGlja2VyQnVpbGRlcigpXHJcbiAgICAgICAgICAgICAgICAuZW5hYmxlRmVhdHVyZShnb29nbGUucGlja2VyLkZlYXR1cmUuTkFWX0hJRERFTilcclxuICAgICAgICAgICAgICAgIC5hZGRWaWV3KHZpZXcpXHJcbiAgICAgICAgICAgICAgICAuc2V0QXBwSWQodGhpcy5hcHBJZClcclxuICAgICAgICAgICAgICAgIC5zZXRPQXV0aFRva2VuKHRoaXMub2F1dGhUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZXREZXZlbG9wZXJLZXkodGhpcy5kZXZlbG9wZXJLZXkpXHJcbiAgICAgICAgICAgICAgICAuc2V0Q2FsbGJhY2sodGhpcy5waWNrZXJDYWxsYmFjaylcclxuICAgICAgICAgICAgICAgIC8vIC5hZGRWaWV3KG5ldyBnb29nbGUucGlja2VyLkRvY3NVcGxvYWRWaWV3KCkpXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEEgc2ltcGxlIGNhbGxiYWNrIGltcGxlbWVudGF0aW9uLlxyXG4gICAgLy8gT3ZlcnJpZGUgdGhpcyBtZXRob2Qgb24gdXNlLlxyXG4gICAgcGlja2VyQ2FsbGJhY2soZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhLmFjdGlvbiA9PT0gZ29vZ2xlLnBpY2tlci5BY3Rpb24uUElDS0VEKSB7XHJcbiAgICAgICAgICAgIHZhciBmaWxlSWQgPSBkYXRhLmRvY3NbMF0uaWQ7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGBlZGl0b3IuaHRtbD9hY3Rpb249bG9hZCZmaWxlSWQ9JHtmaWxlSWR9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZVBpY2tlcjtcclxuXHJcbiIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwubmFtZSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um91bmQoaW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IGluZGV4ID8/IHRoaXMuY3VycmVudFJvdW5kO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvdW5kKCkuY29sdW1uW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sdW1uKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uKGNvbHVtbikuY2VsbFtyb3ddO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZVJvdW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdW5kQ291bnQgPT09IDEpIHJldHVybjtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMuc3BsaWNlKHRoaXMuY3VycmVudFJvdW5kLCAxKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpe1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSxcclxuICAgICAgICAgICAgcXVlc3Rpb24gOiBcIlwiLFxyXG4gICAgICAgICAgICBhbnN3ZXJzIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKyl7XHJcbiAgICAgICAgICAgIHJvdW5kLmFuc3dlcnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcclxuICAgICAgICAgICAgICAgIGlzVHJ1ZSA6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVtZW50Um91bmQoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA8IDApIHRoaXMuY3VycmVudFJvdW5kID0gMFxyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsOyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBBYnN0cmFjdEZpbGVzID0gcmVxdWlyZShcIi4vQXV0aGVudGljYXRlLmpzXCIpO1xyXG5cclxuY2xhc3MgUGFyYW1ldGVycyBleHRlbmRzIEFic3RyYWN0RmlsZXN7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGFyYW0gPSB7XHJcbiAgICAgICAgICAgIGxhc3RfZmlsZSA6IFwiXCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKGRpclRva2VuKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lIDogUGFyYW1ldGVycy5maWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudHM6IFsnYXBwRGF0YUZvbGRlciddLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBcImlkXCJcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVJZCA9IHJlcy5yZXN1bHQuaWQ7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWQoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IHRoaXMuZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtID0gSlNPTi5wYXJzZShyZXMuYm9keSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3cml0ZSgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyB0aGlzLmZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogSlNPTi5zdHJpbmdpZnkodGhpcy5wYXJhbSlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZXhpc3RzKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5saXN0KHtcclxuICAgICAgICAgICAgICAgIHE6IFwibmFtZSA9ICdzZXR0aW5ncy5qc29uJ1wiLFxyXG4gICAgICAgICAgICAgICAgc3BhY2VzOiAnYXBwRGF0YUZvbGRlcidcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIGlmIChyZXMucmVzdWx0LmZpbGVzLmxlbmd0aCA+IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZUlkID0gcmVzLnJlc3VsdC5maWxlc1swXS5pZDtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuUGFyYW1ldGVycy5maWxlbmFtZSA9IFwic2V0dGluZ3MuanNvblwiO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcmFtZXRlcnM7IiwiY2xhc3MgUGlja2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8vIFRoZSBCcm93c2VyIEFQSSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLlxyXG4gICAgICAgIHRoaXMuZGV2ZWxvcGVyS2V5ID0gJ0FJemFTeUFCY2RMbVQ2SEhfN0dvODJxX0lCR0kzam02VUw0dzRRMCc7XHJcblxyXG4gICAgICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgICAgIHRoaXMuY2xpZW50SWQgPSBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiXHJcblxyXG4gICAgICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgICAgIHRoaXMuYXBwSWQgPSBcIjE1ODgyMzEzNDY4MVwiO1xyXG5cclxuICAgICAgICAvLyBTY29wZSB0byB1c2UgdG8gYWNjZXNzIHVzZXIncyBEcml2ZSBpdGVtcy5cclxuICAgICAgICB0aGlzLnNjb3BlID0gWydodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGUnXTtcclxuXHJcbiAgICAgICAgdGhpcy5vYXV0aFRva2VuID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgdGhlIEdvb2dsZSBBUEkgTG9hZGVyIHNjcmlwdCB0byBsb2FkIHRoZSBnb29nbGUucGlja2VyIHNjcmlwdC5cclxuICAgIGxvYWRQaWNrZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub2F1dGhUb2tlbiA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJhdXRob3JpemVcIik7XHJcbiAgICAgICAgICAgICAgICBnYXBpLmxvYWQoJ3BpY2tlcicsIHtcclxuICAgICAgICAgICAgICAgICAgICAnY2FsbGJhY2snOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhcGkubG9hZCgnYXV0aDInLCB7J2NhbGxiYWNrJzogKCkgPT4gdGhpcy5vbkF1dGhBcGlMb2FkKHJlc29sdmUsIHJlamVjdCl9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQXV0aEFwaUxvYWQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW0gPSB7XHJcbiAgICAgICAgICAgICdjbGllbnRfaWQnOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICAnc2NvcGUnOiB0aGlzLnNjb3BlLFxyXG4gICAgICAgICAgICAnaW1tZWRpYXRlJzogZmFsc2VcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYXBpLmF1dGgyLmF1dGhvcml6ZShwYXJhbSwgKGF1dGhSZXN1bHQpID0+IHRoaXMuaGFuZGxlQXV0aFJlc3VsdChhdXRoUmVzdWx0LCByZXNvbHZlLCByZWplY3QpKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQsIHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGlmIChhdXRoUmVzdWx0ICYmICFhdXRoUmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2F1dGhUb2tlbiA9IGF1dGhSZXN1bHQuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVqZWN0KGF1dGhSZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIHJlbmRlciBhIFBpY2tlciBvYmplY3QgZm9yIHNlYXJjaGluZyBpbWFnZXMuXHJcbiAgICBkaXJQaWNrZXIoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVQaWNrZXJcIik7XHJcbiAgICAgICAgaWYgKHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgdmlldyA9IG5ldyBnb29nbGUucGlja2VyLkRvY3NWaWV3KGdvb2dsZS5waWNrZXIuVmlld0lkLkZPTERFUlMpXHJcbiAgICAgICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5zZXRTZWxlY3RGb2xkZXJFbmFibGVkKHRydWUpXHJcbiAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrZXIgPSBuZXcgZ29vZ2xlLnBpY2tlci5QaWNrZXJCdWlsZGVyKClcclxuICAgICAgICAgICAgICAgIC5lbmFibGVGZWF0dXJlKGdvb2dsZS5waWNrZXIuRmVhdHVyZS5OQVZfSElEREVOKVxyXG4gICAgICAgICAgICAgICAgLmFkZFZpZXcodmlldylcclxuICAgICAgICAgICAgICAgIC5zZXRBcHBJZCh0aGlzLmFwcElkKVxyXG4gICAgICAgICAgICAgICAgLnNldE9BdXRoVG9rZW4odGhpcy5vYXV0aFRva2VuKVxyXG4gICAgICAgICAgICAgICAgLnNldERldmVsb3BlcktleSh0aGlzLmRldmVsb3BlcktleSlcclxuICAgICAgICAgICAgICAgIC5zZXRDYWxsYmFjayh0aGlzLnBpY2tlckNhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XHJcbiAgICAgICAgICAgIHBpY2tlci5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIHJlbmRlciBhIFBpY2tlciBvYmplY3QgZm9yIHNlYXJjaGluZyBpbWFnZXMuXHJcbiAgICBmaWxlUGlja2VyKCkge1xyXG4gICAgICAgIGxldCB2aWV3ID0gbmV3IGdvb2dsZS5waWNrZXIuRG9jc1ZpZXcoZ29vZ2xlLnBpY2tlci5WaWV3SWQuRk9MREVSUylcclxuICAgICAgICAgICAgLnNldEluY2x1ZGVGb2xkZXJzKHRydWUpXHJcbiAgICAgICAgICAgIC5zZXRQYXJlbnQoJ3Jvb3QnKVxyXG4gICAgICAgICAgICAuc2V0TWltZVR5cGVzKFwianNvblwiKTtcclxuICAgICAgICA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnBpY2tlckFwaUxvYWRlZCAmJiB0aGlzLm9hdXRoVG9rZW4pIHtcclxuICAgICAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBnb29nbGUucGlja2VyLlBpY2tlckJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAgICAgLmVuYWJsZUZlYXR1cmUoZ29vZ2xlLnBpY2tlci5GZWF0dXJlLk5BVl9ISURERU4pXHJcbiAgICAgICAgICAgICAgICAuYWRkVmlldyh2aWV3KVxyXG4gICAgICAgICAgICAgICAgLnNldEFwcElkKHRoaXMuYXBwSWQpXHJcbiAgICAgICAgICAgICAgICAuc2V0T0F1dGhUb2tlbih0aGlzLm9hdXRoVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuc2V0RGV2ZWxvcGVyS2V5KHRoaXMuZGV2ZWxvcGVyS2V5KVxyXG4gICAgICAgICAgICAgICAgLnNldENhbGxiYWNrKHRoaXMucGlja2VyQ2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAvLyAuYWRkVmlldyhuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVXBsb2FkVmlldygpKVxyXG4gICAgICAgICAgICAgICAgLmJ1aWxkKCk7XHJcbiAgICAgICAgICAgIHBpY2tlci5zZXRWaXNpYmxlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gT3ZlcnJpZGUgdGhpcyBtZXRob2Qgb24gdXNlLlxyXG4gICAgcGlja2VyQ2FsbGJhY2soZGF0YSkge1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBpY2tlcjtcclxuXHJcbiIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8vIFRoZSBCcm93c2VyIEFQSSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLlxyXG4gICAgZGV2ZWxvcGVyS2V5IDogJ0FJemFTeUFCY2RMbVQ2SEhfN0dvODJxX0lCR0kzam02VUw0dzRRMCcsXHJcblxyXG4gICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICBjbGllbnRJZCA6IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXHJcblxyXG4gICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICBhcHBJZCA6IFwiMTU4ODIzMTM0NjgxXCIsXHJcblxyXG4gICAgLy8gQXJyYXkgb2YgQVBJIGRpc2NvdmVyeSBkb2MgVVJMcyBmb3IgQVBJcyB1c2VkIGJ5IHRoZSBxdWlja3N0YXJ0XHJcbiAgICBkaXNjb3ZlcnlEb2NzIDogW1wiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvZHJpdmUvdjMvcmVzdFwiXSxcclxuXHJcbiAgICAvLyBTY29wZSB0byB1c2UgdG8gYWNjZXNzIHVzZXIncyBEcml2ZSBpdGVtcy5cclxuICAgIHNjb3BlOiBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZVwiXHJcbn0iXX0=
