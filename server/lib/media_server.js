const NodeMediaServer = require('node-media-server');
// const context = require('node-media-server/node_core_ctx');
const { get } = require('lodash');
const jwt = require('jsonwebtoken');
const { User } = require('./database');
const { token } = require('./auth/jwt');

const getUsernameFromStreamPath = path => {
    const parts = path.split('/');
    return parts[parts.length - 1];
};

const nmsExport = io => {
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
                    mp4: true,
                    mp4Flags: '[movflags=faststart]',
                },
            ],
        },
    });

    nms.on('prePublish', (id, streamPath, args) => {
        const username = getUsernameFromStreamPath(streamPath);
        console.log(
            '[NodeEvent on prePublish]',
            `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)} key=${get(
                args,
                'key',
                ''
            )} io=${io}`
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

    nms.on('postPublish', (id, streamPath, args) => {
        console.log(
            '[NodeEvent on postPublish]',
            `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)} key=${get(
                args,
                'key',
                ''
            )} io=${io}`
        );
        const [, , room] = streamPath.split('/');
        io.to(room).emit('is live', true);
    });

    nms.on('donePublish', (id, streamPath, args) => {
        console.log(
            '[NodeEvent on donePublish]',
            `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)} key=${get(
                args,
                'key',
                ''
            )} io=${io}`
        );
        const [, , room] = streamPath.split('/');
        io.to(room).emit('is live', false);
    });

    nms.on('prePlay', (id, StreamPath, args) => {
        console.log(
            '[NodeEvent on prePlay]',
            `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)} token=${get(
                args,
                'token',
                ''
            )}`
        );

        const session = nms.getSession(id);
        if (!session.isLocal) {
            // TODO: We need a better way to tell if it's the muxer connection
            jwt.verify(get(args, 'token'), token, (err, decoded) => {
                if (err || !decoded) {
                    session.reject();
                }
            });
        }
    });

    return nms;
};

module.exports = nmsExport;
