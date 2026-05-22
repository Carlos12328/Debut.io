const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const PORT = 8082;
const METRO_PORT = 8081;

const server = http.createServer((req, res) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  proxy.web(req, res, { target: `http://localhost:${METRO_PORT}` });
});

server.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
  console.log(`Acesse o app web em http://localhost:${PORT}`);
});