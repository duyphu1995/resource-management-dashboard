import { IEmployeeUnit } from './employee-management';

export interface IContract {
    //EmployeeInfo
    employeeId: number;
    badgeId: string;
    fullName: string;
    workEmail: string;
    birthday: string;
    birthPlace: string;
    career: string;
    contactAddress: string;
    idCardNo: string;
    idCardIssueDate: string;
    idCardIssuePlace: string;
    nationalityName: string;
    statusColor: string;
    //CompanyInfo
    companyId: number;
    companyName: string;
    companyNameEN: string;
    companyAcronym: string;
    companyOwner: string;
    ownerPosition: string;
    nationalityOwner: string;
    representFor: string;
    companyAddress: string;
    companyPhone: string;
    dgName: string;
    dcName: string;
    projectName: string;
    //ContractInfo
    contractId: number;
    contractTypeName: string;
    validityId: number;
    validityName: string;
    startDate: string;
    endDate: string;
    signOrder: string;
    workPlace: string;
    professionalTitles: string;
    positionName: string;
    salary: number;
    salaryInText: string;
    renewApprovalStatusName: string;
    comment?: string;
    renewApprovalStatusId: number;
    renewApprovalName?: string;
    isNonTechnical?: boolean;
    contractStatus?: string;
    isDeleted: boolean;
    notes: string;
}

export interface IContractIndexes {
    companies: {
        companyId: string;
        companyName: string;
    }[];
    units: IEmployeeUnit[];
    contractTypes: {
        contractTypeId: string;
        contractTypeName: string;
    }[];
    nonTechnicalValues: string[];
    positions: {
        positionId: string;
        positionName: string;
    }[];
    renewApprovals: {
        renewApprovalStatusId: string;
        renewApprovalStatusName: string;
    }[];
    careers: {
        career: string;
        isNonTechnical: boolean;
    }[];
}

export interface IContractCompany {
    companyId: number;
    companyName: string;
    prefixKeyContract: string;
    companyOwner: string;
    ownerPosition: string;
    companyAddress: string;
    companyPhone: string;
    representFor: string;
}

export interface IContractValidityInfo {
    validityId: number;
    validityName: string;
    period: number;
    contractType: string;
}

export interface IContractAddEditIndexes {
    companiesInfor: IContractCompany[];
    validityPeriodsInfor: IContractValidityInfo[];
    professionalTitlesInfor: {
        professionalTitle: string;
        isNonTechnical: boolean;
    }[];
    careersInfor: {
        career: string;
        isNonTechnical: boolean;
    }[];
    renewApprovalStatusInfor: {
        renewApprovalStatusId: string;
        renewApprovalStatusName: string;
    }[];
}

export interface IContractExport {
    contractIds: IContract[];
}

export interface IContractSalary {
    position: string;
    professionalTitles: string;
    salary: number;
    salaryInText: string;
}

export interface IContractEdit {
    contractId: number;
    employeeId: number;
    contractTypeId: number;
    companyId: number;
    career: string;
    professionalTitles: string;
    fromDate: string;
    toDate?: string;
    comment: string;
    attachment?: string;
    signOrder?: number;
    salary: number;
    salaryInText: string;
    isNonTechnical: boolean;
    isRenewalContract?: boolean;
    loggedOnUser?: string;
}
