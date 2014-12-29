"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = process.env.NODE_ENV !== "production";var __PROD__ = !__DEV__;var __BROWSER__ = typeof window === "object";var __NODE__ = !__BROWSER__;var _ = require("lodash-next");
var superagent = require("superagent");
var Immutable = require("immutable");

var DEFAULT_TIMEOUT = 10000;

var ALLOWED_METHODS = ["get", "post"];

function Request(method, url, body, timeout) {
  if (body === undefined) body = null;
  if (timeout === undefined) timeout = DEFAULT_TIMEOUT;
  return (function () {
    _.dev(function () {
      method.should.be.a.String;
      _.contains(ALLOWED_METHODS, method).should.be.ok;
      timeout.should.be.a.Number;
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
        return resolve(Immutable.Map(res.body));
      });
    }).cancellable().timeout(timeout)["catch"](Promise.TimeoutError, Promise.CancellationError, function (err) {
      req.abort();
      throw err;
    });
  })();
}

_.extend(Request, {
  GET: function (url, timeout) {
    if (timeout === undefined) timeout = DEFAULT_TIMEOUT;
    return (function () {
      return new Request("get", url, null, timeout).promise;
    })();
  },

  POST: function (url, body, timeout) {
    if (timeout === undefined) timeout = DEFAULT_TIMEOUT;
    return (function () {
      return new Request("post", url, body, timeout).promise;
    })();
  } });

module.exports = Request;