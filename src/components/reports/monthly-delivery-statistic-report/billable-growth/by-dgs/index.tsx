import BaseTable from '@/components/common/table/table';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IByDGs, IMonthlyStatisticCommon, IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import { dateMappings, formatNumberWithDecimalPlaces, renderValueTable } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import { createSorter } from '@/utils/table';
import { ColumnsType } from 'antd/es/table';
import { Fragment, useCallback, useEffect, useState } from 'react';
import OverviewReport from '../../overview-report';

interface IByDGsProps extends IMonthlyStatisticCommon {
    filterValue: string;
}

const ByDGs = (props: IByDGsProps) => {
    const { filterValue, filterData, reloadData } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataTable, setDataTable] = useState<IByDGs[]>([]);
    const [dataTotal, setDataTotal] = useState<IByDGs[]>([]);

    const month = parseInt(filterValue, 10);
    const prevMonth = dateMappings[month === 1 ? 12 : month - 1];

    const overviewItems: IOverviewItem[] = [
        {
            label: `Delivery ${prevMonth}`,
            value: formatNumberWithDecimalPlaces(dataTotal[0]?.previousTotalBillable)
        },
        {
            label: `Delivery ${dateMappings[month]}`,
            value: formatNumberWithDecimalPlaces(dataTotal[0]?.currentTotalBillable)
        },
        {
            label: 'Delivery increase / decrease',
            value: formatNumberWithDecimalPlaces(dataTotal[0]?.changedTotalBillable)
        },
        {
            label: 'Delivery percentage',
            value: formatNumberWithDecimalPlaces(dataTotal[0]?.percentChangedTotalBillable) + '%'
        }
    ];

    const fetchData = useCallback(async () => {
        turnOnLoading();
        const res = await monthlyDeliveryStatisticReportService.getBillableGrowthByDG(filterData);

        const { succeeded, data } = res;

        if (succeeded && data) {
            setDataTable(data.filter(item => !item.unitName.toLocaleLowerCase().includes('total')));
            setDataTotal(data.filter(item => item.unitName.toLocaleLowerCase().includes('total')));
        }
        turnOffLoading();
    }, [filterData, turnOnLoading, turnOffLoading]);

    // Fake call api
    useEffect(() => {
        if (reloadData?.key === 'BillableGrowth_Group_ByDGs') {
            fetchData();
        }
    }, [reloadData, fetchData]);

    const columnsByDGs: ColumnsType<IByDGs> = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: ORG_UNITS.DG,
            width: '20%',
            sorter: createSorter('unitName'),
            render: item => renderValueTable(item)
        },
        {
            dataIndex: 'previousTotalBillable',
            key: 'previousTotalBillable',
            title: prevMonth,
            width: '20%',
            sorter: createSorter('previousTotalBillable', 'number'),
            render: item => renderValueTable(item, 'number')
        },
        {
            dataIndex: 'currentTotalBillable',
            key: 'currentTotalBillable',
            title: dateMappings[month],
            width: '20%',
            sorter: createSorter('currentTotalBillable', 'number'),
            render: item => renderValueTable(item, 'number')
        },
        {
            dataIndex: 'changedTotalBillable',
            key: 'changedTotalBillable',
            title: 'Increase / Decrease',
            width: '20%',
            sorter: createSorter('changedTotalBillable', 'number'),
            render: item => renderValueTable(item, 'number')
        },
        {
            dataIndex: 'percentChangedTotalBillable',
            key: 'percentChangedTotalBillable',
            title: 'Percentage',
            width: '20%',
            sorter: createSorter('percentChangedTotalBillable', 'number'),
            render: item => renderValueTable(item + '%')
        }
    ];

    return (
        <Fragment>
            <OverviewReport items={overviewItems} />
            <BaseTable dataSource={dataTable} columns={columnsByDGs} loading={isLoading} rowKey="unitId" />
        </Fragment>
    );
};

export default ByDGs;
