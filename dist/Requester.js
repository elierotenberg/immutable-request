'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _resolve = require('url');

var _LRUCache = require('lru-cache');

var _LRUCache2 = _interopRequireDefault(_LRUCache);

var _sigmund = require('sigmund');

var _sigmund2 = _interopRequireDefault(_sigmund);

require('babel/polyfill');
var _ = require('lodash');
var should = require('should');
var Promise = (global || window).Promise = require('bluebird');
var __DEV__ = process.env.NODE_ENV !== 'production';
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === 'object';
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}

exports['default'] = function (Request) {
  var DEFAULT_BASE = '';
  var DEFAULT_MAX = 5000;
  var DEFAULT_MAX_AGE = 3600000;

  var Requester = (function () {
    function Requester(base) {
      var opts = arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Requester);

      this._base = base || DEFAULT_BASE;
      this._cache = new _LRUCache2['default']({
        max: opts.max || DEFAULT_MAX,
        maxAge: opts.maxAge || DEFAULT_MAX_AGE });
    }

    _createClass(Requester, [{
      key: 'reset',
      value: function reset() {
        this._cache.reset();
      }
    }, {
      key: 'cancelAll',
      value: function cancelAll(err) {
        this._cache.forEach(function (request) {
          return request.isPending() ? request.cancel(err) : void 0;
        });
      }
    }, {
      key: '_resolve',
      value: function _resolve(path) {
        return _resolve.resolve(this._base, path);
      }
    }, {
      key: 'GET',
      value: function GET(path) {
        var opts = arguments[1] === undefined ? {} : arguments[1];
        // Cache GET requests as much as possible
        if (__DEV__) {
          path.should.be.a.String;
          opts.should.be.an.Object;
        }
        var key = _sigmund2['default']({ path: path, opts: opts });
        if (!this._cache.has(key)) {
          this._cache.set(key, Request.GET(this._resolve(path), opts)); // eslint-disable-line new-cap
        }
        return this._cache.get(key);
      }
    }, {
      key: 'POST',
      value: function POST(path) {
        var body = arguments[1] === undefined ? {} : arguments[1];
        var opts = arguments[2] === undefined ? {} : arguments[2];
        // Never cache POST requests
        if (__DEV__) {
          body.should.be.an.Object;
          opts.should.be.an.Object;
        }
        return Request.POST(this._resolve(path), body, opts); // eslint-disable-line new-cap
      }
    }]);

    return Requester;
  })();

  return Requester;
};

module.exports = exports['default'];