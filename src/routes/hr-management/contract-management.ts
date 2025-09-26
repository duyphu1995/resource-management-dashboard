import DefaultLayout from '@/components/common/layout/default-layout';
import ContractManagementPage from '@/pages/hr-management/contract-management';
import ContractDetailPage from '@/pages/hr-management/contract-management/contract-detail';
import ContractPrintPage from '@/pages/hr-management/contract-management/contract-print';
import ContractPrintLiquidationPage from '@/pages/hr-management/contract-management/contract-print/contract-liquidation';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import ContractAddPage from '@/pages/hr-management/contract-management/contract-add';
import ContractEditPage from '@/pages/hr-management/contract-management/contract-edit';

const contractManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.contractManagement.main.name,
        path: pathnames.hrManagement.contractManagement.main.path,
        layout: DefaultLayout,
        element: ContractManagementPage,
        permission: 'ContractManagementList'
    },
    {
        name: pathnames.hrManagement.contractManagement.detail.name,
        path: pathnames.hrManagement.contractManagement.detail.path + '/:contractId',
        layout: DefaultLayout,
        element: ContractDetailPage,
        permission: 'ContractDetails'
    },
    {
        name: pathnames.hrManagement.contractManagement.add.name,
        path: pathnames.hrManagement.contractManagement.add.path,
        layout: DefaultLayout,
        element: ContractAddPage,
        permission: 'AddContractDetails'
    },
    {
        name: pathnames.hrManagement.contractManagement.edit.name,
        path: pathnames.hrManagement.contractManagement.edit.path + '/:contractId',
        layout: DefaultLayout,
        element: ContractEditPage,
        permission: 'EditContractDetails'
    },
    {
        name: pathnames.hrManagement.contractManagement.print.name,
        path: pathnames.hrManagement.contractManagement.print.path + '/:contractId',
        element: ContractPrintPage
    },
    {
        name: pathnames.hrManagement.contractManagement.printLiquidation.name,
        path: pathnames.hrManagement.contractManagement.printLiquidation.path + '/:contractId',
        element: ContractPrintLiquidationPage
    }
];

export default contractManagementRoutes;
