import React, { useEffect, useState, createRef } from 'react';
import { get, debounce } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
// import moment from 'moment';
import { useStoreState, useStoreActions } from 'easy-peasy';
import useResizeObserver from 'use-resize-observer';

import ChannelChat from './ChannelChat';
import FlvPlayer from './players/FlvPlayer';
import Header from './Header';
import HlsPlayer from './players/HlsPlayer';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import io from 'socket.io-client';

const socket = io();

const useStyles = makeStyles(theme => ({
    chatArrow: {
        color: '#fff',
        cursor: 'pointer',
    },
    chatArrowWrapper: {
        position: 'absolute',
        right: '10px',
        top: '10px',
        zIndex: 10,
    },
    channelPage: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    headerText: {
        marginBottom: 0,
        color: '#fff',
    },
    mainRow: {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
    },
    metainfo: {
        backgroundColor: '#070707',
        padding: '15px',
    },
    playerColumn: {
        height: '100%',
        flexGrow: 1,
        display: 'flex',
        backgroundColor: '#000',
        flexDirection: 'column',
    },
    playerWrapper: {
        position: 'relative',
        height: '100%',
    },
    player: {
        width: '100%',
        top: 0,
        left: 0,
        position: 'absolute',
        height: '100%',
    },
}));

export default props => {
    const [showChat, setShowChat] = useState(true);
    const classes = useStyles();
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

    const wsUrlPrefix = [window.location.protocol, window.location.host]
        .join('//')
        .replace('http', 'ws');

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        html5: {
            flvjsConfig: {
                isLive: true,
                enableStashBuffer: false,
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            },
        },
        flvjs: {
            mediaDataSource: {
                isLive: true,
                // cors: true,
                // withCredentials: false,
                enableStashBuffer: false,
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            },
        },
        sources: [
            // {
            //     src: `${wsUrlPrefix}/live/${streamName}.flv?token=${currentUser.token}`,
            //     type: 'video/x-flv',
            // },
            {
                src: `/live/${streamName}/index.m3u8?token=${currentUser.token}`,
                type: 'application/x-mpegURL',
            },
        ],
    };

    return (
        <div className={classes.channelPage}>
            <Header />

            <div className={classes.mainRow}>
                <div className={classes.playerColumn}>
                    <div className={classes.playerWrapper} ref={playerWrapper}>
                        <div
                            className={classes.chatArrowWrapper}
                            title={showChat ? 'Hide Chat' : 'Show Chat'}
                        >
                            {showChat ? (
                                <ArrowForwardIcon
                                    className={classes.chatArrow}
                                    onClick={() => setShowChat(false)}
                                />
                            ) : (
                                <ArrowBackIcon
                                    className={classes.chatArrow}
                                    onClick={() => setShowChat(true)}
                                />
                            )}
                        </div>
                        <FlvPlayer
                            url={`${wsUrlPrefix}/live/${streamName}.flv?token=${currentUser.token}`}
                            type="flv"
                            play={!!currentChannel.isLive}
                            isLive={true}
                            enableStashBuffer={false}
                            isMuted={false}
                            // config={{
                            //     enableStashBuffer: false,
                            //     isLive: true,
                            //     headers: {
                            //         Authorization: `Bearer ${currentUser.token}`,
                            //     },
                            // }}
                            className={classes.player}
                        />
                        {/* <HlsPlayer
                            isLive={!!currentChannel.isLive}
                            className={classes.player}
                            {...videoJsOptions}
                        /> */}
                    </div>
                    <div className={classes.metainfo}>
                        <h1 className={classes.headerText}>
                            {get(currentChannel, 'user.channel_title')}
                        </h1>
                    </div>
                </div>

                <ChannelChat
                    channel={currentChannel}
                    currentUser={currentUser}
                    currentChannel={currentChannel}
                    socket={socket}
                    showChat={showChat}
                />
            </div>
        </div>
    );
};
