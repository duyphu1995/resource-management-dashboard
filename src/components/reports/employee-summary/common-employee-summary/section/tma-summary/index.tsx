import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, ITabEmployeeSummaryProps, ITmaSolutionsSummary } from '@/types/reports/employee-summary';
import { formatDataTable } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';

interface ITMASummaryProps extends ITabEmployeeSummaryProps {
    handleScroll?: (value: string) => void;
}

const TMASummary = (props: ITMASummaryProps) => {
    const { tab, handleScroll = () => {}, setDataTmaSummary = () => {}, currentTab } = props;

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const moduleName = props.moduleName + 'TMA';

    const [dataList, setDataList] = useState<ITmaSolutionsSummary[]>([]);

    const tmaSummaryColumns: ColumnType<ITmaSolutionsSummary>[] = [
        {
            dataIndex: 'orgChartReportTypeName',
            key: 'orgChartReportTypeName',
            title: 'Structure',
            width: '50%',
            render: (item: string, record: ITmaSolutionsSummary) => {
                if (record.orgChartReportStructureId !== 0) {
                    return (
                        <a className="underline margin-left-30" onClick={() => handleScroll(record.orgChartReportTypeName + `_${tab}`)}>
                            - {renderWithFallback(item)}
                        </a>
                    );
                } else {
                    return (
                        <a className="underline" onClick={() => handleScroll(record.orgChartReportTypeName)}>
                            {renderWithFallback(item)}
                        </a>
                    );
                }
            }
        },
        {
            dataIndex: 'totalEmployee',
            key: 'totalEmployee',
            title: 'Employee Total',
            width: '50%',
            render: item => renderWithFallback(item)
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                const res = await employeeSummaryService.getTmaSummaryList(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                    setDataTmaSummary(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get tma list');
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
    }, [tab, currentTab, moduleName, showNotification, turnOnLoading, turnOffLoading, setDataTmaSummary]);

    return (
        <div className="title-header-table">
            <h3 className="title">TMA Summary</h3>
            <BaseTable columns={tmaSummaryColumns} dataSource={formatDataTable(dataList)} loading={isLoading} pagination={false} bordered />
        </div>
    );
};

export default TMASummary;
