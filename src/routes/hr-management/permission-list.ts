import DefaultLayout from '@/components/common/layout/default-layout';
import PermissionListPage from '@/pages/hr-management/permission-list';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const permissionListRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.permissionList.main.name,
        path: pathnames.hrManagement.permissionList.main.path,
        layout: DefaultLayout,
        element: PermissionListPage,
        permission: 'PermissionList'
    },
];

export default permissionListRoutes;
