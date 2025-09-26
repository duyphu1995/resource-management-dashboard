import { selectNotification } from '@/redux/notification-slice';
import { useAppSelector } from '@/redux/store';
import { notification } from 'antd';
import { ReactNode, useEffect } from 'react';

const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const notificationRedux = useAppSelector(selectNotification);
    const [api, contextHolder] = notification.useNotification({ maxCount: 1, placement: 'bottomRight' });

    useEffect(() => {
        if (notificationRedux) {
            const openNotification = () => {
                const { type = 'error', message = '', duration = 4 } = notificationRedux;
                const icon = <img src={`/media/icons/notification/notification-${type}.svg`} />;

                api[type]({ message: <span style={{ fontSize: '16px' }}>{message}</span>, duration, icon });
            };

            openNotification();
        }
    }, [notificationRedux, api]);

    return (
        <>
            {children}
            {contextHolder}
        </>
    );
};

export default NotificationProvider;
