const NodeMediaServer = require('node-media-server');
const context = require('node-media-server/node_core_ctx');
const { get } = require('lodash');
const { User } = require('./database');

const nms = new NodeMediaServer({
    logType: 3,
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
    },
    http: {
        port: 8888,
        allow_origin: '*',
        mediaroot: './media',
    },
    trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                dash: true,
                dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
            },
        ],
    },
});

nms.on('prePublish', (id, streamPath, args) => {
    const username = getUsernameFromStreamPath(streamPath);
    console.log(
        '[NodeEvent on prePublish]',
        `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)} key=${get(args, 'key', '')}`
    );

    User.findOne({ username: username, stream_key: get(args, 'key', '') }, (err, user) => {
        if (!err) {
            if (!user) {
                let session = nms.getSession(id);
                session.reject();
            }
        }
    });
});

const getUsernameFromStreamPath = path => {
    const parts = path.split('/');
    return parts[parts.length - 1];
};

// function blah() {
//     console.log('context', context);
// }
// setInterval(blah, 5 * 1000);

module.exports = nms;
