import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import { IPositionSummary, ISummaryProps } from '@/types/reports/employee-summary';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import BarChart from '../../../util/chart/bar-chart';

interface ITabChartPositionSummaryProps extends ISummaryProps<IPositionSummary> {}

const ChartPositionSummary = (props: ITabChartPositionSummaryProps) => {
    const { ...otherProps } = props;
    const chartRef = useRef<ReactECharts | null>(null);

    return (
        <>
            <Flex justify="space-between" className="chart-item__header">
                <h6 className="title" />
                <ButtonDownloadChart chartRef={chartRef} />
            </Flex>

            <BarChart
                {...otherProps}
                chartRef={chartRef}
                xField="positionName"
                nameX={otherProps.tabName === 'Contractor' ? 'Contractor' : 'Employees'}
                yField="totalEmployee"
                nameTooltip={`By ${dayjs().year()}`}
                title="Position Summary Of TMA Solution"
            />
        </>
    );
};

export default ChartPositionSummary;
