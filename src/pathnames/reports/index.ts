import externalCertificateReport from './external-certificate-report';
import headcountBaselineReport from './headcount-baseline-report';
import kpiReport from './kpi-report';
import monthlyDeliveryStatisticReport from './monthly-delivery-statistic-report';
import spansOfControlReport from './spans-of-control-report';
import staffGradeIndexReport from './staff-grade-index-report';
import newComersReport from './new-comers-report';
import employeeProjectReport from './employee-project-report';
import projectTracking from './project-tracking';
import employeeSummaryReport from './employee-summary';
import effortAllocationReport from './effort-allocation-report';
import resourceExperienceReport from './resource-experience';
import resourceProjectionReport from './resource-projection-report';
import employeeDataForFinanceReport from './employee-data-for-finance';
import contractorStatisticReport from './contractor-statistic-report';
import projectContractReport from './project-contract';
import headcountReport from './headcount-report';
import sharedServiceReport from './shared-service-report';

const main = {
    name: 'Reports',
    path: '/reports'
};

const reports = {
    main,
    headcountBaselineReport,
    kpiReport,
    monthlyDeliveryStatisticReport,
    spansOfControlReport,
    externalCertificateReport,
    staffGradeIndexReport,
    newComersReport,
    employeeProjectReport,
    projectTracking,
    employeeSummaryReport,
    effortAllocationReport,
    resourceExperienceReport,
    resourceProjectionReport,
    employeeDataForFinanceReport,
    contractorStatisticReport,
    projectContractReport,
    headcountReport,
    sharedServiceReport
};

export default reports;
