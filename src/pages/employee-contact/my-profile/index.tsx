import BaseBreadcrumb from '@/components/common/breadcrumb';
import TabDetail from '@/components/hr-management/employee-management/employee-detail';
import pathnames from '@/pathnames';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const breadcrumbItems = [{ title: pathnames.employeeContact.main.name }, { title: pathnames.employeeContact.myProfile.main.name }];

const MyProfilePage = () => {
    const navigation = useNavigate();
    const { id = '' } = useParams();
    const dataCurrentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const employeeId = dataCurrentUser?.employeeId;

    useEffect(() => {
        if (id !== employeeId) {
            navigation(pathnames.employeeContact.myProfile.main.path + `/${employeeId}`);
        }
    }, [id, employeeId, navigation]);

    return (
        <>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <TabDetail moduleName="MyProfile" />
        </>
    );
};

export default MyProfilePage;
