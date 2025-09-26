import sharedServiceBillablePlan from './shared-service-billable-plan';
import { IRoute } from '..';
import resourceProjection from './resource-projection';

const resourcePlanRoutes: IRoute[] = [...resourceProjection, ...sharedServiceBillablePlan];

export default resourcePlanRoutes;
