const NodeMediaServer = require('node-media-server');
const { User } = require('./database');

const nms = new NodeMediaServer({
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
    },
});

nms.on('prePublish', (id, streamPath, args) => {
    const streamKey = getStreamKeyFromStreamPath(streamPath);
    console.log(
        '[NodeEvent on prePublish]',
        `id=${id} StreamPath=${streamPath} args=${JSON.stringify(args)}`
    );

    User.findOne({ stream_key: streamKey }, (err, user) => {
        if (!err) {
            if (!user) {
                let session = nms.getSession(id);
                session.reject();
            }
        }
    });
});

const getStreamKeyFromStreamPath = path => {
    const parts = path.split('/');
    return parts[parts.length - 1];
};

module.exports = nms;
