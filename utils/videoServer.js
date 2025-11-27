const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stat = promisify(fs.stat);

let server;
let serverPort = 0;

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${serverPort}`);
        
        // Only handle /video endpoint
        if (url.pathname !== '/video') {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        const filePath = url.searchParams.get('path');
        if (!filePath) {
          res.statusCode = 400;
          res.end('Missing path parameter');
          return;
        }

        // Security check: Ensure file exists and is a file
        try {
          const stats = await stat(filePath);
          if (!stats.isFile()) {
            res.statusCode = 404;
            res.end('File not found');
            return;
          }

          const fileSize = stats.size;
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            
            const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4', // Adjust based on file extension if needed, but browsers are smart
            };
            
            res.writeHead(206, head);
            file.pipe(res);

            // Ensure stream is closed if request is aborted
            req.on('close', () => {
              file.destroy();
            });
          } else {
            const head = {
              'Content-Length': fileSize,
              'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            const file = fs.createReadStream(filePath);
            file.pipe(res);

            req.on('close', () => {
              file.destroy();
            });
          }
        } catch (err) {
          console.error('File access error:', err);
          res.statusCode = 404;
          res.end('File not found or inaccessible');
        }
      } catch (err) {
        console.error('Server error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      console.log(`Video server running on port ${serverPort}`);
      resolve(serverPort);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

function getServerPort() {
  return serverPort;
}

module.exports = { startServer, getServerPort };
