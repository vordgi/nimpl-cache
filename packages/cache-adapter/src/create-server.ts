/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer as createHttpServer, type IncomingMessage } from "http";
import { type BaseCacheHandlerInterface } from "./types";

const buildIds: string[] = [];

const inMemoryCache: { [type: string]: { [url: string]: Promise<any> } } = {
    get: {},
    set: {},
    revalidate: {},
    delete: {},
};

/**
 * Create server to control cache remotely
 * @param cacheHandler custom cache-handler
 * @param verifyRequest callback to verify request
 * @returns server
 */
export const createServer = (
    cacheHandler: BaseCacheHandlerInterface,
    verifyRequest?: (req: IncomingMessage) => boolean,
) => {
    const isFledgedCacheHandler = cacheHandler.keys && !cacheHandler.delete;

    if (!isFledgedCacheHandler) {
        console.error(
            "The current cacheHandler does not support deletion of outdated data. Missing methods: keys and delete",
        );
    }

    const server = createHttpServer(async (req, res) => {
        try {
            if (!req.url || (verifyRequest && !verifyRequest(req))) return res.end();

            const url = new URL(req.url, "http://n");
            const buildId = url.searchParams.get("buildId") || "";
            const key = url.searchParams.get("key");
            const method = req.method?.toLowerCase();

            if (!buildIds.includes(buildId)) {
                buildIds.push(buildId);
            }

            if (!key || !method) return res.end();

            const requestKey = buildId + key;

            if (method === "get") {
                if (!inMemoryCache.get[requestKey]) {
                    inMemoryCache.get[requestKey] = cacheHandler
                        .get(requestKey)
                        .then((d: any) => {
                            delete inMemoryCache.get[requestKey];
                            return d;
                        })
                        .catch(() => {
                            return null;
                        });
                }
                const data = await inMemoryCache.get[req.url];
                if (data) {
                    return res.end(JSON.stringify(data));
                } else {
                    res.statusCode = 400;
                    return res.end();
                }
            }

            if (method === "post") {
                if (!inMemoryCache.set[requestKey]) {
                    inMemoryCache.set[requestKey] = new Promise<{ data: any; ctx: any }>((resolve) => {
                        let rowData = "";

                        req.on("data", (chunk) => {
                            rowData += chunk;
                        });

                        req.on("end", () => {
                            resolve(JSON.parse(rowData));
                        });
                    })
                        .then((body) => {
                            const headerTags: string[] = body.data.headers["x-next-cache-tags"].split(",");
                            body.data.headers["x-next-cache-tags"] = headerTags.map((r) => buildId + r).join(",");
                            return cacheHandler.set(requestKey, body.data, body.ctx);
                        })
                        .finally(() => {
                            delete inMemoryCache.set[requestKey];
                        });
                }
                await inMemoryCache.set[requestKey];
                return res.end();
            }

            if (method === "delete") {
                if (!inMemoryCache.revalidate[requestKey]) {
                    inMemoryCache.revalidate[requestKey] = cacheHandler.revalidateTag(requestKey).finally(() => {
                        delete inMemoryCache.revalidate[requestKey];
                    });
                }
                await inMemoryCache.revalidate[requestKey];
                return res.end();
            }

            // new build ready
            if (method === "put" && isFledgedCacheHandler) {
                if (!inMemoryCache.delete[requestKey]) {
                    inMemoryCache.delete[requestKey] = cacheHandler.keys!()
                        .then(async (cachedKeys) => {
                            const targetBuildIdIndex = buildIds.indexOf(buildId);
                            const oldBuildIds = buildIds.slice(0, targetBuildIdIndex);

                            for await (const cachedKey of cachedKeys) {
                                if (oldBuildIds.some((id) => cachedKey.startsWith(id))) {
                                    await cacheHandler.delete!(cachedKey);
                                }
                            }
                        })
                        .finally(() => {
                            delete inMemoryCache.delete[requestKey];
                        });
                }
                await inMemoryCache.delete[requestKey];
                return res.end();
            }
        } catch (e) {
            console.log("error on cache processing", e);
        }
    });

    return server;
};
