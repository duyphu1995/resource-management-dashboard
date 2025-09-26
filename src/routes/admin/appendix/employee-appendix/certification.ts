import DefaultLayout from '@/components/common/layout/default-layout';
import CertificationPage from '@/pages/admin/appendix/employee-appendix/certification';
import CertificationNameAddPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-name/certification-name-add';
import CertificationNameDetailPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-name/certification-name-detail';
import CertificationNameEditPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-name/certification-name-edit';
import CertificationTypeAddPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-type/certification-type-add';
import CertificationTypeDetailPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-type/certification-type-detail';
import CertificationTypeEditPage from '@/pages/admin/appendix/employee-appendix/certification/tab-certification-type/certification-type-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const certificationRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.main.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.main.path,
        layout: DefaultLayout,
        element: CertificationPage,
        permission: 'Certification'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.addCertificationTypeName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.addCertificationTypeName.path,
        layout: DefaultLayout,
        element: CertificationTypeAddPage,
        permission: 'AddCertificationAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.detailCertificationTypeName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.detailCertificationTypeName.path + '/:id',
        layout: DefaultLayout,
        element: CertificationTypeDetailPage,
        permission: 'DetailsCertificationAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.editCertificationTypeName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.editCertificationTypeName.path + '/:id',
        layout: DefaultLayout,
        element: CertificationTypeEditPage,
        permission: 'EditCertificationAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.addCertificationName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.addCertificationName.path,
        layout: DefaultLayout,
        element: CertificationNameAddPage,
        permission: 'AddCertificationNameAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.detailCertificationName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.detailCertificationName.path + '/:id',
        layout: DefaultLayout,
        element: CertificationNameDetailPage,
        permission: 'DetailsCertificationNameAppendix'
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.certification.editCertificationName.name,
        path: pathnames.admin.appendix.employeeAppendix.certification.editCertificationName.path + '/:id',
        layout: DefaultLayout,
        element: CertificationNameEditPage,
        permission: 'EditCertificationNameAppendix'
    }
];

export default certificationRoutes;
