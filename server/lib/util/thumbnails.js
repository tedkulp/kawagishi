const request = require('request');
const spawn = require('child_process').spawn;
const cron = require('cron');
const config = require('../config/default');

const { User } = require('../database');

const cmd = config.rtmp_server.trans.ffmpeg;
const port = config.rtmp_server.http.port;

const generateStreamThumbnail = (uesrname, streamKey) => {
    const args = [
        '-y',
        '-i',
        `http://127.0.0.1:${port}/live/${uesrname}/index.m3u8?token=${streamKey}`,
        '-ss',
        '00:00:01',
        '-vframes',
        '1',
        '-vf',
        'scale=-2:300',
        `thumbnails/${uesrname}.png`,
    ];

    console.log('[Generating Thumbnail]', cmd, args.join(' '));

    spawn(cmd, args, {
        detached: true,
        stdio: 'ignore',
    }).unref();
};

const cronJob = new cron.CronJob(
    '*/60 * * * * *',
    () => {
        request.get(`http://127.0.0.1:${port}/api/streams`, (error, response, body) => {
            const streams = JSON.parse(body);
            if (streams.live) {
                console.log(JSON.stringify(streams.live));
                Object.keys(streams.live).forEach(streamName => {
                    User.findOne({ username: streamName }, (err, user) => {
                        if (!err && user) {
                            generateStreamThumbnail(streamName, user.stream_key);
                        }
                    });
                });
            }
        });
    },
    null,
    false
);

module.exports = {
    cronJob,
    generateStreamThumbnail,
};
