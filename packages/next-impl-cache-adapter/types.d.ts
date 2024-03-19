declare class BaseCacheHandler {
    constructor(options: any)

    get: (key: string) => Promise<any>;
    set: (key: string, data: any, ctx: any) => Promise<any>;
    revalidateTag: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
    delete: (key: string) => Promise<void>;
}
