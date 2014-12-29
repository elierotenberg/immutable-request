Immutable Request
=================

Combines `superagent`, `bluebird`, `immutable` and `lru-cache` for sane isomorphic HTTP POST/GET abstraction.

### Example

```js
// Simply use the static factory
Request.GET('http://localhost:8888/todoList')
.then((immutableMap) => {
  // do something with immutableMap
})
.catch((err) => /* handle error */);

// send a POST request
const post = Request.POST('http://localhost:8888/shuffleTodoList', { seed: 1337 });
// nevermind, abort it
post.cancel(new Error('because reasons'));

// leverage automatic, clever userland caching
const requester = new Request.Requester('http://localhost:8888', {
  max: 100, // cache no more than 100 HTTP requests
  maxAge: 60000, // cache expires after 60s
  timeout: 10000, // request timeout after 10000
});

requester.GET('/todoList')
.then((immutableMap) => {
  // do something with immutableMap
});
// cache is done by full path, so querystring can be used to force recaching
requester.GET('/todoList?try=2')
.then((immutableMap2) {
  // do something with immutableMap2
});
// POST requests are not cached, the request is sent twice
requester.POST('/shuffleTodoList', { seed: 42 });
requester.POST('/shuffleTodoList', { seed: 42 });
// cancel all pending requests
requester.cancelAll();
// clear the cache and destroy references
requester.reset();
```
