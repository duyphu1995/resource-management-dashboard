import DefaultLayout from '@/components/common/layout/default-layout';
import MonthlyDeliveryStatisticReport from '@/pages/reports/monthly-delivery-statistic-report';
import ResignationList from '@/pages/reports/monthly-delivery-statistic-report/resignation-list';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const monthlyDeliveryStatisticReportRoutes: IRoute[] = [
    {
        name: pathnames.reports.monthlyDeliveryStatisticReport.main.name,
        path: pathnames.reports.monthlyDeliveryStatisticReport.main.path,
        layout: DefaultLayout,
        element: MonthlyDeliveryStatisticReport
    },
    {
        name: pathnames.reports.monthlyDeliveryStatisticReport.resignationList.name,
        path: pathnames.reports.monthlyDeliveryStatisticReport.resignationList.path + '/:id',
        layout: DefaultLayout,
        element: ResignationList
    }
];

export default monthlyDeliveryStatisticReportRoutes;
