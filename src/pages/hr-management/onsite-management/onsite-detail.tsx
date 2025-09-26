import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabOnsiteDetail from '@/components/hr-management/onsite-management/tab-onsite-detail';
import TabOnsiteUpdateHistory from '@/components/hr-management/onsite-management/tab-onsite-update-history';
import pathnames from '@/pathnames';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useState } from 'react';

const breadcrumbItems = [
    { title: pathnames.hrManagement.main.name },
    {
        title: pathnames.hrManagement.onsiteManagement.main.name,
        path: pathnames.hrManagement.onsiteManagement.main.path
    },
    { title: pathnames.hrManagement.onsiteManagement.detail.name }
];

const OnsiteDetailPage = () => {
    const [isReloadAPIDetail, setIsReloadAPIOnsite] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.onsiteDetail.name,
            label: keyTab.onsiteDetail.label,
            children: <TabOnsiteDetail isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.onsiteDetailUpdatedHistory.name,
            label: keyTab.onsiteDetailUpdatedHistory.label,
            children: <TabOnsiteUpdateHistory isReload={isReloadAPIUpdatedHistory} />
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.onsiteDetail.name) {
            return setIsReloadAPIOnsite({});
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

export default OnsiteDetailPage;
