import DefaultLayout from '@/components/common/layout/default-layout';
import UnitHistoryInfoPage from '@/pages/group-management/unit-history-info';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const unitHistoryInfoRoutes: IRoute[] = [
    {
        name: pathnames.groupManagement.unitHistoryInfo.main.name,
        path: pathnames.groupManagement.unitHistoryInfo.main.path + '/:unitId?',
        layout: DefaultLayout,
        element: UnitHistoryInfoPage
    }
];

export default unitHistoryInfoRoutes;
