import { IData } from '@/types/reports/span-of-control-report';
import { formatNumberWithDecimalPlaces } from '@/utils/common';
import { colorCharts } from '@/utils/constants';
import { Card, Divider, Flex } from 'antd';
import ReactECharts from 'echarts-for-react';
import './index.scss';
interface PieChartCardProps {
    title: string;
    data: IData[];
    onLegendClick?: (index: number) => void;
    titleClassName?: string;
}

const PieChartCard = ({ title, data, onLegendClick, titleClassName }: PieChartCardProps) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);

    const generateEChartOptions = (data: any[], title: string) => {
        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const percentage = formatNumberWithDecimalPlaces((params.value / total) * 100);
                    return `
                ${params.data.type} : ${params.value} <br/>
                    <div style="text-align: center;">
                        <strong>${percentage}%</strong>
                    </div>
                `;
                }
            },
            legend: {
                show: false
            },
            color: colorCharts,
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: '70%',
                    data: data.filter(item => item.value !== 0),
                    label: {
                        formatter: (params: any) => {
                            const percentage = formatNumberWithDecimalPlaces((params.value / total) * 100);
                            return `${percentage}%`;
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    };

    return (
        <Card className="pie-chart-card">
            <h3 className={`pie-chart-card-title ${titleClassName}`}>{title}</h3>
            <Divider type="horizontal" />
            <Flex align="center">
                <ReactECharts option={generateEChartOptions(data, title)} style={{ width: 400, height: 300 }} opts={{ renderer: 'svg' }} />
                <Flex align="center" wrap="wrap" className="pie-chart-legend-wrapper">
                    {data.map((count: any, index: number) => {
                        return (
                            <Card
                                type="inner"
                                key={index}
                                title={
                                    <>
                                        {count.type} <span>({count.value})</span>
                                    </>
                                }
                                styles={{
                                    body: {
                                        borderBottom: `4px solid ${colorCharts[index]}`
                                    }
                                }}
                            >
                                <Flex justify="center" align="center" className="pie-chart-card-content">
                                    <h3
                                        onClick={() => count.value / total && onLegendClick?.(index)}
                                        className={count.value / total ? '' : 'h3--disable'}
                                    >
                                        {formatNumberWithDecimalPlaces((count.value / total) * 100) || 0}%
                                    </h3>
                                </Flex>
                            </Card>
                        );
                    })}
                </Flex>
            </Flex>
        </Card>
    );
};

export default PieChartCard;
