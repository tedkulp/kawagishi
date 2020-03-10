const request = require('request');
const spawn = require('child_process').spawn;
const cron = require('cron');
const config = require('../config/default');
const { logger } = require('./logger');

const get = require('lodash/get');

const { User } = require('../database');

const cmd = config.rtmp_server.trans.ffmpeg;
const port = config.rtmp_server.http.port;

const generateStreamThumbnail = (username, streamKey) => {
    const args = [
        '-y',
        '-i',
        `http://srs:8080/live/${username}.flv?token=${streamKey}`,
        '-ss',
        '00:00:01',
        '-vframes',
        '1',
        '-vf',
        'scale=-2:300',
        `thumbnails/${username}.png`,
    ];

    logger.debug('[Generating Thumbnail]', cmd, args.join(' '));

    spawn(cmd, args, {
        detached: true,
        stdio: 'ignore',
    }).unref();
};

const cronJob = new cron.CronJob(
    '*/60 * * * * *',
    () => {
        logger.trace('Running screenshot crontab');
        request({ uri: `http://srs:1985/api/v1/streams`, json: true }, (error, response, body) => {
            get(body, 'streams', []).forEach(singleStream => {
                if (get(singleStream, 'publish.active')) {
                    User.findOne({ username: get(singleStream, 'name') }, (err, user) => {
                        if (!err && user) {
                            generateStreamThumbnail(user.username, user.stream_key);
                        }
                    });
                }
            });
        });
    },
    null,
    false
);

module.exports = {
    cronJob,
    generateStreamThumbnail,
};
