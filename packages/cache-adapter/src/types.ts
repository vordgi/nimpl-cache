/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseCacheHandlerConstructor {
    new (options: any): BaseCacheHandlerInterface;
}

export interface BaseCacheHandlerInterface {
    get: (key: string) => Promise<any>;
    set: (key: string, data: any, ctx: any) => Promise<any>;
    revalidateTag: (key: string) => Promise<void>;
    keys?: () => Promise<string[]>;
    delete?: (key: string) => Promise<void>;
}

export type AdapterConfiguration = {
    /** custom cache-handler */
    CacheHandler: BaseCacheHandlerConstructor;
    /** unique build id */
    buildId: string;
    /** server cache url */
    cacheUrl: string;
    /**
     * cache mode
     * @default 'isomorphic'
     */
    cacheMode: "local" | "remote" | "isomorphic";
    /** options from next.js */
    options: any;
    /** mark current build as main and remove cache for all previous */
    buildReady: boolean;
};
