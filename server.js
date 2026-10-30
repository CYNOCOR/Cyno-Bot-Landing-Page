const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5501;

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqPath = req.url === '/' ? '/index.html' : req.url;
    // Strip query string
    reqPath = reqPath.split('?')[0];
    const safePath = path.normalize(path.join(__dirname, reqPath));

    if (!safePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    if (fs.existsSync(safePath) && !fs.statSync(safePath).isDirectory()) {
        const ext = path.extname(safePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(safePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Live Server running at http://127.0.0.1:${PORT}`);
});
