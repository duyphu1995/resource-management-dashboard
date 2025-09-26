import DefaultLayout from '@/components/common/layout/default-layout';
import UpdateIDCardListPage from '@/pages/hr-management/update-id-card-list';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const updateIDCardListRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.updateIDCardList.main.name,
        path: pathnames.hrManagement.updateIDCardList.main.path,
        layout: DefaultLayout,
        element: UpdateIDCardListPage,
        permission: 'UpdateIDCard'
    }
];

export default updateIDCardListRoutes;