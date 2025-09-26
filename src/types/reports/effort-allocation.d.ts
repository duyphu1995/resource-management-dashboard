export interface IEffortAllocationTable {
    badgeId: string;
    birthday: string;
    birthPlace: string;
    contractEffort: number;
    dc: string;
    employeeId: number;
    endProbationDate: string;
    fullName: string;
    genderName: string;
    grade: number;
    joinDate: string;
    notes: string;
    positionName: string;
    probationStatus: string;
    project: string;
    resignationStatusName: string;
    statusName: string;
    totalEffort: number;
}

interface IUnitReportProjectInfo {
    employeeId: number;
    projectName: string;
    dcName: string;
    grade: number;
    effort: number;
    billableStatus: string;
    billable: number;
    isMainProject: boolean;
    projectManager: string;
    beforeWorkExp: number;
    currentWorkExp: number;
    notes: string;
}

export interface IEffortAllocationReportList {
    badgeId: string;
    fullName: string;
    genderName: string;
    birthday: string;
    permanentAddress: string;
    contactAddress: string;
    universityName: string;
    graduatedYear: number;
    positionName: string;
    joinDate: string;
    workEmail: string;
    projectName: string;
    dcName: string;
    grade: number;
    billableStatus: string;
    billable: number;
    effort: number;
    totalExp: number;
    notes: string;
    unitReportProjectInforDtos: IUnitReportProjectInfo[];
}

interface IFormValuesEmployeeList {
    unitId: string;
    filterBy: string;
    includeContractor: boolean;
}

export interface IPayloadExport {
    filterBy: string;
    sortedBy: string;
}

export interface IPropsSubTabs {
    setPayloadExport: React.Dispatch<React.SetStateAction<IPayloadExport>>;
}
