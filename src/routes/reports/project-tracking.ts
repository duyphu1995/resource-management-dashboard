import DefaultLayout from '@/components/common/layout/default-layout';
import ProjectTrackingPage from '@/pages/reports/project-tracking';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const projectTrackingRoutes: IRoute[] = [
    {
        name: pathnames.reports.projectTracking.main.name,
        path: pathnames.reports.projectTracking.main.path,
        layout: DefaultLayout,
        element: ProjectTrackingPage
    }
];

export default projectTrackingRoutes;
