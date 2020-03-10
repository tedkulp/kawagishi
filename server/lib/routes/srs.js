const express = require('express');
const get = require('lodash/get');
const last = require('lodash/last');

const { User } = require('../database');
const { logger } = require('../util/logger');

const router = express.Router();

const onPublish = (msg, res, io) => {
    const username = get(msg, 'stream');
    const stream_key = last(get(msg, 'param', '=').split(/=/));

    logger.debug('publish', username, stream_key);

    User.findOne({ username, stream_key })
        .then(foundUser => {
            if (!foundUser) {
                logger.trace('!foundUser');
                return res.status(400).send('1');
            }

            logger.trace('foundUser!');
            io.to(username).emit('is live', true);

            return res.status(200).send('0');
        })
        .catch(err => {
            logger.error('err', err);
            return res.status(400).send('2');
        });
};

const onUnpublish = (msg, res, io) => {
    const username = get(msg, 'stream');
    // const stream_key = get(msg, 'stream');
    logger.debug('unpublish', username);

    io.to(username).emit('is live', false);
    return res.status(200).send('0');
};

const onPlay = (msg, res, io) => {
    const username = get(msg, 'stream');
    // const stream_key = get(msg, 'stream');
    logger.debug('play', username);

    return res.status(200).send('0');
};

const onStop = (msg, res, io) => {
    const username = get(msg, 'stream');
    // const stream_key = get(msg, 'stream');
    logger.debug('stop', username);

    return res.status(200).send('0');
};

module.exports = {
    router,
    initialize: (app, io) => {
        router.post('/', async (req, res, _next) => {
            logger.debug('srs post', req.body);
            const body = get(req, 'body');
            const action = get(body, 'action');
            switch (action) {
                case 'on_publish':
                    return onPublish(body, res, io);
                case 'on_unpublish':
                    return onUnpublish(body, res, io);
                case 'on_play':
                    return onPlay(body, res, io);
                case 'on_stop':
                    return onStop(body, res, io);
                default:
                    return res.status(200).send('0');
            }

            // return res.status(404).end();
        });

        return router;
    },
};
