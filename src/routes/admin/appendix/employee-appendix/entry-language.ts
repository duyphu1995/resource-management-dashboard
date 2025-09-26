import DefaultLayout from '@/components/common/layout/default-layout';
import EntryLanguagePage from '@/pages/admin/appendix/employee-appendix/entry-language';
import EntryLanguageAddPage from '@/pages/admin/appendix/employee-appendix/entry-language/entry-language-add';
import EntryLanguageDetail from '@/pages/admin/appendix/employee-appendix/entry-language/entry-language-detail';
import EntryLanguageEdit from '@/pages/admin/appendix/employee-appendix/entry-language/entry-language-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const entryLanguageRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path,
        layout: DefaultLayout,
        element: EntryLanguagePage,
        permission: "AppendixEmployeeAppendixEntryLanguageList"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.entryLanguage.add.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.add.path,
        layout: DefaultLayout,
        element: EntryLanguageAddPage,
        permission: "AddEntryLanguageAppendix",
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.detail.path + '/:id',
        layout: DefaultLayout,
        element: EntryLanguageDetail,
        permission: "DetailsEntryLanguageAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.entryLanguage.edit.name,
        path: pathnames.admin.appendix.employeeAppendix.entryLanguage.edit.path + '/:id',
        layout: DefaultLayout,
        element: EntryLanguageEdit,
        permission: "EditEntryLanguageAppendix"
    }
];

export default entryLanguageRoutes;
