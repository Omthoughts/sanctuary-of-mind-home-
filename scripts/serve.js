import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function createStaticServer() {
  return http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    let safeUrl;
    try {
      safeUrl = decodeURIComponent(rawUrl.split('?')[0]);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Bad Request');
    }

    // Explicit check for null bytes (poison null byte attacks)
    if (safeUrl.includes('\0')) {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Bad Request');
    }

    // Explicit check for path traversal sequences
    if (safeUrl.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Forbidden');
    }

    const relPath = safeUrl === '/' ? 'index.html' : safeUrl.replace(/^\/+/, '');
    let filePath;
    try {
      filePath = path.resolve(rootDir, relPath);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Bad Request');
    }

    // Security check: ensure path stays within project root
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Forbidden');
    }

    try {
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
          return res.end('File Not Found');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          ...SECURITY_HEADERS
        });
        const stream = fs.createReadStream(filePath);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
            res.end('Internal Server Error');
          } else {
            res.destroy();
          }
        });
        stream.pipe(res);
      });
    } catch {
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
        res.end('Bad Request');
      }
    }
  });
}

const server = createStaticServer();

if (process.argv[1] && (process.argv[1].endsWith('serve.js') || process.argv[1].endsWith('serve'))) {
  server.listen(PORT, HOST, () => {
    console.log(`Sanctuary of Mind local server running at http://${HOST}:${PORT}`);
    console.log('Press Ctrl+C to stop.');
  });
}

export default server;
