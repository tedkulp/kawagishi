import React, { useState, useEffect, createRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { get } from 'lodash';

import Box from '@material-ui/core/Box';

const CHANNEL_SCROLLBACK_LENGTH = 250;
// let i = 0;
let themeObj = null;

const useStyles = makeStyles(theme => {
    themeObj = theme;
    return {
        chatBox: {
            backgroundColor: '#ddd',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        messageBox: {
            overflowY: 'auto',
            display: 'flex',
            flex: '1',
            flexDirection: 'column',
            padding: '5px',
        },
        messageRow: {
            width: '100%',
        },
        messageInput: {
            width: '100%',
            padding: 0,
            margin: 0,
        },
    };
});

export default props => {
    const classes = useStyles();
    const { socket, currentUser, currentChannel } = props;

    // console.log('props', socket, currentUser, currentChannel);

    const [messages, setMessages] = useState([]);
    const [previousMessage, setPreviousMessage] = useState('');
    const [chatMessage, setChatMessage] = useState('');

    let box = createRef();

    useEffect(() => {
        // TODO: Make this only happen if they are scrolled all the way down
        const scrollHeight = box.current.scrollHeight;
        const height = box.current.clientHeight;
        const maxScrollTop = scrollHeight - height;

        box.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }, [messages]);

    const createUUID = () => {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = '0123456789abcdef';
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = '-';

        var uuid = s.join('');
        return uuid;
    };

    // Called the first render
    useEffect(() => {
        socket.on('broadcast message', val => {
            val.id = createUUID();

            setMessages(messages => {
                if (messages.length >= CHANNEL_SCROLLBACK_LENGTH) {
                    return [...messages.slice(1), val];
                } else {
                    return [...messages, val];
                }
            });
        });

        return () => {
            // No op?
        };
    }, []);

    const chatMessageOnChange = e => {
        setChatMessage(e.target.value);
    };

    const chatMessageSendMessage = e => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            if (chatMessage && chatMessage !== '') {
                const msg = {
                    channelId: get(currentChannel, 'user.id') || get(currentChannel, 'user._id'),
                    channelName: get(currentChannel, 'user.username'),
                    userId: get(currentUser, 'user.id') || get(currentUser, 'user._id'),
                    username: get(currentUser, 'user.username'),
                    message: chatMessage,
                };
                socket.emit('new message', msg);
                setChatMessage('');
                setPreviousMessage(chatMessage);
            }
        }

        if (e.keyCode === 38) {
            e.preventDefault();
            setChatMessage(previousMessage);
        }
    };

    return (
        // <Box height={props.height - themeObj.spacing(0.5)} className={classes.chatBox}>
        <Box className={classes.chatBox}>
            <div className={classes.messageBox} ref={box}>
                {(messages || []).map(msg => (
                    <div key={msg.id} className={classes.messageRow}>
                        {msg.username}: {msg.message}
                    </div>
                ))}
            </div>
            <div>
                <textarea
                    rows="2"
                    className={classes.messageInput}
                    value={chatMessage}
                    onChange={chatMessageOnChange}
                    onKeyDown={chatMessageSendMessage}
                />
            </div>
        </Box>
    );
};
