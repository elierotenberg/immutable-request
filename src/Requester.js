import url from 'url';
import LRUCache from 'lru-cache';
import sigmund from 'sigmund';

export default (Request) => {
  const DEFAULT_BASE = '';
  const DEFAULT_MAX = 5000;
  const DEFAULT_MAX_AGE = 3600000;

  class Requester {
    constructor(base, opts = {}) {
      this._base = base || DEFAULT_BASE;
      this._cache = new LRUCache({
        max: opts.max || DEFAULT_MAX,
        maxAge: opts.maxAge || DEFAULT_MAX_AGE,
      });
    }

    reset() {
      this._cache.reset();
    }

    cancelAll(err) {
      this._cache.forEach((request) => request.isPending() ? request.cancel(err) : void 0);
    }

    _resolve(path) {
      return url.resolve(this._base, path);
    }

    GET(path, opts = {}) { // Cache GET requests as much as possible
      if(__DEV__) {
        path.should.be.a.String;
        opts.should.be.an.Object;
      }
      const key = sigmund({ path, opts });
      if(!this._cache.has(key)) {
        this._cache.set(key, Request.GET(this._resolve(path), opts)); // eslint-disable-line new-cap
      }
      return this._cache.get(key);
    }

    POST(path, body = {}, opts = {}) { // Never cache POST requests
      if(__DEV__) {
        body.should.be.an.Object;
        opts.should.be.an.Object;
      }
      return Request.POST(this._resolve(path), body, opts); // eslint-disable-line new-cap
    }
  }

  return Requester;
};
