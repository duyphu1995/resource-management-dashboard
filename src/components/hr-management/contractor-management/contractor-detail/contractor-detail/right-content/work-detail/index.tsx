import { ITableHaveActionAddProps } from '@/types/common';
import TableContractorContract from './table-contractor-contract';
import TableWorkExperienceBeforeTMAContractor from './table-work-experience-before-tma-contractor';
import contractorApi from '@/services/hr-management/contractor-management';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import React, { useEffect, useMemo, useState } from 'react';
import { IWorkingExperienceBeforeTMA } from '@/types/hr-management/employee-management';
import { IContract } from '@/types/hr-management/contract-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';

const ContractorWorkDetail = (props: ITableHaveActionAddProps<any>) => {
    const { dataProps } = props;
    const { employeeId } = dataProps || {};
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();

    const [contracts, setContracts] = useState<IContract[]>([]);
    const [workExperienceBeforeTMA, setWorkExperienceBeforeTMA] = useState<IWorkingExperienceBeforeTMA[]>([]);

    const fetchData = async (apiCall: any, setData: any) => {
        try {
            turnOnLoading();
            const response = await apiCall();
            const { succeeded, data } = response;

            if (succeeded && data) {
                setData(data);
            }
        } catch (error) {
            showNotification(false, 'Get data failed');
        } finally {
            turnOffLoading();
        }
    };

    const getContracts = () => fetchData(() => contractorApi.getContracts(employeeId), setContracts);
    const getWorkExperiencesBeforeTMA = () => fetchData(() => contractorApi.getWorkExperiencesBeforeTMA(employeeId), setWorkExperienceBeforeTMA);

    const sections = [
        {
            content: <TableContractorContract dataProps={dataProps} contracts={contracts} setIsReload={getContracts} />,
            permission: 'ContractorContract',
            apiCall: getContracts
        },
        {
            content: (
                <TableWorkExperienceBeforeTMAContractor
                    dataProps={dataProps}
                    employments={workExperienceBeforeTMA}
                    setIsReload={getWorkExperiencesBeforeTMA}
                />
            ),
            permission: 'WorkExperienceBeforeTMA',
            apiCall: getWorkExperiencesBeforeTMA
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};

    const sectionsFiltered = useMemo(() => {
        return sections.filter(tab => !!findSectionByNameSection(permission, tab.permission, 'ContractorManagement'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permission]);

    const callApisBasedOnPermissions = async () => {
        try {
            await Promise.all(sectionsFiltered.map(tab => tab.apiCall()));
        } catch (error) {
            console.error('Error calling APIs:', error);
        }
    };

    useEffect(() => {
        if (sectionsFiltered.length > 0) {
            callApisBasedOnPermissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionsFiltered.length]);

    return (
        <div className="work-detail">
            {sectionsFiltered.map(item => (
                <React.Fragment key={item.permission}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default ContractorWorkDetail;
