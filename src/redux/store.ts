import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authReducer } from './auth-slice';
import { groupManagedSliceReducer } from './group-managed-slice';
import { notificationReducer } from './notification-slice';
import { permissionReducer } from './permission-slice';
import { searchParamsReducer } from './search-params-slice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['searchParams']
};

const rootReducer = combineReducers({
    auth: authReducer,
    notification: notificationReducer,
    searchParams: searchParamsReducer,
    permission: permissionReducer,
    groupManaged: groupManagedSliceReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
                ignoredPaths: ['persist.purge']
            }
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = useSelector;

export default store;
