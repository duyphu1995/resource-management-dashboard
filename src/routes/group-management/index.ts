import DefaultLayout from '@/components/common/layout/default-layout';
import ReportListFilterGroupManagement from '@/components/group-management/right-content/tab-data/report-list';
import GroupManagement from '@/pages/group-management';
import GroupEmployeeDetails from '@/pages/group-management/group-employee-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import unitHistoryInfoRoutes from './unit-history-info';

const groupManagementRoute: IRoute[] = [
    {
        name: pathnames.groupManagement.main.name,
        path: pathnames.groupManagement.main.path + '/:id?',
        layout: DefaultLayout,
        element: GroupManagement,
        permission: 'GroupManagement'
    },
    {
        name: pathnames.groupManagement.detail.name,
        path: pathnames.groupManagement.detail.path + '/:id?',
        layout: DefaultLayout,
        element: GroupEmployeeDetails,
        permission: 'GroupEmployeeDetails'
    }
];

const reportListGroupManagementRoute: IRoute = {
    name: pathnames.groupManagement.openReportList.name,
    path: pathnames.groupManagement.openReportList.path + '/:id?',
    element: ReportListFilterGroupManagement
};

const groupManagementRoutes: IRoute[] = [...groupManagementRoute, reportListGroupManagementRoute, ...unitHistoryInfoRoutes];

export default groupManagementRoutes;
