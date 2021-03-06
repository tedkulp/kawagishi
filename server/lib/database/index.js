const mongoose = require('mongoose');
const { logger } = require('../util/logger');

const mongoUrl = 'mongodb://mongo/streaming';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const connectWithRetry = function() {
    return mongoose
        .connect(mongoUrl, mongoOptions)
        .then(() => {
            logger.info('Connected to db');
        })
        .catch(err => {
            logger.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

exports.Invite = mongoose.model('Invite', require('./InviteSchema'));
exports.User = mongoose.model('User', require('./UserSchema'));
