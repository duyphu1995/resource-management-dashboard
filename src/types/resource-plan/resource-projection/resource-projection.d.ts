import { FormInstance } from 'antd';

export interface IResourceProjectionInformation {
    items: IResourceProjectionItems[];
    totalBillableAddRemove: number;
    totalJobOffered: number;
    totalResignation: number;
    totalResourceRotation: number;
}

export interface IResourceProjectionItems {
    year: number;
    month: number;
    data: IResourceProjectionData;
}

export interface IResourceProjectionData {
    billableAddRemove: number;
    resignation: number;
    resourceRotation: number;
    jobOffered: number;
    headcount: number;
    billable: number;
    nonBillableRatio: number;
    noteBillable: string | null;
    noteJobOffered: string | null;
    noteResignation: string | null;
    noteResourceRotation: string | null;
}

export interface IFormatResourceProjection {
    year: number;
    month: number;
    billableAddRemove: number;
    resignation: number;
    resourceRotation: number;
    jobOffered: number;
    noteBillable: string | null;
    noteResignation: string | null;
    noteResourceRotation: string | null;
    noteJobOffered: string | null;
}

export interface IResourceProjectionNotes {
    noteBillable: string;
    noteResignation: string;
    noteResourceRotation: string;
    noteJobOffered: string;
}

export interface IOptionsResourceProjection {
    label: string;
    value: string;
}

export interface IPropsResourceProjectionChart {
    title: string;
    unitId: string;
    reloadAPI: object;
}
export interface IResourceProjectionChartData {
    month: string;
    headcount: number;
    billable: number;
    targetBillable: number;
    nonBillableRatio: number;
    targetNonBillableRatio: number;
}

export interface IConfigurationData {
    projectionPlanDtos: IResourceProjectionConfiguration[];
    configBaselineValueDto: {
        dayOnWeek: number;
        displayMonth: number;
        hour: number;
        minute: number;
        timeType: string;
    };
}

export interface IConfigurationUpdate {
    projectionPlanUpdateDtos: IResourceProjectionConfiguration[];
    configBaselineValueDto: {
        dayOnWeek: number;
        displayMonth: number;
        hour: number;
        minute: number;
        timeType: string;
    };
}

export interface IConfigurationTableProps {
    form: FormInstance<any>;
    dataTable: IResourceProjectionConfiguration[];
    isEditing: boolean;
}

export interface IResourceProjectionChart {
    year: number;
    month: number;
    data: IResourceProjectionData;
}

export interface IResourceProjectionChartData {
    headcount: number;
    billable: number;
    targetBillable: number;
    nonBillableRatio: number;
    targetNonBillableRatio: number;
}

export interface IResourceProjectionConfiguration {
    year: number;
    dgId?: number;
    dgName?: string;
    unitId: number;
    unit?: string;
    isDG: boolean;
    isTMA: boolean;
    targetNonBillableRatio: number;
    targetBillableQuarter1: number;
    targetBillableQuarter2: number;
    targetBillableQuarter3: number;
    targetBillableQuarter4: number;
}

export interface IFormatTableData {
    targetNonBillableRatio: { [key: string]: number };
    targetBillableQuarter1: { [key: string]: number };
    targetBillableQuarter2: { [key: string]: number };
    targetBillableQuarter3: { [key: string]: number };
    targetBillableQuarter4: { [key: string]: number };
}

export interface IResourceProjectionConfig {
    year: number;
    unitId: number;
    isDG: boolean;
    isTMA: boolean;
    targetNonBillableRatio: number;
    targetBillableQuarter1: number;
    targetBillableQuarter2: number;
    targetBillableQuarter3: number;
    targetBillableQuarter4: number;
}

export interface IFormatResourceUnit {
    year: number;
    month: number;
    billableAddRemove: { [key: string]: number };
    resignation: { [key: string]: number };
    resourceRotation: { [key: string]: number };
    jobOffered: { [key: string]: number };
    noteBillable: { [key: string]: string };
    noteResignation: { [key: string]: string };
    noteResourceRotation: { [key: string]: string };
    noteJobOffered: { [key: string]: string };
}

export interface IFormatResourceProjection {
    year: number;
    month: number;
    billableAddRemove?: number;
    resignation?: number;
    resourceRotation?: number;
    jobOffered?: number;
    noteBillable?: string;
    noteResignation?: string;
    noteResourceRotation?: string;
    noteJobOffered?: string;
}

export interface IResourceProjectionNotes {
    year: number;
    month: number;
    dcName: string;
    noteBillable: string;
    noteResignation: string;
    noteResourceRotation: string;
    noteJobOffered: string;
}
