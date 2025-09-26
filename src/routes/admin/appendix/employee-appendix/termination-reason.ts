import DefaultLayout from '@/components/common/layout/default-layout';
import TerminationReasonPage from '@/pages/admin/appendix/employee-appendix/termination-reason';
import TerminationReasonAddPage from '@/pages/admin/appendix/employee-appendix/termination-reason/termination-reason-add';
import TerminationReasonDetailPage from '@/pages/admin/appendix/employee-appendix/termination-reason/termination-reason-detail';
import TerminationReasonEditPage from '@/pages/admin/appendix/employee-appendix/termination-reason/termination-reason-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const terminationReasonRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.terminationReason.main.name,
        path: pathnames.admin.appendix.employeeAppendix.terminationReason.main.path,
        layout: DefaultLayout,
        element: TerminationReasonPage,
        permission: 'TerminationReason'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.terminationReason.add.name,
        path: pathnames.admin.appendix.employeeAppendix.terminationReason.add.path,
        layout: DefaultLayout,
        element: TerminationReasonAddPage,
        permission: 'AddTerminationReasonAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.terminationReason.detail.name,
        path: pathnames.admin.appendix.employeeAppendix.terminationReason.detail.path + '/:reasonId',
        layout: DefaultLayout,
        element: TerminationReasonDetailPage,
        permission: 'DetailsTerminationReasonAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.terminationReason.edit.name,
        path: pathnames.admin.appendix.employeeAppendix.terminationReason.edit.path + '/:reasonId',
        layout: DefaultLayout,
        element: TerminationReasonEditPage,
        permission: 'EditTerminationReasonAppendix'
    }
];

export default terminationReasonRoutes;
