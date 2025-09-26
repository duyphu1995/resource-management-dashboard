import DefaultLayout from '@/components/common/layout/default-layout';
import HeadcountBaselineReportPage from '@/pages/reports/headcount-baseline-report';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const headcountBaselineReportRoutes: IRoute[] = [
    {
        name: pathnames.reports.headcountBaselineReport.main.name,
        path: pathnames.reports.headcountBaselineReport.main.path,
        layout: DefaultLayout,
        element: HeadcountBaselineReportPage
    }
];

export default headcountBaselineReportRoutes;
