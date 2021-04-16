function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

var _Picker = _interopRequireDefault(require("./modules/Picker.js"));

var _FilePicker = _interopRequireDefault(require("./modules/FilePicker.js"));

var _Model = _interopRequireDefault(require("./modules/Model.js"));

var _FileOps = _interopRequireDefault(require("./modules/FileOps.js"));

var _Parameters = _interopRequireDefault(require("./modules/Parameters.js"));

var _FileList = _interopRequireDefault(require("./modules/FileList.js"));

var _renderButton = _interopRequireDefault(require("./host/renderButton"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var folderId = null;
var fileOps = new _FileOps["default"]();
window.fileOps = fileOps;
window.renderButton = _renderButton["default"]; // main called from renderButton.js

window.main = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return checkForGame();

        case 2:
          _context.next = 4;
          return fileOps.load();

        case 4:
          addMenuListeners();
          setupFileList();

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

function onLoad(event) {
  console.log("Window onload");
  var id = event.detail.id;
  window.location = "editor.ejs?action=load&fileId=".concat(id);
}

function checkForGame() {
  return _checkForGame.apply(this, arguments);
}

function _checkForGame() {
  _checkForGame = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
    var token, xhttp;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
            xhttp = new XMLHttpRequest();
            xhttp.addEventListener("load", function (event) {
              var response = JSON.parse(xhttp.responseText);

              if (response['has-game'] === "true") {
                window.location = "launch_console.ejs?host=".concat(response.host, "&cont=").concat(response.contestant);
              }
            });
            xhttp.open("POST", "game-manager-service");
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({
              token: token,
              action: "has-game"
            }));

          case 6:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _checkForGame.apply(this, arguments);
}

function onLaunch(_x) {
  return _onLaunch.apply(this, arguments);
}

function _onLaunch() {
  _onLaunch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(event) {
    var id, file, model, token, xhttp;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            id = event.detail.id; // google file identifier

            _context9.next = 3;
            return fileOps.get(id);

          case 3:
            file = _context9.sent;
            model = JSON.parse(file.body);
            token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
            xhttp = new XMLHttpRequest();
            xhttp.addEventListener("load", function (event) {
              var response = JSON.parse(xhttp.responseText);
              console.log(response);

              if (response.result === "success") {
                window.location = "launch_console.ejs?host=".concat(response.host, "&cont=").concat(response.contestant);
              } else {
                window.alert("Error launching game");
                console.log(response);
              }
            });
            xhttp.open("POST", "launch");
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({
              model: model,
              token: token,
              action: "launch"
            }));

          case 11:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _onLaunch.apply(this, arguments);
}

function launchVerify() {
  return _launchVerify.apply(this, arguments);
}

function _launchVerify() {
  _launchVerify = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
    var token, xhttp, json;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
            xhttp = new XMLHttpRequest();
            xhttp.open('POST', 'verify');
            xhttp.setRequestHeader('Content-Type', 'application/json');

            xhttp.onload = function () {
              console.log('response text');
              console.log(xhttp.responseText);
            };

            json = JSON.stringify({
              token: token
            });
            xhttp.send(json);

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _launchVerify.apply(this, arguments);
}

function setupFileList() {
  var fileList = document.querySelector("file-list");
  fileList.addEventListener("delete-file", /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(event) {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              fileList.busy = true;
              _context2.prev = 1;
              _context2.next = 4;
              return fileOps["delete"](event.detail.id);

            case 4:
              _context2.next = 9;
              break;

            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](1);
              console.log(_context2.t0);

            case 9:
              populateFileList();
              fileList.busy = false;

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[1, 6]]);
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
              model = new _Model["default"]().init("Game Name");
              _context3.next = 4;
              return fileOps.create();

            case 4:
              fp = _context3.sent;
              _context3.next = 7;
              return fileOps.setBody(fp, JSON.stringify(model.get(), null, 2));

            case 7:
              location.href = location.origin + "/editor.ejs?action=load&fileId=" + fp;

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
  document.querySelector("#upload").addEventListener("click", /*#__PURE__*/function () {
    var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(e) {
      var anchor;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              anchor = document.querySelector("#upload-anchor");
              anchor.click();
              anchor.addEventListener("change", function (event) {
                var data = anchor.files[0];
                var reader = new FileReader();

                reader.onload = /*#__PURE__*/function () {
                  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(e) {
                    var name, fp;
                    return _regenerator["default"].wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            name = JSON.parse(e.target.result).name;
                            _context4.next = 3;
                            return fileOps.create(name + ".json");

                          case 3:
                            fp = _context4.sent;
                            _context4.next = 6;
                            return fileOps.setBody(fp, e.target.result);

                          case 6:
                            location.href = location.origin + "/editor.ejs?action=load&fileId=" + fp;

                          case 7:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function (_x5) {
                    return _ref5.apply(this, arguments);
                  };
                }();

                reader.readAsText(data);
              }, {
                once: true
              });

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
  document.querySelector("#load").addEventListener("click", /*#__PURE__*/function () {
    var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(e) {
      var fileList;
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              populateFileList();
              fileList = document.querySelector("file-list");
              fileList.addEventListener("select-file", onLoad, {
                once: true
              });

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  }());
  document.querySelector("#launch").addEventListener("click", /*#__PURE__*/function () {
    var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(e) {
      var fileList;
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              populateFileList();
              fileList = document.querySelector("file-list");
              fileList.addEventListener("select-file", onLaunch, {
                once: true
              });

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function (_x7) {
      return _ref7.apply(this, arguments);
    };
  }());
}

function populateFileList() {
  return _populateFileList.apply(this, arguments);
}

function _populateFileList() {
  _populateFileList = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
    var busyBox, fileList, list, _iterator, _step, item, i;

    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            busyBox = document.querySelector(".busy-box");
            fileList = document.querySelector("file-list");
            fileList.show();
            fileList.busy = true;
            fileList.clear();
            _context11.next = 7;
            return fileOps.list();

          case 7:
            list = _context11.sent;
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
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _populateFileList.apply(this, arguments);
}

},{"./host/renderButton":18,"./modules/FileList.js":20,"./modules/FileOps.js":21,"./modules/FilePicker.js":22,"./modules/Model.js":23,"./modules/Parameters.js":24,"./modules/Picker.js":25,"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":15}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function onSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  var user = gapi.auth2.getAuthInstance().currentUser.get();
  var hasScopes = user.hasGrantedScopes('https://www.googleapis.com/auth/drive.appdata');

  if (!hasScopes) {
    var options = new gapi.auth2.SigninOptionsBuilder();
    options.setScope('https://www.googleapis.com/auth/drive.appdata');
    googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    googleUser.grant(options).then(function (success) {
      enableButtons();
      window.main();
    }, function (fail) {
      alert(JSON.stringify({
        message: "fail",
        value: fail
      }));
    });
  } else {
    enableButtons();
    window.main();
  }
}

function enableButtons() {
  document.querySelectorAll(".home-option").forEach(function (e) {
    return e.classList.remove("disabled");
  });
}

function disableButtons() {
  document.querySelectorAll(".home-option").forEach(function (e) {
    return e.classList.add("disabled");
  });
}

function onFailure(error) {
  console.log(error);
}

function renderButton() {
  gapi.signin2.render('sign-in', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}

function signOut() {
  disableButtons();
  gapi.auth2.getAuthInstance().signOut();
}

var _default = renderButton;
exports["default"] = _default;

},{}],19:[function(require,module,exports){
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

},{"./googleFields.js":26,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],20:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = FileList;
exports["default"] = _default;

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11,"@babel/runtime/helpers/wrapNativeSuper":14}],21:[function(require,module,exports){
"use strict"; // see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
        var filename,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                filename = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "Game Name.json";
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.create({
                    name: filename,
                    parents: ['appDataFolder'],
                    fields: "id"
                  }).then(function (res) {
                    resolve(res.result.id);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 2:
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
                    reject(error);
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

var _default = FileOps;
exports["default"] = _default;

},{"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/regenerator":15}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Picker2 = _interopRequireDefault(require("./Picker.js"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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
}(_Picker2["default"]);

var _default = FilePicker;
exports["default"] = _default;

},{"./Picker.js":25,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11}],23:[function(require,module,exports){
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
    } // TODO test

  }, {
    key: "setRoundIndex",
    value: function setRoundIndex(from, to) {
      var r = this.gameModel.rounds;
      if (r.length <= 1) return;
      var _ref = [r[to], r[from]];
      r[from] = _ref[0];
      r[to] = _ref[1];
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

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = Parameters;
exports["default"] = _default;

},{"./Authenticate.js":19,"@babel/runtime/helpers/asyncToGenerator":2,"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/getPrototypeOf":6,"@babel/runtime/helpers/inherits":7,"@babel/runtime/helpers/interopRequireDefault":8,"@babel/runtime/helpers/possibleConstructorReturn":11,"@babel/runtime/regenerator":15}],25:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

var _default = Picker;
exports["default"] = _default;

},{"@babel/runtime/helpers/classCallCheck":3,"@babel/runtime/helpers/createClass":5,"@babel/runtime/helpers/interopRequireDefault":8}],26:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvd3JhcE5hdGl2ZVN1cGVyLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsInNyYy9jbGllbnQvaG9zdC5qcyIsInNyYy9jbGllbnQvaG9zdC9yZW5kZXJCdXR0b24uanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQXV0aGVudGljYXRlLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVMaXN0LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVPcHMuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRmlsZVBpY2tlci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9Nb2RlbC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9QYXJhbWV0ZXJzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL1BpY2tlci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9nb29nbGVGaWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUM1dUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQUksUUFBUSxHQUFHLElBQWY7QUFDQSxJQUFJLE9BQU8sR0FBRyxJQUFJLG1CQUFKLEVBQWQ7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQUFqQjtBQUVBLE1BQU0sQ0FBQyxZQUFQLEdBQXNCLHdCQUF0QixDLENBRUE7O0FBQ0EsTUFBTSxDQUFDLElBQVAsOEZBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQ0osWUFBWSxFQURSOztBQUFBO0FBQUE7QUFBQSxpQkFFSixPQUFPLENBQUMsSUFBUixFQUZJOztBQUFBO0FBR1YsVUFBQSxnQkFBZ0I7QUFDaEIsVUFBQSxhQUFhOztBQUpIO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQWQ7O0FBT0EsU0FBUyxNQUFULENBQWdCLEtBQWhCLEVBQXVCO0FBQ25CLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsTUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxFQUF0QjtBQUNBLEVBQUEsTUFBTSxDQUFDLFFBQVAsMkNBQW1ELEVBQW5EO0FBQ0g7O1NBRWMsWTs7Ozs7Z0dBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1EsWUFBQSxLQURSLEdBQ2dCLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixXQUE3QixDQUF5QyxHQUF6QyxHQUErQyxlQUEvQyxHQUFpRSxRQURqRjtBQUdRLFlBQUEsS0FIUixHQUdnQixJQUFJLGNBQUosRUFIaEI7QUFLSSxZQUFBLEtBQUssQ0FBQyxnQkFBTixDQUF1QixNQUF2QixFQUErQixVQUFDLEtBQUQsRUFBVztBQUN0QyxrQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsWUFBakIsQ0FBZjs7QUFFQSxrQkFBSSxRQUFRLENBQUMsVUFBRCxDQUFSLEtBQXlCLE1BQTdCLEVBQXFDO0FBQ2pDLGdCQUFBLE1BQU0sQ0FBQyxRQUFQLHFDQUE2QyxRQUFRLENBQUMsSUFBdEQsbUJBQW1FLFFBQVEsQ0FBQyxVQUE1RTtBQUNIO0FBQ0osYUFORDtBQVFBLFlBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQW1CLHNCQUFuQjtBQUNBLFlBQUEsS0FBSyxDQUFDLGdCQUFOLENBQXVCLGNBQXZCLEVBQXVDLGtCQUF2QztBQUNBLFlBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlO0FBQ3RCLGNBQUEsS0FBSyxFQUFFLEtBRGU7QUFFdEIsY0FBQSxNQUFNLEVBQUU7QUFGYyxhQUFmLENBQVg7O0FBZko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQXFCZSxROzs7Ozs0RkFBZixrQkFBd0IsS0FBeEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1EsWUFBQSxFQURSLEdBQ2EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxFQUQxQixFQUM4Qjs7QUFEOUI7QUFBQSxtQkFHcUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxFQUFaLENBSHJCOztBQUFBO0FBR1EsWUFBQSxJQUhSO0FBSVEsWUFBQSxLQUpSLEdBSWdCLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLElBQWhCLENBSmhCO0FBS1EsWUFBQSxLQUxSLEdBS2dCLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixXQUE3QixDQUF5QyxHQUF6QyxHQUErQyxlQUEvQyxHQUFpRSxRQUxqRjtBQU9RLFlBQUEsS0FQUixHQU9nQixJQUFJLGNBQUosRUFQaEI7QUFRSSxZQUFBLEtBQUssQ0FBQyxnQkFBTixDQUF1QixNQUF2QixFQUErQixVQUFDLEtBQUQsRUFBVztBQUN0QyxrQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsWUFBakIsQ0FBZjtBQUNBLGNBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaOztBQUVBLGtCQUFJLFFBQVEsQ0FBQyxNQUFULEtBQW9CLFNBQXhCLEVBQW1DO0FBQy9CLGdCQUFBLE1BQU0sQ0FBQyxRQUFQLHFDQUE2QyxRQUFRLENBQUMsSUFBdEQsbUJBQW1FLFFBQVEsQ0FBQyxVQUE1RTtBQUNILGVBRkQsTUFFTztBQUNILGdCQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWEsc0JBQWI7QUFDQSxnQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7QUFDSDtBQUNKLGFBVkQ7QUFZQSxZQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUFtQixRQUFuQjtBQUNBLFlBQUEsS0FBSyxDQUFDLGdCQUFOLENBQXVCLGNBQXZCLEVBQXVDLGtCQUF2QztBQUNBLFlBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlO0FBQ3RCLGNBQUEsS0FBSyxFQUFFLEtBRGU7QUFFdEIsY0FBQSxLQUFLLEVBQUUsS0FGZTtBQUd0QixjQUFBLE1BQU0sRUFBRTtBQUhjLGFBQWYsQ0FBWDs7QUF0Qko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztTQTZCZSxZOzs7OztnR0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUSxZQUFBLEtBRFIsR0FDZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLFdBQTdCLENBQXlDLEdBQXpDLEdBQStDLGVBQS9DLEdBQWlFLFFBRGpGO0FBR1EsWUFBQSxLQUhSLEdBR2dCLElBQUksY0FBSixFQUhoQjtBQUlJLFlBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUFYLEVBQW1CLFFBQW5CO0FBQ0EsWUFBQSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsY0FBdkIsRUFBdUMsa0JBQXZDOztBQUNBLFlBQUEsS0FBSyxDQUFDLE1BQU4sR0FBZSxZQUFZO0FBQ3ZCLGNBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsY0FBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQUssQ0FBQyxZQUFsQjtBQUNILGFBSEQ7O0FBS0ksWUFBQSxJQVhSLEdBV2UsSUFBSSxDQUFDLFNBQUwsQ0FBZTtBQUFDLGNBQUEsS0FBSyxFQUFFO0FBQVIsYUFBZixDQVhmO0FBWUksWUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7O0FBWko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztBQWVBLFNBQVMsYUFBVCxHQUF5QjtBQUNyQixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixXQUF2QixDQUFmO0FBRUEsRUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsYUFBMUI7QUFBQSw4RkFBeUMsa0JBQU8sS0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3JDLGNBQUEsUUFBUSxDQUFDLElBQVQsR0FBZ0IsSUFBaEI7QUFEcUM7QUFBQTtBQUFBLHFCQUczQixPQUFPLFVBQVAsQ0FBZSxLQUFLLENBQUMsTUFBTixDQUFhLEVBQTVCLENBSDJCOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFLakMsY0FBQSxPQUFPLENBQUMsR0FBUjs7QUFMaUM7QUFPckMsY0FBQSxnQkFBZ0I7QUFDaEIsY0FBQSxRQUFRLENBQUMsSUFBVCxHQUFnQixLQUFoQjs7QUFScUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBekM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVSDs7QUFFRCxTQUFTLGdCQUFULEdBQTRCO0FBQ3hCLE1BQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFdBQXZCLENBQWQ7QUFFQSxFQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLFNBQXZCLEVBQWtDLGdCQUFsQyxDQUFtRCxPQUFuRDtBQUFBLDhGQUE0RCxrQkFBTyxDQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN4RCxjQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLE1BQWxCLENBQXlCLFFBQXpCO0FBQ0ksY0FBQSxLQUZvRCxHQUU1QyxJQUFJLGlCQUFKLEdBQVksSUFBWixDQUFpQixXQUFqQixDQUY0QztBQUFBO0FBQUEscUJBR3pDLE9BQU8sQ0FBQyxNQUFSLEVBSHlDOztBQUFBO0FBR3BELGNBQUEsRUFIb0Q7QUFBQTtBQUFBLHFCQUlsRCxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixFQUFvQixJQUFJLENBQUMsU0FBTCxDQUFlLEtBQUssQ0FBQyxHQUFOLEVBQWYsRUFBNEIsSUFBNUIsRUFBa0MsQ0FBbEMsQ0FBcEIsQ0FKa0Q7O0FBQUE7QUFLeEQsY0FBQSxRQUFRLENBQUMsSUFBVCxHQUFnQixRQUFRLENBQUMsTUFBVCxHQUFrQixpQ0FBbEIsR0FBc0QsRUFBdEU7O0FBTHdEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTVEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUUEsRUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QixFQUFrQyxnQkFBbEMsQ0FBbUQsT0FBbkQ7QUFBQSw4RkFBNEQsa0JBQU8sQ0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDcEQsY0FBQSxNQURvRCxHQUMzQyxRQUFRLENBQUMsYUFBVCxDQUF1QixnQkFBdkIsQ0FEMkM7QUFFeEQsY0FBQSxNQUFNLENBQUMsS0FBUDtBQUVBLGNBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFVBQUEsS0FBSyxFQUFJO0FBQ3ZDLG9CQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsQ0FBYjtBQUNBLG9CQUFNLE1BQU0sR0FBRyxJQUFJLFVBQUosRUFBZjs7QUFFQSxnQkFBQSxNQUFNLENBQUMsTUFBUDtBQUFBLDRHQUFnQixrQkFBTSxDQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNSLDRCQUFBLElBRFEsR0FDRCxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBcEIsRUFBNEIsSUFEM0I7QUFBQTtBQUFBLG1DQUVHLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBSSxHQUFHLE9BQXRCLENBRkg7O0FBQUE7QUFFUiw0QkFBQSxFQUZRO0FBQUE7QUFBQSxtQ0FHTixPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQixFQUFvQixDQUFDLENBQUMsTUFBRixDQUFTLE1BQTdCLENBSE07O0FBQUE7QUFJWiw0QkFBQSxRQUFRLENBQUMsSUFBVCxHQUFnQixRQUFRLENBQUMsTUFBVCxHQUFrQixpQ0FBbEIsR0FBc0QsRUFBdEU7O0FBSlk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQWhCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1BLGdCQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO0FBQ0gsZUFYRCxFQVdHO0FBQUMsZ0JBQUEsSUFBSSxFQUFFO0FBQVAsZUFYSDs7QUFKd0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBNUQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQkEsRUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QixFQUFnQyxnQkFBaEMsQ0FBaUQsT0FBakQ7QUFBQSw4RkFBMEQsa0JBQU8sQ0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdEQsY0FBQSxnQkFBZ0I7QUFDWixjQUFBLFFBRmtELEdBRXZDLFFBQVEsQ0FBQyxhQUFULENBQXVCLFdBQXZCLENBRnVDO0FBR3RELGNBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGFBQTFCLEVBQXlDLE1BQXpDLEVBQWlEO0FBQUMsZ0JBQUEsSUFBSSxFQUFFO0FBQVAsZUFBakQ7O0FBSHNEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTFEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTUEsRUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QixFQUFrQyxnQkFBbEMsQ0FBbUQsT0FBbkQ7QUFBQSw4RkFBNEQsa0JBQU8sQ0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDeEQsY0FBQSxnQkFBZ0I7QUFDWixjQUFBLFFBRm9ELEdBRXpDLFFBQVEsQ0FBQyxhQUFULENBQXVCLFdBQXZCLENBRnlDO0FBR3hELGNBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGFBQTFCLEVBQXlDLFFBQXpDLEVBQW1EO0FBQUMsZ0JBQUEsSUFBSSxFQUFFO0FBQVAsZUFBbkQ7O0FBSHdEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTVEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS0g7O1NBRWMsZ0I7Ozs7O29HQUFmO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUSxZQUFBLE9BRFIsR0FDa0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsV0FBdkIsQ0FEbEI7QUFFUSxZQUFBLFFBRlIsR0FFbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsV0FBdkIsQ0FGbkI7QUFJSSxZQUFBLFFBQVEsQ0FBQyxJQUFUO0FBQ0EsWUFBQSxRQUFRLENBQUMsSUFBVCxHQUFnQixJQUFoQjtBQUNBLFlBQUEsUUFBUSxDQUFDLEtBQVQ7QUFOSjtBQUFBLG1CQVFxQixPQUFPLENBQUMsSUFBUixFQVJyQjs7QUFBQTtBQVFRLFlBQUEsSUFSUjtBQUFBLG1EQVNxQixJQVRyQjs7QUFBQTtBQVNJLGtFQUF1QjtBQUFkLGdCQUFBLElBQWM7QUFDZixnQkFBQSxDQURlLEdBQ1gsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQWtCLEdBQWxCLENBRFc7QUFFbkIsZ0JBQUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQWpCLEVBQXlDLElBQUksQ0FBQyxFQUE5QztBQUNIO0FBWkw7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFhSSxZQUFBLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEtBQWhCOztBQWJKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7Ozs7Ozs7Ozs7OztBQ3ZKQSxTQUFTLFNBQVQsQ0FBbUIsVUFBbkIsRUFBK0I7QUFDM0IsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLG1CQUFtQixVQUFVLENBQUMsZUFBWCxHQUE2QixPQUE3QixFQUEvQjtBQUVBLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixXQUE3QixDQUF5QyxHQUF6QyxFQUFYO0FBQ0EsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFMLENBQXNCLCtDQUF0QixDQUFoQjs7QUFFQSxNQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNaLFFBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxvQkFBZixFQUFoQjtBQUNBLElBQUEsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsK0NBQWpCO0FBRUEsSUFBQSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLFdBQTdCLENBQXlDLEdBQXpDLEVBQWI7QUFDQSxJQUFBLFVBQVUsQ0FBQyxLQUFYLENBQWlCLE9BQWpCLEVBQTBCLElBQTFCLENBQ0ksVUFBVSxPQUFWLEVBQW1CO0FBQ2YsTUFBQSxhQUFhO0FBQ2IsTUFBQSxNQUFNLENBQUMsSUFBUDtBQUNILEtBSkwsRUFLSSxVQUFVLElBQVYsRUFBZ0I7QUFDWixNQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlO0FBQUMsUUFBQSxPQUFPLEVBQUUsTUFBVjtBQUFrQixRQUFBLEtBQUssRUFBRTtBQUF6QixPQUFmLENBQUQsQ0FBTDtBQUNILEtBUEw7QUFRSCxHQWJELE1BYU87QUFDSCxJQUFBLGFBQWE7QUFDYixJQUFBLE1BQU0sQ0FBQyxJQUFQO0FBQ0g7QUFDSjs7QUFFRCxTQUFTLGFBQVQsR0FBd0I7QUFDcEIsRUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsY0FBMUIsRUFBMEMsT0FBMUMsQ0FBa0QsVUFBQSxDQUFDO0FBQUEsV0FBRSxDQUFDLENBQUMsU0FBRixDQUFZLE1BQVosQ0FBbUIsVUFBbkIsQ0FBRjtBQUFBLEdBQW5EO0FBQ0g7O0FBRUQsU0FBUyxjQUFULEdBQXlCO0FBQ3JCLEVBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGNBQTFCLEVBQTBDLE9BQTFDLENBQWtELFVBQUEsQ0FBQztBQUFBLFdBQUUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxHQUFaLENBQWdCLFVBQWhCLENBQUY7QUFBQSxHQUFuRDtBQUNIOztBQUVELFNBQVMsU0FBVCxDQUFtQixLQUFuQixFQUEwQjtBQUN0QixFQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNIOztBQUVELFNBQVMsWUFBVCxHQUF3QjtBQUNwQixFQUFBLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixDQUFvQixTQUFwQixFQUErQjtBQUMzQixhQUFTLGVBRGtCO0FBRTNCLGFBQVMsR0FGa0I7QUFHM0IsY0FBVSxFQUhpQjtBQUkzQixpQkFBYSxJQUpjO0FBSzNCLGFBQVMsTUFMa0I7QUFNM0IsaUJBQWEsU0FOYztBQU8zQixpQkFBYTtBQVBjLEdBQS9CO0FBU0g7O0FBRUQsU0FBUyxPQUFULEdBQWtCO0FBQ2QsRUFBQSxjQUFjO0FBQ2QsRUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsT0FBN0I7QUFDSDs7ZUFFYyxZOzs7Ozs7Ozs7Ozs7QUN0RGY7SUFFTSxZO0FBQ0YsMEJBQWE7QUFBQTtBQUNULElBQUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkLEVBQW9CLE9BQU8sQ0FBQyxtQkFBRCxDQUEzQjtBQUNIOzs7O1dBRUQsc0JBQWE7QUFBQTs7QUFDVCxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDcEMsUUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVYsRUFBMEI7QUFBQSxpQkFBTSxLQUFJLENBQUMsWUFBTCxDQUFrQixPQUFsQixFQUEyQixNQUEzQixDQUFOO0FBQUEsU0FBMUI7QUFDSCxPQUZNLENBQVA7QUFHSDs7O1dBRUQsc0JBQWEsT0FBYixFQUFzQixNQUF0QixFQUE4QjtBQUMxQixNQUFBLElBQUksQ0FBQyxNQUFMLENBQVksSUFBWixDQUFpQjtBQUNiLFFBQUEsTUFBTSxFQUFFLEtBQUssWUFEQTtBQUViLFFBQUEsUUFBUSxFQUFFLEtBQUssUUFGRjtBQUdiLFFBQUEsYUFBYSxFQUFFLEtBQUssYUFIUDtBQUliLFFBQUEsS0FBSyxFQUFFLEtBQUs7QUFKQyxPQUFqQixFQUtHLElBTEgsQ0FLUSxVQUFVLE1BQVYsRUFBa0I7QUFDdEIsUUFBQSxPQUFPO0FBQ1YsT0FQRCxFQU9HLFVBQVMsS0FBVCxFQUFnQjtBQUNmLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaO0FBQ0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxRQUFBLE1BQU0sQ0FBQyxLQUFELENBQU47QUFDSCxPQVhEO0FBWUg7OztXQUVELHdCQUFjO0FBQ1YsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLFdBQTdCLENBQXlDLEdBQXpDLEVBQVg7QUFDQSxhQUFPLElBQUksQ0FBQyxnQkFBTCxDQUFzQixLQUFLLEtBQTNCLENBQVA7QUFDSDs7O1dBRUQsa0JBQVE7QUFDSixNQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixNQUE3QjtBQUNIOzs7V0FFRCxtQkFBUztBQUNMLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLE9BQTdCO0FBQ0g7Ozs7O0FBSUwsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUMxQ00sZTs7Ozs7QUFDRiwyQkFBWSxFQUFaLEVBQWdCO0FBQUE7QUFBQSw2QkFDTixhQURNLEVBQ1M7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsRUFBRSxFQUFHO0FBQU47QUFBVixLQURUO0FBRWY7OztrREFIMEIsVzs7SUFNekIsZTs7Ozs7QUFDRiwyQkFBWSxFQUFaLEVBQWdCO0FBQUE7QUFBQSw4QkFDTixhQURNLEVBQ1M7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsRUFBRSxFQUFHO0FBQU47QUFBVixLQURUO0FBRWY7OztrREFIMEIsVzs7SUFNekIsUTs7Ozs7QUFDRixvQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7QUFDZiwrQkFBTSxLQUFOO0FBQ0EsSUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsVUFBQyxLQUFEO0FBQUEsYUFBUyxNQUFLLElBQUwsRUFBVDtBQUFBLEtBQWhDO0FBRmU7QUFHbEI7Ozs7V0FFRCxnQkFBTTtBQUFBOztBQUNGLFdBQUssYUFBTCxDQUFtQixRQUFuQixFQUE2QixnQkFBN0IsQ0FBOEMsT0FBOUMsRUFBdUQsWUFBSTtBQUN2RCxRQUFBLE1BQUksQ0FBQyxJQUFMO0FBQ0gsT0FGRDtBQUdIOzs7V0FFRCxpQkFBTztBQUFBLGlEQUNhLEtBQUssZ0JBQUwsQ0FBc0IsWUFBdEIsQ0FEYjtBQUFBOztBQUFBO0FBQ0gsNERBQW9EO0FBQUEsY0FBM0MsR0FBMkM7QUFDaEQsZUFBSyxhQUFMLENBQW1CLGFBQW5CLEVBQWtDLFdBQWxDLENBQThDLEdBQTlDO0FBQ0g7QUFIRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSU47OztXQUVELGlCQUFRLFFBQVIsRUFBa0IsRUFBbEIsRUFBcUI7QUFBQTs7QUFDakIsVUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWDtBQUNBLE1BQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLENBQW1CLFdBQW5CO0FBQ0EsTUFBQSxJQUFJLENBQUMsWUFBTCxDQUFrQixTQUFsQixFQUE2QixFQUE3QjtBQUNBLFdBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxXQUFsQyxDQUE4QyxJQUE5QztBQUVBLFVBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVY7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBZCxDQUFrQixXQUFsQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsUUFBaEI7QUFDQSxNQUFBLElBQUksQ0FBQyxXQUFMLENBQWlCLEdBQWpCO0FBRUEsTUFBQSxHQUFHLENBQUMsZ0JBQUosQ0FBcUIsT0FBckIsRUFBOEI7QUFBQSxlQUFJLE1BQUksQ0FBQyxhQUFMLENBQW1CLElBQUksZUFBSixDQUFvQixFQUFwQixDQUFuQixDQUFKO0FBQUEsT0FBOUI7QUFFQSxNQUFBLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QixDQUFOO0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLEdBQWQsQ0FBa0IsUUFBbEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLFFBQWhCO0FBQ0EsTUFBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixHQUFqQjtBQUVBLE1BQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCO0FBQUEsZUFBSSxNQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGVBQUosQ0FBb0IsRUFBcEIsQ0FBbkIsQ0FBSjtBQUFBLE9BQTlCO0FBQ0g7OztXQUVELGdCQUFNO0FBQ0YsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixRQUF0QjtBQUNIOzs7V0FFRCxnQkFBTTtBQUNGLFdBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsUUFBbkI7QUFDSDs7O1NBRUQsYUFBUyxLQUFULEVBQWU7QUFDWCxVQUFJLEtBQUosRUFBVyxLQUFLLGFBQUwsQ0FBbUIsaUJBQW5CLEVBQXNDLFNBQXRDLENBQWdELE1BQWhELENBQXVELFFBQXZELEVBQVgsS0FDSyxLQUFLLGFBQUwsQ0FBbUIsaUJBQW5CLEVBQXNDLFNBQXRDLENBQWdELEdBQWhELENBQW9ELFFBQXBEO0FBQ1I7OztrREFsRGtCLFc7O0FBcUR2QixNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixXQUE3QixFQUEwQyxRQUExQztlQUNlLFE7Ozs7QUNuRWYsYSxDQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztJQUVNLE87Ozs7Ozs7O2dHQUVGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQUNVLEtBQUssVUFBTCxFQURWOztBQUFBO0FBQUE7QUFBQSx1QkFFVSxLQUFLLFNBQUwsRUFGVjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7O1dBS0Esc0JBQWE7QUFDVCxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDcEMsUUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0I7QUFBQSxpQkFBTSxPQUFPLEVBQWI7QUFBQSxTQUFwQjtBQUNILE9BRk0sQ0FBUDtBQUdIOzs7V0FFRCxxQkFBWTtBQUNSLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLElBQUksQ0FBQyxNQUFMLENBQVksSUFBWixDQUFpQixPQUFqQixFQUEwQixJQUExQixFQUFnQyxPQUFPLEVBQXZDO0FBQ0gsT0FGTSxDQUFQO0FBR0g7Ozs7a0dBRUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBYSxnQkFBQSxRQUFiLDhEQUF3QixnQkFBeEI7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixNQUF4QixDQUErQjtBQUMzQixvQkFBQSxJQUFJLEVBQUcsUUFEb0I7QUFFM0Isb0JBQUEsT0FBTyxFQUFFLENBQUMsZUFBRCxDQUZrQjtBQUczQixvQkFBQSxNQUFNLEVBQUU7QUFIbUIsbUJBQS9CLEVBSUcsSUFKSCxDQUlRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFKLENBQVcsRUFBWixDQUFQO0FBQ0gsbUJBTkQsRUFNRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OzttR0FjQSxrQkFBYSxNQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixXQUErQjtBQUMzQixvQkFBQSxNQUFNLEVBQUc7QUFEa0IsbUJBQS9CLEVBRUcsSUFGSCxDQUVRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFMLENBQVA7QUFDSCxtQkFKRCxFQUlHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBRCxDQUFOO0FBQ0gsbUJBTkQ7QUFPSCxpQkFSTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O2dHQVlBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixJQUF4QixDQUE2QjtBQUN6QjtBQUNBLG9CQUFBLE1BQU0sRUFBRSxlQUZpQjtBQUd6QixvQkFBQSxNQUFNLEVBQUU7QUFIaUIsbUJBQTdCLEVBSUcsSUFKSCxDQUlRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBWixDQUFQO0FBQ0gsbUJBTkQsRUFNRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OzsrRkFjQSxrQkFBVSxNQUFWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixHQUF4QixDQUE0QjtBQUN4QixvQkFBQSxNQUFNLEVBQUUsTUFEZ0I7QUFFeEIsb0JBQUEsR0FBRyxFQUFFO0FBRm1CLG1CQUE1QixFQUdHLElBSEgsQ0FHUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxHQUFELENBQVA7QUFDSCxtQkFMRCxFQUtHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OzttR0FjQSxrQkFBYyxNQUFkLEVBQXNCLElBQXRCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksT0FBWixDQUFvQjtBQUNoQixvQkFBQSxJQUFJLEVBQUcsMkJBQTJCLE1BRGxCO0FBRWhCLG9CQUFBLE1BQU0sRUFBRyxPQUZPO0FBR2hCLG9CQUFBLE1BQU0sRUFBRztBQUNMLHNCQUFBLFVBQVUsRUFBRztBQURSLHFCQUhPO0FBTWhCLG9CQUFBLE9BQU8sRUFBRztBQUNOLHNDQUFpQjtBQURYLHFCQU5NO0FBU2hCLG9CQUFBLElBQUksRUFBRztBQVRTLG1CQUFwQixFQVVHLElBVkgsQ0FVUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQUQsQ0FBUDtBQUNILG1CQVpELEVBWUcsVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLG9CQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBUCxDQUFOO0FBQ0gsbUJBZkQ7QUFnQkgsaUJBakJNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7a0dBcUJBLGtCQUFhLE1BQWIsRUFBcUIsUUFBckI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLE1BQXhCLENBQStCO0FBQzNCLG9CQUFBLE1BQU0sRUFBRSxNQURtQjtBQUUzQixvQkFBQSxJQUFJLEVBQUU7QUFGcUIsbUJBQS9CLEVBR0csSUFISCxDQUdRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBRCxDQUFQO0FBQ0gsbUJBTEQsRUFLRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO0FBQ0Esb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFSRDtBQVNILGlCQVZNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7O2VBZVcsTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoSGY7Ozs7OztJQUVNLFU7Ozs7Ozs7Ozs7OztXQUNGO0FBQ0EsNEJBQWU7QUFDWCxVQUFJLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBbEIsQ0FBMkIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkLENBQXFCLE9BQWhELEVBQ04saUJBRE0sQ0FDWSxJQURaLEVBRU4sU0FGTSxDQUVJLE1BRkosRUFHTixZQUhNLENBR08sTUFIUCxDQUFYO0FBSUE7O0FBRUEsVUFBSSxLQUFLLGVBQUwsSUFBd0IsS0FBSyxVQUFqQyxFQUE2QztBQUN6QyxZQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsYUFBbEIsR0FDUixhQURRLENBQ00sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLENBQXNCLFVBRDVCLEVBRVIsT0FGUSxDQUVBLElBRkEsRUFHUixRQUhRLENBR0MsS0FBSyxLQUhOLEVBSVIsYUFKUSxDQUlNLEtBQUssVUFKWCxFQUtSLGVBTFEsQ0FLUSxLQUFLLFlBTGIsRUFNUixXQU5RLENBTUksS0FBSyxjQU5ULEVBT1Q7QUFQUyxTQVFSLEtBUlEsRUFBYjtBQVNBLFFBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7QUFDSDtBQUNKLEssQ0FFRDtBQUNBOzs7O1dBQ0Esd0JBQWUsSUFBZixFQUFxQjtBQUNqQixVQUFJLElBQUksQ0FBQyxNQUFMLEtBQWdCLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZCxDQUFxQixNQUF6QyxFQUFpRDtBQUM3QyxZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVYsRUFBYSxFQUExQjtBQUNBLFFBQUEsTUFBTSxDQUFDLFFBQVAsNENBQW9ELE1BQXBEO0FBQ0g7QUFDSjs7O0VBOUJvQixtQjs7ZUFpQ1YsVTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNuQ1QsSzs7Ozs7OztXQUNGLGdCQUF5QjtBQUFBLFVBQXBCLElBQW9CLHVFQUFiLFdBQWE7QUFDckIsV0FBSyxZQUFMLEdBQW9CLENBQXBCO0FBRUEsV0FBSyxTQUFMLEdBQWlCO0FBQ2IsUUFBQSxJQUFJLEVBQUUsSUFETztBQUViLFFBQUEsTUFBTSxFQUFFO0FBRkssT0FBakI7QUFLQSxXQUFLLGdCQUFMO0FBQ0EsYUFBTyxJQUFQO0FBQ0g7OztTQU1ELGVBQVc7QUFDUCxhQUFPLEtBQUssU0FBTCxDQUFlLElBQXRCO0FBQ0gsSztTQU5ELGFBQVMsTUFBVCxFQUFpQjtBQUNiLFdBQUssU0FBTCxDQUFlLElBQWYsR0FBc0IsTUFBdEI7QUFDSDs7O1dBTUQsYUFBSSxTQUFKLEVBQWU7QUFDWCxXQUFLLFlBQUwsR0FBb0IsQ0FBcEI7QUFDQSxXQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDQSxhQUFPLElBQVA7QUFDSDs7O1dBRUQsZUFBTTtBQUNGLGFBQU8sS0FBSyxTQUFaO0FBQ0g7OztXQUVELGtCQUFTLEtBQVQsRUFBZ0I7QUFBQTs7QUFDWixNQUFBLEtBQUssYUFBRyxLQUFILDJDQUFZLEtBQUssWUFBdEI7QUFDQSxhQUFPLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsS0FBdEIsQ0FBUDtBQUNILEssQ0FFRDs7OztXQUNBLHVCQUFjLElBQWQsRUFBb0IsRUFBcEIsRUFBdUI7QUFDbkIsVUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFMLENBQWUsTUFBdkI7QUFDQSxVQUFJLENBQUMsQ0FBQyxNQUFGLElBQVksQ0FBaEIsRUFBbUI7QUFGQSxpQkFHQSxDQUFDLENBQUMsQ0FBQyxFQUFELENBQUYsRUFBUSxDQUFDLENBQUMsSUFBRCxDQUFULENBSEE7QUFHbEIsTUFBQSxDQUFDLENBQUMsSUFBRCxDQUhpQjtBQUdULE1BQUEsQ0FBQyxDQUFDLEVBQUQsQ0FIUTtBQUl0Qjs7O1dBRUQsbUJBQVUsS0FBVixFQUFpQjtBQUNiLGFBQU8sS0FBSyxRQUFMLEdBQWdCLE1BQWhCLENBQXVCLEtBQXZCLENBQVA7QUFDSDs7O1dBRUQsaUJBQVEsR0FBUixFQUFhLE1BQWIsRUFBcUI7QUFDakIsYUFBTyxLQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLElBQXZCLENBQTRCLEdBQTVCLENBQVA7QUFDSDs7O1dBRUQsdUJBQWM7QUFDVixVQUFJLEtBQUssVUFBTCxLQUFvQixDQUF4QixFQUEyQjtBQUMzQixXQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQXRCLENBQTZCLEtBQUssWUFBbEMsRUFBZ0QsQ0FBaEQ7QUFDQSxVQUFJLEtBQUssWUFBTCxJQUFxQixLQUFLLFVBQTlCLEVBQTBDLEtBQUssWUFBTCxHQUFvQixLQUFLLFVBQUwsR0FBa0IsQ0FBdEM7QUFDN0M7OztXQUVELGtDQUF3QjtBQUNwQixVQUFJLEtBQUssR0FBRztBQUNSLFFBQUEsSUFBSSxFQUFFLEtBQUssQ0FBQyxZQUFOLENBQW1CLGVBRGpCO0FBRVIsUUFBQSxRQUFRLEVBQUcsRUFGSDtBQUdSLFFBQUEsT0FBTyxFQUFHO0FBSEYsT0FBWjs7QUFNQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBMkI7QUFDdkIsUUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsSUFBbUI7QUFDZixVQUFBLElBQUksRUFBRyxFQURRO0FBRWYsVUFBQSxNQUFNLEVBQUc7QUFGTSxTQUFuQjtBQUlIOztBQUVELFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsSUFBdEIsQ0FBMkIsS0FBM0I7QUFDQSxhQUFPLEtBQVA7QUFDSDs7O1dBRUQsNEJBQW1CO0FBQ2YsVUFBSSxLQUFLLEdBQUc7QUFDUixRQUFBLElBQUksRUFBRSxLQUFLLENBQUMsWUFBTixDQUFtQixRQURqQjtBQUVSLFFBQUEsTUFBTSxFQUFFO0FBRkEsT0FBWjs7QUFLQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsUUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsSUFBa0I7QUFDZCxVQUFBLFFBQVEsRUFBRSxFQURJO0FBRWQsVUFBQSxJQUFJLEVBQUU7QUFGUSxTQUFsQjs7QUFLQSxhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsSUFBMEI7QUFDdEIsWUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBTCxJQUFVLEdBREs7QUFFdEIsWUFBQSxJQUFJLEVBQUUsTUFGZ0I7QUFHdEIsWUFBQSxDQUFDLEVBQUUsRUFIbUI7QUFJdEIsWUFBQSxDQUFDLEVBQUU7QUFKbUIsV0FBMUI7QUFNSDtBQUNKOztBQUVELFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsSUFBdEIsQ0FBMkIsS0FBM0I7QUFDQSxhQUFPLEtBQVA7QUFDSDs7O1NBRUQsZUFBaUI7QUFDYixhQUFPLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBN0I7QUFDSDs7O1dBRUQsMEJBQWdCO0FBQ1osV0FBSyxZQUFMO0FBQ0EsVUFBSSxLQUFLLFlBQUwsSUFBcUIsS0FBSyxVQUE5QixFQUEwQyxLQUFLLFlBQUwsR0FBb0IsS0FBSyxVQUFMLEdBQWtCLENBQXRDO0FBQzdDOzs7V0FFRCwwQkFBZ0I7QUFDWixXQUFLLFlBQUw7QUFDQSxVQUFJLEtBQUssWUFBTCxHQUFvQixDQUF4QixFQUEyQixLQUFLLFlBQUwsR0FBb0IsQ0FBcEI7QUFDOUI7OztXQUVELHlCQUFnQjtBQUNaLFVBQUksS0FBSyxHQUFHLEtBQUssUUFBTCxFQUFaOztBQUVBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsRUFBd0IsS0FBeEIsSUFBaUMsQ0FBakM7QUFDSDtBQUNKO0FBQ0o7OztXQUVELHlCQUFnQjtBQUNaLFVBQUksS0FBSyxHQUFHLEtBQUssUUFBTCxFQUFaOztBQUVBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsRUFBd0IsS0FBeEIsSUFBaUMsQ0FBakM7QUFDSDtBQUNKO0FBQ0o7Ozs7O0FBR0wsS0FBSyxDQUFDLFlBQU4sR0FBcUI7QUFDakIsRUFBQSxRQUFRLEVBQUcsUUFETTtBQUVqQixFQUFBLGVBQWUsRUFBRztBQUZELENBQXJCO2VBS2UsSzs7OztBQzdJZjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQTdCOztJQUVNLFU7Ozs7O0FBQ0Ysd0JBQWM7QUFBQTs7QUFBQTtBQUNWO0FBQ0EsVUFBSyxLQUFMLEdBQWE7QUFDVCxNQUFBLFNBQVMsRUFBRztBQURILEtBQWI7QUFGVTtBQUtiOzs7OztrR0FFRCxpQkFBYSxRQUFiO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixNQUF4QixDQUErQjtBQUMzQixvQkFBQSxJQUFJLEVBQUcsVUFBVSxDQUFDLFFBRFM7QUFFM0Isb0JBQUEsT0FBTyxFQUFFLENBQUMsZUFBRCxDQUZrQjtBQUczQixvQkFBQSxNQUFNLEVBQUU7QUFIbUIsbUJBQS9CLEVBSUcsSUFKSCxDQUlRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0Esb0JBQUEsTUFBSSxDQUFDLE1BQUwsR0FBYyxHQUFHLENBQUMsTUFBSixDQUFXLEVBQXpCO0FBQ0Esb0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBRCxDQUFQO0FBQ0gsbUJBUkQsRUFRRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFWRDtBQVdILGlCQVpNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7Z0dBZ0JBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixHQUF4QixDQUE0QjtBQUN4QixvQkFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDLE1BRFc7QUFFeEIsb0JBQUEsR0FBRyxFQUFFO0FBRm1CLG1CQUE1QixFQUdHLElBSEgsQ0FHUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE1BQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFiO0FBQ0Esb0JBQUEsT0FBTyxDQUFDLEdBQUQsQ0FBUDtBQUNILG1CQU5ELEVBTUcsVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLG9CQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBUCxDQUFOO0FBQ0gsbUJBVEQ7QUFVSCxpQkFYTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O2lHQWVBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksT0FBWixDQUFvQjtBQUNoQixvQkFBQSxJQUFJLEVBQUcsMkJBQTJCLE1BQUksQ0FBQyxNQUR2QjtBQUVoQixvQkFBQSxNQUFNLEVBQUcsT0FGTztBQUdoQixvQkFBQSxNQUFNLEVBQUc7QUFDTCxzQkFBQSxVQUFVLEVBQUc7QUFEUixxQkFITztBQU1oQixvQkFBQSxPQUFPLEVBQUc7QUFDTixzQ0FBaUI7QUFEWCxxQkFOTTtBQVNoQixvQkFBQSxJQUFJLEVBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFJLENBQUMsS0FBcEI7QUFUUyxtQkFBcEIsRUFVRyxJQVZILENBVVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFELENBQVA7QUFDSCxtQkFaRCxFQVlHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQWZEO0FBZ0JILGlCQWpCTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O2tHQXFCQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBNkI7QUFDekIsb0JBQUEsQ0FBQyxFQUFFLHdCQURzQjtBQUV6QixvQkFBQSxNQUFNLEVBQUU7QUFGaUIsbUJBQTdCLEVBR0csSUFISCxDQUdRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsd0JBQUksR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFYLENBQWlCLE1BQWpCLEdBQTBCLENBQTlCLEVBQWdDO0FBQzVCLHNCQUFBLE1BQUksQ0FBQyxNQUFMLEdBQWMsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFYLENBQWlCLENBQWpCLEVBQW9CLEVBQWxDO0FBQ0Esc0JBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNIOztBQUNELG9CQUFBLE9BQU8sQ0FBQyxLQUFELENBQVA7QUFDSCxtQkFURCxFQVNHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQVhEO0FBWUgsaUJBYk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7O0VBNURxQixhOztBQThFekIsVUFBVSxDQUFDLFFBQVgsR0FBc0IsZUFBdEI7ZUFDZSxVOzs7Ozs7Ozs7Ozs7Ozs7OztJQ2xGVCxNO0FBQ0Ysb0JBQWM7QUFBQTtBQUNWO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLHlDQUFwQixDQUZVLENBSVY7O0FBQ0EsU0FBSyxRQUFMLEdBQWdCLDBFQUFoQixDQUxVLENBT1Y7O0FBQ0EsU0FBSyxLQUFMLEdBQWEsY0FBYixDQVJVLENBVVY7O0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBQyw0Q0FBRCxDQUFiO0FBRUEsU0FBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0gsRyxDQUVEOzs7OztXQUNBLHNCQUFhO0FBQUE7O0FBQ1QsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3BDLFlBQUksS0FBSSxDQUFDLFVBQUwsS0FBb0IsSUFBeEIsRUFBOEI7QUFDMUIsVUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVo7QUFDQSxVQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQjtBQUNoQix3QkFBWSxvQkFBTTtBQUNkLGNBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CO0FBQUMsNEJBQVk7QUFBQSx5QkFBTSxLQUFJLENBQUMsYUFBTCxDQUFtQixPQUFuQixFQUE0QixNQUE1QixDQUFOO0FBQUE7QUFBYixlQUFuQjtBQUNIO0FBSGUsV0FBcEI7QUFLSCxTQVBELE1BT087QUFDSCxVQUFBLE9BQU87QUFDVjtBQUNKLE9BWE0sQ0FBUDtBQVlIOzs7V0FFRCx1QkFBYyxPQUFkLEVBQXVCLE1BQXZCLEVBQStCO0FBQUE7O0FBQzNCLFVBQU0sS0FBSyxHQUFHO0FBQ1YscUJBQWEsS0FBSyxRQURSO0FBRVYsaUJBQVMsS0FBSyxLQUZKO0FBR1YscUJBQWE7QUFISCxPQUFkO0FBTUEsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosQ0FBa0IsU0FBbEIsQ0FBNEIsS0FBNUIsRUFBbUMsVUFBQyxVQUFEO0FBQUEsZUFBZ0IsTUFBSSxDQUFDLGdCQUFMLENBQXNCLFVBQXRCLEVBQWtDLE9BQWxDLEVBQTJDLE1BQTNDLENBQWhCO0FBQUEsT0FBbkM7QUFDSDs7O1dBRUQsMEJBQWlCLFVBQWpCLEVBQTZCLE9BQTdCLEVBQXNDLE1BQXRDLEVBQThDO0FBQzFDLFVBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQTlCLEVBQXFDO0FBQ2pDLGFBQUssVUFBTCxHQUFrQixVQUFVLENBQUMsWUFBN0I7QUFDQSxRQUFBLE9BQU87QUFDVixPQUhELE1BR087QUFDSCxRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU47QUFDSDtBQUNKLEssQ0FFRDs7OztXQUNBLHFCQUFZO0FBQ1IsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVo7O0FBQ0EsVUFBSSxLQUFLLFVBQVQsRUFBcUI7QUFDakIsWUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWxCLENBQTJCLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZCxDQUFxQixPQUFoRCxFQUNOLGlCQURNLENBQ1ksSUFEWixFQUVOLHNCQUZNLENBRWlCLElBRmpCLENBQVg7QUFLQSxZQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsYUFBbEIsR0FDUixhQURRLENBQ00sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLENBQXNCLFVBRDVCLEVBRVIsT0FGUSxDQUVBLElBRkEsRUFHUixRQUhRLENBR0MsS0FBSyxLQUhOLEVBSVIsYUFKUSxDQUlNLEtBQUssVUFKWCxFQUtSLGVBTFEsQ0FLUSxLQUFLLFlBTGIsRUFNUixXQU5RLENBTUksS0FBSyxjQU5ULEVBT1IsS0FQUSxFQUFiO0FBUUEsUUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQjtBQUNIO0FBQ0osSyxDQUVEOzs7O1dBQ0Esc0JBQWE7QUFDVCxVQUFJLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBbEIsQ0FBMkIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkLENBQXFCLE9BQWhELEVBQ04saUJBRE0sQ0FDWSxJQURaLEVBRU4sU0FGTSxDQUVJLE1BRkosRUFHTixZQUhNLENBR08sTUFIUCxDQUFYO0FBSUE7O0FBRUEsVUFBSSxLQUFLLGVBQUwsSUFBd0IsS0FBSyxVQUFqQyxFQUE2QztBQUN6QyxZQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsYUFBbEIsR0FDUixhQURRLENBQ00sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLENBQXNCLFVBRDVCLEVBRVIsT0FGUSxDQUVBLElBRkEsRUFHUixRQUhRLENBR0MsS0FBSyxLQUhOLEVBSVIsYUFKUSxDQUlNLEtBQUssVUFKWCxFQUtSLGVBTFEsQ0FLUSxLQUFLLFlBTGIsRUFNUixXQU5RLENBTUksS0FBSyxjQU5ULEVBT1Q7QUFQUyxTQVFSLEtBUlEsRUFBYjtBQVNBLFFBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7QUFDSDtBQUNKLEssQ0FHRDs7OztXQUNBLHdCQUFlLElBQWYsRUFBcUIsQ0FDcEI7Ozs7O2VBR1UsTTs7Ozs7O0FDcEdmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQ2I7QUFDQSxFQUFBLFlBQVksRUFBRyx5Q0FGRjtBQUliO0FBQ0EsRUFBQSxRQUFRLEVBQUcsMEVBTEU7QUFPYjtBQUNBLEVBQUEsS0FBSyxFQUFHLGNBUks7QUFVYjtBQUNBLEVBQUEsYUFBYSxFQUFHLENBQUMsNERBQUQsQ0FYSDtBQWFiO0FBQ0EsRUFBQSxLQUFLLEVBQUU7QUFkTSxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIGtleSwgYXJnKSB7XG4gIHRyeSB7XG4gICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0KGVycm9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaW5mby5kb25lKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3Rocm93KGVycikge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgX25leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXN5bmNUb0dlbmVyYXRvcjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjaztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdC5qc1wiKTtcblxuZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gIGlmIChpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IFJlZmxlY3QuY29uc3RydWN0O1xuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9jb25zdHJ1Y3QgPSBmdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgICAgIHZhciBhID0gW251bGxdO1xuICAgICAgYS5wdXNoLmFwcGx5KGEsIGFyZ3MpO1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gRnVuY3Rpb24uYmluZC5hcHBseShQYXJlbnQsIGEpO1xuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IENvbnN0cnVjdG9yKCk7XG4gICAgICBpZiAoQ2xhc3MpIHNldFByb3RvdHlwZU9mKGluc3RhbmNlLCBDbGFzcy5wcm90b3R5cGUpO1xuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gX2NvbnN0cnVjdC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jb25zdHJ1Y3Q7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jcmVhdGVDbGFzcztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICBtb2R1bGUuZXhwb3J0cyA9IF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gICAgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgfTtcbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9nZXRQcm90b3R5cGVPZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbmhlcml0cztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pc05hdGl2ZUZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBGdW5jdGlvbi50b1N0cmluZy5jYWxsKGZuKS5pbmRleE9mKFwiW25hdGl2ZSBjb2RlXVwiKSAhPT0gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzTmF0aXZlRnVuY3Rpb247XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlO1xuXG4gIHRyeSB7XG4gICAgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgX3R5cGVvZiA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQgPSByZXF1aXJlKFwiLi9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanNcIik7XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKGNhbGwgJiYgKF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIHJldHVybiBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm47XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgICBvLl9fcHJvdG9fXyA9IHA7XG4gICAgcmV0dXJuIG87XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zZXRQcm90b3R5cGVPZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90eXBlb2Y7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vZ2V0UHJvdG90eXBlT2YuanNcIik7XG5cbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgaXNOYXRpdmVGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlRnVuY3Rpb24uanNcIik7XG5cbnZhciBjb25zdHJ1Y3QgPSByZXF1aXJlKFwiLi9jb25zdHJ1Y3QuanNcIik7XG5cbmZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHtcbiAgdmFyIF9jYWNoZSA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IHVuZGVmaW5lZDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IF93cmFwTmF0aXZlU3VwZXIgPSBmdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gICAgaWYgKENsYXNzID09PSBudWxsIHx8ICFpc05hdGl2ZUZ1bmN0aW9uKENsYXNzKSkgcmV0dXJuIENsYXNzO1xuXG4gICAgaWYgKHR5cGVvZiBDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBfY2FjaGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmIChfY2FjaGUuaGFzKENsYXNzKSkgcmV0dXJuIF9jYWNoZS5nZXQoQ2xhc3MpO1xuXG4gICAgICBfY2FjaGUuc2V0KENsYXNzLCBXcmFwcGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBXcmFwcGVyKCkge1xuICAgICAgcmV0dXJuIGNvbnN0cnVjdChDbGFzcywgYXJndW1lbnRzLCBnZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgV3JhcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENsYXNzLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IFdyYXBwZXIsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNldFByb3RvdHlwZU9mKFdyYXBwZXIsIENsYXNzKTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfd3JhcE5hdGl2ZVN1cGVyO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IGRlZmluZShcbiAgICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICB0b1N0cmluZ1RhZ1N5bWJvbCxcbiAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgKTtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBkZWZpbmUocHJvdG90eXBlLCBtZXRob2QsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKTtcbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiIsImltcG9ydCBQaWNrZXIgZnJvbSBcIi4vbW9kdWxlcy9QaWNrZXIuanNcIjtcclxuaW1wb3J0IEZpbGVQaWNrZXIgZnJvbSBcIi4vbW9kdWxlcy9GaWxlUGlja2VyLmpzXCI7XHJcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2R1bGVzL01vZGVsLmpzXCI7XHJcbmltcG9ydCBGaWxlT3BzIGZyb20gXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiO1xyXG5pbXBvcnQgUGFyYW1ldGVycyBmcm9tIFwiLi9tb2R1bGVzL1BhcmFtZXRlcnMuanNcIjtcclxuaW1wb3J0IEZpbGVMaXN0IGZyb20gXCIuL21vZHVsZXMvRmlsZUxpc3QuanNcIjtcclxuaW1wb3J0IHJlbmRlckJ1dHRvbiBmcm9tIFwiLi9ob3N0L3JlbmRlckJ1dHRvblwiO1xyXG5cclxubGV0IGZvbGRlcklkID0gbnVsbDtcclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG53aW5kb3cuZmlsZU9wcyA9IGZpbGVPcHM7XHJcblxyXG53aW5kb3cucmVuZGVyQnV0dG9uID0gcmVuZGVyQnV0dG9uO1xyXG5cclxuLy8gbWFpbiBjYWxsZWQgZnJvbSByZW5kZXJCdXR0b24uanNcclxud2luZG93Lm1haW4gPSBhc3luYyBmdW5jdGlvbiAoKSB7XHJcbiAgICBhd2FpdCBjaGVja0ZvckdhbWUoKTtcclxuICAgIGF3YWl0IGZpbGVPcHMubG9hZCgpO1xyXG4gICAgYWRkTWVudUxpc3RlbmVycygpO1xyXG4gICAgc2V0dXBGaWxlTGlzdCgpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gb25Mb2FkKGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIldpbmRvdyBvbmxvYWRcIik7XHJcbiAgICBsZXQgaWQgPSBldmVudC5kZXRhaWwuaWQ7XHJcbiAgICB3aW5kb3cubG9jYXRpb24gPSBgZWRpdG9yLmVqcz9hY3Rpb249bG9hZCZmaWxlSWQ9JHtpZH1gO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjaGVja0ZvckdhbWUoKSB7XHJcbiAgICBsZXQgdG9rZW4gPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpLmdldEF1dGhSZXNwb25zZSgpLmlkX3Rva2VuO1xyXG5cclxuICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICAgIHhodHRwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIChldmVudCkgPT4ge1xyXG4gICAgICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlWydoYXMtZ2FtZSddID09PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBgbGF1bmNoX2NvbnNvbGUuZWpzP2hvc3Q9JHtyZXNwb25zZS5ob3N0fSZjb250PSR7cmVzcG9uc2UuY29udGVzdGFudH1gO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIFwiZ2FtZS1tYW5hZ2VyLXNlcnZpY2VcIik7XHJcbiAgICB4aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHRva2VuOiB0b2tlbixcclxuICAgICAgICBhY3Rpb246IFwiaGFzLWdhbWVcIlxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvbkxhdW5jaChldmVudCkge1xyXG4gICAgbGV0IGlkID0gZXZlbnQuZGV0YWlsLmlkOyAvLyBnb29nbGUgZmlsZSBpZGVudGlmaWVyXHJcblxyXG4gICAgbGV0IGZpbGUgPSBhd2FpdCBmaWxlT3BzLmdldChpZCk7XHJcbiAgICBsZXQgbW9kZWwgPSBKU09OLnBhcnNlKGZpbGUuYm9keSk7XHJcbiAgICBsZXQgdG9rZW4gPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpLmdldEF1dGhSZXNwb25zZSgpLmlkX3Rva2VuO1xyXG5cclxuICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGh0dHAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3VsdCA9PT0gXCJzdWNjZXNzXCIpIHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYGxhdW5jaF9jb25zb2xlLmVqcz9ob3N0PSR7cmVzcG9uc2UuaG9zdH0mY29udD0ke3Jlc3BvbnNlLmNvbnRlc3RhbnR9YDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvciBsYXVuY2hpbmcgZ2FtZVwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIFwibGF1bmNoXCIpO1xyXG4gICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtb2RlbDogbW9kZWwsXHJcbiAgICAgICAgdG9rZW46IHRva2VuLFxyXG4gICAgICAgIGFjdGlvbjogXCJsYXVuY2hcIlxyXG4gICAgfSkpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsYXVuY2hWZXJpZnkoKSB7XHJcbiAgICBsZXQgdG9rZW4gPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpLmdldEF1dGhSZXNwb25zZSgpLmlkX3Rva2VuO1xyXG5cclxuICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGh0dHAub3BlbignUE9TVCcsICd2ZXJpZnknKTtcclxuICAgIHhodHRwLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICB4aHR0cC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc3BvbnNlIHRleHQnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh4aHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KHt0b2tlbjogdG9rZW59KTtcclxuICAgIHhodHRwLnNlbmQoanNvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldHVwRmlsZUxpc3QoKSB7XHJcbiAgICBsZXQgZmlsZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZmlsZS1saXN0XCIpO1xyXG5cclxuICAgIGZpbGVMaXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJkZWxldGUtZmlsZVwiLCBhc3luYyAoZXZlbnQpID0+IHtcclxuICAgICAgICBmaWxlTGlzdC5idXN5ID0gdHJ1ZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBmaWxlT3BzLmRlbGV0ZShldmVudC5kZXRhaWwuaWQpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICAgICAgZmlsZUxpc3QuYnVzeSA9IGZhbHNlO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZE1lbnVMaXN0ZW5lcnMoKSB7XHJcbiAgICBsZXQgYnVzeUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnVzeS1ib3hcIik7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjcmVhdGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgYnVzeUJveC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGxldCBtb2RlbCA9IG5ldyBNb2RlbCgpLmluaXQoXCJHYW1lIE5hbWVcIik7XHJcbiAgICAgICAgbGV0IGZwID0gYXdhaXQgZmlsZU9wcy5jcmVhdGUoKTtcclxuICAgICAgICBhd2FpdCBmaWxlT3BzLnNldEJvZHkoZnAsIEpTT04uc3RyaW5naWZ5KG1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLm9yaWdpbiArIFwiL2VkaXRvci5lanM/YWN0aW9uPWxvYWQmZmlsZUlkPVwiICsgZnA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3VwbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN1cGxvYWQtYW5jaG9yXCIpO1xyXG4gICAgICAgIGFuY2hvci5jbGljaygpO1xyXG5cclxuICAgICAgICBhbmNob3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhbmNob3IuZmlsZXNbMF07XHJcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gYXN5bmMgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IEpTT04ucGFyc2UoZS50YXJnZXQucmVzdWx0KS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZwID0gYXdhaXQgZmlsZU9wcy5jcmVhdGUobmFtZSArIFwiLmpzb25cIik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBmaWxlT3BzLnNldEJvZHkoZnAsIGUudGFyZ2V0LnJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24ub3JpZ2luICsgXCIvZWRpdG9yLmVqcz9hY3Rpb249bG9hZCZmaWxlSWQ9XCIgKyBmcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZWFkZXIucmVhZEFzVGV4dChkYXRhKTtcclxuICAgICAgICB9LCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICBwb3B1bGF0ZUZpbGVMaXN0KCk7XHJcbiAgICAgICAgbGV0IGZpbGVMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImZpbGUtbGlzdFwiKTtcclxuICAgICAgICBmaWxlTGlzdC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0LWZpbGVcIiwgb25Mb2FkLCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsYXVuY2hcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgcG9wdWxhdGVGaWxlTGlzdCgpO1xyXG4gICAgICAgIGxldCBmaWxlTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJmaWxlLWxpc3RcIik7XHJcbiAgICAgICAgZmlsZUxpc3QuYWRkRXZlbnRMaXN0ZW5lcihcInNlbGVjdC1maWxlXCIsIG9uTGF1bmNoLCB7b25jZTogdHJ1ZX0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlRmlsZUxpc3QoKSB7XHJcbiAgICBsZXQgYnVzeUJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnVzeS1ib3hcIik7XHJcbiAgICBsZXQgZmlsZUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZmlsZS1saXN0XCIpO1xyXG5cclxuICAgIGZpbGVMaXN0LnNob3coKTtcclxuICAgIGZpbGVMaXN0LmJ1c3kgPSB0cnVlO1xyXG4gICAgZmlsZUxpc3QuY2xlYXIoKTtcclxuXHJcbiAgICBsZXQgbGlzdCA9IGF3YWl0IGZpbGVPcHMubGlzdCgpO1xyXG4gICAgZm9yIChsZXQgaXRlbSBvZiBsaXN0KSB7XHJcbiAgICAgICAgbGV0IGkgPSBpdGVtLm5hbWUuaW5kZXhPZihcIi5cIik7XHJcbiAgICAgICAgZmlsZUxpc3QuYWRkSXRlbShpdGVtLm5hbWUuc3Vic3RyKDAsIGkpLCBpdGVtLmlkKTtcclxuICAgIH1cclxuICAgIGZpbGVMaXN0LmJ1c3kgPSBmYWxzZTtcclxufSIsImZ1bmN0aW9uIG9uU3VjY2Vzcyhnb29nbGVVc2VyKSB7XHJcbiAgICBjb25zb2xlLmxvZygnTG9nZ2VkIGluIGFzOiAnICsgZ29vZ2xlVXNlci5nZXRCYXNpY1Byb2ZpbGUoKS5nZXROYW1lKCkpO1xyXG5cclxuICAgIGxldCB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgIGxldCBoYXNTY29wZXMgPSB1c2VyLmhhc0dyYW50ZWRTY29wZXMoJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuYXBwZGF0YScpO1xyXG5cclxuICAgIGlmICghaGFzU2NvcGVzKSB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG5ldyBnYXBpLmF1dGgyLlNpZ25pbk9wdGlvbnNCdWlsZGVyKCk7XHJcbiAgICAgICAgb3B0aW9ucy5zZXRTY29wZSgnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5hcHBkYXRhJyk7XHJcblxyXG4gICAgICAgIGdvb2dsZVVzZXIgPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpO1xyXG4gICAgICAgIGdvb2dsZVVzZXIuZ3JhbnQob3B0aW9ucykudGhlbihcclxuICAgICAgICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZUJ1dHRvbnMoKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5tYWluKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChmYWlsKSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChKU09OLnN0cmluZ2lmeSh7bWVzc2FnZTogXCJmYWlsXCIsIHZhbHVlOiBmYWlsfSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZW5hYmxlQnV0dG9ucygpO1xyXG4gICAgICAgIHdpbmRvdy5tYWluKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVuYWJsZUJ1dHRvbnMoKXtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuaG9tZS1vcHRpb25cIikuZm9yRWFjaChlPT5lLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZFwiKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc2FibGVCdXR0b25zKCl7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmhvbWUtb3B0aW9uXCIpLmZvckVhY2goZT0+ZS5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRcIikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkZhaWx1cmUoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyQnV0dG9uKCkge1xyXG4gICAgZ2FwaS5zaWduaW4yLnJlbmRlcignc2lnbi1pbicsIHtcclxuICAgICAgICAnc2NvcGUnOiAncHJvZmlsZSBlbWFpbCcsXHJcbiAgICAgICAgJ3dpZHRoJzogMjQwLFxyXG4gICAgICAgICdoZWlnaHQnOiA1MCxcclxuICAgICAgICAnbG9uZ3RpdGxlJzogdHJ1ZSxcclxuICAgICAgICAndGhlbWUnOiAnZGFyaycsXHJcbiAgICAgICAgJ29uc3VjY2Vzcyc6IG9uU3VjY2VzcyxcclxuICAgICAgICAnb25mYWlsdXJlJzogb25GYWlsdXJlXHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2lnbk91dCgpe1xyXG4gICAgZGlzYWJsZUJ1dHRvbnMoKTtcclxuICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZW5kZXJCdXR0b247IiwiLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBBdXRoZW50aWNhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHJlcXVpcmUoXCIuL2dvb2dsZUZpZWxkcy5qc1wiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpID0+IHRoaXMuX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgSU5JVFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQXV0aG9yaXplZCgpe1xyXG4gICAgICAgIHZhciB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdXNlci5oYXNHcmFudGVkU2NvcGVzKHRoaXMuc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25Jbigpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbkluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbk91dCgpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdXRoZW50aWNhdGU7IiwiXHJcbmNsYXNzIERlbGV0ZUZpbGVFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGlkKSB7XHJcbiAgICAgICAgc3VwZXIoJ2RlbGV0ZS1maWxlJywge2RldGFpbCA6IHtpZCA6IGlkfX0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTZWxlY3RGaWxlRXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgICAgIHN1cGVyKCdzZWxlY3QtZmlsZScsIHtkZXRhaWwgOiB7aWQgOiBpZH19KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRmlsZUxpc3QgZXh0ZW5kcyBIVE1MRWxlbWVudHtcclxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIocHJvcHMpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZlbnQpPT50aGlzLmxvYWQoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZCgpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi5jbG9zZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiLmZpbGUtaXRlbVwiKSl7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNpbm5lci1saXN0XCIpLnJlbW92ZUNoaWxkKGVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZEl0ZW0oZmlsZW5hbWUsIGlkKXtcclxuICAgICAgICBsZXQgbWV0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgbWV0YS5jbGFzc0xpc3QuYWRkKFwiZmlsZS1pdGVtXCIpO1xyXG4gICAgICAgIG1ldGEuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpZCk7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2lubmVyLWxpc3RcIikuYXBwZW5kQ2hpbGQobWV0YSk7XHJcblxyXG4gICAgICAgIGxldCBlbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImZpbGUtbmFtZVwiKTtcclxuICAgICAgICBlbGUuaW5uZXJUZXh0ID0gZmlsZW5hbWU7XHJcbiAgICAgICAgbWV0YS5hcHBlbmRDaGlsZChlbGUpO1xyXG5cclxuICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmRpc3BhdGNoRXZlbnQobmV3IFNlbGVjdEZpbGVFdmVudChpZCkpKTtcclxuXHJcbiAgICAgICAgZWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJkZWxldGVcIik7XHJcbiAgICAgICAgZWxlLmlubmVyVGV4dCA9IFwiRGVsZXRlXCI7XHJcbiAgICAgICAgbWV0YS5hcHBlbmRDaGlsZChlbGUpO1xyXG5cclxuICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmRpc3BhdGNoRXZlbnQobmV3IERlbGV0ZUZpbGVFdmVudChpZCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCl7XHJcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGUoKXtcclxuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGJ1c3kodmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSkgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2ZpbGUtbGlzdC1idXN5XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgZWxzZSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZmlsZS1saXN0LWJ1c3lcIikuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZmlsZS1saXN0JywgRmlsZUxpc3QpO1xyXG5leHBvcnQgZGVmYXVsdCBGaWxlTGlzdDsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBGaWxlT3BzIHtcclxuXHJcbiAgICBhc3luYyBsb2FkKCl7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkRHJpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkubG9hZCgnY2xpZW50JywgKCkgPT4gcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRHJpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQubG9hZCgnZHJpdmUnLCAndjMnLCByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZShmaWxlbmFtZSA9IFwiR2FtZSBOYW1lLmpzb25cIil7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IGZpbGVuYW1lLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50czogWydhcHBEYXRhRm9sZGVyJ10sXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IFwiaWRcIlxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmlkKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGUoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmRlbGV0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQgOiBmaWxlSWRcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbGlzdCgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMubGlzdCh7XHJcbiAgICAgICAgICAgICAgICAvLyBxOiBgbmFtZSBjb250YWlucyAnLmpzb24nYCxcclxuICAgICAgICAgICAgICAgIHNwYWNlczogJ2FwcERhdGFGb2xkZXInLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnZmlsZXMvbmFtZSxmaWxlcy9pZCxmaWxlcy9tb2RpZmllZFRpbWUnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuZmlsZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldChmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzZXRCb2R5KGZpbGVJZCwgYm9keSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogYm9keVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5hbWUoZmlsZUlkLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsZU9wczsiLCJpbXBvcnQgUGlja2VyIGZyb20gXCIuL1BpY2tlci5qc1wiO1xyXG5cclxuY2xhc3MgRmlsZVBpY2tlciBleHRlbmRzIFBpY2tlcntcclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGNyZWF0ZVBpY2tlcigpIHtcclxuICAgICAgICBsZXQgdmlldyA9IG5ldyBnb29nbGUucGlja2VyLkRvY3NWaWV3KGdvb2dsZS5waWNrZXIuVmlld0lkLkZPTERFUlMpXHJcbiAgICAgICAgICAgIC5zZXRJbmNsdWRlRm9sZGVycyh0cnVlKVxyXG4gICAgICAgICAgICAuc2V0UGFyZW50KCdyb290JylcclxuICAgICAgICAgICAgLnNldE1pbWVUeXBlcyhcImpzb25cIik7XHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5waWNrZXJBcGlMb2FkZWQgJiYgdGhpcy5vYXV0aFRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCBwaWNrZXIgPSBuZXcgZ29vZ2xlLnBpY2tlci5QaWNrZXJCdWlsZGVyKClcclxuICAgICAgICAgICAgICAgIC5lbmFibGVGZWF0dXJlKGdvb2dsZS5waWNrZXIuRmVhdHVyZS5OQVZfSElEREVOKVxyXG4gICAgICAgICAgICAgICAgLmFkZFZpZXcodmlldylcclxuICAgICAgICAgICAgICAgIC5zZXRBcHBJZCh0aGlzLmFwcElkKVxyXG4gICAgICAgICAgICAgICAgLnNldE9BdXRoVG9rZW4odGhpcy5vYXV0aFRva2VuKVxyXG4gICAgICAgICAgICAgICAgLnNldERldmVsb3BlcktleSh0aGlzLmRldmVsb3BlcktleSlcclxuICAgICAgICAgICAgICAgIC5zZXRDYWxsYmFjayh0aGlzLnBpY2tlckNhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgLy8gLmFkZFZpZXcobmV3IGdvb2dsZS5waWNrZXIuRG9jc1VwbG9hZFZpZXcoKSlcclxuICAgICAgICAgICAgICAgIC5idWlsZCgpO1xyXG4gICAgICAgICAgICBwaWNrZXIuc2V0VmlzaWJsZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQSBzaW1wbGUgY2FsbGJhY2sgaW1wbGVtZW50YXRpb24uXHJcbiAgICAvLyBPdmVycmlkZSB0aGlzIG1ldGhvZCBvbiB1c2UuXHJcbiAgICBwaWNrZXJDYWxsYmFjayhkYXRhKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuYWN0aW9uID09PSBnb29nbGUucGlja2VyLkFjdGlvbi5QSUNLRUQpIHtcclxuICAgICAgICAgICAgdmFyIGZpbGVJZCA9IGRhdGEuZG9jc1swXS5pZDtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYGVkaXRvci5odG1sP2FjdGlvbj1sb2FkJmZpbGVJZD0ke2ZpbGVJZH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsZVBpY2tlcjtcclxuXHJcbiIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwubmFtZSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um91bmQoaW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IGluZGV4ID8/IHRoaXMuY3VycmVudFJvdW5kO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gdGVzdFxyXG4gICAgc2V0Um91bmRJbmRleChmcm9tLCB0byl7XHJcbiAgICAgICAgbGV0IHIgPSB0aGlzLmdhbWVNb2RlbC5yb3VuZHM7XHJcbiAgICAgICAgaWYgKHIubGVuZ3RoIDw9IDEpIHJldHVybjtcclxuICAgICAgICBbcltmcm9tXSwgclt0b11dID0gW3JbdG9dLCByW2Zyb21dXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbHVtbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbihjb2x1bW4pLmNlbGxbcm93XTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3VuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3VuZENvdW50ID09PSAxKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnNwbGljZSh0aGlzLmN1cnJlbnRSb3VuZCwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKXtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UsXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uIDogXCJcIixcclxuICAgICAgICAgICAgYW5zd2VycyA6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspe1xyXG4gICAgICAgICAgICByb3VuZC5hbnN3ZXJzW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpc1RydWUgOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENhdGVnb3J5Um91bmQoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlksXHJcbiAgICAgICAgICAgIGNvbHVtbjogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICByb3VuZC5jb2x1bW5baV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJcIixcclxuICAgICAgICAgICAgICAgIGNlbGw6IFtdXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGogKyAxKSAqIDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBxOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGE6IFwiXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcm91bmRDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBpbmNyZW1lbnRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPCAwKSB0aGlzLmN1cnJlbnRSb3VuZCA9IDBcclxuICAgIH1cclxuXHJcbiAgICBpbmNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlICo9IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAvPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5Nb2RlbC5xdWVzdGlvblR5cGUgPSB7XHJcbiAgICBDQVRFR09SWSA6IFwiY2hvaWNlXCIsXHJcbiAgICBNVUxUSVBMRV9DSE9JQ0UgOiBcIm11bHRpcGxlX2Nob2ljZVwiXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2RlbDsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgQWJzdHJhY3RGaWxlcyA9IHJlcXVpcmUoXCIuL0F1dGhlbnRpY2F0ZS5qc1wiKTtcclxuXHJcbmNsYXNzIFBhcmFtZXRlcnMgZXh0ZW5kcyBBYnN0cmFjdEZpbGVze1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLnBhcmFtID0ge1xyXG4gICAgICAgICAgICBsYXN0X2ZpbGUgOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZShkaXJUb2tlbil7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IFBhcmFtZXRlcnMuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWxlSWQgPSByZXMucmVzdWx0LmlkO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiB0aGlzLmZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbSA9IEpTT04ucGFyc2UocmVzLmJvZHkpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgd3JpdGUoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICAgICAgcGF0aCA6IFwidXBsb2FkL2RyaXZlL3YzL2ZpbGVzL1wiICsgdGhpcy5maWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IEpTT04uc3RyaW5naWZ5KHRoaXMucGFyYW0pXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGV4aXN0cygpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMubGlzdCh7XHJcbiAgICAgICAgICAgICAgICBxOiBcIm5hbWUgPSAnc2V0dGluZ3MuanNvbidcIixcclxuICAgICAgICAgICAgICAgIHNwYWNlczogJ2FwcERhdGFGb2xkZXInXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLnJlc3VsdC5maWxlcy5sZW5ndGggPiAwKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVJZCA9IHJlcy5yZXN1bHQuZmlsZXNbMF0uaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcblBhcmFtZXRlcnMuZmlsZW5hbWUgPSBcInNldHRpbmdzLmpzb25cIjtcclxuZXhwb3J0IGRlZmF1bHQgUGFyYW1ldGVyczsiLCJjbGFzcyBQaWNrZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICAgICAgdGhpcy5kZXZlbG9wZXJLZXkgPSAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJztcclxuXHJcbiAgICAgICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICAgICAgdGhpcy5jbGllbnRJZCA9IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCJcclxuXHJcbiAgICAgICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICAgICAgdGhpcy5hcHBJZCA9IFwiMTU4ODIzMTM0NjgxXCI7XHJcblxyXG4gICAgICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgICAgIHRoaXMuc2NvcGUgPSBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZSddO1xyXG5cclxuICAgICAgICB0aGlzLm9hdXRoVG9rZW4gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSB0aGUgR29vZ2xlIEFQSSBMb2FkZXIgc2NyaXB0IHRvIGxvYWQgdGhlIGdvb2dsZS5waWNrZXIgc2NyaXB0LlxyXG4gICAgbG9hZFBpY2tlcigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vYXV0aFRva2VuID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImF1dGhvcml6ZVwiKTtcclxuICAgICAgICAgICAgICAgIGdhcGkubG9hZCgncGlja2VyJywge1xyXG4gICAgICAgICAgICAgICAgICAgICdjYWxsYmFjayc6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FwaS5sb2FkKCdhdXRoMicsIHsnY2FsbGJhY2snOiAoKSA9PiB0aGlzLm9uQXV0aEFwaUxvYWQocmVzb2x2ZSwgcmVqZWN0KX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25BdXRoQXBpTG9hZChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBjb25zdCBwYXJhbSA9IHtcclxuICAgICAgICAgICAgJ2NsaWVudF9pZCc6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgICdzY29wZSc6IHRoaXMuc2NvcGUsXHJcbiAgICAgICAgICAgICdpbW1lZGlhdGUnOiBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LmdhcGkuYXV0aDIuYXV0aG9yaXplKHBhcmFtLCAoYXV0aFJlc3VsdCkgPT4gdGhpcy5oYW5kbGVBdXRoUmVzdWx0KGF1dGhSZXN1bHQsIHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUF1dGhSZXN1bHQoYXV0aFJlc3VsdCwgcmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgaWYgKGF1dGhSZXN1bHQgJiYgIWF1dGhSZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5vYXV0aFRva2VuID0gYXV0aFJlc3VsdC5hY2Nlc3NfdG9rZW47XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWplY3QoYXV0aFJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGRpclBpY2tlcigpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZVBpY2tlclwiKTtcclxuICAgICAgICBpZiAodGhpcy5vYXV0aFRva2VuKSB7XHJcbiAgICAgICAgICAgIGxldCB2aWV3ID0gbmV3IGdvb2dsZS5waWNrZXIuRG9jc1ZpZXcoZ29vZ2xlLnBpY2tlci5WaWV3SWQuRk9MREVSUylcclxuICAgICAgICAgICAgICAgIC5zZXRJbmNsdWRlRm9sZGVycyh0cnVlKVxyXG4gICAgICAgICAgICAgICAgLnNldFNlbGVjdEZvbGRlckVuYWJsZWQodHJ1ZSlcclxuICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tlciA9IG5ldyBnb29nbGUucGlja2VyLlBpY2tlckJ1aWxkZXIoKVxyXG4gICAgICAgICAgICAgICAgLmVuYWJsZUZlYXR1cmUoZ29vZ2xlLnBpY2tlci5GZWF0dXJlLk5BVl9ISURERU4pXHJcbiAgICAgICAgICAgICAgICAuYWRkVmlldyh2aWV3KVxyXG4gICAgICAgICAgICAgICAgLnNldEFwcElkKHRoaXMuYXBwSWQpXHJcbiAgICAgICAgICAgICAgICAuc2V0T0F1dGhUb2tlbih0aGlzLm9hdXRoVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAuc2V0RGV2ZWxvcGVyS2V5KHRoaXMuZGV2ZWxvcGVyS2V5KVxyXG4gICAgICAgICAgICAgICAgLnNldENhbGxiYWNrKHRoaXMucGlja2VyQ2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgcmVuZGVyIGEgUGlja2VyIG9iamVjdCBmb3Igc2VhcmNoaW5nIGltYWdlcy5cclxuICAgIGZpbGVQaWNrZXIoKSB7XHJcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgZ29vZ2xlLnBpY2tlci5Eb2NzVmlldyhnb29nbGUucGlja2VyLlZpZXdJZC5GT0xERVJTKVxyXG4gICAgICAgICAgICAuc2V0SW5jbHVkZUZvbGRlcnModHJ1ZSlcclxuICAgICAgICAgICAgLnNldFBhcmVudCgncm9vdCcpXHJcbiAgICAgICAgICAgIC5zZXRNaW1lVHlwZXMoXCJqc29uXCIpO1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucGlja2VyQXBpTG9hZGVkICYmIHRoaXMub2F1dGhUb2tlbikge1xyXG4gICAgICAgICAgICBsZXQgcGlja2VyID0gbmV3IGdvb2dsZS5waWNrZXIuUGlja2VyQnVpbGRlcigpXHJcbiAgICAgICAgICAgICAgICAuZW5hYmxlRmVhdHVyZShnb29nbGUucGlja2VyLkZlYXR1cmUuTkFWX0hJRERFTilcclxuICAgICAgICAgICAgICAgIC5hZGRWaWV3KHZpZXcpXHJcbiAgICAgICAgICAgICAgICAuc2V0QXBwSWQodGhpcy5hcHBJZClcclxuICAgICAgICAgICAgICAgIC5zZXRPQXV0aFRva2VuKHRoaXMub2F1dGhUb2tlbilcclxuICAgICAgICAgICAgICAgIC5zZXREZXZlbG9wZXJLZXkodGhpcy5kZXZlbG9wZXJLZXkpXHJcbiAgICAgICAgICAgICAgICAuc2V0Q2FsbGJhY2sodGhpcy5waWNrZXJDYWxsYmFjaylcclxuICAgICAgICAgICAgICAgIC8vIC5hZGRWaWV3KG5ldyBnb29nbGUucGlja2VyLkRvY3NVcGxvYWRWaWV3KCkpXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgcGlja2VyLnNldFZpc2libGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBPdmVycmlkZSB0aGlzIG1ldGhvZCBvbiB1c2UuXHJcbiAgICBwaWNrZXJDYWxsYmFjayhkYXRhKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBpY2tlcjtcclxuXHJcbiIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIC8vIFRoZSBCcm93c2VyIEFQSSBrZXkgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLlxyXG4gICAgZGV2ZWxvcGVyS2V5IDogJ0FJemFTeUFCY2RMbVQ2SEhfN0dvODJxX0lCR0kzam02VUw0dzRRMCcsXHJcblxyXG4gICAgLy8gVGhlIENsaWVudCBJRCBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBDbGllbnQgSUQuXHJcbiAgICBjbGllbnRJZCA6IFwiMTU4ODIzMTM0NjgxLTk4YmdrYW5nb2x0azYzNnVrZjhwb2ZlaXM3cGE3amJrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXHJcblxyXG4gICAgLy8gUmVwbGFjZSB3aXRoIHlvdXIgb3duIHByb2plY3QgbnVtYmVyIGZyb20gY29uc29sZS5kZXZlbG9wZXJzLmdvb2dsZS5jb20uXHJcbiAgICBhcHBJZCA6IFwiMTU4ODIzMTM0NjgxXCIsXHJcblxyXG4gICAgLy8gQXJyYXkgb2YgQVBJIGRpc2NvdmVyeSBkb2MgVVJMcyBmb3IgQVBJcyB1c2VkIGJ5IHRoZSBxdWlja3N0YXJ0XHJcbiAgICBkaXNjb3ZlcnlEb2NzIDogW1wiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvZHJpdmUvdjMvcmVzdFwiXSxcclxuXHJcbiAgICAvLyBTY29wZSB0byB1c2UgdG8gYWNjZXNzIHVzZXIncyBEcml2ZSBpdGVtcy5cclxuICAgIHNjb3BlOiBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZVwiXHJcbn0iXX0=
