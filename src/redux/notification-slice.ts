import { INotification } from '@/types/notification';
import { IReduxAction } from '@/types/redux';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

const initialState: INotification | null = null;

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotification: (state: any, action: IReduxAction<INotification | null | unknown>) => {
            state = action.payload;
            return state;
        }
    }
});

export const selectNotification = (state: RootState) => state.notification;
export const notificationActions = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
