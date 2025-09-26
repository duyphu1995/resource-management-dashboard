import BaseTable from '@/components/common/table/table';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IMonthlyStatisticCommon, IOverviewItem, IStaffGradeIndex } from '@/types/reports/monthly-delivery-statistic-report';
import { dateMappings, formatDataTable, renderValueTable } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import { createSorter } from '@/utils/table';
import { Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import OverviewReport from '../overview-report';
import './index.scss';

const StaffGradeIndex = (props: IMonthlyStatisticCommon) => {
    const { reloadData, filterData } = props;
    const { month, year } = filterData;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataStaffGradeTable, setDataStaffGradeTable] = useState<IStaffGradeIndex[]>([]);
    const [dataStaffGradeTotal, setDataStaffGradeTotal] = useState<IStaffGradeIndex[]>([]);

    const fetchData = useCallback(async () => {
        turnOnLoading();
        const res = await monthlyDeliveryStatisticReportService.getStaffGradeIndex(filterData);

        const { succeeded, data } = res;

        if (succeeded && data) {
            // 1: TMA Total, 2 DC, 3 Delivery Total, 4 Shared Service
            setDataStaffGradeTable(data.filter(item => item.type !== 1));
            setDataStaffGradeTotal(data.filter(item => item.type === 1));
        }

        turnOffLoading();
    }, [filterData, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        if (reloadData?.key === 'StaffGradeIndex_Group') {
            fetchData();
        }
    }, [reloadData, fetchData]);

    const prevMonth = dateMappings[parseInt(month) === 1 ? 12 : parseInt(month) - 1];

    const overviewItems: IOverviewItem[] = [
        {
            label: 'TMA Total In',
            value: dataStaffGradeTotal[0]?.totalJoin
        },
        {
            label: 'TMA Total Out',
            value: dataStaffGradeTotal[0]?.totalLeave
        },
        {
            label: 'TMA Total Delta',
            value: dataStaffGradeTotal[0]?.delta
        },
        {
            label: `TMA Total ${prevMonth} Staff Index`,
            value: dataStaffGradeTotal[0]?.sgiLastMonth
        },
        {
            label: `TMA Total ${dateMappings[parseInt(month)]} Staff Index`,
            value: dataStaffGradeTotal[0]?.sgiNextMonth
        }
    ];

    const renderTooltip = (label: string, tooltip: string) => (
        <Tooltip title={tooltip} overlayStyle={{ maxWidth: '450px' }}>
            <span>{label}</span>
        </Tooltip>
    );

    const columnsStaffGrade: ColumnsType<IStaffGradeIndex> = [
        {
            title: ORG_UNITS.DG,
            dataIndex: 'dgName',
            key: 'dgName',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value),
            sorter: createSorter('dgName')
        },
        {
            title: renderTooltip('In', 'Get the number of employees entering the company in a month'),
            dataIndex: 'totalJoin',
            key: 'totalJoin',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value, 'number'),
            sorter: createSorter('totalJoin', 'number')
        },
        {
            title: renderTooltip('Out', 'Get the number of employees leaving the company in a month'),
            dataIndex: 'totalLeave',
            key: 'totalLeave',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value, 'number'),
            sorter: createSorter('totalLeave', 'number')
        },
        {
            title: renderTooltip('Delta', 'In-Out'),
            dataIndex: 'delta',
            key: 'delta',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value, 'number'),
            sorter: createSorter('delta', 'number')
        },
        {
            title: renderTooltip(`${prevMonth} Staff Index`, 'Get data on the last week of the month'),
            dataIndex: 'sgiLastMonth',
            key: 'sgiLastMonth',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value, 'number'),
            sorter: createSorter('sgiLastMonth', 'number')
        },
        {
            title: renderTooltip(`${dateMappings[parseInt(month)]} Staff Index`, 'Get data on the last week of the month'),
            dataIndex: 'sgiNextMonth',
            key: 'sgiNextMonth',
            width: 'calc(100% / 6)',
            render: value => renderValueTable(value, 'number'),
            sorter: createSorter('sgiNextMonth', 'number')
        }
    ];

    const rowClassNameCustom = (record: IStaffGradeIndex, index: number) => {
        const { type } = record;

        const alternatingColor = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        // 1: TMA Total, 2 DC, 3 Delivery Total, 4 Shared Service
        const typeClass = (type === 3 && 'delivery-total-color-bg') || (type === 4 && 'shared-service-color-bg');
        return typeClass || alternatingColor;
    };

    return (
        <div className="staff-grade">
            <div className="staff-grade__header">
                <h5 className="title">
                    Staff grade index of {dateMappings[parseInt(month, 10)]} {year}
                </h5>
                <div className="staff-grade__note">
                    <p className="title">Note</p>
                    <p>- Business & Shared Services: Shared Services, Business & IC/PR, Delivery Shared Services.</p>
                    <p>- Support Depts: ITS, Finance / Legal, HR/Admin Support.</p>
                </div>
            </div>
            <OverviewReport items={overviewItems} />
            <BaseTable
                dataSource={formatDataTable(dataStaffGradeTable)}
                columns={columnsStaffGrade}
                loading={isLoading}
                rowClassName={rowClassNameCustom}
            />
        </div>
    );
};

export default StaffGradeIndex;
