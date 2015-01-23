"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

require("6to5/polyfill");
var _ = require("lodash");
var should = require("should");
var Promise = (global || window).Promise = require("bluebird");
var __DEV__ = process.env.NODE_ENV !== "production";
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === "object";
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}
var resolve = require("url").resolve;
var LRUCache = _interopRequire(require("lru-cache"));

var sigmund = _interopRequire(require("sigmund"));

module.exports = function (Request) {
  var DEFAULT_BASE = "";
  var DEFAULT_MAX = 5000;
  var DEFAULT_MAX_AGE = 3600000;

  var Requester = (function () {
    function Requester(base) {
      var opts = arguments[1] === undefined ? {} : arguments[1];
      this._base = base || DEFAULT_BASE;
      this._cache = new LRUCache({
        max: opts.max || DEFAULT_MAX,
        maxAge: opts.maxAge || DEFAULT_MAX_AGE });
    }

    _prototypeProperties(Requester, null, {
      reset: {
        value: function reset() {
          this._cache.reset();
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      cancelAll: {
        value: function cancelAll(err) {
          this._cache.forEach(function (request) {
            return request.isPending() ? request.cancel(err) : void 0;
          });
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      _resolve: {
        value: function Resolve(path) {
          return resolve(this._base, path);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      GET: {
        value: function GET(path) {
          var opts = arguments[1] === undefined ? {} : arguments[1];
          // Cache GET requests as much as possible
          if (__DEV__) {
            path.should.be.a.String;
            opts.should.be.an.Object;
          }
          var key = sigmund({ path: path, opts: opts });
          if (!this._cache.has(key)) {
            this._cache.set(key, Request.GET(this._resolve(path), opts));
          }
          return this._cache.get(key);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      POST: {
        value: function POST(path) {
          var body = arguments[1] === undefined ? {} : arguments[1];
          var opts = arguments[2] === undefined ? {} : arguments[2];
          // Never cache POST requests
          if (__DEV__) {
            body.should.be.an.Object;
            opts.should.be.an.Object;
          }
          return Request.POST(this._resolve(path), body, opts);
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return Requester;
  })();

  return Requester;
};