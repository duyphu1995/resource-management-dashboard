import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabTemporaryLeaveEdit from '@/components/hr-management/temporary-management/tab-temporary-leave-edit';
import TabTemporaryLeaveUpdateHistory from '@/components/hr-management/temporary-management/tab-temporary-leaves-update-history';
import pathnames from '@/pathnames';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const TemporaryLeaveEditPage = () => {
    const { id } = useParams();

    const breadcrumbItems = useMemo(
        () => [
            { title: pathnames.hrManagement.main.name },
            { title: pathnames.hrManagement.temporaryLeaves.main.name, path: pathnames.hrManagement.temporaryLeaves.main.path },
            { title: pathnames.hrManagement.temporaryLeaves.detail.name, path: `${pathnames.hrManagement.temporaryLeaves.detail.path}/${id}` },
            { title: pathnames.hrManagement.temporaryLeaves.edit.name }
        ],
        [id]
    );

    const [isReloadAPIDetail, setIsReloadAPIDetail] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.temporaryLeaveEdit.name,
            label: keyTab.temporaryLeaveEdit.label,
            children: <TabTemporaryLeaveEdit isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.temporaryLeaveDetailUpdatedHistory.name,
            label: keyTab.temporaryLeaveDetailUpdatedHistory.label,
            children: <TabTemporaryLeaveUpdateHistory isReload={isReloadAPIUpdatedHistory} />
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.temporaryLeaveDetail.name) {
            return setIsReloadAPIDetail({});
        }
        return setIsReloadAPIUpdatedHistory({});
    };

    return (
        <Layout className="temporary-layout">
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Tab items={items} className="temporary-tab" onChangeTabs={onChangeTabs} />
        </Layout>
    );
};

export default TemporaryLeaveEditPage;
