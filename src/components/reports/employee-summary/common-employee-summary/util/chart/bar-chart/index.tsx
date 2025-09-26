import Loading from '@/components/common/loading';
import { ISummaryProps } from '@/types/reports/employee-summary';
import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { ReactNode } from 'react';

interface IBarChartProps extends ISummaryProps<any> {
    xField: string;
    yField: string;
    nameTooltip?: ReactNode;
    title?: string;
    nameX?: string;
    showLegend?: boolean;
    tooltipFormatter?: (params: any) => string;
    chartRef: React.RefObject<ReactECharts>;
}

const BarChart = (props: IBarChartProps) => {
    const { dataProps, isLoading, xField, nameX = '', yField, nameTooltip = '', title, showLegend = false, tooltipFormatter, chartRef } = props;

    const sortedData = [...dataProps].sort((a, b) => String(b[xField]).localeCompare(String(a[xField])));

    const dataLength = sortedData.length;
    const calculatedHeight = dataLength * 31 + 200;

    const defaultFormatter = (params: any) => {
        const data = params[0];
        return `<strong>${data.name}</strong><br/><span style="font-size: 20px; margin-right: 6px; color: ${data.color};">●</span>${nameTooltip}: <strong>${data.value}</strong> contractor`;
    };

    const options: EChartsOption = {
        title: {
            text: title,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: tooltipFormatter || defaultFormatter
        },
        legend: {
            show: showLegend
        },
        responsive: true,
        xAxis: {
            type: 'value',
            name: nameX,
            nameLocation: 'end',
            nameGap: 20,
            nameTextStyle: {
                fontSize: 14,
                fontWeight: 600,
                verticalAlign: 'bottom',
                padding: [0, 0, -50, 0]
            }
        },
        yAxis: {
            type: 'category',
            data: sortedData.map(item => item[xField]),
            axisLabel: {
                formatter: (value: string) => {
                    const maxLength = 50;
                    return value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
                },
                fontSize: 12,
                margin: 8
            }
        },
        grid: {
            top: '50',
            left: '100',
            right: '170',
            bottom: '50',
            containLabel: true
        },
        series: [
            {
                type: 'bar',
                data: sortedData.map(item => item[yField]),
                label: {
                    show: true,
                    position: 'right'
                },
                itemStyle: {
                    color: '#4c8fe5'
                }
            }
        ]
    };

    return isLoading ? <Loading /> : <ReactECharts ref={chartRef} option={options} style={{ height: calculatedHeight }} opts={{ renderer: 'svg' }} />;
};

export default BarChart;
