# next-impl-cache-in-memory

Base cacheHandler for next.js, which cache data in-memory

## Installation

**Using npm:**
```bash
npm i next-impl-cache-in-memory
```

**Using yarn:**
```bash
yarn add next-impl-cache-in-memory
```

## Usage

You can use cacheHandler by specifying the path to it in the application configuration:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheMaxMemorySize: 0,
    cacheHandler: require.resolve('next-impl-cache-in-memory'),
};
```

However, it is recommended to use it together with [next-impl-cache-adapter](https://github.com/vordgi/next-impl-cache/tree/main/packages/next-impl-cache-adapter). The package will allow you to expand the capabilities of cacheHandler and also reuse the cache between different application instances. More details

## Examples

Base example with next-impl-cache-in-memory. [See example](https://github.com/vordgi/next-impl-cache/tree/main/example).

## License

[MIT](https://github.com/vordgi/next-impl-cache/blob/main/LICENSE)
