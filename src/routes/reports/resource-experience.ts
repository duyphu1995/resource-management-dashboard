import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import ResourceExperiencePage from '@/pages/reports/resource-experience';

const resourceExperienceReport: IRoute[] = [
    {
        name: pathnames.reports.resourceExperienceReport.main.name,
        path: pathnames.reports.resourceExperienceReport.main.path,
        layout: DefaultLayout,
        element: ResourceExperiencePage
    }
];

export default resourceExperienceReport;
