import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStoreState } from 'easy-peasy';
import { get } from 'lodash';
import { Link } from 'react-router-dom';

import AccountCircle from '@material-ui/icons/AccountCircle';
import AppBar from '@material-ui/core/AppBar';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
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
    const user = useStoreState(state => state.Auth);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                {get(user, 'currentUser.user.username')}
                <IconButton
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    keepMounted
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem component={Link} to="/invite_user" onClick={handleClose}>
                        Invite User
                    </MenuItem>
                    <MenuItem component={Link} to="/settings" onClick={handleClose}>
                        Settings
                    </MenuItem>
                    <MenuItem component={Link} to="/logout" onClick={handleClose}>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};
