import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IMonthlyStatisticCommon, IOverviewItem, ISharedServicesUnit } from '@/types/reports/monthly-delivery-statistic-report';
import { renderValueTable } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { createSorter } from '@/utils/table';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import OverviewReport from '../../overview-report';

const SharedServicesUnit = (props: IMonthlyStatisticCommon) => {
    const { reloadData, filterData } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataTable, setDataTable] = useState<ISharedServicesUnit[]>([]);
    const [dataTotal, setDataTotal] = useState<ISharedServicesUnit[]>([]);

    const overviewItems: IOverviewItem[] = [
        {
            label: 'Total Effort',
            value: dataTotal[0]?.effort
        },
        {
            label: 'Total Billable',
            value: dataTotal[0]?.billable
        },
        {
            label: 'Total NB',
            value: dataTotal[0]?.noneBillable
        },
        {
            label: 'Total NBR (%)',
            value: dataTotal[0]?.noneBillableRatioPercent + '%'
        }
    ];

    const fetchData = useCallback(async () => {
        turnOnLoading();
        const res = await monthlyDeliveryStatisticReportService.getBillableGrowthByShareService(filterData);
        const { succeeded, data } = res;

        if (succeeded && data) {
            setDataTable(data.filter(item => !item.unitName.toLocaleLowerCase().includes('total')));
            setDataTotal(data.filter(item => item.unitName.toLocaleLowerCase().includes('total')));
        }
        turnOffLoading();
    }, [filterData, turnOnLoading, turnOffLoading]);

    // Fake call api
    useEffect(() => {
        if (reloadData?.key === 'BillableGrowth_Group_ByServicesUnit') {
            fetchData();
        }
    }, [reloadData, fetchData]);

    const columnSharedServicesUnit: ColumnsType<ISharedServicesUnit> = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Shared Services Unit',
            width: '20%',
            render: item => renderWithFallback(item),
            sorter: createSorter('unitName')
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'Effort',
            width: '20%',
            render: item => renderValueTable(item, 'number'),
            sorter: createSorter('effort', 'number')
        },
        {
            dataIndex: 'billable',
            key: 'billable',
            title: 'Billable',
            width: '20%',
            render: item => renderValueTable(item, 'number'),
            sorter: createSorter('billable', 'number')
        },
        {
            dataIndex: 'noneBillable',
            key: 'noneBillable',
            title: 'NB',
            width: '20%',
            render: item => renderValueTable(item, 'number'),
            sorter: createSorter('noneBillable', 'number')
        },
        {
            dataIndex: 'noneBillableRatioPercent',
            key: 'noneBillableRatioPercent',
            title: 'NBR (%)',
            width: '20%',
            render: item => renderValueTable(item + '%', 'number'),
            sorter: createSorter('noneBillableRatioPercent', 'number')
        }
    ];

    return (
        <>
            <OverviewReport items={overviewItems} />
            <BaseTable dataSource={dataTable} columns={columnSharedServicesUnit} loading={isLoading} rowKey="unitId" />
        </>
    );
};

export default SharedServicesUnit;
