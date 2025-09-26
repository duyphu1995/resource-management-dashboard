import { ITableHaveActionAddProps } from '@/types/common';
import ContractorInformationDetail from './information-detail';
import TableHealthTrackingContractor from './table-health-tracking-contractor';
import TableEducationContractor from './table-education-contractor';
import React, { useEffect, useMemo, useState } from 'react';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import useLoading from '@/utils/hook/useLoading';
import contractorApi from '@/services/hr-management/contractor-management';
import { IEducation, IHealthTracking } from '@/types/hr-management/employee-management';
import { IContractor } from '@/types/hr-management/contractor-management';
import { useParams } from 'react-router-dom';

const ContractorPersonalDetail = (props: ITableHaveActionAddProps<any>) => {
    const { dataProps, setIsReload } = props;
    const { employeeId } = dataProps || {};
    const { contractorId = '' } = useParams();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();
    const [personalInformation, setPersonalInformation] = useState<IContractor>();
    const [healthTrackings, setHealthTrackings] = useState<IHealthTracking[]>([]);
    const [educations, setEducations] = useState<IEducation[]>([]);

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

    const getPersonalInformation = () => fetchData(() => contractorApi.getPersonalInformation(contractorId), setPersonalInformation);
    const getHealthTracking = () => fetchData(() => contractorApi.getHealthTracking(employeeId), setHealthTrackings);
    const getEducations = () => fetchData(() => contractorApi.getEducations(employeeId), setEducations);

    const sections = [
        {
            content: (
                <ContractorInformationDetail
                    dataProps={{ ...personalInformation, isContractorDisabled: dataProps?.isContractorDisabled }}
                    setIsReload={() => {
                        if (setIsReload) {
                            setIsReload({});
                        }
                        getPersonalInformation();
                    }}
                />
            ),
            permission: 'InformationDetails',
            apiCall: getPersonalInformation
        },
        {
            content: <TableHealthTrackingContractor dataProps={dataProps} healthTrackings={healthTrackings} setIsReload={getHealthTracking} />,
            permission: 'HealthTracking',
            apiCall: getHealthTracking
        },
        {
            content: <TableEducationContractor dataProps={dataProps} educations={educations} setIsReload={getEducations} />,
            permission: 'Education',
            apiCall: getEducations
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
        if (sectionsFiltered.length > 0 && employeeId) {
            callApisBasedOnPermissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionsFiltered.length, employeeId]);

    return (
        <div className="personal-detail">
            {sectionsFiltered.map(item => (
                <React.Fragment key={item.permission}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default ContractorPersonalDetail;
