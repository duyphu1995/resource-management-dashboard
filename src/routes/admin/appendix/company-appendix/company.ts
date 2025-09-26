import DefaultLayout from '@/components/common/layout/default-layout';
import CompanyPage from '@/pages/admin/appendix/company-appendix/company';
import CompanyAddPage from '@/pages/admin/appendix/company-appendix/company/company-add';
import CompanyDetailPage from '@/pages/admin/appendix/company-appendix/company/company-detail';
import CompanyEditPage from '@/pages/admin/appendix/company-appendix/company/company-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const companyRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.companyAppendix.company.main.name,
        path: pathnames.admin.appendix.companyAppendix.company.main.path,
        layout: DefaultLayout,
        element: CompanyPage,
        permission: 'Company'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.company.detail.name,
        path: pathnames.admin.appendix.companyAppendix.company.detail.path + '/:companyId',
        layout: DefaultLayout,
        element: CompanyDetailPage,
        permission: 'DetailsCompanyAppendix'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.company.add.name,
        path: pathnames.admin.appendix.companyAppendix.company.add.path,
        layout: DefaultLayout,
        element: CompanyAddPage,
        permission: 'AddCompanyAppendix'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.company.edit.name,
        path: pathnames.admin.appendix.companyAppendix.company.edit.path + '/:companyId',
        layout: DefaultLayout,
        element: CompanyEditPage,
        permission: 'EditCompanyAppendix'
    }
];

export default companyRoutes;
