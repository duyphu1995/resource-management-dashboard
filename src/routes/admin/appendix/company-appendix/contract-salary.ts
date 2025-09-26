import DefaultLayout from '@/components/common/layout/default-layout';
import ContractSalaryPage from '@/pages/admin/appendix/company-appendix/contract-salary';
import AddContractSalaryPage from '@/pages/admin/appendix/company-appendix/contract-salary/contract-salary-add';
import DetailContractSalaryPage from '@/pages/admin/appendix/company-appendix/contract-salary/contract-salary-detail';
import EditContractSalaryPage from '@/pages/admin/appendix/company-appendix/contract-salary/contract-salary-edit';
import pathnames from '@/pathnames';

const contractSalaryRoutes = [
    {
        name: pathnames.admin.appendix.companyAppendix.contractSalary.main.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.main.path,
        layout: DefaultLayout,
        element: ContractSalaryPage,
        permission: 'ContractSalary'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.contractSalary.add.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.add.path,
        layout: DefaultLayout,
        element: AddContractSalaryPage,
        permission: 'AddContractSalaryAppendix'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.contractSalary.detail.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.detail.path + '/:id',
        layout: DefaultLayout,
        element: DetailContractSalaryPage,
        permission: 'DetailsContractSalaryAppendix'
    },
    {
        name: pathnames.admin.appendix.companyAppendix.contractSalary.edit.name,
        path: pathnames.admin.appendix.companyAppendix.contractSalary.edit.path + '/:id',
        layout: DefaultLayout,
        element: EditContractSalaryPage,
        permission: 'EditContractSalaryAppendix'
    }
];

export default contractSalaryRoutes;
