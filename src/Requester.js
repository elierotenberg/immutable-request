const _ = require('lodash-next');
const { resolve } = require('url');
const LRUCache = require('lru-cache');
const sigmund = require('sigmund');

module.exports = function(Request) {
  const DEFAULT_BASE = '';
  const DEFAULT_MAX = 5000;
  const DEFAULT_MAX_AGE = 3600000;

  class Requester {
    constructor(base, options) {
      options = options || {};
      this._base = base || DEFAULT_BASE;
      const max = options.max || DEFAULT_MAX;
      const maxAge = options.maxAge || DEFAULT_MAX_AGE;
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

    GET(path, opts) { // Cache GET requests as much as possible
      opts = opts || {};
      _.dev(() => {
        path.shoud.be.a.String;
        opts.should.be.an.Object;
      });
      const key = sigmund({ path, opts });
      if(!this._cache.has(key)) {
        this._cache.set(key, Request.GET(this._resolve(path), opts));
      }
      return this._cache.get(key);
    }

    POST(path, body, opts) { // Never cache POST requests
      body = body || null;
      opts = opts || {};
      _.dev(() => {
        path.should.be.a.String;
        opts.should.be.an.Object;
      });
      return Request.POST(this._resolve(path), body, opts);
    }
  }

  _.extend(Requester.prototype, {
    _base: null,
    _cache: null,
  });

  return Requester;
};
