module.exports = class RemoteCacheHandler {
    /** @type {string} next.js options */
    options;

    /** @type {URL} server url */
    url;

    /**
     * remote cache handler
     * @param {RemoteCacheHandler['options']} options next.js options
     * @param {string} url server url
     * @param {string} buildId unique build id
     */
    constructor(options, url, buildId) {
        // should we transfer options?
        this.options = options
        const serverUrl = new URL(url);
        serverUrl.searchParams.set('buildId', buildId);
        this.url = serverUrl
    }

    /**
     * get cache
     * @param {string} key cache key
     * @returns {Promise<any>} cached data
     */
    async get(key) {
        const url = new URL(this.url);
        url.searchParams.set('key', key);
        const resp = await fetch(url.toString());

        if (resp.status !== 200) return;

        return resp.json();
    }

    /**
     * set cache
     * @param {string} key cache key
     * @param {any} data data to store
     * @param {any} ctx next.js context
     */
    async set(key, data, ctx) {
        const url = new URL(this.url);
        url.searchParams.set('key', key);
        await fetch(url.toString(), {
            method: 'POST',
            body: JSON.stringify({
                data,
                ctx,
            })
        });
    }

    /**
     * revalidate tag in cache
     * @param {string} tag cache tag
     */
    async revalidateTag(tag) {
        const url = new URL(this.url);
        url.searchParams.set('key', tag);
        await fetch(url.toString(), {
            method: 'DELETE',
        });
    }

    /**
     * revalidate tag in cache
     */
    async deleteOld() {
        const url = new URL(this.url);
        await fetch(url.toString(), {
            method: 'PUT',
        });
    }
}
