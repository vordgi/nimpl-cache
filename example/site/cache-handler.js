// @ts-check
const AppAdapter = require('next-impl-cache-adapter/src/app-adapter');
const CacheHandler = require('next-impl-cache-in-memory/src/cache-handler');

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
