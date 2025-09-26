import contractManagement from './contract-management';
import contractorManagement from './contractor-management';
import documentManagement from './document-management';
import employeeManagement from './employee-management';
import managementList from './management-list';
import onsiteManagement from './onsite-management';
import paSupport from './pa-support';
import permissionList from './permission-list';
import resignationManagement from './resignation-management';
import temporaryLeaves from './temporary-leaves';
import updateIDCardList from './update-id-card-list';

const main = {
    name: 'HR Management',
    path: '/hr-management'
};

const hrManagement = {
    main,
    employeeManagement,
    contractManagement,
    contractorManagement,
    documentManagement,
    onsiteManagement,
    resignationManagement,
    managementList,
    temporaryLeaves,
    permissionList,
    paSupport,
    updateIDCardList
};

export default hrManagement;
