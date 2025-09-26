import DefaultLayout from '@/components/common/layout/default-layout';
import RoleAndPermissionPage from '@/pages/admin/role-and-permisison';
import AddRolePage from '@/pages/admin/role-and-permisison/role-list/role-add';
import DetailRolePage from '@/pages/admin/role-and-permisison/role-list/role-detail';
import EditRolePage from '@/pages/admin/role-and-permisison/role-list/role-edit';
import UserPermissionDetailPage from '@/pages/admin/role-and-permisison/user-permission/user-permission-detail';
import EditUserPermissionPage from '@/pages/admin/role-and-permisison/user-permission/edit-user-permission';
import AddUserPermission from '@/pages/admin/role-and-permisison/user-permission/add-user-permission';
import AddUserPermissionByUnit from '@/pages/admin/role-and-permisison/user-permission/add-user-permission-by-unit';

import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const roleAndPermissionRoutes: IRoute[] = [
    {
        name: pathnames.admin.roleAndPermission.main.name,
        path: pathnames.admin.roleAndPermission.main.path,
        layout: DefaultLayout,
        element: RoleAndPermissionPage,
        permission: "RoleAndPermission"
    },
    {
        name: pathnames.admin.roleAndPermission.add.name,
        path: pathnames.admin.roleAndPermission.add.path,
        layout: DefaultLayout,
        element: AddRolePage,
        permission: "AddRole"
    },
    {
        name: pathnames.admin.roleAndPermission.detail.name,
        path: pathnames.admin.roleAndPermission.detail.path + '/:roleGroupId',
        layout: DefaultLayout,
        element: DetailRolePage,
        permission: "DetailRole"
    },
    {
        name: pathnames.admin.roleAndPermission.edit.name,
        path: pathnames.admin.roleAndPermission.edit.path + '/:roleGroupId',
        layout: DefaultLayout,
        element: EditRolePage,
        permission: "EditRole"
    },
    {
        name: pathnames.admin.roleAndPermission.detailUserPermission.name,
        path: pathnames.admin.roleAndPermission.detailUserPermission.path + '/:employeeId',
        layout: DefaultLayout,
        element: UserPermissionDetailPage,
        permission: "DetailsPermission"
    },
    {
        name: pathnames.admin.roleAndPermission.editUserPermission.name,
        path: pathnames.admin.roleAndPermission.editUserPermission.path + '/:employeeId',
        layout: DefaultLayout,
        element: EditUserPermissionPage,
        permission: "EditPermission"
    },
    {
        name: pathnames.admin.roleAndPermission.addUserPermission.name,
        path: pathnames.admin.roleAndPermission.addUserPermission.path,
        layout: DefaultLayout,
        element: AddUserPermission,
        permission: "AddPermission"
    },
    {
        name: pathnames.admin.roleAndPermission.addUserPermissionByUnit.name,
        path: pathnames.admin.roleAndPermission.addUserPermissionByUnit.path,
        layout: DefaultLayout,
        element: AddUserPermissionByUnit,
        permission: "AddPermissionByUnit"
    },
];

export default roleAndPermissionRoutes;
