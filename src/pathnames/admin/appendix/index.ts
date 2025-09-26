import employeeAppendix from './employee-appendix';
import companyAppendix from './company-appendix';
import groupManagementAppendix from './group-management-appendix';


const main = {
    name: 'Appendix',
    path: '/appendix'
};

const appendix = {
    main,
    employeeAppendix,
    companyAppendix,
    groupManagementAppendix,
};

export default appendix;
