import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { StoreProvider } from 'easy-peasy';

import App from './App';
import { store, persistor, history } from './store';

import './style.scss';

const onRedirectCallback = appState => {
    window.history.replaceState(
        {},
        document.title,
        appState && appState.targetUrl ? appState.targetUrl : window.location.pathname
    );
};

ReactDOM.render(
    <Router history={history}>
        <StoreProvider store={store}>
            <PersistGate loading={<div>Loading</div>} persistor={persistor}>
                <App />
            </PersistGate>
        </StoreProvider>
    </Router>,
    document.getElementById('app')
);
