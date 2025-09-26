import Loading from '@/components/common/loading';
import { ISummaryProps } from '@/types/reports/employee-summary';
import ReactECharts from 'echarts-for-react';

interface IBarChartProps extends ISummaryProps<any> {
    title: string;
    chartRef: React.RefObject<ReactECharts>;
}

const StackedBarChart = (props: IBarChartProps) => {
    const { dataProps, isLoading, title, chartRef } = props;

    const calculatedHeight = dataProps.length * 20 + 200;

    const transformData = (data: any[]) => {
        // Group by universityName
        const groupedByUniversity = data.reduce(
            (acc, item) => {
                if (!acc[item.universityName]) {
                    acc[item.universityName] = {};
                }
                if (!acc[item.universityName][item.unitName]) {
                    acc[item.universityName][item.unitName] = 0;
                }
                acc[item.universityName][item.unitName] += item.number;
                return acc;
            },
            {} as Record<string, Record<string, number>>
        );

        // Sort yAxisData alphabetically
        const yAxisData = Object.keys(groupedByUniversity).sort((a, b) => b.localeCompare(a));

        // Prepare series with sorted data
        const unitNames = Array.from(new Set(data.map(item => item.unitName)));
        const series = unitNames.map(unitName => ({
            name: unitName,
            type: 'bar',
            stack: 'total',
            label: {
                show: false // Default to hidden
            },
            data: yAxisData.map(universityName => groupedByUniversity[universityName][unitName] || 0)
        }));

        // Calculate totals for each university in sorted order
        const totals = yAxisData.map(universityName =>
            unitNames.reduce((sum, unitName) => sum + (groupedByUniversity[universityName][unitName] || 0), 0)
        );

        // Set label for the last series to display totals
        series[series.length - 1] = {
            ...series[series.length - 1],
            label: {
                show: true,
                position: 'right',
                formatter: (params: any) => `${totals[params.dataIndex]}` // Show total values
            } as any
        };

        return { series, yAxisData, totals };
    };

    const { series, yAxisData, totals } = transformData(dataProps);

    const options = {
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
                const filteredData = params.filter((item: any) => item.value >= 1);
                const universityName = params[0].axisValueLabel;

                let tooltipContent = `<div><strong>${universityName}</strong></div><div style="margin-bottom: 8px;"></div>`;

                tooltipContent += filteredData
                    .map(
                        (item: any) => `
                    <div>
                        <div style="display: flex; justify-content: space-between;align-items: center">
                            <div>
                                <span style=" margin-right: 6px; color: ${item.color};">●</span>
                                <span>${item.seriesName}</span>
                            </div>
                            <b style=" margin-left: 20px;">${item.value}</b>
                        </div>
                    </div>
                `
                    )
                    .join('');

                // Add the total row
                const total = totals[params[0].dataIndex] || 0;
                tooltipContent += `
                    <div>
                        <div style="display: flex; justify-content: space-between;align-items: center">
                            <div>
                                <span style=" margin-right: 6px; color: #000;">●</span>
                                <span style="font-weight: 600">Total</span>
                            </div>
                            <b style="margin-left: 20px; font-weight:600">${total}</b>
                        </div>
                    </div>
                `;

                return tooltipContent;
            }
        },
        legend: {
            data: series.map(s => s.name),
            orient: 'vertical',
            left: 'right',
            top: 50,
            formatter: (name: string) => {
                const maxLength = 20;
                return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
            }
        },
        grid: {
            top: '50',
            left: '100',
            right: '200',
            bottom: '50',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: props.tabName === 'Contractor' ? 'Graduated Contractor' : 'Graduated Employees',
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
            data: yAxisData,
            axisLabel: {
                formatter: (value: string) => {
                    const maxLength = 50;
                    return value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
                },
                fontSize: 12,
                margin: 8
            }
        },
        series
    };

    return isLoading ? (
        <Loading />
    ) : (
        <>
            <ReactECharts ref={chartRef} option={options} style={{ height: calculatedHeight }} opts={{ renderer: 'svg' }} />;
        </>
    );
};

export default StackedBarChart;
