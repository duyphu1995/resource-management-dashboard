import DefaultLayout from '@/components/common/layout/default-layout';
import EmployeeSearchPage from '@/pages/employee-contact/contact-search';
import EmployeeSearchDetail from '@/pages/employee-contact/contact-search/contact-search-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import EmployeeSearchResume from '@/pages/employee-contact/contact-search/contact-search-resume';

const contactSearchRoutes: IRoute[] = [
    {
        name: pathnames.employeeContact.contactSearch.main.name,
        path: pathnames.employeeContact.contactSearch.main.path,
        layout: DefaultLayout,
        element: EmployeeSearchPage,
        permission: 'ContactSearchList'
    },
    {
        name: pathnames.employeeContact.contactSearch.detail.name,
        path: pathnames.employeeContact.contactSearch.detail.path + '/:employeeId',
        layout: DefaultLayout,
        element: EmployeeSearchDetail,
        permission: 'ContactSearchDetails'
    },
    {
        name: pathnames.employeeContact.contactSearch.resume.name,
        path: pathnames.employeeContact.contactSearch.resume.path + '/:employeeId',
        layout: DefaultLayout,
        element: EmployeeSearchResume
    }
];

export default contactSearchRoutes;
