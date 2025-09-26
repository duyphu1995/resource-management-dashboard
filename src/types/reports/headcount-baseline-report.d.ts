export interface IBaselineHeadcountList {
    adjustedEffort: number;
    adjustedNonBillable: number;
    adjustedNonBillableRatioPercent: number;
    dcName: string;
    dgName: string;
    inProbationEffort: number;
    isDG: boolean;
    isDGTotal: boolean;
    isSharedServiceUnit: string;
    isTMATotal: boolean;
    month: number;
    pendingResignationEffort: number;
    programName: string;
    projectName: string;
    sharedServiceUnit: string;
    totalBillable: number;
    totalEffort: number;
    totalHeadCount: number;
    totalNonBillable: number;
    totalNonBillableRatioPercent: number;
    totalNonBillableRatioStar: number;
    week: number;
    year: number;
    remakes: string;
    createdOn: string;
}
export interface IBaselineHeadcount {
    year: string;
    week: string;
    unitTypeLevel?: '1' | '2' | '3';
    tab?: string;
}
export interface IExportBaselineHeadcount {
    from: string;
    to: string;
    unitTypeLevel: string;
}
