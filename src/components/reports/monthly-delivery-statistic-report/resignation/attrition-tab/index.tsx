import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import Loading from '@/components/common/loading';
import BaseTable from '@/components/common/table/table';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IAttrition, IMonthlyStatisticCommon } from '@/types/reports/monthly-delivery-statistic-report';
import { dateMappings, formatDataTable, formatNumberWithDecimalPlaces } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Flex } from 'antd';
import { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.scss';

interface IAttritionProps extends IMonthlyStatisticCommon {
    filterValue: string;
}

interface ITransformedData {
    theStatistic: string;
    [key: string]: string | number | undefined;
}

const AttritionTab = (props: IAttritionProps) => {
    const { filterValue, filterData, reloadData } = props;

    const chartRef = useRef<ReactECharts>(null);
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataTable, setDataTable] = useState<any[]>([]);
    const [dataChart, setDataChart] = useState<IAttrition[]>([]);
    const [dataAttrition, setDataAttrition] = useState<IAttrition[]>([]);

    const generateColumns = (data: IAttrition[]): ColumnsType<IAttrition> => {
        const months = data.filter(item => item.month !== null).map(item => item.month);
        const uniqueMonths = [...new Set(months.map(Number))].sort((a, b) => a - b);

        const monthColumns = uniqueMonths.map(month => ({
            title: `${dateMappings[month]}`,
            children: [
                {
                    title: '#',
                    dataIndex: `Number_${month}`,
                    key: `Number_${month}`,
                    align: 'center',
                    width: 58,
                    render: (item: number | undefined) => item ?? '-'
                },
                {
                    title: '%',
                    dataIndex: `Percent_${month}`,
                    key: `Percent_${month}`,
                    align: 'center',
                    width: 58,
                    render: (item: number | undefined) => item ?? '-'
                }
            ]
        }));

        const totalColumn = {
            title: 'Total',
            fixed: 'right',
            children: [
                {
                    title: '#',
                    dataIndex: 'Number_total',
                    key: 'Number_total',
                    align: 'center',
                    width: 58,
                    fixed: 'right',
                    render: (item: number | undefined) => item ?? '-'
                },
                {
                    title: '%',
                    dataIndex: 'Percent_total',
                    key: 'Percent_total',
                    align: 'center',
                    width: 58,
                    fixed: 'right',
                    render: (item: number | undefined) => item ?? '-'
                }
            ]
        };

        return [
            {
                title: 'The Statistic',
                key: 'theStatistic',
                dataIndex: 'theStatistic',
                width: 254,
                fixed: 'left'
            },
            ...monthColumns,
            totalColumn
        ];
    };

    const transformData = (data: IAttrition[]): ITransformedData[] => {
        const result: ITransformedData[] = [{ theStatistic: 'Resignation' }, { theStatistic: 'Attrition' }];

        data.forEach(item => {
            if (item.month !== null) {
                result[0][`Number_${item.month}`] = item.resignationNumber;
                result[0][`Percent_${item.month}`] = formatNumberWithDecimalPlaces(item.resignationPercent);
                result[1][`Number_${item.month}`] = item.attritionNumber;
                result[1][`Percent_${item.month}`] = formatNumberWithDecimalPlaces(item.attritionPercent);
            }

            if (item.isTotal) {
                result[0]['Number_total'] = item.resignationNumber;
                result[0]['Percent_total'] = formatNumberWithDecimalPlaces(item.resignationPercent);
                result[1]['Number_total'] = item.attritionNumber;
                result[1]['Percent_total'] = formatNumberWithDecimalPlaces(item.attritionPercent);
            }
        });

        return result;
    };

    const generateEChartOptions = (data: any[], title: string) => {
        // Extract unique months and years from the data
        const months = [...new Set(data.map(item => item.month))];
        const years = [...new Set(data.map(item => item.year))];

        // Create a map to store the data
        const groupedData = years.reduce((acc: { [key: string]: number[] }, year) => {
            acc[year] = new Array(months.length).fill(0); // Initialize with zeros
            return acc;
        }, {});

        // Fill the map with data
        data.forEach(item => {
            const monthIndex = months.indexOf(item.month);
            if (monthIndex !== -1) {
                groupedData[item.year][monthIndex] = item.attritionPercent || 0;
            }
        });

        // Prepare series data
        const seriesData = years.map(year => ({
            name: year,
            type: 'line',
            data: groupedData[year],
            label: {
                show: true,
                position: 'top',
                formatter: (params: any) => formatNumberWithDecimalPlaces(params.value) + '%',
                distance: 0
            }
        }));

        return {
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    let tooltipContent = `${params[0].name}<br/>`;
                    params.forEach((item: any) => {
                        tooltipContent += `${item.marker} ${item.seriesName}: ${formatNumberWithDecimalPlaces(item.value)}%<br/>`;
                    });
                    return tooltipContent;
                }
            },
            legend: {
                orient: 'vertical',
                bottom: 'bottom'
            },
            grid: {
                top: '50',
                left: '50',
                right: '50',
                bottom: '50',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value: number) => `${value}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`)
                }
            },
            series: seriesData
        };
    };

    const fetchData = useCallback(async () => {
        turnOnLoading();
        try {
            const res = await monthlyDeliveryStatisticReportService.getAttritionMonthlyStatistic(filterData);
            const { succeeded, data } = res;

            if (succeeded && data) {
                setDataAttrition(data);
                const dataFilterTotal = data
                    .filter(item => !item.isTotal)
                    .map(item => ({
                        ...item,
                        month: dateMappings[item.month],
                        year: item.year.toString()
                    }))
                    .sort((a, b) => {
                        const yearA = parseInt(a.year, 10);
                        const yearB = parseInt(b.year, 10);
                        const monthA = Object.keys(dateMappings).find(key => dateMappings[key] === a.month);
                        const monthB = Object.keys(dateMappings).find(key => dateMappings[key] === b.month);
                        return yearA - yearB || parseInt(monthA || '0') - parseInt(monthB || '0');
                    });

                setDataChart(dataFilterTotal);
            }
        } catch (error) {
            showNotification(false, 'Error fetching data');
        } finally {
            turnOffLoading();
        }
    }, [filterData, turnOnLoading, turnOffLoading, showNotification]);

    useEffect(() => {
        if (reloadData?.key === 'Resignation_Group_Attrition') {
            fetchData();
        }
    }, [reloadData, fetchData]);

    useEffect(() => {
        const filterCurrentYear = dataAttrition.filter(item => item.year.toString() === filterData.year);
        const transformedData = transformData(filterCurrentYear);
        setDataTable(transformedData);
    }, [filterData, dataAttrition]);

    return (
        <>
            {isLoading ? (
                <Loading type="page" />
            ) : (
                <div className="attrition-tab">
                    <div className="attrition-tab__header">
                        <h6 className="title">The Statistic of {filterValue}</h6>
                        <BaseTable
                            columns={generateColumns(dataAttrition)}
                            dataSource={formatDataTable(dataTable)}
                            loading={isLoading}
                            className="table-header-bordered"
                            scroll={dataTable.length > 10 ? { x: 'max-content', y: 412 } : { x: 'max-content' }}
                        />
                        <div className="attrition-tab__chart">
                            <Flex justify="space-between" className="chart-item__header">
                                <h6 className="title" />
                                <ButtonDownloadChart chartRef={chartRef} />
                            </Flex>
                            <div className="container-chart">
                                <ReactECharts ref={chartRef} option={generateEChartOptions(dataChart, 'Attrition')} opts={{ renderer: 'svg' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AttritionTab;
