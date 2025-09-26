import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabResignationDetail from '@/components/hr-management/resignation-management/resignation-detail/tab-resignation-detail';
import TabResignationUpdateHistory from '@/components/hr-management/resignation-management/resignation-detail/tab-resignation-update-history';
import pathnames from '@/pathnames';
import { IDataBreadcrumb } from '@/types/common';
import keyTab from '@/utils/key-tab';
import { useState } from 'react';

const ResignationDetailPage = () => {
    const breadcrumbItems: IDataBreadcrumb[] = [
        { title: pathnames.hrManagement.main.name },
        {
            title: pathnames.hrManagement.resignationManagement.main.name,
            path: pathnames.hrManagement.resignationManagement.main.path
        },
        { title: pathnames.hrManagement.resignationManagement.detail.name }
    ];
    const [isReloadAPIDetail, setIsReloadAPIDetail] = useState<object>({});
    const [isReloadUpdatedHistory, setIsReloadUpdatedHistory] = useState<object>({});

    const items = [
        {
            key: keyTab.resignationDetail.name,
            label: keyTab.resignationDetail.label,
            children: <TabResignationDetail isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.resignationDetailUpdatedHistory.name,
            label: keyTab.resignationDetailUpdatedHistory.label,
            children: <TabResignationUpdateHistory isReload={isReloadUpdatedHistory} />
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.resignationDetail.name) return setIsReloadAPIDetail({});
        return setIsReloadUpdatedHistory({});
    };

    return (
        <div>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={items} onChangeTabs={onChangeTabs} />
        </div>
    );
};

export default ResignationDetailPage;
