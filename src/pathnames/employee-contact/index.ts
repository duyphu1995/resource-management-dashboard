import contactSearch from './contact-search';
import myProfile from './my-profile';
import updateIdCard from './update-id-card';

const main = {
    name: 'Employee Contact',
    path: '/employee-contact'
};

const employeeContact = {
    main,
    contactSearch,
    updateIdCard,
    myProfile
};

export default employeeContact;
