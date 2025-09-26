import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { IPermission } from '@/types/auth';

const initialState: IPermission[] = [];

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {
        setPermission: (state, action: PayloadAction<IPermission[]>) => {
            state = action.payload;
            return state;
        }
    }
});

export const selectPermission = (state: RootState) => state.permission;
export const permissionActions = permissionSlice.actions;
export const permissionReducer = permissionSlice.reducer;
