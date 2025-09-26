export interface IDocumentAllTypes {
    documentTypeId: number;
    documentTypeName: string;
}

export interface IDocumentType extends IDocumentAllTypes {
    employeeId: number;
    isCompleted: boolean;
    requestDate: string;
    receivedDate: string;
    notes: string;
    statusName: string;
    statusColor: string;
    type: string;
    employeeDocumentId: number;
    rankTypeId: number;
    rankTypeName: string;
}

export interface IDocumentList {
    employeeId: number;
    badgeId: string;
    fullName: string;
    workEmail: string;
    companyName: string;
    positionName: string;
    projectName: string;
    dcName: string;
    dgName: string;
    documents: IDocumentType[];
    statusName: string;
    joinDate: string;
    statusColor: string;
    checked: boolean
}

export interface IDocumentExport {
    badgeId: string[];
}

interface IDocumentUnit {
    unitId: string;
    unitName: string;
    children?: IDocumentUnit[];
}

export interface IDocumentAllIndexes {
    companies: { companyId: string; companyName: string }[];
    positions: { positionId: string; positionName: string }[];
    rankTypes: { rankId: string; rankName: string }[];
    statuses: { statusId: string; statusName: string }[];
    units: IDocumentUnit[];
}

export interface IReminderEmail {
    employeeIds: string[];
}
