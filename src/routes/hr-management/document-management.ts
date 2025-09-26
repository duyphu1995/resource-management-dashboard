import DefaultLayout from '@/components/common/layout/default-layout';
import DocumentManagement from '@/pages/hr-management/document-management';
import DocumentDetailPage from '@/pages/hr-management/document-management/document-detail';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import DocumentEditPage from '@/pages/hr-management/document-management/document-edit';

const documentManagementRoutes: IRoute[] = [
    {
        name: pathnames.hrManagement.documentManagement.main.name,
        path: pathnames.hrManagement.documentManagement.main.path,
        layout: DefaultLayout,
        element: DocumentManagement,
        permission: 'DocumentManagementList'
    },
    {
        name: pathnames.hrManagement.documentManagement.detail.name,
        path: pathnames.hrManagement.documentManagement.detail.path + '/:id',
        layout: DefaultLayout,
        element: DocumentDetailPage,
        permission: 'DocumentDetails'
    },
    {
        name: pathnames.hrManagement.documentManagement.edit.name,
        path: pathnames.hrManagement.documentManagement.edit.path + '/:id',
        layout: DefaultLayout,
        element: DocumentEditPage,
        permission: 'EditDocumentDetails'
    }
];

export default documentManagementRoutes;
