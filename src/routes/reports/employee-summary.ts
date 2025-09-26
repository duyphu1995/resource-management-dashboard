import DefaultLayout from '@/components/common/layout/default-layout';
import GenderSummaryDetail from '@/components/reports/employee-summary/common-employee-summary/section/gender-summary/gender-summary-detail';
import GraduatedSummaryDetail from '@/components/reports/employee-summary/common-employee-summary/section/graduated-summary/graduated-summary-detail';
import PositionSummaryDetail from '@/components/reports/employee-summary/common-employee-summary/section/position-summary/position-summary-detail';
import ReportListFilter from '@/components/reports/employee-summary/common-employee-summary/util/report-list-filter';
import EmployeeSummary from '@/pages/reports/employee-summary';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const employeeRoutes: IRoute[] = [
    {
        name: pathnames.reports.employeeSummaryReport.main.name,
        path: pathnames.reports.employeeSummaryReport.main.path,
        layout: DefaultLayout,
        element: EmployeeSummary
    },
    {
        name: pathnames.reports.employeeSummaryReport.genderDetails.name,
        path: pathnames.reports.employeeSummaryReport.genderDetails.path + '/:id',
        element: GenderSummaryDetail
    },
    {
        name: pathnames.reports.employeeSummaryReport.positionDetails.name,
        path: pathnames.reports.employeeSummaryReport.positionDetails.path + '/:id',
        element: PositionSummaryDetail
    },
    {
        name: pathnames.reports.employeeSummaryReport.graduatedDetails.name,
        path: pathnames.reports.employeeSummaryReport.graduatedDetails.path + '/:id',
        element: GraduatedSummaryDetail
    },
    {
        name: pathnames.reports.employeeSummaryReport.reportListFilter.name,
        path: pathnames.reports.employeeSummaryReport.reportListFilter.path + '/:id',
        element: ReportListFilter
    }
];

export default employeeRoutes;
