"use strict";

require("6to5/polyfill");var Promise = (global || window).Promise = require("lodash-next").Promise;var __DEV__ = process.env.NODE_ENV !== "production";var __PROD__ = !__DEV__;var __BROWSER__ = typeof window === "object";var __NODE__ = !__BROWSER__;var _ = require("lodash-next");
var _ref = require("url");

var resolve = _ref.resolve;
var LRUCache = require("lru-cache");

module.exports = function (Request) {
  var DEFAULT_BASE = "";
  var DEFAULT_MAX = 5000;
  var DEFAULT_MAX_AGE = 3600000;
  var DEFAULT_TIMEOUT = 10000;

  var Requester = function Requester(base, options) {
    options = options || {};
    this._base = base || DEFAULT_BASE;
    var max = options.max || DEFAULT_MAX;
    var maxAge = options.maxAge || DEFAULT_MAX_AGE;
    this._timeout = options.timeout || DEFAULT_TIMEOUT;
    this._cache = LRUCache({ max: max, maxAge: maxAge });
  };

  Requester.prototype.reset = function () {
    this._cache.reset();
  };

  Requester.prototype._resolve = function (path) {
    return resolve(this._base, path);
  };

  Requester.prototype.GET = function (path, timeout) {
    if (timeout === undefined) timeout = null;
    // Cache GET requests as much as possible
    if (!this._cache.has(path)) {
      this._cache.set(path, Request.GET(this._resolve(path), timeout || this._timeout));
    }
    return this._cache.get(path);
  };

  Requester.prototype.POST = function (path, body, timeout) {
    if (body === undefined) body = null;
    if (timeout === undefined) timeout = null;
    // Never cache POST requests
    body = body || {};
    return Request.POST(this._resolve(path), body, timeout);
  };

  _.extend(Requester.prototype, {
    _base: null,
    _timeout: null,
    _cache: null });

  return Requester;
};