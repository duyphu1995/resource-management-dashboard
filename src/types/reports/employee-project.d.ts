export interface IEmployeeProjectInformation {
    badgeId: string,
    fullName: string,
    email: string,
    joinDate: string,
    location: string,
    position: string,
    grade: number,
    workingStatus: string,
    project: string,
    dcGroup: string,
    dg: string,
    projectManager: string,
    isContractor: boolean,
    statusColor: string,
}

export interface IEmployeeProjectionResponse {
    items: IEmployeeProjectInformation[],
    totalEmployee: number,
    totalContractor: number,
}