import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'videojs-flvjs-es6';

export default props => {
    const [player, setPlayer] = useState();
    const videoNode = useRef();

    useEffect(() => {
        // if (player) {
        if (props.isLive) {
            let currentPlayer = player;
            console.log('--> #1', player);
            if (!currentPlayer || currentPlayer.isDisposed()) {
                console.log('creating player');
                currentPlayer = videojs(videoNode.current, props);
                setPlayer(currentPlayer);
            }

            console.log('currentPlayer', currentPlayer);
            setTimeout(() => {
                currentPlayer.play();
            });
        } else {
            // if (!player.paused()) {
            console.log('--> #2', player);
            if (player && !player.isDisposed()) {
                player.dispose();
            }
            // }
        }
        // }
    }, [player, props]);

    useEffect(() => {
        if (props.isLive) {
            const currentPlayer = videojs(videoNode.current, props);
            setPlayer(currentPlayer);
        }

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
            }
        };
    }, [videoNode]);

    return (
        <div style={{ height: '100%' }}>
            <div data-vjs-player style={{ height: '100%' }}>
                <video
                    ref={videoNode}
                    className="video-js"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};
