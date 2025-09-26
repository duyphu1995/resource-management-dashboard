import DefaultLayout from '@/components/common/layout/default-layout';
import ManagementListPage from '@/pages/hr-management/management-list';
import ManagementListAddPage from '@/pages/hr-management/management-list/management-list-add';
import ManagementListDetailPage from '@/pages/hr-management/management-list/management-list-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const managementListRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.managementList.main.name,
        path: pathnames.hrManagement.managementList.main.path,
        layout: DefaultLayout,
        element: ManagementListPage,
        permission: 'ManagementList',
    },
    {
        name: pathnames.hrManagement.managementList.add.name,
        path: pathnames.hrManagement.managementList.add.path,
        layout: DefaultLayout,
        element: ManagementListAddPage,
        permission: 'ManagementDetails',
    },
    {
        name: pathnames.hrManagement.managementList.detail.name,
        path: pathnames.hrManagement.managementList.detail.path + '/:employeeId',
        layout: DefaultLayout,
        element: ManagementListDetailPage,
        permission: 'AddManagement',
    }
];

export default managementListRoutes;
