import ButtonDownloadChart from '@/components/common/button/button-download-chart';
import { IReportTabProps } from '@/pages/reports/external-certificate-report';
import externalCertificateReportService from '@/services/reports/external-certificate';
import { IExternalCertificateStatistic } from '@/types/reports/external-certificate';
import useLoading from '@/utils/hook/useLoading';
import { Flex, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useEffect, useRef, useState } from 'react';
import BarChart from '../employee-summary/common-employee-summary/util/chart/bar-chart';
import ReportNoData from '../report-no-data';
import './report-statistic.scss';

const ReportStatistic = (props: IReportTabProps) => {
    const { searchParams, keyTabActive } = props;

    const chartRef = useRef<ReactECharts | null>(null);
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [dataChart, setDataChart] = useState<IExternalCertificateStatistic[]>([]);

    // Fetch data by search params
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await externalCertificateReportService.getStatisticReport(searchParams);
            const { data, succeeded } = res;

            if (succeeded && data) {
                setDataChart(data);
            }
            turnOffLoading();
        };

        if (keyTabActive === 'reportStatistic') fetchData();
    }, [searchParams, keyTabActive, turnOnLoading, turnOffLoading]);

    return (
        <Spin spinning={isLoading}>
            <div className="external-certificate-report-card">
                <div className="card-header">Report - Statistic</div>
                <div className="card-body">
                    <div className="external-certificate-chart">
                        <Flex justify="space-between" className="chart-item__header">
                            <h6 className="title" />
                            {dataChart.length && <ButtonDownloadChart chartRef={chartRef} pageHeightProp={`${dataChart.length * 31 + 400}px`} />}
                        </Flex>
                        <div className="external-certificate-chart-content">
                            {dataChart.length ? (
                                <BarChart
                                    dataProps={dataChart}
                                    isLoading={isLoading}
                                    chartRef={chartRef}
                                    xField="certificateCatName"
                                    yField="totalCertificate"
                                    nameX="Certificate Type"
                                    title="Chart Certificate Statistic"
                                    tooltipFormatter={params => {
                                        const data = params[0];
                                        return `<strong>${data.name}</strong><br/><span style="font-size: 20px; margin-right: 6px; color: ${data.color};">●</span>Certificate: <strong>${data.value}</strong>`;
                                    }}
                                />
                            ) : (
                                <ReportNoData />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default ReportStatistic;
