import React, { useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { get, isEmpty } from 'lodash';
import durationSetup from 'moment-duration-format';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { makeStyles } from '@material-ui/core/styles';

import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

durationSetup(moment);

const useStyles = makeStyles(theme => ({
    channelList: {
        display: 'flex',
        flexFlow: 'wrap',
        marginLeft: '-10px',
    },
    channelEntry: {
        padding: '10px',
        flex: '1 0 auto',
        width: '30rem',
    },
    channelWrapper: {
        position: 'relative',
        maxWidth: '100%',
        display: 'inline-block',
    },
    channelThumb: {
        maxWidth: '100%',
    },
    liveLabel: {
        color: 'white',
        background: 'rgb(255,0,0)',
        position: 'absolute',
        fontSize: '12px',
        fontWeight: 'bold',
        left: '10px',
        top: '10px',
        padding: '0 5px 0 5px',
    },
    liveTime: {
        color: 'white',
        background: 'rgba(0,0,0,.5)',
        position: 'absolute',
        fontSize: '12px',
        fontWeight: 'bold',
        right: '10px',
        top: '10px',
        padding: '0 5px 0 5px',
    },
}));

export default () => {
    const classes = useStyles();
    const channels = useStoreState(state => state.Channels.channels);
    const getChannels = useStoreActions(actions => actions.Channels.getChannels);

    useEffect(() => {
        getChannels();
    }, []);

    const calcDuration = seconds => {
        if (seconds > 60 * 60) {
            return moment.duration(seconds, 'seconds').format('h[h]:m[m]');
        } else {
            return moment.duration(seconds, 'seconds').format('m[m]:s[s]');
        }
    };

    return (
        <>
            <h1>Live Channels</h1>

            <div className={classes.channelList}>
                {isEmpty(channels) && (
                    <h3 style={{ marginTop: '20px', marginLeft: '10px' }}>
                        No one is streaming. :(
                    </h3>
                )}
                {!isEmpty(channels) &&
                    Object.values(channels).map(channel => (
                        <div
                            key={`channel-${channel.publisher.stream}`}
                            className={classes.channelEntry}
                        >
                            <div className={classes.channelWrapper}>
                                <span className={classes.liveLabel}>LIVE</span>
                                <span className={classes.liveTime}>
                                    {calcDuration(channel.publisher.duration)}
                                </span>
                                <MuiLink
                                    component={Link}
                                    to={`/channel/${channel.publisher.stream}`}
                                >
                                    <img
                                        className={classes.channelThumb}
                                        src={`/thumbnails/${channel.publisher.stream}.png`}
                                    />
                                </MuiLink>
                                <MuiLink
                                    href={`/channel/${channel.publisher.stream}`}
                                    style={{ display: 'block' }}
                                    underline="none"
                                    color="textPrimary"
                                >
                                    <Typography color="primary" variant="subtitle1" color="inherit">
                                        {get(channel, 'publisher.user.channel_title')}
                                    </Typography>
                                </MuiLink>
                                <MuiLink
                                    href={`/channel/${channel.publisher.stream}`}
                                    style={{ display: 'block' }}
                                    underline="none"
                                    color="textPrimary"
                                >
                                    <Typography color="primary" variant="subtitle2" color="inherit">
                                        {channel.publisher.stream}
                                    </Typography>
                                </MuiLink>
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
};
