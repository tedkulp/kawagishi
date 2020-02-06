import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import MuiLink from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    icon: {
        marginRight: theme.spacing(2),
    },
    grow: {
        flexGrow: 1,
    },
}));

export default () => {
    const classes = useStyles();

    return (
        <AppBar position="relative">
            <Toolbar>
                <CameraIcon className={classes.icon} />
                <Typography variant="h6" color="inherit" noWrap>
                    <MuiLink component={Link} color="inherit" to="/">
                        Streaming Site
                    </MuiLink>
                </Typography>
                <div className={classes.grow} />
                <Typography variant="h6" color="inherit" noWrap>
                    <MuiLink component={Link} color="inherit" to="/settings">
                        Settings
                    </MuiLink>
                    &nbsp; &nbsp; &nbsp;
                    <MuiLink component={Link} color="inherit" to="/logout">
                        Logout
                    </MuiLink>
                </Typography>
            </Toolbar>
        </AppBar>
    );
};
