import { type BaseCacheHandlerInterface } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const cache = new Map<string, { tags: string[]; value: any; lastModified: number }>();

export default class CacheHandler implements BaseCacheHandlerInterface {
    /** options passed from next.js */
    options: any;

    /**
     * @param options options passed from next.js
     */
    constructor(options: any) {
        this.options = options;
    }

    /**
     * get cache
     * @param key cache key
     * @returns cached data
     */
    async get(key: string) {
        return cache.get(key);
    }

    /**
     * set cache
     * @param key cache key
     * @param data data to store
     * @param ctx next.js context
     */
    async set(key: string, data: any, ctx: any) {
        if (data.kind === "PAGE") {
            const tags: string[] = data.headers["x-next-cache-tags"].split(",");
            if (!ctx.tags) {
                ctx.tags = tags;
            } else {
                tags.forEach((tag) => {
                    if (!ctx.tags.includes(tag)) ctx.tags.push(tag);
                });
            }
        }
        cache.set(key, {
            value: data,
            lastModified: Date.now(),
            tags: ctx.tags,
        });
    }

    /**
     * revalidate tag in cache
     * @param tag cache tag
     */
    async revalidateTag(tag: string) {
        cache.forEach((value, key) => {
            if (value.tags?.includes(tag)) {
                cache.delete(key);
            }
        });
    }

    /**
     * get cached keys
     * @returns cache keys
     */
    async keys() {
        const list: string[] = [];
        cache.forEach((_, key) => {
            list.push(key);
        });

        return list;
    }

    /**
     * delete cache for key
     * @param key cache key
     */
    async delete(key: string) {
        cache.delete(key);
    }
}
