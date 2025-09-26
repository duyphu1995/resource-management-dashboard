import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Form, TableColumnsType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import ReportFilter from '@/components/common/report-filter';
import BaseTable from '@/components/common/table/table';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import resourceProjectionReportServices from '@/services/reports/resource-projection';
import { formatDataTable, formatNumberWithDecimalPlaces, formatTimeMonthDayYear } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { IFilterData } from '@/types/filter';
import { IFormValues, IReportList } from '@/types/reports/resource-projection';
import pathnames from '@/pathnames';
import './index.scss';

const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.resourceProjectionReport.main.name }];

const ResourceProjectionReportPage = () => {
    const [filterForm] = Form.useForm();
    const { showNotification } = useNotify();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dataReport, setDataReport] = useState<IReportList[]>([]);

    const handleDisabledDate = useCallback((currentDate: dayjs.Dayjs) => {
        const currentYear = dayjs().year();
        return currentDate.year() < currentYear || currentDate.year() > currentYear + 1;
    }, []);

    const filterData: IFilterData[] = [
        {
            key: 'dateSelected',
            label: 'Month',
            forColumns: [],
            show: true,
            initialValue: dayjs(dayjs(), TIME_FORMAT.MONTH_YEAR),
            control: <DatePicker allowClear={true} picker="month" format={TIME_FORMAT.MONTH_YEAR} disabledDate={handleDisabledDate} />
        }
    ];

    const onResetFilter = () => {
        const currentDate = dayjs(dayjs(), TIME_FORMAT.MONTH_YEAR);
        fetchData({ dateSelected: currentDate });
        filterForm.setFieldValue('dateSelected', currentDate);
    };

    const columns: TableColumnsType<IReportList> = [
        {
            title: 'RESOURCE PROJECTION',
            width: 115,
            onHeaderCell: () => ({ className: 'table-header-column' }),
            children: [
                {
                    dataIndex: 'unitName',
                    key: 'unitName',
                    title: 'DC/Group',
                    width: 115,
                    render: item => renderWithFallback(item),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                }
            ]
        },
        {
            title: () => filterForm.getFieldValue('dateSelected')?.format(TIME_FORMAT.MONTH_YEAR),
            width: 800,
            children: [
                {
                    dataIndex: 'billableAddRemove',
                    key: 'billableAddedRemoved',
                    title: '#Billable Added/Removed',
                    width: 120,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'resignation',
                    key: 'resignation',
                    title: '#Resignation',
                    width: 90,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'jobOffered',
                    key: 'jobOffered',
                    title: '#Job Offered',
                    width: 90,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'resourceRotation',
                    key: 'resourceRotation',
                    title: 'Resource Rotation',
                    width: 110,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'headcount',
                    key: 'headcount',
                    title: 'HC',
                    width: 90,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'billable',
                    key: 'billable',
                    title: '#Billable',
                    width: 90,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'nonBillableRatio',
                    key: 'nonBillableRatio',
                    title: '%NBR',
                    width: 90,
                    align: 'center',
                    render: item => renderWithFallback(formatNumberWithDecimalPlaces(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                },
                {
                    dataIndex: 'lastUpdate',
                    key: 'lastUpdate',
                    title: 'Last Update',
                    width: 120,
                    align: 'center',
                    render: item => renderWithFallback(formatTimeMonthDayYear(item)),
                    onHeaderCell: () => ({ className: 'table-header-column-child' })
                }
            ]
        }
    ];

    const fetchData = useCallback(
        async (values: IFormValues) => {
            setIsLoading(true);
            try {
                const { dateSelected } = values;
                const month = dateSelected.format('MM');
                const year = dateSelected.format('YYYY');

                const response = await resourceProjectionReportServices.getReportList({ month, year });
                const { data, succeeded } = response;
                if (succeeded) {
                    setDataReport(formatDataTable(data) || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        },
        [showNotification]
    );

    useEffect(() => {
        fetchData(filterForm.getFieldsValue());
    }, [fetchData, filterForm]);

    const rowClassName = (record: IReportList) => {
        const classNames = [];

        if (record.isDCTotal) classNames.push('total-row');
        if (record.isDG) {
            classNames.push('dg-row');
        }

        return classNames.join(' ');
    };

    return (
        <DetailContent rootClassName="resource-projection">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pathnames.reports.resourceProjectionReport.main.name}
                loading={false}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={fetchData}
            />
            <BaseTable columns={columns} dataSource={dataReport} pagination={false} loading={isLoading} bordered rowClassName={rowClassName} />
        </DetailContent>
    );
};

export default ResourceProjectionReportPage;
