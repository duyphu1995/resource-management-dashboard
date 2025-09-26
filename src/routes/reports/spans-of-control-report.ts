import DefaultLayout from '@/components/common/layout/default-layout';
import SpansOfControlReportPage from '@/pages/reports/spans-of-control-report';
import SpansOfControlListPage from '@/pages/reports/spans-of-control-report/span-of-control-list';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const spansOfControlReport: IRoute[] = [
    {
        name: pathnames.reports.spansOfControlReport.main.name,
        path: pathnames.reports.spansOfControlReport.main.path,
        layout: DefaultLayout,
        element: SpansOfControlReportPage
    },
    {
        name: pathnames.reports.spansOfControlReport.spanOfControlList.name,
        path: pathnames.reports.spansOfControlReport.spanOfControlList.path,
        layout: DefaultLayout,
        element: SpansOfControlListPage
    }
];

export default spansOfControlReport;
