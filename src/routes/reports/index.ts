import { IRoute } from '..';
import effortAllocationReport from './effort-allocation-report';
import employeeProject from './employee-project';
import employeeRoutes from './employee-summary';
import externalCertificateReportRoutes from './external-certificate-report';
import headcountBaselineReportRoutes from './headcount-baseline-report';
import kpiReportRoutes from './kpi-report';
import monthlyDeliveryStatisticReportRoutes from './monthly-delivery-statistic-report';
import newComersReport from './new-comers-report';
import projectTrackingRoutes from './project-tracking';
import spansOfControlReport from './spans-of-control-report';
import staffGradeIndexReport from './staff-grade-index-report';
import resourceExperienceReport from './resource-experience';
import resourceProjectionReport from './resource-projection-report';
import employeeDataForFinanceReport from './employee-data-for-finance';
import contractorStatisticReport from './contractor-statistic-report';
import projectContractReport from './project-contract';
import headcountReportRoutes from './headcount-report';
import sharedServiceReport from './shared-service-report';

const reportsRoutes: IRoute[] = [
    ...headcountBaselineReportRoutes,
    ...kpiReportRoutes,
    ...staffGradeIndexReport,
    ...monthlyDeliveryStatisticReportRoutes,
    ...spansOfControlReport,
    ...externalCertificateReportRoutes,
    ...newComersReport,
    ...employeeProject,
    ...projectTrackingRoutes,
    ...employeeRoutes,
    ...effortAllocationReport,
    ...resourceExperienceReport,
    ...resourceProjectionReport,
    ...employeeDataForFinanceReport,
    ...contractorStatisticReport,
    ...projectContractReport,
    ...headcountReportRoutes,
    ...sharedServiceReport
];

export default reportsRoutes;
