import resourceProjection from './resource-projection';
import sharedServiceBillablePlan from './shared-service-billable-plan';

const main = {
    name: 'Resource Plan',
    path: '/resource-plan'
};

const resourcePlan = {
    main,
    resourceProjection,
    sharedServiceBillablePlan
};

export default resourcePlan;
