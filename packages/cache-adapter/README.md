# next-impl-cache-adapter

An adapter that allows you to use any cache handler on the client and server side and switch between them. Adds support for running next.js applications in multiple instances.

## Installation

**Using npm:**
```bash
npm i next-impl-cache-adapter
```

**Using yarn:**
```bash
yarn add next-impl-cache-adapter
```

## How it works

For a common cache between instances (replicas, copies) - the cache should be separate from each application instance. This solution does it by creating a separate service.

The application can then work with the cache through this remote server. The server acts as a cacheHandler and can be used from the running application and/or from the build mode.

The server does not need to be restarted each time. And outdated data will be deleted automatically when launching a new version of the application.

## Usage

The server is launched, to which the required cacheHandler is passed:

```js
// @ts-check

const createServer = require('next-impl-cache-adapter/src/create-server');
const CacheHandler = require('next-impl-cache-in-memory');

const server = createServer(new CacheHandler({}));

server.listen('4000', () => {
    console.log('Server is running at http://localhost:4000');
});
```

A special adapter is set up to work with the cache:

```js
// cache-handler.js
// @ts-check
const AppAdapter = require('next-impl-cache-adapter');
const CacheHandler = require('next-impl-cache-in-memory');

class CustomCacheHandler extends AppAdapter {
    /** @param {any} options */
    constructor(options) {
        super({
            CacheHandler,
            buildId: process.env.BUILD_ID || 'base_id',
            cacheUrl: 'http://localhost:4000',
            cacheMode: 'remote',
            options,
        })
    }
}

module.exports = CustomCacheHandler;
```

The created cache-handler is connected in the next.js configuration:

```js
// next.config.js

module.exports = {
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // disable default in-memory caching
}
```

That's it. Now the cache is configured.

## Configuration

### CacheHandler

CacheHandler, which will be responsible for the logic of caching.

### buildId

A unique id of the current build. It should be same between instances. When launching an application with a new id, the cache for old ids will be deleted.

### cacheUrl

A url where the remote cache is running.

### cacheMode

The package supports three caching modes: `local`, `remote` and `isomorphic`.

**local**

A standard solution, the cache is processed next to the application. Convenient to use in development mode and on stages where the application is run in a single instance.

**remote**

All cache will be written and read on a remote server, launched earlier. Convenient to use for applications running in multiple replicas.

**isomorphic**

The cache operates next to the application, but additionally stores data on a remote server. Convenient to use during the build, to prepare the cache by the time the application instances are launched, but without spending resources on loading the cache from a remote server.

### options

Options passed to `cacheHandler` from next.js. They just need to be passed from the argument.

## Examples

Base example with [next-impl-cache-in-memory](https://github.com/vordgi/next-impl-cache/tree/main/packages/next-impl-cache-in-memory). [See example](https://github.com/vordgi/next-impl-cache/tree/main/example).

## License

[MIT](https://github.com/vordgi/next-impl-cache/blob/main/LICENSE)
