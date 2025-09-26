import DefaultLayout from '@/components/common/layout/default-layout';
import ExternalCertificateReportPage from '@/pages/reports/external-certificate-report';
import pathnames from '@/pathnames';
import { IRoute } from '..';

const externalCertificateReportRoutes: IRoute[] = [
    {
        name: pathnames.reports.externalCertificateReport.main.name,
        path: pathnames.reports.externalCertificateReport.main.path,
        layout: DefaultLayout,
        element: ExternalCertificateReportPage
    }
];

export default externalCertificateReportRoutes;
