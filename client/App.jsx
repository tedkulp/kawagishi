import React from 'react';
import { Route, Switch } from 'react-router';

import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';

import ChannelList from './components/ChannelList';
import Login from './components/Login';
import Logout from './components/Logout';
import PrivateRoute from './components/PrivateRoute';
import Signup from './components/Signup';

export default () => (
    <>
        <CssBaseline />
        <Container component="main">
            <Switch>
                <PrivateRoute path="/" exact component={ChannelList} />
                <PrivateRoute path="/channels" component={ChannelList} />
                <Route path="/login" component={Login} />
                <Route path="/logout" component={Logout} />
                <Route path="/signup" component={Signup} />
            </Switch>
        </Container>
    </>
);
