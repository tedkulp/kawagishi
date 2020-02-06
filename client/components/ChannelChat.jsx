import React, { useState, useEffect, createRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { get } from 'lodash';

const CHANNEL_SCROLLBACK_LENGTH = 250;

const useStyles = makeStyles(theme => ({
    chatBox: {
        backgroundColor: '#ddd',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '250px',
        borderLeft: '1px #000 solid',
    },
    messageBox: {
        flexGrow: 1,
        padding: '5px',
        position: 'relative',
        backgroundColor: '#070707',
        color: '#fff',
    },
    messagesWrapper: {
        overflowY: 'auto',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    messageRow: {
        width: '100%',
        paddingLeft: '5px',
        paddingRight: '5px',
    },
    messageInput: {
        width: '100%',
        padding: 0,
        margin: 0,
        backgroundColor: '#000',
        color: '#fff',
    },
}));

export default props => {
    const classes = useStyles();
    const { socket, currentUser, currentChannel, showChat = false } = props;

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
        <div className={classes.chatBox} style={{ display: showChat ? 'flex' : 'none' }}>
            <div className={classes.messageBox}>
                <div className={classes.messagesWrapper} ref={box}>
                    {(messages || []).map(msg => (
                        <div key={msg.id} className={classes.messageRow}>
                            {msg.username}: {msg.message}
                        </div>
                    ))}
                </div>
            </div>

            <textarea
                rows="2"
                className={classes.messageInput}
                value={chatMessage}
                onChange={chatMessageOnChange}
                onKeyDown={chatMessageSendMessage}
                placeholder={`Type to chat...`}
            />
        </div>
    );
};
