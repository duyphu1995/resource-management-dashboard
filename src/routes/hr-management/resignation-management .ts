import DefaultLayout from '@/components/common/layout/default-layout';
import ResignationManagement from '@/pages/hr-management/resignation-management';
import ResignationAddPage from '@/pages/hr-management/resignation-management/resignation-add';
import ResignationDetailPage from '@/pages/hr-management/resignation-management/resignation-detail';
import ResignationEditPage from '@/pages/hr-management/resignation-management/resignation-edit';
import TerminateContract from '@/pages/hr-management/resignation-management/terminate-contract-resignation';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const resignationManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.resignationManagement.main.name,
        path: pathnames.hrManagement.resignationManagement.main.path,
        layout: DefaultLayout,
        element: ResignationManagement,
        permission: 'ResignationManagementList'
    },
    {
        name: pathnames.hrManagement.resignationManagement.detail.name,
        path: pathnames.hrManagement.resignationManagement.detail.path + '/:resignationFormId',
        layout: DefaultLayout,
        element: ResignationDetailPage,
        permission: 'ResignationDetails'
    },
    {
        name: pathnames.hrManagement.resignationManagement.edit.name,
        path: pathnames.hrManagement.resignationManagement.edit.path + '/:resignationFormId',
        layout: DefaultLayout,
        element: ResignationEditPage,
        permission: 'EditResignationDetails'
    },
    {
        name: pathnames.hrManagement.resignationManagement.add.name,
        path: pathnames.hrManagement.resignationManagement.add.path,
        layout: DefaultLayout,
        element: ResignationAddPage,
        permission: 'AddResignationDetails'
    },
    {
        name: pathnames.hrManagement.resignationManagement.print.name,
        path: pathnames.hrManagement.resignationManagement.print.path + '/:resignationId',
        element: TerminateContract
    }
];

export default resignationManagementRoutes;
