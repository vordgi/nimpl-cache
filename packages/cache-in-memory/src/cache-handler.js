/** @type {Map<string, { tags: string[], value: any, lastModified: number }>} */
const cache = new Map();

module.exports = class CacheHandler {
    /**
     * @type any
     * options passed from next.js
     */
    options;

    /**
     * @param {any} options passed from next.js
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * get cache
     * @param {string} key cache key
     * @returns {Promise<any>} cached data
     */
    async get(key) {
        return cache.get(key);
    }

    /**
     * set cache
     * @param {string} key cache key
     * @param {any} data data to store
     * @param {any} ctx next.js context
     */
    async set(key, data, ctx) {
        if (data.kind === 'PAGE') {
            /** @type {string[]} */
            const tags = data.headers['x-next-cache-tags'].split(',');
            if (!ctx.tags) {
                ctx.tags = tags;
            } else {
                tags.forEach(tag => {
                    if (!ctx.tags.includes(tag)) ctx.tags.push(tag);
                })
            }
        }
        cache.set(key, {
            value: data,
            lastModified: Date.now(),
            tags: ctx.tags,
        })
    }

    /**
     * revalidate tag in cache
     * @param {string} tag cache tag
     */
    async revalidateTag(tag) {
        cache.forEach((value, key) => {
            if (value.tags?.includes(tag)) {
                cache.delete(key);
            }
        })
    }

    /**
     * get cache
     * @returns {Promise<string[]>} cache keys
     */
    async keys() {
        /** @type {string[]} */
        const list = [];
        cache.forEach((_, key) => {
            list.push(key);
        })

        return list;
    }

    /**
     * set cache key
     * @param {string} key cache key
     */
    async delete(key) {
        cache.delete(key);
    }
}
