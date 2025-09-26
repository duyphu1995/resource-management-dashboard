import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import pathnames from '@/pathnames';
import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import SubTab from '@/components/common/tab/sub-tab';
import './index.scss';
import SummarySharedServiceReport from '@/components/reports/shared-service-report/summary-shared-service-report';
import DetailsBySharedService from '@/components/reports/shared-service-report/details-shared-service-report-by-shared-service';
import DetailsByDcDg from '@/components/reports/shared-service-report/details-shared-service-report-by-dc-dg';

const SharedServiceReportPage = () => {
    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pathnames.reports.sharedServiceReport.main.name }];

    const tabs = [
        {
            key: 'summarySharedServiceReport',
            label: 'Summary Shared Service Report',
            children: <SummarySharedServiceReport />
        },
        {
            key: 'detailSharedServiceReportBySharedService',
            label: 'Detail Shared Service Report By Shared Service',
            children: <DetailsBySharedService />
        },
        {
            key: 'detailSharedServiceReportByDcDg',
            label: 'Detail Shared Service Report By DC/DG',
            children: <DetailsByDcDg />
        }
    ];

    return (
        <DetailContent>
            <div className="shared-service-report-container">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <SubTab items={tabs} />
            </div>
        </DetailContent>
    );
};

export default SharedServiceReportPage;
