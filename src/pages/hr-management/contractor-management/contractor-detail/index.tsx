import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import ContractorDetail from '@/components/hr-management/contractor-management/contractor-detail/contractor-detail';
import ContractorUpdatedHistory from '@/components/hr-management/contractor-management/contractor-detail/contractor-updated-history';
import pathnames from '@/pathnames';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useState } from 'react';

const ContractorDetailPage = () => {
    const [isReloadAPIContractorDetail, setIsReloadAPIContractorDetail] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const breadcrumb: BreadcrumbItemType[] = [
        { title: pathnames.hrManagement.main.name },
        { path: pathnames.hrManagement.contractorManagement.main.path, title: pathnames.hrManagement.contractorManagement.main.name },
        { title: pathnames.hrManagement.contractorManagement.detail.name }
    ];

    const items = [
        {
            key: keyTab.contractorDetail.name,
            label: keyTab.contractorDetail.label,
            children: <ContractorDetail isReload={isReloadAPIContractorDetail} />,
            permission: 'ContractorDetails'
        },
        {
            key: keyTab.contractorDetailUpdatedHistory.name,
            label: keyTab.contractorDetailUpdatedHistory.label,
            children: <ContractorUpdatedHistory isReload={isReloadAPIUpdatedHistory} />,
            permission: 'UpdatedHistory'
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};

    const filteredItems = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, "ContractorManagement");
        return !!section;
    });

    const onChangeTabs = (key: string) => {
        if (key === keyTab.contractorDetail.name) {
            return setIsReloadAPIContractorDetail({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    return (
        <Layout>
            <BaseBreadcrumb dataItem={breadcrumb} />
            <Tab items={filteredItems} onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default ContractorDetailPage;
