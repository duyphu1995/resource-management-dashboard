import pathnames from '@/pathnames';
import { selectAuth } from '@/redux/auth-slice';
import { permissionActions } from '@/redux/permission-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import authApi from '@/services/auth';
import { IPermission } from '@/types/auth';
import { getDecryptedItem, setEncryptedItem } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface IPermissionState {
    permission: IPermission[];
}

const LayoutContainer = ({ children, requiredLogin }: { children: ReactNode; requiredLogin: boolean }) => {
    const currentUser = useAppSelector(selectAuth).currentUser;
    const navigation = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { showNotification } = useNotify();

    const [checkedLogin, setCheckedLogin] = useState(false);
    const [dataPermission, setDataPermission] = useState<IPermissionState>();

    useLayoutEffect(() => {
        const body = document.querySelector('#id-body');
        if (body) {
            body.scrollTo({ top: 0 });
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!currentUser && requiredLogin) {
            navigation(pathnames.login.path);
            setCheckedLogin(true);
        } else {
            setCheckedLogin(true);
        }
    }, [currentUser, navigation, requiredLogin]);

    useEffect(() => {
        const storedPermission = getDecryptedItem('permission') || { permission: [] };
        setDataPermission(storedPermission);
        dispatch(permissionActions.setPermission(storedPermission.permission));

        const fetchAndSetPermissions = async () => {
            try {
                const res = await authApi.getPermission();
                const { succeeded, data } = res;

                if (succeeded && data) {
                    const updatedUserData = { permission: data?.menus || [] };
                    setDataPermission(updatedUserData);
                    setEncryptedItem('permission', updatedUserData);
                    dispatch(permissionActions.setPermission(data?.menus || []));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch permissions');
            }
        };

        if (!storedPermission.permission.length && currentUser && requiredLogin) {
            fetchAndSetPermissions();
        }
    }, [showNotification, dispatch, requiredLogin, currentUser]);

    if (!dataPermission?.permission.length && requiredLogin) {
        return null;
    }

    return checkedLogin && children;
};

export default LayoutContainer;
