import React from 'react';
import { Route, Switch } from 'react-router';

import CssBaseline from '@material-ui/core/CssBaseline';

import Channel from './components/Channel';
import ChannelList from './components/ChannelList';
import InviteUser from './components/InviteUser';
import Login from './components/Login';
import Logout from './components/Logout';
import PrivateRoute from './components/PrivateRoute';
import Settings from './components/Settings';
import Signup from './components/Signup';

export default () => (
    <>
        <CssBaseline />
        <Switch>
            <PrivateRoute path="/" exact showLayout showHeader component={ChannelList} />
            <PrivateRoute path="/channels" showLayout showHeader component={ChannelList} />
            <PrivateRoute path="/settings" exact showLayout showHeader component={Settings} />
            <PrivateRoute path="/invite_user" exact showLayout showHeader component={InviteUser} />
            <PrivateRoute path="/channel/:streamName" component={Channel} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/signup" component={Signup} />
        </Switch>
    </>
);
