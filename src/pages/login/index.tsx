import Avatar from '@/components/common/avatar';
import RequiredMark from '@/components/common/form/required-mark';
import pathnames from '@/pathnames';
import { authActions, selectAuth } from '@/redux/auth-slice';
import { notificationActions } from '@/redux/notification-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import authApi from '@/services/auth';
import { ICurrentUser, Login } from '@/types/auth';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import icons from '@/utils/icons';
import { Alert, Button, Checkbox, Flex, Form, Input, Popconfirm, Spin, Tooltip } from 'antd';
import Cookies from 'js-cookie';
import { Fragment, MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import eyeOnIcon from '/media/icons/eye-gray.svg';
import eyeOffIcon from '/media/icons/eye-hide-gray.svg';
import errorIcon from '/media/icons/notification/notification-error.svg';

const LoginPage = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [loginError, setLoginError] = useState(false);

    const onFinish = async (values: Login) => {
        setLoginError(false);
        turnOnLoading();

        try {
            const res = await authApi.login(values as Login);
            const { succeeded, data } = res;

            if (succeeded && data) {
                const userData = { ...res.data };
                dispatch(authActions.setCurrentUser(userData));
            } else {
                setLoginError(true);
            }
        } catch (error) {
            showNotification(false, 'Login failed');
        }

        turnOffLoading();
    };

    const currentUser = useAppSelector(selectAuth).currentUser;
    const navigation = useNavigate();

    useEffect(() => {
        // Navigate to home page if user is logged in
        if (currentUser) {
            navigation(pathnames.groupManagement.main.path + '/' + currentUser.projectId);
        }
    }, [currentUser, navigation]);

    // Create a variable to handle the case when the CAS server is not functioning.
    const variableToTest = import.meta.env.VITE_FORCE_CAS_AUTHEN;
    const boolValue = variableToTest.toLowerCase() === 'true' ? true : false;

    // Get api login CAS and Handle page redirection or login when there is information.
    const [dataCas, setDataCas] = useState<ICurrentUser | null>(null);
    const [isRemove, setIsRemove] = useState<boolean>(false);

    useEffect(() => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        const setToken = (token: string) => {
            Cookies.set('token', token, { expires: 30, secure: true, sameSite: 'strict' });
        };

        const getLoginByCAS = async () => {
            try {
                const res = await authApi.getURLRedirect();
                const { succeeded, data } = res;

                if (!data) return;

                setDataCas(data);
                setToken(data.jwToken);

                if (!succeeded && data.loginCASUrl && boolValue) {
                    window.location.href = data.loginCASUrl;
                }
            } catch (error) {
                dispatch(notificationActions.setNotification({ type: 'error', message: 'Login CAS failed' }));
            }
        };

        if (currentUser) return;

        if (isLocalhost) {
            setToken(import.meta.env.VITE_BASE_TOKEN);
        } else {
            getLoginByCAS();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRemove, dispatch, boolValue]);

    const handleClickLoginCas = async () => {
        if (!dataCas) return;
        dispatch(authActions.setCurrentUser(dataCas));
    };

    // Get api logOut CAS and remove token.
    const handleRemoveUser = async (e?: MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const res = await authApi.logOutCas();
            const { data } = res;

            if (boolValue) {
                if (data?.logoutCASUrl) {
                    window.location.href = data?.logoutCASUrl;
                }
            } else {
                setDataCas(null);
            }
            setIsRemove(true);

            Cookies.remove('token');
            localStorage.removeItem('user');
        } catch (error) {
            dispatch(notificationActions.setNotification({ type: 'success', message: 'Logout failed' }));
        }
    };
    const renderDescription = () => (
        <div>
            Are you sure you want to remove this account <b style={{ fontWeight: 'bold' }}>{dataCas?.workEmail}</b>?
        </div>
    );

    // Handle situations when the CAS server is not working.
    const handleClickServerCASNotWorking = () => {
        if (dataCas?.loginCASUrl && !boolValue) window.location.href = dataCas?.loginCASUrl;
    };
    //render UI after 500ms
    const [renderUI, setRenderUI] = useState(false);
    setTimeout(() => {
        setRenderUI(true);
        if (isRemove) setIsRemove(false);
    }, 500);

    // Reload the page if it's a revisit from the browsing history (Chrome).
    useEffect(() => {
        window.addEventListener('pageshow', function (event) {
            const historyTraversal = event.persisted || (typeof window.performance != 'undefined' && window.performance.navigation.type === 2);
            if (historyTraversal) {
                window.location.reload();
            }
        });
    }, []);

    return renderUI ? (
        <div className="login-container">
            <div className="login-content">
                <div className="login-left-content">
                    {isLoading && <Spin size="large" className="overlay-loading" />}
                    <Form
                        name="basic"
                        form={form}
                        initialValues={{ isRemember: true }}
                        onFinish={onFinish}
                        requiredMark={RequiredMark}
                        className="login-form"
                    >
                        <div className="login-header-logo">
                            <img src="/media/logo.png" alt="logo" className="login-side-logo" />
                            <div className="login-header-logo-text">HRM TOOL</div>
                        </div>
                        <div className="login-header-title">Welcome back!</div>

                        <Form.Item
                            label="Username"
                            htmlFor=""
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                            className="form-user-name"
                            normalize={value => value.trim()}
                        >
                            <Input placeholder="Enter username" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            htmlFor=""
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                            className="form-user-password"
                        >
                            <Input.Password
                                className="login-password"
                                placeholder="Enter your password"
                                iconRender={visible => (visible ? <img src={eyeOffIcon} alt="eye-off" /> : <img src={eyeOnIcon} alt="eye-on" />)}
                            />
                        </Form.Item>

                        {loginError && (
                            <Alert message="Incorrect username or password" type="error" showIcon icon={<img src={errorIcon} alt="error" />} />
                        )}

                        <Form.Item name="isRemember" valuePropName="checked" className="form-user-remember">
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        {dataCas?.badgeId && (
                            <div className="form-profile-account">
                                <Tooltip placement="top" title={'Log in with this account'}>
                                    <Form.Item className="form-information-cas">
                                        <Flex onClick={handleClickLoginCas} align="center" justify="center" gap={10} className="form-user-cas">
                                            <Avatar className="avatar avatarProfile " src={dataCas?.employeeImageUrl} />
                                            <div>
                                                {dataCas?.lastName}
                                                {` `}
                                                {dataCas?.firstName}

                                                <div className="workEmail-cas">{dataCas?.workEmail}</div>
                                            </div>
                                        </Flex>
                                    </Form.Item>
                                </Tooltip>
                                <Tooltip placement="top" title={'Remove account'}>
                                    <Popconfirm
                                        onConfirm={e => handleRemoveUser(e)}
                                        className="form-close"
                                        rootClassName="confirm-delete-acc-cas"
                                        title="Remove the account"
                                        description={renderDescription()}
                                    >
                                        <Button ghost>
                                            <img src={icons.tableAction.leave} width="20" height="20" />
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
                            </div>
                        )}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="form-user-login" loading={isLoading}>
                                Login
                            </Button>
                            {!boolValue && !dataCas?.badgeId && (
                                <Button
                                    disabled={isRemove}
                                    type="primary"
                                    className="form-user-login"
                                    loading={isLoading}
                                    onClick={handleClickServerCASNotWorking}
                                >
                                    Login By Cas
                                </Button>
                            )}
                        </Form.Item>
                        {/*
                        <div className="login-forgot-password">
                            <span>Forgot password</span>
                        </div> */}
                    </Form>
                </div>
                <div className="login-right-content">
                    <img src="/media/images/side-login-right.svg" alt="logo" />
                </div>
            </div>

            <div className="login-footer-image">
                <img src="/media/images/rectangle-login.svg" alt="logo" />
            </div>
        </div>
    ) : (
        <Fragment />
    );
};

export default LoginPage;
