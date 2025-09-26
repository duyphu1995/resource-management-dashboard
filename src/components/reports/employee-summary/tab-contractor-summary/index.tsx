import DetailInfo from '@/components/common/detail-management/detail-info';
import { ITabEmployeeSummaryProps } from '@/types/reports/employee-summary';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import { Flex } from 'antd';
import React from 'react';
import DCSummary from '../common-employee-summary/section/dc-summary';
import DGSummary from '../common-employee-summary/section/dg-summary';
import GenderSummary from '../common-employee-summary/section/gender-summary';
import GraduatedSummary from '../common-employee-summary/section/graduated-summary';
import PositionSummary from '../common-employee-summary/section/position-summary';

const TabContractorSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab, moduleName } = props;

    const { permission = [] } = getDecryptedItem('permission') || {};
    const canAccessSection = (sectionName: string) => {
        const section = findSectionByNameSection(permission, sectionName, 'EmployeeSummary');
        return !!section;
    };

    const sections = [
        {
            sectionName: `EmployeeSummary${moduleName}ShortSummary`,
            component: <GenderSummary tab={tab} currentTab={currentTab} moduleName={moduleName} />
        },
        {
            sectionName:
                `EmployeeSummary${moduleName}PositionSummaryPositionSummary` || `EmployeeSummary${moduleName}PositionSummaryChartPositionSummary`,
            component: <PositionSummary tab={tab} currentTab={currentTab} moduleName={moduleName} />
        },
        {
            sectionName:
                `EmployeeSummary${moduleName}GraduatedSummaryGraduatedSummary` ||
                `EmployeeSummary${moduleName}GraduatedSummaryChartGraduatedSummary` ||
                `EmployeeSummary${moduleName}GraduatedSummaryChartGraduatedSummaryByBU`,
            component: <GraduatedSummary tab={tab} currentTab={currentTab} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}BUSummary`,
            component: <DGSummary tab={tab} currentTab={currentTab} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}DCDetail`,
            component: <DCSummary tab={tab} currentTab={currentTab} moduleName={moduleName} />
        }
    ];

    return (
        <DetailInfo>
            <Flex vertical gap={24}>
                {sections.map((item, index) => (
                    <React.Fragment key={`${item.sectionName || index}-${index}`}>
                        {item.sectionName && canAccessSection(item.sectionName) ? item.component : null}
                    </React.Fragment>
                ))}
            </Flex>
        </DetailInfo>
    );
};

export default TabContractorSummary;
