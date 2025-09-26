import DetailContent from '@/components/common/detail-management/detail-content';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import {
    IChartExperienceDetail,
    IParamsChartExperienceDetail,
    ITableChartExperienceDetail,
    ITitleDynamic
} from '@/types/reports/resource-experience';
import { Button, Form, Select, Spin, TableColumnType, Tooltip } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useState } from 'react';
import './index.scss';
import useLoading from '@/utils/hook/useLoading';
import resourceExperienceServices from '@/services/reports/resource-experience';
import useNotify from '@/utils/hook/useNotify';
import { remapUnits } from '@/utils/common';
import reportService from '@/services/reports/report';
import TreeSelect from '@/components/common/form/tree-select';
import BaseTable from '@/components/common/table/table';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';

const ChartExperienceDetail = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [filterForm] = Form.useForm();
    const [projectOptions, setProjectOptions] = useState<IEmployeeUnit[]>([]);
    const [isShowContent, setIsShowContent] = useState(false);
    const [dataReport, setDataReport] = useState<IChartExperienceDetail>();
    const [isValidRange, setIsValidRange] = useState(true);

    const [titleDynamic, setTitleDynamic] = useState<ITitleDynamic>(getTitleDynamic);

    const renderColumns = (item: number, record: ITableChartExperienceDetail) => {
        const formattedItem = renderWithFallback(item);

        if (record.title === '%' && item) {
            return `${formattedItem}%`;
        }

        return formattedItem;
    };

    const generateDataTable = (dataReport: IChartExperienceDetail | undefined): ITableChartExperienceDetail[] => [
        {
            key: 1,
            title: 'Total Employee',
            range0: dataReport?.range0,
            range1: dataReport?.range1,
            range2: dataReport?.range2,
            range3: dataReport?.range3,
            total: dataReport?.total
        },
        {
            key: 2,
            title: '%',
            range0: dataReport?.range0Percent,
            range1: dataReport?.range1Percent,
            range2: dataReport?.range2Percent,
            range3: dataReport?.range3Percent,
            total: dataReport?.totalPercent
        }
    ];

    function getTitleDynamic(x: number = 1, y: number = 2) {
        return {
            title0: {
                title: `< ${x} year`,
                tooltip: `< ${x * 12} months`
            },
            title1: {
                title: `>= ${x} and < ${x + y} years`,
                tooltip: `>= ${x * 12} months and < ${(x + y) * 12} months`
            },
            title2: {
                title: `>= ${x + y} and < ${x + y + y} years`,
                tooltip: `>= ${(x + y) * 12} months and < ${(x + y + y) * 12} months`
            },
            title3: {
                title: `>= ${x + y + y} years`,
                tooltip: `>= ${(x + y + y) * 12} months`
            }
        };
    }

    const generateChartData = (dataReport: IChartExperienceDetail | undefined) => [
        { type: titleDynamic.title0.title, value: dataReport?.range0Percent },
        { type: titleDynamic.title1.title, value: dataReport?.range1Percent },
        { type: titleDynamic.title2.title, value: dataReport?.range2Percent },
        { type: titleDynamic.title3.title, value: dataReport?.range3Percent }
    ];

    const generateEChartOptions = (data: any[]) => {
        const colors = ['#008000', '#aa4643', '#80699b', '#ff8d1a'];
        const dataFormat = data.map((item, index) => ({ name: item.type, value: item.value, color: colors[index] })).filter(item => item.value);

        return {
            tooltip: {
                formatter: `{b}: {d}%`
            },
            color: dataFormat.map(item => item.color),
            series: [
                {
                    type: 'pie',
                    data: dataFormat,
                    label: {
                        formatter: '{d}%'
                    }
                }
            ]
        };
    };

    const columns: TableColumnType<ITableChartExperienceDetail>[] = [
        {
            dataIndex: 'title',
            key: 'title',
            title: '',
            width: 200,
            align: 'center',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'range0',
            key: 'range0',
            title: <Tooltip title={titleDynamic.title0.tooltip}>{titleDynamic.title0.title}</Tooltip>,
            width: 200,
            align: 'center',
            render: renderColumns
        },
        {
            dataIndex: 'range1',
            key: 'range1',
            title: <Tooltip title={titleDynamic.title1.tooltip}>{titleDynamic.title1.title}</Tooltip>,
            width: 200,
            align: 'center',
            render: renderColumns
        },
        {
            dataIndex: 'range2',
            key: 'range2',
            title: <Tooltip title={titleDynamic.title2.tooltip}>{titleDynamic.title2.title}</Tooltip>,
            width: 200,
            align: 'center',
            render: renderColumns
        },
        {
            dataIndex: 'range3',
            key: 'range3',
            title: <Tooltip title={titleDynamic.title3.tooltip}>{titleDynamic.title3.title}</Tooltip>,
            width: 200,
            align: 'center',
            render: renderColumns
        },
        {
            dataIndex: 'total',
            key: 'total',
            title: 'Total',
            width: 200,
            align: 'end',
            render: renderColumns
        }
    ];

    const fetchOptions = useCallback(async () => {
        turnOnLoading();
        try {
            const { data, succeeded } = await reportService.getAllIndexes();
            if (succeeded) setProjectOptions(data?.units || []);
        } catch {
            showNotification(false, 'Failed to fetch project options.');
        } finally {
            turnOffLoading();
        }
    }, [turnOffLoading, turnOnLoading, showNotification]);

    const fetchData = useCallback(
        async (values?: IParamsChartExperienceDetail) => {
            const { minimumYear, yearRange } = values || {};
            if ((minimumYear && !yearRange) || (!minimumYear && yearRange)) {
                setIsValidRange(false);
                return;
            }
            turnOnLoading();
            const title = getTitleDynamic(Number(minimumYear || 1), Number(yearRange || 2));
            setTitleDynamic(title);
            setIsValidRange(true);
            try {
                const { succeeded, data } = await resourceExperienceServices.getChartExperience(values);
                if (succeeded) {
                    setIsShowContent(true);
                    setDataReport(data);
                }
            } catch {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        },
        [turnOffLoading, turnOnLoading, showNotification]
    );

    useEffect(() => {
        fetchOptions();
    }, [fetchData, fetchOptions]);

    const isDisableYear = !Form.useWatch('unitId', filterForm);

    return (
        <Spin spinning={isLoading}>
            <DetailContent rootClassName="chart-experience-detail">
                <Form form={filterForm} onFinish={fetchData} className="filter-form">
                    <div className="config-container">
                        <Form.Item label="Choose Project:" name="unitId">
                            <TreeSelect treeData={remapUnits(projectOptions)} placeholder="Select an option" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Search
                        </Button>
                    </div>
                    <div className="choose-year">
                        <Form.Item label="Choose minimum year:" name="minimumYear">
                            <Select options={[1, 2, 3, 4, 5, 6].map(item => ({ label: item, value: item }))} disabled={isDisableYear} />
                        </Form.Item>
                        <Form.Item label="and year range:" name="yearRange">
                            <Select options={[1, 2, 3, 4, 5, 6].map(item => ({ label: item, value: item }))} disabled={isDisableYear} />
                        </Form.Item>
                        {!isValidRange && <h4 className="footer-config">Please enter min year and range year</h4>}
                    </div>
                    <h4 className="footer-config">Years of experience include Experience before joining TMA and Experience in TMA.</h4>
                </Form>

                {isShowContent && (
                    <div className="chart-experience-detail__container">
                        <BaseTable
                            dataSource={generateDataTable(dataReport)}
                            columns={columns}
                            pagination={false}
                            bordered
                            rowClassName={() => ''}
                            scroll={{ x: 400 }}
                            className="chart-experience-detail__table"
                        />
                        <ReactECharts
                            option={generateEChartOptions(generateChartData(dataReport))}
                            style={{ height: 370 }}
                            opts={{ renderer: 'svg' }}
                        />
                    </div>
                )}
            </DetailContent>
        </Spin>
    );
};

export default ChartExperienceDetail;
