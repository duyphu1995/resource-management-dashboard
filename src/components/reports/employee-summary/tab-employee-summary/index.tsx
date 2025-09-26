import DetailInfo from '@/components/common/detail-management/detail-info';
import { ITabEmployeeSummaryProps, ITmaSolutionsSummary } from '@/types/reports/employee-summary';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import { Flex } from 'antd';
import React, { useState } from 'react';
import DCSummary from '../common-employee-summary/section/dc-summary';
import DepartmentServiceSummary from '../common-employee-summary/section/department-service-summary';
import DGSummary from '../common-employee-summary/section/dg-summary';
import GenderSummary from '../common-employee-summary/section/gender-summary';
import GraduatedSummary from '../common-employee-summary/section/graduated-summary';
import PositionSummary from '../common-employee-summary/section/position-summary';
import ShareServiceSummary from '../common-employee-summary/section/share-service-summary';
import SupportSummary from '../common-employee-summary/section/support-summary';
import TIPSummary from '../common-employee-summary/section/tip-summary';
import TMASummary from '../common-employee-summary/section/tma-summary';
import './index.scss';

const TabEmployeeSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab, handleScroll, moduleName } = props;

    const [dataTmaSummary, setDataTmaSummary] = useState<ITmaSolutionsSummary[]>([]);

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
            sectionName: `EmployeeSummary${moduleName}TMASummary`,
            component: (
                <TMASummary
                    tab={tab}
                    handleScroll={handleScroll}
                    currentTab={currentTab}
                    setDataTmaSummary={setDataTmaSummary}
                    moduleName={moduleName}
                />
            )
        },
        {
            sectionName: `EmployeeSummary${moduleName}BUSummary`,
            component: <DGSummary tab={tab} currentTab={currentTab} dataTmaSummary={dataTmaSummary} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}DepartmentServiceSummary`,
            component: <DepartmentServiceSummary tab={tab} currentTab={currentTab} dataTmaSummary={dataTmaSummary} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}SharedServiceSummary`,
            component: <ShareServiceSummary tab={tab} currentTab={currentTab} dataTmaSummary={dataTmaSummary} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}TIPSummary`,
            component: <TIPSummary tab={tab} currentTab={currentTab} dataTmaSummary={dataTmaSummary} moduleName={moduleName} />
        },
        {
            sectionName: `EmployeeSummary${moduleName}Support`,
            component: <SupportSummary tab={tab} currentTab={currentTab} dataTmaSummary={dataTmaSummary} moduleName={moduleName} />
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

export default TabEmployeeSummary;
