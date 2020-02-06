import React from 'react';
import { useStoreState } from 'easy-peasy';
import { Route, Redirect } from 'react-router-dom';

import Container from '@material-ui/core/Container';

import Header from './Header';

const PrivateRoute = ({
    component: Component,
    showLayout = false,
    showHeader = false,
    ...rest
}) => {
    const currentUser = useStoreState(state => state.Auth.currentUser);

    return (
        <Route
            {...rest}
            render={props =>
                currentUser ? (
                    <>
                        {showHeader && <Header />}
                        {showLayout ? (
                            <Container component="main" maxWidth="xl" style={{ marginTop: '10px' }}>
                                <Component {...props} />
                            </Container>
                        ) : (
                            <Component {...props} />
                        )}
                    </>
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    );
};

export default PrivateRoute;
