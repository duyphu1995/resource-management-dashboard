import Navigation from '@/components/common/navigation';
import { HRMTheme } from '@/utils/theme';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import NotificationProvider from './components/common/notification-provider';
import store, { persistor } from './redux/store';

const App = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <ConfigProvider theme={HRMTheme}>
                        <NotificationProvider>
                            <Navigation />
                        </NotificationProvider>
                    </ConfigProvider>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    );
};

export default App;
