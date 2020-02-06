import React, { Component, useRef, useEffect, useState, useCallback } from 'react';
import flvjs from 'flv.js';

const loadPlayer = ($video, setFlvPlayer, setVideo, props) => {
    if ($video) {
        setVideo($video);
        if (flvjs.isSupported()) {
            const flvPlayerElement = flvjs.createPlayer({ ...props }, props.config);
            setFlvPlayer(flvPlayerElement);
        }
    }
};

export default props => {
    const { className, style } = props;
    const [flvPlayer, setFlvPlayer] = useState();
    const [video, setVideo] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const initFlv = useCallback($video => {
        loadPlayer($video, setFlvPlayer, setVideo, props);
    }, []);

    const unloadPlayer = () => {
        if (flvPlayer) {
            flvPlayer.unload();
            flvPlayer.detachMediaElement();
            setFlvPlayer(undefined);
        }
    };

    useEffect(() => {
        if (props.play && flvPlayer && !flvPlayer._mediaElement) {
            flvPlayer.attachMediaElement(video);
            flvPlayer.load();
            flvPlayer.play().catch(err => {
                console.error('err', err);
            });
        } else {
            if (flvPlayer) {
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
            }
        }
    }, [flvPlayer, props.play]);

    useEffect(() => {
        return () => {
            unloadPlayer();
        };
    }, []);

    return (
        <video
            className={className}
            controls={true}
            style={Object.assign(
                {
                    width: '100%',
                },
                style
            )}
            ref={initFlv}
            // autoPlay
        />
    );
};
