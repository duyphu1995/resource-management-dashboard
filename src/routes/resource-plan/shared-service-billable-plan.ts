import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import SharedServiceBillablePlanPage from '@/pages/resource-plan/shared-service-billable-plan';
import SharedServiceBillableDetailsPage from '@/components/resource-plan/shared-service-billable-plan/details';
import AddSharedServiceBillablePlanPage from '@/components/resource-plan/shared-service-billable-plan/add';

const sharedServiceBillablePlan: IRoute[] = [
    {
        name: pathnames.resourcePlan.sharedServiceBillablePlan.main.name,
        path: pathnames.resourcePlan.sharedServiceBillablePlan.main.path,
        layout: DefaultLayout,
        element: SharedServiceBillablePlanPage
    },
    {
        name: pathnames.resourcePlan.sharedServiceBillablePlan.detail.name,
        path: pathnames.resourcePlan.sharedServiceBillablePlan.detail.path + '/:reportId',
        layout: DefaultLayout,
        element: SharedServiceBillableDetailsPage
    },
    {
        name: pathnames.resourcePlan.sharedServiceBillablePlan.add.name,
        path: pathnames.resourcePlan.sharedServiceBillablePlan.add.path + '/:sharedServiceId',
        layout: DefaultLayout,
        element: AddSharedServiceBillablePlanPage
    }
];

export default sharedServiceBillablePlan;
