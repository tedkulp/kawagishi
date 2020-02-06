const NodeMediaServer = require('node-media-server');
// const context = require('node-media-server/node_core_ctx');
const { get } = require('lodash');
const jwt = require('jsonwebtoken');
const { User } = require('./database');
const { token } = require('./auth/jwt');
const config = require('./config/default');
const { generateStreamThumbnail } = require('./util/thumbnails');

const getUsernameFromStreamPath = path => {
    const parts = path.split('/');
    return parts[parts.length - 1];
};

const nmsExport = io => {
    const nms = new NodeMediaServer(config.rtmp_server);

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
                } else {
                    generateStreamThumbnail(username, get(args, 'key', ''));
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

    nms.on('preRecord', (StreamPath, files) => {
        console.log(
            `[NodeEvent on preRecord]`,
            `StreamPath=${StreamPath} files=${JSON.stringify(files)}`
        );
    });

    nms.on('doneRecord', (StreamPath, files) => {
        console.log(
            `[NodeEvent on doneRecord]`,
            `StreamPath=${StreamPath} files=${JSON.stringify(files)}`
        );
    });

    return nms;
};

module.exports = nmsExport;
