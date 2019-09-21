import React, { useEffect } from 'react';
import { get } from 'lodash';
import moment from 'moment';
// import useTimeout from 'use-timeout';
import useInterval from '../hooks/use-interval';
// import durationSetup from 'moment-duration-format';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Player from './Player';
import Player2 from './Player2';

import io from 'socket.io-client';

const socket = io();

export default props => {
    const currentUser = useStoreState(state => state.Auth.currentUser);
    const currentChannel = useStoreState(state => state.Channels.currentChannel);
    const getChannel = useStoreActions(actions => actions.Channels.getChannel);
    const streamName = get(props, 'match.params.streamName');

    useInterval(() => getChannel({ streamName }), 10 * 1000);

    useEffect(() => {
        getChannel({ streamName });
        socket.emit('join channel', { channel: streamName });

        return () => {
            socket.emit('leave channel', { channel: streamName });
        };
    }, []);

    // const videoJsOptions = {
    //     autoplay: true,
    //     controls: true,
    //     sources: [
    //         {
    //             src: `/live/${streamName}/index.m3u8`,
    //             type: 'application/x-mpegURL',
    //         },
    //     ],
    // };

    return (
        <>
            {currentChannel && (
                <>
                    <h1>{get(currentChannel, 'user.channel_title')}</h1>
                    <p>
                        Streamed By: {get(currentChannel, 'user.username')} - Stream Started:{' '}
                        {moment(get(currentChannel, 'startTime')).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                </>
            )}

            <Player
                url={`/live/${streamName}.flv`}
                type="flv"
                play={!!currentChannel.isLive}
                config={{
                    enableStashBuffer: false,
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }}
                t
            />

            {/* <Player2 {...videoJsOptions} /> */}
        </>
    );
};
