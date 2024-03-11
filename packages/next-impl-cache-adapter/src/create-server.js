const http = require('http');

const buildIds = [];

/**
 * Create server to control cache remotely
 * @param {any} cacheHandler custom cache-handler
 * @param {(req: http.IncomingMessage) => boolean=} verifyRequest callback to verify request
 * @returns server
 */
const createServer = (cacheHandler, verifyRequest) => {
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

        // onNewBuildReady();

        if (!key || !method) return res.end();

        if (method === 'get') {
          const data = await cacheHandler.get(buildId + key);
          if (data) {
            return res.end(JSON.stringify(data));
          } else {
            res.statusCode = 400;
            return res.end();
          }
        }

        if (method === 'post') {
          /** @type {{data: any, ctx: any}} */
          const body = await new Promise(resolve => {
            let rowData = '';
  
            req.on('data', chunk => {
              rowData += chunk;
            });
  
            req.on('end', () => {
              resolve(JSON.parse(rowData));
            });
          })
          await cacheHandler.set(buildId + key, body.data, body.ctx);
          return res.end();
        }

        if (method === 'delete') {
          await cacheHandler.revalidateTag(buildId + key);
          return res.end();
        }

        if (method === 'put') { // new build ready
          const cachedKeys = await cacheHandler.keys();
          const targetBuildIdIndex = buildIds.indexOf(buildId);
          const oldBuildIds = buildIds.slice(0, targetBuildIdIndex);

          for await (const cachedKey of cachedKeys) {
            if (oldBuildIds.some(id => cachedKey.startsWith(id))) {
              await cacheHandler.delete(cachedKey);
            }
          }
        }
      } catch (e) {
        console.log('error on cache processing', e);
      }
    }
  )
  return server;
}

module.exports = createServer;
