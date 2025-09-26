import { Dayjs } from 'dayjs';

export interface IReportList {
    unitName: string;
    billableAddRemove: number;
    resignation: number;
    jobOffered: number;
    headcount: number;
    billable: number;
    nonBillableRatio: number;
    resourceRotation: string;
    lastUpdate: string;
    isDG: boolean;
    isDCTotal: boolean;
}

export interface IFormValues {
    dateSelected: Dayjs;
}

export interface IReportListParams {
    month: string;
    year: string;
}
