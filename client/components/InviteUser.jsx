import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStoreState, useStoreActions } from 'easy-peasy';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    error: {
        color: 'red',
    },
}));

const useForm = callback => {
    const [inputs, setInputs] = useState({
        email: '',
    });

    const handleSubmit = event => {
        if (event) {
            event.preventDefault();
        }

        callback(inputs);
    };

    const handleInputChange = event => {
        event.persist();
        setInputs(inputs => ({ ...inputs, [event.target.name]: event.target.value }));
    };

    return {
        handleSubmit,
        handleInputChange,
        inputs,
    };
};

export default props => {
    const classes = useStyles();
    const errorMessage = useStoreState(state => state.User.error);
    const msg = useStoreState(state => state.User.msg);
    const [doInvite, clearMsg] = useStoreActions(actions => [
        actions.User.inviteUser,
        actions.User.clearMsg,
    ]);
    const { inputs, handleInputChange, handleSubmit } = useForm(doInvite);

    useEffect(() => {
        clearMsg();
    }, []);

    return (
        <Container component="main" maxWidth="xs">
            <h1>Invite User</h1>
            {errorMessage &&
                errorMessage.map(e => (
                    <Typography className={classes.error} component="h2" variant="h6" key={e.msg}>
                        {e.msg}
                    </Typography>
                ))}
            {msg && (
                <Typography component="h2" variant="h6">
                    {msg}
                </Typography>
            )}
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    onChange={handleInputChange}
                    value={inputs.email}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                >
                    Send Invite
                </Button>
            </form>
        </Container>
    );
};
