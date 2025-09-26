import DefaultLayout from '@/components/common/layout/default-layout';
import EffortAllocationReportList from '@/components/reports/effort-allocation-report/report-list';
import EffortAllocationReportPage from '@/pages/reports/effort-allocation-report';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const effortAllocationReport: IRoute[] = [
    {
        name: pathnames.reports.effortAllocationReport.main.name,
        path: pathnames.reports.effortAllocationReport.main.path,
        layout: DefaultLayout,
        element: EffortAllocationReportPage,
        permission: 'EffortAllocationList'
    },
    {
        name: pathnames.reports.effortAllocationReport.effortAllocationReportList.name,
        path: pathnames.reports.effortAllocationReport.effortAllocationReportList.path + '/:id',
        element: EffortAllocationReportList
    }
];

export default effortAllocationReport;
