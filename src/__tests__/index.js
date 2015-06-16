import Request, { Requester } from '../';
import should from 'should';
const { describe, it } = global;

const host = 'https://api.github.com';
const path = '/users/elierotenberg';

describe('Request', () => {
  it('.GET as immutable', function test() {
    this.timeout(5000);
    return Request.GET(`${host}${path}`, { type: 'immutable' }) // eslint-disable-line new-cap
      .then((map) =>
        should(map.get('id')).be.exactly(4177867)
      );
  });
});

describe('Requester', () => {
  const requester = new Requester(host, { type: 'object' });
  it('.GET as object', function test() {
    this.timeout(5000);
    return requester.GET(path) // eslint-disable-line new-cap
      .then((map) =>
        should(map.id).be.exactly(4177867)
      );
  });
});
