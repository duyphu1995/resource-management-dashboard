import employeeApi from '@/services/hr-management/employee-management';
import { IAchievement, IPaForeignLanguage, IPromotion } from '@/types/hr-management/employee-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';
import TableAchievement from './table-achievement';
import TablePAForeignLanguage from './table-pa-foreign-language';
import TablePAHistory from './table-pa-history';
import TablePromoteBeforePA from './table-promote-before-pa';

const PerformanceAppraisal = ({ moduleName }: { moduleName?: string }) => {
    const { id = '' } = useParams();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();
    const nameFromUrl = useGetNameFromUrl();

    const [achievements, setAchievements] = useState<IAchievement[]>([]);
    const [promotionInfos, setPromotionInfos] = useState<IPromotion[]>([]);
    const [paHistories, setPaHistories] = useState<any[]>([]);
    const [paForeignLanguages, setPaForeignLanguages] = useState<IPaForeignLanguage[]>([]);

    const fetchData = async (apiCall: any, setData: any) => {
        try {
            turnOnLoading();
            const response = await apiCall();
            const { succeeded, data, message } = response;

            if (succeeded && data) {
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

    const getAchievements = () => fetchData(() => employeeApi.getAchievements(id, moduleName), setAchievements);
    const getPromotionsBeforePA = () => fetchData(() => employeeApi.getPromotionsBeforePA(id, moduleName), setPromotionInfos);
    const getPAHistories = () => fetchData(() => employeeApi.getPAHistories(id, moduleName), setPaHistories);
    const getPAForeignLanguages = () => fetchData(() => employeeApi.getPAForeignLanguages(id, moduleName), setPaForeignLanguages);

    const sections = [
        {
            content: <TableAchievement dataProps={achievements} setIsReload={getAchievements} moduleName={moduleName} />,
            permission: 'Achievement',
            apiCall: getAchievements
        },
        {
            content: <TablePromoteBeforePA dataProps={promotionInfos} setIsReload={getPromotionsBeforePA} moduleName={moduleName} />,
            permission: 'PromoteBeforePA',
            apiCall: getPromotionsBeforePA
        },
        {
            content: <TablePAHistory dataProps={paHistories} />,
            permission: 'PAHistory',
            apiCall: getPAHistories
        },
        {
            content: <TablePAForeignLanguage dataProps={paForeignLanguages} />,
            permission: 'PAForeignLanguage',
            apiCall: getPAForeignLanguages
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};

    const sectionsFiltered = useMemo(() => {
        return sections.filter(tab => !!findSectionByNameSection(permission, tab.permission, nameFromUrl));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permission, nameFromUrl]);

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
        <div className="performance-appraisal">
            {sectionsFiltered.map((item, index) => (
                <React.Fragment key={item.permission || index}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default PerformanceAppraisal;
