import { createStore as easyCreateStore, reducer } from 'easy-peasy';
import { createBrowserHistory } from 'history';
import logger from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createReduxHistoryContext } from 'redux-first-history';

import { authModel as Auth } from './models/Auth.model';
import { channelsModel as Channels } from './models/Channels.model';
import { userModel as User } from './models/User.model';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
    history: createBrowserHistory(),
    reduxTravelling: true,
    //others options if needed
});

const middleware = [
    routerMiddleware,
    //logger,
];

export const store = easyCreateStore(
    {
        Auth,
        Channels,
        User,
        router: reducer(routerReducer),
    },
    {
        middleware,
        reducerEnhancer: reducer =>
            persistReducer(
                {
                    key: 'redux-state',
                    storage,
                    whitelist: ['Auth'],
                },
                reducer
            ),
    }
);

export const persistor = persistStore(store);
export const history = createReduxHistory(store);
