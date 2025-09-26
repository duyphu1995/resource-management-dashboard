import DefaultLayout from '@/components/common/layout/default-layout';
import EmployeeManagement from '@/pages/hr-management/employee-management';
import AddNewEmployee from '@/pages/hr-management/employee-management/add-new-employee';
import EmployeeDetail from '@/pages/hr-management/employee-management/employee-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const employeeManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.employeeManagement.main.name,
        path: pathnames.hrManagement.employeeManagement.main.path,
        layout: DefaultLayout,
        element: EmployeeManagement,
        permission: 'EmployeeManagementList'
    },
    {
        name: pathnames.hrManagement.employeeManagement.detail.name,
        path: pathnames.hrManagement.employeeManagement.detail.path + '/:id',
        layout: DefaultLayout,
        element: EmployeeDetail,
        permission: 'EmployeeDetails'
    },
    {
        name: pathnames.hrManagement.employeeManagement.add.name,
        path: pathnames.hrManagement.employeeManagement.add.path,
        layout: DefaultLayout,
        element: AddNewEmployee,
        permission: 'AddEmployeeDetails'
    }
];

export default employeeManagementRoutes;
