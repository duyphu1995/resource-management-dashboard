import DefaultLayout from '@/components/common/layout/default-layout';
import StaffGradeIndexReportPage from '@/pages/reports/staff-grade-index-report';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const staffGradeIndexReport: IRoute[] = [
    {
        name: pathnames.reports.staffGradeIndexReport.main.name,
        path: pathnames.reports.staffGradeIndexReport.main.path,
        layout: DefaultLayout,
        element: StaffGradeIndexReportPage
    }
];

export default staffGradeIndexReport;