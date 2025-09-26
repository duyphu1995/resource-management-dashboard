import Loading from '@/components/common/loading';
import pathnames from '@/pathnames';
import monthlyDeliveryStatisticReportService from '@/services/reports/monthly-delivery-statistic-report';
import { IMonthlyStatistic, IMonthlyStatisticCommon } from '@/types/reports/monthly-delivery-statistic-report';
import { handleDownloadImage } from '@/utils/common';
import { colorCharts, ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import './index.scss';

interface IProps extends IMonthlyStatisticCommon {
    filterValue: string;
}

const ResignationTab = (props: IProps) => {
    const { filterValue, filterData, reloadData } = props;
    const chartRefs = useRef<(ReactECharts | null)[]>([]);
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [chartConfigs, setChartConfigs] = useState<any[]>([]);
    const [dataResignation, setDataResignation] = useState<IMonthlyStatistic>({
        DG: [],
        Position: []
    });

    const maxLength = 15;

    const getIdFromName = (name: string): number | undefined => {
        for (const key in dataResignation) {
            const items = dataResignation[key as keyof IMonthlyStatistic];
            if (items) {
                const foundItem = items.find((item: any) => item.name === name);
                if (foundItem) {
                    return foundItem.id;
                }
            }
        }
        return undefined;
    };

    const generateEChartOptions = (data: any[], title: string) => {
        return {
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `<span style="font-size: 20px; margin-right: 6px; color: ${params.color};">●</span>${params.name}: ${params.percent}%`;
                }
            },
            legend:
                data.length > 0
                    ? {
                          type: 'scroll',
                          orient: 'vertical',
                          top: 'middle',
                          right: 0,
                          formatter: (name: string) => {
                              return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
                          }
                      }
                    : undefined,
            color: colorCharts,
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: '70%',
                    data: data.map(item => ({
                        value: item.number,
                        name: item.name
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    center: ['40%', '60%'],
                    label: {
                        formatter: (params: any) => {
                            const data = params.data;
                            const truncatedName = data.name.length > maxLength ? `${data.name.substring(0, maxLength)}...` : data.name;
                            return `${truncatedName}: ${data.value}`;
                        }
                    }
                }
            ]
        };
    };

    const handleClickChart = (params: any, index: number) => {
        const name = params.name;
        const id = getIdFromName(name);

        if (id) {
            navigation(
                pathnames.reports.monthlyDeliveryStatisticReport.resignationList.path +
                    `/${index === 0 ? id + '?' : 'null?position=' + id + '&'}month=${filterData.month}&year=${filterData.year}`
            );
        }
    };

    useEffect(() => {
        const newChartConfigs = [
            {
                config: generateEChartOptions(dataResignation.DG, `Resignation By ${ORG_UNITS.DG}`),
                title: `Resignation By ${ORG_UNITS.DG}`
            },
            {
                config: generateEChartOptions(dataResignation.Position, 'Resignation By Position'),
                title: 'Resignation By Position'
            }
        ];

        setChartConfigs(newChartConfigs);
    }, [dataResignation]);

    const fetchData = useCallback(async () => {
        turnOnLoading();
        const res = await monthlyDeliveryStatisticReportService.getResignationMonthlyStatistic(filterData);
        const { succeeded, data } = res;

        if (succeeded && data) {
            setDataResignation(data);
        }
        turnOffLoading();
    }, [filterData, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        if (reloadData?.key === 'Resignation_Group_Resignation') {
            fetchData();
        }
    }, [reloadData, fetchData]);

    const pageStyle = `@media print {
        @page {
            size: 900px 650px !important;
            margin: 0;
            padding: 0
        }
    }`;

    return (
        <>
            {isLoading ? (
                <Loading type="page" />
            ) : (
                <div className="resignation-tab">
                    <div className="resignation-tab__header">
                        <h6 className="title">X% Experienced Staff Left Of {filterValue}</h6>
                        <div className="resignation-tab__note">
                            <p className="title">Note</p>
                            <p>- Business & SS: Delivery Shared Services.</p>
                            <p>- Support Depts: HR/Admin Support.</p>
                        </div>
                        <div className="resignation-tab__chart">
                            {chartConfigs.map((item, index) => (
                                <div className="chart-item" key={index}>
                                    <div className="chart-item__header">
                                        <h6 className="title" />
                                        <Dropdown
                                            menu={{
                                                items: [
                                                    {
                                                        key: '1',
                                                        label: (
                                                            <ReactToPrint
                                                                trigger={() => <Button type="link">Print Chart</Button>}
                                                                content={() => chartRefs.current[index]}
                                                                pageStyle={pageStyle}
                                                            />
                                                        )
                                                    },
                                                    {
                                                        key: '2',
                                                        label: (
                                                            <Button
                                                                type="link"
                                                                onClick={() =>
                                                                    handleDownloadImage(
                                                                        chartRefs.current[index]?.getEchartsInstance().getDataURL() || '',
                                                                        'png'
                                                                    )
                                                                }
                                                            >
                                                                Download PNG Image
                                                            </Button>
                                                        )
                                                    },
                                                    {
                                                        key: '3',
                                                        label: (
                                                            <Button
                                                                type="link"
                                                                onClick={() =>
                                                                    handleDownloadImage(
                                                                        chartRefs.current[index]?.getEchartsInstance().getDataURL() || '',
                                                                        'jpeg'
                                                                    )
                                                                }
                                                            >
                                                                Download JPEG Image
                                                            </Button>
                                                        )
                                                    },
                                                    {
                                                        key: '4',
                                                        label: (
                                                            <Button
                                                                type="link"
                                                                onClick={() =>
                                                                    handleDownloadImage(
                                                                        chartRefs.current[index]?.getEchartsInstance().getDataURL() || '',
                                                                        'pdf'
                                                                    )
                                                                }
                                                            >
                                                                Download PDF Document
                                                            </Button>
                                                        )
                                                    },
                                                    {
                                                        key: '5',
                                                        label: (
                                                            <Button
                                                                type="link"
                                                                onClick={() =>
                                                                    handleDownloadImage(
                                                                        chartRefs.current[index]?.getEchartsInstance().getDataURL() || '',
                                                                        'svg'
                                                                    )
                                                                }
                                                            >
                                                                Download SVG Vector Image
                                                            </Button>
                                                        )
                                                    }
                                                ]
                                            }}
                                            placement="bottomRight"
                                            overlayStyle={{ border: '1px solid #2A9AD6', borderRadius: '4px' }}
                                            rootClassName="print-chart-pie-resignation"
                                        >
                                            <Button className="download-btn">
                                                Download <DownOutlined />
                                            </Button>
                                        </Dropdown>
                                    </div>
                                    <div className="w-100 container-chart">
                                        <ReactECharts
                                            ref={el => (chartRefs.current[index] = el)}
                                            option={item.config}
                                            style={{ height: 400, width: '100%' }}
                                            opts={{ renderer: 'svg' }}
                                            onEvents={{
                                                click: (params: any) => handleClickChart(params, index)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResignationTab;
