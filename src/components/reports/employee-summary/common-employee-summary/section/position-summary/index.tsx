import SubTab from '@/components/common/tab/sub-tab';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, IPositionSummary, ITabEmployeeSummaryProps } from '@/types/reports/employee-summary';
import { findSectionByNameSection, getDecryptedItem, sumTotalEmployees } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { useEffect, useState } from 'react';
import ChartPositionSummary from './tab-chart-position';
import PositionSummaryList from './tab-position-list';

const PositionSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab } = props;

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataList, setDataList] = useState<IPositionSummary[]>([]);
    const [dataChart, setDataChart] = useState<IPositionSummary[]>([]);

    const titleTotal = currentTab === 'ContractorSummary' ? 'Contractor' : 'Employee';

    const { permission = [] } = getDecryptedItem('permission') || {};
    const canAccessSection = (sectionName: string) => {
        const section = findSectionByNameSection(permission, sectionName, 'EmployeeSummary');
        return !!section;
    };

    const positionTabs = [
        {
            key: 'Position',
            sectionName: `EmployeeSummary${props.moduleName}PositionSummaryPositionSummary`,
            label: (
                <div className="title">
                    Position Summary (Total {titleTotal}: {sumTotalEmployees(dataList)})
                </div>
            ),
            children: (
                <PositionSummaryList dataProps={dataList} isLoading={isLoading} tab={tab} currentTab={currentTab} moduleName={props.moduleName} />
            )
        },
        {
            key: 'PositionChart',
            sectionName: `EmployeeSummary${props.moduleName}PositionSummaryChartPositionSummary`,
            label: <div className="title">Chart Position Summary</div>,
            children: <ChartPositionSummary dataProps={dataChart} isLoading={isLoading} tabName={titleTotal} />
        }
    ].filter(tab => canAccessSection(tab.sectionName));

    const [activeTabKey, setActiveTabKey] = useState<string>(positionTabs[0].key);
    const moduleName = props.moduleName + activeTabKey;

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getPositionList(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                    setDataChart(data.filter(item => item.totalEmployee > 0));
                }
            } catch (error) {
                showNotification(false, 'Error fetching get position list');
            } finally {
                turnOffLoading();
            }
        };
        if (tab === currentTab) {
            if (tab.startsWith('CompanySummary')) {
                const companyId = tab.split('-')[1];
                fetchDataList({ companyId: parseInt(companyId) });
                return;
            }
            fetchDataList({ tabType: tab });
        }
    }, [tab, activeTabKey, moduleName, currentTab, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <div className="title-header-table">
            <SubTab items={positionTabs} onChange={key => setActiveTabKey(key)} />
        </div>
    );
};

export default PositionSummary;
