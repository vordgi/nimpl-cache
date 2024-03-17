// @ts-check

const createServer = require('next-impl-cache-adapter/src/create-server');
const CacheHandler = require('next-impl-cache-in-memory');

const server = createServer(new CacheHandler({}));

server.listen('4000', () => {
    console.log('Server is running at http://localhost:4000');
});
