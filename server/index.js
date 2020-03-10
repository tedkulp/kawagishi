const express = require('express');
const WebSocket = require('ws');
// const { createProxyMiddleware } = require('http-proxy-middleware');
const { logger, expressLogger } = require('./lib/util/logger');
const app = express();

const path = require('path');

const http = require('http').createServer(app);
const wss = new WebSocket.Server({ noServer: true });
const io = require('socket.io')(http, {
    pingInterval: 500,
    pingTimeout: 10000,
});
const port = 3000;

// const nms = require('./lib/media_server')(io);
const registerRoutes = require('./lib/routes');
// const login = require('./lib/routes/login');
// const signup = require('./lib/routes/signup');
// const srs = require('./lib/routes/srs');
// const streams = require('./lib/routes/streams');
// const users = require('./lib/routes/users');
const { cronJob } = require('./lib/util/thumbnails');

// Add on the top next to imports
const { passport } = require('./lib/auth/passport');

// app.use(expressLogger);

// Proxy for streaming flv over websocket from srs
// const socketProxy = createProxyMiddleware('/sp', {
//     target: 'http://srs:8080',
//     ws: true,
//     pathRewrite: {
//         '^/sp': '',
//     },
//     logLevel: 'debug',
//     onError: (err, req, res) => {
//         console.log(err);
//         // res.end('');
//         res.writeHead(500, {
//             'Content-Type': 'text/plain',
//         });
//         res.end('Something went wrong. And we are reporting a custom error message.');
//     },
// });
// app.use(socketProxy);

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

registerRoutes(app, io);

app.use('/thumbnails', express.static(path.join(__dirname, '..', 'thumbnails')));

io.on('connection', socket => {
    logger.trace('a user connected');

    socket.on('disconnect', () => {
        logger.trace('a user disconnected');
    });

    socket.on('join channel', data => {
        logger.trace('join channel', data);
        socket.join(data.channel);
    });

    socket.on('leave channel', data => {
        logger.trace('leave channel', data);
        socket.leave(data.channel);
    });

    socket.on('new message', data => {
        logger.trace('new message', data);
        io.to(data.channelName).emit('broadcast message', data);
    });
});

io.on('disconnection', socket => {});

wss.on('connection', (ws, req, client) => {
    console.log('conection', ws);
    ws.on('message', msg => {
        console.log('msg', msg);
    });
});

http.on('upgrade', (request, socket, head) => {
    // console.log('upgrade', request.url);
    if (request.url && request.url.startsWith('/sp')) {
        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
        });
    }
});

http.listen(port, () => logger.info(`Example app listening on port ${port}!`));
// nms.run();

cronJob.start();
