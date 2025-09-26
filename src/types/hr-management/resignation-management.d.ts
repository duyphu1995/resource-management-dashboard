export interface IResignation {
    resignationFormId: number;
    employeeId: number;
    badgeId: string;
    fullName: string;
    personalEmail: string;
    workEmail: string;
    mobilePhone: string;
    companyName: string;
    dgName: string;
    dcName: string;
    projectName: string;
    positionName: string;
    grade: string;
    beforeWorkExp: number;
    currentWorkExp: number;
    totalWorkExp: number;
    paMark: number;
    personalContact: string;
    resignationTypeId: number;
    resignationTypeName: string;
    resignationStatusId: number;
    resignationStatusName: string;
    resignationStatusColor: string;
    applyDate: string;
    resignDate: string;
    cancelledDate: string;
    reasonId: number;
    reasonName: string;
    notes: string;
    isSentResignationEmail: boolean;
    isAttrition: boolean;
    isCommitmentBound: boolean;

    birthday: string;
    birthPlace: string;
    idCardNo: string;
    idCardIssuePlace: string;
    idCardIssueDate: string;
    isOfficialEmployee: boolean;
    permanentAddress: string;

    companyOwner: string;
    companyAddress: string;
    companyPhone: string;
    companyFax: string;
}

export interface IResignationEmployeeProject {
    dcName: string;
    dgName: string;
    effort: number;
    employeeProjectStatus: string;
    startDate: string;
    endDate: string;
    managerName: string;
    positionName: string;
    projectName: string;
}

export interface IResignationEmployeeCommitment {
    commitmentId: number;
    commitmentName: string;
    costFee: number;
    employeeId: number;
    fromDate: string;
    isBroken: boolean;
    notes: string;
    signedDate: string;
    toDate: string;
}

export interface IResignationEmployeeContract {
    contractId: number;
    contractTypeName: string;
    employeeId: number;
    fromDate: string;
    toDate: string;
    signOrder: number;
    isNonTechnical: boolean;
    isRenewalContract: boolean;
    renewApprovalStatusName: string;
}

export interface IResignationEmployeeOnsiteHistory {
    actualEndDate: string;
    cityName: string;
    countryName: string;
    employeeId: number;
    expectedEndDate: string;
    flightDeparture: string;
    flightReturn: string;
    onsiteCountryId: number;
    onsiteFormId: number;
    projectName: string;
    visaTypeName: string;
    customer: string;
}

export interface IResignationEmployeeTemporaryLeave {
    actualEndDate: string;
    effort: number;
    endDate: string;
    projectId: number;
    projectName: string;
    startDate: string;
    statusId: number;
    statusName: string;
    temporaryLeaveId: number;
}

export interface IResignationCancelled {
    projectName: string;
    dgName: string;
    dcName: string;
    applyDate: string;
    cancelledDate: string;
    reasonName: string;
}

export interface IResignationMoreInformation {
    employeeCommitments: IResignationEmployeeCommitment[];
    employeeContracts: IResignationEmployeeContract[];
    employeeOnsiteHistories: IResignationEmployeeOnsiteHistory[];
    employeeProjects: IResignationEmployeeProject[];
    employeeTemporaryLeaves: IResignationEmployeeTemporaryLeave[];
    resignationFormCancelled: IResignationCancelled[];
}

export interface IResignationUnit {
    unitId: number;
    unitName: string;
    parentId: number;
    unitTypeId: number;
    unitTypeName: string;
    isSmallest: boolean;
    children: IResignationUnit[];
}

export interface IResignationIndexes {
    companies: { companyId: number; companyName: string }[];
    positions: { isDefault: boolean; positionId: number; positionName: string }[];
    units: IResignationUnit[];
    reasonForLeave: { reasonId: number; reasonName: string; isAttrition: boolean }[];
    resignationStatuses: { statusId: number; statusName: string; statusTypeId: number; totalEffort: number }[];
    resignationTypes: { resignationTypeId: number; resignationTypeName: string; isOfficialEmployee: boolean }[];
}

export interface IResignationSearchParam {
    companyIds?: string[];
    positionIds?: string[];
    unitIds?: string[];
    resignationStatusIds?: string[];
    reasonForLeaveIds?: string[];
    fromApplyDate?: string;
    toApplyDate?: string;
    fromResignDate?: string;
    toResignDate?: string;
}

export interface IResignationExport {
    employeeIds: string[];
}

export interface IResignationAdd {
    employeeId: number;
    reasonId: number;
    resignationTypeId: number;
    applyDate: string;
    resignDate: string;
    isAttrition: true;
    personalContact: string;
    mobilePhone: string;
    notes: string;
}

export interface IResignationEdit {
    resignationFormId: number;
    employeeId: number;
    reasonId: number;
    resignationTypeId: number;
    resignationStatusId: number;
    applyDate: string;
    resignDate: string;
    cancelledDate: string;
    isAttrition: true;
    personalContact: string;
    mobilePhone: string;
    notes: string;
}

export interface IResignationUpdatedHistory {
    byPeople: string;
    employeeId: number;
    fieldName: string;
    from: string;
    time: string;
    to: string;
}
