export interface IKpiReports {
    startDate: string;
    year: number;
    weekNumber: number;
    kpiUnitsReports: kpiUnitsReports[];
    kpiReportInformation: IKpiReportsInformation[];
}

export interface IKpiReportsUnit {
    unitId: number;
    unitName: string;
    unitTypeName: string;
    parent: number;
    totalAttrition: any;
    kpiChildUnitsReports: IKpiReportsUnit[];
}

export interface IKpiReportsInformation {
    applyDate: string;
    badgeId: string;
    dcId: number;
    dcName: string;
    dgId: number;
    dgName: string;
    fullName: string;
    projectId: number;
    projectName: string;
    resignDate: string;
    weekNumber: number;
}

export interface IPopoverKpiReportProps {
    header: {
        year: number;
        week: number;
        name: string;
    };
    detail: IKpiReportsUnit[];
    value: React.ReactNode;
}

export interface IFilterValues {
    year: Dayjs;
    quarter: number;
}

export interface IWeekColumn {
    col: IKpiReports;
    index: number;
    record: IKpiReportsUnit;
}
