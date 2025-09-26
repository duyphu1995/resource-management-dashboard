import { IEducation, IHealthTracking, IWorkingExperienceBeforeTMA } from './employee-management';

export interface IContractor {
    contractorBadgeId: number;
    contractorId: number;
    badgeId: string;
    username: string;
    lastName: string;
    firstName: string;
    fullName: string;
    employeeImageUrl: string;
    dcName: string;
    dgName: string;
    positionName: string;
    locationName: string;
    grade: number;
    projectName: string;
    effort: string;
    isBillable: boolean;
    joinDate: string;
    endDate: string;
    intendToEmployeeDate: string;
    sendMailDate: string;
    convertToEmployeeDate: string;
    contractorStatus: string;
    birthday: string;
    birthdayFormat: string;
    birthPlace: string;
    isGraduated: boolean;
    genderName: string;
    genderId: number;
    workEmail: string;
    personalEmail: string;
    personalPhone: string;
    mobilePhone: string;
    permanentAddress: string;
    contactAddress: string;
    idCardNo: string;
    idCardIssueDate: string;
    idCardIssuePlace: string;
    notes: string;
    companyName: string;
    contractTypeName: string;
    contractorStatusColor: string;
    entryLanguageName: string;
    entryLanguageScore: string;
    floorName: string;
    buildingName: string;
    roomName: string;
    nationalityId: number;
    transferDate: string;
    isSendMail: boolean;

    employeeId: number;
    positionId: number;
    projectId: number;
    isContractorDisabled: boolean;
    healthTrackings: IHealthTracking[];
    educations: IEducation[];
    contracts: IContractor[];
    employments: IWorkingExperienceBeforeTMA[];
}

export interface IContractorIndexes {
    companies: { companyId: string; companyName: string }[];
    units: IEmployeeUnit[];
    positions: { positionId: string; positionName: string }[];
    grades: string[];
    statuses: { statusId: number; statusName: string }[];
    genders: { genderId: string; genderName: string }[];
    mainProjects: { projectId: string; projectName: string }[];
    nationalities: { nationalityId: number; nationalityName: string }[];
    contractorStatuses: { statusId: number; statusName: string }[];
}

export interface IContractorStatus {
    contractorStatus: string;
    contractorStatusColor: string;
}

export interface IContractorStatusCount {
    working: number;
    end: number;
    total: number;
}

export interface IContractorExport {
    contractorIds: string[];
}
export interface IContractorUpdatedHistory {
    byPeople: string;
    employeeId: number;
    fieldName: string;
    from: string;
    time: string;
    to: string;
}

export interface IContractorContract {
    contracts: IContractor[];
    contractId: number;
    contractorBadgeId: number;
    companyId: number;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyOwner: string;
    ownerPosition: string;
    genderName: string;
    isNonTechnical: boolean;
    employeeId: number;
    career: string;
    comment: string;
    position: string;
    contractTypeName: string;
    startDate: string;
    isRenewalContract: boolean;
    workingWeek: string;
    contractStatus: string;
    fullName: string;
    birthday: string;
    birthPlace: string;
    contactAddress: string;
    idCardNo: string;
    idCardIssueDate: string;
    idCardIssuePlace: string;
    endDate: string;
}

export interface IConvertToEmployee {
    contractorId: number;
    employeeId: number;
    badgeId: string;
    positionId: number;
    grade: number;
    workEmail: string;
    joinDate: string;
    projectId: number;
    isByPassProbation: boolean;
}
