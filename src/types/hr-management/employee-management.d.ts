import { ICheckbox, IInfoAttachment } from '../common';
import { ICommitments } from './onsite-management';

export interface IEmployee {
    employeeId: number;
    employeeNumber: number;
    fullName: string;
    resignationStatusName: string;
    companyId: number | string;
    companyName: string;
    dgId: number;
    dgName: string;
    dcId: number;
    dcName: string;
    projectId: number;
    projectName: string;
    employeeContactUnitDtos: IEmployeeContactUnitDtos[];
    isOfficialEmployee: boolean;

    documents: IDocument[];
    educations: IEducation[];
    healthTrackings: IHealthTracking[];
    comments: IComment[];
    hrComments: IHrComment[];
    contracts: IContract[];
    communications: ILanguageSkills[];
    commitments: ICommitments[];
    commitment: IInfoAttachment;
    onsiteHistories: IOnsiteHistory[];
    projects: IProject[];
    trainingCourses: ITrainingCourses[];
    certificates: ICertificates[];
    dataNote: ICheckbox[];
    dataCheckDocuments: any[];
    temporaryLeaves: any[];
    employments: IWorkingExperienceBeforeTMA[];
    paHistories: any[];
    promotionInfos: IPromotion[];
    achievements: IAchievement[];
    paForeignLanguages: IPaForeignLanguage[];

    //Left content
    badgeId: string;
    positionName: string;
    positionId: number;
    statusName: string;
    joinDate: string;
    isKRD: boolean;
    isLowPerformance: boolean;
    isGroupByPATool: boolean;
    isBlacklisted: boolean;
    isGraduated: boolean;
    isPublic: boolean;
    username: string;
    workEmail: string;
    workPhone: string;
    workPlace: string;
    grade: number;
    contractTypeName: string;
    locationName: string;
    effort: string;
    managerName: string;

    //Right content
    genderName: string;
    genderId: string;
    birthPlace: string;
    idCardNo: string;
    idCardIssuePlace: string;
    idCardIssueDate: string;
    passportNo: string;
    probationScore: number;
    probationRetestScore: number;
    socialBookNo: string;
    isDegree: boolean;
    isTranscript: boolean;
    isReceivedIdCard: boolean;
    isHouseholdRegistration: boolean;
    isReceivedCV: boolean;
    maritalStatusName: string;
    maritalStatusId: string;
    birthday: string;
    birthdayFormat: string;
    statusColor: string;
    employeeImageUrl: string;
    passportExpiryDate: string;
    passportIssueDate: string;
    comment: string;
    normalUserComments: INormalUserComment[];
    permanentAddress: string;
    personalEmail: string;
    mobilePhone: string;
    nationalityName: string;
    nationalityId: string;
    emergencyPhone: string;
    contactAddress: string;
    homePhone: string;
    hrPositionName: string;
    entryLanguageName: string;
    entryLanguageScore: number;
    hrPositionId: string;
    entryLanguage: string;
    totalWorkExp: number;
    beforeWorkExp: number;
    currentWorkExp: number;
    buildingName: string;
    floorName: string;
    roomName: string;
    firstName: string;
    lastName: string;
    isNonTechnical: boolean;
    career: string;
    currentProject: string;
    isFavorite: boolean;
    lastModifiedOn: string;
    managerWorkEmail: string;
    expiryDate: string;
    issueDate: string;
    certificateCatName: string;
    certificateName: string;
    attachmentUrl: string;
    resignationInformation?: {
        employeeId: number;
        resignationFormId: number;
        statusColor: string;
        statusId: string;
        statusName: string;
    };
}

export interface IEmployeeContactUnitDtos {
    employeeId: number;
    projectId?: number;
    projectName?: string;
    programId?: number;
    programName?: string;
    dcId?: number;
    dcName?: string;
    dgId?: number;
    dgName?: string;
    buId?: number;
    buName?: string;
    [key: string]: number | string | undefined;
}

