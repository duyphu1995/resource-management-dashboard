import { IInfoAttachment } from '../common';
import { IEmployeeUnit } from './employee-management';

export interface IOnsite {
    onsiteFormId: number;
    employeeId: number;
    fullName: string;
    badgeId: string;
    projectName: string;
    customer: string;
    emergency: string;
    cashFromTMA: string;
    receivedDate: string;
    incomeRemark: string;
    onsiteCountryId: number;
    cityName: string;
    visaTypeName: string;
    flightDeparture: string;
    flightReturn: string;
    expectedEndDate: string;
    actualEndDate: string;
    isInsurance: boolean;
    notes: string;
    commitmentId: number;
    commitment: ICommitments;
    expenses: IExpense[];
    workEmail: string;
    companyName: string;
    statusColor: string;
    dgName: string;
    dcName: string;
    positionName: string;
    countryName: string;
    onsiteFormId: number;
    countryColor: string;
}

export interface IExpense {
    expenseName: string;
    // name same as expenseName but with api return name is expenseName
    name: string;
    monetaryUnit: string;
    costFee: number;
    notes: string;
    onsiteExpenseId: number;
}

export interface ICommitments extends IInfoAttachment {
    commitmentId: number;
    commitmentName: string;
    commitmentTypeId: number;
    commitmentTypeName: string;
    employeeId: number;
    fromDate: string;
    isBroken: boolean;
    notes: string;
    signedDate: string;
    commitmentTypeId: number;
    toDate: string;
}

export interface IOnsiteExport {
    onsiteFormIds: IOnsite[];
}

export interface IOnsiteIndexes {
    companies: {
        companyId: string;
        companyName: string;
    }[];
    units: IEmployeeUnit[];
    positions: {
        positionId: string;
        positionName: string;
    }[];
    onsiteCountries: {
        onsiteCountryId: string;
        countryName: string;
    }[];
    onsiteCity: string[];
    visaTypes: {
        visaTypeId: string;
        visaTypeName: string;
    }[];
    commitmentTypes: {
        commitmentTypeId: number;
        commitmentTypeName: string;
    }[];
}

export interface ITotalMoney {
    totalCostFee: number;
    totalMonetaryUnit: string;
}
export interface Result {
    [key: string]: ITotalMoney;
}
export interface IInfoSection {
    title?: string | undefined;
    columns: IField[];
}

export interface IOptionVisaType {
    name: string;
}
export interface IOptionMoney extends IOptionVisaType {}

export interface IOptionProject {
    unitId: number;
    unitName: string;
}

export interface IOptionCountry {
    onsiteCountryId: number;
    countryName: string;
}

export interface IExpenseDetail {
    expenseName: string;
    monetaryUnit: string;
    costFee: number;
    notes: string;
    onsiteExpenseId: number;
}

export interface ICommitmentTypes {
    commitmentTypeId: number;
    commitmentTypeName: string;
}
