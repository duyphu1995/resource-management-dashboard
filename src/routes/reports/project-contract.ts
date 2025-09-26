import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import ProjectContractReportPage from '@/pages/reports/project-contract';
import { QuickStartGuide } from '@/pages/reports/project-contract/quick-start-guide';

const projectContractReport: IRoute[] = [
    {
        name: pathnames.reports.projectContractReport.main.name,
        path: pathnames.reports.projectContractReport.main.path,
        layout: DefaultLayout,
        element: ProjectContractReportPage
    },
    {
        name: pathnames.reports.projectContractReport.quickStartGuide.name,
        path: pathnames.reports.projectContractReport.quickStartGuide.path,
        element: QuickStartGuide
    }
];

export default projectContractReport;
