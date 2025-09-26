import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DatePicker from '@/components/common/form/date-picker';
import BaseSelect from '@/components/common/form/select';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import DialogKpiReport from '@/components/reports/kpi/dialog/dialog-kpi-report';
import PopoverKpiReport from '@/components/reports/kpi/popover/popover-kpi-report';
import pathnames from '@/pathnames';
import kpiReports from '@/services/reports/kpi';
import { IFilterData } from '@/types/filter';
import { IFilterValues, IKpiReports, IKpiReportsUnit, IWeekColumn } from '@/types/reports/kpi';
import useLoading from '@/utils/hook/useLoading';
import { Form, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { DefaultOptionType } from 'antd/es/select';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';
import useNotify from '@/utils/hook/useNotify';

const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.kpiReport.main.name }];
const defaultQuarterOptions = [
    { label: 'Quarter: None', value: 0 },
    { label: 'Q1', value: 1 },
    { label: 'Q2', value: 2 },
    { label: 'Q3', value: 3 },
    { label: 'Q4', value: 4 }
];

const KpiReportPage = () => {
    const [filterForm] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { showNotification } = useNotify();

    const [data, setData] = useState<IKpiReports[]>([]);
    const [detailWeekModal, setDetailWeekModal] = useState<IKpiReports>();
    const [quarterOptions, setQuarterOptions] = useState<DefaultOptionType[]>(
        defaultQuarterOptions.map(item => ({ ...item, disabled: dayjs(getQuarterRange(dayjs(), item.value).fromDate).isAfter(dayjs()) }))
    );

    const defaultFormValues: IFilterValues = useMemo(
        () => ({
            year: dayjs(),
            quarter: defaultQuarterOptions[0].value
        }),
        []
    );

    function getQuarterRange(date: Dayjs, quarter: number) {
        let fromDate: string;
        let endDate: string;

        if (quarter === 0) {
            fromDate = dayjs(date).startOf('year').format('YYYY-MM-DD');
            endDate = dayjs(date).endOf('year').format('YYYY-MM-DD');
        } else {
            const startMonth = (quarter - 1) * 3 + 1;
            const endMonth = startMonth + 2;

            fromDate = dayjs(date)
                .month(startMonth - 1)
                .startOf('month')
                .format('YYYY-MM-DD');
            endDate = dayjs(date)
                .month(endMonth - 1)
                .endOf('month')
                .format('YYYY-MM-DD');
        }

        return { fromDate, endDate };
    }

    const fetchData = useCallback(
        async (values: IFilterValues) => {
            try {
                turnOnLoading();
                const { fromDate, endDate } = getQuarterRange(values.year, values.quarter);
                const res = await kpiReports.getKpiReports(fromDate, endDate);
                const { data, succeeded } = res;

                if (succeeded && data) {
                    setData(data);
                    updateKpiReports(data);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        },
        [turnOnLoading, turnOffLoading, showNotification]
    );

    const updateKpiReports = (data: IKpiReports[]): IKpiReportsUnit[] => {
        const newDataMap = data.reduce<Map<string, IKpiReportsUnit>>((acc, item) => {
            item.kpiUnitsReports?.forEach(unit => {
                const existingUnit = acc.get(unit.unitId);
                if (existingUnit) {
                    existingUnit.totalAttrition.push(unit.totalAttrition);
                    existingUnit.kpiChildUnitsReports.push(unit.kpiChildUnitsReports);
                } else {
                    acc.set(unit.unitId, {
                        ...unit,
                        totalAttrition: [unit.totalAttrition],
                        kpiChildUnitsReports: [unit.kpiChildUnitsReports]
                    });
                }
            });
            return acc;
        }, new Map());

        return Array.from(newDataMap.values());
    };

    useEffect(() => {
        fetchData(defaultFormValues);
    }, [fetchData, defaultFormValues]);

    const handleChangeYear = (value: Dayjs) => {
        const newQuarterOptions = defaultQuarterOptions.map(item => {
            if (item.label === 'Quarter: None') return { ...item };

            const isDisabled: boolean = dayjs(getQuarterRange(value, item.value).fromDate).isAfter(dayjs());

            if (isDisabled && item.value === filterForm.getFieldValue('quarter')) {
                filterForm.setFieldsValue({ quarter: 0 });
            }

            return {
                ...item,
                disabled: isDisabled
            };
        });

        setQuarterOptions(newQuarterOptions);
    };

    const onResetFilter = () => {
        filterForm.setFieldsValue(defaultFormValues);
        fetchData(defaultFormValues);
    };

    const filterData: IFilterData[] = [
        {
            key: 'year',
            label: 'Select Year',
            forColumns: [],
            alwaysShow: true,
            initialValue: dayjs(),
            control: <DatePicker picker="year" allowClear={false} format="YYYY" disabledDate={date => date > dayjs()} onChange={handleChangeYear} />
        },
        {
            key: 'quarter',
            label: 'Select Quarter',
            forColumns: [],
            alwaysShow: true,
            initialValue: quarterOptions[0].value,
            control: <BaseSelect size="small" options={quarterOptions} allowClear={false} filterSort={() => 0} />
        }
    ];

    const renderWeekColumns = useCallback(() => {
        return data.map((col, index) => ({
            key: `W${col.weekNumber}`,
            title: col.weekNumber > 9 ? `W${col.weekNumber}` : `W0${col.weekNumber}`,
            width: 64,
            className: col.weekNumber === dayjs().week() && dayjs().year() === col.year ? 'active-col-week' : '',
            render: (record: IKpiReportsUnit) => <WeekColumn col={col} index={index} record={record} />,
            align: 'center' as any,
            onHeaderCell: () => ({
                onClick: () => setDetailWeekModal(col)
            })
        }));
    }, [data]);

    const columns: TableColumnType<IKpiReportsUnit>[] = useMemo(() => {
        return [
            {
                key: 'unitName',
                title: '',
                width: 190,
                fixed: 'left',
                render: (record: any) => renderWithFallback(record?.unitName)
            },
            ...renderWeekColumns()
        ];
    }, [renderWeekColumns]);

    const rowClassName = (record: IKpiReportsUnit, index: number) => {
        const baseClass = index % 2 === 0 ? 'table-row-dark' : 'table-row-light';
        return record.unitName === 'TMA' ? `table-row-tma ${baseClass}` : baseClass;
    };

    const memoizedDataSource = useMemo(() => updateKpiReports(data), [data]);

    return (
        <DetailContent rootClassName="kpi-container">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pathnames.reports.kpiReport.main.name}
                loading={false}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={onResetFilter}
                onFilter={fetchData}
            />
            <div>
                <span className="title">Attrition</span>
                <BaseTable
                    dataSource={memoizedDataSource}
                    columns={columns}
                    loading={isLoading}
                    rowKey="unitId"
                    className="kpi-table"
                    rowClassName={rowClassName}
                />
            </div>
            <DialogKpiReport open={Boolean(detailWeekModal)} onClose={() => setDetailWeekModal(undefined)} detailWeekModal={detailWeekModal} />
        </DetailContent>
    );
};

const WeekColumn = React.memo(({ col, index, record }: IWeekColumn) => {
    const detailData = Array.isArray(record.kpiChildUnitsReports[index]) ? record.kpiChildUnitsReports[index] : [record.kpiChildUnitsReports[index]];

    return record.unitName === 'TMA' ? (
        renderWithFallback(record?.totalAttrition[index])
    ) : (
        <PopoverKpiReport
            header={{ year: col?.year, week: col?.weekNumber, name: record?.unitName }}
            detail={detailData as IKpiReportsUnit[]}
            value={renderWithFallback(record?.totalAttrition[index])}
        />
    );
});

export default KpiReportPage;
