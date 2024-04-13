export class RemoteCacheHandler {
    /** next.js options */
    options: any;

    /** server url */
    url: URL;

    /**
     * remote cache handler
     * @param options next.js options
     * @param url server url
     * @param unique build id
     */
    constructor(options: RemoteCacheHandler['options'], url: string, buildId: string) {
        // should we transfer options?
        this.options = options
        const serverUrl = new URL(url);
        serverUrl.searchParams.set('buildId', buildId);
        this.url = serverUrl
    }

    /**
     * get cache
     * @param key cache key
     * @returns cached data
     */
    async get(key: string) {
        const url = new URL(this.url);
        url.searchParams.set('key', key);
        const resp = await fetch(url.toString());

        if (resp.status !== 200) return;

        return resp.json();
    }

    /**
     * set cache
     * @param key cache key
     * @param data data to store
     * @param ctx next.js context
     */
    async set(key: string, data: any, ctx: any) {
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
     * @param tag cache tag
     */
    async revalidateTag(tag: string) {
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
