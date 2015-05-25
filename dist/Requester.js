'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _sigmund = require('sigmund');

var _sigmund2 = _interopRequireDefault(_sigmund);

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
      this._cache = new _lruCache2['default']({
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
        return _url2['default'].resolve(this._base, path);
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
        var key = (0, _sigmund2['default'])({ path: path, opts: opts });
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