export interface ISpanOfControlReport {
    unitId: number;
    title: string;
    data: IData[];
}

export interface IData {
    type: string;
    value: number;
}
export interface ISpanControlList {
    no: number;
    badgeId: string;
    fullName: string;
    email: string;
    mainProject: string;
    dc: string;
    dg: string;
    position: string;
    grade: number;
    type: string;
}
