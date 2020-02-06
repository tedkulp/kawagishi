const express = require('express');
const app = express();
const path = require('path');

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingInterval: 500,
    pingTimeout: 10000,
});
const port = 3000;

const nms = require('./lib/media_server')(io);
const login = require('./lib/routes/login');
const signup = require('./lib/routes/signup');
const streams = require('./lib/routes/streams');
const users = require('./lib/routes/users');
const { cronJob } = require('./lib/util/thumbnails');

// Add on the top next to imports
const { passport } = require('./lib/auth/passport');

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/login', login.router);
app.use('/api/v1/signup', signup.router);
app.use('/api/v1/streams', streams.router);
app.use('/api/v1/users', users.router);

app.use('/thumbnails', express.static(path.join(__dirname, '..', 'thumbnails')));

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });

    socket.on('join channel', data => {
        console.log('join channel', data);
        socket.join(data.channel);
    });

    socket.on('leave channel', data => {
        console.log('leave channel', data);
        socket.leave(data.channel);
    });

    socket.on('new message', data => {
        console.log('new message', data);
        io.to(data.channelName).emit('broadcast message', data);
    });
});

io.on('disconnection', socket => {});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
nms.run();

cronJob.start();
