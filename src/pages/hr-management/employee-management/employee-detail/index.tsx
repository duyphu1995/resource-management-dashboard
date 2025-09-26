import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabDetail from '@/components/hr-management/employee-management/employee-detail';
import UpdatedHistory from '@/components/hr-management/employee-management/employee-detail/update-history';
import pathnames from '@/pathnames';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './index.scss';

const EmployeeDetail = () => {
    const nameFromUrl = useGetNameFromUrl();

    const [isReloadAPIDetail, setIsReloadAPIEmployee] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.employeeDetail.name,
            label: keyTab.employeeDetail.label,
            children: <TabDetail isReload={isReloadAPIDetail} moduleName="EmployeeManagement" />,
            permission: 'EmployeeDetails'
        },
        {
            key: keyTab.employeeDetailUpdatedHistory.name,
            label: keyTab.employeeDetailUpdatedHistory.label,
            children: <UpdatedHistory isReload={isReloadAPIUpdatedHistory} />,
            permission: 'UpdatedHistory'
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const filteredTabsContentRight = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, nameFromUrl);
        return !!section;
    });

    const pathname = useLocation().pathname;
    const pathnameWithoutId = pathname.replace(/\/\d+$/, '');

    const breadcrumbItems = [
        { title: pathnames.hrManagement.main.name },
        {
            title: pathnames.hrManagement.employeeManagement.main.name,
            path: pathnames.hrManagement.employeeManagement.main.path
        },
        { title: pathnames.hrManagement.employeeManagement.detail.name }
    ];

    // Update breadcrumb based on pathnameWithoutId
    switch (pathnameWithoutId) {
        case pathnames.groupManagement.detail.path:
            breadcrumbItems[0] = {
                title: pathnames.home.name,
                path: pathnames.home.path
            };
            breadcrumbItems[1] = {
                title: pathnames.groupManagement.main.name,
                path: pathnames.groupManagement.main.path
            };
            break;
        default:
            break;
    }

    const onChangeTabs = (key: string) => {
        if (key === keyTab.employeeDetail.name) {
            return setIsReloadAPIEmployee({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    return (
        <Layout>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={filteredTabsContentRight} onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default EmployeeDetail;
