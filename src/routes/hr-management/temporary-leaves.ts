import DefaultLayout from '@/components/common/layout/default-layout';
import { default as TemporaryLeavesPage } from '@/pages/hr-management/temporary-leaves';
import TemporaryLeavesAddPage from '@/pages/hr-management/temporary-leaves/temporary-add';
import TemporaryLeaveDetailPage from '@/pages/hr-management/temporary-leaves/temporary-detail';
import TemporaryLeaveEditPage from '@/pages/hr-management/temporary-leaves/temporary-edit';
import TemporaryLeavePrintPage from '@/pages/hr-management/temporary-leaves/temporary-print';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const temporaryLeavesRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.temporaryLeaves.main.name,
        path: pathnames.hrManagement.temporaryLeaves.main.path,
        layout: DefaultLayout,
        element: TemporaryLeavesPage,
        permission: 'TemporaryLeavesList'
    },
    {
        name: pathnames.hrManagement.temporaryLeaves.add.name,
        path: pathnames.hrManagement.temporaryLeaves.add.path,
        layout: DefaultLayout,
        element: TemporaryLeavesAddPage,
        permission: 'AddTemporaryLeavesDetails'
    },
    {
        name: pathnames.hrManagement.temporaryLeaves.detail.name,
        path: pathnames.hrManagement.temporaryLeaves.detail.path + '/:id',
        layout: DefaultLayout,
        element: TemporaryLeaveDetailPage,
        permission: 'TemporaryLeavesDetails'
    },
    {
        name: pathnames.hrManagement.temporaryLeaves.edit.name,
        path: pathnames.hrManagement.temporaryLeaves.edit.path + '/:id',
        layout: DefaultLayout,
        element: TemporaryLeaveEditPage,
        permission: 'EditTemporaryLeavesDetails'
    },
    {
        name: pathnames.hrManagement.temporaryLeaves.print.name,
        path: pathnames.hrManagement.temporaryLeaves.print.path + '/:id',
        element: TemporaryLeavePrintPage,
        permission: 'PrintTemporaryLeaves'
    }
];

export default temporaryLeavesRoutes;
