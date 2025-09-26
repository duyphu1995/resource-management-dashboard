import employeeApi from '@/services/hr-management/employee-management';
import { ICertificates, ITrainingCourses } from '@/types/hr-management/employee-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableCertificate from './table-certificate';
import TableTrainingCourses from './table-training-courses';

const Training = ({ moduleName }: { moduleName?: string }) => {
    const { id = '' } = useParams();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();
    const nameFromUrl = useGetNameFromUrl();

    const [trainingCourses, setTrainingCourses] = useState<ITrainingCourses[]>([]);
    const [certificates, setCertificates] = useState<ICertificates[]>([]);

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

    const getTrainingCourses = () => fetchData(() => employeeApi.getTrainingCourses(id, moduleName), setTrainingCourses);
    const getCertificates = () => fetchData(() => employeeApi.getCertificates(id, moduleName), setCertificates);

    const sections = [
        {
            content: <TableTrainingCourses dataProps={trainingCourses} setIsReload={getTrainingCourses} moduleName={moduleName} />,
            permission: 'TrainingCourses',
            apiCall: getTrainingCourses
        },
        {
            content: <TableCertificate dataProps={certificates} setIsReload={getCertificates} moduleName={moduleName} />,
            permission: 'Certificate',
            apiCall: getCertificates
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
        <div className="training">
            {sectionsFiltered.map((item, index) => (
                <React.Fragment key={item.permission || index}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default Training;
