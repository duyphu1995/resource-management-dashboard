import { IEffortGradeSummaryChart } from '@/types/reports/staff-grade-index-report';
import { formatNumberWithDecimalPlaces, getMaxGradeIndex } from '@/utils/common';
import { Empty, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import './index.scss';
export interface IEffortGradeSummaryChartProps {
    data: IEffortGradeSummaryChart[];
    isLoading: boolean;
    getFieldValue: string;
    titleChart: string;
    totalBox?: boolean;
}

const ChartMixLineBar = (props: IEffortGradeSummaryChartProps) => {
    const { data, isLoading, totalBox = false, getFieldValue = '', titleChart = '' } = props;

    const processData = (data: any[], keyPrefix: string) => {
        const maxGradeIndex = getMaxGradeIndex(data, keyPrefix);
        const grade = Array.from({ length: maxGradeIndex }, (_, i) => `${i + 1}`);

        if (data.length === 0) {
            return { barsData: [], lineSeries: { name: 'TMA Total', type: 'line', data: [] }, grade };
        }

        const barsData = data
            .filter(d => d.dcName !== 'TMA Total')
            .map(d => ({
                name: d.dcName,
                type: 'bar',
                data: grade.map((_, index) => d[`${keyPrefix}${index + 1}`] || 0),
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => (params.value > 0 ? params.value : ''),
                    fontSize: 10
                }
            }));

        const lineData = data.find(d => d.dcName === 'TMA Total');
        const lineSeries = {
            name: 'TMA Total',
            type: 'line',
            data: lineData ? grade.map((_, index) => lineData[`${keyPrefix}${index + 1}`] || 0) : [],
            label: {
                show: true,
                distance: 10
            }
        };

        return { barsData, lineSeries, grade };
    };

    const generateStaffGradeIndexItems = (data: any[]) =>
        ['DC Total', 'Department Total', 'TMA Total'].map(dcName => {
            const item = data.find(d => d.dcName === dcName);
            return {
                total: dcName,
                staffGradeIndex: 'Staff Grade Index',
                value: formatNumberWithDecimalPlaces(item?.staffGradeIndex)
            };
        });

    const generateEChartOptions = (title: string, barsData: any[], lineSeries: any, grade: string[]) => ({
        title: {
            text: title,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params: any) => {
                // Extract the x-axis label (name) from the first item
                const xAxisName = params[0]?.name;

                // Generate the tooltip content
                const tooltipContent = params
                    .map((item: any, index: number) => {
                        // Display the x-axis name only for the first item
                        const nameDisplay = index === 0 ? `<strong>Grade: ${xAxisName}</strong><br/>` : '';

                        return `
                            ${nameDisplay}
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="margin-right: 5px;">
                                    <span style="font-size: 20px; margin-right: 6px; color: ${item.color};">●</span>
                                    ${item.seriesName}:
                                </div>
                                <span><strong>${item.value}</strong></span>
                            </div>
                        `;
                    })
                    .join('');

                return tooltipContent;
            }
        },
        legend: {
            bottom: 'bottom',
            data: [...barsData.map(d => d.name), lineSeries.name]
        },
        xAxis: {
            type: 'category',
            data: grade
        },
        yAxis: {
            type: 'value'
        },

        grid: {
            top: '50',
            left: '50',
            right: '50',
            bottom: '50',
            containLabel: true
        },
        series: [...barsData, lineSeries]
    });

    const staffGradeIndexItems = generateStaffGradeIndexItems(data);
    const { barsData, lineSeries, grade } = processData(data, getFieldValue);
    const options = generateEChartOptions(titleChart, barsData, lineSeries, grade);

    const renderChart = () => {
        if (!data.length) {
            return (
                <Empty
                    description={
                        <h1>
                            <div>N/A</div>
                            <div>No Data To Calculate</div>
                        </h1>
                    }
                />
            );
        }

        return (
            <ReactECharts
                key={`${isLoading}-${JSON.stringify(data)}`}
                option={options}
                style={{ height: 416, width: '100%', paddingBottom: 16 }}
                opts={{ renderer: 'svg' }}
            />
        );
    };

    const renderTotalBox = () => {
        if (!totalBox) return null;

        return (
            <div className="staff-grade-index">
                {staffGradeIndexItems.map((item, index) => (
                    <div key={index} className="item">
                        <div className="item__label">
                            <div>{item.total}</div>
                            <div>{item.staffGradeIndex}</div>
                        </div>
                        <p className="item__value">{item.value}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Spin spinning={isLoading}>
            {renderChart()}
            {renderTotalBox()}
        </Spin>
    );
};

export default ChartMixLineBar;
