import { useState } from 'react';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabResignationEdit from '@/components/hr-management/resignation-management/resignation-detail/tab-resignation-edit';
import TabResignationUpdateHistory from '@/components/hr-management/resignation-management/resignation-detail/tab-resignation-update-history';
import pathnames from '@/pathnames';
import { IDataBreadcrumb } from '@/types/common';
import keyTab from '@/utils/key-tab';

const ResignationEditPage = () => {
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

    const tabItems = [
        {
            key: keyTab.resignationDetail.name,
            label: keyTab.resignationDetail.label,
            children: <TabResignationEdit isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.resignationDetailUpdatedHistory.name,
            label: keyTab.resignationDetailUpdatedHistory.label,
            children: <TabResignationUpdateHistory isReload={isReloadUpdatedHistory} />
        }
    ];

    const handleTabChange = (key: string) => {
        if (key === keyTab.resignationDetail.name) {
            setIsReloadAPIDetail({});
        } else {
            setIsReloadUpdatedHistory({});
        }
    };

    return (
        <div>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={tabItems} onChangeTabs={handleTabChange} />
        </div>
    );
};

export default ResignationEditPage;
