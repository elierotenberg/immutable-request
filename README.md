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
.catch((err) => {
  // handle error
});

// send a POST request with { seed: 1337 } as its form body
const post = Request.POST('http://localhost:8888/shuffleTodoList', { seed: 1337 }, { timeout: 10000 });
// nevermind, abort it
post.cancel(new Error('because reasons'));

// you can specify timeout (in ms) and
// return type ('immutable', 'json', 'object' or 'null')
Request.GET('http://localhost:8888/todoList', { timeout: 10000, type: 'json' })
.then((json) => {
  // do something with json
});

// leverage automatic, clever userland caching
const requester = new Request.Requester('http://localhost:8888', {
  max: 100, // cache no more than 100 HTTP requests
  maxAge: 60000, // cache expires after 60s
  timeout: 10000, // request timeout after 10000
});

requester.GET('/todoList')
.then((immutableMap) => {
  // do something with immutableMap
  // you can access the raw json with immutableMap.json
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

### Usage

This module is written in ES6/7. You will need `babel` to use it.
