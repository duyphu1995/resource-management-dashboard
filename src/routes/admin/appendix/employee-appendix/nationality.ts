import DefaultLayout from '@/components/common/layout/default-layout';
import NationalityPage from '@/pages/admin/appendix/employee-appendix/nationality';
import NationalityAddPage from '@/pages/admin/appendix/employee-appendix/nationality/nationality-add';
import NationalityDetailPage from '@/pages/admin/appendix/employee-appendix/nationality/nationality-detail';
import NationalityEditPage from '@/pages/admin/appendix/employee-appendix/nationality/nationality-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const nationalityRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.nationality.main.name,
        path: pathnames.admin.appendix.employeeAppendix.nationality.main.path,
        layout: DefaultLayout,
        element: NationalityPage,
        permission: 'Nationality'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.nationality.add.name,
        path: pathnames.admin.appendix.employeeAppendix.nationality.add.path,
        layout: DefaultLayout,
        element: NationalityAddPage,
        permission: 'AddNationalityAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.nationality.detail.name,
        path: pathnames.admin.appendix.employeeAppendix.nationality.detail.path + '/:nationalityId',
        layout: DefaultLayout,
        element: NationalityDetailPage,
        permission: 'DetailsNationalityAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.nationality.edit.name,
        path: pathnames.admin.appendix.employeeAppendix.nationality.edit.path + '/:nationalityId',
        layout: DefaultLayout,
        element: NationalityEditPage,
        permission: 'EditNationalityAppendix'
    }
];

export default nationalityRoutes;
