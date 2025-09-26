import DefaultLayout from '@/components/common/layout/default-layout';
import MyProfilePage from '@/pages/employee-contact/my-profile';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const myProfileRoutes: IRoute[] = [
    {
        name: pathnames.employeeContact.myProfile.main.name,
        path: pathnames.employeeContact.myProfile.main.path + '/:id?',
        layout: DefaultLayout,
        element: MyProfilePage,
        permission: 'MyProfile'
    }
];

export default myProfileRoutes;
