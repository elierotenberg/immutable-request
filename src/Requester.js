const _ = require('lodash-next');
const { resolve } = require('url');
const LRUCache = require('lru-cache');

module.exports = function(Request) {
  const DEFAULT_BASE = '';
  const DEFAULT_MAX = 5000;
  const DEFAULT_MAX_AGE = 3600000;
  const DEFAULT_TIMEOUT = 10000;

  class Requester {
    constructor(base, options) {
      options = options || {};
      this._base = base || DEFAULT_BASE;
      const max = options.max || DEFAULT_MAX;
      const maxAge = options.maxAge || DEFAULT_MAX_AGE;
      this._timeout = options.timeout || DEFAULT_TIMEOUT;
      this._cache = LRUCache({ max, maxAge });
    }

    reset() {
      this._cache.reset();
    }

    cancelAll(err) {
      this._cache.forEach((request) => request.isPending() ? request.cancel(err) : void 0);
    }

    _resolve(path) {
      return resolve(this._base, path);
    }

    GET(path, timeout = null) { // Cache GET requests as much as possible
      if(!this._cache.has(path)) {
        this._cache.set(path, Request.GET(this._resolve(path), timeout || this._timeout));
      }
      return this._cache.get(path);
    }

    POST(path, body = null, timeout = null) { // Never cache POST requests
      body = body || {};
      return Request.POST(this._resolve(path), body, timeout);
    }
  }

  _.extend(Requester.prototype, {
    _base: null,
    _timeout: null,
    _cache: null,
  });

  return Requester;
};
