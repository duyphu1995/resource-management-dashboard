import employeeApi from '@/services/hr-management/employee-management';
import { ITableHaveActionAddProps } from '@/types/common';
import { IContract } from '@/types/hr-management/contract-management';
import { IEmployee, IOnsiteHistory, IProject, IWorkingExperienceBeforeTMA } from '@/types/hr-management/employee-management';
import { ICommitments } from '@/types/hr-management/onsite-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';
import TableCommitment from './table-commitment';
import TableContract from './table-contract';
import TableOnsiteHistory from './table-onsite-history';
import TableProject from './table-project';
import TableWorkExperienceBeforeTMA from './table-work-experience-before-tma';
import TableWorkingStatus from './table-working-status';

const WorkDetail: React.FC<ITableHaveActionAddProps<IEmployee>> = ({ dataProps, isReload, moduleName }) => {
    const { joinDate = '', statusName = '' } = dataProps || {};

    const { id = '' } = useParams();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();
    const nameFromUrl = useGetNameFromUrl();

    // Permission
    const { havePermission } = usePermissions('Experience', nameFromUrl);

    const [workExperience, setWorkExperience] = useState<IEmployee>();
    const [projects, setProjects] = useState<IProject[]>([]);
    const [temporaryLeaves, setTemporaryLeaves] = useState<any[]>([]);
    const [onsiteHistories, setOnsiteHistories] = useState<IOnsiteHistory[]>([]);
    const [commitments, setCommitments] = useState<ICommitments[]>([]);
    const [contracts, setContracts] = useState<IContract[]>([]);
    const [workExperienceBeforeTMA, setWorkExperienceBeforeTMA] = useState<IWorkingExperienceBeforeTMA[]>([]);

    useEffect(() => {
        if (havePermission('View')) {
            getWorkExperience();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statisticalData = [
        {
            label: 'Experience Before TMA (Months)',
            value: workExperience?.beforeWorkExp
        },
        {
            label: 'Experience In TMA (Months)',
            value: workExperience?.currentWorkExp
        },
        {
            label: 'Total Experience (Months)',
            value: workExperience?.totalWorkExp
        }
    ];

    const fetchData = async (apiCall: any, setData: any) => {
        try {
            turnOnLoading();
            const response = await apiCall();
            const { succeeded, data, message } = response;

            if (succeeded && data) {
                setData(data);
            }

            if (!succeeded) {
                showNotification(false, message);
            }
        } catch (error) {
            showNotification(false, 'Get data failed');
        } finally {
            turnOffLoading();
        }
    };

    const getWorkExperience = () => fetchData(() => employeeApi.getWorkExperience(id, moduleName), setWorkExperience);
    const getProjects = () => fetchData(() => employeeApi.getProjects(id, moduleName), setProjects);
    const getTemporaryLeaves = () => fetchData(() => employeeApi.getTemporaryLeaves(id, moduleName), setTemporaryLeaves);
    const getOnsiteHistories = () => fetchData(() => employeeApi.getOnsiteHistories(id, moduleName), setOnsiteHistories);
    const getCommitments = () => fetchData(() => employeeApi.getCommitments(id, moduleName), setCommitments);
    const getContracts = () => fetchData(() => employeeApi.getContracts(id, moduleName), setContracts);
    const getWorkExperiencesBeforeTMA = () => fetchData(() => employeeApi.getWorkExperiencesBeforeTMA(id, moduleName), setWorkExperienceBeforeTMA);

    const sections = [
        {
            content: (
                <TableProject
                    dataProps={projects}
                    statusName={statusName}
                    setIsReload={() => {
                        isReload();
                        getProjects();
                    }}
                    moduleName={moduleName}
                />
            ),
            permission: 'Projects',
            apiCall: getProjects
        },
        {
            content: <TableWorkingStatus dataProps={temporaryLeaves} />,
            permission: 'WorkingStatus',
            apiCall: getTemporaryLeaves
        },
        {
            content: <TableOnsiteHistory dataProps={onsiteHistories} />,
            permission: 'OnsiteHistory',
            apiCall: getOnsiteHistories
        },
        {
            content: <TableCommitment dataProps={commitments} />,
            permission: 'Commitment',
            apiCall: getCommitments
        },
        {
            content: <TableContract dataProps={contracts} />,
            permission: 'Contract',
            apiCall: getContracts
        },
        {
            content: (
                <TableWorkExperienceBeforeTMA
                    dataProps={workExperienceBeforeTMA}
                    joinDate={joinDate}
                    fullName={dataProps?.fullName}
                    setIsReload={() => {
                        getWorkExperiencesBeforeTMA();
                        getWorkExperience();
                        isReload();
                    }}
                    moduleName={moduleName}
                />
            ),
            permission: 'WorkExperienceBeforeTMA',
            apiCall: getWorkExperiencesBeforeTMA
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const sectionsFiltered = useMemo(() => {
        return sections.filter(tab => !!findSectionByNameSection(permission, tab.permission, nameFromUrl));
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
            {havePermission('View') && (
                <div className="statistical">
                    {statisticalData?.map((item, index: number) => {
                        const { label, value } = item || {};
                        return (
                            <div className="statistical__item" key={index}>
                                <p className="statistical__label">{label}</p>
                                <span className="statistical__value">{value}</span>
                                <div className="background">
                                    <div className="rhombus rhombus-1"></div>
                                    <div className="rhombus rhombus-2"></div>
                                    <div className="rhombus rhombus-3"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {sectionsFiltered.map((item, index) => (
                <React.Fragment key={item.permission || index}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default WorkDetail;
