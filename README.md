# next-impl-cache

Repository for implementing caching solutions in next.js

## Advantages

- Shared cache between different instances (replicas, copies) of the application.
- Three caching options: local, remote and isomorphic.
- Same cacheHandler on the client and on the created server.
- Caching without server restart.
- Clearing of outdated cache.

[Read more about next-impl-cache-adapter](https://github.com/vordgi/next-impl-cache/tree/main/packages/next-impl-cache-adapter).

## Cache handlers

next-impl-cache-in-memory — base cacheHandler, which cache data in-memory. [Read more](https://github.com/vordgi/next-impl-cache/tree/main/packages/next-impl-cache-in-memory)

## Examples

Base example with next-impl-cache-in-memory. [See example](https://github.com/vordgi/next-impl-cache/tree/main/example).

## See also

[next-impl-getters](https://github.com/vordgi/next-impl-getters) — implementation of server getters and server contexts in React Server Components without switching to SSR.

[next-impl-config](https://github.com/vordgi/next-impl-config) — opportunity to add settings for each possible environment (build, server, client and edge).

[next-classnames-minifier](https://github.com/vordgi/next-classnames-minifier) — configure class compression to symbols (.a, .b, …, .a1).

[next-translation](https://github.com/vordgi/next-translation) — i18n library designed primarily with server components in mind and maximum optimization (due to the transfer of logic to the assembly stage and/or server side).

## License

[MIT](https://github.com/vordgi/next-impl-cache/blob/main/LICENSE)
