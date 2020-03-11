const http = require('http');
const httpProxy = require('http-proxy');
const WebSocket = require('ws');
const get = require('lodash/get');
const request = require('request');
const jwt = require('jsonwebtoken');

const proxy = httpProxy.createProxyServer({});
const wss = new WebSocket.Server({ noServer: true });

const token =
    process.env.JWT_SECRET || 'lksfkljuwlksjwelkjsdlkjsdlkjweoiseijlxlvkjsldkfjewoirwlkjsdfklj';

const getSentToken = req => {
    let token = get(req, 'headers.authorization', '').replace('Bearer ', '');
    if (!token) {
        let sentUrl = req.url;
        if (sentUrl.startsWith('/')) {
            sentUrl = 'http://test.com' + sentUrl;
        }

        const urlParts = new URL(sentUrl);
        if (urlParts.searchParams.has('token')) {
            token = urlParts.searchParams.get('token');
        }
    }
    return token;
};

const doVerify = (req, res, sendRawTcp, cb) => {
    return jwt.verify(getSentToken(req), token, (err, decoded) => {
        if (err) {
            if (sendRawTcp) {
                res.write(
                    'HTTP/1.1 401 Web Socket Protocol Handshake\r\n' +
                        'Upgrade: WebSocket\r\n' +
                        'Connection: Upgrade\r\n' +
                        '\r\n'
                );
                res.end();
                res.destroy();
                return;
            } else {
                res.writeHead(401, {
                    'Content-Type': 'text/plain',
                });
                res.end('Unauthorized');
            }
        } else {
            cb(decoded);
        }
    });
};

const server = http.createServer((req, res) => {
    doVerify(req, res, false, _decoded => {
        proxy.web(req, res, { target: 'http://srs:8080' });
    });
});

server.on('upgrade', (req, socket, head) => {
    doVerify(req, socket, true, _decoded => {
        wss.handleUpgrade(req, socket, head, ws => {
            const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' });
            request(
                {
                    uri: 'http://srs:8080' + req.url,
                    encoding: null,
                    method: 'GET',
                },
                (err, res, body) => {
                    console.log(err, res);
                }
            ).pipe(duplex);
        });
    });
});

server.listen(3002);
