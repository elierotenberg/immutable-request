const _ = require('lodash-next');
const superagent = require('superagent');
const Immutable = require('immutable');

const DEFAULT_TIMEOUT = 10000;

const ALLOWED_METHODS = ['get', 'post'];

function Request(method, url, body = null, timeout = DEFAULT_TIMEOUT) {
  _.dev(() => {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be.ok;
    timeout.should.be.a.Number;
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
    return resolve(Immutable.Map(res.body));
  }))
  .cancellable()
  .timeout(timeout)
  .catch(Promise.TimeoutError, Promise.CancellationError, (err) => {
    req.abort();
    throw err;
  });
}

_.extend(Request, {
  GET(url, timeout = DEFAULT_TIMEOUT) {
    return new Request('get', url, null, timeout).promise;
  },

  POST(url, body, timeout = DEFAULT_TIMEOUT) {
    return new Request('post', url, body, timeout).promise;
  },
});

module.exports = Request;
