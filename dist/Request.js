'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

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

var DEFAULT_TIMEOUT = 10000;

var ALLOWED_METHODS = ['get', 'post'];
var ALLOWED_TYPES = ['immutable', 'json', 'object', 'null'];
var DEFAULT_TYPE = 'object';

function Request(method, url) {
  var body = arguments[2] === undefined ? {} : arguments[2];
  var opts = arguments[3] === undefined ? {} : arguments[3];

  if (__DEV__) {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be['true'];
    url.should.be.a.String;
    body.should.be.an.Object;
    opts.should.be.an.Object;
  }
  var timeout = opts.timeout || DEFAULT_TIMEOUT;
  var type = opts.type || DEFAULT_TYPE;
  if (__DEV__) {
    timeout.should.be.an.Number;
    type.should.be.a.String;
    _.contains(ALLOWED_TYPES, type).should.be['true'];
  }

  var req = method === 'get' ? _superagent2['default'].get(url).accept('application/json') : _superagent2['default'].post(url).type('json').send(body);
  return new Promise(function (resolve, reject) {
    return req.end(function (err, res) {
      if (err) {
        return reject(err);
      }
      if (res.error) {
        return reject(res.error);
      }
      if (type === 'immutable') {
        return resolve(_immutable2['default'].Map(res.body)); // eslint-disable-line new-cap
      }
      if (type === 'json') {
        return resolve(res.text);
      }
      if (type === 'object') {
        return resolve(res.body);
      }
      if (type === 'null') {
        return resolve(null);
      }
      throw new Error('Unknown type: ' + type);
    });
  }).cancellable().timeout(timeout)['catch'](Promise.TimeoutError, Promise.CancellationError, function (err) {
    req.abort();
    throw err;
  });
}

_Object$assign(Request, {
  GET: function GET(url) {
    var opts = arguments[1] === undefined ? {} : arguments[1];

    return new Request('get', url, {}, opts);
  },

  POST: function POST(url) {
    var body = arguments[1] === undefined ? {} : arguments[1];
    var opts = arguments[2] === undefined ? {} : arguments[2];

    return new Request('post', url, body, opts);
  } });

exports['default'] = Request;
module.exports = exports['default'];