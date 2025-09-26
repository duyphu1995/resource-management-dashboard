export interface ICompany {
    companyId: number;
    prefixKeyContract: string;
    companyName: string;
    companyNameEN: string;
    companyAcronym: string;
    companyAddress: string;
    companyOwner: string;
    ownerPosition: string;
    companyPhone: string;
    companyFax: string;
    companyTaxId: string;
    createdOn: string;
    lastModifiedOn: string;
    isActive: boolean;
    statusName: 'Active' | 'Inactive';
}

export interface IAdminEmailSubscription {
    emailSubscriptionId: number;
    subscriptionName: string;
    subscriptionEmail: string;
    isActive: boolean;
    createdOn: string;
}

export interface IAdminLanguageCertification {
    languageId?: number;
    languageName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminRanking {
    rankId?: number;
    rankName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminGender {
    genderId: number;
    genderName: string;
    genderColor: string;
}

export interface IAdminHealthTracking {
    certificateId?: number;
    certificateName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminMarket {
    marketplaceId?: number;
    marketplaceName?: string;
    marketplaceDescription?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminNationality {
    nationalityId?: number;
    nationalityName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminPosition {
    positionId?: number;
    positionName?: string;
    positionDescription?: string;
    grade?: string;
    minGrade: number;
    maxGrade: number;
    isDefault?: boolean;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminSalary {
    salaryRangeId: number;
    companyId: number;
    companyName: string;
    positionName: string;
    grade: string;
    salary: string;
    salaryInText: string;
    isNonTechnical: boolean;
    career: string;
    isActive: boolean;
    statusName: string;
    createdOn: string;
    lastModifiedOn: string;
    isUsed: boolean;
}

export interface IAdminTerminationReason {
    reasonId?: number;
    reasonName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminEntryLanguage {
    entryLanguageId?: number;
    entryLanguageName: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminCertificationName {
    certificateId?: number;
    certificateName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface IAdminCertificationType {
    certificateTypeId?: number;
    certificateTypeName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
    certificateDtos?: IAdminCertificationName[];
}

export interface IRoleList {
    roleGroupId: number;
    roleName?: string;
    createdOn?: string;
    lastModifiedOn?: string;
}

export interface ICreateRole {
    roleName: string;
    menu: string;
    subMenu: string;
    sections: ISections[];
}

export interface ICreateUserPermission {
    unit?: string;
    fullName?: string;
    employeeId: string;
    role: string;
    menu: string;
    subMenu: string;
    sections: ISections[];
}

export interface IDetailUserRole {
    roleGroupId: number;
    roleName: string;
    menus: ISections[];
}

export interface ISections {
    id: string;
    isAccess: boolean;
    fieldsForRestrictData: string[];
    fieldsForSensitiveData: string[];
    userOperations: string[];
}

export interface IUserPermissionDetail {
    employeeInfo: any;
    userPermissionData: any;
    additionalPermissionData: any;
}
export interface IUserPermission {
    badgeId: string;
    employeeId?: number;
    roleGroupId?: number;
    roleName?: string;
    lastModifiedOn?: string;
    fullName?: string;
}
