import { IRoute } from '..';
import contractManagementRoutes from './contract-management';
import contractorManagementRoutes from './contractor-management';
import documentManagementRoutes from './document-management';
import employeeManagementRoutes from './employee-management';
import managementListRoutes from './management-list';
import onsiteManagementRoutes from './onsite-management';
import paSupportRoutes from './pa-support';
import resignationManagementRoutes from './resignation-management ';
import temporaryLeavesRoutes from './temporary-leaves';
import updateIDCardListRoutes from './update-id-card-list';
import permissionListRoutes from './permission-list';

const hrManagementRoutes: IRoute[] = [
    ...employeeManagementRoutes,
    ...contractManagementRoutes,
    ...documentManagementRoutes,
    ...onsiteManagementRoutes,
    ...resignationManagementRoutes,
    ...managementListRoutes,
    ...contractorManagementRoutes,
    ...temporaryLeavesRoutes,
    ...updateIDCardListRoutes,
    ...paSupportRoutes,
    ...permissionListRoutes,
];

export default hrManagementRoutes;
