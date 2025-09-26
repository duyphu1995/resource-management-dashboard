import employeeApi from '@/services/hr-management/employee-management';
import { ITableHaveActionAddProps } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Layout, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LeftContent from './left-content';
import RightContent from './right-content';

const TabDetail = (props: ITableHaveActionAddProps<any>) => {
    const { isReload, moduleName } = props;

    const { id } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IEmployee>();
    const [isReloadAPIEmployee, setIsReloadAPIEmployee] = useState({});

    const getCommonInformationEmployee = async () => {
        turnOnLoading();
        try {
            const response = await employeeApi.getCommonInformationEmployee(id!, props.moduleName);
            const { succeeded, data, message } = response;
            if (succeeded) {
                setData(data);
            } else {
                showNotification(false, message);
            }
        } catch (error) {
            showNotification(false, 'Get data failed');
        } finally {
            turnOffLoading();
        }
    };
    useEffect(() => {
        if (!id) return;
        getCommonInformationEmployee();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReloadAPIEmployee, isReload, id]);

    return (
        <Layout className="detail-layout">
            {isLoading && <Spin spinning={isLoading} size="large" className="overlay-loading" />}
            <LeftContent data={data} isReload={setIsReloadAPIEmployee} moduleName={moduleName} />
            <RightContent dataProps={data} isReload={getCommonInformationEmployee} moduleName={moduleName} />
            <div className="bg bg-group" />
        </Layout>
    );
};

export default TabDetail;
