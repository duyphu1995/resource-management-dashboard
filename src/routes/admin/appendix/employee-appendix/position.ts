import DefaultLayout from '@/components/common/layout/default-layout';
import PositionPage from '@/pages/admin/appendix/employee-appendix/position';
import PositionAddPage from '@/pages/admin/appendix/employee-appendix/position/position-add';
import PositionDetailPage from '@/pages/admin/appendix/employee-appendix/position/position-detail';
import PositionEditPage from '@/pages/admin/appendix/employee-appendix/position/position-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const positionRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.position.main.name,
        path: pathnames.admin.appendix.employeeAppendix.position.main.path,
        layout: DefaultLayout,
        element: PositionPage,
        permission: "AppendixEmployeeAppendixPositionList"

    },
    {
        name: pathnames.admin.appendix.employeeAppendix.position.add.name,
        path: pathnames.admin.appendix.employeeAppendix.position.add.path,
        layout: DefaultLayout,
        element: PositionAddPage,
        permission: "AddPositionAppendix",
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.position.detail.name,
        path: pathnames.admin.appendix.employeeAppendix.position.detail.path + '/:positionId',
        layout: DefaultLayout,
        element: PositionDetailPage,
        permission: "DetailsPositionAppendix",
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.position.edit.name,
        path: pathnames.admin.appendix.employeeAppendix.position.edit.path + '/:positionId',
        layout: DefaultLayout,
        element: PositionEditPage,
        permission: "EditPositionAppendix",
    }
];

export default positionRoutes;
