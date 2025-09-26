import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface IGroupManaged {
    isManaged: boolean;
}

const initialState: IGroupManaged = {
    isManaged: false
};

const groupManagedSlice = createSlice({
    name: 'group-management',
    initialState,
    reducers: {
        setGroupManaged: (state, action: PayloadAction<IGroupManaged>) => {
            state = action.payload;
            return state;
        }
    }
});

export const selectGroupManagement = (state: RootState) => state.groupManaged;
export const groupManagedSliceActions = groupManagedSlice.actions;
export const groupManagedSliceReducer = groupManagedSlice.reducer;
