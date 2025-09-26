export interface IContactSearchProject {
    projectId: number;
    projectName: string;
    projectManagerName: string;
    projectManagerEmail: string;
    programId: number;
    programName: string;
    programManagerName: string;
    programManagerEmail: string;
    dcId: number;
    dcName: string;
    dcManagerName: string;
    dcManagerEmail: string;
    dgId: number;
    dgName: string;
    dgManagerName: string;
    dgManagerEmail: string;
    isMainProject: boolean;
}

export interface IContactSearchManagedUnit {
    managerEmail: string;
    managerName: string;
    parentId: number;
    unitId: number;
    unitName: string;
    unitTypeName: string;
}

export interface IContactSearchDetail {
    fullName: string;
    badgeId: string;
    employeeImageUrl: string;
    genderName: string;
    workEmail: string;
    mobilePhone: string;
    workPhone: string;
    buildingName: string;
    projectDtos: IEmployeeSearchProject[];
    managerUnitDtos: IEmployeeSearchManagedUnit[];
}

export interface IContactSearchResumeProject {
    dcName: string;
    dgName: string;
    effort: number;
    employeeProjectStatus: string;
    employeeUnitId: number;
    isMainProject: boolean;
    managerName: string;
    positionName: string;
    projectId: number;
    projectName: string;
    startDate: string;
    endDate: string;
}

export interface IContactSearchResumeEducation {
    degree: string;
    educationId: number;
    employeeId: number;
    fromYear: number;
    majorField: string;
    toYear: number;
    universityName: string;
    rankName: string;
}

export interface IContactSearchResumeTrainingCourse {
    courseName: string;
    employeeId: number;
    locationName: string;
    organizedBy: string;
    trainingCourseId: number;
    year: number;
}

export interface IContactSearchResumeWorkExperience {
    company: string;
    duties: string;
    employmentId: number;
    fromDate: string;
    isContractor: true;
    position: string;
    project: string;
    projectDescription: string;
    statusColor: string;
    statusId: number;
    statusName: string;
    toDate: string;
}
