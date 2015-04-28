import superagent from 'superagent';
import Immutable from 'immutable';

const DEFAULT_TIMEOUT = 10000;

const ALLOWED_METHODS = ['get', 'post'];
const ALLOWED_TYPES = ['immutable', 'json', 'object', 'null'];
const DEFAULT_TYPE = 'object';

function Request(method, url, body = {}, opts = {}) {
  if(__DEV__) {
    method.should.be.a.String;
    _.contains(ALLOWED_METHODS, method).should.be.true;
    url.should.be.a.String;
    body.should.be.an.Object;
    opts.should.be.an.Object;
  }
  const timeout = opts.timeout || DEFAULT_TIMEOUT;
  const type = opts.type || DEFAULT_TYPE;
  if(__DEV__) {
    timeout.should.be.an.Number;
    type.should.be.a.String;
    _.contains(ALLOWED_TYPES, type).should.be.true;
  }

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
      return resolve(Immutable.Map(res.body)); // eslint-disable-line new-cap
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

Object.assign(Request, {
  GET(url, opts = {}) {
    return new Request('get', url, {}, opts);
  },

  POST(url, body = {}, opts = {}) {
    return new Request('post', url, body, opts);
  },
});

export default Request;
