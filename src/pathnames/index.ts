import admin from './admin';
import employeeContact from './employee-contact';
import groupManagement from './group-management';
import hrManagement from './hr-management';
import reports from './reports';
import transferEmployee from './transfer-employee';
import { getPathnames } from './use-pathnames';
import resourcePlan from './resource-plan';

const pathnamesBase = {
    home: {
        name: 'Home',
        path: '/'
    },
    notFound: {
        name: 'Not Found',
        path: '/404'
    },
    login: {
        name: 'Login',
        path: '/login'
    },
    employeeContact,
    hrManagement,
    transferEmployee,
    groupManagement,
    admin,
    reports,
    resourcePlan,
};

const pathnames = getPathnames(pathnamesBase) as typeof pathnamesBase;

export default pathnames;
