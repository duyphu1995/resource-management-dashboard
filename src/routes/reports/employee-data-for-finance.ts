import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import EmployeeDataForFinancePage from '@/pages/reports/employee-data-for-finance';

const employeeDataForFinanceReport: IRoute[] = [
    {
        name: pathnames.reports.employeeDataForFinanceReport.main.name,
        path: pathnames.reports.employeeDataForFinanceReport.main.path,
        layout: DefaultLayout,
        element: EmployeeDataForFinancePage
    }
];

export default employeeDataForFinanceReport;
