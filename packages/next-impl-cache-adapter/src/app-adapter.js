const RemoteCacheHandler = require("./remote-cache-handler");

/**
 * @typedef Configuration
 * @property {any} CacheHandler custom cache-handler
 * @property {string} buildId unique build id
 * @property {string} cacheUrl server cache url
 * @property {'local' | 'remote' | 'isomorphic'=} [cacheMode='isomorphic'] cache mode
 * @property {any} options options
 * @property {boolean=} [buildReady=false] mark current build as main and remove cache for all previous
 */

module.exports = class AppAdapter {
    /** @type {string=} unique build id  */
    buildId;

    /** @type {'local' | 'remote' | 'isomorphic'} caching mode */
    cacheMode;

    /** @type {string} cache url */
    cacheUrl;

    /** @type {any} */
    cacheHandler;

    /** @type {RemoteCacheHandler} */
    remoteCacheHandler;

    /**
     * app adapter
     * @param {Configuration} configuration 
     */
    constructor({ CacheHandler, buildId, cacheUrl, cacheMode = 'isomorphic', options, buildReady }) {
        if (!CacheHandler || !cacheUrl || !buildId) {
            throw new Error('Invalid configuration');
        }
        this.buildId = buildId;
        this.cacheUrl = cacheUrl;
        this.cacheMode = cacheMode;
        this.cacheHandler = new CacheHandler(options);
        this.remoteCacheHandler = new RemoteCacheHandler(options, this.cacheUrl, this.buildId);

        if (buildReady) {
            this.remoteCacheHandler.deleteOld();
        }
    }

    /**
     * get cache
     * @param {string} key cache key
     * @returns {Promise<any>} cached data
     */
    async get(key) {
        if (this.cacheMode === 'remote') {
            const data = await this.remoteCacheHandler.get(key);
            return data;
        } else {
            const data = await this.cacheHandler.get(key);
            return data;
        }
    }

    /**
     * set cache
     * @param {string} key cache key
     * @param {string} data data to store
     * @param {any} ctx next.js context
     */
    async set(key, data, ctx) {
        if (this.cacheMode === 'remote') {
            const savedData = await this.remoteCacheHandler.set(key, data, ctx);
            return savedData;
        } else if (this.cacheMode === 'isomorphic') {
            const savedData = await this.cacheHandler.set(key, data, ctx);
            await this.remoteCacheHandler.set(key, data, ctx);
            return savedData;
        } else {
            const savedData = await this.cacheHandler.set(key, data, ctx);
            return savedData;
        }
    }

    /**
     * revalidate tag in cache
     * @param {string} tag cache tag
     */
    async revalidateTag(tag) {
        if (this.cacheMode === 'remote') {
            await this.remoteCacheHandler.revalidateTag(tag);
        } else if (this.cacheMode === 'isomorphic') {
            await this.remoteCacheHandler.revalidateTag(tag);
            await this.cacheHandler.revalidateTag(tag);
        } else {
            await this.cacheHandler.revalidateTag(tag);
        }
    }
}
