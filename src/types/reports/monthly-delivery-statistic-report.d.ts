import { ReactNode } from 'react';

export interface IByDGs {
    unitId: string;
    unitName: string;
    previousTotalBillable: number;
    currentTotalBillable: number;
    changedTotalBillable: number;
    percentChangedTotalBillable: number;
}

export interface IOverviewItem {
    label: string;
    value: number | string | ReactNode;
}

export interface ISharedServicesUnit {
    unitId: string;
    unitName: string;
    effort: number;
    billable: number;
    noneBillable: number;
    noneBillableRatioPercent: number;
}

export interface IStaffGradeIndex {
    dgName: string;
    totalJoin: number;
    totalLeave: number;
    delta: number;
    sgiNextMonth: number;
    sgiLastMonth: number;
    type: number;
}

export interface IMonthlyStatistic {
    DG: IDGMonthlyStatistic[];
    Position: IPositionMonthlyStatistic[];
}

export interface IDGMonthlyStatistic {
    id: number;
    name: string;
    number: number;
    numberPercent: number;
    type: string;
}

export interface IPositionMonthlyStatistic extends IDGMonthlyStatistic {}

interface IMonthlyIndex {
    dgIndexDto: { id: number; name: string }[];
    positionIndexDto: { id: number; name: string }[];
}

export interface IResignationListReport {
    badgeId: string;
    fullName: string;
    joinDate: string;
    projectName: string;
    dcName: string;
    dgName: string;
    grade: number;
    positionName: string;
    applyDate: string;
    resignDate: string;
}

export interface IAttrition {
    year: string;
    month: string;
    resignationNumber: number;
    attritionNumber: number;
    resignationPercent: number;
    attritionPercent: number;
    isTotal: boolean;
}

export interface IMonthlyStatisticCommon {
    reloadData: { key: string };
    filterData: IMonthlyStatisticFilterData;
}

export interface IMonthlyStatisticFilterData {
    month: string;
    year: string;
}
