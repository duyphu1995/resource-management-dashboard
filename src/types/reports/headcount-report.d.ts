export interface ISharedServiceUnit {
    UnitId: number;
    Year: number;
    Week: number;
    name: string;
    number: string;
}

export interface IHeadcountData {
    year: number;
    month: number;
    week: number;
    projectId: number;
    projectName: string;
    programId: number;
    programName: string;
    dcId: number;
    dcName: string;
    dgId: number;
    dgName: string;
    sharedServiceUnit: string;
    isDG: boolean;
    isDGTotal: boolean;
    isTMATotal: boolean;
    isSharedServiceUnit: boolean;
    totalEffort: number;
    totalBillable: number;
    totalNonBillable: number;
    totalNonBillableRatioPercent: number;
    totalHeadCount: number;
    totalNonBillableRatioStar: number;
    inProbationEffort: number;
    pendingResignationEffort: number;
    adjustedEffort: number;
    adjustedNonBillable: number;
    adjustedNonBillableRatioPercent: number;
    remakes: string;
    createdOn: string;
    staffGradeIndex: string;
    productFactorValue: string;
}

export interface IHeadcountDetailsTable {
    createdOn: string;
    dgName: string;
    dcName: string;
    projectDepartment: string;
    headcount: number;
    effort: number;
    billable: number;
    nb: number;
    nbr: number;
    nbrRequired: number;
    staffGradeIndex: number;
    productivityFactor: number;
}

export interface ISharedServiceSummaryTable {
    unitId: number;
    unitName: string;
    hcInDept: number;
    billableInDept: number;
    hcOutDept: number;
    billableOutDept: number;
    totalHeadCount: number;
    totalBillable: number;
    totalNonBillable: number;
    totalNonBillableRatio: number;
}

export interface ISharedServiceDetailsTable {
    year?: number;
    week: number;
    dgName: string;
    dcName?: string;
    projectName?: string;
    effort: number;
    billable: number;
    nonBillable: number;
    isSharedService?: boolean;
    isGroupHeader?: boolean;
}
