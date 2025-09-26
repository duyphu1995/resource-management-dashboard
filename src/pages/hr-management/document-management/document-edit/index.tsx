import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabDocumentEdit from '@/components/hr-management/document-management/tab-document-edit';
import TabDocumentUpdateHistory from '@/components/hr-management/document-management/tab-document-update-history';
import pathnames from '@/pathnames';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useState } from 'react';

const breadcrumbItems = [
    { title: pathnames.hrManagement.main.name },
    {
        title: pathnames.hrManagement.documentManagement.main.name,
        path: pathnames.hrManagement.documentManagement.main.path
    },
    { title: pathnames.hrManagement.documentManagement.detail.name }
];

const DocumentEditPage = () => {
    const [isReloadAPIDetail, setIsReloadAPIDocument] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.documentDetail.name,
            label: keyTab.documentDetail.label,
            children: <TabDocumentEdit isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.documentDetailUpdatedHistory.name,
            label: keyTab.documentDetailUpdatedHistory.label,
            children: <TabDocumentUpdateHistory isReload={isReloadAPIUpdatedHistory} />
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.documentDetail.name) {
            return setIsReloadAPIDocument({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    return (
        <Layout>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={items} onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default DocumentEditPage;
