import SubTab from '@/components/common/tab/sub-tab';
import { ITableHaveActionAddProps } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import useGetNameFromUrl from '@/utils/hook/useGetNameFromUrl';
import { Button } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Comment from './comment';
import './index.scss';
import PerformanceAppraisal from './performance-appraisal';
import PersonalDetail from './personal-detail';
import Training from './training';
import WorkDetail from './work-detail';

const RightContent: React.FC<ITableHaveActionAddProps<IEmployee>> = ({ dataProps, isReload, moduleName }) => {
    const { resignationInformation } = dataProps || {};

    const nameFromUrl = useGetNameFromUrl();

    const tabsContentRight = [
        {
            key: '1',
            label: 'Personal Detail',
            children: <PersonalDetail isReload={isReload} moduleName={moduleName} />,
            permission: 'PersonalDetail'
        },
        {
            key: '2',
            label: 'Work Detail',
            children: <WorkDetail isReload={isReload} dataProps={dataProps} moduleName={moduleName} />,
            permission: 'WorkDetail'
        },
        { key: '3', label: 'Performance Appraisal', children: <PerformanceAppraisal moduleName={moduleName} />, permission: 'PerformanceAppraisal' },
        { key: '4', label: 'Training', children: <Training moduleName={moduleName} />, permission: 'Training' },
        { key: '5', label: 'Comment', children: <Comment moduleName={moduleName} />, permission: 'Comment' }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const filteredTabsContentRight = tabsContentRight.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, nameFromUrl);
        return !!section;
    });

    return (
        <Content className="right-content">
            {resignationInformation && (
                <section className="right-content__resignation">
                    <h3 style={{ color: resignationInformation.statusColor }}>{resignationInformation.statusName}</h3>
                    <Button type="link" href={`/hr-management/resignation-management/resignation-detail/${resignationInformation.resignationFormId}`}>
                        View Details
                    </Button>
                </section>
            )}
            <SubTab items={filteredTabsContentRight} />
        </Content>
    );
};

export default RightContent;
