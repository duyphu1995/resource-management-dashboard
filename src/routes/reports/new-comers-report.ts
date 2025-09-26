import DefaultLayout from '@/components/common/layout/default-layout';
import NewComersReportPage from '@/pages/reports/new-comers-report';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const newCommersReport: IRoute[] = [
    {
        name: pathnames.reports.newComersReport.main.name,
        path: pathnames.reports.newComersReport.main.path,
        layout: DefaultLayout,
        element: NewComersReportPage,
        permission: 'NewComersReport'
    }
];

export default newCommersReport;