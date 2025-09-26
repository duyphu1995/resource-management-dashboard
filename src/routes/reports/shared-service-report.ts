import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import SharedServiceReportPage from '@/pages/reports/shared-service-report';

const sharedServiceReport: IRoute[] = [
    {
        name: pathnames.reports.sharedServiceReport.main.name,
        path: pathnames.reports.sharedServiceReport.main.path,
        layout: DefaultLayout,
        element: SharedServiceReportPage
    }
];

export default sharedServiceReport;
