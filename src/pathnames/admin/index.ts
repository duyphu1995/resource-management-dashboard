import roleAndPermission from './role-and-permission';
import appendix from './appendix';
import emailSubscription from './email-subscription';

const main = {
    name: 'Admin',
    path: '/admin'
};

const admin = {
    main,
    roleAndPermission,
    appendix,
    emailSubscription
};

export default admin;
