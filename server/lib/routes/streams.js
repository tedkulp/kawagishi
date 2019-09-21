const express = require('express');
const context = require('node-media-server/node_core_ctx');
const _ = require('lodash');
const { jwtAuthenticate } = require('../auth/passport');

const { User } = require('../database');
const router = express.Router();

router.get('/', jwtAuthenticate(), async (_req, res, _next) => {
    let stats = {};

    context.sessions.forEach(function(session, _id) {
        if (session.isStarting) {
            let regRes = /\/(.*)\/(.*)/gi.exec(session.publishStreamPath || session.playStreamPath);

            if (regRes === null) return;

            let [app, stream] = _.slice(regRes, 1);

            if (!_.get(stats, [stream])) {
                _.set(stats, [stream], {
                    publisher: null,
                    subscribers: [],
                });
            }

            switch (true) {
                case session.isPublishing: {
                    _.set(stats, [stream, 'publisher'], {
                        app: app,
                        stream: stream,
                        clientId: session.id,
                        startTime: session.connectTime,
                        duration: Math.ceil((Date.now() - session.startTimestamp) / 1000),
                        bytes: session.socket.bytesRead,
                        ip: session.socket.remoteAddress,
                        user: {},
                        audio:
                            session.audioCodec > 0
                                ? {
                                      codec: session.audioCodecName,
                                      profile: session.audioProfileName,
                                      samplerate: session.audioSamplerate,
                                      channels: session.audioChannels,
                                  }
                                : null,
                        video:
                            session.videoCodec > 0
                                ? {
                                      codec: session.videoCodecName,
                                      width: session.videoWidth,
                                      height: session.videoHeight,
                                      profile: session.videoProfileName,
                                      level: session.videoLevel,
                                      fps: session.videoFps,
                                  }
                                : null,
                    });

                    break;
                }
                case !!session.playStreamPath: {
                    switch (session.constructor.name) {
                        case 'NodeRtmpSession': {
                            stats[stream]['subscribers'].push({
                                app: app,
                                stream: stream,
                                clientId: session.id,
                                connectCreated: session.connectTime,
                                bytes: session.socket.bytesWritten,
                                ip: session.socket.remoteAddress,
                                protocol: 'rtmp',
                            });

                            break;
                        }
                        case 'NodeFlvSession': {
                            stats[stream]['subscribers'].push({
                                app: app,
                                stream: stream,
                                clientId: session.id,
                                connectCreated: session.connectTime,
                                bytes: session.req.connection.bytesWritten,
                                ip: session.req.connection.remoteAddress,
                                protocol: session.TAG === 'websocket-flv' ? 'ws' : 'http',
                            });

                            break;
                        }
                    }

                    break;
                }
            }
        }
    });

    // Set all the users for all the publishers in a fancy async way
    // See: https://zellwk.com/blog/async-await-in-loops/
    stats = await Object.keys(stats).reduce(async (acc, key) => {
        const val = stats[key];
        const user = await User.findOne({ username: key }, ['username', 'email']);
        val['publisher']['user'] = user;

        const updatedAcc = await acc;
        updatedAcc[key] = val;
        return updatedAcc;
    }, {});

    res.json(stats);
});

router.get('/:username', jwtAuthenticate(), async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username }, [
        'username',
        'email',
        'channel_title',
    ]);

    let streamStats = {
        isLive: false,
        viewers: 0,
        duration: 0,
        bitrate: 0,
        startTime: null,
        user: user || {},
    };

    let publishStreamPath = `/live/${req.params.username}`;

    let publisherSession = context.sessions.get(context.publishers.get(publishStreamPath));

    streamStats.isLive = !!publisherSession;
    streamStats.viewers = _.filter(Array.from(context.sessions.values()), session => {
        return session.playStreamPath === publishStreamPath;
    }).length;
    streamStats.duration = streamStats.isLive
        ? Math.ceil((Date.now() - publisherSession.startTimestamp) / 1000)
        : 0;
    streamStats.bitrate =
        streamStats.duration > 0
            ? Math.ceil(
                  (_.get(publisherSession, ['socket', 'bytesRead'], 0) * 8) /
                      streamStats.duration /
                      1024
              )
            : 0;
    streamStats.startTime = streamStats.isLive ? publisherSession.connectTime : null;

    res.json(streamStats);
});

exports.router = router;
