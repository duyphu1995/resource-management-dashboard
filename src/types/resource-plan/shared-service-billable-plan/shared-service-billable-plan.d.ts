export interface ISharedServiceBillablePlan {
    reportId: number;
    dcName: string;
    projectName: string;
    customer: string;
    contractType: string;
    contractedBillable: string | number;
    planedBillable: string | number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week5: number;
    week6: number;
    week7: number;
    week8: number;
    week9: number;
    week10: number;
    week11: number;
    week12: number;
    week13: number;
    week14: number;
    week15: number;
    week16: number;
    week17: number;
    week18: number;
    week19: number;
    week20: number;
    week21: number;
    week22: number;
    week23: number;
    week24: number;
    week25: number;
    week26: number;
    week27: number;
    week28: number;
    week29: number;
    week30: number;
    week31: number;
    week32: number;
    week33: number;
    week34: number;
    week35: number;
    week36: number;
    week37: number;
    week38: number;
    week39: number;
    week40: number;
    week41: number;
    week42: number;
    week43: number;
    week44: number;
    week45: number;
    week46: number;
    week47: number;
    week48: number;
    week49: number;
    week50: number;
    week51: number;
    week52: number;
    [key: string]: string | number;
}

export interface ISharedServiceBillableUpdate {
    customer: string;
    contractType: string;
    contractedBillable: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week5: number;
    week6: number;
    week7: number;
    week8: number;
    week9: number;
    week10: number;
    week11: number;
    week12: number;
    week13: number;
    week14: number;
    week15: number;
    week16: number;
    week17: number;
    week18: number;
    week19: number;
    week20: number;
    week21: number;
    week22: number;
    week23: number;
    week24: number;
    week25: number;
    week26: number;
    week27: number;
    week28: number;
    week29: number;
    week30: number;
    week31: number;
    week32: number;
    week33: number;
    week34: number;
    week35: number;
    week36: number;
    week37: number;
    week38: number;
    week39: number;
    week40: number;
    week41: number;
    week42: number;
    week43: number;
    week44: number;
    week45: number;
    week46: number;
    week47: number;
    week48: number;
    week49: number;
    week50: number;
    week51: number;
    week52: number;
}

export interface ISharedServices {
    unitId: number;
    unitName: string;
}

export interface IWorkingUnits {
    id: number;
    value: string;
}

export interface IContractTypes {
    id: number;
    name: string;
}

export interface ISharedServiceBillableAllIndex {
    sharedServices: ISharedServices[];
    workingUnits: IWorkingUnits[];
    contractTypes: IContractTypes[];
    unitsBasicDto: IEmployeeUnit[];
    dCs: IDCs[];
}

interface IDCs {
    children: IDCs[];
    isSmallest: boolean;
    parentId: number;
    totalMainWorkingMember: number;
    unitId: number;
    unitName: string;
    unitTypeId: number;
    unitTypeLevel: number;
    unitTypeName: string;
}

export interface IAddNewSharedServiceBillablePlan {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week5: number;
    week6: number;
    week7: number;
    week8: number;
    week9: number;
    week10: number;
    week11: number;
    week12: number;
    week13: number;
    week14: number;
    week15: number;
    week16: number;
    week17: number;
    week18: number;
    week19: number;
    week20: number;
    week21: number;
    week22: number;
    week23: number;
    week24: number;
    week25: number;
    week26: number;
    week27: number;
    week28: number;
    week29: number;
    week30: number;
    week31: number;
    week32: number;
    week33: number;
    week34: number;
    week35: number;
    week36: number;
    week37: number;
    week38: number;
    week39: number;
    week40: number;
    week41: number;
    week42: number;
    week43: number;
    week44: number;
    week45: number;
    week46: number;
    week47: number;
    week48: number;
    week49: number;
    week50: number;
    week51: number;
    week52: number;
    year: number;
    mainProjectId: number;
    projectId: number;
    dcId: number;
    customer: string;
    contractType: string;
    contractedBillable: number;
}

export interface IAddNewSharedServiceSelect {
    label: string;
    value: string;
}
