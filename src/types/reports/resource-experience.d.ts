export interface IYearOfExperienceSummary {
    isDG: boolean;
    averageExp: number;
    dcId: number;
    dcName: string;
    dgId: number;
    dgName: string;
    projectId: number;
    projectName: null;
    range0: number;
    range1: number;
    range2: number;
    range3: number;
    range4: number;
    range5: number;
    range6: number;
    range7: number;
    range8: number;
    range9: number;
    range10: number;
    range11: number;
    totalEmployee: number;
    totalExp: number;
    isCountTotal: boolean;
}

export interface ITableExperienceDetail {
    averageExp: number;
    dcId: number;
    dcName: string;
    dgId: number;
    dgName: string;
    projectId: number;
    projectName: string;
    range0: number;
    range1: number;
    range2: number;
    range3: number;
    range4: number;
    range5: number;
    range6: number;
    range7: number;
    range8: number;
    range9: number;
    range10: number;
    range11: number;
    totalEmployee: number;
    totalExp: number;
}

export interface IChartExperienceDetail {
    range0: number;
    range0Percent: number;
    range1: number;
    range1Percent: number;
    range2: number;
    range2Percent: number;
    range3: number;
    range3Percent: number;
    total: number;
    totalPercent: number;
}

export interface ITableChartExperienceDetail {
    key: number;
    title: string;
    range0?: number;
    range1?: number;
    range2?: number;
    range3?: number;
    total?: number;
}

type IGradeFields = {
    [K in `grade${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16}`]: number;
};

export interface IStaffGradeSummaryTable extends IGradeFields {
    isDG: boolean;
    createdOn: string;
    dcName: string;
    staffGradeIndex: number;
    isCountTotal: boolean;
}

export interface IStaffGradeProjectTable extends IGradeFields {
    createdOn: string;
    projectName: string;
    dcName: string;
    buName: string;
    staffGradeIndex: number;
}

export interface IStaffGradeProgramTable extends IGradeFields {
    createdOn: string;
    programName: string;
    dcName: string;
    buName: string;
    staffGradeIndex: number;
}

export interface IParamsChartExperienceDetail {
    unitId: string;
    minimumYear?: string;
    yearRange?: string;
}

interface ITitleInfo {
    title: string;
    tooltip: string;
}

export interface ITitleDynamic {
    title0: ITitleInfo;
    title1: ITitleInfo;
    title2: ITitleInfo;
    title3: ITitleInfo;
}