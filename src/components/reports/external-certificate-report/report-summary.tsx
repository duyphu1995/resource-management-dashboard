import Loading from '@/components/common/loading';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IReportTabProps } from '@/pages/reports/external-certificate-report';
import externalCertificateReportService from '@/services/reports/external-certificate';
import { IExternalCertificateOverview, IExternalCertificateSummaryReport } from '@/types/reports/external-certificate';
import { IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import { formatDataTable } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import { createSorter } from '@/utils/table';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import Overview from './overview';
import './report-summary.scss';

const ReportSummary = (props: IReportTabProps) => {
    const { searchParams, keyTabActive, handleFilterUnit } = props;
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const renderUnitButton = (item: string, record: IExternalCertificateSummaryReport) => (
        <button type="button" className="underline cursor-pointer unit-btn" onClick={() => handleFilterUnit?.(record)}>
            {renderWithFallback(item)}
        </button>
    );

    const columns: TableColumnType<IExternalCertificateSummaryReport>[] = [
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'Unit',
            width: 423,
            sorter: createSorter('dgName'),
            render: renderUnitButton
        },
        {
            dataIndex: 'headcount',
            key: 'headcount',
            title: 'Head Count',
            width: 423,
            sorter: createSorter('headcount', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'totalCertificates',
            key: 'totalCertificates',
            title: 'Total Certificates',
            width: 423,
            sorter: createSorter('totalCertificates', 'number'),
            render: item => renderWithFallback(item)
        }
    ];

    const [dataTable, setDataTable] = useState<IExternalCertificateSummaryReport[]>([]);
    const [dataOverviewData, setDataOverviewData] = useState<IExternalCertificateOverview | null>(null);

    // Fetch data by search params
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            const res = await externalCertificateReportService.getSummaryReport(searchParams);
            const resData = res.data ?? [];
            const newDataTable = resData.filter(item => item.dgName !== 'Total' && item.dgName !== '%Total');
            const total = resData.find(item => item.dgName === 'Total');
            const totalPercentage = resData.find(item => item.dgName === '%Total');
            const newOverviewData: IExternalCertificateOverview = {
                totalCertificates: total?.totalCertificates ?? 0,
                totalPercentageCertificate: totalPercentage?.totalCertificates ?? 0,
                totalHeadCount: total?.headcount ?? 0,
                totalPercentageHeadcount: totalPercentage?.headcount ?? 0
            };

            setDataTable(newDataTable);
            setDataOverviewData(newOverviewData);
            turnOffLoading();
        };

        if (keyTabActive === 'reportSummary') fetchData();
    }, [searchParams, keyTabActive, turnOnLoading, turnOffLoading]);

    const subTitle = 'Report - Summary';
    const overview: IOverviewItem[] = [
        { label: 'Total Head Count', value: renderWithFallback(dataOverviewData?.totalHeadCount) },
        { label: '% Total Head Count', value: renderWithFallback(dataOverviewData?.totalPercentageHeadcount) + '%' },
        { label: 'Total Certificates', value: renderWithFallback(dataOverviewData?.totalCertificates) },
        { label: '% Total Certificates', value: renderWithFallback(dataOverviewData?.totalPercentageCertificate) + '%' }
    ];

    if (isLoading) return <Loading />;

    return (
        <div className="report-summary">
            <div className="external-certificate-report-sub-title">{subTitle}</div>
            <Overview items={overview} />
            <BaseTable
                columns={columns}
                dataSource={formatDataTable(dataTable) || []}
                loading={isLoading}
                scroll={{ x: 'max-content', y: 449 }}
                pagination={false}
            />
        </div>
    );
};

export default ReportSummary;