interface IEmployeeUnit {
    children?: IEmployeeUnit[];
    unitId: string;
    unitName: string;
    isSmallest: boolean;
    parentId: number;
    totalMainWorkingMember: number;
    unitTypeId: number;
    unitTypeName: string;
    unitTypeLevel: string;
}

export interface IEmployeeIndexes {
    companies: { companyId: string; companyName: string }[];
    units: IEmployeeUnit[];
    positions: { positionId: string; positionName: string }[];
    grades: string[];
    resignationStatuses: { statusId: string; statusName: string }[];
    hrPositionId: { positionId: string; positionName: string }[];
    genders: { genderId: string; genderName: string }[];
    maritalStatuses: { maritalStatusId: string; maritalStatusName: string }[];
    nationalities: { nationalityId: string; nationalityName: string; isActive: false }[];
    statuses: { statusId: string; statusName: string }[];
    educationNames: string[];
    locationNames: string[];
    mainProjects: { projectId: string; projectName: string }[];
}

export interface IEmployeeExport {
    employeeIds: string[];
}

export interface INormalUserComment {
    commentId: number;
    commentTypeDescription: string;
    commentTypeId: number;
    contents: string;
    employeeId: number;
    providerBadgeId: string;
    providerId: number;
    providerName: string;
    time: string;
    providerImageUrl: string;
}

export interface IDocument {
    documentTypeId: number;
    documentTypeName: string;
    employeeDocumentId: number;
    employeeId: number;
    isCompleted: boolean;
    receivedDate: string;
    requestDate: string;
}

export interface IEducation {
    educationId: number;
    employeeId: number;
    fromYear: number;
    rankId: number;
    rankName: string;
    toYear: number;
    universityName: string;
}

export interface IComment {
    commentId: number;
    commentTypeDescription: string;
    commentTypeId: number;
    contents: string;
    employeeId: number;
    providerId: number;
}

export interface IHrComment {
    commentId: number;
    commentTypeDescription: string;
    commentTypeId: number;
    contents: string;
    employeeId: number;
    providerId: number;
    providerName: string;
    providerBadgeId: string;
    time: string;
    providerImageUrl: string;
}

export interface ICreateComment {
    employeeId?: number;
    providerId?: number;
    contents?: string;
    commentTypeId?: number;
    commentId?: number;
}

export interface ILanguageSkills {
    communicationId: number;
    employeeId: number;
    languageId: number;
    languageName: string;
    rankId: number;
    rankName: string;
}

export interface IOnsiteHistory {
    actualEndDate: string;
    cityName: string;
    countryName: string;
    employeeId: number;
    expectedEndDate: string;
    flightDeparture: string;
    flightReturn: string;
    onsiteCountryId: number;
    onsiteFormId: number;
    projectName: string;
}

export interface IProject {
    projectId: number;
    unitId: number;
    employeeUnitId: number;
    effort: number;
    employeeProjectStatus: string;
    groupName: string;
    startDate: string;
    positionName: string;
    projectName: string;
    endDate: string;
    positionName: string;
    isMainProject: boolean;
}

export interface ITrainingCourses {
    year: number;
    courseName: string;
    locationName: string;
    organizedBy: string;
    trainingCourseId: number;
    certificate: string;
    employeeId: number;
    fromDate: string;
    toDate: string;
}

export interface ICertificates extends IInfoAttachment {
    certificateName: string;
    certificateId: number;
    certificateTypeName: string;
    certificateTypeId: number;
    employeeCertificateId: number;
    employeeId: number;
    expiryDate: string;
    issueDate: string;
    file: any | null;
}

export interface IEditWorkInformationProps {
    isShow: boolean;
    onCancel: () => void;
    data: IData | undefined;
    isReload: (value: object) => void;
    editedFields?: string[];
    isLimit?: boolean;
    moduleName?: string;
}

export interface IEditWorkInformation {
    employeeId?: number;
    badgeId: string;
    workEmail: string;
    positionId: number;
    grade: number;
    workPhone: string;
    joinDate: string;
    buildingName: string;
    floorName: string;
    roomName: string;
    isKRD: boolean;
    isGraduated: boolean;
    isLowPerformance: boolean;
    isBlacklisted: boolean;
}

