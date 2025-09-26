export interface IProjectTrackingList {
    key: string;
    action: string;
    author: string;
    createdOn: string;
    dcName: string;
    dgName: string;
    projectName: string;
}

export interface IProjectTracking {
    unitIds?: string[];
    fromDate: string;
    toDate?: string;
}

export interface IBillableTrackingList {
    closedProjectBillableTracking: IBillableTrackingItem[];
    newProjectBillableTracking: IBillableTrackingItem[];
    workingProjectBillableTracking: IBillableTrackingItem[];
}

export interface IBillableTrackingItem {
    key: string;
    projectName: string;
    dcName: string;
    dgName: string;
    billableNextWeek: number;
    billableLastWeek: number;
    billableChange: number;
    billableLatest: number;
    billableLatestFrom: string;
    createdDate: string;
    color: string;
    action: string;
}

export interface IBillableTracking {
    year: string;
    week: string;
    isShowAll: boolean;
}

export interface IBillableTrackingFilter {
    year: Dayjs;
    week: string;
    isShowAll: boolean;
}
