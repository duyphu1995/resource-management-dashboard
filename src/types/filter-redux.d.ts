export interface IManagementState {
    companyIds?: number[];
    unitIds?: string[];
    positionIds?: string[];
    statusIds?: string[];
    genderIds?: string[];
    fromBirthday?: string;
    toBirthday?: string;
    birthPlace?: string;
    workPhone?: string;
    mobilePhone?: string;
    homePhone?: string;
    resignationStatusIds?: string[];
    grades?: string[];
    idCardNo?: string;
    fromIdCardIssueDate?: string;
    toIdCardIssueDate?: string;
    fromJoinDate?: string;
    toJoinDate?: string;
    maritalStatusIds?: string[];
    nationalityIds?: string[];
    locationNames?: string[];
    passportNo?: string;
    fromPassportIssueDate?: string;
    toPassportIssueDate?: string;
    fromPassportExpiryDate?: string;
    toPassportExpiryDate?: string;
    educationNames?: string[];
    mainProjectValues?: string[];
    blacklistedValues?: string[];
    lowPerformanceValues?: string[];
    groupPAToolValues?: string[];
}

export interface IOnsiteManagementState extends IManagementState {
    onsiteCountryIds?: string[];
    cityNames?: string;
    visaTypeNames?: string[];
    fromFlightDeparture?: string;
    toFlightDeparture?: string;
    fromExpectedEndDate?: string;
    toExpectedEndDate?: string;
    isBrokenCommitment?: boolean;
}

export interface IResignationManagementState extends IManagementState {
    resignationStatusIds?: string[];
    fromApplyDate?: string;
    toApplyDate?: string;
    fromResignDate?: string;
    toResignDate?: string;
    fromCancelDate?: string;
    toCancelDate?: string;
    reasonForLeaveIds?: string[];
    isCancelled?: boolean;
}

export interface IContractManagementState extends IManagementState {
    contractTypeIds?: string[];
    fromStartDate?: string;
    toStartDate?: string;
    fromEndDate?: string;
    toEndDate?: string;
    signOrder?: string;
    renewApprovalStatusIds?: string[];
    nonTechnicalValues?: string[];
    isDeleted?: boolean;
}
export interface ITemporaryLeavesState extends IManagementState {
    fromStartDate?: string;
    toStartDate?: string;
    fromEndDate?: string;
    toEndDate?: string;
    fromActualEndDate?: string;
    toActualEndDate?: string;
    LeaveTypeIds?: string[];
    isFinish?: boolean;
}
export interface IContractorManagementState extends IManagementState {
    contractorStatuses?: string[];
    signOrder?: string;
    effort?: number;
    billableValues?: string[];
    fromEndDate?: string;
    toEndDate?: string;
    fromIntendToEmployeeDate?: string;
    toIntendToEmployeeDate?: string;
    fromSendMailDate?: string;
    toSendMailDate?: string;
    personalEmail?: string;
    idCard?: string;
    idCardIssuePlace?: string;
    fromTransferDate?: string;
    toTransferDate?: string;
    permanentAddress?: string;
    contactAddress?: string;
}
export interface IDocumentManagementState extends IManagementState {
    fromJoinedDate?: string;
    toJoinedDate?: string;
    isCompletedValues?: string[];
    documentTypeIds?: string[];
    fromRequestDate?: string;
    toRequestDate?: string;
    fromReceivedDate?: string;
    toReceivedDate?: string;
}
export interface IUpdateIDCardListState extends IManagementState {
    fromSubmitOn?: string;
    toSubmitOn?: string;
}

export interface IEmployeeTransferState extends IManagementState {
    fromProjectIds?: string[];
    toProjectIds?: string[];
    fromTransferDate?: string;
    toTransferDate?: string;
    transferStatusIds?: string[];
    isCompletedTransfer?: boolean;
}

export interface IPaginationTable {
    currentPage: number;
    pageSize: number;
}

export interface ISearchParamsState {
    employeeManagement: {
        filter?: IManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    onsiteManagementWorking: {
        filter?: IOnsiteManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    onsiteManagementBroken: {
        filter?: IOnsiteManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    resignationManagementResigned: {
        filter?: IResignationManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    resignationManagementCancelled: {
        filter?: IResignationManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    contractManagementActive: {
        filter?: IContractManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    contractManagementDeleted: {
        filter?: IContractManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    managementList: {
        filter?: IManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    temporaryLeavesOnGoing: {
        filter?: ITemporaryLeavesState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    temporaryLeavesFinish: {
        filter?: ITemporaryLeavesState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    contractorManagement: {
        filter?: IContractorManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    documentManagement: {
        filter?: IDocumentManagementState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    updateIDCardList: {
        filter?: IUpdateIDCardListState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    employeeTransferPending: {
        filter?: IEmployeeTransferState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    employeeTransferCompleted: {
        filter?: IEmployeeTransferState;
        searchByKeyword?: string;
        showHideColumn?: string[];
        paginationTable?: IPaginationTable;
    };
    // Admin
    adminPosition: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminLanguageCertification: {
        filter?: {
            tabActive?: string;
        };
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminLevelCertification: {
        filter?: {
            tabActive?: string;
        };
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminEntryLanguage: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminCertification: {
        filter?: {
            tabActive?: string;
        };
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminCertificationName: {
        filter?: {
            tabActive?: string;
        };
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminNationality: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminTerminationReason: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminHealthTracking: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminCompany: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminContractSalary: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
    adminMarket: {
        filter?: any;
        showHideColumn?: string[];
        searchByKeyword?: string;
        paginationTable?: IPaginationTable;
    };
}
