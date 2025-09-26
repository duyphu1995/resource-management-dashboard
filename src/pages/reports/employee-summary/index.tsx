import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import Tab from '@/components/common/tab';
import TabCompanySummary from '@/components/reports/employee-summary/tab-company-summary';
import TabContractorSummary from '@/components/reports/employee-summary/tab-contractor-summary';
import TabEmployeeSummary from '@/components/reports/employee-summary/tab-employee-summary';
import pathnames from '@/pathnames';
import employeeSummaryService from '@/services/reports/employee-summary';
import reportService from '@/services/reports/report';
import { IReportCompany } from '@/types/reports/report';
import { downloadFile, escapeSelector } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import keyTab from '@/utils/key-tab';
import { Button, Flex, Spin } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import './index.scss';

const EmployeeSummary = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { havePermission } = usePermissions('EmployeeSummaryExport', 'EmployeeSummary');

    const [activeTabName, setActiveTabName] = useState<string>('EmployeeSummary');
    const [dataCompany, setDataCompany] = useState<IReportCompany[]>([]);
    const [isExportLoading, setIsExportLoading] = useState(false);

    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.employeeSummaryReport.main.name }];

    const handleScroll = (sectionName: string) => {
        if (sectionName === 'TMA Solutions') {
            const body = document.querySelector('#id-body');
            if (body) {
                body.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            const sanitizedSectionName = escapeSelector(sectionName);
            const body = document.querySelector(`#${sanitizedSectionName}`);
            body?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const tabs = [
        {
            key: keyTab.employeeSummary.name,
            label: keyTab.employeeSummary.label,
            children: <TabEmployeeSummary tab={activeTabName} currentTab="EmployeeSummary" handleScroll={handleScroll} moduleName="EmployeeSummary" />
        },
        {
            key: keyTab.contractorSummary.name,
            label: keyTab.contractorSummary.label,
            children: <TabContractorSummary tab={activeTabName} currentTab="ContractorSummary" moduleName="ContractorSummary" />
        },
        ...dataCompany.map(company => ({
            key: `CompanySummary-${company.companyId.toString()}`,
            label: company.companyName,
            children: (
                <TabCompanySummary
                    tab={activeTabName}
                    currentTab={`CompanySummary-${company.companyId}`}
                    handleScroll={handleScroll}
                    moduleName={company.moduleName}
                />
            )
        }))
    ];

    const onChangeTab = (key: string) => {
        setActiveTabName(key);
    };

    const handleExport = async () => {
        try {
            setIsExportLoading(true);

            const isCompanySummary = activeTabName.startsWith('CompanySummary');
            const requestData = isCompanySummary ? { companyId: parseInt(activeTabName.split('-')[1]) } : { tabType: activeTabName };

            const res = await employeeSummaryService.exportAllEmployeesSummary(requestData, 'EmployeeSummaryExport');

            downloadFile(res, '[EmployeeSummary]EmployeeList.xlsx');
            showNotification(true, 'Report exported successfully');
        } catch (error) {
            showNotification(false, 'Failed to export report');
        } finally {
            setIsExportLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllIndexes = async () => {
            turnOnLoading();
            const res = await reportService.getAllIndexes();
            const { data, succeeded } = res;

            if (succeeded && data) {
                setDataCompany(data.companies);
            }
            turnOffLoading();
        };

        fetchAllIndexes();
    }, [turnOnLoading, turnOffLoading]);

    const [isCenterTabs, setIsCenterTabs] = useState(true);

    useEffect(() => {
        const checkTabsVisibility = () => {
            const isOperationsTabs = document.querySelector('.employee-summary-tab .ant-tabs-nav-operations');

            if (isOperationsTabs && !isOperationsTabs.classList.contains('ant-tabs-nav-operations-hidden')) {
                setIsCenterTabs(false);
            }
        };

        const timeoutId = setTimeout(checkTabsVisibility, 100);

        return () => clearTimeout(timeoutId);
    }, [dataCompany]);

    return (
        <Spin spinning={isLoading} size="large" className="loading-body">
            <DetailContent>
                <div id="TMA Solutions">
                    <BaseBreadcrumb dataItem={breadcrumb} />
                </div>
                <Flex justify="space-between">
                    <Title level={3}>Employee Summary</Title>
                    {havePermission('Export') && (
                        <Button loading={isExportLoading} onClick={handleExport}>
                            Export
                        </Button>
                    )}
                </Flex>
                <Tab items={tabs} onChangeTabs={onChangeTab} centered={isCenterTabs} className="employee-summary-tab" />
            </DetailContent>
        </Spin>
    );
};

export default EmployeeSummary;
