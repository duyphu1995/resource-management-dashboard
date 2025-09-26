import { IEmployeeUnit } from './employee-management';

export interface IUpdateIDCardList {
    employeeId: number;
    badgeId: string;
    fullName: string;
    idCardNo: string;
    idCardIssueDate: string;
    idCardIssuePlace: string;
    idCardFontImageUrl: string;
    idCardBackImageUrl: string;
    dcName: string;
    gdName: string;

    companyName: string;
    projectName: string;
    submitOn: string;
    idCardStatusName: string;
    idCardFontImage?: string;
    idCardBackImage?: string;
}

export interface IIdCardIndexes {
    companies: { companyId: string; companyName: string }[];
    units: IEmployeeUnit[];
    statuses: { idCardStatusId: string; idCardStatusName: string }[];
}
