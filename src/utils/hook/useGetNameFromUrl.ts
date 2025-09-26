import pathnames from '@/pathnames';
import { useLocation } from 'react-router-dom';

const useGetNameFromUrl = () => {
    const location = useLocation();
    const pathnameWithoutId = location.pathname.replace(/\/\d+$/, '');

    const pathToNameMap: { [key: string]: string } = {
        [pathnames.employeeContact.myProfile.main.path]: 'MyProfile',
        [pathnames.hrManagement.employeeManagement.detail.path]: 'EmployeeManagement',
        [pathnames.groupManagement.detail.path]: 'GroupEmployeeDetails'
    };

    return pathToNameMap[pathnameWithoutId] || 'Unknown';
};

export default useGetNameFromUrl;
