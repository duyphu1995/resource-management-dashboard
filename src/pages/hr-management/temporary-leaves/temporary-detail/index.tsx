import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabTemporaryLeaveDetail from '@/components/hr-management/temporary-management/tab-temporary-leave-detail';
import TabTemporaryLeaveUpdateHistory from '@/components/hr-management/temporary-management/tab-temporary-leaves-update-history';
import pathnames from '@/pathnames';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useState } from 'react';

const breadcrumbItems = [
    { title: pathnames.hrManagement.main.name },
    { title: pathnames.hrManagement.temporaryLeaves.main.name, path: pathnames.hrManagement.temporaryLeaves.main.path },
    { title: pathnames.hrManagement.temporaryLeaves.detail.name }
];

const TemporaryLeaveDetailPage = () => {
    const [isReloadAPIDetail, setIsReloadAPITemporaryDetail] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.temporaryLeaveDetail.name,
            label: keyTab.temporaryLeaveDetail.label,
            children: <TabTemporaryLeaveDetail isReload={isReloadAPIDetail} />,
            permission: 'TemporaryLeavesDetails'
        },
        {
            key: keyTab.temporaryLeaveDetailUpdatedHistory.name,
            label: keyTab.temporaryLeaveDetailUpdatedHistory.label,
            children: <TabTemporaryLeaveUpdateHistory isReload={isReloadAPIUpdatedHistory} />,
            permission: 'UpdatedHistory'
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.temporaryLeaveDetail.name) {
            return setIsReloadAPITemporaryDetail({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    const { permission = [] } = getDecryptedItem('permission') || {};

    const filteredItems = items.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, "TemporaryLeaves");
        return !!section;
    });

    return (
        <Layout className="temporary-layout">
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={filteredItems} className="temporary-tab" onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default TemporaryLeaveDetailPage;
