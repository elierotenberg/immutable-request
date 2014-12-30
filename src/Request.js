const _ = require('lodash-next');
const superagent = require('superagent');
const Immutable = require('immutable');

const DEFAULT_TIMEOUT = 10000;

const ALLOWED_METHODS = ['get', 'post'];
const ALLOWED_TYPES = ['immutable', 'json', 'object', 'null'];
const DEFAULT_TYPE = 'immutable';

function Request(method, url, body, { timeout, type }) {
  body = body || null;
  timeout = timeout || DEFAULT_TIMEOUT;
  type = type || DEFAULT_TYPE;
  _.dev(() => {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be.ok;
    url.should.be.a.String;
    (body === null || _.isObject(body)).should.be.ok;
    timeout.should.be.a.Number;
    type.should.be.a.String;
    _.contains(ALLOWED_TYPES, type).should.be.ok;
  });
  const req = (method === 'get' ?
    superagent.get(url).accept('application/json') :
    superagent.post(url).type('json').send(body)
  );
  return new Promise((resolve, reject) => req.end((err, res) => {
    if(err) {
      return reject(err);
    }
    if(res.error) {
      return reject(res.error);
    }
    if(type === 'immutable') {
      return resolve(Immutable.Map(res.body));
    }
    if(type === 'json') {
      return resolve(res.text);
    }
    if(type === 'object') {
      return resolve(res.body);
    }
    if(type === 'null') {
      return resolve(null);
    }
    throw new Error(`Unknown type: ${type}`);
  }))
  .cancellable()
  .timeout(timeout)
  .catch(Promise.TimeoutError, Promise.CancellationError, (err) => {
    req.abort();
    throw err;
  });
}

_.extend(Request, {
  GET(url, opts) {
    opts = opts || {};
    return new Request('get', url, null, opts);
  },

  POST(url, body, opts) {
    opts = opts || {};
    return new Request('post', url, body, opts);
  },
});

module.exports = Request;
