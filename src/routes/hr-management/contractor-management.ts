import DefaultLayout from '@/components/common/layout/default-layout';
import ContractorManagementPage from '@/pages/hr-management/contractor-management';
import ContractorDetailPage from '@/pages/hr-management/contractor-management/contractor-detail';
import InternshipContractPrintPage from '@/pages/hr-management/contractor-management/print-internship-contract';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const contractorManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.contractorManagement.main.name,
        path: pathnames.hrManagement.contractorManagement.main.path,
        layout: DefaultLayout,
        element: ContractorManagementPage,
        permission: 'ContractorManagement'
    },
    {
        name: pathnames.hrManagement.contractorManagement.detail.name,
        path: pathnames.hrManagement.contractorManagement.detail.path + '/:contractorId',
        layout: DefaultLayout,
        element: ContractorDetailPage,
        permission: 'ContractorDetails'
    },
    {
        name: pathnames.hrManagement.contractorManagement.print.name,
        path: pathnames.hrManagement.contractorManagement.print.path + '/:contractId',
        element: InternshipContractPrintPage
    }
];

export default contractorManagementRoutes;
