import React from 'react';
import videojs from 'video.js';
import _ from 'videojs-flash';

export default class HlsPlayer extends React.Component {
    componentDidMount() {
        this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
            console.log('onPlayerReady', this);
        });
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }

    render() {
        return (
            <div>
                <div data-vjs-player>
                    <video ref={node => (this.videoNode = node)} className="video-js" />
                </div>
            </div>
        );
    }
}
