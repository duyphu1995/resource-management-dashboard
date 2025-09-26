import certification from './certification';
import entryLanguage from './entry-language';
import languageCertification from './language-certification';
import nationality from './nationality';
import position from './position';
import terminationReason from './termination-reason';
import healthTracking from './health-tracking';


const main = {
    name: 'Employee Appendix',
    path: '/employee-appendix'
};

const employeeAppendix = {
    main,
    position,
    languageCertification,
    entryLanguage,
    certification,
    nationality,
    terminationReason,
    healthTracking,
};

export default employeeAppendix;
