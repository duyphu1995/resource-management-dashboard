import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabDocumentDetail from '@/components/hr-management/document-management/tab-document-detail';
import TabDocumentUpdateHistory from '@/components/hr-management/document-management/tab-document-update-history';
import pathnames from '@/pathnames';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useState } from 'react';
import './index.scss';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';

const breadcrumbItems = [
    { title: pathnames.hrManagement.main.name },
    {
        title: pathnames.hrManagement.documentManagement.main.name,
        path: pathnames.hrManagement.documentManagement.main.path
    },
    { title: pathnames.hrManagement.documentManagement.detail.name }
];

const DocumentDetailPage = () => {
    const [isReloadAPIDetail, setIsReloadAPIDocument] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.documentDetail.name,
            label: keyTab.documentDetail.label,
            children: <TabDocumentDetail isReload={isReloadAPIDetail} />,
            permission: 'DocumentDetails'
        },
        {
            key: keyTab.documentDetailUpdatedHistory.name,
            label: keyTab.documentDetailUpdatedHistory.label,
            children: <TabDocumentUpdateHistory isReload={isReloadAPIUpdatedHistory} />,
            permission: 'UpdatedHistory',
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.documentDetail.name) {
            return setIsReloadAPIDocument({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    const { permission = [] } = getDecryptedItem('permission') || {};

    const filteredItems = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, "DocumentManagement");
        return !!section;
    });

    return (
        <Layout>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={filteredItems} onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default DocumentDetailPage;
