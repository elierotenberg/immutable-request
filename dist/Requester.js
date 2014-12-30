"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = process.env.NODE_ENV !== "production";var __PROD__ = !__DEV__;var __BROWSER__ = typeof window === "object";var __NODE__ = !__BROWSER__;var _ = require("lodash-next");
var _ref = require("url");

var resolve = _ref.resolve;
var LRUCache = require("lru-cache");
var sigmund = require("sigmund");

module.exports = function (Request) {
  var DEFAULT_BASE = "";
  var DEFAULT_MAX = 5000;
  var DEFAULT_MAX_AGE = 3600000;

  var Requester = function Requester(base, options) {
    options = options || {};
    this._base = base || DEFAULT_BASE;
    var max = options.max || DEFAULT_MAX;
    var maxAge = options.maxAge || DEFAULT_MAX_AGE;
    this._cache = LRUCache({ max: max, maxAge: maxAge });
  };

  Requester.prototype.reset = function () {
    this._cache.reset();
  };

  Requester.prototype.cancelAll = function (err) {
    this._cache.forEach(function (request) {
      return request.isPending() ? request.cancel(err) : void 0;
    });
  };

  Requester.prototype._resolve = function (path) {
    return resolve(this._base, path);
  };

  Requester.prototype.GET = function (path, opts) {
    // Cache GET requests as much as possible
    opts = opts || {};
    _.dev(function () {
      path.shoud.be.a.String;
      opts.should.be.an.Object;
    });
    var key = sigmund({ path: path, opts: opts });
    if (!this._cache.has(key)) {
      this._cache.set(key, Request.GET(this._resolve(path), opts));
    }
    return this._cache.get(key);
  };

  Requester.prototype.POST = function (path, body, opts) {
    // Never cache POST requests
    body = body || null;
    opts = opts || {};
    _.dev(function () {
      path.should.be.a.String;
      opts.should.be.an.Object;
    });
    return Request.POST(this._resolve(path), body, opts);
  };

  _.extend(Requester.prototype, {
    _base: null,
    _cache: null });

  return Requester;
};