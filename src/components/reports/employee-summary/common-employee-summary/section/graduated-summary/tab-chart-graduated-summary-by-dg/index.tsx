import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import { IGraduatedSummary, ISummaryProps } from '@/types/reports/employee-summary';
import { ORG_UNITS } from '@/utils/constants';
import { Flex } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';
import StackedBarChart from '../../../util/chart/stacked-bar-chart';

interface ITabChartGraduatedSummaryByDGProps extends ISummaryProps<IGraduatedSummary> {}

const ChartGraduatedSummaryByDG = (props: ITabChartGraduatedSummaryByDGProps) => {
    const { dataProps, ...otherProps } = props;
    const chartRef = useRef<ReactECharts>(null);

    // Step 1: Delete the last element in the array, "Total Employees"
    const filteredData = dataProps.filter(item => item.universityName !== 'Total Employees');

    const processUniversityData = (universities: IGraduatedSummary[]) => {
        return universities.flatMap(uni => uni.graduatedByDGDtos.filter(dg => dg.unitId !== 999999 && dg.number !== 0));
    };

    const flattenedData = processUniversityData(filteredData);

    return (
        <>
            <Flex justify="space-between" className="chart-item__header">
                <h6 className="title" />
                <ButtonDownloadChart chartRef={chartRef} />
            </Flex>

            <StackedBarChart chartRef={chartRef} dataProps={flattenedData} {...otherProps} title={`Chart Graduated Summary By ${ORG_UNITS.DG}`} />
        </>
    );
};

export default ChartGraduatedSummaryByDG;
