import React, { Component, useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import flvjs from 'flv.js';

/**
 * react component wrap flv.js
 */
// class Player extends Component {
//     constructor(props) {
//         super(props);
//         this.initFlv = this.initFlv.bind(this);
//     }

//     initFlv($video) {
//         console.log(this.props);
//         if ($video) {
//             if (flvjs.isSupported()) {
//                 let flvPlayer = flvjs.createPlayer({ ...this.props }, this.props.config);
//                 flvPlayer.attachMediaElement($video);
//                 if (this.props.play) {
//                     flvPlayer.load();
//                     flvPlayer.play();
//                 }
//                 // setTimeout(() => {
//                 //     flvPlayer.play();
//                 // }, 5000);
//                 // setTimeout(() => {
//                 //     flvPlayer.play();
//                 // }, 10000);
//                 this.flvPlayer = flvPlayer;
//             }
//         }
//     }

//     componentWillUnmount() {
//         if (this.flvPlayer) {
//             this.flvPlayer.unload();
//             this.flvPlayer.detachMediaElement();
//         }
//     }

//     render() {
//         const { className, style } = this.props;
//         return (
//             <video
//                 className={className}
//                 controls={true}
//                 style={Object.assign(
//                     {
//                         width: '100%',
//                     },
//                     style
//                 )}
//                 ref={this.initFlv}
//                 // autoPlay
//             />
//         );
//     }
// }

// Player.propTypes = {
//     className: PropTypes.string,
//     style: PropTypes.object,
//     /**
//      * media URL, can be starts with 'https(s)' or 'ws(s)' (WebSocket)
//      */
//     url: PropTypes.string,
//     /**
//      * media type, 'flv' or 'mp4'
//      */
//     type: PropTypes.oneOf(['flv', 'mp4']).isRequired,
//     /**
//      * whether the data source is a **live stream**
//      */
//     isLive: PropTypes.bool,
//     /**
//      * whether to enable CORS for http fetching
//      */
//     cors: PropTypes.bool,
//     /**
//      * whether to do http fetching with cookies
//      */
//     withCredentials: PropTypes.bool,
//     /**
//      * whether the stream has audio track
//      */
//     hasAudio: PropTypes.bool,
//     /**
//      * whether the stream has video track
//      */
//     hasVideo: PropTypes.bool,
//     /**
//      * total media duration, in milliseconds
//      */
//     duration: PropTypes.bool,
//     /**
//      * total file size of media file, in bytes
//      */
//     filesize: PropTypes.number,
//     /**
//      * Optional field for multipart playback, see MediaSegment
//      */
//     segments: PropTypes.arrayOf(
//         PropTypes.shape({
//             /**
//              * indicates segment duration in milliseconds
//              */
//             duration: PropTypes.number.isRequired,
//             /**
//              * indicates segment file size in bytes
//              */
//             filesize: PropTypes.number,
//             /**
//              * indicates segment file URL
//              */
//             url: PropTypes.string.isRequired,
//         })
//     ),
//     /**
//      * @see https://github.com/Bilibili/flv.js/blob/master/docs/api.md#config
//      */
//     config: PropTypes.object,
// };

// export default Player;

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
        if (props.play) {
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
    }, [props.play]);

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
