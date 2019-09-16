import React, { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { makeStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
// import Checkbox from '@material-ui/core/Checkbox';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    '@global': {
        body: {
            backgroundColor: theme.palette.common.white,
        },
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    error: {
        color: 'red',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const useSignupForm = (doSignup, setCurrentUser) => {
    const [inputs, setInputs] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = event => {
        if (event) {
            event.preventDefault();
        }

        doSignup(inputs);
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

export default function Signup() {
    const classes = useStyles();

    const errorMessage = useStoreState(state => state.Auth.signupError);
    const doSignup = useStoreActions(actions => actions.Auth.doSignup);
    const setCurrentUser = useStoreActions(actions => actions.Auth.setCurrentUser);

    const { inputs, handleInputChange, handleSubmit } = useSignupForm(doSignup, setCurrentUser);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>
                {errorMessage && (
                    <Typography className={classes.error} component="h2" variant="h6">
                        {errorMessage.toString()}
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
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        // autoComplete="current-password"
                        onChange={handleInputChange}
                        value={inputs.password}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Password (again)"
                        type="password"
                        id="confirm-password"
                        // autoComplete="current-password"
                        onChange={handleInputChange}
                        value={inputs.confirmPassword}
                    />
                    {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Create Account
                    </Button>
                    <Grid container>
                        <Grid item xs></Grid>
                        <Grid item>
                            <Link href="/login" variant="body2">
                                {'Already have an account? Sign In'}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
}