export interface ISelect {
    minGrade?: number;
    maxGrade?: number;
    id?: string;
    label?: number | string;
    value?: number | string;
}

export interface IEntryLanguage {
    entryLanguageName: string;
}

export interface IEditInformationProps {
    isShow: boolean;
    onCancel: () => void;
    data: IData | undefined;
    reloadAPIEmployee?: (params: object) => void;
    editedFields?: string[];
    isLimit: boolean;
    moduleName?: string;
}

export interface IEditInformationForm {
    lastName: string;
    firstName: string;
    genderId: number;
    birthday: Date;
    maritalStatusId: number;
    birthPlace: string;
    personalEmail: string;
    mobilePhone: string;
    homePhone: string;
    nationalityId: number;
    isDegree: boolean;
    isReceivedIdCard: boolean;
    isReceivedCV: boolean;
    isTranscript: boolean;
    isHouseholdRegistration: boolean;
}

// Updated history
export interface IUpdatedHistory {
    byPeople: string;
    employeeId: number;
    fieldName: string;
    from: string;
    time: string;
    to: string;
}

// Add new employee
export interface IAddNewEmployeeForm {
    firstName: string;
    lastName: string;
    birthday: string;
    genderId: number;
    martialStatusId: number;
    nationalityId: number;
    contactAddress: string;
    mobilePhone: string;
    badgeId: string;
    workEmail: string;
    positionId: number;
    grade: number;
    joinDate: string;
    projectId: number;
    experienceBefore: number;
    personalEmail: string;
    homePhone: string;
    isDegree: boolean;
}

export interface ICreateEmployee {
    badgeId: string;
    firstName: string;
    lastName: string;
    contactAddress: string;
    workEmail: string;
    personalEmail: string;
    mobilePhone: string;
    homePhone: string;
    birthday: string;
    joinDate: string;
    experienceBefore: number;
    martialStatusId: number;
    isDegree: boolean;
    positionId: number;
    grade: number;
    nationalityId: number;
    genderId: number;
    projectId: number;
}

export interface IMaritalStatus {
    maritalStatusId: number;
    maritalStatusName: string;
}

export interface IEducation {
    degree: string;
    fromYear: number;
    majorField: string;
    rankId: number;
    toYear: number;
    universityName: string;
    educationId?: number;
    employeeId?: number;
}

export interface IHealthTracking extends IInfoAttachment {
    employeeId: number;
    certificateId: number;
    issueDate: string;
    file: any | null;
    notes: string;
    employeeCertificateId?: number;
    certificateType?: string;
    certificateName: string;
    submitDate?: string;
}

// Interface for employment
export interface IWorkingExperienceBeforeTMA extends IInfoAttachment {
    company: string;
    employeeId: number;
    statusId: number;
    statusName: string;
    project: string;
    position: string;
    duties: string;
    projectDescription: string;
    file: any | null;
    fromDate: string;
    toDate: string;
    isContractor: boolean;
    employmentId?: number;
}

export interface IPromotion {
    employeeId: number;
    oldPositionName: string;
    newPositionName: string;
    effectedDate: string;
    approvedDate: string;
    statusId: number;
    notes: string;
    promotionInfoId?: number;
}

export interface IAchievement {
    employeeId: number;
    achievementName: string;
    receivedDate: string;
    approvedDate: string;
    notes: string;
    statusId: number;
    statusName?: string;
    achievementId?: number;
}

export interface IPaForeignLanguage {
    year: number;
    employeeNumber: number;
    listeningScore1: number;
    readingScore1: number;
    correctListeningScore1: number;
    correctReadingScore1: number;
    listeningScore2: number;
    readingScore2: number;
    correctListeningScore2: number;
    correctReadingScore2: number;
    languageTest: string;
    score: string;
    paMark: string;
    certificateType: string;
    certificateExpiredDate: string;
}

export interface ICompany {
    companyId: string;
    companyName: string;
}
