import DefaultLayout from '@/components/common/layout/default-layout';
import OnsiteManagementPage from '@/pages/hr-management/onsite-management';
import OnsiteAdd from '@/pages/hr-management/onsite-management/onsite-add';
import OnsiteDetailPage from '@/pages/hr-management/onsite-management/onsite-detail';
import OnsiteEditPage from '@/pages/hr-management/onsite-management/onsite-edit';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const onsiteManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.onsiteManagement.main.name,
        path: pathnames.hrManagement.onsiteManagement.main.path,
        layout: DefaultLayout,
        element: OnsiteManagementPage,
        permission: 'OnsiteManagementList'
    },
    {
        name: pathnames.hrManagement.onsiteManagement.detail.name,
        path: pathnames.hrManagement.onsiteManagement.detail.path + '/:id',
        layout: DefaultLayout,
        element: OnsiteDetailPage,
        permission: 'OnsiteDetails'
    },
    {
        name: pathnames.hrManagement.onsiteManagement.add.name,
        path: pathnames.hrManagement.onsiteManagement.add.path,
        layout: DefaultLayout,
        element: OnsiteAdd,
        permission: 'AddOnsiteDetails'
    },
    {
        name: pathnames.hrManagement.onsiteManagement.edit.name,
        path: pathnames.hrManagement.onsiteManagement.edit.path + '/:id',
        layout: DefaultLayout,
        element: OnsiteEditPage,
        permission: 'EditOnsiteDetails'
    }
];

export default onsiteManagementRoutes;
