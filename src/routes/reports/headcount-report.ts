import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import { HeadcountReportPage } from '@/pages/reports/headcount-report';

const headcountReportRoutes: IRoute[] = [
    {
        name: pathnames.reports.headcountReport.main.name,
        path: pathnames.reports.headcountReport.main.path,
        layout: DefaultLayout,
        element: HeadcountReportPage
    }
];

export default headcountReportRoutes;
