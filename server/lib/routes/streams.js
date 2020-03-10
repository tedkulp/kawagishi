const express = require('express');
const request = require('request-promise');
const get = require('lodash/get');

// const context = require('node-media-server/node_core_ctx');
// const _ = require('lodash');
const { jwtAuthenticate } = require('../auth/passport');

const { User } = require('../database');
const router = express.Router();

router.get('/', jwtAuthenticate(), async (_req, res, _next) => {
    const streams = await request({
        uri: 'http://srs:1985/api/v1/streams',
        json: true,
    }).then(resp => {
        return get(resp, 'streams');
    });

    let stats = await Promise.all(
        streams.map(async singleStream => {
            const cid = get(singleStream, 'publish.cid');
            const clientDetails = await request({
                uri: `http://srs:1985/api/v1/clients/${cid}`,
                json: true,
            }).then(resp => {
                return get(resp, 'client');
            });

            const liveTimeS = Math.ceil(get(clientDetails, 'alive', 0));

            return {
                app: singleStream.app,
                stream: singleStream.name,
                clientId: singleStream.id,
                startTime: Math.ceil(Date.now() / 1000) - liveTimeS,
                duration: liveTimeS,
                bytes: singleStream.recv_bytes,
                user: {},
                viewers: get(singleStream, 'clients', 1) - 1,
                audio: {
                    codec: get(singleStream, 'audio.codec'),
                    sampleRate: get(singleStream, 'audio.sample_rate', 0),
                    channels: get(singleStream, 'audio.channel', 0),
                    profile: get(singleStream, 'audio.profile'),
                },
                video: {
                    codec: get(singleStream, 'video.codec'),
                    profile: get(singleStream, 'video.profile'),
                    level: get(singleStream, 'video.level'),
                    width: get(singleStream, 'video.width', 0),
                    height: get(singleStream, 'video.height', 0),
                },
            };
        })
    );

    // Set all the users for all the publishers in a fancy async way
    // See: https://zellwk.com/blog/async-await-in-loops/
    stats = await stats.reduce(async (acc, stream) => {
        const username = stream.stream;
        const user = await User.findOne({ username }, ['username', 'email', 'channel_title']);
        stream['user'] = user;

        let updatedAcc = await acc;
        updatedAcc = [...updatedAcc, stream];
        return updatedAcc;
    }, []);

    res.json(stats);
});

router.get('/:username', jwtAuthenticate(), async (req, res, next) => {
    const [user, stream] = await Promise.all([
        User.findOne({ username: req.params.username }, ['username', 'email', 'channel_title']),
        request({
            uri: 'http://srs:1985/api/v1/streams',
            json: true,
        })
            .then(resp => {
                return get(resp, 'streams');
            })
            .then(streams => {
                return streams.find(s => s.name === req.params.username);
            }),
    ]);

    const isLive = stream && get(stream, 'publish.active');

    let streamStats = {
        isLive: !!isLive,
        viewers: isLive ? get(stream, 'viewers', 1) - 1 : 0,
        duration: 0,
        startTime: null,
        user: user || {},
    };

    /*
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
    */

    res.json(streamStats);
});

exports.router = router;
