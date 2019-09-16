import React from 'react';
import { useStoreState } from 'easy-peasy';
import { Route, Redirect } from 'react-router-dom';

// import DelayedRedirect from './DelayedRedirect';

const PrivateRoute = ({ component: Component, path, ...rest }) => {
    const currentUser = useStoreState(state => state.Auth.currentUser);

    return (
        <Route
            {...rest}
            render={props =>
                currentUser ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
};

export default PrivateRoute;
