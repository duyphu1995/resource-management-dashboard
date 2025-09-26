export interface IProjectContractByType {
    accountManager: string;
    contractApprovedEffort: number;
    contractBillable: number;
    countryName: string;
    customerName: string;
    dcManager: string;
    dcName: string;
    dgManager: string;
    dgName: string;
    durationDays: number;
    effortSpend: number;
    endDate: string;
    marketplaceGroupName: string;
    projectApprovedEffort: number;
    projectCRApprovedEffort: number;
    projectContractName: string;
    projectManager: string;
    projectName: string;
    projectTypeName: string;
    reportedBillable: number;
    roi: number;
    startDate: string;
    statusName: string;
    totalBillable: number;
    totalHeadCount: number;
    totalNonBillableRatio: number;
    totalProjectApprovedEffort: number;
}

export interface IProjects {
    approvedEffort: number;
    contractBillable: number;
    countryName: string;
    customerName: string;
    dcName: string;
    dgName: string;
    effortSpend: number;
    endDate: string;
    marketplaceGroupName: string;
    projectContractName: string;
    projectManager: string;
    projectName: string;
    projectTypeName: string;
    reportedBillable: number;
    startDate: string;
    status: string;
    technology: string;
    totalBillable: number;
    totalHeadcount: number;
}

export interface IContractManagement {
    accountManager: string;
    accountManagerId: number;
    approvedEffort: number;
    contractBillable: number;
    contractId: string;
    contractStatusId: number;
    contractStatusName: string;
    countryId: number;
    countryName: string;
    customerName: string;
    dcId: number;
    dcManager: string;
    dcManagerId: number;
    dcName: string;
    dgId: number;
    dgManager: string;
    dgManagerId: number;
    dgName: string;
    effectiveDate: string;
    endDate: string;
    marketplaceGroupId: number;
    marketplaceGroupName: string;
    projectTypeId: number;
    projectTypeName: string;
    renewalDate: string;
    startDate: string;
    totalProjectInContract: number;
    projectContractInfoId: number;
    projectContractId: number;
}

export interface IContractModalTable {
    endDate: string;
    projectId: number;
    projectManager: string;
    projectName: string;
    projectPrime: string;
    startDate: string;
    status: string;
}

export interface IDialogShowMore<T> extends ModalProps {
    open: boolean;
    onClose: () => void;
    data: T[];
    onReset: () => void;
    onSave: (value: T[]) => void;
}

export interface IReportFilterProps {
    pageTitle: ReactNode;
    loading: boolean;
    moreButtons?: ButtonProps[];
    data: IFilterData[];
    filterForm?: FormInstance;
    onFilter?: (value: any) => void;
    onResetFilter?: () => void;
    rootClassName?: string;
    hiddenButtonFilter?: boolean;
    moreFilterButton?: ButtonProps | false;
    moreFilterModal?: IDialogShowMore | false;
}

export interface IProjectContractFilter<T> {
    form?: FormInstance;
    data: IFilterData[];
    value: any;
    loading: boolean;
    count?: IFilterCount;
    // searchInput: IFilterSearchInput;
    segmented?: IFilterSegmented;
    isShowFilter?: boolean;
    isHideShowHideColumnsBtn?: boolean;
    moreButtons?: (ButtonProps | IFilterImportButton | IFilterExportButton<T>)[];
    onChangeData: (data: IFilterData[]) => void;
    onFilter: (value: any) => void;
}

export interface IProjectContractReportFilterProps<T> {
    pageTitle: string;
    breadcrumb: BreadcrumbItemType[];
    buttons?: ButtonProps[];
    filter: IProjectContractFilter<T>;
    table: IListManagementTable<T>;
}

export interface IFilterDataParent {
    fpContract: IFilterDataChildren | object;
    oDCContract: IFilterDataChildren | object;
    projects: IFilterDataChildren | object;
    contractManagement: IFilterDataChildren | object;
}

export interface IFilterDataChildren {
    contractId?: string;
    dcName?: string;
    dcDirector?: string;
    accountManager?: string;
    market?: string;
    status?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    projectId?: string;
    projectType?: string;
    customerName?: string;
    technology?: string;
    startDate?: string;
    endDate?: string;
    needAction?: string;
    contractType?: string;
}

export interface IValuesProjectContract {
    projectContractName: string;
    dcId: number;
    dcManagerId: number;
    accountManagerId: number;
    projectTypeId: number;
    statusId: number;
    customerName: string;
    countryId: number;
    marketGroupId: number;
    startDate: string;
    endDate: string;
    effectiveDate: string;
    renewalDate: string;
}

export interface IValuesProjectContractModal {
    projectId: number;
    projectContractId?: number;
}

export interface IValuesProjectContract {
    projectContractInfoId?: number;
    customerName: string;
    duration: number;
    cost: number;
    contractBillable: number;
    approvedEffort: number;
    contractStatusId: number;
    dcId: number;
    projectContractId: number;
    projectContractName: string;
    dcManagerId: number;
    accountManagerId: number;
    projectTypeId: number;
    marketGroupId: number;
    countryId: number;
    startDate: string;
    endDate: string;
    effectiveDate: string;
    renewalDate: string;
    projectContractInfoId: number;
}

export interface IAddNewProjectContractField {
    label: string;
    name: string;
    component: React.ReactNode;
    isShow?: boolean;
    rules?: any;
    initialValue?: any;
}
