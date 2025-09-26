import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import DetailInfo from '@/components/common/detail-management/detail-info';
import FilterDateRange from '@/components/common/list-management/filter/filter-date-range';
import ReportFilter from '@/components/common/report-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import contractorStatisticReportServices from '@/services/reports/contractor-statistic-report';
import reportService from '@/services/reports/report';
import { IFilterData } from '@/types/filter';
import {
    IContractorStatisticBasicDto,
    IContractorStatisticReport,
    IFilterFormValues,
    IStatisticChartConfig
} from '@/types/reports/contractor-statistic-report';
import { formatDataTable, remapUnits } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import { Button, Form, Table, TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';
import useNotify from '@/utils/hook/useNotify';
import dayjs from 'dayjs';
import TreeSelect from '@/components/common/form/tree-select';

const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.contractorStatisticReport.main.name }];

const ContractorStatisticReportPage = () => {
    const { showNotification } = useNotify();
    const [filterForm] = Form.useForm();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [isLoadingFilter, setIsLoadingFilter] = useState<boolean>(false);
    const [dataReport, setDataReport] = useState<IContractorStatisticReport>();
    const [units, setUnits] = useState<{ label: string; value: string }[] | []>([]);
    const [isShowTable, setIsShowTable] = useState(false);

    const initialFilterValues = useMemo(
        () => ({
            unitIds: '',
            dateRange: { fromDate: dayjs().startOf('year'), toDate: dayjs() }
        }),
        []
    );

    const filterData: IFilterData[] = [
        {
            key: 'unitIds',
            label: 'Select Unit',
            forColumns: [],
            alwaysShow: true,
            initialValue: '',
            control: <TreeSelect treeData={[{ label: 'TMA Solutions', value: '', children: units }]} />
        },
        {
            key: 'dateRange',
            label: 'Date Range',
            forColumns: [],
            colSpan: 12,
            show: true,
            initialValue: { fromDate: dayjs().startOf('year'), toDate: dayjs() },
            control: <FilterDateRange fromName="fromDate" toName="toDate" allowClear={false} />
        }
    ];

    useEffect(() => {
        const fetchFilterData = async () => {
            setIsLoadingFilter(true);
            try {
                const res = await reportService.getAllIndexes();
                const { data, succeeded } = res;
                if (succeeded) {
                    setUnits(remapUnits(data?.units));
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch filter data');
            } finally {
                setIsLoadingFilter(false);
            }
        };

        fetchFilterData();
    }, [filterForm, showNotification]);

    const fetchData = useCallback(
        async (values: IFilterFormValues) => {
            turnOnLoading();
            try {
                const { unitIds } = values;

                const payload = {
                    ...values,
                    unitIds: unitIds ? [unitIds.toString()] : undefined
                };

                const response = await contractorStatisticReportServices.getContractorStatisticReportData(payload);
                const { data, succeeded } = response;

                if (succeeded) {
                    setDataReport(data);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        },
        [turnOnLoading, turnOffLoading, showNotification]
    );

    const getDefaultDateRange = () => ({
        fromDate: dayjs().startOf('year').format('YYYY-MM-DD'),
        toDate: dayjs().format('YYYY-MM-DD')
    });

    const handleResetFilter = () => {
        filterForm.setFieldsValue(initialFilterValues);
        fetchData({ unitIds: '', ...getDefaultDateRange() });
    };

    useEffect(() => {
        fetchData({ unitIds: '', ...getDefaultDateRange() });
    }, [fetchData, initialFilterValues]);

    const columnsPieChart: TableColumnType<IStatisticChartConfig>[] = [
        {
            dataIndex: 'title',
            key: 'title',
            title: '',
            width: 200,
            className: 'border-bottom-blue',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalNewGrade',
            key: 'totalNewGrade',
            title: 'New Grade',
            width: 200,
            align: 'center',
            className: 'border-bottom-color-1',
            render: (item, record) => renderColumnWithPercentage(item, record)
        },
        {
            dataIndex: 'totalExperienced',
            key: 'totalExperienced',
            title: 'Experienced',
            width: 200,
            align: 'center',
            className: 'border-bottom-color-2',
            render: (item, record) => renderColumnWithPercentage(item, record)
        },
        {
            dataIndex: 'total',
            key: 'total',
            title: 'Total',
            width: 200,
            align: 'center',
            className: 'border-bottom-blue',
            render: (item, record) => renderColumnWithPercentage(item, record)
        }
    ];

    const renderColumnWithPercentage = (item: any, record: IStatisticChartConfig) => {
        const value = renderWithFallback(item);
        return record.title === 'Contractor(s)' ? value : `${value}%`;
    };

    const columns: TableColumnType<IContractorStatisticBasicDto>[] = [
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC Name',
            width: 200,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'newGrade',
            key: 'newGrade',
            title: 'New Grade',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'experienced',
            key: 'experienced',
            title: 'Experienced',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'onWorking',
            key: 'onWorking',
            title: 'On-Working',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'convertToEmployee',
            key: 'convertedToEmployee',
            title: 'Converted to Employee',
            width: 200,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'endedContract',
            key: 'endedContract',
            title: 'Ended Contract',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'dcTotal',
            key: 'dcTotal',
            title: 'DC Total',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(item)
        }
    ];

    const resultChart: IStatisticChartConfig[] = useMemo(
        () => [
            {
                title: 'Contractor(s)',
                totalNewGrade: dataReport?.contractorSatisticInfo.totalNewGrade,
                totalExperienced: dataReport?.contractorSatisticInfo.totalExperienced,
                total: (dataReport?.contractorSatisticInfo.totalNewGrade || 0) + (dataReport?.contractorSatisticInfo.totalExperienced || 0)
            },
            {
                title: 'Percentage (%)',
                totalNewGrade: Math.round(dataReport?.contractorSatisticInfo.percentNewGrade || 0),
                totalExperienced: Math.round(dataReport?.contractorSatisticInfo.percentExperienced || 0),
                total: (dataReport?.contractorSatisticInfo.percentNewGrade || 0) + (dataReport?.contractorSatisticInfo.percentExperienced || 0)
            }
        ],
        [dataReport?.contractorSatisticInfo]
    );

    const dataChart = useMemo(() => {
        return [
            {
                name: 'New Grade',
                value: Math.round(dataReport?.contractorSatisticInfo.percentNewGrade || 0),
                contractor: dataReport?.contractorSatisticInfo.totalNewGrade,
                color: '#008000'
            },
            {
                name: 'Experienced',
                value: Math.round(dataReport?.contractorSatisticInfo.percentExperienced || 0),
                contractor: dataReport?.contractorSatisticInfo.totalExperienced,
                color: '#aa4643'
            }
        ].filter(item => item.value);
    }, [dataReport?.contractorSatisticInfo]);

    const pieChartOptions = {
        color: dataChart.map(item => item.color),
        series: [
            {
                name: 'type',
                type: 'pie',
                radius: '70%',
                data: dataChart,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    formatter: '{d}%'
                }
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const { name, contractor } = params.data || {};

                return `
                    ${name}: ${contractor} contractors <br/>
                        <div style="text-align: center;">
                            <strong>${params.value}%</strong>
                        </div>
                    `;
            }
        }
    };

    return (
        <DetailContent rootClassName="contractor-statistic-report">
            <BaseBreadcrumb dataItem={breadcrumb} />
            <ReportFilter
                pageTitle={pathnames.reports.contractorStatisticReport.main.name}
                loading={isLoadingFilter}
                data={filterData}
                filterForm={filterForm}
                onResetFilter={handleResetFilter}
                onFilter={fetchData}
            />
            <p className="generated-time">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</p>
            <DetailInfo title="TMA Solutions - Statistic Report">
                <ReactECharts option={pieChartOptions} style={{ height: 400, width: '100%' }} opts={{ renderer: 'svg' }} />
                <Table bordered dataSource={formatDataTable(resultChart) || []} columns={columnsPieChart} pagination={false} />
            </DetailInfo>
            <Button type="default" onClick={() => setIsShowTable(!isShowTable)} className="toggle-details-btn">
                Toggle Details
            </Button>
            {isShowTable && (
                <div className="table-details">
                    <p>Note: Total Contractor = On-working + Converted To Employee + Ended Contract</p>
                    <BaseTable
                        columns={columns}
                        dataSource={formatDataTable(dataReport?.contractorStatisticBasicDtos) || []}
                        pagination={false}
                        loading={isLoading}
                        bordered
                        scroll={{ x: 1200 }}
                        footer={() => `Total: ${dataReport?.contractorStatisticBasicDtos.reduce((acc, cur) => acc + cur.dcTotal, 0)}`}
                    />
                </div>
            )}
        </DetailContent>
    );
};

export default ContractorStatisticReportPage;
