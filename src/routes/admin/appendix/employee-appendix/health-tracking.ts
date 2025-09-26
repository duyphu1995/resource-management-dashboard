import DefaultLayout from '@/components/common/layout/default-layout';
import HealthTrackingPage from '@/pages/admin/appendix/employee-appendix/health-tracking';
import HealthTrackingAddPage from '@/pages/admin/appendix/employee-appendix/health-tracking/health-tracking-add';
import HealthTrackingDetailPage from '@/pages/admin/appendix/employee-appendix/health-tracking/health-tracking-detail';
import HealthTrackingEditPage from '@/pages/admin/appendix/employee-appendix/health-tracking/health-tracking-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const healthTrackingRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.healthTracking.main.name,
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.main.path,
        layout: DefaultLayout,
        element: HealthTrackingPage,
        permission: 'HealthTracking'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.healthTracking.add.name,
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.add.path,
        layout: DefaultLayout,
        element: HealthTrackingAddPage,
        permission: 'AddHealthTrackingAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.healthTracking.detail.name,
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.detail.path + '/:certificateId',
        layout: DefaultLayout,
        element: HealthTrackingDetailPage,
        permission: 'DetailsHealthTrackingAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.healthTracking.edit.name,
        path: pathnames.admin.appendix.employeeAppendix.healthTracking.edit.path + '/:certificateId',
        layout: DefaultLayout,
        element: HealthTrackingEditPage,
        permission: 'EditHealthTrackingAppendix'
    }
];

export default healthTrackingRoutes;
