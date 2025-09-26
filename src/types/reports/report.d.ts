import { IEmployeeUnit } from '../hr-management/employee-management';

export interface IReportIndexes {
    units: IEmployeeUnit[];
    certificates: IReportCertificate[];
    resourceUnits: IEmployeeUnit[];
    companies: IReportCompany[];
    spanControlTypes: ISpanControlType[];
    departmentUnits: IDepartmentUnit[];
    dcs: IDcS[];
    managers: IManagers[];
    projectCountryBasicDtos: IProjectCountryBasicDtos[];
    marketGroupBasicDtos: IMarketGroupBasicDtos[];
    projectContractStatuses: IProjectContractStatuses[];
    projectStatuses: IProjectStatuses[];
    projectTypes: IProjectTypes[];
    projects: IProject[];
}

interface IDcS {
    children: IDcS[];
    isSmallest: boolean;
    parentId: number;
    totalMainWorkingMember: number;
    unitId: number;
    unitName: string;
    unitTypeId: number;
    unitTypeLevel: number;
    unitTypeName: string;
    managedBy: number;
}

interface IManagers {
    employeeId: number;
    employeeNumber: number;
    badgeId: string;
    employeeImageUrl: string;
    fullName: string;
    username: string;
    workEmail: string;
    personalEmail: string;
    workPhone: string;
    mobilePhone: string;
    homePhone: string;
    emergencyPhone: string;
    contactAddress: string;
    birthday: string;
    birthPlace: string;
    joinDate: string;
    grade: number;
    socialBookNo: string;
    idCardNo: string;
    idCardIssueDate: string;
    idCardIssuePlace: string;
    passportNo: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    isLowPerformance: boolean;
    isBlacklisted: boolean;
    positionName: string;
    nationalityName: string;
    genderName: string;
    statusName: string;
    statusColor: string;
    companyName: null;
    locationName: string;
    contractTypeName: string;
    isGroupByPATool: boolean;
    educationNames: any[];
    maritalStatusName: string;
    buildingName: string;
    dgName: string;
    dcName: string;
    projectName: string;
    projectId: number;
    managerEmail: string;
    resignationStatusName: string;
    companyId: number;
}

interface IMarketGroupBasicDtos {
    marketplaceId: number;
    marketplaceName: string;
}

interface IProjectCountryBasicDtos {
    countryId: number;
    countryName: string;
    marketGroupId: number;
}

interface IProjectContractStatuses {
    statusId: number;
    statusName: string;
    statusColor: string;
    statusTypeId: number;
    statusTypeDescription: string;
    totalEffort: number;
}

interface IProject {
    unitId: number;
    unitName: string;
    parentId: number;
    unitTypeId: number;
    unitTypeName: string;
    unitTypeLevel: number;
    totalMainWorkingMember: number;
    isSmallest: boolean;
    children: IProject[];
}

interface IProjectTypes {
    projectTypeId: number;
    projectTypeName: string;
}

interface IProjectStatuses {
    statusId: number;
    statusName: string;
    statusColor: string;
    statusTypeId: number;
    statusTypeDescription: string;
    totalEffort: number;
}

export interface IDepartmentUnit {
    unitId: number;
    unitName: string;
    parentId: number;
    unitTypeId: number;
    unitTypeName: string;
    unitTypeLevel: number;
    totalMainWorkingMember: number;
    isSmallest: boolean;
    children: IDepartmentUnit[];
}

export interface IReportCertificate {
    certificateCatId: number;
    certificateCatName: string;
}

export interface IReportCompany {
    companyId: number;
    companyName: string;
    moduleName: string;
}

export interface ISpanControlType {
    value: number;
    label: string;
}

export interface ISpanControlFilter {
    spanControlTypes?: (string | undefined)[];
    unitIds?: (string | undefined)[];
}

export interface IMostRecentHaveData {
    reportPage: string;
    year: string;
    week: string;
}
