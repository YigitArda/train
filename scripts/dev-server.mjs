import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { cwd } from 'node:process';

const PORT = Number(process.env.PORT || 5173);
const ROOT = cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function safePath(urlPath) {
  const pathname = urlPath === '/' ? '/index.html' : urlPath;
  const normalized = normalize(pathname).replace(/^\.+/, '');
  return join(ROOT, normalized);
}

createServer(async (req, res) => {
  try {
    const targetPath = safePath(new URL(req.url, `http://${req.headers.host}`).pathname);
    const ext = extname(targetPath).toLowerCase();
    const content = await readFile(targetPath);

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Dosya bulunamadı');
  }
}).listen(PORT, () => {
  console.log(`TrainScanner hazır: http://localhost:${PORT}`);
});
