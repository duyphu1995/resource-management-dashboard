import DefaultLayout from '@/components/common/layout/default-layout';
import EmployeeProjectPage from '@/pages/reports/employee-project';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const employeeProjectReport: IRoute[] = [
    {
        name: pathnames.reports.employeeProjectReport.main.name,
        path: pathnames.reports.employeeProjectReport.main.path,
        layout: DefaultLayout,
        element: EmployeeProjectPage
    }
];

export default employeeProjectReport;
