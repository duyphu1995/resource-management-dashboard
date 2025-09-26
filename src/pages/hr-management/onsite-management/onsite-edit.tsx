import BaseBreadcrumb from '@/components/common/breadcrumb';
import Tab from '@/components/common/tab';
import TabOnsiteEdit from '@/components/hr-management/onsite-management/tab-onsite-edit';
import TabOnsiteUpdateHistory from '@/components/hr-management/onsite-management/tab-onsite-update-history';
import pathnames from '@/pathnames';
import keyTab from '@/utils/key-tab';
import { Layout } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const OnsiteEditPage = () => {
    const { id } = useParams();

    const breadcrumbItems = useMemo(
        () => [
            { title: pathnames.hrManagement.main.name },
            { title: pathnames.hrManagement.onsiteManagement.main.name, path: pathnames.hrManagement.onsiteManagement.main.path },
            { title: pathnames.hrManagement.onsiteManagement.detail.name, path: `${pathnames.hrManagement.onsiteManagement.detail.path}/${id}` },
            { title: pathnames.hrManagement.onsiteManagement.edit.name }
        ],
        [id]
    );

    const [isReloadAPIDetail, setIsReloadAPIDetail] = useState({});
    const [isReloadAPIUpdatedHistory, setIsReloadAPIUpdatedHistory] = useState({});

    const items = [
        {
            key: keyTab.onsiteDetail.name,
            label: keyTab.onsiteDetail.label,
            children: <TabOnsiteEdit isReload={isReloadAPIDetail} />
        },
        {
            key: keyTab.onsiteDetailUpdatedHistory.name,
            label: keyTab.onsiteDetailUpdatedHistory.label,
            children: <TabOnsiteUpdateHistory isReload={isReloadAPIUpdatedHistory} />
        }
    ];

    const onChangeTabs = (key: string) => {
        if (key === keyTab.onsiteDetail.name) {
            return setIsReloadAPIDetail({});
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

export default OnsiteEditPage;
