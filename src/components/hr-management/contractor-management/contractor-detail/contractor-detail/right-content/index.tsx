import SubTab from '@/components/common/tab/sub-tab';
import { ITableHaveActionAddProps } from '@/types/common';
import { IContractor } from '@/types/hr-management/contractor-management';
import { Content } from 'antd/es/layout/layout';
import ContractorPersonalDetail from './personal-detail';
import ContractorWorkDetail from './work-detail';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';

const RightContent = (props: ITableHaveActionAddProps<IContractor>) => {
    const { dataProps, setIsReload } = props;

    const tabsContentRight = [
        {
            key: '1',
            label: 'Personal Detail',
            children: <ContractorPersonalDetail dataProps={dataProps} setIsReload={setIsReload} />,
            permission: 'PersonalDetail'
        },
        {
            key: '2',
            label: 'Work Detail',
            children: <ContractorWorkDetail dataProps={dataProps} />,
            permission: 'WorkDetail'
        }
    ];

    const { permission = [] } = getDecryptedItem('permission') || {};
    const filteredTabsContentRight = tabsContentRight.filter(tab => {
        const section = findSectionByNameSection(permission, tab.permission, 'ContractorManagement');
        return !!section;
    });

    return (
        <Content className="right-content">
            <SubTab items={filteredTabsContentRight} />
        </Content>
    );
};

export default RightContent;
