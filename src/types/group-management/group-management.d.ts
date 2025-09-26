import { IEmployeeUnit } from '../hr-management/employee-management';

// Org chart
export interface IOrgNode extends IUnitNameUnitId, ITableChartAction {
    organizationChartId: number;
    ordinalId: string;
    ordinalParentId: string;
    employeeId: number;
    fullName: string;
    positionName: string;
    isLeader: boolean;
    employeeImageUrl: string;
    children: IOrgNode[];
    relationship?: string;
    unitTypeLevel: number;
    groupName: string;
    notes: string;
    isActionAdd: boolean;
    isActionDelete: boolean;
    isActionEdit: boolean;
    isActionDragDrop: boolean;
}

export interface IChartContainerProps {
    dataSource: IOrgNode;
    pan?: boolean;
    zoom?: boolean;
    zoomOutLimit?: number;
    zoomInLimit?: number;
    containerClass?: string;
    chartClass?: string;
    draggable?: boolean;
    collapsible?: boolean;
    multipleSelect?: boolean;
    handleGetNode: (data: IOrgNode, type: string) => void;
    setMovedNodeChart?: (params: boolean) => void;
    movedNodeChart?: boolean;
    setDataChartAfterChange?: any;
}

export interface IChartNodeProps extends IChartContainerProps {
    dataSource: IOrgNode;
    changeHierarchy?: (draggedItemData: any, dropTargetId: string) => void;
    handleGetNode: (data: IOrgNode, type: string) => void;
    movedNodeChart?: boolean;
    userPermissions?: string[];
}

export interface TreeNode extends IUpdateOrgChart {
    unitId: number;
    children: TreeNode[];
}

export interface FlatNode extends IUpdateOrgChart {
    unitId: number;
    ordinalId?: string;
}

export interface IUpdateOrgChart {
    employeeId: number;
    organizationChartId: number;
    ordinalParentId: string;
    isLeader: boolean;
    notes: string;
}

export interface IOrgChartProps {
    onChangeTab?: (key: string) => void;
    allOptions: IUnitIndex;
    setIsReload: (params: boolean) => void;
}

// Interface tab data
export interface ITableChart extends ITotalTabData {
    key: number;
    unitName: string;
    fullName: string;
}

export interface ITotalTabData {
    totalCoreMember: number;
    totalHeadCount: number;
    totalEffort: number;
    totalBillable: number;
    totalNonBillable: number;
    totalNonBillableRatio: number;
    staffGradeIndex: number;
    totalRedeploy: number;
}

export interface ITableChartAction extends IEmployeeUnits, IEmployeeEditEffort {
    key: number;
    badgeId: string;
    employeeId: number;
    employeeImageUrl: string;
    genderName: string;
    grade: number;
    isMainProject: boolean;
    isManager: boolean;
    positionName: string;
    dcName: string;
    statusColor: string;
    username: string;
    workPhone: string;
    workEmail: string;
    locationName: string;
    joinDate: string;
    managerName: string;
    isLeader: boolean;
    isTransferring: boolean;
}

export interface IEmployeeUnits {
    employeeUnitId: number;
    isCoreMember: boolean;
    billable: number;
    isRedeployable: boolean;
    groupName: string;
    notes: string;
    fullName?: string;
}

export interface IEmployeeEditEffort extends IFormattedUnitIdAndEffort {
    key: number;
    projectName: string;
    fullName?: string;
    isMainProject?: boolean;
}

export interface IFormattedUnitIdAndEffort {
    effort: number;
    unitId: string | number;
    employeeUnitId: number | undefined;
}

// Structure chart
export interface IUnit extends IManagerBy {
    managedBy: number;
    startDate: string | undefined;
    endDate: string | undefined;
}

export interface IManagerBy extends IParentId {
    projectTypeId: number;
    marketplaceId: number;
    projectContractId: number;
    projectPrime: number;
    description: string;
    technologies: string;
    isSharedService: boolean;
    startDate: string;
    endDate: string;
}

export interface IStructureNode extends DataNode, IParentId {
    key: string;
    isSmallest: boolean;
    isManaged: boolean;
    unitTypeId: number;
    children?: IStructureNode[];
}

export interface IParentId extends IUnitNameUnitId {
    parentId: number;
}

export interface IUnitNameUnitId {
    unitId: number;
    unitName: string;
}

export interface IUnitSharedService {
    unitId: number;
    totalSharedServiceNumber: number;
    unitName: string;
}

export interface IUnitNode extends IManagerBy, ITotalTabData {
    unitTypeLevel: number;
    employeeUnits: IEmployeeUnits[];
    parentName: string;
    isBirthdayGreeting: boolean;
    unitTypeName: string;
    managerName: string;
    managerId: number;
    projectContractName: string;
    projectTypeName: string;
    marketplaceName: string;
    projectPrimeName: string;
    projectDomainName: string;
    projectDomainId: number;
    totalRedeployablePercent: number;
    totalCoreMemberPercent: number;
    productFactorValue: number;
    totalNonBillableRatioStar?: number;
    totalMainWorkingMember: number;
    year: number;
    week: number;
    lastUpdateReport: string;
    unitSharedServices: [
        {
            unitId: number;
            totalSharedServiceNumber: number;
            unitName: string;
        }
    ];
    approveEffort: number;
    projectScope: string;
    isGroupByPATool?: boolean;
}

export interface IUnitInformation extends IManagerBy {
    unitId: number;
    unitName: string;
    parentId: number;
    parentName: string;
    unitTypeId: number;
    unitTypeName: string;
    unitTypeLevel: number;
    projectTypeName: string;
    projectDomainId: number;
    projectDomainName: string;
    isBirthdayGreeting: boolean;
    isGroupByPATool?: boolean;
    projectContractName: string;
    managerId: number;
    managerName: string;
    marketplaceName: string;
    projectPrimeName: string;
    projectScope: string;
    approveEffort: string;
}

export interface IUnitReportData {
    year: number;
    week: number;
    lastUpdateReport: string;
    productFactorValue: number;
    totalHeadCount: number;
    totalEffort: number;
    totalRedeploy: number;
    staffGradeIndex: number;
    totalMember: number;
    totalCoreMember: number;
    totalCoreMemberPercent: number;
    totalRedeployablePercent: number;
    totalBillable: number;
    totalNonBillable: number;
    totalNonBillableRatio: number;
    totalNonBillableRatioStar: number;
}

export interface IUnitData {
    employeeUnits: IEmployeeUnits[];
    lastWeek: IUnitReportData;
    currentWeek: IUnitReportData;
    unitSharedServices: IUnitSharedService[];
}

export interface IUnitIndex {
    managers: { employeeId: number; fullName: string }[];
    marketplaceBasicDtos: { marketplaceId: number; marketplaceName: string }[];
    projectContractBasicDtos: { projectContractId: number; projectContractName: string }[];
    projectTypeBasicDtos: { projectTypeId: number; projectTypeName: string }[];
    unitBasicDtos: IEmployeeUnit[];
    unitTypeBasicDtos: { unitTypeId: number; unitTypeName: string; unitTypeLevel: string }[];
    projectDomainBasicDtos: { projectDomainId: number; projectDomainName: string }[];
}

export interface IExportReportGroup {
    unitId?: string;
    isEffort: boolean | undefined;
    filterBy?: string;
    excludeContractor?: boolean;
}
