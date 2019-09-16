import React from 'react';
import { useStoreActions, useStoreDispatch } from 'easy-peasy';
import { push } from 'redux-first-history';

export default function Logout() {
    const dispatch = useStoreDispatch();
    const clearCurrentUser = useStoreActions(actions => actions.Auth.clearCurrentUser);

    clearCurrentUser();

    dispatch(push('/login'));

    return null;
}
