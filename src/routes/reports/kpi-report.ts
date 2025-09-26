import DefaultLayout from '@/components/common/layout/default-layout';
import KpiReportPage from '@/pages/reports/kpi';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const kpiReportRoutes: IRoute[] = [
    {
        name: pathnames.reports.kpiReport.main.name,
        path: pathnames.reports.kpiReport.main.path,
        layout: DefaultLayout,
        element: KpiReportPage
    }
];

export default kpiReportRoutes;
