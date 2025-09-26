// hooks/useNotify.ts
import { notificationActions } from '@/redux/notification-slice';
import { useAppDispatch } from '@/redux/store';
import { useCallback } from 'react';

const useNotify = () => {
    const dispatch = useAppDispatch();

    const showNotification = useCallback(
        (succeeded: boolean | undefined, message: string, duration?: number) => {
            const type = succeeded ? 'success' : 'error';
            dispatch(notificationActions.setNotification({ type, message, duration }));
        },
        [dispatch]
    );

    return { showNotification };
};

export default useNotify;
