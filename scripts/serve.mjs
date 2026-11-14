import './build.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
  ['/tidaluna-prettier.mjs', 'text/javascript'],
  ['/tidaluna-prettier.json', 'application/json'],
]);
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (!files.has(path)) { res.writeHead(404).end(); return; }
  try {
    const body = await readFile(new URL(`../dist${path}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': files.get(path) }).end(body);
  } catch { res.writeHead(500).end(); }
}).listen(5173, '127.0.0.1', () => console.log('Luna Install from URL: http://127.0.0.1:5173/tidaluna-prettier'));
