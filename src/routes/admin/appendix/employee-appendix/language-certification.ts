import DefaultLayout from '@/components/common/layout/default-layout';
import LanguageCertificationPage from '@/pages/admin/appendix/employee-appendix/language-certification';
import AddLanguageCertificationPage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-language/language-add';
import LanguageCertificationDetailPage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-language/language-detail';
import LanguageCertificationEditPage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-language/language-edit';
import AddLevelLanguagePage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-level/level-add';
import LevelDetailPage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-level/level-detail';
import LevelEditPage from '@/pages/admin/appendix/employee-appendix/language-certification/tab-level/level-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const languageCertificationRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.main.path,
        layout: DefaultLayout,
        element: LanguageCertificationPage,
        permission: "LanguageCertification"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.addLanguage.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.addLanguage.path,
        layout: DefaultLayout,
        element: AddLanguageCertificationPage,
        permission: "AddLanguageAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.detailLanguage.path + '/:id',
        layout: DefaultLayout,
        element: LanguageCertificationDetailPage,
        permission: "DetailsLanguageAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.editLanguage.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.editLanguage.path + '/:id',
        layout: DefaultLayout,
        element: LanguageCertificationEditPage,
        permission: "EditLanguageAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.addLevel.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.addLevel.path,
        layout: DefaultLayout,
        element: AddLevelLanguagePage,
        permission: "AddLevelAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.detailLevel.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.detailLevel.path + '/:id',
        layout: DefaultLayout,
        element: LevelDetailPage,
        permission: "DetailsLevelAppendix"
    },
    {
        name: pathnames.admin.appendix.employeeAppendix.languageCertification.editLevel.name,
        path: pathnames.admin.appendix.employeeAppendix.languageCertification.editLevel.path + '/:id',
        layout: DefaultLayout,
        element: LevelEditPage,
        permission: "EditLevelAppendix"
    }
];

export default languageCertificationRoutes;
