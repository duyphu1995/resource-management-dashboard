import pathnames from '@/pathnames';
export interface HeaderMenu {
    label: string;
    url?: string;
    children?: HeaderMenu[];
    permission?: string;
}

const headerMenu: HeaderMenu[] = [
    {
        label: pathnames.employeeContact.main.name,
        children: [
            {
                label: pathnames.employeeContact.myProfile.main.name,
                url: pathnames.employeeContact.myProfile.main.path,
                permission: 'MyProfile'
            },
            {
                label: pathnames.employeeContact.contactSearch.main.name,
                url: pathnames.employeeContact.contactSearch.main.path,
                permission: 'ContactSearch'
            },
            {
                label: pathnames.employeeContact.updateIdCard.main.name,
                url: pathnames.employeeContact.updateIdCard.main.path,
                permission: 'UpdateIDCard'
            }
        ],
        permission: 'EmployeeContact'
    },
    {
        label: pathnames.hrManagement.main.name,
        children: [
            {
                label: pathnames.hrManagement.employeeManagement.main.name,
                url: pathnames.hrManagement.employeeManagement.main.path,
                permission: 'EmployeeManagement'
            },
            {
                label: pathnames.hrManagement.onsiteManagement.main.name,
                url: pathnames.hrManagement.onsiteManagement.main.path,
                permission: 'OnsiteManagement'
            },
            {
                label: pathnames.hrManagement.resignationManagement.main.name,
                url: pathnames.hrManagement.resignationManagement.main.path,
                permission: 'ResignationManagement'
            },
            {
                label: pathnames.hrManagement.contractManagement.main.name,
                url: pathnames.hrManagement.contractManagement.main.path,
                permission: 'ContractManagement'
            },
            {
                label: pathnames.hrManagement.managementList.main.name,
                url: pathnames.hrManagement.managementList.main.path,
                permission: 'Management'
            },
            {
                label: pathnames.hrManagement.temporaryLeaves.main.name,
                url: pathnames.hrManagement.temporaryLeaves.main.path,
                permission: 'TemporaryLeaves'
            },
            {
                label: pathnames.hrManagement.contractorManagement.main.name,
                url: pathnames.hrManagement.contractorManagement.main.path,
                permission: 'ContractorManagement'
            },
            {
                label: pathnames.hrManagement.permissionList.main.name,
                url: pathnames.hrManagement.permissionList.main.path,
                permission: 'Permission'
            },
            {
                label: pathnames.hrManagement.documentManagement.main.name,
                url: pathnames.hrManagement.documentManagement.main.path,
                permission: 'DocumentManagement'
            },
            {
                label: pathnames.hrManagement.paSupport.main.name,
                url: pathnames.hrManagement.paSupport.main.path,
                permission: 'PASupport'
            },
            {
                label: pathnames.hrManagement.updateIDCardList.main.name,
                url: pathnames.hrManagement.updateIDCardList.main.path,
                permission: 'UpdateIDCard'
            }
        ],
        permission: 'HRManagement'
    },
    {
        label: pathnames.transferEmployee.main.name,
        url: pathnames.transferEmployee.main.path,
        permission: 'EmployeeTransfer'
    },
    {
        label: pathnames.groupManagement.main.name,
        url: pathnames.groupManagement.main.path,
        permission: 'GroupManagement'
    },
    {
        label: pathnames.resourcePlan.main.name,
        children: [
            {
                label: pathnames.resourcePlan.resourceProjection.main.name,
                url: pathnames.resourcePlan.resourceProjection.main.path,
                permission: 'ResourceProjection'
            },
            {
                label: pathnames.resourcePlan.sharedServiceBillablePlan.main.name,
                url: pathnames.resourcePlan.sharedServiceBillablePlan.main.path,
                permission: 'SharedServiceBillablePlan'
            }
        ],
        permission: 'ResourcePlan'
    },
    {
        label: pathnames.reports.main.name,
        children: [
            {
                url: pathnames.reports.headcountReport.main.path,
                label: pathnames.reports.headcountReport.main.name,
                permission: 'HeadcountReport'
            },
            {
                label: pathnames.reports.employeeProjectReport.main.name,
                url: pathnames.reports.employeeProjectReport.main.path,
                permission: 'EmployeeProject'
            },
            {
                label: pathnames.reports.employeeSummaryReport.main.name,
                url: pathnames.reports.employeeSummaryReport.main.path,
                permission: 'EmployeeSummary'
            },
            {
                url: pathnames.reports.effortAllocationReport.main.path,
                label: pathnames.reports.effortAllocationReport.main.name,
                permission: 'EffortAllocationReport'
            },
            {
                label: pathnames.reports.projectTracking.main.name,
                url: pathnames.reports.projectTracking.main.path,
                permission: 'ProjectTracking'
            },
            {
                label: pathnames.reports.resourceExperienceReport.main.name,
                url: pathnames.reports.resourceExperienceReport.main.path,
                permission: 'ResourceExperience'
            },
            {
                label: pathnames.reports.kpiReport.main.name,
                url: pathnames.reports.kpiReport.main.path,
                permission: 'KPI'
            },
            {
                url: pathnames.reports.resourceProjectionReport.main.path,
                label: pathnames.reports.resourceProjectionReport.main.name,
                permission: 'ResourceProjectionReport'
            },
            {
                url: pathnames.reports.projectContractReport.main.path,
                label: pathnames.reports.projectContractReport.main.name,
                permission: 'ProjectContract'
            },
            {
                url: pathnames.reports.sharedServiceReport.main.path,
                label: pathnames.reports.sharedServiceReport.main.name,
                permission: 'SharedServiceReport'
            },
            {
                label: pathnames.reports.staffGradeIndexReport.main.name,
                url: pathnames.reports.staffGradeIndexReport.main.path,
                permission: 'StaffGradeIndexReport'
            },
            {
                url: pathnames.reports.contractorStatisticReport.main.path,
                label: pathnames.reports.contractorStatisticReport.main.name,
                permission: 'ContractorStatisticReport'
            },
            {
                label: pathnames.reports.headcountBaselineReport.main.name,
                url: pathnames.reports.headcountBaselineReport.main.path,
                permission: 'HeadCountBaselineReport'
            },
            {
                label: pathnames.reports.monthlyDeliveryStatisticReport.main.name,
                url: pathnames.reports.monthlyDeliveryStatisticReport.main.path,
                permission: 'MonthlyDeliveryStatistics'
            },
            {
                url: pathnames.reports.employeeDataForFinanceReport.main.path,
                label: pathnames.reports.employeeDataForFinanceReport.main.name,
                permission: 'EmployeeDataForFinance'
            },
            {
                label: pathnames.reports.spansOfControlReport.main.name,
                url: pathnames.reports.spansOfControlReport.main.path,
                permission: 'SpanOfControlReport'
            },
            {
                label: pathnames.reports.externalCertificateReport.main.name,
                url: pathnames.reports.externalCertificateReport.main.path,
                permission: 'ExternalCertificateReport'
            },
            {
                label: pathnames.reports.newComersReport.main.name,
                url: pathnames.reports.newComersReport.main.path,
                permission: 'NewComersReport'
            }
        ],
        permission: 'Reports'
    },
    {
        label: pathnames.admin.main.name,
        children: [
            {
                label: pathnames.admin.roleAndPermission.main.name,
                url: pathnames.admin.roleAndPermission.main.path,
                permission: 'RoleAndPermission'
            },
            {
                label: pathnames.admin.appendix.main.name,
                children: [
                    {
                        label: pathnames.admin.appendix.employeeAppendix.main.name,
                        children: [
                            {
                                label: pathnames.admin.appendix.employeeAppendix.position.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.position.main.path,
                                permission: 'Position'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.languageCertification.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.languageCertification.main.path,
                                permission: 'LanguageCertification'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.entryLanguage.main.path,
                                permission: 'EntryLanguage'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.certification.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.certification.main.path,
                                permission: 'Certification'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.nationality.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.nationality.main.path,
                                permission: 'Nationality'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.terminationReason.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.terminationReason.main.path,
                                permission: 'TerminationReason'
                            },
                            {
                                label: pathnames.admin.appendix.employeeAppendix.healthTracking.main.name,
                                url: pathnames.admin.appendix.employeeAppendix.healthTracking.main.path,
                                permission: 'HealthTracking'
                            }
                        ],
                        permission: 'EmployeeAppendix'
                    },
                    {
                        label: pathnames.admin.appendix.companyAppendix.main.name,
                        children: [
                            {
                                label: pathnames.admin.appendix.companyAppendix.company.main.name,
                                url: pathnames.admin.appendix.companyAppendix.company.main.path,
                                permission: 'Company'
                            },
                            {
                                label: pathnames.admin.appendix.companyAppendix.contractSalary.main.name,
                                url: pathnames.admin.appendix.companyAppendix.contractSalary.main.path,
                                permission: 'ContractSalary'
                            }
                        ],
                        permission: 'CompanyAppendix'
                    },
                    {
                        label: pathnames.admin.appendix.groupManagementAppendix.main.name,
                        children: [
                            {
                                label: pathnames.admin.appendix.groupManagementAppendix.market.main.name,
                                url: pathnames.admin.appendix.groupManagementAppendix.market.main.path,
                                permission: 'Market'
                            }
                        ],
                        permission: 'GroupManagementAppendix'
                    }
                ],
                permission: 'Appendix'
            },
            {
                label: pathnames.admin.emailSubscription.main.name,
                url: pathnames.admin.emailSubscription.main.path,
                permission: 'EmailSubscription'
            }
        ],
        permission: 'Admin'
    }
];

export default headerMenu;
