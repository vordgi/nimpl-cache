import { type BaseCacheHandlerInterface, type AdapterConfiguration } from "./types";
import { RemoteCacheHandler } from "./remote-cache-handler";

export class AppAdapter {
    private buildId: AdapterConfiguration['buildId'];

    private cacheMode: AdapterConfiguration['cacheMode'];

    private cacheUrl: AdapterConfiguration['cacheUrl'];

    private cacheHandler: BaseCacheHandlerInterface;

    private remoteCacheHandler: any;

    constructor({ CacheHandler, buildId, cacheUrl, cacheMode = 'isomorphic', options, buildReady }: AdapterConfiguration) {
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
     * @param key cache key
     * @returns cached data
     */
    async get(key: string) {
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
     * @param key cache key
     * @param data data to store
     * @param ctx next.js context
     */
    async set(key: string, data: any, ctx: any) {
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
     * @param tag cache tag
     */
    async revalidateTag(tag: string) {
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
