import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import SubTab from '@/components/common/tab/sub-tab';
import pathnames from '@/pathnames';
import './index.scss';
import RoleList from './role-list';
import UserPermission from './user-permission';
import { useEffect, useState } from 'react';

const breadcrumb = [
    { title: pathnames.admin.main.name },
    { title: pathnames.admin.roleAndPermission.main.name }
];

const ProjectContractReportPage = () => {
    const [activeKeyTab, setActiveKeyTab] = useState('roleList');

    const tabs = [
        {
            key: 'roleList',
            label: 'Role List',
            children: <RoleList />
        },
        {
            key: 'userPermission',
            label: 'User Permission',
            children: <UserPermission />
        },
    ];

    const onChange = (key: string) => {
        setActiveKeyTab(key);
        localStorage.setItem('activeTab', key);
    }

    useEffect(() => {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            setActiveKeyTab(savedTab);
        }
    }, []);

    return (
        <DetailContent rootClassName="role-and-permission">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <SubTab
                items={tabs}
                onChangeTabs={onChange}
                activeKey={activeKeyTab}
                centered
            />
        </DetailContent>
    );
};

export default ProjectContractReportPage;
