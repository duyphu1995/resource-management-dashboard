import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import resourceProjectionServices from '@/services/resource-plan/resource-projection';
import {
    IOptionsResourceProjection,
    IPropsResourceProjectionChart,
    IResourceProjectionChartData
} from '@/types/resource-plan/resource-projection/resource-projection';
import usePermissions from '@/utils/hook/usePermissions';
import { Empty, Select, Space } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const yearOptions: IOptionsResourceProjection[] = [
    {
        label: dayjs().year().toString(),
        value: dayjs().year().toString()
    },
    {
        label: (dayjs().year() + 1).toString(),
        value: (dayjs().year() + 1).toString()
    }
];

const ResourceProjectionChart = ({ title, unitId, reloadAPI }: IPropsResourceProjectionChart) => {
    const navigation = useNavigate();
    const chartRef = useRef<ReactECharts>(null);

    const [dataChart, setDataChart] = useState<IResourceProjectionChartData[]>([]);
    const [yearSelect, setYearSelect] = useState<number>(dayjs().year());

    const { havePermission } = usePermissions('ResourceProjectionList', 'ResourceProjection');

    const handleChange = (value: string) => {
        // handle chart data by selecting year
        setYearSelect(parseInt(value));
    };

    // Fetch Chart
    useEffect(() => {
        const fetchChartData = async () => {
            const response = await resourceProjectionServices.getChartDataByUnit(unitId, yearSelect);
            const { data, succeeded } = response;
            if (succeeded && data) {
                const formattedData = data.map((item: any) => ({
                    month: dayjs()
                        .month(item.month - 1)
                        .format('MMM'),
                    ...item.data
                }));

                setDataChart(formattedData);
            }
        };
        if (unitId || yearSelect) fetchChartData();
    }, [navigation, unitId, yearSelect, reloadAPI]);

    const options = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params: any) => {
                let tooltipText = `${params[0].name}<br/>`;
                params.forEach((item: any) => {
                    const value = item.seriesName === '%NBR' || item.seriesName === 'Target %NBR' ? `${item.value}%` : item.value;
                    tooltipText += `
                        <div style="display: flex; justify-content: space-between; min-width: 180px;">
                            <span>${item.marker}&nbsp;${item.seriesName}:&nbsp;</span>
                            <strong>${value}</strong>
                        </div>
                    `;
                });
                return tooltipText;
            }
        },
        legend: {
            data: ['Headcount', '#Billable', 'Target #Billable', '%NBR', 'Target %NBR'],
            bottom: 0
        },
        xAxis: [
            {
                type: 'category',
                data: dataChart.map(item => item.month)
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Headcount - #Billable - Target #Billable',
                nameLocation: 'middle',
                nameRotate: 90,
                nameGap: 50,
                position: 'left',
                axisLabel: {
                    formatter: '{value}'
                },
                nameTextStyle: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14
                }
            },
            {
                type: 'value',
                name: '%NBR - Target %NBR',
                nameRotate: -90,
                position: 'right',
                nameGap: 50,
                nameLocation: 'middle',
                axisLabel: {
                    formatter: '{value}%'
                },
                nameTextStyle: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14
                }
            }
        ],
        grid: {
            top: '50',
            left: '100',
            right: '100',
            bottom: '50',
            containLabel: true
        },
        series: [
            {
                name: 'Headcount',
                type: 'bar',
                data: dataChart.map(item => item.headcount),
                barMaxWidth: 24,
                barGap: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : '')
                }
            },
            {
                name: '#Billable',
                type: 'bar',
                data: dataChart.map(item => item.billable),
                barMaxWidth: 24,
                barGap: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : '')
                }
            },
            {
                name: 'Target #Billable',
                type: 'bar',
                data: dataChart.map(item => item.targetBillable),
                barMaxWidth: 24,
                barGap: '60%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : '')
                }
            },
            {
                name: '%NBR',
                type: 'line',
                yAxisIndex: 1,
                data: dataChart.map(item => item.nonBillableRatio),
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : '')
                }
            },
            {
                name: 'Target %NBR',
                type: 'line',
                yAxisIndex: 1,
                data: dataChart.map(item => item.targetNonBillableRatio),
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : '')
                }
            }
        ]
    };

    return (
        <div className="resource-projection-chart-container">
            <div className="resource-projection-chart-top">
                <h2 className="resource-projection-chart-title">{title}</h2>
            </div>
            <div className="dropdown-year-title">Year</div>
            <div className="resource-projection-chart-dropdown">
                <Space wrap>
                    <Select defaultValue={yearOptions[0].label} style={{ width: 130 }} onChange={handleChange} options={yearOptions} />
                </Space>
                {havePermission('Download') && (
                    <Space wrap>
                        <ButtonDownloadChart chartRef={chartRef} />
                    </Space>
                )}
            </div>
            <div>
                {dataChart.length > 0 ? (
                    <ReactECharts ref={chartRef} option={options} style={{ height: 500, width: '100%' }} opts={{ renderer: 'svg' }} />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <h1>
                                <div>N/A</div>
                                <div>No Data To Calculate</div>
                            </h1>
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default ResourceProjectionChart;
