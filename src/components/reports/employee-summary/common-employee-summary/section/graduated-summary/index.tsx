import SubTab from '@/components/common/tab/sub-tab';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IGraduatedSummary, IParamsList, ITabEmployeeSummaryProps } from '@/types/reports/employee-summary';
import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { useEffect, useMemo, useState } from 'react';
import ChartGraduatedSummary from './tab-chart-graduated-summary';
import ChartGraduatedSummaryByDG from './tab-chart-graduated-summary-by-dg';
import GraduatedSummaryList from './tab-graduated-list';

interface IGraduatedSummaryProps extends ITabEmployeeSummaryProps {
    hiddenTabs?: string[];
}

const GraduatedSummary = (props: IGraduatedSummaryProps) => {
    const { tab, hiddenTabs, currentTab } = props;

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataList, setDataList] = useState<IGraduatedSummary[]>([]);

    const totalGraduatedNumber = useMemo(() => {
        const totalItem = dataList.find(item => item.universityName === 'Total Employees');
        if (!totalItem) return 0;

        const graduatedItem = totalItem.graduatedByDGDtos.find(subItem => subItem.unitId === 999999);
        return graduatedItem ? graduatedItem.number : 0;
    }, [dataList]);

    const titleTotal = currentTab === 'ContractorSummary' ? 'Contractor' : 'Employee';

    const { permission = [] } = getDecryptedItem('permission') || {};
    const canAccessSection = (sectionName: string) => {
        const section = findSectionByNameSection(permission, sectionName, 'EmployeeSummary');
        return !!section;
    };

    const graduatedTabs = [
        {
            key: 'Graduated',
            sectionName: `EmployeeSummary${props.moduleName}GraduatedSummaryGraduatedSummary`,
            label: (
                <div className="title">
                    Graduated Summary (Total {titleTotal}: {totalGraduatedNumber})
                </div>
            ),
            children: <GraduatedSummaryList dataProps={dataList} isLoading={isLoading} tab={tab} bordered moduleName={props.moduleName} />
        },
        {
            key: 'GraduatedChart',
            sectionName: `EmployeeSummary${props.moduleName}GraduatedSummaryChartGraduatedSummary`,
            label: <div className="title">Chart Graduated Summary</div>,
            children: <ChartGraduatedSummary dataProps={dataList} isLoading={isLoading} tabName={titleTotal} />
        },
        {
            key: 'GraduatedByBU',
            sectionName: `EmployeeSummary${props.moduleName}GraduatedSummaryChartGraduatedSummaryByBU`,
            label: <div className="title">Chart Graduated Summary By {ORG_UNITS.DG}</div>,
            children: <ChartGraduatedSummaryByDG dataProps={dataList} isLoading={isLoading} tabName={titleTotal} />
        }
    ].filter(tab => canAccessSection(tab.sectionName));

    const [activeTabKey, setActiveTabKey] = useState<string>(graduatedTabs[0].key);
    const moduleName = props.moduleName + activeTabKey;

    const tabsGraduated = graduatedTabs.filter(tab => !hiddenTabs?.includes(tab.key));

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getGraduatedListByDG(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get graduated list');
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
    }, [tab, currentTab, moduleName, turnOnLoading, showNotification, turnOffLoading]);

    return (
        <div className="title-header-table">
            <SubTab items={tabsGraduated} onChange={key => setActiveTabKey(key)} />
        </div>
    );
};

export default GraduatedSummary;
