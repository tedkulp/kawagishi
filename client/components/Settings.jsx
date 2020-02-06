import React, { useEffect, useState } from 'react';
import { get, times, constant } from 'lodash';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(theme => ({
    modal: {
        // position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default props => {
    const classes = useStyles();
    const [showKey, setShowKey] = useState(false);
    const user = useStoreState(state => state.User.currentUser);
    const getMe = useStoreActions(actions => actions.User.getMe);
    const resetStreamingKey = useStoreActions(actions => actions.User.resetStreamingKey);
    const [resetModalOpen, setResetModalOpen] = React.useState(false);

    useEffect(() => {
        getMe();
    }, []);

    const toggleShowKey = () => {
        setShowKey(!showKey);
    };

    const streamKey = get(user, 'stream_key', '');

    const openResetModal = () => {
        setResetModalOpen(true);
    };

    const closeResetModal = () => {
        setResetModalOpen(false);
    };

    const runResetStreamingKey = () => {
        resetStreamingKey().then(() => {
            closeResetModal();
        });
    };

    return (
        <>
            <h1>Settings</h1>
            <div>
                <strong>Streaming Key:</strong>
                <span style={{ marginLeft: '10px', marginRight: '10px' }}>
                    {showKey ? streamKey : times(streamKey.length, constant('*')).join('')}
                </span>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={toggleShowKey}
                    style={{ marginRight: '10px' }}
                >
                    {showKey ? 'Hide' : 'Show'} Key
                </Button>
                <Button variant="outlined" color="secondary" size="small" onClick={openResetModal}>
                    Reset Key
                </Button>
            </div>
            <Dialog aria-labelledby="reset-modal" open={resetModalOpen} onClose={closeResetModal}>
                <DialogTitle id="alert-dialog-title">{'Reset Streaming Key?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        If you reset the streaming key, any software like OBS will have to be
                        updated with the new value.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeResetModal} variant="contained" color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={runResetStreamingKey}
                        variant="contained"
                        style={{ color: 'white', backgroundColor: '#f50057' }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
