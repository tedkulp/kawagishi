import React, { useEffect, useState, createRef } from 'react';
import { get, debounce } from 'lodash';
// import moment from 'moment';
import { useStoreState, useStoreActions } from 'easy-peasy';
import useResizeObserver from 'use-resize-observer';

import Grid from '@material-ui/core/Grid';

import ChannelChat from './ChannelChat';
import FlvPlayer from './players/FlvPlayer';
// import HlsPlayer from './players/HlsPlayer';

import io from 'socket.io-client';

const socket = io();

export default props => {
    const [reconnects, setReconnects] = useState(0);
    const currentUser = useStoreState(state => state.Auth.currentUser);
    const currentChannel = useStoreState(
        state => state.Channels.currentChannel,
        (prev, next) => prev.isLive === next.isLive
    );
    const getChannel = useStoreActions(actions => actions.Channels.getChannel);
    const streamName = get(props, 'match.params.streamName');

    let playerWrapper = createRef();

    const reconnectFunc = debounce(
        () => {
            console.log('reconnect complete');
            setReconnects(prevVal => prevVal + 1);
        },
        1000,
        {
            leading: true,
            maxWait: 5000,
            trailing: false,
        }
    );
    socket.on('reconnect', reconnectFunc);

    const disconnectFunc = debounce(
        function() {
            console.log('disconnected', arguments);
        },
        1000,
        {
            leading: true,
            maxWait: 5000,
            trailing: false,
        }
    );
    socket.on('disconnect', disconnectFunc);

    useEffect(() => {
        console.log('using reconnect effect', reconnects);

        getChannel({ streamName });

        // Re-grab data if live flag changes
        socket.on('is live', () => {
            getChannel({ streamName });
        });

        socket.emit('join channel', { channel: streamName, user: currentUser.user });

        return () => {
            // socket.emit('leave channel', { channel: streamName, user: currentUser.user });
            // socket.off('is live', () => {
            //     getChannel({ streamName });
            // });
        };
    }, [reconnects]);

    const resizerDetails = useResizeObserver({ ref: playerWrapper });

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

    const wsUrlPrefix = [window.location.protocol, window.location.host]
        .join('//')
        .replace('http', 'ws');

    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                {currentChannel && (
                    <>
                        <h1 style={{ marginTop: '10px', marginBottom: 0 }}>
                            {get(currentChannel, 'user.channel_title')}
                        </h1>
                        {/* <p>
                            Streamed By: {get(currentChannel, 'user.username')} - Stream Started:{' '}
                            {moment(get(currentChannel, 'startTime')).format(
                                'MMMM Do YYYY, h:mm:ss a'
                            )}
                        </p> */}
                    </>
                )}
            </Grid>

            <Grid item xs={12} md={10} ref={playerWrapper}>
                <FlvPlayer
                    url={`${wsUrlPrefix}/live/${streamName}.flv?token=${currentUser.token}`}
                    type="flv"
                    play={!!currentChannel.isLive}
                    config={{
                        enableStashBuffer: false,
                        isLive: true,
                        headers: {
                            Authorization: `Bearer ${currentUser.token}`,
                        },
                    }}
                />

                {/* <HlsPlayer {...videoJsOptions} /> */}
            </Grid>

            <Grid item xs={12} md={2} style={{ overflow: 'hidden' }}>
                <ChannelChat
                    channel={currentChannel}
                    currentUser={currentUser}
                    currentChannel={currentChannel}
                    socket={socket}
                />
            </Grid>
        </Grid>
    );
};
