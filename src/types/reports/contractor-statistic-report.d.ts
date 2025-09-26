export interface IContractorStatisticBasicDto {
    dcName: string;
    newGrade: number;
    experienced: number;
    onWorking: number;
    convertToEmployee: number;
    endedContract: number;
    dcTotal: number;
}

export interface IContractorStatisticInfo {
    totalNewGrade: number;
    percentNewGrade: number;
    totalExperienced: number;
    percentExperienced: number;
}

export interface IContractorStatisticReport {
    contractorStatisticBasicDtos: IContractorStatisticBasicDto[];
    contractorSatisticInfo: IContractorStatisticInfo;
}

export interface IStatisticChartConfig {
    title: string;
    totalNewGrade?: number;
    totalExperienced?: number;
    total: number;
}

export interface IFilterFormValues {
    unitIds: string;
    fromDate: string;
    toDate: string;
}
