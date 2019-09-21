import React, { useEffect } from 'react';
import moment from 'moment';
import durationSetup from 'moment-duration-format';
import { useStoreState, useStoreActions } from 'easy-peasy';

import { authReq } from '../api';

import Link from '@material-ui/core/Link';

durationSetup(moment);

export default () => {
    const channels = useStoreState(state => state.Channels.channels);
    const getChannels = useStoreActions(actions => actions.Channels.getChannels);

    useEffect(() => {
        getChannels();
        // authReq('get', '/streams/ted').then(res => {
        //     console.log(res);
        // });
    }, []);

    const calcDuration = seconds => {
        if (seconds > 60 * 60) {
            return moment.duration(seconds, 'seconds').format('mm[m]:ss[s]');
        } else {
            return moment.duration(seconds, 'seconds').format('hh[h]:mm[m]:ss[s]');
        }
    };

    return (
        <>
            <h1>This is the channel list...!</h1>

            {channels &&
                Object.values(channels).map(channel => (
                    <div key={`channel-${channel.publisher.stream}`}>
                        <h3>
                            <Link href={`/channel/${channel.publisher.stream}`}>
                                {channel.publisher.stream}
                            </Link>
                        </h3>
                        <p>
                            Streaming for:{' '}
                            <strong>{calcDuration(channel.publisher.duration)}</strong>
                        </p>
                    </div>
                ))}

            <Link href="/logout">Logout</Link>
        </>
    );
};
