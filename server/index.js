const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;

const nms = require('./lib/media_server');
const login = require('./lib/routes/login');
const signup = require('./lib/routes/signup');
const streams = require('./lib/routes/streams');

// Add on the top next to imports
const { passport } = require('./lib/auth/passport');

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/login', login.router);
app.use('/api/v1/signup', signup.router);
app.use('/api/v1/streams', streams.router);

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('join channel', data => {
        console.log('join channel', data);
        socket.join(data.channel);
    });

    socket.on('leave channel', data => {
        console.log('leave channel', data);
        socket.leave(data.channel);
    });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
nms.run();
