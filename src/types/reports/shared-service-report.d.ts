import { Dayjs } from 'dayjs';

export interface ISharedServiceValues {
    fromDate: Dayjs;
    toDate: Dayjs;
}

export interface ISharedService {
    week?: number;
    effort: number;
    billable: number;
    year: number;
}

export interface ISummarySharedServiceReport {
    sharedServices: ISharedService[];
    sharedServiceName: string;
    sharedServiceSummary: ISharedService;
}

export interface IDetailsBySharedService {
    projectName: string;
    unitName: string;
    dgName: string;
    billable: number;
    isSharedServiceUnit: boolean;
}

export interface IDetailsByDcDg {
    unitName: string;
    isDG: boolean;
    sharedServiceUnits: {
        unitName: string;
        billable: number;
    }[];
}

// API
export interface IParamsSharedServiceReport {
    fromDate: string;
    toDate: string;
}
