import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import resourceProjectionReportPage from '@/pages/reports/resource-projection';

const resourceProjectionReport: IRoute[] = [
    {
        name: pathnames.reports.resourceProjectionReport.main.name,
        path: pathnames.reports.resourceProjectionReport.main.path,
        layout: DefaultLayout,
        element: resourceProjectionReportPage
    }
];

export default resourceProjectionReport;
