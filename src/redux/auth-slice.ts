import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { Auth } from '../types/auth';
import { RootState } from './store';

const initialState: Auth = {
    loading: true,
    currentUser: JSON.parse(localStorage.getItem('user') || 'null'),
    expiredToken: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            // Update current user
            if (action.payload) {
                const { permission, jwToken, ...user } = action.payload;

                state.currentUser = user;
                user.permission = permission;
                localStorage.setItem('user', JSON.stringify(user));
                if (jwToken) Cookies.set('token', jwToken, { expires: 30, secure: true, sameSite: 'strict' });
            }
            // Remove current user
            else {
                state.currentUser = null;
                state.expiredToken = false;
                Cookies.remove('token');
                localStorage.removeItem('user');
            }

            return state;
        },

        setExpiredToken: (state, action) => {
            state.expiredToken = action.payload;
            return state;
        }
    }
});

export const selectAuth = (state: RootState) => state.auth;
export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
