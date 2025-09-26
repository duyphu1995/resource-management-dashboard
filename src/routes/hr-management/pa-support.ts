import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import PASupportPage from '@/pages/hr-management/pa-support';

const paSupportRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.paSupport.main.name,
        path: pathnames.hrManagement.paSupport.main.path,
        layout: DefaultLayout,
        element: PASupportPage,
        permission: 'PASupport'
    }
];

export default paSupportRoutes;
