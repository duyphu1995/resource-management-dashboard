export interface IManagement {
    employeeId: number;
    badgeId: number;
    fullName: string;
    employeeImageUrl: string;
    projectId: number;
    projectName: string;
    workingStatusId: number;
    statusName: string;
    notes: string;
    positionId: number;
    positionName: string;
    companyId: number;
    companyName: string;
    dgName: string;
    dcName: string;
    statusColor: string;
}

interface IManagementUnit {
    unitId: string;
    unitName: string;
    children?: IManagementUnit[];
}

export interface IManagementIndexes {
    companies: { companyId: string; companyName: string }[];
    units: IManagementUnit[];
    positions: { positionId: string; positionName: string }[];
    statuses: { statusId: string; statusName: string }[];
}

export interface IManagementExport {
    employeeIds: string[];
}
