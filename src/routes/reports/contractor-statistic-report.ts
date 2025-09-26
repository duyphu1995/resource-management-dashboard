import DefaultLayout from '@/components/common/layout/default-layout';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import ContractorStatisticReportPage from '@/pages/reports/contractor-statistic-report';

const contractorStatisticReport: IRoute[] = [
    {
        name: pathnames.reports.contractorStatisticReport.main.name,
        path: pathnames.reports.contractorStatisticReport.main.path,
        layout: DefaultLayout,
        element: ContractorStatisticReportPage
    }
];

export default contractorStatisticReport;
