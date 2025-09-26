import DefaultLayout from '@/components/common/layout/default-layout';
import EmployeeTransferPage from '@/pages/employee-transfer';
import EmployeeTransferApproval from '@/pages/employee-transfer/employee-action/employee-transfer-approval';
import EmployeeTransferCancel from '@/pages/employee-transfer/employee-action/employee-transfer-cancel';
import EmployeeTransferDisApproval from '@/pages/employee-transfer/employee-action/employee-transfer-dis-approve';
import AddEmployeeTransferPage from '@/pages/employee-transfer/employee-transfer-add';
import EmployeeTransferGuide from '@/pages/employee-transfer/employee-transfer-add/employee-transfer-guide';
import EmployeeTransferDetail from '@/pages/employee-transfer/employee-transfer-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const transferEmployeeRoute: IRoute[] = [
    {
        name: pathnames.transferEmployee.main.name,
        path: pathnames.transferEmployee.main.path,
        layout: DefaultLayout,
        element: EmployeeTransferPage,
        permission: 'EmployeeTransferList'
    },
    {
        name: pathnames.transferEmployee.add.name,
        path: pathnames.transferEmployee.add.path,
        layout: DefaultLayout,
        element: AddEmployeeTransferPage,
        permission: 'AddNewTransfer'
    },
    {
        name: pathnames.transferEmployee.detail.name,
        path: pathnames.transferEmployee.detail.path + '/:id',
        layout: DefaultLayout,
        element: EmployeeTransferDetail,
        permission: 'TransferDetails'
    },
    {
        name: pathnames.transferEmployee.approval.name,
        path: pathnames.transferEmployee.approval.path + '/:id',
        layout: DefaultLayout,
        element: EmployeeTransferApproval,
        permission: 'ApprovalTransferDetails'
    },
    {
        name: pathnames.transferEmployee.disApproval.name,
        path: pathnames.transferEmployee.disApproval.path + '/:id',
        layout: DefaultLayout,
        element: EmployeeTransferDisApproval,
        permission: 'DisApprovalTransferDetails'
    },
    {
        name: pathnames.transferEmployee.cancel.name,
        path: pathnames.transferEmployee.cancel.path + '/:id',
        layout: DefaultLayout,
        element: EmployeeTransferCancel,
        permission: 'CancelTransferDetails'
    },
    {
        name: pathnames.transferEmployee.transferGuide.name,
        path: pathnames.transferEmployee.transferGuide.path,
        layout: DefaultLayout,
        element: EmployeeTransferGuide
    }
];

const transferEmployeeRoutes: IRoute[] = [...transferEmployeeRoute];

export default transferEmployeeRoutes;
