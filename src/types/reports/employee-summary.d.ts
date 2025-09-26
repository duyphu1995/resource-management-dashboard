export interface ITabEmployeeSummaryProps {
    tab: string;
    moduleName: string;
    currentTab?: string;
    handleScroll?: (value: string) => void;
    dataTmaSummary?: ITmaSolutionsSummary[];
    setDataTmaSummary?: (value: ITmaSolutionsSummary[]) => void;
}

export interface IParamsList {
    tabType?: string;
    companyId?: number;
    genderId?: number;
    positionId?: number;
    customOrgChartReportStructureId?: number;
    unitId?: number;
    isEffort?: string | number;
    includingContractor?: boolean;
}

export interface ITabEmployeeSummary {
    genderId: string;
    genderName: string;
    totalEmployee: number;
}

export interface IEmployeeBySomething {
    employeeId: number;
    badgeId: string;
    fullName: string;
    workEmail: string;
    joinDate: string;
}

export interface IReportListForAll {
    badgeId: string;
    fullName: string;
    genderName: string;
    birthday: string;
    permanentAddress: string;
    contactAddress: string;
    universityName: string;
    graduatedYear: number;
    positionName: string;
    joinDate: string;
    workEmail: string;
    projectName: string;
    dcName: string;
    grade: number;
    billableStatus: string;
    billable: number;
    effort: number;
    totalExp: number;
    notes: string;
}

export interface IPositionSummary {
    positionId: string;
    positionName: string;
    totalEmployee: number;
}

export interface IGraduatedSummary {
    universityName: string;
    graduatedByDGDtos: IGraduatedSummaryColumn[];
}

export interface IGraduatedSummaryColumn {
    isOtherGroup: boolean;
    unitId: number;
    unitName: string;
    number: number;
    isTotalByUnit: boolean;
}

export interface ITmaSolutionsSummary {
    orgChartReportStructureId: number;
    orgChartReportTypeName: string;
    totalEmployee: number;
}

export interface IUnitSummary {
    unitId: number;
    unitName: string;
    groupName: string;
    managerId: number;
    managerName: string;
    totalEmployee: number;
    isManagementUnit: boolean;
    isNonUnit: boolean;
    childUnitSummary: IUnitSummary[];
}

export interface ISummaryProps<T> {
    dataProps: T[];
    isLoading: boolean;
    tabName?: string;
}
