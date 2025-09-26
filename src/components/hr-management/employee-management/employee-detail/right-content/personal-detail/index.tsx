import employeeService from '@/services/hr-management/employee-management';
import { IDocument, IEducation, IEmployee, IHealthTracking, ILanguageSkills } from '@/types/hr-management/employee-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';
import InformationDetail from './information-detail';
import TableDocument from './table-document';
import TableEducation from './table-education';
import TableHealthTracking from './table-health-tracking';
import TableLanguageSkill from './table-language-skill';

const PersonalDetail = ({ isReload, moduleName }: { isReload: () => void; moduleName?: string }) => {
    const { id = '' } = useParams();
    const { turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();
    const nameFromUrl = useGetNameFromUrl();

    const [personalInformation, setPersonalInformation] = useState<IEmployee>();
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [educations, setEducations] = useState<IEducation[]>([]);
    const [healthTrackings, setHealthTrackings] = useState<IHealthTracking[]>([]);
    const [languageSkills, setLanguageSkills] = useState<ILanguageSkills[]>([]);

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

    const getPersonalInformation = () => fetchData(() => employeeService.getPersonalInformation(id, moduleName), setPersonalInformation);
    const getDocuments = () => fetchData(() => employeeService.getDocuments(id, moduleName), setDocuments);
    const getEducations = () => fetchData(() => employeeService.getEducations(id, moduleName), setEducations);
    const getHealthTracking = () => fetchData(() => employeeService.getHealthTracking(id, moduleName), setHealthTrackings);
    const getLanguageSkills = () => fetchData(() => employeeService.getLanguageSkills(id, moduleName), setLanguageSkills);

    const setIsReload = () => {
        getPersonalInformation();
        isReload();
    };

    const sections = [
        {
            content: <InformationDetail dataProps={personalInformation} setIsReload={setIsReload} moduleName={moduleName} />,
            permission: 'InformationDetails',
            apiCall: getPersonalInformation
        },
        {
            content: <TableDocument dataProps={documents} />,
            permission: 'Document',
            apiCall: getDocuments
        },
        {
            content: <TableEducation dataProps={educations} setIsReload={getEducations} moduleName={moduleName} />,
            permission: 'Education',
            apiCall: getEducations
        },
        {
            content: <TableHealthTracking dataProps={healthTrackings} setIsReload={getHealthTracking} moduleName={moduleName} />,
            permission: 'HealthTracking',
            apiCall: getHealthTracking
        },
        {
            content: <TableLanguageSkill dataProps={languageSkills} setIsReload={getLanguageSkills} moduleName={moduleName} />,
            permission: 'LanguageSkill',
            apiCall: getLanguageSkills
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
        if (sectionsFiltered.length && id) {
            callApisBasedOnPermissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sectionsFiltered.length, id]);

    return (
        <div className="personal-detail">
            {sectionsFiltered.map((item, index) => (
                <React.Fragment key={item.permission || index}>{item.content}</React.Fragment>
            ))}
        </div>
    );
};

export default PersonalDetail;
