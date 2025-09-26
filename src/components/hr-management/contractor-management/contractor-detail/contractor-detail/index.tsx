import contractorService from '@/services/hr-management/contractor-management';
import { ITableHaveActionAddProps } from '@/types/common';
import { IContractor } from '@/types/hr-management/contractor-management';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Layout, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContractorDetailLeftContent from './left-content';
import ContractorDetailRightContent from './right-content';

const ContractorDetail = (props: ITableHaveActionAddProps<any>) => {
    const { isReload } = props;

    const { contractorId = '' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataContractor, setDataContractor] = useState<IContractor>();
    const [isReloadAPIEmployee, setIsReloadAPIEmployee] = useState({});

    useEffect(() => {
        turnOnLoading();
        const getContractor = async () => {
            try {
                const res = await contractorService.getContractorInforCommon(contractorId);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    const isContractorDisabled = ['Convert to Employee', 'End Contractor'].includes(data.contractorStatus || '');
                    setDataContractor({ ...data, isContractorDisabled });
                }
            } catch (error) {
                showNotification(false, 'Get contractor failed');
            } finally {
                turnOffLoading();
            }
        };

        getContractor();
    }, [isReloadAPIEmployee, isReload, contractorId, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <Layout className="detail-layout">
            {isLoading && <Spin spinning={isLoading} size="large" className="overlay-loading" />}
            <ContractorDetailLeftContent dataProps={dataContractor} isReload={setIsReloadAPIEmployee} />
            <ContractorDetailRightContent dataProps={dataContractor} setIsReload={setIsReloadAPIEmployee} />
            <div className="bg bg-group" />
        </Layout>
    );
};

export default ContractorDetail;
