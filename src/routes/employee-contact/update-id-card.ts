import DefaultLayout from '@/components/common/layout/default-layout';
import UpdateIdCard from '@/pages/employee-contact/update-id-card';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const updateIdCardRoutes: IRoute[] = [
    {
        name: pathnames.employeeContact.updateIdCard.main.name,
        path: pathnames.employeeContact.updateIdCard.main.path,
        layout: DefaultLayout,
        element: UpdateIdCard,
        permission: 'UpdateIDCard'
    }
];

export default updateIdCardRoutes;
