import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import { IGraduatedSummary, ISummaryProps } from '@/types/reports/employee-summary';
import { Flex } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import BarChart from '../../../util/chart/bar-chart';

interface ITabChartGraduatedSummaryProps extends ISummaryProps<IGraduatedSummary> {}

const ChartGraduatedSummary = (props: ITabChartGraduatedSummaryProps) => {
    const { dataProps, ...otherProps } = props;
    const chartRef = useRef<ReactECharts | null>(null);

    // Step 1: Delete the last element in the array, "Total Employees"
    const filteredData = dataProps.filter(item => item.universityName !== 'Total Employees');

    // Initialize other groups object
    const otherGroups = {
        universityName: 'other Groups',
        number: 0
    };

    // Step 2: Process the data to group other groups and collect normal entries
    const result = filteredData.flatMap(university => {
        const totalGraduated = university.graduatedByDGDtos.find(item => item.unitId === 999999);

        if (totalGraduated) {
            if (totalGraduated.isOtherGroup) {
                otherGroups.number += totalGraduated.number;
                return [];
            } else {
                return [
                    {
                        universityName: university.universityName,
                        number: totalGraduated.number
                    }
                ];
            }
        }
        return [];
    });

    // Step 3: Add other groups to the result array
    if (otherGroups.number >= 0) {
        result.push(otherGroups);
    }

    return (
        <>
            <Flex justify="space-between" className="chart-item__header">
                <h6 className="title" />
                <ButtonDownloadChart chartRef={chartRef} />
            </Flex>

            <BarChart
                dataProps={result}
                {...otherProps}
                chartRef={chartRef}
                xField="universityName"
                nameX={otherProps.tabName === 'Contractor' ? 'Contractor' : 'Employees'}
                yField="number"
                nameTooltip="Graduated"
                title="Graduated Summary Of TMA Solutions"
            />
        </>
    );
};

export default ChartGraduatedSummary;
