const login = require('./login');
const signup = require('./signup');
const srs = require('./srs');
const streams = require('./streams');
const users = require('./users');

module.exports = (app, io) => {
    app.use('/api/v1/login', login.router);
    app.use('/api/v1/signup', signup.router);
    app.use('/api/v1/srs', srs.initialize(app, io));
    app.use('/api/v1/streams', streams.router);
    app.use('/api/v1/users', users.router);
};
