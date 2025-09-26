import { Dayjs } from 'dayjs';

export interface IEmployeeDataForFinance {
    key: number;
    badgeId: string;
    fullName: string;
    workEmail: string;
    projectName: string;
    dcName: string;
    dgName: string;
    statusName: string;
    statusColor: string;
}

export interface IFormValues {
    date: Dayjs;
    unitIds: string[] | undefined;
}

export interface IRequestTableParams {
    date: string;
}
