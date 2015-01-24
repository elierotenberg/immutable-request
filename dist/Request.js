"use strict";

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
var superagent = _interopRequire(require("superagent"));

var Immutable = _interopRequire(require("immutable"));

var DEFAULT_TIMEOUT = 10000;

var ALLOWED_METHODS = ["get", "post"];
var ALLOWED_TYPES = ["immutable", "json", "object", "null"];
var DEFAULT_TYPE = "object";

function Request(method, url) {
  var body = arguments[2] === undefined ? {} : arguments[2];
  var opts = arguments[3] === undefined ? {} : arguments[3];
  if (__DEV__) {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be["true"];
    url.should.be.a.String;
    body.should.be.an.Object;
    opts.should.be.an.Object;
  }
  var timeout = opts.timeout || DEFAULT_TIMEOUT;
  var type = opts.type || DEFAULT_TYPE;
  if (__DEV__) {
    timeout.should.be.an.Number;
    type.should.be.a.String;
    _.contains(ALLOWED_TYPES, type).should.be["true"];
  }

  var req = method === "get" ? superagent.get(url).accept("application/json") : superagent.post(url).type("json").send(body);
  return new Promise(function (resolve, reject) {
    return req.end(function (err, res) {
      if (err) {
        return reject(err);
      }
      if (res.error) {
        return reject(res.error);
      }
      if (type === "immutable") {
        return resolve(Immutable.Map(res.body));
      }
      if (type === "json") {
        return resolve(res.text);
      }
      if (type === "object") {
        return resolve(res.body);
      }
      if (type === "null") {
        return resolve(null);
      }
      throw new Error("Unknown type: " + type);
    });
  }).cancellable().timeout(timeout)["catch"](Promise.TimeoutError, Promise.CancellationError, function (err) {
    req.abort();
    throw err;
  });
}

Object.assign(Request, {
  GET: function GET(url) {
    var opts = arguments[1] === undefined ? {} : arguments[1];
    return new Request("get", url, {}, opts);
  },

  POST: function POST(url) {
    var body = arguments[1] === undefined ? {} : arguments[1];
    var opts = arguments[2] === undefined ? {} : arguments[2];
    return new Request("post", url, body, opts);
  } });

module.exports = Request;