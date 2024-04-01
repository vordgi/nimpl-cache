const http = require('http');

/** @type {string[]} */
const buildIds = [];

/** @type {{[type: string]: {[url: string]: Promise<any>}}} */
const memo = {
  get: {},
  set: {},
  revalidate: {},
  delete: {},
};

/**
 * Create server to control cache remotely
 * @param {BaseCacheHandler} cacheHandler custom cache-handler
 * @param {(req: http.IncomingMessage) => boolean=} verifyRequest callback to verify request
 * @returns server
 */
const createServer = (cacheHandler, verifyRequest) => {
  const isFledgedCacheHandler = cacheHandler.keys && !cacheHandler.delete;

  if (!isFledgedCacheHandler) {
    console.error('The current cacheHandler does not support deletion of outdated data. Missing methods: keys and delete');
  }

  const server = http.createServer(
    async (req, res) => {
      try {
        if (!req.url || (verifyRequest && !verifyRequest(req))) return res.end();

        const url = new URL(req.url, 'http://n');
        const buildId = url.searchParams.get('buildId') || '';
        const key = url.searchParams.get('key');
        const method = req.method?.toLowerCase();

        if (!buildIds.includes(buildId)) {
          buildIds.push(buildId);
        }

        if (!key || !method) return res.end();

        const requestKey = buildId + key;

        if (method === 'get') {
          if (!memo.get[requestKey]) {
            memo.get[requestKey] = cacheHandler.get(requestKey).finally((/** @type {any} */ d) => {
              delete memo.get[requestKey];
              return d;
            });
          }
          const data = await memo.get[req.url];
          if (data) {
            return res.end(JSON.stringify(data));
          } else {
            res.statusCode = 400;
            return res.end();
          }
        }

        if (method === 'post') {
          if (!memo.set[requestKey]) {
            /** @type {{data: any, ctx: any}} */
            memo.set[requestKey] = new Promise(resolve => {
              let rowData = '';

              req.on('data', chunk => {
                rowData += chunk;
              });

              req.on('end', () => {
                resolve(JSON.parse(rowData));
              });
            }).then(body => {
              /** @type {string[]} */
              const headerTags = body.data.headers['x-next-cache-tags'].split(',');
              body.data.headers['x-next-cache-tags'] = headerTags.map(r => buildId + r).join(',');
              return cacheHandler.set(requestKey, body.data, body.ctx);
            }).finally(() => {
              delete memo.set[requestKey];
            })
          }
          await memo.set[requestKey];
          return res.end();
        }

        if (method === 'delete') {
          if (!memo.revalidate[requestKey]) {
            memo.revalidate[requestKey] = cacheHandler.revalidateTag(requestKey).finally(() => {
              delete memo.revalidate[requestKey];
            })
          }
          await memo.revalidate[requestKey];
          return res.end();
        }

        // new build ready
        if (method === 'put' && isFledgedCacheHandler) {
          if (!memo.delete[requestKey]) {
            // @ts-ignore
            memo.delete[requestKey] = cacheHandler.keys().then(async (cachedKeys) => {
              const targetBuildIdIndex = buildIds.indexOf(buildId);
              const oldBuildIds = buildIds.slice(0, targetBuildIdIndex);

              for await (const cachedKey of cachedKeys) {
                if (oldBuildIds.some(id => cachedKey.startsWith(id))) {
                  // @ts-ignore
                  await cacheHandler.delete(cachedKey);
                }
              }
            }).finally(() => {
              delete memo.delete[requestKey];
            })
          }
          await memo.delete[requestKey];
          return res.end();
        }
      } catch (e) {
        console.log('error on cache processing', e);
      }
    }
  )

  return server;
}

module.exports = createServer;
