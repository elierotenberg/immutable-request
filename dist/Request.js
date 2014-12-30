"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = process.env.NODE_ENV !== "production";var __PROD__ = !__DEV__;var __BROWSER__ = typeof window === "object";var __NODE__ = !__BROWSER__;var _ = require("lodash-next");
var superagent = require("superagent");
var Immutable = require("immutable");

var DEFAULT_TIMEOUT = 10000;

var ALLOWED_METHODS = ["get", "post"];
var ALLOWED_TYPES = ["immutable", "json", "object", "null"];
var DEFAULT_TYPE = "immutable";

function Request(method, url, body, _ref) {
  var timeout = _ref.timeout;
  var type = _ref.type;
  body = body || null;
  timeout = timeout || DEFAULT_TIMEOUT;
  type = type || DEFAULT_TYPE;
  _.dev(function () {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be.ok;
    url.should.be.a.String;
    (body === null || _.isObject(body)).should.be.ok;
    timeout.should.be.a.Number;
    type.should.be.a.String;
    _.contains(ALLOWED_TYPES, type).should.be.ok;
  });
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

_.extend(Request, {
  GET: function (url, opts) {
    opts = opts || {};
    return new Request("get", url, null, opts);
  },

  POST: function (url, body, opts) {
    opts = opts || {};
    return new Request("post", url, body, opts);
  } });

module.exports = Request;